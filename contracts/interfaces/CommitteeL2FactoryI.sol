// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface CommitteeL2FactoryI {
  function deploy(address _operator, address _seigManager, address _layer2Registry) external returns (address);
}
