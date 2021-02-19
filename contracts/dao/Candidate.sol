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

/// @title Managing a candidate
/// @notice Either a user or layer2 contract can be a candidate
contract Candidate is Ownable, ERC165 {
    using SafeMath for uint256;

    bool public isLayer2Candidate;
    address public candidate;
    string public memo;

    IDAOCommittee public committee;
    ISeigManager public seigManager;

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
    function setSeigManager(address _seigManager) public onlyOwner {
        seigManager = ISeigManager(_seigManager);
    }

    /// @notice Set DAOCommitteeProxy contract address
    /// @param _committee New DAOCommitteeProxy contract address
    function setCommittee(address _committee) public onlyOwner {
        committee = IDAOCommittee(_committee);
    }

    /// @notice Set memo
    /// @param _memo New memo on this candidate
    function setMemo(string calldata _memo) public onlyOwner {
        memo = _memo;
    }

    /// @notice Set DAOCommitteeProxy contract address
    /// @notice Call updateSeigniorage on SeigManager
    /// @return Whether or not the execution succeeded
    function updateSeigniorage() public returns (bool) {
        require(address(seigManager) != address(0), "Candidate: SeigManager is zero");
        require(
            isLayer2Candidate == false,
            "Candidate: you should update seigniorage from layer2 contract"
        );

        return ISeigManager(seigManager).updateSeigniorage();
    }

    /// @notice Try to be a member
    /// @param _memberIndex The index of changing member slot
    /// @return Whether or not the execution succeeded
    function changeMember(uint256 _memberIndex)
        public
        onlyCandidate
        returns (bool)
    {
        return committee.changeMember(_memberIndex);
    }

    /// @notice Retire a member
    /// @return Whether or not the execution succeeded
    function retireMember() public onlyCandidate returns (bool) {
        return committee.retireMember();
    }
    
    /// @notice Vote on an agenda
    /// @param _agendaID The agenda ID
    /// @param _vote voting type
    /// @param _comment voting comment
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

    function claimActivityReward()
        public
        onlyCandidate
    {
        address receiver;

        if (isLayer2Candidate) {
            ILayer2 layer2 = ILayer2(candidate);
            receiver = layer2.operator();
        } else {
            receiver = candidate;
        }
        committee.claimActivityReward(receiver);
    }

    /// @notice Checks whether this contract is a candidate contract
    /// @return Whether or not this contract is a candidate contract
    function isCandidateContract() public view returns (bool) {
        return true;
    }

    function operator() public view returns (address) { return candidate; }
    function isLayer2() public view returns (bool) { return true; }
    function currentFork() public view returns (uint) { return 1; }
    function lastEpoch(uint forkNumber) public view returns (uint) { return 1; }

    /// @notice Retrieves the total staked balance on this candidate
    /// @return totalsupply Total staked amount on this candidate
    function totalStaked()
        public
        view
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
        public
        view
        returns (uint256 amount)
    {
        address coinage = _getCoinageToken();
        require(coinage != address(0), "DAOCommittee: coinage is zero");
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
