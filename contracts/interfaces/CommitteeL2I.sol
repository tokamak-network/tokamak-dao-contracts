// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface CommitteeL2I {
    
    function setSeigManager(address _seigMan) external ;
    function updateSeigniorage() external returns (bool);
    function isCommitteeLayer() external view returns (bool) ;
}

