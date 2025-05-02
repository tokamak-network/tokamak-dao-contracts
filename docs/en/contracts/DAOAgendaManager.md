# DAOAgendaManager

- This Contract is the Contract used to create and manage Agendas in DAOContract.


## functions

### setCommittee (address _committee)
Set the address of the DAO Contract to be used in the DAOAgendaManager Contract.
 - Parameters
   -  _committee (address) : Address of DAO Contract

---

### setCreateAgendaFees (uint256 _createAgendaFees)
Sets the CreateFee to use when creating an Agenda.
 - Parameters
   -  _createAgendaFees (uint256) : Amount of CreateFee

---

### setMinimumNoticePeriodSeconds (uint256 _minimumNoticePeriodSeconds)
Sets the minimum NoticePeriod time for the Agenda.
 - Parameters
   -  _minimumNoticePeriodSeconds (uint256) : Minimum NoticePeriod time

---

### setExecutingPeriodSeconds (uint256 _executingPeriodSeconds)
Sets the ExecutingPeriod time of the Agenda.
 - Parameters
   -  _executingPeriodSeconds (uint256) : ExecutingPeriod time

---

### setMinimumVotingPeriodSeconds (uint256 _minimumVotingPeriodSeconds)
Sets the minimum VotingPeriod time for the Agenda.
 - Parameters
   -  _minimumVotingPeriodSeconds (uint256) : Minimum VotingPeriod time

---

### newAgenda (address[] _targets, uint256 _noticePeriodSeconds, uint256 _votingPeriodSeconds, bool _atomicExecute, bytes[] _functionBytecodes)
Create a new Agenda.
 - Parameters
   -  _targets (address) : Addresses where functions will be executed when the agenda is executed
   - _noticePeriodSeconds (uint256) : NoticePeriod time
   - _votingPeriodSeconds (uint256) : VotingPeriod time
   - _atomicExecute (bool) : Address of the DAO Contract that the Candidate will use
   - _functionBytecodes (bytes) : Functions to be executed when the agenda is executed
 - Result
   - (uint256) : Returns the generated agendaID.

---

### castVote (uint256 _agendaID, address _voter, uint256 _vote)
Vote on AgendaID.
 - Parameters
   -  _agendaID (uint256) : AgendaID to vote on
   - _voter (address) : Address of the voter who cast the vote
   - _vote (uint256) : Voter's opinion
 - Result
   - (bool) : Check if AgendaID voting has taken place

---

### setExecutedAgenda (uint256 _agendaID)
A function that changes the status of AgendaID to executed.
 - Parameters
   -  _agendaID (uint256) : AgendaID to change status

---

### setResult (uint256 _agendaID, LibAgenda.AgendaResult _result)
A function that changes the Result status of AgendaID.
 - Parameters
   -  _agendaID (uint256) : AgendaID to change status
   -  _result (LibAgenda) : Result to change

---

### setStatus (uint256 _agendaID, LibAgenda.AgendaStatus _status)
A function changes the Status of AgendaID.
 - Parameters
   -  _agendaID (uint256) : AgendaID to change status
   -  _status (LibAgenda) : Status to change

---

### endAgendaVoting (uint256 _agendaID)
This function changes the voting status of AgendaID to End.
 - Parameters
   -  _agendaID (uint256) : AgendaID to change status

---

