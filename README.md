# tokamak-dao-contracts

This repository contains the DAO contracts of Tokamak Network. Tokamak Network DAO supports all functionality in Tokamak Network contracts. All functions of all contracts are executed only by the DAO. And Tokamak Network foundation doesn't own any contracts(except dao itself. It will be renounced later).

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
