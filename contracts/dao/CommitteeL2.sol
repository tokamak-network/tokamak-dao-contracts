// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/Ownabled.sol";
import "./StorageStateElection.sol";

import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { SeigManagerI } from "../interfaces/SeigManagerI.sol";
import { CommitteeL2I } from "../interfaces/CommitteeL2I.sol";
import { Layer2RegistryI } from "../interfaces/Layer2RegistryI.sol";

contract CommitteeL2 is Ownabled, CommitteeL2I {
    using SafeMath for uint256;
    address public operator;
    address public seigManager;
    address public layer2Registry;
    
    constructor(address _operator) {
        operator = _operator;
    }
    
    function setSeigManager(address _seigMan) public onlyOwner override {
        seigManager =_seigMan;
    }

    function setLayer2Registry(address _layer2Registry) public onlyOwner override {
        layer2Registry = _layer2Registry;
    }

    function updateSeigniorage() public override returns (bool) {
        require(seigManager != address(0), "CommitteeL2: SeigManager is zero");
        return SeigManagerI(seigManager).updateSeigniorage();
    }
    
    function registerAndDeployCoinage() public override returns (bool) {
        return Layer2RegistryI(layer2Registry).registerAndDeployCoinage(address(this), seigManager);
    }

    function isCommitteeLayer2() public override view returns (bool) {
        return true;
    }

    function operatorAndOwner() public override view returns (address, address) {
        return (operator, owner);
    }

    //function operator() public view returns (address) { return operator; }
    function isLayer2() public view returns (bool) { return true; }
    function currentFork() public view returns (uint) { return 1; }
    function lastEpoch(uint forkNumber) public view returns (uint) { return 1; }
    function changeOperator(address _operator) public {
        operator = _operator;
    }
}
