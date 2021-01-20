// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { LibAgenda } from "../lib/Agenda.sol";

interface IDAOAgendaManager  {
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    }

    function setCreateAgendaFees(uint256 _createAgendaFees) external;
    function setMinimumNoticePeriodSeconds(uint256 _minimumNoticePeriodSeconds) external;
    function setMinimumVotingPeriodSeconds(uint256 _minimumVotingPeriodSeconds) external;
    //function setActivityFeeManager(address _man) external;
    //function setQuorum(uint256 _quorum) external;
    function newAgenda(
        address[] memory _targets,
        uint256 _noticePeriodSeconds,
        uint256 _votingPeriodSeconds,
        uint256 _reward,
        bytes[] calldata _functionBytecodes
    )
        external
        returns (uint256 agendaID);
    //function electCommiitteeForAgenda(uint256 _AgendaID, address[] calldata committees) external returns (bool);
    //function validCommitteeForAgenda(uint256 _AgendaID, address user) external view returns (bool);
    function castVote(uint256 _AgendaID, address voter, uint _vote) external returns (bool);
    function endAgendaVoting(uint256 _agendaID) external;
    //function setExecuteAgenda(uint256 _AgendaID) external returns (bool success, uint result, bool executed, address target, bytes memory functionBytecode);
    function setResult(uint256 _agendaID, LibAgenda.AgendaResult _result) external;
    function setStatus(uint256 _agendaID, LibAgenda.AgendaStatus _status) external;
    function setExecutedAgenda(uint256 _agendaID) external;
     
    // -- view functions
    //function userHasVoted(uint256 _AgendaID, address _user) external view returns (bool);
    //function getQuorum() external view returns (uint256 quorum);
    function getAgendaNoticeEndTimeSeconds(uint256 _AgendaID) external view returns (uint);
    function getAgendaVotingStartTimeSeconds(uint256 _AgendaID) external view returns (uint);
    function getAgendaVotingEndTimeSeconds(uint256 _AgendaID) external view returns (uint) ;
    //function detailedAgenda(uint256 _AgendaID) external view returns (address[2] memory creator, uint[8] memory datas, uint256[3] memory counting, uint256 fees, bool executed, bytes memory functionBytecode, string memory description, address[] memory voters);
    //function detailedAgendaVoteInfo(uint256 _AgendaID, address voter) external view returns (bool hasVoted, uint256 vote, string memory comment);
    function getAgendaStatus(uint256 _AgendaID) external view returns (uint status);
    function totalAgendas() external view returns (uint256);
    //function getNumExecAgendas() external view returns (uint256);
    //function getCreateAgendaFees() external view returns (uint256);
    //function getMinimunNoticePeriodSeconds() external view returns (uint256);
    //function getMinimunVotingPeriodSeconds() external view returns (uint256);
    //function getActivityFeeManager() external view returns (address);
    function getAgendaResult(uint256 _AgendaID) external view returns (uint result, bool executed);

    function agendas(uint256 _index) external view returns (LibAgenda.Agenda memory);
    function getVotingCount(uint256 _agendaID)
        external
        view
        returns (
            uint256 countingYes,
            uint256 countingNo,
            uint256 countingAbstain
        );
    function canExecuteAgenda(uint256 _agendaID) external view returns (bool);
    function getExecutionInfo(uint256 _agendaID)
        external
        view
        returns(
            address[] memory target,
            bytes[] memory functionBytecode
        );
    /*function getExecutionInfo1(uint256 _agendaID, uint256 _index) external view 
        returns(
            address target,
            bytes memory functionBytecode
        ); */
    //function quorum() external view returns (uint256);
    function hasVoted(uint256 _agendaID, address _user) external view returns (bool);
    function isVoter(uint256 _agendaID, address _user) external view returns (bool);
    function createAgendaFees() external view returns (uint256);
}
