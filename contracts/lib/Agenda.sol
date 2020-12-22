// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

library LibAgenda {
    //using LibAgenda for Agenda;

    enum AgendaStatus { NONE, NOTICE, VOTING, EXEC, ENDED, PENDING, RISK }
    enum AgendaResult { UNDEFINED, ACCEPT, REJECT, DISMISS }

    //votor : based operator 
    struct Voter {
        bool hasVoted;
        address layer2;
        uint vote;
        string comment;
    }

    // times 0:creationDate 1:noticeEndTime  2:votingStartTime 3:votingEndTime  4:execTime
    // counting abstainVotes yesVotes noVotes
    struct Agenda {
        address creator;
        AgendaStatus status;
        AgendaResult result;
        uint group;
        bool executed;
        uint[5] times; 
        uint256[3] counting;
        uint256 fees;
        address target;
        bytes functionBytecode;
        string description;
        address[] voters;  
        //mapping(address => Voter) voterInfo;
        address[] committees;
    }

    function getAgenda(Agenda[] storage agendas, uint index) public view returns (Agenda storage agenda) {
        return agendas[index];
    }
}
