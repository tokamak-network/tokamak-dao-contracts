// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./DAOCommitteeStore.sol"; 
import { IDAOAgendamanager } from "../interfaces/IDAOAgendamanager.sol"; 
import { IDAOActivityFeeManager } from "../interfaces/IDAOActivityFeeManager.sol"; 


contract StorageStateCommittee {
    DAOCommitteeStore  store; 
    IDAOAgendamanager agendaManager ;
    IDAOActivityFeeManager activityfeeManager; 
    
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    }
    
    struct ActivityFee {
        uint256 total;
        uint256 remain;
        uint256 claim;
    }
    
    // times    creationDate  expirationTime execTime
    // counting abstainVotes yesVotes noVotes
    struct Agenda {
        address creator;
        AgendaStatus status;
        AgendaResult result;
        AgendaGroup group;
        bool executed;
        uint[3] times; 
        uint256[3] counting;
        address target;
        bytes functionBytecode;
        string description;
        address[] voters;  
        mapping(address => Voter) voterInfo;   
    }
    
    struct Voter {
        bool hasVoted;
        uint vote;
        bool claim;
    } 
    
    struct Member {
        address member;
        string name;
        uint memberSince;
        uint256 castingcount;
    } 
    
    enum VoteChoice { ABSTAIN, YES, NO }
    enum AgendaStatus { NOTICE, VOTING, EXEC, ENDED }
    enum AgendaResult { UNDEFINED, ACCEPT, REJECT, DISMISS }
    enum AgendaGroup { DAOVault, TON, PowerTON, SeigManager, Others }
    
    modifier validStore() {
        require(address(store) != address(0)); 
        _;
    }  
    
    modifier validAgendaManager() {
        require(address(agendaManager) != address(0)); 
        _;
    }  
    
    modifier validActivityfeeManager() {
        require(address(activityfeeManager) != address(0)); 
        _;
    }  

    function getProxyStore() public view returns( address ) { return address(store); }
    function getProxyAgendamanager() public view  returns( address ) { return address(agendaManager); }
    function getProxyActivityFeeManager() public view returns( address ) { return address(activityfeeManager); }

}