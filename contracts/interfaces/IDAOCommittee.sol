// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IDAOCommittee {
    //--owner
    function setStore(address _store) external;
    function setDaoElection(address _daoElection) external;
    function setDaoVault(address _daoVault) external;
    function setAgendamanager(address _manager) external;
    function setActivityfeemanager(address _manager) external;
    function setMaxCommittees(uint256 _maxCommittees) external;
    function popCommitteeSlot() external;
    
    //--committee
    function applyCommittee(
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
        );
    function retireCommittee() external returns (bool);
    
    //--for agenda
    function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriod) external;
    function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriod) external;
    function setQuorum(uint256 quorumNumerator, uint256 quorumDenominator) external;
    function setCreateAgendaFees(uint256 _fees) external;

    function changeMember(uint256 _memberIndex) external returns (bool);
    function retireMember() external returns (bool);
    function claimActivityReward(address _receiver) external;
    
    function createAgenda(uint _group, address _target, uint _noticePeriodMin, bytes calldata functionBytecode, string calldata _description) external returns (uint256);
    function electCommiitteeForAgenda(uint256 _AgendaID) external;
    function castVote(uint256 _AgendaID, uint _vote, string calldata _comment) external;
    function executeAgenda(uint256 _AgendaID) external;
      
    function checkRisk(address _target, bytes calldata _functionBytecode) external pure returns (bool);
    function getMajority() external view returns (uint256 majority);
    //function getTON() external view returns (address);
    function maxMember() external view returns (uint256);
    function members(uint256 _index) external view returns (address);
}
