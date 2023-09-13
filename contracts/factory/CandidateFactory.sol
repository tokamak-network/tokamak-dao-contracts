// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { Candidate } from "../dao/Candidate.sol";
import { ICandidateFactory } from "../interfaces/ICandidateFactory.sol";

contract CandidateFactory is ICandidateFactory {
    function deploy(
        address _candidate,
        bool _isLayer2Candidate,
        string memory _name,
        address _committee,
        address _seigManager
    )
        public
        override
        returns (address)
    {
        Candidate c = new Candidate(
            _candidate,
            _isLayer2Candidate,
            _name,
            _committee,
            _seigManager
        );
        c.transferOwnership(_committee);
        return address(c);
    }
}
