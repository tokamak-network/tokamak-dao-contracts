# DAOAgendaManager

- 이 Contract는 DAOContract에서 Agenda를 생성하고 관리할때 사용하는 Contract 입니다.


## functions

### setCommittee (address _committee)
DAOAgendaManager Contract에서 사용할 DAO Contract의 주소 세팅합니다.
 - Parameters
   -  _committee (address) : DAO Contract의 주소

---

### setCreateAgendaFees (uint256 _createAgendaFees)
Agenda를 생성할때 사용할 CreateFee를 설정합니다.
 - Parameters
   -  _createAgendaFees (uint256) : CreateFee의 양 

---

### setMinimumNoticePeriodSeconds (uint256 _minimumNoticePeriodSeconds)
Agenda의 최소 NoticePeriod 시간을 설정합니다.
 - Parameters
   -  _minimumNoticePeriodSeconds (uint256) : 최소 NoticePeriod 시간

---

### setExecutingPeriodSeconds (uint256 _executingPeriodSeconds)
Agenda의 ExecutingPeriod 시간을 설정합니다.
 - Parameters
   -  _executingPeriodSeconds (uint256) : ExecutingPeriod 시간

---

### setMinimumVotingPeriodSeconds (uint256 _minimumVotingPeriodSeconds)
Agenda의 최소 VotingPeriod 시간을 설정합니다.
 - Parameters
   -  _minimumVotingPeriodSeconds (uint256) : 최소 VotingPeriod 시간

---

### newAgenda (address[] _targets, uint256 _noticePeriodSeconds, uint256 _votingPeriodSeconds, bool _atomicExecute, bytes[] _functionBytecodes)
새로운 Agenda를 생성합니다.
 - Parameters
   -  _targets (address) : agenda 실행 시 function을 실행할 주소들
   - _noticePeriodSeconds (uint256) : NoticePeriod 시간
   - _votingPeriodSeconds (uint256) : VotingPeriod 시간
   - _atomicExecute (bool) : Candidate가 사용할 DAO Contract의 주소 
   - _functionBytecodes (bytes) : agenda 실행 시 실행할 function들
 - Result
   - (uint256) : 생성된 agendaID를 리턴합니다.

---

### castVote (uint256 _agendaID, address _voter, uint256 _vote)
AgendaID에 대해서 투표를 합니다.
 - Parameters
   -  _agendaID (uint256) : 투표를 진행할 AgendaID
   - _voter (address) : 투표를 진행한 Voter의 주소
   - _vote (uint256) : Voter의 투표의견
 - Result
   - (bool) : AgendaID의 투표가 진행되었는지 확인

---

### setExecutedAgenda (uint256 _agendaID)
AgendaID의 상태가 실행되었다고 변경하는 함수입니다.
 - Parameters
   -  _agendaID (uint256) : 상태를 변경할 AgendaID

---

### setResult (uint256 _agendaID, LibAgenda.AgendaResult _result)
AgendaID의 Result 상태를 변경하는 함수입니다.
 - Parameters
   -  _agendaID (uint256) : 상태를 변경할 AgendaID
   -  _result (LibAgenda) : 변경할 Result

---

### setStatus (uint256 _agendaID, LibAgenda.AgendaStatus _status)
AgendaID의 Status 상태를 변경하는 함수입니다.
 - Parameters
   -  _agendaID (uint256) : 상태를 변경할 AgendaID
   -  _status (LibAgenda) : 변경할 Status

---

### endAgendaVoting (uint256 _agendaID)
AgendaID의 투표상태를 End상태로 변경하는 함수입니다.
 - Parameters
   -  _agendaID (uint256) : 상태를 변경할 AgendaID

---

