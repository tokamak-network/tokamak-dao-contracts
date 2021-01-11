// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../shared/Ownabled.sol";

import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { ISeigManager } from "../interfaces/ISeigManager.sol";
import { ICandidate } from "../interfaces/ICandidate.sol";
import { ILayer2Registry } from "../interfaces/ILayer2Registry.sol";
import { ERC165 } from "../../node_modules/@openzeppelin/contracts/introspection/ERC165.sol";

contract Candidate is Ownabled, ICandidate, ERC165 {
    using SafeMath for uint256;
    address public candidate;
    address public seigManager;
    string public memo;
    
    constructor(address _candidate, string memory _memo) {
        candidate = _candidate;
        memo = _memo;

        _registerInterface(ICandidate(address(this)).isCandidateContract.selector);
    }
    
    function setSeigManager(address _seigMan) public onlyOwner override {
        seigManager =_seigMan;
    }

    function updateSeigniorage() public override returns (bool) {
        require(seigManager != address(0), "Candidate: SeigManager is zero");
        return ISeigManager(seigManager).updateSeigniorage();
    }
    
    function isCommitteeLayer2() public override view returns (bool) {
        return true;
    }

    function candidateAndOwner() public override view returns (address, address) {
        return (candidate, owner);
    }

    function isCandidateContract() public override view returns (bool) {
        return true;
    }

    function operator() public view returns (address) { return candidate; }
    function isLayer2() public view returns (bool) { return true; }
    function currentFork() public view returns (uint) { return 1; }
    function lastEpoch(uint forkNumber) public view returns (uint) { return 1; }
    /*function changeCandidate(address _candidate) public {
        candidate = _candidate;
    }*/
}
