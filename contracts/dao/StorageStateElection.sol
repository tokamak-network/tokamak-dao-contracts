// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./DAOElectionStore.sol";
import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { CommitteeL2FactoryI } from "../interfaces/CommitteeL2FactoryI.sol";
import { Layer2RegistryI } from "../interfaces/Layer2RegistryI.sol";
import { SeigManagerI } from "../interfaces/SeigManagerI.sol";


contract StorageStateElection {
    DAOElectionStore public store;
    IDAOCommittee public daoCommittee;
    CommitteeL2FactoryI public committeeL2Factory;
    Layer2RegistryI public layer2Registry;
    SeigManagerI public seigManager;
    
    struct Ratio {
        uint256 numerator;
        uint256 denominator;
    }
    
    modifier validStore() {
        require(address(store) != address(0), "StorageStateElection: store address is zero");
        _;
    }

    modifier validDAOCommittee() {
        require(address(daoCommittee) != address(0), "StorageStateElection: unvalid DAOCommittee");
        _;
    }

    modifier validCommitteeL2Factory() {
        require(address(committeeL2Factory) != address(0), "StorageStateElection: unvalid CommitteeL2Factory");
        _;
    }

    modifier validLayer2Registry() {
        require(address(layer2Registry) != address(0), "StorageStateElection: unvalid Layer2Registry");
        _;
    }

    modifier validSeigManager() {
        require(address(seigManager) != address(0), "StorageStateElection: unvalid SeigManagere");
        _;
    }

    function getProxyStore() public view returns (address) { return address(store); }
    function getProxySeigManager() public view returns (address) { return address(seigManager); }
    function getProxyLayer2Registry() public view returns (address) { return address(layer2Registry); }
    function getProxyCommitteeL2Factory() public view returns (address) { return address(committeeL2Factory); }
    function getProxyDAOCommittee() public view returns (address) { return address(daoCommittee); }
}
