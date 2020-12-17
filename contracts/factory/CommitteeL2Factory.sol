// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "../shared/Ownabled.sol";
import { CommitteeL2 } from "../dao/CommitteeL2.sol";
import { CommitteeL2FactoryI } from "../interfaces/CommitteeL2FactoryI.sol";

contract CommitteeL2Factory is CommitteeL2FactoryI, Ownabled {
   
   // layer2 deploy... make coinages 
  function deploy(address _operator, address _seigManager) onlyOwner external override returns (address) {
    CommitteeL2 c = new CommitteeL2(_operator);
    c.setSeigManager(_seigManager); 
    return address(c);
  }
}
