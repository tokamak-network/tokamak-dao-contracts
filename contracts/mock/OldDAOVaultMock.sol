// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import { Ownable } from "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { IWTON } from "../interfaces/IWTON.sol";

contract OldDAOVaultMock is Ownable {
    using SafeMath for uint256;

    IWTON public wton;
    uint256 public claimEnableTime; // 2021-01-01

    modifier onlyClaimEnable() {
      require(block.timestamp >= claimEnableTime, "not possible time");
      _;
    }

    constructor(address wtonAddress, uint256 claimEnableTime_) public {
        wton = IWTON(wtonAddress);
        claimEnableTime = claimEnableTime_;
    }

    function claim(address dao) external onlyOwner onlyClaimEnable {
      wton.swapToTONAndTransfer(dao, wton.balanceOf(address(this)));
    }
}
