// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/OwnableAdmin.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../roles/DAOActivityFeeManagerRole.sol";

contract DAOActivityFeeManager is OwnableAdmin , DAOActivityFeeManagerRole {
    
    using SafeMath for uint256; 
    address public ton ;  
    address public daoVault ;   
     
    uint256 public activityfeePerVoting;
    
    mapping (address => ActivityFee) public activityfees;
    mapping (uint256 => uint256) public agendaActivityfees; // agenda's activity fees 
    mapping (uint256 => mapping(address=>bool)) public agendaVoters;
    uint256 public totalActivityFees; 
    
    struct ActivityFee {
        uint256 total;
        uint256 remain;
        uint256 claim;
    }
     
    constructor(address _ton) public {  
       
        activityfeePerVoting = 0; 
        ton = _ton;
    }
            
    function setActivityfeePerVoting(uint256 _activityfeePerVoting)  onlyAdminOrOwner public { 
        activityfeePerVoting = _activityfeePerVoting;
    }  
     
    function setDaoVault(address _daoVault)  onlyAdminOrOwner public {
        require(_daoVault != address(0)); 
        daoVault = _daoVault;
    } 
      
     
    function getTON() public view returns (address) { return ton;}
     
    function getDaoVault() public view returns (address) { return daoVault;} 
    
    
    function getActivityfees(address user) public view returns (uint256 total, uint256 remain,uint256 claim) { 
        if( activityfees[user].total > 0 ) { return ( activityfees[user].total, activityfees[user].remain, activityfees[user].claim ); } 
        else { return(0,0,0); } 
    }   
    
    function payActivityFees(uint256 _AgendaID , uint256 fees ) onlyOwner public returns ( bool )  
    { 
         
        if( fees > 0 ){ 
            agendaActivityfees[_AgendaID] = fees; 
        } 
        
        return true;
    }    
    
    function claim(address user, uint256 amount) onlyOwner  public  returns ( uint256 )  
    { 
       ActivityFee storage af = activityfees[user] ;
       
       if( af.remain >= amount ){
           af.remain = af.remain.sub( amount );
           af.claim = af.claim.add( amount );
           return amount;
       } else {
           return 0;
       }  
    } 
    
    
    function getActivityfeePerVoting()  public view returns ( uint256 )  
    { 
        return activityfeePerVoting;
    }   
    
    /*
    function claim(uint256 amount)  public  returns (uint256 ){ 
        address dauvault = store.getDaoVault();
        require( dauvault != address(0)  ,'dauvault is zreo') ;
        
        address activityFeeManager = store.getActivityFeeManager();
        require( activityFeeManager != address(0)  ,'activityFeeManager is zreo') ;
        
        require( amount > 0 ,'amount is zreo') ;
        (uint256 total, uint256 remain, ) = DAOActivityFeeManagerI(activityFeeManager).getActivityfees(msg.sender); 
        require(total >= amount && remain >= amount ,'lack of remain') ;
        
        uint256  storeclaim = DAOActivityFeeManagerI(activityFeeManager).claim(msg.sender, amount) ;
        require(amount == storeclaim ,'store claim fail' ) ;
         
        // from daovault to sender  
        (bool success, bytes memory execresult) = address(dauvault).call(abi.encodeWithSignature("claimCommittee(address,uint256)",msg.sender,amount));
        require(success,'fail to claimCommittee');
        uint256 callclaimamount = abi.decode(execresult, (uint256));  
        require(callclaimamount > 0,'callclaimamount is zero' );
        
        emit ClaimActivityFees(msg.sender, amount , callclaimamount, storeclaim );
        
        return callclaimamount;
    }   
    
    function getActivityfees() public view returns (uint256 total, uint256 remain, uint256 claimdone) {
        address activityFeeManager = store.getActivityFeeManager();
        require( activityFeeManager != address(0)  ,'activityFeeManager is zreo') ;
        
        return DAOActivityFeeManagerI(activityFeeManager).getActivityfees(msg.sender);
    }  
    */
    
     function calculateActivityFees()  public view returns ( uint256 )  
    {    
        uint256 uintFees = getActivityfeePerVoting();
        
         if( uintFees > 0){
            return uintFees;
        } else{
            return 0;
        }
    }  
}