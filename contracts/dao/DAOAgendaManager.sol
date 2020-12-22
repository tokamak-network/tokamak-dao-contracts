// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/OwnableAdmin.sol";

import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { DAOAgendaManagerRole } from "../roles/DAOAgendaManagerRole.sol";
import { LibAgenda } from "../lib/Agenda.sol";

contract DAOAgendaManager is OwnableAdmin, DAOAgendaManagerRole {
    using SafeMath for uint256;
    using LibAgenda for *;

    address public ton;
    address public activityFeeManager;
    
    uint256 public numAgendas;
    uint256 public numExecAgendas;
    
    uint256 public createAgendaFees; // 아젠다생성비용
    
    uint256 public minimunNoticePeriodMin;
    uint256 public minimunVotingPeriodMin;
    
    LibAgenda.Agenda[] public agendas;
    mapping(uint256 => mapping(address => LibAgenda.Voter)) voterInfo;
    
    Ratio public quorum;
    
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    }
    
    enum VoteChoice { ABSTAIN, YES, NO }
    
    constructor(address _ton) {
        minimunNoticePeriodMin = 60*24*15; //  15 days , with minutes
        minimunVotingPeriodMin = 60*24*2; //  2 days , with minutes
        
        createAgendaFees = 0;
        quorum = Ratio(1, 2);
        ton = _ton;
        numAgendas = 0;
    }

    function getStatus(uint _status) public pure returns (LibAgenda.AgendaStatus emnustatus) {
        if (_status == uint(LibAgenda.AgendaStatus.NOTICE))
            return LibAgenda.AgendaStatus.NOTICE;
        else if (_status == uint(LibAgenda.AgendaStatus.VOTING))
            return LibAgenda.AgendaStatus.VOTING;
        else if (_status == uint(LibAgenda.AgendaStatus.EXEC))
            return LibAgenda.AgendaStatus.EXEC;
        else if (_status == uint(LibAgenda.AgendaStatus.ENDED))
            return LibAgenda.AgendaStatus.ENDED;
        else if (_status == uint(LibAgenda.AgendaStatus.PENDING))
            return LibAgenda.AgendaStatus.PENDING;
        else if (_status == uint(LibAgenda.AgendaStatus.RISK))
            return LibAgenda.AgendaStatus.RISK;
        else
            return LibAgenda.AgendaStatus.NONE;
    }

    function setStatus(uint256 _AgendaID, uint _status) onlyOwner public {
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Proposal Id");
        agendas[_AgendaID].status = getStatus(_status);
    }

    function setCreateAgendaFees(uint256 _createAgendaFees) onlyOwner public {
        createAgendaFees = _createAgendaFees;
    }

    function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriodMin) onlyOwner public {
        minimunNoticePeriodMin = _minimunNoticePeriodMin;
    }

    function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriodMin) onlyOwner public {
        minimunVotingPeriodMin = _minimunVotingPeriodMin;
    }
      
    function setActivityFeeManager(address _man) onlyOwner public {
        require(_man != address(0), "DAOAgendaManager: ActivityFeeManager is zero");
        activityFeeManager = _man;
    }

    function setQuorum(uint256 quorumNumerator, uint256 quorumDenominator) onlyOwner public {
        require(quorumNumerator > 0 && quorumDenominator > 0 && quorumNumerator < quorumDenominator, "DAOAgendaManager: invalid quorum");
        quorum = Ratio(quorumNumerator,quorumDenominator);
    }
    
    function userHasVoted(uint256 _AgendaID, address _user) public view returns (bool) {
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Proposal Id");
        return voterInfo[_AgendaID][_user].hasVoted;
    }
    
    function getAgendaNoticeEndTimeSeconds(uint256 _AgendaID) public view returns (uint) {
        // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Agenda Id");
        return agendas[_AgendaID].times[1];
    }
    
    function getAgendaVotingStartTimeSeconds(uint256 _AgendaID) public view returns (uint) {
         // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Agenda Id");
        return agendas[_AgendaID].times[2];
    }

    function getAgendaVotingEndTimeSeconds(uint256 _AgendaID) public view returns (uint) {
         // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Agenda Id");
        return agendas[_AgendaID].times[3];
    }
    
    function detailedAgenda(uint256 _AgendaID)
        public
        view
        returns (
            address[2] memory creator,
            uint[8] memory datas,
            uint256[3] memory counting,
            uint256 fees,
            bool executed,
            bytes memory functionBytecode,
            string memory description,
            address[] memory voters
        )
    {
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Agenda Id");
        LibAgenda.Agenda storage agenda = agendas[_AgendaID];
        uint[8] memory args1 = [
            uint(agenda.status),
            uint(agenda.result),
            uint(agenda.group),
            agenda.times[0],
            agenda.times[1],
            agenda.times[2],
            agenda.times[3],
            agenda.times[4]
        ];
        
        return (
            [agenda.creator, agenda.target],
            args1,
            agenda.counting,
            agenda.fees,
            agenda.executed,
            agenda.functionBytecode,
            agenda.description,
            agenda.voters
        );
    }

    function detailedAgendaVoteInfo(uint256 _AgendaID, address voter)
        public
        view
        returns (
            bool hasVoted,
            uint256 vote,
            string memory comment
        )
    {
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid Agenda Id");

        if (voterInfo[_AgendaID][voter].hasVoted) {
            return (voterInfo[_AgendaID][voter].hasVoted, voterInfo[_AgendaID][voter].vote, voterInfo[_AgendaID][voter].comment);
        } else {
            return (false, 0, '');
        }
    }
    
    function getAgendaStatus(uint256 _AgendaID) public view returns (bool exist, uint status) {
        if (_AgendaID < agendas.length)
            return (true, uint(agendas[_AgendaID].status));
        else
            return (false, 0);
    }

    function totalAgendas() public view returns (uint256) {
        return agendas.length;
    }

    function getNumExecAgendas() public view returns (uint256) {
        return numExecAgendas;
    }
    
    function getCreateAgendaFees() public view returns (uint256) { return createAgendaFees; }
    function getMinimunNoticePeriodMin() public view returns (uint256) { return minimunNoticePeriodMin; }
    function getMinimunVotingPeriodMin() public view returns (uint256) { return minimunVotingPeriodMin; }
     
    function getActivityFeeManager() public view returns (address) { return activityFeeManager; }
    function getAgendaResult(uint256 _AgendaID) public view returns (uint result, bool executed, address target, bytes memory functionBytecode) {
        require(_AgendaID < numAgendas, "DAOAgendaManager: Not a valid _AgendaID Id");
        return (uint(agendas[_AgendaID].result), agendas[_AgendaID].executed, agendas[_AgendaID].target, agendas[_AgendaID].functionBytecode);
    }
   
    function newAgenda(
        uint _group,
        address _target,
        address _creator,
        uint _noticePeriodMin,
        bytes memory _functionBytecode,
        string memory _description,
        uint256 _fees
    )
        onlyOwner
        public
        returns (
            uint256 agendaID,
            uint status,
            uint result,
            uint[5] memory times
        )
    {
        require(_noticePeriodMin >= minimunNoticePeriodMin, "DAOAgendaManager: minimunNoticePeriod is short");
         
        LibAgenda.Agenda memory p;
        p.creator = _creator;
        p.status = LibAgenda.AgendaStatus.NOTICE;
        p.result = LibAgenda.AgendaResult.UNDEFINED;
        p.executed = false;
        //times   0: creationDate  1: notice-endTime  2: voting-start 3: voting-end 4: execTime
        p.times[0] = block.timestamp;
        p.times[1] = block.timestamp + 60 * _noticePeriodMin * 1 seconds;
        p.times[2] = 0;
        p.times[3] = 0;
        p.times[4] = 0;
        p.functionBytecode = _functionBytecode;
        p.description = _description;
        p.group = _group;
        p.target = _target;
        p.fees = _fees;
        //p.proposalHash = keccak256(abi.encodePacked(functionBytecode, p.target));
        
        agendas.push(p);

        numAgendas = agendas.length;
        agendaID = numAgendas.sub(1);
        return (agendaID, uint(p.status), uint(p.result), p.times);
    }
    
    function electCommiitteeForAgenda(uint256 _AgendaID, address[] memory committees)
         public
         onlyOwner
         returns (
             bool result,
             uint status,
             uint[5] memory times
         )
     {
        require(_AgendaID < agendas.length && agendas[_AgendaID].status == LibAgenda.AgendaStatus.NOTICE, "DAOAgendaManager: agenda has expired.");
        LibAgenda.Agenda storage curagenda = agendas[_AgendaID];
        
        for (uint256 i = 1; i < committees.length; i++) {
            address _addr = committees[i];
            curagenda.committees.push(_addr);
        }

        curagenda.times[2] = block.timestamp;
        curagenda.times[3] = block.timestamp + 60 * minimunVotingPeriodMin * 1 seconds;
        curagenda.status = LibAgenda.AgendaStatus.VOTING;
        return (true, uint(curagenda.status), times);
    }
    
    function validCommitteeForAgenda(uint256 _AgendaID, address user) public view returns (bool) {
        require(user != address(0), "DAOAgendaManager: user address is zero");
        LibAgenda.Agenda storage curagenda = agendas[_AgendaID];
        for (uint256 i = 0; i < curagenda.committees.length; i++) {
             if (user == curagenda.committees[i])
                 return true;
        }

        return false;
    }
    
    function castVote(
        uint256 _AgendaID,
        address voter,address _layer,
        uint _vote,
        string memory _comment,
        uint256 _majority
    )
        public
        onlyOwner
        returns (
            uint256[3] memory counting,
            uint result
        )
    {
        require(_AgendaID < agendas.length &&
            agendas[_AgendaID].status == LibAgenda.AgendaStatus.VOTING,
            "DAOAgendaManager: status is not voting.");
        /*
        require(agendas[_AgendaID].times[2] >= block.timestamp && agendas[_AgendaID].times[3] <= block.timestamp, "voting period has expired.");
        require(validCommitteeForAgenda(_AgendaID, voter), "you are not a committee member on this agenda.");
        require(!userHasVoted(_AgendaID, voter), "voter already voted on this proposal");
        */
        
        LibAgenda.Agenda storage curagenda = agendas[_AgendaID];
        
        voterInfo[_AgendaID][voter] = LibAgenda.Voter({
            hasVoted: true,
            layer2:_layer,
            vote: _vote,
            comment: _comment
        });
             
        curagenda.voters.push(voter);
        
        // counting 0:abstainVotes 1:yesVotes 2:noVotes
        if (_vote == uint(VoteChoice.ABSTAIN))
            curagenda.counting[0] = curagenda.counting[0].add(1);
        else if (_vote == uint(VoteChoice.YES))
            curagenda.counting[1] = curagenda.counting[1].add(1);
        else
            curagenda.counting[2] = curagenda.counting[2].add(1);
        
        if (_majority < curagenda.counting[0]) {
            curagenda.result = LibAgenda.AgendaResult.DISMISS;
        } else if (_majority < curagenda.counting[1]) {
            curagenda.result = LibAgenda.AgendaResult.ACCEPT;
        } else if (_majority < curagenda.counting[2]) {
            curagenda.result = LibAgenda.AgendaResult.REJECT;
        }

        return (curagenda.counting, uint(curagenda.result));
    }
    
    function setExecuteAgenda(uint256 _AgendaID)
        public
        onlyOwner
        returns (
            bool success,
            uint status,
            uint result,
            bool executed,
            address target,
            bytes memory functionBytecode,
            uint[5] memory times
        )
    {
        require(_AgendaID < agendas.length, "DAOAgendaManager: _AgendaID is invalid.");
        /*
        require(_AgendaID < agendas.length && agendas[_AgendaID].status == LibAgenda.AgendaStatus.IN_PROGRESS, "agenda has expired.");
        require(getAgendaExpirationTimeSeconds(_AgendaID) < block.timestamp && agendas[_AgendaID].target != address(0), "for this agenda, the voting time is not expired");
        require(agendas[_AgendaID].result == LibAgenda.AgendaResult.ACCEPT, "for this agenda, not accept");
        require(!agendas[_AgendaID].executed, "for this agenda, already executed");
        */
        LibAgenda.Agenda storage curagenda = agendas[_AgendaID];
        curagenda.executed = true;
        curagenda.times[4] = block.timestamp;
        curagenda.status = LibAgenda.AgendaStatus.EXEC;
        numExecAgendas = numExecAgendas.add(1);
        
        return (
            true,
            uint(curagenda.status),
            uint(curagenda.result),
            curagenda.executed,
            curagenda.target,
            curagenda.functionBytecode,
            curagenda.times
        );
    }
}
