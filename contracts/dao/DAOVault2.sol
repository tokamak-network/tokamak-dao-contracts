// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "../../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract DAOVault2 is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    IERC20 public ton;
    IERC20 public wton;
    
    //////////////////////////////
    // Events
    //////////////////////////////
    
    event Claimed(address indexed token, address indexed to, uint256 indexed amount);
    event Approved(address indexed token, address indexed to, uint256 indexed amount);

    constructor(address _ton, address _wton) public {
        ton = IERC20(_ton);
        wton = IERC20(_wton);
    }

    function setTON(address _ton) external onlyOwner {
        ton = IERC20(_ton);
    }

    function setWTON(address _wton) external onlyOwner {
        wton = IERC20(_wton);
    }

    function approveTON(address _to, uint256 _amount) public onlyOwner {
        ton.safeApprove(_to, _amount);
        emit Approved(address(ton), _to, _amount);
    }

    function approveWTON(address _to, uint256 _amount) public onlyOwner {
        wton.safeApprove(_to, _amount);
        emit Approved(address(wton), _to, _amount);
    }

    function approveERC20(address _token, address _to, uint256 _amount) public onlyOwner {
        IERC20(_token).safeApprove(_to, _amount);
        emit Approved(address(_token), _to, _amount);
    }

    function claimTON(address _to, uint256 _amount) public onlyOwner {
        require(ton.balanceOf(address(this)) >= _amount, "DAOVault2: not enough balance");
        ton.safeTransfer(_to, _amount);
        emit Claimed(address(ton), _to, _amount);
    }

    function claimWTON(address _to, uint256 _amount) public onlyOwner {
        require(wton.balanceOf(address(this)) >= _amount, "DAOVault2: not enough balance");
        wton.safeTransfer(_to, _amount);
        emit Claimed(address(wton), _to, _amount);
    }

    function claimERC20(address _token, address _to, uint256 _amount) public onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "DAOVault2: not enough balance");
        IERC20(_token).safeTransfer(_to, _amount);
        emit Claimed(address(wton), _to, _amount);
    }
}
