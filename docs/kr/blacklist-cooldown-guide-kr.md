# Blacklist와 CooldownTime 가이드

## 개요

TON Staking V2 시스템에서 `blacklist`와 `cooldownTime`은 DAO 위원회의 안정성과 공정성을 보장하는 중요한 메커니즘입니다. 이 문서에서는 이 두 기능이 언제 적용되고, 어떻게 작동하는지, 그리고 실제 사용 예제를 설명합니다.

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

Blacklist에서 후보자를 제거하는 것은 오직 DAO 위원회의 소유자(Owner)만 가능합니다:

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

CooldownTime은 DAO 위원회 소유자가 설정할 수 있습니다:

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

```javascript
const { ethers } = require("hardhat");

async function checkAndRemoveFromBlacklist() {
    // DAO 위원회 계약 주소
    const daoCommitteeAddress = "0x..."; // 실제 주소로 변경
    const candidateAddress = "0x..."; // 확인할 후보자 주소로 변경
    
    // DAO 위원회 계약 인스턴스 생성
    const daoCommittee = await ethers.getContractAt("DAOCommittee_V2", daoCommitteeAddress);
    
    console.log("=== Blacklist 상태 확인 ===");
    
    // 1. 현재 blacklist 상태 확인
    const isBlacklisted = await daoCommittee.blacklist(candidateAddress);
    console.log(`후보자 ${candidateAddress}의 blacklist 상태: ${isBlacklisted}`);
    
    if (isBlacklisted) {
        console.log("후보자가 blacklist에 등록되어 있습니다.");
        
        // 2. DAO 소유자 계정 가져오기 (실제 소유자 주소로 변경)
        const [owner] = await ethers.getSigners();
        
        try {
            // 3. Blacklist에서 제거
            console.log("Blacklist에서 제거 중...");
            const tx = await daoCommittee.connect(owner).removeFromBlacklist(candidateAddress);
            await tx.wait();
            
            console.log("✅ Blacklist에서 성공적으로 제거되었습니다.");
            
            // 4. 제거 후 상태 재확인
            const newBlacklistStatus = await daoCommittee.blacklist(candidateAddress);
            console.log(`제거 후 blacklist 상태: ${newBlacklistStatus}`);
            
        } catch (error) {
            console.error("❌ Blacklist 제거 실패:", error.message);
        }
    } else {
        console.log("후보자는 blacklist에 등록되어 있지 않습니다.");
    }
}

// 스크립트 실행
checkAndRemoveFromBlacklist()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 2. CooldownTime 확인 및 설정 스크립트

```javascript
const { ethers } = require("hardhat");

