
# Tokamak Network DAO Contracts
Tokamak Network DAO supports all the functions of the Tokamak Network Contract. All functions of all Contracts are executed only in the DAO. And Tokamak Network Foundation does not own any Contract (except the DAO Contract).

## Overview Of Contracts

- Anyone can become a DAO Candidate. 
- Anyone can create a DAO Agenda.
- When creating an agenda, the agenda creator burns 10TON as an agenda creation fee.
- In order to act as a Candidate, the operator must stake more than the minimumAmount value of SeigManager on the Candidate. (minimumAmount is 1000.1TON)
- Anyone who is a Candidate of DAO can become a Member through a challenge. (The Candidate with more Staking becomes a Member.)
- A DAO member can retire at any time using the retireMember function, and when retired, the corresponding member position becomes vacant.
- Members will receive TON as a reward during their active period and can claim the reward through the claimActivityReward function.

**Table of Contracts**
- [DAOCommittee](./contracts/DAOCommittee.md)
- [DAOVault](./contracts/DAOVault.md)
- [DAOAgendaManager](./contracts/DAOAgendaManager.md)
- [CandidateFactory](./contracts/CandidateFactory.md)
- [Candidate](./contracts/Candidate.md)

## Agenda Rules

- Vote Rule
    - Members can vote on the Agenda and can vote abstain, yes, or no.
    - If 2 out of 3 members agree, the Agenda will pass. (These values ​​are subject to change.)
    - Votes that are not voted on during the voting period will be determined as abstentions.
    - If a member changes before the Agenda is created and voting begins, the changed member can vote.
    - Even if a member changes after voting begins, only the previous member can vote.

- Vote Period
    - The period is divided into the Notice Period, Voting Period, and Execute Period.
    - The Notice Period is determined when the Agenda is created.
    - The Voting Period and Execute Period are determined after one of the Members votes.
