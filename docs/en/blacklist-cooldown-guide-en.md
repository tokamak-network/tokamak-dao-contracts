# Blacklist and CooldownTime Guide

## Overview

`blacklist` and `cooldownTime` are important mechanisms that ensure the stability and fairness of the DAO committee. This document explains when these two features are applied, how they work, and provides practical usage examples.

## Blacklist System

### What is Blacklist?

Blacklist is a system used by the DAO committee to sanction specific candidates. Candidates registered in the blacklist cannot use the following functions:

- `changeMember()` function call
- `claimActivityReward()` function call
- `castVote()` function call (cannot exercise voting rights)

### When are you registered in the Blacklist?

Blacklist is automatically registered in the following situations:

1. **When `retireMember()` function is called**
   - When a current member voluntarily gives up their membership
   - The corresponding candidate contract is automatically registered in the blacklist

```solidity
function retireMember() external returns (bool) {
    // ... existing member information processing ...
    
    blacklist[candidateInfo.candidateContract] = true;
    emit MemberBlacklisted(candidate, block.timestamp);
    
    return true;
}
```

### Removing from Blacklist

Removing a candidate from the blacklist is only possible through the following DAO function:

```solidity
function removeFromBlacklist(address _candidate) external onlyOwner {
    require(blacklist[_candidate], "Not blacklisted");
    blacklist[_candidate] = false;
}
```

## CooldownTime System

### What is CooldownTime?

CooldownTime is the waiting period after the `changeMember()` function is executed before that candidate can call `changeMember()` again. This prevents excessive member changes and ensures system stability.

### When is CooldownTime applied?

1. **When `changeMember()` function is executed**
   - When a candidate takes a member position
   - Cooldown is set for the corresponding candidate contract

```solidity
function changeMember(uint256 _memberIndex) external returns (bool) {
    // ... validation logic ...
    
    cooldown[candidateInfo.candidateContract] = block.timestamp + cooldownTime;
    
    // ... member change logic ...
}
```

2. **CooldownTime validation**
   - When calling `changeMember()`, check if the current time has passed the cooldown time

```solidity
require(cooldown[candidateInfo.candidateContract] < block.timestamp, "DAOCommittee: need cooldown");
```

### Setting CooldownTime

CooldownTime can be set through the following DAO function:

```solidity
function setCooldownTime(uint256 _cooltime) external onlyOwner {
    cooldownTime = _cooltime;
    emit SetCooldownTime(cooldownTime);
}
```

## Status Check Functions

### Blacklist Status Check

```solidity
// Check blacklist status of specific candidate contract
mapping(address => bool) public blacklist;
```

### Cooldown Status Check

```solidity
// Check cooldown time of specific candidate contract
mapping(address => uint256) public cooldown;

// Check currently set cooldownTime
uint256 public cooldownTime;
```

## Example Scripts

### 1. Blacklist Status Check and Removal Script

### 1-1. Script to Create Agenda for Removing BlackList
Script Link : [https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/2.removeblackListAgenda.js](https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/2.removeblackListAgenda.js)

```
npx hardhat run scripts/related-dao/2.removeblackListAgenda.js --network sepolia
```


