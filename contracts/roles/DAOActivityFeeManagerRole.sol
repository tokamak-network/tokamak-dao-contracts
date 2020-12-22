// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../lib/Roles.sol";

contract DAOActivityFeeManagerRole {
    using Roles for Roles.Role;

    event ActivityFeeManagerAdded(address indexed account);
    event ActivityFeeManagerRemoved(address indexed account);

    Roles.Role private _activityFeeManagers;

    constructor () {
        _addActivityFeeManager(msg.sender);
    }

    modifier onlyActivityFeeManager() {
        require(isActivityFeeManager(msg.sender));
        _;
    }

    function isActivityFeeManager(address account) public view returns (bool) {
        return _activityFeeManagers.has(account);
    }

    function addActivityFeeManager(address account) public onlyActivityFeeManager {
        _addActivityFeeManager(account);
    }

    function renounceActivityFeeManager() public {
        _removeActivityFeeManager(msg.sender);
    }

    function _addActivityFeeManager(address account) internal {
        _activityFeeManagers.add(account);
        emit ActivityFeeManagerAdded(account);
    }

    function _removeActivityFeeManager(address account) internal {
        _activityFeeManagers.remove(account);
        emit ActivityFeeManagerRemoved(account);
    }
}
