// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IDAOAgendamanager  {

    function setCreateAgendaFees(uint256 _createAgendaFees) external;  
    function setMinimunNoticePeriodMin(uint256 _minimunNoticePeriodMin)  external;
    function setMinimunVotingPeriodMin(uint256 _minimunVotingPeriodMin)  external ;
    function setActivityFeeManager(address _man)  external ; 
    function setQuorum(uint256 quorumNumerator, uint256 quorumDenominator)   external ;
    function newAgenda( uint _group, address _target, address _creator, uint _noticePeriodMin, bytes calldata _functionBytecode,string calldata _description, uint256 _fees ) external returns (uint256 agendaID) ;
    function electCommiitteeForAgenda(uint256 _AgendaID, address[] calldata committees )  external returns (bool);
    function validCommitteeForAgenda(uint256 _AgendaID, address user) external view returns (bool) ;
    function castVote(uint256 _AgendaID, address voter,address _layer, uint _vote , string calldata _comment, uint256 _majority ) external ; 
    function setExecuteAgenda(uint256 _AgendaID)  external returns ( bool success,  uint result, bool executed, address target, bytes memory functionBytecode)  ;
     
    // -- view functions 
    function userHasVoted(uint256 _AgendaID, address _user) external view  returns (bool);
    function getQuorumRatio() external view  returns (uint256 numerator, uint256 denominator ) ;
    function getAgendaNoticeEndTimeSeconds(uint256 _AgendaID) external view  returns (uint);
    function getAgendaVotingStartTimeSeconds(uint256 _AgendaID) external view  returns (uint);
    function getAgendaVotingEndTimeSeconds(uint256 _AgendaID) external view  returns (uint) ;
    function detailedAgenda(uint256 _AgendaID)  external view  returns (address[2] memory  creator, uint[8] memory datas, uint256[3] memory counting,uint256 fees, bool executed, bytes memory functionBytecode,string memory description,  address[] memory voters );
    function detailedAgendaVoteInfo(uint256 _AgendaID, address voter)  external view returns (bool hasVoted , uint256 vote, string memory comment) ;
    function getAgendaStatus(uint256 _AgendaID) external view returns (bool exist, uint status) ;
    function totalAgendas() external view returns (uint256) ;
    function getNumExecAgendas() external view returns (uint256) ;
    function getCreateAgendaFees() external view returns (uint256) ;
    function getMinimunNoticePeriodMin() external view returns (uint256);
    function getMinimunVotingPeriodMin() external view returns (uint256);
    function getActivityFeeManager() external view returns (address) ;
    function getAgendaResult(uint256 _AgendaID) external view  returns (uint result,bool executed, address target, bytes memory functionBytecode);
     
} 