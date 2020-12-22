// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/Ownabled.sol";
import "./StorageStateCommittee.sol";

contract DAOCommitteeProxy is StorageStateCommittee, Ownabled {
    address public _implementation;
    bool public pauseProxy;

    event Upgraded(address indexed implementation);
     
    constructor(DAOCommitteeStore _storage) {
        store = _storage;
    }

    function setProxyPause(bool _pause) onlyOwner public {
        pauseProxy = _pause;
    }

    function setProxyStore(address payable _storeAddress) onlyOwner public {
        require(_storeAddress != address(0), "DAOCommitteeProxy: store address is zero");
        store = DAOCommitteeStore(_storeAddress);
    }

    function setProxyAgendaManager(address _addr) onlyOwner validStore public {
        require(_addr != address(0), "DAOCommitteeProxy: agendamanager address is zero");
        agendaManager = DAOAgendaManager(_addr);
        store.setAgendaManager(_addr);
    }

    function setProxyAactivityfeeManager(address _addr) onlyOwner validStore public {
        require(_addr != address(0), "DAOCommitteeProxy: ActivityFeeManager address is zero");
        activityfeeManager = DAOActivityFeeManager(_addr);
        store.setActivityFeeManager(_addr);
    }

    //--
    function setProxyElection(address _addr) onlyOwner public {
        require(_addr != address(0), "DAOCommitteeProxy: election address is zero");
        election = DAOElectionStore(_addr);
    }

    function setProxyCommitteeL2Factory(address _addr) onlyOwner validElection public {
        require(_addr != address(0), "DAOCommitteeProxy: factory address is zero");
        committeeL2Factory = CommitteeL2FactoryI(_addr);
        election.setCommitteeL2Factory(_addr);
    }

    function setProxyLayer2Registry(address _addr) onlyOwner validElection public {
        require(_addr != address(0), "DAOCommitteeProxy: registry address is zero");
        layer2Registry = Layer2RegistryI(_addr);
        election.setLayer2Registry(_addr);
    }

    function setProxySeigManager(address _addr) onlyOwner validElection public {
        require(_addr != address(0), "DAOCommitteeProxy: SeigManager address is zero");
        seigManager = SeigManagerI(_addr);
        election.setSeigManager(_addr);
    }
    //--

    function upgradeTo(address impl) public onlyOwner {
        require(_implementation != impl, "DAOCommitteeProxy: implementation address is zero");
        _implementation = impl;
        emit Upgraded(impl);
    }

    function implementation() public view returns (address) {
        return _implementation;
    }

    fallback() external {
        _fallback();
    }

    function _fallback() internal {
        address _impl = implementation();
        require(_impl != address(0) && pauseProxy == false, "DAOCommitteeProxy: impl is zero OR proxy is false");

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
