// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/OwnableAdmin.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOCommitteeStore is OwnableAdmin {
    using SafeMath for uint256;
    address public ton;
    address public daoElection;
    address public daoVault;
    address public activityFeeManager;
    address public agendaManager;
    
    uint256 public maxCommittees;
    
    Member[] public members;
    address[] public committees;

    mapping(address => uint256) public memberId;
    mapping(address => uint256) public committeeId;
    
    struct Member {
        address layer2;
        address operator;
        string name;
        uint memberSince;
        uint256 castingcount;
        uint256 l2balance;
        uint committeeJoinTime;
        uint getBlanceTime;
    }
    
    constructor(address _ton) {
        ton = _ton;
        maxCommittees = 3;
        if (members.length==0)
            members.push(Member(address(0), address(0), "", block.timestamp, 0, 0, 0, 0));
        if (committees.length==0)
            committees.push(address(0));
    }
    
    function setMaxCommittees(uint256 _maxCommittees) onlyOwner public {
        maxCommittees = _maxCommittees;
        initCommitteeSlot();
    }
    
    function setDaoElection(address _daoElection) onlyOwner public {
        require(_daoElection != address(0), "DAOCommitteeStore: election address is zero");
        daoElection = _daoElection;
    }

    function setAgendaManager(address _agendaManager) onlyOwner public {
        require(_agendaManager != address(0), "DAOCommitteeStore: AgendaManager address is zero");
        agendaManager = _agendaManager;
    }
     
    function setDaoVault(address _daoVault) onlyOwner public {
        require(_daoVault != address(0), "DAOCommitteeStore: vault is zero");
        daoVault = _daoVault;
    }
    
    function setActivityFeeManager(address _man) onlyOwner public {
        require(_man != address(0), "DAOCommitteeStore: ActivityFeeManager address is zero");
        activityFeeManager = _man;
    }
    
    //=====
    
    function castVote(address voter) onlyOwner public {
        // add castingcount of member , for statistics
        uint256 _memberId = memberId[voter];
        members[_memberId].castingcount = members[_memberId].castingcount.add(1);
    }
     
    function initCommitteeSlot() public {
        if (committees.length < (maxCommittees+1)) {
            uint256 len = committees.length;
            for (uint256 i = len; i < (maxCommittees+1); i++) {
                  // Committee memory comm = Committee(0, 0, 0, 0);
                  // committeeSlots.push(comm);
                  committees.push(address(0));
            }
        }
    }

    function popCommitteeSlot() public onlyOwner {
        if (committees.length > 0) {
            uint256 _idx = committees.length - 1;
            address _addr = committees[_idx];
            committeeId[_addr] = 0;
            committees.pop();
        }
    }
    
    function totalCommittees() public view returns (uint256) { return committees.length - 1; }
    function lengthCommitteeSlotIndex() public view returns (uint256) { return committees.length; }
    function getCommittees() public view returns (address[] memory) { return committees; }
    
    function detailedCommittee(uint256 _indexSlot)
        public
        view
        returns (
            address layer2,
            address operator,
            string memory name,
            uint memberSince,
            uint256 castingcount,
            uint256 balance,
            uint joinTime,
            uint balanceTime
        )
    {
        require(_indexSlot > 0 && _indexSlot < committees.length, "DAOCommitteeStore: invalid slot");
        address _operator = committees[_indexSlot];
        uint256 memIndex = memberId[_operator];
        
        if (memIndex > 0 && memIndex < members.length) {
            Member storage mem = members[memIndex];
            return (mem.layer2, mem.operator, mem.name, mem.memberSince, mem.castingcount, mem.l2balance, mem.committeeJoinTime, mem.getBlanceTime);
        } else {
            return (address(0), address(0), "", 0, 0, 0, 0, 0);
        }
    }
    
    function isCommittee(address _operator) public view returns (bool _iscommittee, uint256 _committeeIndex) {
        if (_operator != address(0) && memberId[_operator] != 0 && committeeId[_operator] !=0)
            return (true, committeeId[_operator]);
        else
            return (false, 0);
    }
    
    function existsMember(address _operator) public view returns (bool) {
        if (_operator != address(0) && memberId[_operator] != 0)
            return true;
        else
            return false;
    }
    
    function retireCommittee(address _operator) onlyOwner public returns (bool) {
        uint256 commIndex = committeeId[_operator];
        if (commIndex > 0) {
            committees[commIndex] = address(0);
            committeeId[_operator] = 0;
            return true;
        } else {
            return false;
        }
    }
    
    function changeCommittee(uint256 _indexSlot, uint256 _indexMember, address _newOperator, uint256 _balance) onlyOwner public returns (bool result) {
        require(_indexSlot > 0 && _indexSlot < committees.length, "DAOCommitteeStore: slot is not available");
        require(_indexMember > 0 && _indexMember < members.length, "DAOCommitteeStore: memberIndex is not available");
        
        address _preOperator = committees[_indexSlot];
        committeeId[_preOperator] = 0;
        
        committees[_indexSlot] = _newOperator;
        committeeId[_newOperator] = _indexSlot;
        
        Member storage curmember = members[_indexMember];
        require(curmember.operator == _newOperator, "DAOCommitteeStore: same operator");
        
        curmember.l2balance = _balance;
        curmember.committeeJoinTime = block.timestamp;
        curmember.getBlanceTime = block.timestamp;
        
        return true;
    }
    
    function addMember(address _layer2, address _operator, string memory name) onlyOwner public returns (uint256 memberindex) {
        if (existsMember(_operator)) {
            return memberId[_operator];
        } else {
            if (members.length == 0)
                members.push(Member(address(0), address(0), "", block.timestamp, 0, 0, 0, 0));
            
            members.push(Member(_layer2, _operator, name, block.timestamp, 0, 0, 0, 0));
            uint256 _index = members.length;
            memberId[_operator] = _index;
            
            return _index;
        }
    }
    
    function detailedMember(address user)
        public
        view
        returns (
            uint256 _committeeId,
            address layer2,
            address operaor,
            string memory name,
            uint memberSince,
            uint256 castingcount
        )
    {
        uint256 mindex = memberId[user];
        if (mindex > 0 && mindex < members.length) {
            require(user == members[mindex].operator, "DAOCommitteeStore: the user is operator");
            return (committeeId[user], members[mindex].layer2, members[mindex].operator, members[mindex].name, members[mindex].memberSince, members[mindex].castingcount);
        } else {
            return (0, address(0),address(0), "", 0, 0);
        }
    }
    
    function getMemberid(address user) public view returns (uint256) { return memberId[user]; }
    function getTON() public view returns (address) { return ton; }
    function getDaoElection() public view returns (address) { return daoElection; }
    function getActivityFeeManager() public view returns (address) { return activityFeeManager; }
    function getDaoVault() public view returns (address) { return daoVault; }
    function getAganedManager() public view returns (address) { return agendaManager; }
}
