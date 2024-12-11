# tokamak-dao-contracts

This repository contains the DAO contracts of Tokamak Network. Tokamak Network DAO supports all functionality in Tokamak Network contracts. All functions of all contracts are executed only by the DAO. And Tokamak Network foundation doesn't own any contracts(except dao itself. It will be renounced later).

# DAO Contract Upgraded Work Contents

1. Upgrade to added the ability to execute SeigManger's pause and unpause functions in DAO Contract, change the target's SeigManager address, and create a Candidate designated by the operator. ([0x4B4b52c7042Ae24f74c5C42C09bc925FeFaFA49E](https://etherscan.io/address/0x4B4b52c7042Ae24f74c5C42C09bc925FeFaFA49E)) (2023-09-27)
2. Upgrade to added the ability to execute setGlobalWithdrawalDelay Value and addMinter functions in DAO Contract, After using these functions, revert to the previous logic. ([0x72655449e82211624D5F4D2ABb235bB6Fe2fe989](https://etherscan.io/address/0x72655449e82211624D5F4D2ABb235bB6Fe2fe989)) (2023-10-24)
3. Upgrade to created DAOCommitteeOwner and found an error related to SeigManager, so fixed it urgently. (2023-12-07)
4. Upgrade to disable TON tokens in DAO Vault ([0xba5634e0c432Af80060CF19E0940B59b2DC31173](https://etherscan.io/address/0xba5634e0c432Af80060CF19E0940B59b2DC31173)) (2023-12-07)
5. Upgrade to DAOCommittee_V1 separated the logic that is used separately from DAOCommitteeOwner. founded a calculation error in the Member Claim function and fixed that part. ([0xdF2eCda32970DB7dB3428FC12Bc1697098418815](https://etherscan.io/address/0xdF2eCda32970DB7dB3428FC12Bc1697098418815)) (2024-03-21)
6. Upgraded the structure because there were some inconveniences in using two types of logic in the existing DAO structure, and added functions that are compatible with StakingV2.5. Please refer to the [link](https://github.com/tokamak-network/ton-staking-v2/blob/mainnet-agenda-test/doc/en/dao-upgraded-en.md) for details. [DAOCommiteeProxy2 : 0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a, DAOCommitte_V1 : 0xcC88dFa531512f24A8a5CbCB88F7B6731807EEFe, DAOCommitteeOwner: 0x5991Aebb5271522d33C457bf6DF26d83c0dAa221]


# Deployed contracts on mainnet

## DAO contracts

* DAOVault: [0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303](https://etherscan.io/address/0x2520CD65BAa2cEEe9E6Ad6EBD3F45490C42dd303)
* DAOAgendaManager: [0xcD4421d082752f363E1687544a09d5112cD4f484](https://etherscan.io/address/0xcD4421d082752f363E1687544a09d5112cD4f484)

<s> * CandidateFactory: [0xE6713aF11aDB0cFD3C60e15b23E43f5548C32942](https://etherscan.io/address/0xE6713aF11aDB0cFD3C60e15b23E43f5548C32942)</s>
* Candidate : [0x1a8f59017e0434efc27e89640ac4b7d7d194c0a3](https://etherscan.io/address/0x1a8f59017e0434efc27e89640ac4b7d7d194c0a3)
* CandidateFactory : [0xc5eb1c5ce7196bdb49ea7500ca18a1b9f1fa3ffb](https://etherscan.io/address/0xc5eb1c5ce7196bdb49ea7500ca18a1b9f1fa3ffb)
* CandidateFactoryProxy : [0x9fc7100a16407ee24a79c834a56e6eca555a5d7c](https://etherscan.io/address/0x9fc7100a16407ee24a79c834a56e6eca555a5d7c)
  
<s> * DAOCommitteeOwner : [0xe070fFD0E25801392108076ed5291fA9524c3f44](https://etherscan.io/address/0xe070fFD0E25801392108076ed5291fA9524c3f44)
* DAOCommittee_V1 : [0xdF2eCda32970DB7dB3428FC12Bc1697098418815](https://etherscan.io/address/0xdF2eCda32970DB7dB3428FC12Bc1697098418815) </s>
* DAOCommitteeProxy : [0xDD9f0cCc044B0781289Ee318e5971b0139602C26](https://etherscan.io/address/0xDD9f0cCc044B0781289Ee318e5971b0139602C26)
* DAOCommitteeProxy2 : [0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a](https://etherscan.io/address/0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a)
* DAOCommitteeOwner : [0x5991Aebb5271522d33C457bf6DF26d83c0dAa221](https://etherscan.io/address/0x5991Aebb5271522d33C457bf6DF26d83c0dAa221)
* DAOCommittee_V1 : [0xcC88dFa531512f24A8a5CbCB88F7B6731807EEFe](https://etherscan.io/address/0xcC88dFa531512f24A8a5CbCB88F7B6731807EEFe)
* CandidateAddOnFactoryProxy : [0x61a80Dcf8269f18Ed9bb6C563035651A1756B263](https://etherscan.io/address/0x61a80Dcf8269f18Ed9bb6C563035651A1756B263)
* CandidateAddOnFactory : [0xBda1647ED13483BA68957874BAFB2E5A6E508900](https://etherscan.io/address/0xBda1647ED13483BA68957874BAFB2E5A6E508900)
* CandidateAddOnV1_1 : [0x324b3C030A76c85AaC0B4B85bDc560D0df32f58B](https://etherscan.io/address/0x324b3C030A76c85AaC0B4B85bDc560D0df32f58B)

## plasma-evm-contracts

* TON: [0x2be5e8c109e2197D077D13A82dAead6a9b3433C5](https://etherscan.io/address/0x2be5e8c109e2197D077D13A82dAead6a9b3433C5)
* WTON: [0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2](https://etherscan.io/address/0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2)

<s> * DepositManager: [0x56E465f654393fa48f007Ed7346105c7195CEe43](https://etherscan.io/address/0x56E465f654393fa48f007Ed7346105c7195CEe43)
* SeigManager: [0x710936500aC59e8551331871Cbad3D33d5e0D909](https://etherscan.io/address/0x710936500aC59e8551331871Cbad3D33d5e0D909)
* PowerTON: [0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF](https://etherscan.io/address/0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF)
* Layer2Registry: [0x0b3E174A2170083e770D5d4Cf56774D221b7063e](https://etherscan.io/address/0x0b3E174A2170083e770D5d4Cf56774D221b7063e)
* CoinageFactory: [0x5b40841eeCfB429452AB25216Afc1e1650C07747](https://etherscan.io/address/0x5b40841eeCfB429452AB25216Afc1e1650C07747)</s>

* PowerTONUpgrade : [0x0aa0191e9cc7be9b7228d4d3e3dd65749c93551f](https://etherscan.io/address/0x0aa0191e9cc7be9b7228d4d3e3dd65749c93551f)
* SeigManager : [0x3b1e59c2ff4b850d78ab50cb13a4a482101681b6](https://etherscan.io/address/0x3b1e59c2ff4b850d78ab50cb13a4a482101681b6)
* SeigManagerMigration : [0x19bc9bf93e1abeb169c923da689ffd6a14582593](https://etherscan.io/address/)
* SeigManagerProxy : [0x0b55a0f463b6defb81c6063973763951712d0e5f](https://etherscan.io/address/0x0b55a0f463b6defb81c6063973763951712d0e5f)
* DepositManager : [0x76c01207959df1242c2824b4445cde48eb55d2f1](https://etherscan.io/address/0x76c01207959df1242c2824b4445cde48eb55d2f1)
* DepositManagerForMigration : [0xea729c4e532c17cbdad9149a1a7a645aecbc524c](https://etherscan.io/address/0xea729c4e532c17cbdad9149a1a7a645aecbc524c)
* DepositManagerProxy : [0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e](https://etherscan.io/address/0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e)
* Layer2Registry : [0x296ef64487ecfddcdd03eab35c81c9262dab88ba](https://etherscan.io/address/0x296ef64487ecfddcdd03eab35c81c9262dab88ba)
* Layer2RegistryProxy : [0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b](https://etherscan.io/address/0x7846c2248a7b4de77e9c2bae7fbb93bfc286837b)
* Candidate : [0x1a8f59017e0434efc27e89640ac4b7d7d194c0a3](https://etherscan.io/address/0x1a8f59017e0434efc27e89640ac4b7d7d194c0a3)
* CandidateFactory : [0xc5eb1c5ce7196bdb49ea7500ca18a1b9f1fa3ffb](https://etherscan.io/address/0xc5eb1c5ce7196bdb49ea7500ca18a1b9f1fa3ffb)
* CandidateFactoryProxy : [0x9fc7100a16407ee24a79c834a56e6eca555a5d7c](https://etherscan.io/address/0x9fc7100a16407ee24a79c834a56e6eca555a5d7c)
* RefactorCoinageSnapshot : [0xef12310ff8a6e96357b7d2c4a759b19ce94f7dfb](https://etherscan.io/address/0xef12310ff8a6e96357b7d2c4a759b19ce94f7dfb)
* CoinageFactory : [0xe8fae91b80dd515c3d8b9fc02cb5b2ecfddabf43](https://etherscan.io/address/0xe8fae91b80dd515c3d8b9fc02cb5b2ecfddabf43)

# Deployed contracts on sepolia

## DAO contracts
* DAOVault: [0xB9F6c9E75418D7E5a536ADe08f0218196BB3eBa4](https://sepolia.etherscan.io/address/0xB9F6c9E75418D7E5a536ADe08f0218196BB3eBa4)
* DAOAgendaManager: [0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08](https://sepolia.etherscan.io/address/0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08)
* Candidate : [0xc462834ea537c23C6aAb31c2564dfE16e7CD37BD](https://sepolia.etherscan.io/address/0xc462834ea537c23C6aAb31c2564dfE16e7CD37BD)
* CandidateFactory : [0xc004ae9c774A27d6bE6C860d8c414AC697D4dc28](https://sepolia.etherscan.io/address/0xc004ae9c774A27d6bE6C860d8c414AC697D4dc28)
* CandidateFactoryProxy : [0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f](https://sepolia.etherscan.io/address/0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f)
* DAOCommitteeOwner : [0x34B6e334D88436Fbbb9c316865A1BA454769C090](https://sepolia.etherscan.io/address/0x34B6e334D88436Fbbb9c316865A1BA454769C090)
* DAOCommittee_V1 : [0xB800a42D9A8e5036B75246aeDA578DCe58f85B18](https://sepolia.etherscan.io/address/0xB800a42D9A8e5036B75246aeDA578DCe58f85B18)
* DAOCommitteeProxy: [0xA2101482b28E3D99ff6ced517bA41EFf4971a386](https://sepolia.etherscan.io/address/0xA2101482b28E3D99ff6ced517bA41EFf4971a386)
* DAOCommitteeProxy2: [0x0cb4E974302864D1059028de86757Ca55D121Cb8](https://sepolia.etherscan.io/address/0x0cb4E974302864D1059028de86757Ca55D121Cb8)

## plasma-evm-contracts

* TON: [0xa30fe40285b8f5c0457dbc3b7c8a280373c40044](https://sepolia.etherscan.io/address/0xa30fe40285b8f5c0457dbc3b7c8a280373c40044)
* WTON: [0x79E0d92670106c85E9067b56B8F674340dCa0Bbd](https://sepolia.etherscan.io/address/0x79e0d92670106c85e9067b56b8f674340dca0bbd)
* PowerTONUpgrade : [0x68808D5379763fA07FDb53c707100e1930900F5c](https://sepolia.etherscan.io/address/0x68808D5379763fA07FDb53c707100e1930900F5c)
* SeigManager : [0xe05d62c21f4bba610F411A6F9BddF63cffb43B63](https://sepolia.etherscan.io/address/0xe05d62c21f4bba610F411A6F9BddF63cffb43B63)
* SeigManagerMigration : [0xBa3FBF5980Ba60bEe096cecEcDA3f28AC60904cC](https://sepolia.etherscan.io/address/0xBa3FBF5980Ba60bEe096cecEcDA3f28AC60904cC)
* SeigManagerProxy : [0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7](https://sepolia.etherscan.io/address/0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7)
* DepositManager : [0x2d361b25395907a897f62e87A57b362264F36d7a](https://sepolia.etherscan.io/address/0x2d361b25395907a897f62e87A57b362264F36d7a)
* DepositManagerProxy : [0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F](https://sepolia.etherscan.io/address/0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F)
* Layer2Registry : [0xAdA189ff3D973753971eff71F6F41A9419a4a1F8](https://sepolia.etherscan.io/address/0xAdA189ff3D973753971eff71F6F41A9419a4a1F8)
* Layer2RegistryProxy : [0xA0a9576b437E52114aDA8b0BC4149F2F5c604581](https://sepolia.etherscan.io/address/0xA0a9576b437E52114aDA8b0BC4149F2F5c604581)
* Candidate : [0xc462834ea537c23C6aAb31c2564dfE16e7CD37BD](https://sepolia.etherscan.io/address/0xc462834ea537c23C6aAb31c2564dfE16e7CD37BD)
* CandidateFactory : [0xc004ae9c774A27d6bE6C860d8c414AC697D4dc28](https://sepolia.etherscan.io/address/0xc004ae9c774A27d6bE6C860d8c414AC697D4dc28)
* CandidateFactoryProxy : [0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f](https://sepolia.etherscan.io/address/0x04e3C2B720FB8896A7f9Ea59DdcA85fD45189C7f)
* RefactorCoinageSnapshot : [0x510036C3dDc8D0AB10B8AbEC2ECdf0Aa1dD25FfA](https://sepolia.etherscan.io/address/0x510036C3dDc8D0AB10B8AbEC2ECdf0Aa1dD25FfA)
* CoinageFactory : [0x93258413Ef2998572AB4B269b5DCb963dD35D440](https://sepolia.etherscan.io/address/0x93258413Ef2998572AB4B269b5DCb963dD35D440)
* PowerTONSwapperProxy : [0xbe16830EeD019227892938Ae13C54Ec218772f48](https://sepolia.etherscan.io/address/0xbe16830EeD019227892938Ae13C54Ec218772f48)


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
