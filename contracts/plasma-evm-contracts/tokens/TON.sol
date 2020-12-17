// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../../shared/Ownabled.sol";
import { ERC165Checker } from "../../../node_modules/@openzeppelin/contracts/introspection/ERC165Checker.sol";
import { ERC20 } from "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
  
/**
 * @dev Current implementations is just for testing seigniorage manager.
 */
contract TON is Ownabled, ERC20, ERC20Burnable {
    constructor() public ERC20("Tokamak Network Token", "TON") {}

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }
}