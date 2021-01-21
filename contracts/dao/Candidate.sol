// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { IERC20 } from  "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import { ISeigManager } from "../interfaces/ISeigManager.sol";
import { ICandidate } from "../interfaces/ICandidate.sol";
import { ILayer2 } from "../interfaces/ILayer2.sol";
import { ILayer2Registry } from "../interfaces/ILayer2Registry.sol";
import { IDAOCommittee } from "../interfaces/IDAOCommittee.sol";
import { ERC165 } from "../../node_modules/@openzeppelin/contracts/introspection/ERC165.sol";

contract Candidate is Ownable, ICandidate, ERC165 {
    using SafeMath for uint256;
    address public candidate;
    ISeigManager public seigManager;
    string public memo;
    ILayer2 public layer2;
    IDAOCommittee public committee;

    modifier onlyCandidate() {
        if (address(layer2) != address(0)) {
            require(layer2.isLayer2(), "Candidate: invalid layer2 contract");
            require(layer2.operator() == msg.sender, "Candidate: invalid candidate");
        } else {
            require(msg.sender == candidate, "Candidate: sender is not ");
        }
        _;
    }
    
    constructor(
        address _candidate,
        address _layer2,
        address _committee,
        address _seigManager,
        string memory _memo
    ) 
    {
        if (_layer2 != address(0)) {
            layer2 = ILayer2(_layer2);
            require(layer2.isLayer2(), "Candidate: invalid layer2 contract");
            require(layer2.operator() == _candidate, "Candidate: invalid candidate");
        }

        committee = IDAOCommittee(_committee);
        seigManager = ISeigManager(_seigManager);
        candidate = _candidate;
        memo = _memo;

        _registerInterface(ICandidate(address(this)).isCandidateContract.selector);
    }
    
    function setSeigManager(address _seigManager) public onlyOwner override {
        seigManager = ISeigManager(_seigManager);
    }

    function setCommittee(address _committee) public onlyOwner override {
        committee = IDAOCommittee(_committee);
    }

    function updateSeigniorage() public override returns (bool) {
        require(address(seigManager) != address(0), "Candidate: SeigManager is zero");
        require(
            address(layer2) == address(0),
            "Candidate: you should update seigniorage from layer2 contract"
        );

        return ISeigManager(seigManager).updateSeigniorage();
    }

    function changeMember(uint256 _memberIndex)
        public
        onlyCandidate
        returns (bool)
    {
        return committee.changeMember(_memberIndex, msg.sender);
    }

    function retireMember() public onlyCandidate returns (bool) {
        return committee.retireMember();
    }
    
    function castVote(
        uint256 _agendaID,
        uint _vote,
        string calldata _comment
    )
        public
        onlyCandidate
    {
        committee.castVote(_agendaID, _vote, _comment);
    }

    /*function isCommitteeLayer2() public override view returns (bool) {
        return true;
    }*/

    /*function candidateAndOwner() public override view returns (address, address) {
        return (candidate, owner);
    }*/

    function isCandidateContract() public override view returns (bool) {
        return true;
    }

    function operator() public view returns (address) { return candidate; }
    function isLayer2() public view returns (bool) { return true; }
    function currentFork() public view returns (uint) { return 1; }
    function lastEpoch(uint forkNumber) public view returns (uint) { return 1; }

    /*function isCandidate(address _account) public view {
    }*/

    function totalStaked()
        public
        view
        override
        returns (uint256 totalsupply)
    {
        address coinage = _getCoinageToken();
        require(coinage != address(0), "Candidate: coinage is zero");
        return IERC20(coinage).totalSupply();
    }

    function stakedOf(
        address _account
    )
        public
        view
        override
        returns (uint256 amount)
    {
        address coinage = _getCoinageToken();
        require(coinage != address(0), "DAOCommittee: coinage is zero");
        return IERC20(coinage).balanceOf(_account);
    }

    function getCandidate() public view override returns (address) {
        if (address(layer2) != address(0)) {
            return layer2.operator();
        } else {
            return candidate;
        }
    }

    function _getCoinageToken() internal view returns (address) {
        address c;
        if (address(layer2) != address(0)) {
            c = address(layer2);
        } else {
            c = address(this);
        }

        return seigManager.coinages(c);

    }
}
