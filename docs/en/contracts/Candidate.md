# Candidate

- This Contract has functions that a Candidate can perform.


## functions

### setSeigManager (address _seigManager)
Change the SeigManger address used in the Candidate Contract.
 - Parameters
   -  _seigManager (address) : SeigManager Address

---

### setCommittee (address _committee)
Change the DAOCommitteeProxy address used in the Candidate Contract.
 - Parameters
   -  _committee (address) : DAOCommitteeProxy Address

---

### setMemo (string _memo)
Change the memo used in the Candidate Contract.
 - Parameters
   -  _memo (string) : New memo on this candidate

---


### updateSeigniorage ()
Update the current Candidate's Seigniorage.

---

### changeMember (uint256 _memberIndex)
Challenge the member with the index number to replace it.
 - Parameters
   -  _memberIndex (uint256) : The index of changing member slot

---

### retireMember ()
Retire a member

---

### castVote (uint256 _agendaID)