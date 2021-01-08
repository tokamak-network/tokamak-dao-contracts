// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract DAOVault2 is Ownable {
    using SafeMath for uint256;
    
    address public ton;
    address public daoCommittee;
    address public daoActivityRewardManager;
    
    //////////////////////////////
    // Modifiers
    //////////////////////////////
    
    modifier onlyDAOCommittee() {
        require(
            msg.sender == daoCommittee,
            "DAOVault2: not daoCommittee"
        );
        _;
    }
    
    modifier onlyDAOActivityRewardManager() {
        require(
            daoActivityRewardManager != address(0) &&
            msg.sender == daoActivityRewardManager,
            "DAOVault2: not daoActivityRewardManager"
        );
        _;
    }
    
    //////////////////////////////
    // Events
    //////////////////////////////
    
    event Claimed(address to, uint256 amount);
    event TransferActivityFeeManager(address from, uint256 amount, bool result);
    event TransferErc20(address token, address from, uint256 amount);

    constructor(address _ton) public {
        ton = _ton;
    }

    function setTON(address _ton) external onlyOwner {
        ton = _ton;
    }

    function setDaoCommittee(address _addr) public onlyOwner {
        daoCommittee = _addr;
    }
     
    function setDAOActivityFeeManager(address _addr) public onlyOwner {
        daoActivityRewardManager = _addr;
    }

    function approveTonDao(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoCommittee, amount);
        approveTon(daoActivityRewardManager, amount);
    }
    
    function approveTonDaoCommittee(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoCommittee, amount);
    }
    
    function approveTonDAOActivityFeeManager(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoActivityRewardManager, amount);
    }
    
    function approveTon(address to, uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        IERC20(ton).approve(to , amount);
    }
    
    function claim(address to, uint256 amount) external onlyDAOCommittee {
        require(IERC20(ton).balanceOf(address(this)) >= amount, "DAOVault2: not enough balance");
        require(IERC20(ton).transfer(to, amount), "DAOVault2: failed to transfer");
        emit Claimed(to, amount);
    }
    
    function claimActivityFeeManager(address user, uint256 amount) external onlyDAOActivityRewardManager returns (bool) {
        if (IERC20(ton).balanceOf(address(this)) > amount) {
            bool res = IERC20(ton).transfer(user,amount);
            emit TransferActivityFeeManager(user, amount, res);
            return res;
        } else {
            emit TransferActivityFeeManager(user, amount, false);
            return false;
        }
    }
    
    function transfer(address erc20token, address to, uint256 amount) external onlyOwner {
        require(erc20token != address(0) && amount > 0, "DAOVault2: invalid parameter");
        require(IERC20(erc20token).transfer(to,amount), "DAOVault2: failed to transfer");
        emit TransferErc20(erc20token, to, amount);
    }
}
