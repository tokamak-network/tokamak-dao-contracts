// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/Ownabled.sol";
import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { IDAOElection } from "../interfaces/IDAOElection.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract DAOVault2 is Ownabled {
    using SafeMath for uint256;
    
    address public ton;
    address public daoCommittee;
    address public daoActivityFeeManager;
    
    //////////////////////////////
    // Modifiers
    //////////////////////////////
    
    modifier onlyDAOCommittee() {
        require(ton != address(0) && daoCommittee != address(0) && msg.sender == daoCommittee, "DAOVault2: not daoCommittee");
        _;
    }
    
    modifier onlyDAOActivityFeeManager() {
        require(ton != address(0) && daoActivityFeeManager != address(0) && msg.sender == daoActivityFeeManager, "DAOVault2: not daoActivityFeeManager");
        _;
    }
    
    //////////////////////////////
    // Events
    //////////////////////////////
    
    event TransferCommittee(address from, uint256 amount);
    event TransferActivityFeeManager(address from, uint256 amount, bool result);
    event TransferErc20(address token, address from, uint256 amount);

    constructor(address _ton) public {
        ton = _ton;
    }

    /*
    function setTON(address _ton) external onlyOwner {
        ton = _ton;
    }*/
    function setDaoCommittee(address _addr) public onlyOwner {
        daoCommittee = _addr;
    }
     
    function setDAOActivityFeeManager(address _addr) public onlyOwner {
        daoActivityFeeManager = _addr;
    }

    function approveTonDao(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoCommittee, amount);
        approveTon(daoActivityFeeManager, amount);
    }
    
    function approveTonDaoCommittee(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoCommittee, amount);
    }
    
    function approveTonDAOActivityFeeManager(uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        approveTon(daoActivityFeeManager, amount);
    }
    
    function approveTon(address to, uint256 amount) public onlyOwner {
        require(ton != address(0), "DAOVault2: ton address is zero");
        IERC20(ton).approve(to , amount);
    }
    
    function claimCommittee(address committee, uint256 amount) external onlyDAOCommittee returns (uint256) {
        require(IERC20(ton).balanceOf(address(this)) >= amount, "DAOVault2: not enough balance");
        require(IERC20(ton).transfer(committee,amount), "DAOVault2: failed to transfer");
        emit TransferCommittee(committee, amount);
        return amount;
    }
    
    function claimActivityFeeManager(address user, uint256 amount) external onlyDAOActivityFeeManager returns (bool) {
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
