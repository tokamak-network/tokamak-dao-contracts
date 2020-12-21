// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/OwnableAdmin.sol";
import { CommitteeL2 } from "./CommitteeL2.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOElectionStore is OwnableAdmin{
    using SafeMath for uint256;   
    
    address public daoCommittee ;   
    address public layer2Registry ;  
    //address public depositManager ;  
    address public seigManager ; 
    address public committeeL2Factory ;  
    
    address public ton ; 
    uint256 public numLayer2s; 
    Layer[] public layer2s; 

    mapping (address => uint256) public layer2Id; 
    mapping (address => uint256) public layer2IdByLayer; 
    mapping (address => bool) public layer2Valid; 
    
    struct Layer {
        address layer2;
        address operator;
        string name;
        uint since; 
    }
    
    constructor(address _ton) public { 
        ton = _ton;
    }  
   
    function setDaoCommittee(address _daoCommittee)  onlyOwner public {
        require(_daoCommittee != address(0), "DAOElectionStore: committee address is zero");
        daoCommittee = _daoCommittee;
    }  
    
    function seLayer2Registry(address _layer2Registry)  onlyOwner public {
        require(_layer2Registry != address(0), "DAOElectionStore: registry address is zero");
        layer2Registry = _layer2Registry;
    }  
    /* 
    function setDepositManager(address _depositManager)  onlyOwner public {
        require(_depositManager != address(0)); 
        depositManager = _depositManager;
    }  
    */
    function setSeigManager(address _seigManager)  onlyOwner public {
        require(_seigManager != address(0), "DAOElectionStore: SeigManager is zero");
        seigManager = _seigManager;
    }  
    
    function setCommitteeL2Factory(address _committeeL2Factory)  onlyOwner public {
        require(_committeeL2Factory != address(0), "DAOElectionStore: factory address is zero");
        committeeL2Factory = _committeeL2Factory;
    }   
    
    function existLayerByOperator(address _operator) public view returns (bool exist , uint256 _layerId ){
       if( layer2Id[_operator] > 0 ) return (true,layer2Id[_operator]);
       else return (false,0); 
    } 
    
    function existLayerByLayer(address _layer) public view returns (bool exist , uint256 _layerId){
       if( layer2IdByLayer[_layer] > 0 ) return (true,layer2IdByLayer[_layer]);
       else return (false,0); 
    } 
    
    function registerLayer2(address _layer, address _operator, string memory _name) onlyOwner public returns (uint256 ) {
        
        require(_layer!=address(0) && _operator != address(0), "DAOElectionStore: layer or operator is zero address");
        if( layer2s.length == 0 ) layer2s.push( Layer(address(0),address(0), '', now) );
        
        if(layer2Id[_operator] !=0 ) { 
            return 0;
            
        } else{ 
            Layer memory la = Layer(_layer,_operator, _name, now);
            layer2s.push(la);  
            uint256 layerIndex = layer2s.length;
            layer2Id[_operator] = layerIndex; 
            layer2IdByLayer[_layer] = layerIndex; 
            numLayer2s = layer2s.length;
            
            return layerIndex;
        }
        
    }   

    function getTON() public view returns (address) { return ton;}
    function getDaoCommittee() public view returns (address) { return daoCommittee;}
    function getLayer2Registry() public view returns (address) { return layer2Registry;}
    
    //function getDepositManager() public view returns (address) { return depositManager;}
    function getSeigManager() public view returns (address) { return seigManager;}
    function getCommitteeL2Factory() public view returns (address) { return committeeL2Factory;}
    function getNumLayer2s() public view returns (uint256 ){ return numLayer2s; }
    
    
    function detailedLayer2s(uint256 _index) public view returns (address layer2,address operator, string memory name, uint since){ 
        require(_index < numLayer2s, "DAOElectionStore: invalid _index");
        return ( layer2s[_index].layer2 , layer2s[_index].operator ,  layer2s[_index].name ,  layer2s[_index].since );
    }
    
    function detailedLayer2sByOperator(address _operator) public view returns (address layer2,address operator, string memory name, uint since){ 
        
        uint256 _index = layer2Id[_operator];
        return detailedLayer2s(  _index);  
    }
    function detailedLayer2sByLayer(address _layer) public view returns (address layer2,address operator, string memory name, uint since){ 
        
        uint256 _index = layer2IdByLayer[_layer];
        return detailedLayer2s(  _index);  
    }
     
}