# Candidate

- 이 Contract에는 Candidate가 실행할 수 있는 기능이 포함되어 있습니다.


## functions

### setSeigManager (address _seigManager)
Candidate Contract에 등록된 SeigManger 주소를 변경합니다.
 - Parameters
   -  _seigManager (address) : SeigManager Address

---

### setCommittee (address _committee)
Candidate Contract에 등록된 DAOCommitteeProxy 주소를 변경합니다.
 - Parameters
   -  _committee (address) : DAOCommitteeProxy Address

---

### setMemo (string _memo)
Candidate Contract에 등록된 메모를 변경합니다.
 - Parameters
   -  _memo (string) : 이 Candidate에 대한 새로운 메모

---


### updateSeigniorage ()
현재 Candidate의 시뇨리지를 업데이트합니다.
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### changeMember (uint256 _memberIndex)
해당 Index Number의 Member에게 Member변경을 도전합니다.
 - Parameters
   -  _memberIndex (uint256) : 멤버슬롯 변경 index
 - Result    
   - (bool) : 실행이 성공했는지 여부

---

### retireMember ()
이 후보자가 멤버에서 은퇴합니다.
 - Result
   - (bool) : 실행이 성공했는지 여부

---

### castVote (uint256 _agendaID, uint256 _vote, string _comment)
agenda에 대해서 투표합니다.
 - Parameters
   -  _agendaID (uint256) : The agenda ID
   - _vote (uint256) : 투표 타입 (0: 기권, 1:찬성, 2:반대)
   - _comment (string) : 투표 코멘트

---

### claimActivityReward ()
멤버에 대한 활동 보상을 청구합니다.

---

### isCandidateContract ()
이 Contract가 Candidate Contract인지 확인합니다.
 - Result
   - (bool) : 이 Contract가 Candidate Contract인지 아닌지

---

### totalStaked ()
이 Candidate의 총 stake 되어있는 양을 확인합니다.
 - Result
   - (bool) : 이 Candidate의 totalSupply를 리턴합니다. 

---


### stakedOf (address _account)
이 Candidate에서 account의 stake 되어있는 양을 확인합니다.
 - Parameters
   -  _account (address) : 검색할 account를 입력합니다.
 - Result
   - (bool) : 이 Candidate에서 account의 stake 되어있는 양을 리턴합니다.

---