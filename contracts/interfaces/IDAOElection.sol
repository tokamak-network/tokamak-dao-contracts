// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IDAOElection  {
    
    // owner 
    function setStore(address _store)  external ;
    function setDaoCommittee()  external ;
    function setCommitteeL2Factory()  external  ;
    function setLayer2Registry()  external ;
    function setSeigManager()  external  ; 
    
    //-- layer operator   
    function applyCommitteeByOperator() external returns (uint) ;
    function applyCommittee(uint256 _index) external  returns (uint) ;
    
     //--anybody  
    function createCommitteeLayer2( string calldata name) external  returns (uint256 layerIndex , address layer , address operator );
    function updateSeigniorage(address _layer)  external  returns (bool);    
    
    // view functions 
    function numLayer2s() external view returns (uint256 );
    function totalSupplyLayer2s(address _layer) external view  returns (uint256 totalsupply);  
    function balanceOfLayer2s(address _layer) external view  returns (uint256 amount); 
        
           
}