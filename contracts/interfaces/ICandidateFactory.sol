// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ICandidateFactory {
    function deploy(address _candidate, string memory _name, address _seigManager, address _layer2registry) external returns (address);
}
