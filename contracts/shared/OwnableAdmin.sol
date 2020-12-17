// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface OwnableTarget {
  function renounceOwnership() external;
  function transferOwnership(address newOwner) external;
}

contract OwnableAdmin {
    address public owner;
    address public admin;

    constructor() public {
        owner = msg.sender;
        admin = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    modifier onlyAdminAndOwner() {
        require(msg.sender == owner || msg.sender == admin );
        _;
    }
    function transferOwnership(address newOwner) public onlyAdminAndOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
    function transferAdmin(address newAdmin) public onlyAdmin {
        if (newAdmin != address(0)) {
            admin = newAdmin;
        }
    }
    function transfertargetOwnership(address target, address newOwner) public onlyOwner {
        OwnableTarget(target).transferOwnership(newOwner);
    }
}