// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { IStorageStateCommittee } from "../interfaces/IStorageStateCommittee.sol";

interface IDAOCommittee is IStorageStateCommittee {
    //--owner
    function setSeigManager(address _seigManager) external;
    function setCandidatesSeigManager(address[] calldata _candidateContracts, address _seigManager) external;
    function setCandidatesCommittee(address[] calldata _candidateContracts, address _committee) external;
    function setLayer2Registry(address _layer2Registry) external;
    function setAgendaManager(address _agendaManager) external;
    function setCandidateFactory(address _candidateFactory) external;
    function setTon(address _ton) external;
    function setActivityRewardPerSecond(uint256 _value) external;

    function increaseMaxMember(uint256 _newMaxMember, uint256 _quorum) external;
    function decreaseMaxMember(uint256 _reducingMemberIndex, uint256 _quorum) external;
    function createCandidate(string calldata _memo) external;
    function registerOperator(address _layer2, string memory _memo) external;
    function registerOperatorByOwner(address _operator, address _layer2, string memory _memo) external;
    function changeMember(uint256 _memberIndex) external returns (bool);
    function retireMember() external returns (bool);
    //function retireMember(uint256 _reducingMemberIndex, uint256 _quorum) external;

    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    )
        external
        returns (bool);

    function setQuorum(uint256 _quorum) external;
    function setCreateAgendaFees(uint256 _fees) external;
    function setMinimumNoticePeriodSeconds(uint256 _minimumNoticePeriod) external;
    function setMinimumVotingPeriodSeconds(uint256 _minimumVotingPeriod) external;
    function castVote(uint256 _AgendaID, uint _vote, string calldata _comment) external;
    function endAgendaVoting(uint256 _agendaID) external;
    function executeAgenda(uint256 _AgendaID) external;
    function setAgendaStatus(uint256 _agendaID, uint256 _status, uint256 _result) external;

    function updateSeigniorage(address _candidate) external returns (bool);
    function updateSeigniorages(address[] calldata _candidates) external returns (bool);
    function claimActivityReward() external;

    //function setStore(address _store) external;
    //function setDaoElection(address _daoElection) external;
    function setDaoVault(address _daoVault) external;
    //function setAgendamanager(address _manager) external;
    //function setActivityfeemanager(address _manager) external;
    //function setMaxCommittees(uint256 _maxCommittees) external;
    //function popCommitteeSlot() external;
    
    //--committee
    /*function applyCommittee(
        uint256 _indexSlot,
        address _layer2,
        address _operator,
        string calldata _name,
        uint256 totalbalance
    )
        external
        returns (
            uint applyResultCode,
            uint256 _memberindex
        );*/
    //function retireCommittee() external returns (bool);
    
    //--for agenda
    //function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriod) external;
    //function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriod) external;

    
    //function createAgenda(uint _group, address _target, uint _noticePeriodMin, bytes calldata functionBytecode, string calldata _description) external returns (uint256);
    //function electCommiitteeForAgenda(uint256 _AgendaID) external;
      
    //function checkRisk(address _target, bytes calldata _functionBytecode) external pure returns (bool);
    //function getMajority() external view returns (uint256 majority);
    //function getTON() external view returns (address);
    //function maxMember() external view returns (uint256);
    //function members(uint256 _index) external view returns (address);

    function isCandidate(address _candidate) external view returns (bool);
    function totalSupplyOnCandidate(address _candidate) external view returns (uint256);
    function balanceOfOnCandidate(address _candidate, address _account) external view returns (uint256);
    function totalSupplyOnCandidateContract(address _candidateContract) external view returns (uint256);
    function balanceOfOnCandidateContract(address _candidateContract, address _account) external view returns (uint256);
    function candidatesLength() external view returns (uint256);
    function isExistCandidate(address _candidate) external view returns (bool);
    function getClaimableActivityReward(address _candidate) external view returns (uint256);
}
