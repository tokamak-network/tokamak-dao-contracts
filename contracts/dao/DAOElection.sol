// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/Ownabled.sol";
import "./StorageStateElection.sol"; 

import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol"; 
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

import { CommitteeL2I } from "../interfaces/CommitteeL2I.sol";  


contract DAOElection is StorageStateElection , Ownabled { 
    using SafeMath for uint256; 
    
    //////////////////////////////
    // Events
    ////////////////////////////// 
    event CommitteeLayer2Created(address indexed from, uint256 indexed layerId, address layer, string name); 
    event CommitteeLayer2UpdateSeigniorage(address indexed from, uint256 indexed layerId, address layer); 
    event ApplyCommitteeSuccess(address indexed from, uint256 indexed layerId, address operator, uint256 totalbalance, uint256 applyResultCode); 
    event ApplyCommitteeFail(address indexed from, uint256 indexed layerId, address operator, uint256 totalbalance, uint256 applyResultCode); 
    
    enum ApplyResult { NONE, SUCCESS, NOT_ELECTION, ALREADY_COMMITTEE, SLOT_INVALID, ADDMEMBER_FAIL, LOW_BALANCE }
     
    function setStore(address _store)  public onlyOwner{
        require( _store != address(0)); 
        store = DAOElectionStore(_store); 
    } 
    function setDaoCommittee()  public onlyOwner validStore { 
        address manager = store.getDaoCommittee();
        require( manager != address(0)); 
        daoCommittee = IDAOCommittee(manager); 
    }  
    function setCommitteeL2Factory()  public onlyOwner validStore { 
        address manager = store.getCommitteeL2Factory();
        require( manager != address(0)); 
        committeeL2Factory = CommitteeL2FactoryI(manager); 
    } 
    function setLayer2Registry()  public onlyOwner validStore { 
        address manager = store.getLayer2Registry();
        require( manager != address(0)); 
        layer2Registry = Layer2RegistryI(manager); 
    } 
    function setSeigManager()  public onlyOwner validStore { 
        address manager = store.getSeigManager();
        require( manager != address(0)); 
        seigManager = SeigManagerI(manager); 
    }  
    function setDepositManager(address _depositManager)  public onlyOwner validStore { 
        store.setDepositManager(_depositManager); 
    }   

    // 
    function applyCommitteeByOperator() public validStore validDAOCommittee validSeigManager returns (uint) {
        (bool exist , uint256 _layerIndex  ) = store.existLayerByOperator(msg.sender);
        require(exist,'not exist layer');
        return applyCommittee(_layerIndex);
    } 
    
    function applyCommittee(uint256 _index) public validStore validDAOCommittee validSeigManager returns (uint) {
        (bool exist ,   ) = store.existLayerByOperator(msg.sender);
        require( exist ,'you are not operator'); 
         
        (address layer2,address operator, string memory name,  ) = store.detailedLayer2s(_index) ;
         
        uint256 totalbalance = totalSupplyLayer2s(layer2) ;
         
        uint applyResultCode = daoCommittee.applyCommittee(_index, layer2, operator,name ,totalbalance );
         
        if(applyResultCode == uint(ApplyResult.SUCCESS)){
            emit ApplyCommitteeSuccess(msg.sender, _index, operator, totalbalance, applyResultCode); 
        }else{
            emit ApplyCommitteeFail(msg.sender, _index, operator, totalbalance, applyResultCode); 
        }
        

        return applyResultCode;
    } 
    
    //  need to check 
    function createCommitteeLayer2( string memory name) public validSeigManager validLayer2Registry validCommitteeL2Factory returns (uint256 layerIndex){
        address operator = msg.sender;
        require( operator!= address(0),'operator is zero');  
        (bool exist ,   ) = store.existLayerByOperator(operator); 
        require( !exist,'operator already registerd'); 
          
        //  create CommitteeL2 , set seigManager 
        address layer = committeeL2Factory.deploy(operator, address(seigManager) , address(layer2Registry));
        require( layer!= address(0),'deployed layer is zero'); 
        
        //register CommitteeL2 to registry : registerAndDeployCoinage or register 
        // I don't know ... error .. 
        //require ( layer2Registry.registerAndDeployCoinage(layer, address(seigManager) ) ); 
        //require ( CommitteeL2I(layer).registerAndDeployCoinage() , ' CommitteeL2 registerAndDeployCoinage fail '  );
        (bool success,) = address(layer2Registry).delegatecall(abi.encodePacked(bytes4(keccak256("registerAndDeployCoinage(address,address)")),layer, address(seigManager)));
        require(success,'layer registerAndDeployCoinage fail');
        
        // register.store 
        layerIndex = store.registerLayer2( layer,operator,name) ; 
        require( layerIndex > 0);
    
        emit CommitteeLayer2Created(msg.sender, layerIndex, layer, name); 
    
        return layerIndex; 
    }  
         
    
    function updateSeigniorage(address _layer)  public validStore returns (bool){ 
        (bool exist , uint256 layerId  ) = store.existLayerByLayer(_layer); 
        require(exist ,'not exist layer address');
        CommitteeL2I(_layer).updateSeigniorage();

        emit CommitteeLayer2UpdateSeigniorage(msg.sender, layerId, _layer); 
    }
    
    function numLayer2s() public view returns (uint256 ){ return store.getNumLayer2s(); } 
    
    function totalSupplyLayer2s(address _layer) public view validSeigManager returns (uint256 totalsupply){  
        address coinagelayer = seigManager.coinages(_layer);
        require( coinagelayer!= address(0),'coinagelayer is zero');
        return IERC20(coinagelayer).totalSupply();
    }
    
    function balanceOfLayer2s(address _layer) public view validSeigManager returns (uint256 amount){ 
         
        address coinagelayer = seigManager.coinages(_layer);
        require( coinagelayer!= address(0),'coinagelayer is zero');
        return IERC20(coinagelayer).balanceOf(msg.sender);
    }

    //
    function getTON() public view returns (address) { return store.getTON();}

    function getDaoCommittee() public view returns (address) { return store.getDaoCommittee();}
    function getLayer2Registry() public view returns (address) { return store.getLayer2Registry();}
    function getDepositManager() public view returns (address) { return store.getDepositManager();}
    function getSeigManager() public view returns (address) { return store.getSeigManager();}
    function getCommitteeL2Factory() public view returns (address) { return store.getCommitteeL2Factory();}
    
    
}

