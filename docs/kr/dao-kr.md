
# Tokamak Network DAO Contracts
Tokamak Network DAO는 Tokamak Network Contract의 모든 기능을 지원합니다. 모든 Contract의 모든 기능은 DAO에서만 실행됩니다. 그리고 Tokamak Network Foundation은 어떤 Contract도 소유하지 않습니다 (DAO Contract는 제외).

## Overview Of Contracts

- DAO의 Agenda 생성은 누구나 할 수 있습니다. Agenda를 생성할때 Agenda 생성자는 Agenda Create Fee로 10TON을 Burn하게 됩니다.
- DAO의 Candidate는 누구나 될 수 있습니다.
- Candidate로써 역할을 하기 위해서는 SeigManager의 minimumAmount값 이상으로 Candidate에 operator가 staking해야합니다.
- DAO의 Member는 DAO의 Candidate라면 누구나 challenge를 통해 Member가 될 수 있습니다. Candidate의 Staking이 더 많이 되어있는 Candidate가 Member가 됩니다.
- DAO의 Member는 언제든 retireMember함수를 통해 retire할 수 있고 retire하게 되면 해당 Member자리는 공석이 됩니다.
- Member는 활동하는 기간동안 reward로 TON을 받게되며 claimActivityReward함수를 통해서 reward를 claim할 수 있습니다.

**Table of Contracts**
- [DAOCommittee]
- [DAOVault]
- [DAOAgendaManager]
- [CandidateFactory]
- [Candidate]

## Agenda Rules

- Vote Rule
    - Member가 Agenda에 대해서 투표할 수 있으며 기권,찬성,반대로 투표할 수 있습니다.
    - 3명의 Member 중 2명이 찬성하면 Agenda는 통과되게 됩니다. (해당 값들은 변경될 수 있습니다.)
    - 투표기간 동안 투표가 되지않은 표들은 기권표로 결정됩니다.
    - Agenda가 생성되고 투표가 시작되기전 멤버가 변경되면 변경된 멤버가 투표할 수 있습니다.
    - 투표가 시작되고 난 뒤 멤버가 변경되어도 이전 멤버만 투표할 수 있습니다.

- Vote Period
    - 기간은 Notice Period, Voting Period, Execute Period로 기간이 나누어집니다.
    - Notice Period는 Agenda가 생성될 때 결정됩니다.
    - Voting Period와 Execute Period는 Member중 누군가 투표하고 난 뒤부터 결정됩니다.