```javascript
const { ethers } = require("hardhat");

async function main() {
        // removeBlackList Candidate contract address (enter manually)
    const CANDIDATE_ADDRESS = "0xF078AE62eA4740E19ddf6c0c5e17Ecdb820BbEe1"; // Enter the Candidate contract address you want to remove from the blacklist here
    const CANDIDATE_ADDRESS2 = "0xAbD15C021942Ca54aBd944C91705Fe70FEA13f0d"; // Enter the Candidate contract address you want to remove from the blacklist here
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";


    // signer must be the operator of the Candidate Contract
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    //==== Set DAOCommitteeProxy =================================
    let daoCommitteeProxy = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeProxyABI,
        ethers.provider
    )

    //==== Set DAOCommitteeV2 =================================
    let daoCommitteeV2 = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommittee_V2ABI,
        ethers.provider
    )

    //==== Set DAOAgendaManager =================================
    let daoagendaManager = new ethers.Contract(
        daoAgendaManagerAddr,
        DAOAgendaManagerABI,
        ethers.provider
    )

    //==== Set TON =================================
    let ton = new ethers.Contract(
        tonAddr,
        TonABI,
        ethers.provider
    )

    //==== Create Agenda =================================
    let targets = []
    let params = []
    let callDtata

    // =========================================
    // 1. removeFromBlacklist daoCommitteeProxy2Contract

    console.log("=== Check Blacklist Status ===");

    let isBlacklisted = await daoCommittee.blacklist(CANDIDATE_ADDRESS);

    if(isBlacklisted) {
        console.log("Candidate 1 is blacklisted.");
        targets.push(daoCommitteeProxyAddr)
        callDtata = daoCommitteeV2.interface.encodeFunctionData("removeFromBlacklist", [CANDIDATE_ADDRESS])
        params.push(callDtata)
    }


    // =========================================
    // 2. removeFromBlacklist daoCommitteeProxy2Contract

    isBlacklisted = await daoCommittee.blacklist(CANDIDATE_ADDRESS);

    if(isBlacklisted) {
        console.log("Candidate 2 is blacklisted.");
        targets.push(daoCommitteeProxyAddr)
        callDtata = daoCommitteeV2.interface.encodeFunctionData("removeFromBlacklist", [CANDIDATE_ADDRESS2])
        params.push(callDtata)
    }
  
    
    // =========================================
    // . make an agenda
    const memo = ""
    const noticePeriod = await daoagendaManager.minimumNoticePeriodSeconds();
    const votingPeriod = await daoagendaManager.minimumVotingPeriodSeconds();
    const agendaFee = await daoagendaManager.createAgendaFees();
    const param = Web3EthAbi.encodeParameters(
        ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
        [
            targets,
            noticePeriod.toString(),
            votingPeriod.toString(),
            true,
            params,
            memo
        ]
    )


    // =========================================
    // Propose an agenda
    console.log("deployerAddr :", signer.address)
    let receipt = await ton.connect(signer).approveAndCall(
        daoCommitteeProxy.address,
        agendaFee,
        param
    )
    console.log("tx Hash :", receipt.hash)
    console.log(receipt)
    console.log(receipt.nonce)
}

// Execute script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 1-2. Remove BlackList using MultiSigWallet
Script Link : [https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/6.removeblackListMultiSigWallet.js](https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/6.removeblackListMultiSigWallet.js)

```
npx hardhat run scripts/related-dao/6.removeblackListMultiSigWallet.js --network sepolia
```

```javascript
async function main() {
    // MultiSigWallet can only be executed by Owners. 
    // The Owners currently set in Sepolia are as follows:
    let Owenrs = [
        "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea",
        "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2",
        "0xc1eba383D94c6021160042491A5dfaF1d82694E6"
    ]

    // removeBlackList Candidate contract address (enter manually)
    const CANDIDATE_ADDRESS = "0xF078AE62eA4740E19ddf6c0c5e17Ecdb820BbEe1"; // Enter the Candidate contract address you want to remove from the blacklist here
    
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";
    let multiSigWalletAddr = "0x82460E7D90e19cF778a2C09DcA75Fc9f79Da877C"


    // signer must be the operator of the Candidate Contract
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    // =========================================
    // Check Owner permissions
    console.log("=== Check Owner Permissions ===");
    console.log("Current Signer:", signer.address);
    console.log("Registered Owners:");
    Owenrs.forEach((owner, index) => {
        console.log(`  ${index + 1}. ${owner}`);
    });
    
    // Check if signer is one of the Owners
    const isOwner = Owenrs.some(owner => owner.toLowerCase() === signer.address.toLowerCase());
    
    if (!isOwner) {
        console.error("❌ Execution not possible: Current signer is not a registered Owner.");
        console.error("Please execute with one of the Owner accounts.");
        process.exit(1);
    }
    
    console.log("✅ Owner permission check completed - execution is possible.");


    //==== Set DAOCommitteeProxy =================================
    let daoCommitteeProxy = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeProxyABI,
        ethers.provider
    )

    //==== Set DAOCommitteeV2 =================================
    let daoCommitteeV2 = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommittee_V2ABI,
        ethers.provider
    )

    //==== Set MultiSigWallet =================================
    let MultiSigWallet = new ethers.Contract(
        multiSigWalletAddr,
        MultiSigWalletABI,
        ethers.provider
    )

    // =========================================
    // removeFromBlacklist from MultiSigWallet

    console.log("=== Check Blacklist Status ===");

    let isBlacklisted = await daoCommitteeV2.blacklist(CANDIDATE_ADDRESS);

    if(isBlacklisted) {
        const data = DAOCommitteeV2.interface.encodeFunctionData(
            "removeFromBlacklist",
            [CANDIDATE_ADDRESS]
        )
    
        await MultiSigWallet.connect(signer).submitTransaction(
            daoCommitteeProxyAddr,  
            0,
            data
        );
    } 

}

