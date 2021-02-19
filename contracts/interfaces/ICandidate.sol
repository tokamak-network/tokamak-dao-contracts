// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ICandidate {
    function setSeigManager(address _seigMan) external;
    function setCommittee(address _committee) external;
    //function setLayer2Registry(address _layer2Registry) external;
    function updateSeigniorage() external returns (bool);
    //function registerAndDeployCoinage() external returns (bool);
    //function isCommitteeLayer2() external view returns (bool);
    //function candidateAndOwner() external view returns (address, address);
    function isCandidateContract() external view returns (bool);
    function candidate() external view returns (address);
    function isLayer2Candidate() external view returns (bool);
    function totalStaked() external view returns (uint256 totalsupply);
    function stakedOf(address _account) external view returns (uint256 amount);
    function setMemo(string calldata _memo) external;
}
