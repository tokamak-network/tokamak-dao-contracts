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
 - Result
   - (bool) : Whether or not the execution succeeded

---

### changeMember (uint256 _memberIndex)
Challenge the member with the index number to replace it.
 - Parameters
   -  _memberIndex (uint256) : The index of changing member slot
 - Result    
   - (bool) : Whether or not the execution succeeded

---

### retireMember ()
Retire a member
 - Result
   - (bool) : Whether or not the execution succeeded

---

### castVote (uint256 _agendaID, uint256 _vote, string _comment)
Vote on the agenda.
 - Parameters
   -  _agendaID (uint256) : The agenda ID
   - _vote (uint256) : voting type (0: abstainVotes, 1:yesVotes, 2:noVotes)
   - _comment (string) : voting comment

---

### claimActivityReward ()
Claims the activity reward for member

---

### isCandidateContract ()
Checks whether this contract is a candidate contract
 - Result
   - (bool) : Whether or not this contract is a candidate contract

---

### totalStaked ()
Retrieves the total staked balance on this candidate
 - Result
   - (bool) : totalsupply Total staked amount on this candidate

---


### stakedOf (address _account)
Retrieves the staked balance of the account on this candidate
 - Parameters
   -  _account (address) : Address being retrieved
 - Result
   - (bool) : amount The staked balance of the account on this candidate

---