// Execute script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});

```


### 2. CooldownTime Check and Setting Script

### 2-1. Script to Create Agenda for Changing and Checking CooldownTime
Script Link : [https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/5.cooldownTimeAgenda.js](https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/5.cooldownTimeAgenda.js)

```
npx hardhat run scripts/related-dao/5.cooldownTimeAgenda.js --network sepolia
```

```javascript
const { ethers } = require("hardhat");

async function main() {
    // Address of candidate who wants to check cooldown time (enter manually)
    const CANDIDATE_ADDRESS = "0xF078AE62eA4740E19ddf6c0c5e17Ecdb820BbEe1"; 


    // make the Cooldown Agenda
    let createAgenda = false
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";


    // signer must be the operator of the Candidate Contract
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    //==== Set DAOCommitteeProxy =================================
    let daoCommitteeProxy = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeProxyABI,
        ethers.provider
    )

    //==== Set DAOCommitteeOwner =================================
    let daoCommitteeOwner = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeOwnerABI,
        ethers.provider
    )

    //==== Set DAOAgendaManager =================================
    let daoagendaManager = new ethers.Contract(
        daoAgendaManagerAddr,
        DAOAgendaManagerABI,
        ethers.provider
    )

    //==== Set TON =================================
    let ton = new ethers.Contract(
        tonAddr,
        TonABI,
        ethers.provider
    )

    //==== Create Agenda =================================
    let targets = []
    let params = []
    let callDtata

    // =========================================
    // 1. Check the currently set cooldownTime

    console.log("=== Check CooldownTime Status ===");

    let currentCooldownTime = await daoCommitteeOwner.cooldownTime();
    console.log(`Now Setting cooldownTime: ${currentCooldownTime} seconds`);


    // =========================================
    // 2. Check the cooldown status of a specific candidate
    if(CANDIDATE_ADDRESS != "") {
        let candidateCooldown = await daoCommitteeOwner.cooldown(CANDIDATE_ADDRESS);
        const currentTime = Math.floor(Date.now() / 1000);
        
        console.log(`Cooldown time for candidate ${CANDIDATE_ADDRESS}: ${candidateCooldown}`);
        
        if (candidateCooldown > currentTime) {
            const remainingTime = candidateCooldown - currentTime;
            console.log(`⏰ Cooldown remaining time: ${remainingTime} seconds`);
            console.log(`Cooldown is about to expire: ${new Date(candidateCooldown * 1000)}`);
        } else {
            console.log("✅ Cooldown has expired and changeMember can be executed.");
        }
    }


    
    // =========================================
    // . make an agenda
    if (createAgenda) {
        let changedcooldownTime = 300
    
        targets.push(daoCommitteeProxyAddr)
        callDtata = daoCommitteeOwner.interface.encodeFunctionData("setCooldownTime", [changedcooldownTime])
        params.push(callDtata)
    
        const memo = ""
        const noticePeriod = await daoagendaManager.minimumNoticePeriodSeconds();
        const votingPeriod = await daoagendaManager.minimumVotingPeriodSeconds();
        const agendaFee = await daoagendaManager.createAgendaFees();
        const param = Web3EthAbi.encodeParameters(
            ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
            [
                targets,
                noticePeriod.toString(),
                votingPeriod.toString(),
                true,
                params,
                memo
            ]
        )
    
    
        // =========================================
        // Propose an agenda
        console.log("deployerAddr :", signer.address)
        let receipt = await ton.connect(signer).approveAndCall(
            daoCommitteeProxy.address,
            agendaFee,
            param
        )
        console.log("tx Hash :", receipt.hash)
        console.log(receipt)
        console.log(receipt.nonce)
    }
}

