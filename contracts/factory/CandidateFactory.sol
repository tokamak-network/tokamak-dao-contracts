// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import { Candidate } from "../dao/Candidate.sol";
import { ICandidateFactory } from "../interfaces/ICandidateFactory.sol";

contract CandidateFactory is ICandidateFactory {
    function deploy(
        address _candidate,
        address _layer2,
        string memory _name,
        address _seigManager,
        address _committee
    )
        public
        override
        returns (address)
    {
        Candidate c = new Candidate(
            _candidate,
            _layer2,
            _committee,
            _seigManager,
            _name
        );
        c.transferOwnership(_committee);
        return address(c);
    }
}
