// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "./StorageStateCommittee.sol";
//import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import { ERC165 } from "../../node_modules/@openzeppelin/contracts/introspection/ERC165.sol";

contract DAOCommitteeProxy is StorageStateCommittee, AccessControl, ERC165 {
    address public _implementation;
    bool public pauseProxy;

    event Upgraded(address indexed implementation);

    modifier onlyOwner() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "DAOCommitteeProxy: msg.sender is not an admin");
        _;
    }
     
    constructor(
        address _ton,
        address _impl,
        address _seigManager,
        address _layer2Registry,
        address _agendaManager,
        address _candidateFactory,
        //address _activityRewardManager,
        address _daoVault
    )
    {
        ton = _ton;
        _implementation = _impl;
        seigManager = ISeigManager(_seigManager);
        layer2Registry = ILayer2Registry(_layer2Registry);
        agendaManager = IDAOAgendaManager(_agendaManager);
        candidateFactory = ICandidateFactory(_candidateFactory);
        //activityRewardManager = IDAOActivityRewardManager(_activityRewardManager);
        daoVault = IDAOVault2(_daoVault);
        //maxMember = 3;
        quorum = 2;
        activityRewardPerSecond = 1e18;

        _registerInterface(bytes4(keccak256("onApprove(address,address,uint256,bytes)")));
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, address(this));
    }

    function setProxyPause(bool _pause) onlyOwner public {
        pauseProxy = _pause;
    }

    /*function setProxyStore(address payable _storeAddress) onlyOwner public {
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

    function setProxyCommitteeL2Factory(address _addr) onlyOwner public {
        require(_addr != address(0), "DAOCommitteeProxy: factory address is zero");
        committeeL2Factory = CommitteeL2FactoryI(_addr);
        election.setCommitteeL2Factory(_addr);
    }

    function setProxyLayer2Registry(address _addr) onlyOwner public {
        require(_addr != address(0), "DAOCommitteeProxy: registry address is zero");
        layer2Registry = Layer2RegistryI(_addr);
        election.setLayer2Registry(_addr);
    }

    function setProxySeigManager(address _addr) onlyOwner public {
        require(_addr != address(0), "DAOCommitteeProxy: SeigManager address is zero");
        seigManager = SeigManagerI(_addr);
        election.setSeigManager(_addr);
    }*/
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
