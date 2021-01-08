// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "./DAOAgendaManager.sol";
//import "./DAOActivityRewardManager.sol";

import { ICandidateFactory } from "../interfaces/ICandidateFactory.sol";
import { ILayer2Registry } from "../interfaces/ILayer2Registry.sol";
import { ISeigManager } from "../interfaces/ISeigManager.sol";
//import { IDAOActivityRewardManager } from "../interfaces/IDAOActivityRewardManager.sol";
import { IDAOAgendaManager } from "../interfaces/IDAOAgendaManager.sol";
import { IDAOVault2 } from "../interfaces/IDAOVault2.sol";

contract StorageStateCommittee {
    enum AgendaStatus { NONE, NOTICE, VOTING, EXEC, ENDED, PENDING, RISK }
    enum AgendaResult { UNDEFINED, ACCEPT, REJECT, DISMISS }

    struct CandidateInfo {
        address candidateContract;
        uint memberJoinedTime;
        uint indexMembers;
        uint256 rewardPeriod;
    }
    
    address public ton;
    IDAOVault2 public daoVault;
    IDAOAgendaManager public agendaManager;
    //IDAOActivityRewardManager public activityRewardManager;
    ICandidateFactory public candidateFactory;
    ILayer2Registry public layer2Registry;
    ISeigManager public seigManager;

    address[] public candidates;
    address[] public members;
    uint256 public maxMember;

    // candidate EOA => candidate information
    mapping(address => CandidateInfo) public candidateInfos;

    uint256 public activityRewardPerSecond;

    event ApplyMemberSuccess(
        address indexed from,
        address member,
        uint256 totalbalance,
        uint256 memberIndex
    );

    modifier validAgendaManager() {
        require(address(agendaManager) != address(0), "StorageStateCommittee: AgendaManager is zero");
        _;
    }
    
    /*modifier validActivityRewardManager() {
        require(address(activityRewardManager) != address(0), "StorageStateCommittee: ActivityRewardManager is zero");
        _;
    }*/

    modifier validCommitteeL2Factory() {
        require(address(candidateFactory) != address(0), "StorageStateCommittee: unvalid CommitteeL2Factory");
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

    modifier onlyMember(address _candidate) {
        require(isMember(_candidate), "StorageStateCommittee: not a member");
        _;
    }
    
    function isMember(address _candidate) public view returns (bool) {
        return candidateInfos[_candidate].memberJoinedTime > 0;
    }

    function candidateContract(address _candidate) public view returns (address) {
        return candidateInfos[_candidate].candidateContract;
    }
}
