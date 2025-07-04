
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
- [How to test](#how-to-test)

## tokamak-dao-contracts

This repository contains the DAO contracts of Tokamak Network. Tokamak Network DAO supports all functionality in Tokamak Network contracts. All functions of all contracts are executed only by the DAO. And Tokamak Network foundation doesn't own any contracts(except dao itself. It will be renounced later).


## Documentation 
- Etherscan guide: Interact with DAO contracts using Etherscan guide(will update this part).
- Contract Description: For detailed contract specifications, please refer to the contract description document[[EN](https://github.com/tokamak-network/tokamak-dao-contracts/blob/guide-document-for-user/docs/en/dao-en.md), [KR](https://github.com/tokamak-network/tokamak-dao-contracts/blob/guide-document-for-user/docs/kr/dao-kr.md)].
- Changes in DAOCommitteeV1 : What's added or changed in V1 can be found in [this document](https://github.com/tokamak-network/tokamak-dao-contracts/blob/guide-document-for-user/docs/en/dao-upgraded-en.md).

## Repository
All repositories related to development for TokamakDAO is provided here.


| Type     | Name | Branch | Status                        |
|----------|------|--------|-----------------------|
|     Contract    |   [tokamakDAO](https://github.com/tokamak-network/plasma-evm-contracts) |  `tokamakDAO` | :heavy_check_mark: Completed on Original Version 
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
6. [2024-10-30] [Agenda#13 is Rejected] [This agenda was rejected due to bugs found after audit.] Upgraded the structure because there were some inconveniences in using two types of logic in the existing DAO structure, and added functions that are compatible with StakingV2.5. Please refer to the [link](https://github.com/tokamak-network/ton-staking-v2/blob/mainnet-agenda-test/doc/en/dao-upgraded-en.md) for details. [DAOCommiteeProxy2 : [0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a](https://etherscan.io/address/0xD6175F575F4d32392508Ee2FBbDec9a2E8B3c01a), DAOCommitte_V1 : [0xcC88dFa531512f24A8a5CbCB88F7B6731807EEFe](https://etherscan.io/address/0x5991aebb5271522d33c457bf6df26d83c0daa221), DAOCommitteeOwner: [0x5991Aebb5271522d33C457bf6DF26d83c0dAa221](https://etherscan.io/address/0x5991Aebb5271522d33C457bf6DF26d83c0dAa221)]
7. [2025-04-04] [Agenda#14 is Executed(2025-04-24)] [Audited version] Upgraded the structure because there were some inconveniences in using two types of logic in the existing DAO structure, and added functions that are compatible with StakingV2.5. Please refer to the [link](https://github.com/tokamak-network/tokamak-dao-contracts/blob/main/docs/en/dao-upgraded-en.md) for details. [DAOCommiteeProxy2 : [0x9e7f54efF4A4D35097e0Acb6994A723F1a28368c](https://etherscan.io/address/0x9e7f54efF4A4D35097e0Acb6994A723F1a28368c), DAOCommitte_V1 : [0x9050Af1638f379A018737880aD946CdDA9101A25](https://etherscan.io/address/0x9050Af1638f379A018737880aD946CdDA9101A25), DAOCommitteeOwner: [0xcb9859Dc0fBECa68eFFf2bce289150513fdF7D92](https://etherscan.io/address/0xcb9859Dc0fBECa68eFFf2bce289150513fdF7D92)]
8. [2025-06-17] [Agenda#15 is proposed] This agenda upgrades the Tokamak DAO to utilize the memo field when creating an Agenda for the TIP lifecycle, and addresses currentAgendaStatus function and CandidateAddOnProxy storage configuration issues. You can find more detailed information through the following [link](https://github.com/tokamak-network/ton-staking-v2/issues/311). Newly Deployed Contract : [CandidateAddOnFactory : [0xacf89a80f1ec7b94ea1e184f70e02fa1231cab22](https://etherscan.io/address/0xacf89a80f1ec7b94ea1e184f70e02fa1231cab22#code), DAOCommittee_V2 : [0x9f2242b4859c2b1c2fa327245c65e785983e9f5b](https://etherscan.io/address/0x9f2242b4859c2b1c2fa327245c65e785983e9f5b#code)

## How-to-test
- [Original Test](/docs/test/original-test.md)
- [V1 Test](/docs/test/v1-test.md)
- [V2 Test](/docs/test/v2-test.md)
