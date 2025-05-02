# CandidateFactory

- This contract is the contract used when creating a Candidate in DAO Contract.


## functions

### deploy (address _sender, bool _isLayer2Candidate, string _name, address _committee, address _seigManager)
Deploy the Candidate Contract.
 - Parameters
   -  _sender (address) : The sender address that called the deploy function
   - _isLayer2Candidate (bool) : true if Layer 2 Candidate, otherwise false
   - _name (string) : Candidate's name
   - _committee (address) : Address of the DAO Contract that the Candidate will use
   - _seigManager (address) : Address of the SeigManagerContract that the Candidate will use
 - Result
   - (address) : Returns the address of the Candidate Contract.

---