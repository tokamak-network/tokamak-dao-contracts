// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ICandidateFactory {
    function deploy(
        address _candidate,
        address _layer2,
        string memory _name,
        address _seigManager,
        address _committee
    )
        external
        returns (address);
}
