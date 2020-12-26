// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IDAOActivityRewardManager {
    function getCreateAgendaFees() external view returns (uint256);
    //function getTON() external view returns (address);
    function getDaoVault() external view returns (address);
    function getActivityfees(address user) external view returns (uint256 total, uint256 remain, uint256 claim);
    function payActivityFees(uint256 _AgendaID, uint256 fees) external returns (bool);
    function claim(address user, uint256 amount) external returns (uint256);
    function getActivityfeePerVoting() external view returns (uint256);
    function calculateActivityFees() external view returns (uint256);
}
