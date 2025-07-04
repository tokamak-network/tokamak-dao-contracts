# Blacklist와 CooldownTime 가이드

## 개요

`blacklist`와 `cooldownTime`은 DAO 위원회의 안정성과 공정성을 보장하는 중요한 메커니즘입니다. 이 문서에서는 이 두 기능이 언제 적용되고, 어떻게 작동하는지, 그리고 실제 사용 예제를 설명합니다.

## Blacklist 시스템

### Blacklist란?

Blacklist는 DAO 위원회에서 특정 후보자(Candidate)를 제재하기 위해 사용하는 시스템입니다. Blacklist에 등록된 후보자는 다음과 같은 기능을 사용할 수 없습니다:

- `changeMember()` 함수 호출
- `claimActivityReward()` 함수 호출
- `castVote()` 함수 호출 (의결권 행사 불가)

### 언제 Blacklist에 등록되나요?

Blacklist는 다음 상황에서 자동으로 등록됩니다:

1. **`retireMember()` 함수 호출 시**
   - 현재 멤버가 자발적으로 멤버 자격을 포기할 때
   - 해당 후보자 계약이 자동으로 blacklist에 등록됨

```solidity
function retireMember() external returns (bool) {
    // ... 기존 멤버 정보 처리 ...
    
    blacklist[candidateInfo.candidateContract] = true;
    emit MemberBlacklisted(candidate, block.timestamp);
    
    return true;
}
```

### Blacklist에서 제거하기

Blacklist에서 후보자를 제거하는 것은 오직 DAO의 다음 함수를 통해 가능합니다:

```solidity
function removeFromBlacklist(address _candidate) external onlyOwner {
    require(blacklist[_candidate], "Not blacklisted");
    blacklist[_candidate] = false;
}
```

## CooldownTime 시스템

### CooldownTime이란?

CooldownTime은 `changeMember()` 함수 실행 후 해당 후보자가 다시 `changeMember()`를 호출할 수 있기까지의 대기 시간입니다. 이는 과도한 멤버 변경을 방지하고 시스템의 안정성을 보장합니다.

### 언제 CooldownTime이 적용되나요?

1. **`changeMember()` 함수 실행 시**
   - 후보자가 멤버 자리를 차지할 때
   - 해당 후보자 계약에 cooldown이 설정됨

```solidity
function changeMember(uint256 _memberIndex) external returns (bool) {
    // ... 검증 로직 ...
    
    cooldown[candidateInfo.candidateContract] = block.timestamp + cooldownTime;
    
    // ... 멤버 변경 로직 ...
}
```

2. **CooldownTime 검증**
   - `changeMember()` 호출 시 현재 시간이 cooldown 시간을 지났는지 확인

```solidity
require(cooldown[candidateInfo.candidateContract] < block.timestamp, "DAOCommittee: need cooldown");
```

### CooldownTime 설정

CooldownTime은 DAO의 다음 함수를 통해 설정할 수 있습니다:

```solidity
function setCooldownTime(uint256 _cooltime) external onlyOwner {
    cooldownTime = _cooltime;
    emit SetCooldownTime(cooldownTime);
}
```

## 상태 확인 함수들

### Blacklist 상태 확인

```solidity
// 특정 후보자 계약의 blacklist 상태 확인
mapping(address => bool) public blacklist;
```

### Cooldown 상태 확인

```solidity
// 특정 후보자 계약의 cooldown 시간 확인
mapping(address => uint256) public cooldown;

// 현재 설정된 cooldownTime 확인
uint256 public cooldownTime;
```

## 예제 스크립트

### 1. Blacklist 상태 확인 및 제거 스크립트

### 1-1. BlackList를 제거하는 아젠다 생성 스크립트
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
    
    // 네트워크 확인
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";


    // signer는 Candidate Contract의 operator여야함
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

// 스크립트 실행
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 1-2. MultiSigWallet를 이용해서 BlackList를 제거
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
    
    
    // 네트워크 확인
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";
    let multiSigWalletAddr = "0x82460E7D90e19cF778a2C09DcA75Fc9f79Da877C"


    // signer는 Candidate Contract의 operator여야함
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    // =========================================
    // Owner 권한 확인
    console.log("=== Owner 권한 확인 ===");
    console.log("현재 Signer:", signer.address);
    console.log("등록된 Owners:");
    Owenrs.forEach((owner, index) => {
        console.log(`  ${index + 1}. ${owner}`);
    });
    
    // signer가 Owner 중 하나인지 확인
    const isOwner = Owenrs.some(owner => owner.toLowerCase() === signer.address.toLowerCase());
    
    if (!isOwner) {
        console.error("❌ 실행 불가: 현재 signer가 등록된 Owner가 아닙니다.");
        console.error("Owner 중 하나의 계정으로 실행해주세요.");
        process.exit(1);
    }
    
    console.log("✅ Owner 권한 확인 완료 - 실행 가능합니다.");


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

// 스크립트 실행
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});

```


### 2. CooldownTime 확인 및 설정 스크립트

### 2-1. CooldownTime을 변경 및 확인하는 아젠다 생성 스크립트
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
    
    // 네트워크 확인
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";


    // signer는 Candidate Contract의 operator여야함
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

// 스크립트 실행
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 2-2. CooldownTime을 MultiSigWallet을 이용해서 변경
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
    
    // 네트워크 확인
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    let daoCommitteeProxyAddr = "0xA2101482b28E3D99ff6ced517bA41EFf4971a386";
    let daoAgendaManagerAddr = "0x1444f7a8bC26a3c9001a13271D56d6fF36B44f08";
    let tonAddr = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044";
    let multiSigWalletAddr = "0x82460E7D90e19cF778a2C09DcA75Fc9f79Da877C"


    // signer는 Candidate Contract의 operator여야함
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // =========================================
    // Owner 권한 확인
    console.log("=== Owner 권한 확인 ===");
    console.log("현재 Signer:", signer.address);
    console.log("등록된 Owners:");
    Owenrs.forEach((owner, index) => {
        console.log(`  ${index + 1}. ${owner}`);
    });
    
    // signer가 Owner 중 하나인지 확인
    const isOwner = Owenrs.some(owner => owner.toLowerCase() === signer.address.toLowerCase());
    
    if (!isOwner) {
        console.error("❌ 실행 불가: 현재 signer가 등록된 Owner가 아닙니다.");
        console.error("Owner 중 하나의 계정으로 실행해주세요.");
        process.exit(1);
    }
    
    console.log("✅ Owner 권한 확인 완료 - 실행 가능합니다.");
    
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

// 스크립트 실행
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});

```

## 주의사항

1. **권한 확인**: `removeFromBlacklist()`와 `setCooldownTime()`은 오직 DAO Agenda와 MultiSigWallet에서만 실행할 수 있습니다.

2. **Blacklist 제거 전 확인**: Blacklist에서 제거하기 전에 해당 후보자가 정말로 제재를 해제받아야 하는지 신중히 검토해야 합니다.

3. **CooldownTime 설정**: CooldownTime을 너무 짧게 설정하면 시스템이 불안정해질 수 있고, 너무 길게 설정하면 후보자들의 활동을 과도하게 제한할 수 있습니다.


이 가이드를 통해 Tokamak DAO 시스템의 blacklist와 cooldownTime 메커니즘을 이해하고 테스트할 수 있습니다. 
