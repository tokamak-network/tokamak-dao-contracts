// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../shared/Ownabled.sol";
import "./StorageStateElection.sol"; 

contract DAOElectionProxy is StorageStateElection , Ownabled { 

  address public _implementation;
  bool public pauseProxy;
  
  event Upgraded(address indexed implementation);
     
  constructor(DAOElectionStore _storage) public { 
    store = _storage; 
    pauseProxy = true;
  } 
  
  function setProxyPause(bool _pause) onlyOwner public {
      pauseProxy = _pause; 
  }
   
  function setProxyStore(address payable _storeAddress) onlyOwner public {
      require(_storeAddress != address(0)); 
      store = DAOElectionStore(_storeAddress); 
  }
  function setProxyDaoCommittee(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      daoCommittee = IDAOCommittee(_addr); 
      store.setDaoCommittee(_addr);
  }
  function setProxyCommitteeL2Factory(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      committeeL2Factory = CommitteeL2FactoryI(_addr); 
      store.setCommitteeL2Factory(_addr);
  } 
  function setProxyLayer2Registry(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      layer2Registry = Layer2RegistryI(_addr); 
      store.seLayer2Registry(_addr);
  } 
  function setProxySeigManager(address _addr) onlyOwner validStore public {
      require(_addr != address(0)); 
      seigManager = SeigManagerI(_addr); 
      store.setSeigManager(_addr);
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
  
  function _fallback() internal {
    address _impl = implementation();
    require(_impl != address(0) && pauseProxy==false);
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