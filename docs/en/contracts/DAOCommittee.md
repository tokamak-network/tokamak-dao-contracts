# DAOCommittee

- This Contract is a DAO logic Contract that contains functions used in the DAO Contract.


## functions

### setSeigManager (address _seigManager)
Set SeigManager contract address
 - Parameters
   -  _seigManager (address) : New SeigManager contract address

---

### setCandidatesSeigManager (address[] _candidateContracts, address _seigManager)
Set SeigManager contract address on candidate contracts
 - Parameters
   -  _candidateContracts (address[]) : Candidate contracts to be set
   -  _seigManager (address) : New SeigManager contract address

---

### setCandidatesCommittee (address[] _candidateContracts, address _committee)
Set DAOCommitteeProxy contract address on candidate contracts
 - Parameters
   -  _candidateContracts (address[]) : Candidate contracts to be set
   -  _committee (address) : New DAOCommitteeProxy contract address

---

### setDaoVault (address _daoVault)
Set DAOVault contract address
 - Parameters
   -  _daoVault (address) : New DAOVault contract address

---

### setLayer2Registry (address _layer2Registry)
Set Layer2Registry contract address
 - Parameters
   -  _layer2Registry (address) : New Layer2Registry contract address

---

### setAgendaManager (address _agendaManager)
Set DAOAgendaManager contract address
 - Parameters
   -  _agendaManager (address) : New DAOAgendaManager contract address

---

### setCandidateFactory (address _candidateFactory)
Set CandidateFactory contract address
 - Parameters
   -  _candidateFactory (address) : New CandidateFactory contract address

---

### setTon (address _ton)
Set TON contract address
 - Parameters
   -  _ton (address) : New TON contract address

---

### setActivityRewardPerSecond (address _value)
Set activity reward amount
 - Parameters
   -  _value (address) : New activity reward per second

---

### increaseMaxMember (uint256 _newMaxMember, uint256 _quorum)
Increases the number of member slot
 - Parameters
   -  _newMaxMember (uint256) : New number of member slot
   -  _quorum (uint256) : New quorum

---

### createCandidate (string _memo)
Creates a candidate contract and register it on SeigManager
 - Parameters
   -  _memo (string) : A memo for the candidate

---

### registerLayer2Candidate (address _layer2, string memory _memo)
Registers the exist layer2 on DAO
 - Parameters
   -  _layer2 (address) : Layer2 contract address to be registered
   -  _memo (string) : A memo for the candidate

---

### registerLayer2CandidateByOwner (address _operator, address _layer2, string memory _memo)
Registers the exist layer2 on DAO by owner
 - Parameters
   -  _operator (address) : Operator address of the layer2 contract
   -  _layer2 (address) : Layer2 contract address to be registered
   -  _memo (string) : A memo for the candidate

---

### changeMember (uint256 _memberIndex)
Replaces an existing member
 - Parameters
   -  _memberIndex (uint256) : The member slot index to be replaced
 - Result
   - (bool) : Whether or not the execution succeeded

---

### retireMember ()
Retires member
 - Result
   - (bool) : Whether or not the execution succeeded

---

### setMemoOnCandidate (address _candidate, string _memo)
Set memo
 - Parameters
   -  _candidate (address) : candidate address
   -  _memo (string) : New memo on this candidate

---

### setMemoOnCandidateContract (address _candidateContract, string _memo)
Set memo
 - Parameters
   -  _candidateContract (address) : candidate contract address
   -  _memo (string) : New memo on this candidate

---

### decreaseMaxMember (uint256 _reducingMemberIndex, uint256 _quorum)
Decreases the number of member slot
 - Parameters
   -  _reducingMemberIndex (uint256) : Reducing member slot index
   -  _quorum (uint256) : New quorum

---

### onApprove (address owner, address spender, uint256 tonAmount, bytes data)
Create an agenda through approveAndCall
 - Parameters
   -  owner (address) : Owner address that creates the agenda
   -  spender (address) : Contract address that creates the agenda
   -  tonAmount (uint256) : TON Approve Amount
   -  data (bytes) : Agenda Related Data
 - Result
   - (bool) : Whether or not the execution succeeded

---

### setQuorum (uint256 _quorum)
Set new quorum
 - Parameters
   -  _quorum (uint256) : New quorum

---

### setCreateAgendaFees (uint256 _fees)
Set fee amount of creating an agenda
 - Parameters
   -  _fees (uint256) : Fee amount on TON

---

### setMinimumNoticePeriodSeconds (uint256 _minimumNoticePeriod)
Set the minimum notice period
 - Parameters
   -  _minimumNoticePeriod (uint256) : New minimum notice period in second

---

### setMinimumVotingPeriodSeconds (uint256 _minimumVotingPeriod)
Set the minimum voting period
 - Parameters
   -  _minimumVotingPeriod (uint256) : New minimum voting period in second

---

### setExecutingPeriodSeconds (uint256 _executingPeriodSeconds)
Set the executing period
 - Parameters
   -  _executingPeriodSeconds (uint256) : New executing period in second

---

### castVote (uint256 _executingPeriodSeconds, uint256 _vote, string _comment)
Vote on an agenda
 - Parameters
   -  _agendaID (uint256) : The agenda ID
   -  _vote (uint256) : voting type
   -  _comment (string) : voting comment

---

### endAgendaVoting (uint256 _agendaID)
Set the agenda status as ended(denied or dismissed)
 - Parameters
   -  _agendaID (uint256) : The agenda ID

---

### executeAgenda (uint256 _agendaID)
Execute the accepted agenda
 - Parameters
   -  _agendaID (uint256) : The agenda ID

---

### setAgendaStatus (uint256 _agendaID, uint256 _status, uint256 _result)
Set status and result of specific agenda
 - Parameters
   -  _agendaID (uint256) : The agenda ID
   -  _status (uint256) : New status
   -  _result (uint256) : New result

---

### updateSeigniorage (address _candidate)
Call updateSeigniorage on SeigManager
 - Parameters
   -  _candidate (address) : Candidate address to be updated
 - Result
   - (bool) : Whether or not the execution succeeded

---

### updateSeigniorage (address[] _candidate)
Call updateSeigniorage on SeigManager
 - Parameters
   -  _candidate (address) : Candidate addresses to be updated
 - Result
   - (bool) : Whether or not the execution succeeded

---

### claimActivityReward (address _receiver)
Claims the activity reward for member
 - Parameters
   -  _receiver (address) : receiver address

---


