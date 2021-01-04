// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import { Candidate } from "../dao/Candidate.sol";
import { ICandidateFactory } from "../interfaces/ICandidateFactory.sol";

contract CandidateFactory is ICandidateFactory {
    // layer2 deploy... make coinages
    function deploy(address _candidate, string memory _name, address _seigManager, address _layer2registry) public override returns (address) {
        Candidate c = new Candidate(_candidate, _name);
        c.setSeigManager(_seigManager);
        //c.setLayer2Registry(_layer2registry);
        c.transferOwnership(_candidate);
        return address(c);
    }
}
