# DAOCommittee

- 이 Contract는 DAO Contract에서 사용하는 function들이 있는 DAO logic Contract입니다.


## functions

### setSeigManager (address _seigManager)
SeigManager contract 주소 설정
 - Parameters
   -  _seigManager (address) : 새 SeigManager contract 주소

---

### setCandidatesSeigManager (address[] _candidateContracts, address _seigManager)
Candidate Contract들에 SeigManager Contract 주소 설정
 - Parameters
   -  _candidateContracts (address[]) : SeigManager Contract주소를 설정할 Candidate contract 주소
   -  _seigManager (address) : 새 SeigManager contract 주소

---

### setCandidatesCommittee (address[] _candidateContracts, address _committee)
Candidate Contracts에 DAOCommitteeProxy Contract 주소 설정
 - Parameters
   -  _candidateContracts (address[]) : DAOCommitteeProxy Contract주소를 설정할 Candidate contract 주소
   -  _committee (address) : 새 DAOCommitteeProxy contract 주소

---

### setDaoVault (address _daoVault)
DAOVault contract 주소 설정
 - Parameters
   -  _daoVault (address) : 새 DAOVault contract 주소

---

### setLayer2Registry (address _layer2Registry)
Layer2Registry contract 주소 설정
 - Parameters
   -  _layer2Registry (address) : 새 Layer2Registry contract 주소

---

### setAgendaManager (address _agendaManager)
DAOAgendaManager contract 주소 설정
 - Parameters
   -  _agendaManager (address) : 새 DAOAgendaManager contract 주소

---

### setCandidateFactory (address _candidateFactory)
CandidateFactory contract 주소 설정
 - Parameters
   -  _candidateFactory (address) : 새 CandidateFactory contract 주소

---

### setTon (address _ton)
TON contract 주소 설정
 - Parameters
   -  _ton (address) : 새 TON contract 주소

---

### setActivityRewardPerSecond (address _value)
activity reward 양 설정
 - Parameters
   -  _value (address) : 새 activity reward 양

---

### increaseMaxMember (uint256 _newMaxMember, uint256 _quorum)
멤버 수를 늘립니다.
 - Parameters
   -  _newMaxMember (uint256) : 새로운 멤버 수
   -  _quorum (uint256) : 새 투표 통과 기준

---

### createCandidate (string _memo)
새로운 Candidate Contract를 등록합니다.
 - Parameters
   -  _memo (string) : Candidate Contract의 Memo

---

### registerLayer2Candidate (address _layer2, string memory _memo)
새로운 Layer2 Candidate Contract를 등록합니다.
 - Parameters
   -  _layer2 (address) : 등록할 Layer2 contract 주소
   -  _memo (string) : Candidate Contract의 Memo

---

### registerLayer2CandidateByOwner (address _operator, address _layer2, string memory _memo)
Owner가 새로운 Layer2 Candidate Contract를 등록합니다.
 - Parameters
   -  _operator (address) :  layer2 contract의 Operator 주소
   -  _layer2 (address) : 등록할 Layer2 contract 주소
   -  _memo (string) :  Candidate Contract의 Memo

---

### changeMember (uint256 _memberIndex)
기존 index의 Member를 대체하여 Member가 됩니다.
 - Parameters
   -  _memberIndex (uint256) : 대체할 Member의 index
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### retireMember ()
Member에서 탈퇴합니다.
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### setMemoOnCandidate (address _candidate, string _memo)
Candidate Contract의 Memo를 수정합니다.
 - Parameters
   -  _candidate (address) : candidate 주소
   -  _memo (string) : CandidateContract에 대한 새 Memo

---

### setMemoOnCandidateContract (address _candidateContract, string _memo)
Candidate Contract의 Memo를 수정합니다.
 - Parameters
   -  _candidateContract (address) : candidate 주소
   -  _memo (string) : CandidateContract에 대한 새 Memo

---

### decreaseMaxMember (uint256 _reducingMemberIndex, uint256 _quorum)
멤버 수를 줄입니다.
 - Parameters
   -  _reducingMemberIndex (uint256) : 줄어든 새로운 멤버 수
   -  _quorum (uint256) : 새 투표 통과 기준

---

### onApprove (address owner, address spender, uint256 tonAmount, bytes data)
approveAndCall을 통한 Agenda 생성
 - Parameters
   -  owner (address) : Agenda를 생성하는 Owner 주소
   -  spender (address) : Agenda를 생성하는 DAO Contract 주소
   -  tonAmount (uint256) : Approve할 TON의 양
   -  data (bytes) : 아젠다 관련 Data
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### setQuorum (uint256 _quorum)
새 투표 통과 기준 설정
 - Parameters
   -  _quorum (uint256) : 새 투표 통과 기준

---

### setCreateAgendaFees (uint256 _fees)
Agenda 생성할때 드는 TON Fee 설정
 - Parameters
   -  _fees (uint256) : TON의 Fee 금액

---

### setMinimumNoticePeriodSeconds (uint256 _minimumNoticePeriod)
minimum notice period 설정
 - Parameters
   -  _minimumNoticePeriod (uint256) : 새 minimum notice period값 (초)

---

### setMinimumVotingPeriodSeconds (uint256 _minimumVotingPeriod)
minimum voting period 설정
 - Parameters
   -  _minimumVotingPeriod (uint256) : 새 minimum voting period값 (초)

---

### setExecutingPeriodSeconds (uint256 _executingPeriodSeconds)
executing period 설정
 - Parameters
   -  _executingPeriodSeconds (uint256) : 세 executing period값 (초)

---

### castVote (uint256 _executingPeriodSeconds, uint256 _vote, string _comment)
Agenda에 대한 투표 진행
 - Parameters
   -  _agendaID (uint256) : agenda ID
   -  _vote (uint256) : 투표 타입
   -  _comment (string) : 투표에 대한 코멘트

---

### endAgendaVoting (uint256 _agendaID)
Agenda상태를 종료 (거부 or 기각됨)
 - Parameters
   -  _agendaID (uint256) : agenda ID

---

### executeAgenda (uint256 _agendaID)
승인된 Agenda 실행
 - Parameters
   -  _agendaID (uint256) : agenda ID

---

### setAgendaStatus (uint256 _agendaID, uint256 _status, uint256 _result)
Agenda의 Status와 Result 변경
 - Parameters
   -  _agendaID (uint256) : agenda ID
   -  _status (uint256) : 새 status 값
   -  _result (uint256) : 새 result 값

---

### updateSeigniorage (address _candidate)
SeigManager Contract에 CandidateContract의 updateSeigniorage함수 호출
 - Parameters
   -  _candidate (address) : Seigniorage를 업데이트할 Candidate 주소 입력
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### updateSeigniorage (address[] _candidate)
SeigManager Contract에 CandidateContract들의 updateSeigniorage함수 호출
 - Parameters
   -  _candidate (address) : Seigniorage를 업데이트할 Candidate 주소 입력
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### claimActivityReward (address _receiver)
Member에 대한 활동보상 청구
 - Parameters
   -  _receiver (address) : receiver 주소

---


