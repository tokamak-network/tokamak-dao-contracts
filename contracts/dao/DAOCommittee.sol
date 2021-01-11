// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./StorageStateCommittee.sol";

import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ICandidate } from "../interfaces/ICandidate.sol";
import { IDAOAgendaManager } from "../interfaces/IDAOAgendaManager.sol";
import { LibAgenda } from "../lib/Agenda.sol";

contract DAOCommittee is StorageStateCommittee, Ownable {
    using SafeMath for uint256;
    using LibAgenda for *;
     
    enum ApplyResult { NONE, SUCCESS, NOT_ELECTION, ALREADY_COMMITTEE, SLOT_INVALID, ADDMEMBER_FAIL, LOW_BALANCE }

    struct AgendaCreatingData {
        address target;
        uint256 noticePeriodSeconds;
        uint256 votingPeriodSeconds;
        bytes functionBytecode;
    }

    //////////////////////////////
    // Events
    //////////////////////////////

    event AgendaCreated(
        uint256 indexed timestamp,
        address indexed from,
        uint256 indexed id,
        address target,
        uint256 noticeEndTimestamp
    );

    event AgendaVoteCasted(
        uint256 indexed timestamp,
        address indexed from,
        uint256 indexed id,
        uint voting,
        string comment
    );

    event AgendaExecuted(
        uint256 indexed timestamp,
        address indexed from,
        uint256 indexed id,
        address target,
        bytes functionBytecode
    );

    event CandidateContractCreated(
        address indexed candidate,
        address candidateContract,
        string memo
    );

    event ChangedMember(
        uint256 indexed timestamp,
        uint256 indexed slotIndex,
        address prevMember,
        address indexed newMember
    );

    event ChangedSlotMaximum(
        uint256 indexed prevSlotMax,
        uint256 indexed slotMax
    );

    event ClaimedActivityReward(
        address indexed candidate,
        uint256 indexed amount
    );

    //////////////////////////////////////////////////////////////////////
    // setters

    function setSeigManager(address _agendaManager) public onlyOwner {
        require(_agendaManager != address(0), "zero address");
        seigManager = ISeigManager(_agendaManager);
    }
     
    function setDaoVault(address _daoVault) public onlyOwner {
        require(_daoVault != address(0), "zero address");
        daoVault = IDAOVault2(_daoVault);
    }

    function setLayer2Registry(address _layer2Registry) public onlyOwner {
        require(_layer2Registry != address(0), "zero address");
        layer2Registry = ILayer2Registry(_layer2Registry);
    }

    function setAgendaManager(address _agendaManager) public onlyOwner {
        require(_agendaManager != address(0), "zero address");
        agendaManager = IDAOAgendaManager(_agendaManager);
    }

    function setCandidateFactory(address _candidateFactory) public onlyOwner {
        require(_candidateFactory != address(0), "zero address");
        candidateFactory = ICandidateFactory(_candidateFactory);
    }

    function setTon(address _ton) public onlyOwner {
        require(_ton != address(0), "zero address");
        ton = _ton;
    }

    function setActivityRewardPerSecond(uint256 _value) public onlyOwner {
        activityRewardPerSecond = _value;
    }

    function setMaxMember(uint256 _maxMember) onlyOwner public {
        require(maxMember < _maxMember, "DAOCommitteeStore: You have to call reduceMemberSlot to decrease");
        maxMember = _maxMember;
        fillMemberSlot();
    }

    //////////////////////////////////////////////////////////////////////
    // Managing members

    function createCandidate(string memory _memo)
        public
        validSeigManager
        validLayer2Registry
        validCommitteeL2Factory
    {
        require(!isExistCandidate(msg.sender), "DAOCommittee: candidate already registerd");

        //uint256 minimumAmount = seigManager.minimumAmount();
        //require(minimumAmount <= tonAmount, "DAOCommittee: not enough ton");
          
        // Candidate
        address candidateContract = candidateFactory.deploy(msg.sender, _memo, address(seigManager), address(layer2Registry));
        require(
            candidateContract != address(0),
            "DAOCommittee: deployed candidateContract is zero"
        );
        require(
            layer2Registry.registerAndDeployCoinage(candidateContract, address(seigManager)),
            "DAOCommittee: failed to registerAndDeployCoinage"
        );
        require(
            candidateInfos[msg.sender].candidateContract == address(0),
            "DAOCommitteeStore: The candidate already has contract"
        );

        candidateInfos[msg.sender] = CandidateInfo({
            candidateContract: candidateContract,
            memberJoinedTime: 0,
            indexMembers: 0,
            rewardPeriod: 0
        });

        candidates.push(msg.sender);
       
        emit CandidateContractCreated(msg.sender, candidateContract, _memo);
    }

    function changeMember(uint256 _memberIndex)
        public
        returns (bool)
    {
        CandidateInfo storage candidateInfo = candidateInfos[msg.sender];
        require(
            _memberIndex < maxMember,
            "DAOCommitteeStore: index is not available"
        );
        require(
            candidateInfo.candidateContract != address(0),
            "DAOCommitteeStore: The address is not a candidate"
        );
        require(
            candidateInfo.memberJoinedTime == 0,
            "DAOCommitteeStore: already member"
        );
        
        address prevMember = members[_memberIndex];

        candidateInfo.memberJoinedTime = block.timestamp;
        candidateInfo.indexMembers = _memberIndex;

        members[_memberIndex] = msg.sender;

        if (prevMember == address(0)) {
            emit ChangedMember(block.timestamp, _memberIndex, prevMember, msg.sender);
            return true;
        }

        require(
            totalSupplyOnCandidate(msg.sender) > totalSupplyOnCandidate(prevMember),
            "not enough amount"
        );

        CandidateInfo storage prevCandidate = candidateInfos[prevMember];
        prevCandidate.indexMembers = 0;
        prevCandidate.rewardPeriod = prevCandidate.rewardPeriod.add(block.timestamp.sub(prevCandidate.memberJoinedTime));
        prevCandidate.memberJoinedTime = 0;

        emit ChangedMember(block.timestamp, _memberIndex, prevMember, msg.sender);

        return true;
    }
    
    function retireMember() onlyMember(msg.sender) public returns (bool) {
        CandidateInfo storage candidateInfo = candidateInfos[msg.sender];
        members[candidateInfo.indexMembers] = address(0);
        candidateInfo.rewardPeriod = candidateInfo.rewardPeriod.add(block.timestamp.sub(candidateInfo.memberJoinedTime));
        candidateInfo.memberJoinedTime = 0;

        emit ChangedMember(block.timestamp, candidateInfo.indexMembers, msg.sender, address(0));

        candidateInfo.indexMembers = 0;
    }

    function reduceMemberSlot(uint256 _reducingMemberIndex) public onlyOwner {
        address reducingMember = members[_reducingMemberIndex];
        CandidateInfo storage reducingCandidate = candidateInfos[reducingMember];

        if (_reducingMemberIndex != members.length - 1) {
            address tailmember = members[members.length - 1];
            CandidateInfo storage tailCandidate = candidateInfos[tailmember];

            tailCandidate.indexMembers = _reducingMemberIndex;
            members[_reducingMemberIndex] = tailmember;
        }
        reducingCandidate.indexMembers = 0;
        reducingCandidate.rewardPeriod = reducingCandidate.rewardPeriod.add(block.timestamp.sub(reducingCandidate.memberJoinedTime));
        reducingCandidate.memberJoinedTime = 0;

        members.pop();
        maxMember = maxMember.sub(1);

        emit ChangedMember(block.timestamp, _reducingMemberIndex, reducingMember, address(0));
        emit ChangedSlotMaximum(maxMember.add(1), maxMember);
    }

    //////////////////////////////////////////////////////////////////////
    // Managing agenda

    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    ) external returns (bool) {
        AgendaCreatingData memory agendaData = _decodeAgendaData(data);

        _createAgenda(
            owner,
            agendaData.target,
            agendaData.noticePeriodSeconds,
            agendaData.votingPeriodSeconds,
            agendaData.functionBytecode
        );

        return true;
    }

    function setQuorum(
        uint256 _quorumNumerator,
        uint256 _quorumDenominator
    )
        public
        onlyOwner
        validAgendaManager
    {
        agendaManager.setQuorum(_quorumNumerator, _quorumDenominator);
    }

    function setCreateAgendaFees(
        uint256 _fees
    )
        public
        onlyOwner
        validAgendaManager
    {
        agendaManager.setCreateAgendaFees(_fees);
    }

    function setMinimunNoticePeriodSeconds(
        uint256 _minimunNoticePeriod
    )
        public
        onlyOwner
        validAgendaManager
    {
        agendaManager.setMinimunNoticePeriodSeconds(_minimunNoticePeriod);
    }

    function setMinimunVotingPeriodSeconds(
        uint256 _minimunVotingPeriod
    )
        public
        onlyOwner
        validAgendaManager
    {
        agendaManager.setMinimunVotingPeriodSeconds(_minimunVotingPeriod);
    }

    function castVote(
        uint256 _agendaID,
        uint _vote,
        string calldata _comment
    )
        public 
        validAgendaManager
    {
        uint256 requiredVotes = requiredVotesToPass();
        require(requiredVotes > 0, "DAOCommittee: requiredVotes is zero");
        
        agendaManager.castVote(
            _agendaID,
            msg.sender,
            _vote
        );

        (uint256 yes, uint256 no, uint256 abstain) = agendaManager.getVotingCount(_agendaID);

        if (requiredVotes < yes) {
            // yes
            agendaManager.setResult(_agendaID, LibAgenda.AgendaResult.ACCEPT);
            agendaManager.setStatus(_agendaID, LibAgenda.AgendaStatus.WAITING_EXEC);
        } else if (requiredVotes < no) {
            // no
            agendaManager.setResult(_agendaID, LibAgenda.AgendaResult.REJECT);
            agendaManager.setStatus(_agendaID, LibAgenda.AgendaStatus.ENDED);
        } else if (requiredVotes < abstain.add(no) ) {
            // dismiss
            agendaManager.setResult(_agendaID, LibAgenda.AgendaResult.DISMISS);
            agendaManager.setStatus(_agendaID, LibAgenda.AgendaStatus.ENDED);
        }
        
        emit AgendaVoteCasted(block.timestamp, msg.sender, _agendaID, _vote, _comment);
    }

    function executeAgenda(uint256 _agendaID) public validAgendaManager {
        require(
            agendaManager.canExecuteAgenda(_agendaID),
            "DAOCommittee: can not execute the agenda"
        );
        
        (address target, bytes memory functionBytecode) = agendaManager.getExecutionInfo(_agendaID);
       
        (bool success, ) = address(target).call(functionBytecode);
        require(success, "DAOCommittee: Failed to execute the agenda");
         
        agendaManager.setExecutedAgenda(_agendaID);

        emit AgendaExecuted(block.timestamp, msg.sender, _agendaID, target, functionBytecode);
    }
     
    function updateSeigniorage(address _candidate) public returns (bool) {
        address candidateContract = candidateInfos[_candidate].candidateContract;
        require(candidateContract != address(0), "DAOCommittee: not a candidate");
        ICandidate(candidateContract).updateSeigniorage();

        //emit CommitteeUpdateSeigniorage(msg.sender);
    }

    function updateSeigniorages(address[] calldata _candidates) public returns (bool) {
        for (uint256 i = 0; i < _candidates.length; i++) {
            updateSeigniorage(_candidates[i]);
        }
    }

    function claimActivityReward() public {
        CandidateInfo storage info = candidateInfos[msg.sender];
        uint256 amount = getClaimableActivityReward(msg.sender);

        require(amount > 0, "DAOCommittee: you don't have claimable ton");

        daoVault.claimTON(msg.sender, amount);

        emit ClaimedActivityReward(msg.sender, amount);
    }

    function fillMemberSlot() internal {
        for (uint256 i = members.length; i < maxMember; i++) {
            members.push(address(0));
        }
    }

    function _decodeAgendaData(bytes calldata input)
        internal
        view
        returns (AgendaCreatingData memory data)
    {
        (data.target, data.noticePeriodSeconds, data.votingPeriodSeconds, data.functionBytecode) = 
            abi.decode(input, (address, uint256, uint256, bytes));
    }

    function payCreatingAgendaFee(address _creator) internal {
        uint256 fee = agendaManager.createAgendaFees();

        require(IERC20(ton).transferFrom(_creator, address(this), fee), "DAOCommitteeStore: failed to transfer ton from creator");
        require(IERC20(ton).transfer(address(1), fee), "DAOCommitteeStore: failed to burn");
    }
   
    function _createAgenda(
        address _creator,
        address _target,
        uint256 _noticePeriodSeconds,
        uint256 _votingPeriodSeconds,
        bytes memory _functionBytecode
    )
        internal
        validAgendaManager
        returns (uint256)
    {
        // pay to create agenda, burn ton.
        payCreatingAgendaFee(_creator);

        uint256 agendaID = agendaManager.newAgenda(
            _target,
            _noticePeriodSeconds,
            _votingPeriodSeconds,
            0,
            _functionBytecode
        );
          
        emit AgendaCreated(
            block.timestamp,
            _creator,
            agendaID,
            _target,
            agendaManager.getAgendaNoticeEndTimeSeconds(agendaID)
        );

        return agendaID;
    }
    
    function requiredVotesToPass()
        public
        view
        returns (uint256 requiredVotes)
    {
        IDAOAgendaManager.Ratio memory quorum = agendaManager.quorum();
        uint256 total = members.length;
        requiredVotes = total.mul(quorum.numerator).div(quorum.denominator);
    }
    
    function totalSupplyOnCandidate(
        address _candidate
    )
        public
        view
        returns (uint256 totalsupply)
    {
        address candidateContract = candidateContract(_candidate);
        require(candidateContract != address(0), "This account is not a candidate");

        address coinage = seigManager.coinages(candidateContract);
        require(coinage != address(0), "DAOCommittee: coinage is zero");
        return IERC20(coinage).totalSupply();
    }

    function balanceOfOnCandidate(
        address _candidate,
        address account
    )
        public
        view
        returns (uint256 amount)
    {
        address candidateContract = candidateContract(_candidate);
        require(candidateContract != address(0), "This account is not a candidate");

        address coinage = seigManager.coinages(candidateContract);
        require(coinage != address(0), "DAOCommittee: coinage is zero");
        return IERC20(coinage).balanceOf(account);
    }
    
    function candidatesLength() public view returns (uint256) {
        return candidates.length;
    }

    function isExistCandidate(address _candidate) public view returns (bool isExist) {
        return candidateInfos[_candidate].candidateContract != address(0);
    }

    /*function candidateContract(address _candidate) public view returns (address) {
        return candidateInfos[_candidate].candidateContract;
    }*/

    function getClaimableActivityReward(address _candidate) public view returns (uint256) {
        CandidateInfo storage info = candidateInfos[_candidate];
        uint256 period = info.rewardPeriod;

        if (info.memberJoinedTime > 0) {
            period = period.add(block.timestamp.sub(info.memberJoinedTime));
        }

        return period.mul(activityRewardPerSecond);
    }
}
