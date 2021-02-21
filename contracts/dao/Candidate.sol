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
import { ERC165 } from "../../node_modules/@openzeppelin/contracts/introspection/ERC165.sol";

/// @title Managing a candidate
/// @notice Either a user or layer2 contract can be a candidate
contract Candidate is Ownable, ERC165, ICandidate, ILayer2 {
    using SafeMath for uint256;

    bool public override isLayer2Candidate;
    address public override candidate;
    string public override memo;

    IDAOCommittee public override committee;
    ISeigManager public override seigManager;

    modifier onlyCandidate() {
        if (isLayer2Candidate) {
            ILayer2 layer2 = ILayer2(candidate);
            require(layer2.operator() == msg.sender, "Candidate: sender is not the operator of this contract");
        } else {
            require(candidate == msg.sender, "Candidate: sender is not the candidate of this contract");
        }
        _;
    }
    
    constructor(
        address _candidate,
        bool _isLayer2Candidate,
        string memory _memo,
        address _committee,
        address _seigManager
    ) 
    {
        candidate = _candidate;
        isLayer2Candidate = _isLayer2Candidate;
        if (isLayer2Candidate) {
            require(
                ILayer2(candidate).isLayer2(),
                "Candidate: invalid layer2 contract"
            );
        }
        committee = IDAOCommittee(_committee);
        seigManager = ISeigManager(_seigManager);
        memo = _memo;

        _registerInterface(ICandidate(address(this)).isCandidateContract.selector);
    }
    
    /// @notice Set SeigManager contract address
    /// @param _seigManager New SeigManager contract address
    function setSeigManager(address _seigManager) external override onlyOwner {
        seigManager = ISeigManager(_seigManager);
    }

    /// @notice Set DAOCommitteeProxy contract address
    /// @param _committee New DAOCommitteeProxy contract address
    function setCommittee(address _committee) external override onlyOwner {
        committee = IDAOCommittee(_committee);
    }

    /// @notice Call updateSeigniorage on SeigManager
    /// @return Whether or not the execution succeeded
    function updateSeigniorage() external override returns (bool) {
        require(address(seigManager) != address(0), "Candidate: SeigManager is zero");
        require(
            !isLayer2Candidate,
            "Candidate: you should update seigniorage from layer2 contract"
        );

        return seigManager.updateSeigniorage();
    }

    /// @notice Try to be a member
    /// @param _memberIndex The index of changing member slot
    /// @return Whether or not the execution succeeded
    function changeMember(uint256 _memberIndex)
        external
        override
        onlyCandidate
        returns (bool)
    {
        return committee.changeMember(_memberIndex);
    }

    /// @notice Retire a member
    /// @return Whether or not the execution succeeded
    function retireMember() external override onlyCandidate returns (bool) {
        return committee.retireMember();
    }
    
    /// @notice Vote on an agenda
    /// @param _agendaID The agenda ID
    /// @param _vote voting type
    /// @param _comment voting comment
    function castVote(
        uint256 _agendaID,
        uint256 _vote,
        string calldata _comment
    )
        external
        override
        onlyCandidate
    {
        committee.castVote(_agendaID, _vote, _comment);
    }

    /// @notice Checks whether this contract is a candidate contract
    /// @return Whether or not this contract is a candidate contract
    function isCandidateContract() external view override returns (bool) {
        return true;
    }

    function operator() external view override returns (address) { return candidate; }
    function isLayer2() external view override returns (bool) { return true; }
    function currentFork() external view override returns (uint256) { return 1; }
    function lastEpoch(uint256 forkNumber) external view override returns (uint256) { return 1; }
    function changeOperator(address _operator) external override { }

    /// @notice Retrieves the total staked balance on this candidate
    /// @return totalsupply Total staked amount on this candidate
    function totalStaked()
        external
        view
        override
        returns (uint256 totalsupply)
    {
        address coinage = _getCoinageToken();
        require(coinage != address(0), "Candidate: coinage is zero");
        return IERC20(coinage).totalSupply();
    }

    /// @notice Retrieves the staked balance of the account on this candidate
    /// @param _account Address being retrieved
    /// @return amount The staked balance of the account on this candidate
    function stakedOf(
        address _account
    )
        external
        view
        override
        returns (uint256 amount)
    {
        address coinage = _getCoinageToken();
        require(coinage != address(0), "Candidate: coinage is zero");
        return IERC20(coinage).balanceOf(_account);
    }

    function _getCoinageToken() internal view returns (address) {
        address c;
        if (isLayer2Candidate) {
            c = candidate;
        } else {
            c = address(this);
        }

        return seigManager.coinages(c);
    }
}
