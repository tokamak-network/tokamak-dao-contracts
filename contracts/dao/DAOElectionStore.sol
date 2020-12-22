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
        address committee;
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
    CommitteeInfo[] public committeeInfos;

    mapping(address => uint256) public layer2Id;
    mapping(address => uint256) public layer2IdByLayer;
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
    
    function isExistCommitteeContract(address _operator) public view returns (bool exist, uint256 _layerId) {
       if (layer2Id[_operator] > 0)
           return (true, layer2Id[_operator]);
       else
           return (false, 0);
    }
    
    function existLayerByLayer(address _layer) public view returns (bool exist, uint256 _layerId) {
       if (layer2IdByLayer[_layer] > 0)
           return (true, layer2IdByLayer[_layer]);
       else
           return (false, 0);
    }
    
    function registerCommitteeContract(address committeeContract, address _operator, string memory _name) onlyOwner public returns (uint256) {
        require(committeeContract!=address(0) && _operator != address(0), "DAOElectionStore: layer or operator is zero address");
        if (committeeInfos.length == 0)
            committeeInfos.push(CommitteeInfo(address(0), address(0), "", block.timestamp));
       
        if (layer2Id[_operator] != 0) {
            return 0;
        } else {
            CommitteeInfo memory la = CommitteeInfo(committeeContract, _operator, _name, block.timestamp);
            uint256 layerIndex = committeeInfos.length;
            committeeInfos.push(la);
            layer2Id[_operator] = layerIndex;
            layer2IdByLayer[committeeContract] = layerIndex;
            numCandidates = committeeInfos.length;
           
            return layerIndex;
        }
    }

    function detailedCommitteeInfo(uint256 index) public view returns (address layer2, address operator, string memory name, uint since) {
        require(index < numCandidates, "DAOElectionStore: invalid index");
        return (committeeInfos[index].committeeContract, committeeInfos[index].committee, committeeInfos[index].name, committeeInfos[index].since);
    }
    
    function detailedLayer2sByOperator(address _operator) public view returns (address layer2, address operator, string memory name, uint since) {
        uint256 index = layer2Id[_operator];
        return detailedCommitteeInfo(index);
    }

    function detailedLayer2sByLayer(address _layer) public view returns (address layer2, address operator, string memory name, uint since) {
        uint256 index = layer2IdByLayer[_layer];
        return detailedCommitteeInfo(index);
    }
     
    function committeeContractByCommittee(address committee) public view returns (address) {
        uint256 index = layer2Id[committee];
        require(index < numCandidates, "DAOElectionStore: invalid index");
        return committeeInfos[index].committeeContract;
    }
}
