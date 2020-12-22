// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface CommitteeL2I {
    function setSeigManager(address _seigMan) external;
    function setLayer2Registry(address _layer2Registry) external;
    function updateSeigniorage() external returns (bool);
    function registerAndDeployCoinage() external returns (bool);
    function isCommitteeLayer2() external view returns (bool);
    function operatorAndOwner() external view returns (address, address);
}
