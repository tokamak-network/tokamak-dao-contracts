// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/Ownabled.sol";
import "./StorageStateCommittee.sol"; 

contract DAOCommitteeProxy is StorageStateCommittee , Ownabled { 

  address public _implementation;
  bool public pauseProxy;
  
  event Upgraded(address indexed implementation);
     
  constructor(DAOCommitteeStore _storage  ) public { 
    store = _storage; 
    pauseProxy = true;
  } 
  
  function setProxyPause(bool _pause) onlyOwner public {
      pauseProxy = _pause; 
  }
  
  function setProxyStore(address payable _storeAddress) onlyOwner public {
      require(_storeAddress != address(0)); 
      store = DAOCommitteeStore(_storeAddress); 
  }
  function setProxyAgendaManager(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      agendaManager = DAOAgendaManager(_addr); 
      store.setAgendaManager(_addr);
  }
  
  function setProxyAactivityfeeManager(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      activityfeeManager = DAOActivityFeeManager(_addr); 
      store.setActivityFeeManager(_addr);
  }

  function upgradeTo(address impl) public onlyOwner {
    require(_implementation != impl);
    _implementation = impl;
    emit Upgraded(impl);
  }  
  
  function implementation() public view returns (address) {
    return _implementation;
  } 
  
  fallback () external {
        _fallback();
  }
    
  function _fallback()  internal{
    address _impl = implementation();
    require(_impl != address(0) && pauseProxy==false);
    /*bytes memory data = msg.data;
     
    assembly {
       
      let result := delegatecall(gas(), _impl, add(data, 0x20), mload(data), 0, 0)
      
      
      let size := returndatasize
      let ptr := mload(0x40)
      returndatacopy(ptr, 0, size)
      
      
      // Copy the returned data.
      returndatacopy(0, 0, returndatasize())
            
      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
      
    }*/
    
    assembly {
        // Copy msg.data. We take full control of memory in this inline assembly
        // block because it will not return to Solidity code. We overwrite the
        // Solidity scratch pad at memory position 0.
        calldatacopy(0, 0, calldatasize())

        // Call the implementation.
        // out and outsize are 0 because we don't know the size yet.
        let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

        // Copy the returned data.
        returndatacopy(0, 0, returndatasize())

        switch result
        // delegatecall returns 0 on error.
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
  }

}