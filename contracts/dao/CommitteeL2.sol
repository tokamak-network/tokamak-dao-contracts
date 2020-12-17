// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/Ownabled.sol";
import "./StorageStateElection.sol"; 

import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol"; 
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { SeigManagerI } from "../interfaces/SeigManagerI.sol";
import { CommitteeL2I } from "../interfaces/CommitteeL2I.sol";
import { Layer2RegistryI } from "../interfaces/Layer2RegistryI.sol";

contract CommitteeL2 is Ownabled , CommitteeL2I{ 
    using SafeMath for uint256; 
    address operator;
    address seigManager;
    address layer2Registry;
    
    constructor(address _operator) public { 
        operator = _operator; 
    }
    
    function setSeigManager(address _seigMan) public onlyOwner override { 
        seigManager =_seigMan; 
    } 
    function setLayer2Registry(address _layer2Registry) public onlyOwner override { 
        layer2Registry = _layer2Registry; 
    } 
    function updateSeigniorage() public override returns (bool) { 
        require(seigManager!=address(0));
        return SeigManagerI(seigManager).updateSeigniorage();
    }
    
    function registerAndDeployCoinage() public override returns (bool) { 
        return Layer2RegistryI(layer2Registry).registerAndDeployCoinage(address(this), seigManager) ;
    }

    function isCommitteeLayer() public override view returns (bool) { 
        return true;
    }
 
}
