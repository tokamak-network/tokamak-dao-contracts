// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../lib/Roles.sol";

contract DAOAgendaManagerRole {
    using Roles for Roles.Role;

    event AgendaManagerAdded(address indexed account);
    event AgendaManagerRemoved(address indexed account);

    Roles.Role private _agendaManagers;

    constructor () internal {
        _addAgendaManager(msg.sender);
    }

    modifier onlyAgendaManager() {
        require(isAgendaManager(msg.sender));
        _;
    }

    function isAgendaManager(address account) public view returns (bool) {
        return _agendaManagers.has(account);
    }

    function addAgendaManager(address account) public onlyAgendaManager {
        _addAgendaManager(account);
    }

    function renounceAgendaManager() public {
        _removeAgendaManager(msg.sender);
    }

    function _addAgendaManager(address account) internal {
        _agendaManagers.add(account);
        emit AgendaManagerAdded(account);
    }

    function _removeAgendaManager(address account) internal {
        _agendaManagers.remove(account);
        emit AgendaManagerRemoved(account);
    }
}
