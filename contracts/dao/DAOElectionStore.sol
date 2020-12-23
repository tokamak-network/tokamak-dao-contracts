// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/OwnableAdmin.sol";
import { CommitteeL2 } from "./CommitteeL2.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOElectionStore is OwnableAdmin {
    using SafeMath for uint256;

    struct CommitteeInfo {
        address committeeContract;
        address candidate;
        string name;
        uint since;
    }
    
    address public daoCommittee;
    address public layer2Registry;
    //address public depositManager;
    address public seigManager;
    address public committeeL2Factory;
    
    address public ton;
    uint256 public numCandidates;
    CommitteeInfo[] public candidateInfos;

    mapping(address => uint256) public candidateIds;
    mapping(address => uint256) public candidateIdsByContract;
    mapping(address => bool) public layer2Valid;
    
    constructor(address _ton) {
        ton = _ton;
    }
   
    function setDaoCommittee(address _daoCommittee) onlyOwner public {
        require(_daoCommittee != address(0), "DAOElectionStore: committee address is zero");
        daoCommittee = _daoCommittee;
    }
    
    function setLayer2Registry(address _layer2Registry) onlyOwner public {
        require(_layer2Registry != address(0), "DAOElectionStore: registry address is zero");
        layer2Registry = _layer2Registry;
    }

    /*
    function setDepositManager(address _depositManager) onlyOwner public {
        require(_depositManager != address(0));
        depositManager = _depositManager;
    }

    */
    function setSeigManager(address _seigManager) onlyOwner public {
        require(_seigManager != address(0), "DAOElectionStore: SeigManager is zero");
        seigManager = _seigManager;
    }
    
    function setCommitteeL2Factory(address _committeeL2Factory) onlyOwner public {
        require(_committeeL2Factory != address(0), "DAOElectionStore: factory address is zero");
        committeeL2Factory = _committeeL2Factory;
    }
    
    function isExistCommitteeContract(address candidate) public view returns (bool exist, uint256 candidateIndex) {
       if (candidateIds[candidate] > 0)
           return (true, candidateIds[candidate]);
       else
           return (false, 0);
    }
    
    function existCandidateByContract(address committeeContract) public view returns (bool exist, uint256 candidateIndex) {
       if (candidateIdsByContract[committeeContract] > 0)
           return (true, candidateIdsByContract[committeeContract]);
       else
           return (false, 0);
    }
    
    function registerCommitteeContract(address committeeContract, address candidate, string memory _name) onlyOwner public returns (uint256) {
        require(committeeContract != address(0) && candidate != address(0), "DAOElectionStore: layer or operator is zero address");
        if (candidateInfos.length == 0)
            candidateInfos.push(CommitteeInfo(address(0), address(0), "", block.timestamp));
       
        if (candidateIds[candidate] != 0) {
            return 0;
        } else {
            CommitteeInfo memory la = CommitteeInfo(committeeContract, candidate, _name, block.timestamp);
            uint256 candidateIndex = candidateInfos.length;
            candidateInfos.push(la);
            candidateIds[candidate] = candidateIndex;
            candidateIdsByContract[committeeContract] = candidateIndex;
            numCandidates = candidateInfos.length;
           
            return candidateIndex;
        }
    }

    function detailedCandidateInfo(uint256 index) public view returns (address committeeContract, address candidate, string memory name, uint since) {
        require(index < numCandidates, "DAOElectionStore: invalid index");
        CommitteeInfo storage candidateInfo = candidateInfos[index];
        return (candidateInfo.committeeContract, candidateInfo.candidate, candidateInfo.name, candidateInfo.since);
    }
    
    function detailedCommitteeInfoByCandidate(address candidate) public view returns (address committeeContract, address operator, string memory name, uint since) {
        uint256 index = candidateIds[candidate];
        return detailedCandidateInfo(index);
    }

    function detailedCandidateInfoByContract(address _committeeContract) public view returns (address committeeContract, address operator, string memory name, uint since) {
        uint256 index = candidateIdsByContract[_committeeContract];
        return detailedCandidateInfo(index);
    }
     
    function committeeContractByCandidate(address candidate) public view returns (address) {
        uint256 index = candidateIds[candidate];
        require(index < numCandidates, "DAOElectionStore: invalid index");
        return candidateInfos[index].committeeContract;
    }
}
