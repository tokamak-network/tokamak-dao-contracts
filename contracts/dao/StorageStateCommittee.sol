// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./DAOCommitteeStore.sol";
import "./DAOAgendaManager.sol";
import "./DAOActivityFeeManager.sol";

import "./DAOElectionStore.sol";
import { CommitteeL2FactoryI } from "../interfaces/CommitteeL2FactoryI.sol";
import { Layer2RegistryI } from "../interfaces/Layer2RegistryI.sol";
import { SeigManagerI } from "../interfaces/SeigManagerI.sol";

contract StorageStateCommittee {
    DAOCommitteeStore  public store;
    DAOAgendaManager public agendaManager;
    DAOActivityFeeManager public activityfeeManager;
    
    DAOElectionStore public election;
    CommitteeL2FactoryI public committeeL2Factory;
    Layer2RegistryI public layer2Registry;
    SeigManagerI public seigManager;
    /*
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    }
    
    struct ActivityFee {
        uint256 total;
        uint256 remain;
        uint256 claim;
    }
    */
    /*
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
    */
    enum VoteChoice { ABSTAIN, YES, NO }
    enum AgendaStatus { NONE, NOTICE, VOTING, EXEC, ENDED, PENDING, RISK }
    enum AgendaResult { UNDEFINED, ACCEPT, REJECT, DISMISS }
    enum AgendaGroup { DAOVault, TON, PowerTON, SeigManager, Others }
    
    modifier validStore() {
        require(address(store) != address(0), "StorageStateCommittee: store address is zero");
        _;
    }
    
    modifier validAgendaManager() {
        require(address(agendaManager) != address(0), "StorageStateCommittee: AgendaManager is zero");
        _;
    }
    
    modifier validActivityfeeManager() {
        require(address(activityfeeManager) != address(0), "StorageStateCommittee: ActivityFeeManager is zero");
        _;
    }

    //==
    modifier validElection() {
        require(address(election) != address(0), "StorageStateCommittee: unvalid election");
        _;
    }

    modifier validCommitteeL2Factory() {
        require(address(committeeL2Factory) != address(0), "StorageStateCommittee: unvalid CommitteeL2Factory");
        _;
    }

    modifier validLayer2Registry() {
        require(address(layer2Registry) != address(0), "StorageStateCommittee: unvalid Layer2Registry");
        _;
    }

    modifier validSeigManager() {
        require(address(seigManager) != address(0), "StorageStateCommittee: unvalid SeigManagere");
        _;
    }

    //function getProxyStore() public view returns(address) { return address(store); }
    //function getProxyAgendamanager() public view returns(address) { return address(agendaManager); }
    //function getProxyActivityFeeManager() public view returns(address) { return address(activityfeeManager); }

    //function getProxyElection() public view returns (address) { return address(election); }
    //function getProxySeigManager() public view returns (address) { return address(seigManager); }
    //function getProxyLayer2Registry() public view returns (address) { return address(layer2Registry); }
    //function getProxyCommitteeL2Factory() public view returns (address) { return address(committeeL2Factory); }
}
