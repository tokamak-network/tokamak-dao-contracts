// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "../../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { IWTON } from "../interfaces/IWTON.sol";
import { IDAOVault } from "../interfaces/IDAOVault.sol";

contract DAOVault is Ownable, IDAOVault {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    IERC20 public ton;
    IERC20 public wton;
    
    //////////////////////////////
    // Events
    //////////////////////////////
    
    event Claimed(address indexed token, address indexed to, uint256 indexed amount);
    event Approved(address indexed token, address indexed to, uint256 indexed amount);

    constructor(address _ton, address _wton) {
        require(_ton != address(0)
            || _wton != address(0),
            "DAOVault: input is zero"
        );
        ton = IERC20(_ton);
        wton = IERC20(_wton);
    }

    /// @notice Set TON address
    /// @param _ton TON address
    function setTON(address _ton) external override onlyOwner {
        require(_ton != address(0), "DAOVault: input is zero");
        ton = IERC20(_ton);
    }

    /// @notice Set WTON address
    /// @param _wton WTON address
    function setWTON(address _wton) external override onlyOwner {
        require(_wton != address(0), "DAOVault: input is zero");
        wton = IERC20(_wton);
    }

    /// @notice Approves TON to specific address
    /// @param _to Address to be approved
    /// @param _amount Approving TON amount
    function approveTON(address _to, uint256 _amount) external override onlyOwner {
        ton.safeApprove(_to, _amount);
        emit Approved(address(ton), _to, _amount);
    }

    /// @notice Approves WTON to specific address
    /// @param _to Address to be approved
    /// @param _amount Approving WTON amount
    function approveWTON(address _to, uint256 _amount) external override onlyOwner {
        wton.safeApprove(_to, _amount);
        emit Approved(address(wton), _to, _amount);
    }

    /// @notice Approves ERC20 token to specific address
    /// @param _token Token address
    /// @param _to Address to be approved
    /// @param _amount Approving ERC20 token amount
    function approveERC20(address _token, address _to, uint256 _amount) external override onlyOwner {
        IERC20(_token).safeApprove(_to, _amount);
        emit Approved(address(_token), _to, _amount);
    }

    /// @notice Transfers TON to specific address
    /// @param _to Address to receive
    /// @param _amount Transfer TON amount
    function claimTON(address _to, uint256 _amount) external override onlyOwner {
        uint256 tonBalance = ton.balanceOf(address(this));
        uint256 wtonBalance = wton.balanceOf(address(this));
        require(
            tonBalance.add(_toWAD(wtonBalance)) >= _amount,
            "DAOVault: not enough balance"
        );

        uint256 tonAmount = _amount;
        if (tonBalance < _amount) {
            tonAmount = tonBalance;
            uint256 wtonAmount = _toRAY(_amount.sub(tonBalance));

            require(
                IWTON(address(wton)).swapToTONAndTransfer(_to, wtonAmount),
                "DAOVault: failed to swap and transfer wton"
            );
        }

        ton.safeTransfer(_to, tonAmount);
        emit Claimed(address(ton), _to, _amount);
    }

    /// @notice Transfers WTON to specific address
    /// @param _to Address to receive
    /// @param _amount Transfer WTON amount
    function claimWTON(address _to, uint256 _amount) external override onlyOwner {
        uint256 tonBalance = ton.balanceOf(address(this));
        uint256 wtonBalance = wton.balanceOf(address(this));
        require(
            _toRAY(tonBalance).add(wtonBalance) >= _amount,
            "DAOVault: not enough balance"
        );

        uint256 wtonAmount = _amount;
        if (wtonBalance < _amount) {
            uint256 tonAmount = _toWAD(_amount.sub(wtonBalance));
            wtonAmount = wtonBalance;

            ton.safeApprove(address(wton), tonAmount);
            require(
                IWTON(address(wton)).swapFromTONAndTransfer(_to, tonAmount),
                "DAOVault: failed to swap and transfer ton"
            );
        }

        wton.safeTransfer(_to, wtonAmount);
        emit Claimed(address(wton), _to, _amount);
    }

    /// @notice Transfers ERC20 token to specific address
    /// @param _to Address to receive
    /// @param _amount Transfer ERC20 token amount
    function claimERC20(address _token, address _to, uint256 _amount) external override onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "DAOVault: not enough balance");
        IERC20(_token).safeTransfer(_to, _amount);
        emit Claimed(address(wton), _to, _amount);
    }

    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }

    function _toWAD(uint256 v) internal pure returns (uint256) {
        return v / 10 ** 9;
    }
}