// Execute script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 2-2. Change CooldownTime using MultiSigWallet
Script Link : [https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/7.cooldownTimeMultiSigWallet.js](https://github.com/tokamak-network/ton-staking-v2/blob/deploy-candidateAndDAO/scripts/related-dao/7.cooldownTimeMultiSigWallet.js)

```
npx hardhat run scripts/related-dao/7.cooldownTimeMultiSigWallet.js --network sepolia
```

```javascript
async function main() {
    // MultiSigWallet can only be executed by Owners. 
    // The Owners currently set in Sepolia are as follows:
    let Owenrs = [
        "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea",
        "0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2",
        "0xc1eba383D94c6021160042491A5dfaF1d82694E6"
    ]

    // Address of candidate who wants to check cooldown time (enter manually)
    const CANDIDATE_ADDRESS = "0xF078AE62eA4740E19ddf6c0c5e17Ecdb820BbEe1"; 


    // make the MultiSigWallet submit
    let submit = false
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";
    let multiSigWalletAddr = "0x82460E7D90e19cF778a2C09DcA75Fc9f79Da877C"


    // signer must be the operator of the Candidate Contract
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // =========================================
    // Check Owner permissions
    console.log("=== Check Owner Permissions ===");
    console.log("Current Signer:", signer.address);
    console.log("Registered Owners:");
    Owenrs.forEach((owner, index) => {
        console.log(`  ${index + 1}. ${owner}`);
    });
    
    // Check if signer is one of the Owners
    const isOwner = Owenrs.some(owner => owner.toLowerCase() === signer.address.toLowerCase());
    
    if (!isOwner) {
        console.error("❌ Execution not possible: Current signer is not a registered Owner.");
        console.error("Please execute with one of the Owner accounts.");
        process.exit(1);
    }
    
    console.log("✅ Owner permission check completed - execution is possible.");
    
    //==== Set DAOCommitteeProxy =================================
    let daoCommitteeProxy = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeProxyABI,
        ethers.provider
    )

    //==== Set DAOCommitteeOwner =================================
    let daoCommitteeOwner = new ethers.Contract(
        daoCommitteeProxyAddr,
        DAOCommitteeOwnerABI,
        ethers.provider
    )


    //==== Set MultiSigWallet =================================
    let MultiSigWallet = new ethers.Contract(
        multiSigWalletAddr,
        MultiSigWalletABI,
        ethers.provider
    )

    // =========================================
    // 1. Check the currently set cooldownTime

    console.log("=== Check CooldownTime Status ===");

    let currentCooldownTime = await daoCommitteeOwner.cooldownTime();
    console.log(`Now Setting cooldownTime: ${currentCooldownTime} seconds`);


    // =========================================
    // 2. Check the cooldown status of a specific candidate
    if(CANDIDATE_ADDRESS != "") {
        let candidateCooldown = await daoCommitteeOwner.cooldown(CANDIDATE_ADDRESS);
        const currentTime = Math.floor(Date.now() / 1000);
        
        console.log(`Cooldown time for candidate ${CANDIDATE_ADDRESS}: ${candidateCooldown}`);
        
        if (candidateCooldown > currentTime) {
            const remainingTime = candidateCooldown - currentTime;
            console.log(`⏰ Cooldown remaining time: ${remainingTime} seconds`);
            console.log(`Cooldown is about to expire: ${new Date(candidateCooldown * 1000)}`);
        } else {
            console.log("✅ Cooldown has expired and changeMember can be executed.");
        }
    }
    
    // =========================================
    // setCooldownTime from MultiSigWallet
    if (submit) {
        let cooldowntimeSet = 300
        const data = daoCommitteeOwner.interface.encodeFunctionData(
            "setCooldownTime",
            [cooldowntimeSet]
        )
    
        await MultiSigWallet.connect(signer).submitTransaction(
            daoCommitteeProxyAddr,  
            0,
            data
        );
    }

}

// Execute script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});

```

## Important Notes

1. **Permission Check**: `removeFromBlacklist()` and `setCooldownTime()` can only be executed through DAO Agenda and MultiSigWallet.

2. **Blacklist Removal Verification**: Before removing from the blacklist, carefully review whether the candidate should really be released from sanctions.

3. **CooldownTime Setting**: Setting CooldownTime too short can make the system unstable, and setting it too long can excessively restrict candidate activities.


Through this guide, you can understand and test the blacklist and cooldownTime mechanisms of the Tokamak DAO system. 