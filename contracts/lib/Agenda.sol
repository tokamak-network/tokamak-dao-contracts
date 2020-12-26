// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

library LibAgenda {
    //using LibAgenda for Agenda;

    enum AgendaStatus { NONE, NOTICE, VOTING, WAITING_EXEC, EXECUTED, ENDED, PENDING, RISK }
    enum AgendaResult { PENDING, ACCEPT, REJECT, DISMISS }

    //votor : based operator 
    struct Voter {
        bool isVoter;
        bool hasVoted;
        uint vote;
    }

    // counting abstainVotes yesVotes noVotes
    struct Agenda {
        uint256 createdTimestamp;
        uint256 noticeEndTimestamp;
        uint256 votingStartedTimestamp;
        uint256 votingEndTimestamp;
        uint256 executedTimestamp;
        //uint256[3] counting;
        uint256 countingYes;
        uint256 countingNo;
        uint256 countingAbstain;
        uint256 reward;
        AgendaStatus status;
        AgendaResult result;
        address target;
        address[] voters;  
        bytes functionBytecode;
        bool executed;
    }

    /*function getAgenda(Agenda[] storage agendas, uint index) public view returns (Agenda storage agenda) {
        return agendas[index];
    }*/
}