async function checkAndSetCooldownTime() {
    // DAO 위원회 계약 주소
    const daoCommitteeAddress = "0x..."; // 실제 주소로 변경
    const candidateAddress = "0x..."; // 확인할 후보자 주소로 변경
    
    // DAO 위원회 계약 인스턴스 생성
    const daoCommittee = await ethers.getContractAt("DAOCommittee_V2", daoCommitteeAddress);
    
    console.log("=== CooldownTime 상태 확인 ===");
    
    // 1. 현재 설정된 cooldownTime 확인
    const currentCooldownTime = await daoCommittee.cooldownTime();
    console.log(`현재 설정된 cooldownTime: ${currentCooldownTime}초`);
    
    // 2. 특정 후보자의 cooldown 상태 확인
    const candidateCooldown = await daoCommittee.cooldown(candidateAddress);
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log(`후보자 ${candidateAddress}의 cooldown 시간: ${candidateCooldown}`);
    console.log(`현재 시간: ${currentTime}`);
    
    if (candidateCooldown > currentTime) {
        const remainingTime = candidateCooldown - currentTime;
        console.log(`⏰ Cooldown 남은 시간: ${remainingTime}초`);
        console.log(`Cooldown 만료 예정: ${new Date(candidateCooldown * 1000)}`);
    } else {
        console.log("✅ Cooldown이 만료되어 changeMember를 실행할 수 있습니다.");
    }
    
    // 3. CooldownTime 변경 (DAO 소유자만 가능)
    const newCooldownTime = 3600; // 1시간으로 설정
    
    try {
        const [owner] = await ethers.getSigners();
        
        console.log(`\n=== CooldownTime을 ${newCooldownTime}초로 변경 ===");
        const tx = await daoCommittee.connect(owner).setCooldownTime(newCooldownTime);
        await tx.wait();
        
        console.log("✅ CooldownTime이 성공적으로 변경되었습니다.");
        
        // 4. 변경 후 cooldownTime 확인
        const updatedCooldownTime = await daoCommittee.cooldownTime();
        console.log(`변경된 cooldownTime: ${updatedCooldownTime}초`);
        
    } catch (error) {
        console.error("❌ CooldownTime 변경 실패:", error.message);
    }
}

// 스크립트 실행
checkAndSetCooldownTime()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 3. 종합 상태 확인 스크립트

```javascript
const { ethers } = require("hardhat");

async function comprehensiveStatusCheck() {
    // DAO 위원회 계약 주소
    const daoCommitteeAddress = "0x..."; // 실제 주소로 변경
    const candidateAddresses = [
        "0x...", // 후보자 1
        "0x...", // 후보자 2
        "0x..."  // 후보자 3
    ];
    
    // DAO 위원회 계약 인스턴스 생성
    const daoCommittee = await ethers.getContractAt("DAOCommittee_V2", daoCommitteeAddress);
    
    console.log("=== 종합 상태 확인 ===");
    
    // 1. 전체 cooldownTime 확인
    const globalCooldownTime = await daoCommittee.cooldownTime();
    console.log(`\n📋 전체 cooldownTime: ${globalCooldownTime}초`);
    
    const currentTime = Math.floor(Date.now() / 1000);
    console.log(`현재 시간: ${currentTime} (${new Date(currentTime * 1000)})`);
    
    // 2. 각 후보자별 상태 확인
    for (let i = 0; i < candidateAddresses.length; i++) {
        const candidateAddress = candidateAddresses[i];
        console.log(`\n--- 후보자 ${i + 1}: ${candidateAddress} ---`);
        
        // Blacklist 상태 확인
        const isBlacklisted = await daoCommittee.blacklist(candidateAddress);
        console.log(`Blacklist 상태: ${isBlacklisted ? "🔴 등록됨" : "🟢 정상"}`);
        
        // Cooldown 상태 확인
        const cooldownTime = await daoCommittee.cooldown(candidateAddress);
        if (cooldownTime > 0) {
            if (cooldownTime > currentTime) {
                const remainingTime = cooldownTime - currentTime;
                console.log(`Cooldown 상태: ⏰ ${remainingTime}초 남음`);
                console.log(`만료 예정: ${new Date(cooldownTime * 1000)}`);
            } else {
                console.log(`Cooldown 상태: ✅ 만료됨`);
            }
        } else {
            console.log(`Cooldown 상태: 🟢 설정되지 않음`);
        }
        
        // 멤버 상태 확인
        try {
            const candidateInfo = await daoCommittee._candidateInfos(candidateAddress);
            if (candidateInfo.memberJoinedTime > 0) {
                console.log(`멤버 상태: 👑 현재 멤버 (인덱스: ${candidateInfo.indexMembers})`);
            } else {
                console.log(`멤버 상태: 👤 후보자`);
            }
        } catch (error) {
            console.log(`멤버 상태: ❓ 정보 없음`);
        }
    }
}

// 스크립트 실행
comprehensiveStatusCheck()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

## 주의사항

1. **권한 확인**: `removeFromBlacklist()`와 `setCooldownTime()`은 오직 DAO 소유자만 실행할 수 있습니다.

2. **Blacklist 제거 전 확인**: Blacklist에서 제거하기 전에 해당 후보자가 정말로 제재를 해제받아야 하는지 신중히 검토해야 합니다.

3. **CooldownTime 설정**: CooldownTime을 너무 짧게 설정하면 시스템이 불안정해질 수 있고, 너무 길게 설정하면 후보자들의 활동을 과도하게 제한할 수 있습니다.

4. **가스비 고려**: 블록체인 트랜잭션이므로 충분한 가스비를 확보해야 합니다.

## 이벤트 모니터링

다음 이벤트들을 모니터링하여 상태 변화를 추적할 수 있습니다:

```javascript
// Blacklist 관련 이벤트
daoCommittee.on("MemberBlacklisted", (member, timestamp) => {
    console.log(`후보자 ${member}가 blacklist에 등록됨: ${new Date(timestamp * 1000)}`);
});

// CooldownTime 변경 이벤트
daoCommittee.on("SetCooldownTime", (cooldownTime) => {
    console.log(`CooldownTime이 ${cooldownTime}초로 변경됨`);
});

// 멤버 변경 이벤트
daoCommittee.on("ChangedMember", (slotIndex, prevMember, newMember) => {
    console.log(`멤버 변경: 슬롯 ${slotIndex}, ${prevMember} → ${newMember}`);
});
```

이 가이드를 통해 TON Staking V2 시스템의 blacklist와 cooldownTime 메커니즘을 효과적으로 관리할 수 있습니다. 