// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ICandidate {
    function setSeigManager(address _seigMan) external;
    //function setLayer2Registry(address _layer2Registry) external;
    function updateSeigniorage() external returns (bool);
    //function registerAndDeployCoinage() external returns (bool);
    function isCommitteeLayer2() external view returns (bool);
    function candidateAndOwner() external view returns (address, address);
    function isCandidateContract() external view returns (bool);
    function operator() external view returns (address); 
}
