
<div align="center">
  <br />
  <br />
  <a href="https://github.com/tokamak-network/tokamak-dao-contracts"><img alt="TonStaking" src="./docs/img/tokamak_DAO.png" width=600></a>
  <br />
  <h3>The Tokamak Network DAO contract creates policies related to Tokamak Network through the Agenda and decides on the execution of the Agenda through voting by the Members.</h3>
  <br />
</div>

**Table of Contents**
- [What is tokamak-dao-contracts?](#tokamak-dao-contracts)
- [Documentation](#documentation)
- [Repository](#repository)
- [Deployed Contracts Addresses](#deployed-contracts-addresses)
- [DAO Contract Upgraded Work Contents](#dao-upgraded-work-contents)

## tokamak-dao-contracts

This repository contains the DAO contracts of Tokamak Network. Tokamak Network DAO supports all functionality in Tokamak Network contracts. All functions of all contracts are executed only by the DAO. And Tokamak Network foundation doesn't own any contracts(except dao itself. It will be renounced later).


## Documentation 
- Etherscan guide: Interact with DAO contracts using Etherscan guide(will update this part).
- Contract Description: For detailed contract specifications, please refer to the contract description document(will update this part).
- Changes in DAOCommitteeV1 : What's added or changed in V1 can be found in [this document](https://github.com/tokamak-network/tokamak-dao-contracts/blob/guide-document-for-user/docs/en/dao-upgraded-en.md).

## Repository
All repositories related to development for TokamakDAO is provided here.


| Type     | Name | Branch | Status                        |
|----------|------|--------|-----------------------|
|     Contract    |   [tokamakDAO](https://github.com/tokamak-network/plasma-evm-contracts) |  `tokamakDAO` | :heavy_check_mark: Completed on Version 1.0
|     Contract    |   [tokamakDAOV1](https://github.com/tokamak-network/ton-staking-v2/tree/mainnet-agenda-test/contracts/dao) |  `tokamakDAOV1` | :heavy_exclamation_mark: External audit in preparation on Version 1.0

## Deployed Contracts Addresses
- [Mainnet Deployed Addresses](/docs/deployed-addresses-mainnet.md)
- [Testnet Deployed Addresses](/docs/deployed-addresses-sepolia.md)

## dao-upgraded-work-contents
1. [2023-09-27] Upgrade to added the ability to execute SeigManger's pause and unpause functions in DAO Contract, change the target's SeigManager address, and create a Candidate designated by the operator. ([0x4B4b52c7042Ae24f74c5C42C09bc925FeFaFA49E](https://etherscan.io/address/0x4B4b52c7042Ae24f74c5C42C09bc925FeFaFA49E)) 
2. [2023-10-24] Upgrade to added the ability to execute setGlobalWithdrawalDelay Value and addMinter functions in DAO Contract, After using these functions, revert to the previous logic. ([0x72655449e82211624D5F4D2ABb235bB6Fe2fe989](https://etherscan.io/address/0x72655449e82211624D5F4D2ABb235bB6Fe2fe989)) 
3. [2023-12-07] Upgrade to created DAOCommitteeOwner and found an error related to SeigManager, so fixed it urgently. (2023-12-07)
4. [2023-12-07] Upgrade to disable TON tokens in DAO Vault ([0xba5634e0c432Af80060CF19E0940B59b2DC31173](https://etherscan.io/address/0xba5634e0c432Af80060CF19E0940B59b2DC31173))
5. [2024-03-21] Upgrade to DAOCommittee_V1 separated the logic that is used separately from DAOCommitteeOwner. founded a calculation error in the Member Claim function and fixed that part. ([0xdF2eCda32970DB7dB3428FC12Bc1697098418815](https://etherscan.io/address/0xdF2eCda32970DB7dB3428FC12Bc1697098418815)) 
6. [createAgenda] Upgraded the structure because there were some inconveniences in using two types of logic in the existing DAO structure, and added functions that are compatible with StakingV2.5. Please refer to the [link](https://github.com/tokamak-network/ton-staking-v2/blob/mainnet-agenda-test/doc/en/dao-upgraded-en.md) for details. [DAOCommiteeProxy2 : [0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a](https://etherscan.io/address/0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a), DAOCommitte_V1 : [0xcC88dFa531512f24A8a5CbCB88F7B6731807EEFe](https://etherscan.io/address/0x5991aebb5271522d33c457bf6df26d83c0daa221), DAOCommitteeOwner: [0x5991Aebb5271522d33C457bf6DF26d83c0dAa221](https://etherscan.io/address/0x5991Aebb5271522d33C457bf6DF26d83c0dAa221)]

# Deployed contracts on mainnet

## DAO contracts

* DAOVault: [0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303](https://etherscan.io/address/0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303)
* DAOAgendaManager: [0xcD4421d082752f363E1687544a09d5112cD4f484](https://etherscan.io/address/0xcD4421d082752f363E1687544a09d5112cD4f484)
* CandidateFactory: [0xE6713aF11aDB0cFD3C60e15b23E43f5548C32942](https://etherscan.io/address/0xE6713aF11aDB0cFD3C60e15b23E43f5548C32942)
* DAOCommittee: [0xd1A3fDDCCD09ceBcFCc7845dDba666B7B8e6D1fb](https://etherscan.io/address/0xd1A3fDDCCD09ceBcFCc7845dDba666B7B8e6D1fb)
* DAOCommitteeProxy: [0xDD9f0cCc044B0781289Ee318e5971b0139602C26](https://etherscan.io/address/0xDD9f0cCc044B0781289Ee318e5971b0139602C26)

## plasma-evm-contracts

* TON: [0x2be5e8c109e2197D077D13A82dAead6a9b3433C5](https://etherscan.io/address/0x2be5e8c109e2197D077D13A82dAead6a9b3433C5)
* WTON: [0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2](https://etherscan.io/address/0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2)
* DepositManager: [0x56E465f654393fa48f007Ed7346105c7195CEe43](https://etherscan.io/address/0x56E465f654393fa48f007Ed7346105c7195CEe43)
* SeigManager: [0x710936500aC59e8551331871Cbad3D33d5e0D909](https://etherscan.io/address/0x710936500aC59e8551331871Cbad3D33d5e0D909)
* PowerTON: [0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF](https://etherscan.io/address/0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF)
* Layer2Registry: [0x0b3E174A2170083e770D5d4Cf56774D221b7063e](https://etherscan.io/address/0x0b3E174A2170083e770D5d4Cf56774D221b7063e)
* CoinageFactory: [0x5b40841eeCfB429452AB25216Afc1e1650C07747](https://etherscan.io/address/0x5b40841eeCfB429452AB25216Afc1e1650C07747)

# How it works

* Agendas: Anyone can create an agenda. An agenda has one or more function executions.
* Members: Members can vote on agendas. And they get rewards based on activity period.
* Candidates: Anyone can be a candidate. The amount of votes a candidate gets is deposited TON amount on the candidate.
* Users: Users can deposit on candidates and get seigniorage.

# Build

```
$ npm install
$ npm run compile:plasma
$ truffle compile
```

# Test

```
$ npm test
```
