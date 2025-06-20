# DAOCommittee_V2

## 개요

DAOCommittee_V2는 Tokamak Network의 DAO(Decentralized Autonomous Organization) 시스템을 관리하는 핵심 컨트랙트입니다. 이 컨트랙트는 후보자(Candidate) 관리, 멤버십 관리, 아젠다(Agenda) 생성 및 투표, 활동 보상 지급 등의 기능을 제공합니다.

## 주요 기능

### 1. 후보자(Candidate) 관리

#### createCandidate
```solidity
function createCandidate(string calldata _memo) external
```
- 새로운 후보자를 등록합니다
- 후보자 컨트랙트를 배포하고 Layer2 레지스트리에 등록합니다
- `msg.sender`가 후보자로 등록됩니다

#### createCandidateOwner
```solidity
function createCandidateOwner(string calldata _memo, address _operatorAddress) public onlyOwner
```
- 관리자가 특정 주소를 후보자로 등록합니다
- `_operatorAddress`가 후보자로 등록됩니다

#### createCandidateAddOn
```solidity
function createCandidateAddOn(string calldata _memo, address _operatorManagerAddress) public returns (address)
```
- Layer2 매니저가 호출하여 AddOn 후보자를 등록합니다
- `_operatorManagerAddress`가 후보자로 등록됩니다

### 2. 멤버십 관리

#### changeMember
```solidity
function changeMember(uint256 _memberIndex) external validMemberIndex(_memberIndex) returns (bool)
```
- 기존 멤버를 새로운 후보자로 교체합니다
- 후보자는 최소 스테이킹 금액을 충족해야 합니다
- 더 많은 스테이킹을 가진 후보자가 우선권을 가집니다

#### retireMember
```solidity
function retireMember() external returns (bool)
```
- 현재 멤버의 자격을 박탈합니다
- 멤버는 블랙리스트에 추가되어 향후 후보자 기능을 사용할 수 없습니다

### 3. 아젠다(Agenda) 관리

#### onApprove
```solidity
function onApprove(address owner, address, uint256, bytes calldata data) external returns (bool)
```
- TON 컨트랙트의 ApproveAndCall 함수입니다
- 아젠다 생성을 위한 데이터를 디코딩하고 검증합니다
- DAO Vault에 대한 특정 함수 호출을 제한합니다:
  - `claimTON`: 차단됨
  - `claimWTON`: 차단됨
  - `claimERC20` with TON address: 차단됨

#### castVote
```solidity
function castVote(uint256 _agendaID, uint256 _vote, string calldata _comment) external validAgendaManager
```
- 아젠다에 대한 투표를 진행합니다
- 투표 타입: 0(기권), 1(찬성), 2(반대)
- 정족수 도달 시 자동으로 결과가 설정됩니다

#### currentAgendaStatus
```solidity
function currentAgendaStatus(uint256 _agendaID) external view returns (CurrentResult currentResult, CurrentStatus currentStatus)
```
- 아젠다의 현재 상태와 결과를 반환합니다

**CurrentResult enum:**
- `PENDING`: 대기 중
- `ACCEPT`: 승인됨
- `REJECT`: 거부됨
- `DISMISS`: 기각됨
- `NO_CONSENSUS`: 합의 없음
- `NO_AGENDA`: 아젠다 없음

**CurrentStatus enum:**
- `NONE`: 없음
- `NOTICE`: 공지 기간
- `VOTING`: 투표 중
- `WAITING_EXEC`: 실행 대기
- `EXECUTED`: 실행됨
- `ENDED`: 종료됨
- `NO_AGENDA`: 아젠다 없음

#### executeAgenda
```solidity
function executeAgenda(uint256 _agendaID) external validAgendaManager
```
- 승인된 아젠다를 실행합니다
- 아젠다의 함수들을 순차적으로 실행합니다

### 4. 보상 관리

#### claimActivityReward
```solidity
function claimActivityReward(address _receiver) public
```
- 멤버의 활동 보상을 청구합니다
- WTON으로 보상이 지급됩니다
- 보상은 멤버십 기간에 비례하여 계산됩니다

#### getClaimableActivityReward
```solidity
function getClaimableActivityReward(address _candidate) public view returns (uint256)
```
- 후보자가 청구할 수 있는 활동 보상 금액을 계산합니다

### 5. 조회 함수

#### isCandidate
```solidity
function isCandidate(address _candidate) external view returns (bool)
```
- 주소가 후보자인지 확인합니다

#### totalSupplyOnCandidate
```solidity
function totalSupplyOnCandidate(address _candidate) external view returns (uint256 totalsupply)
```
- 후보자의 총 스테이킹 금액을 반환합니다

#### balanceOfOnCandidate
```solidity
function balanceOfOnCandidate(address _candidate, address _account) external view returns (uint256 amount)
```
- 특정 계정의 후보자 스테이킹 금액을 반환합니다

#### candidatesLength
```solidity
function candidatesLength() external view returns (uint256)
```
- 등록된 후보자 수를 반환합니다

## 주요 이벤트

### AgendaCreated
```solidity
event AgendaCreated(
    address indexed from,
    uint256 indexed id,
    address[] targets,
    uint128 noticePeriodSeconds,
    uint128 votingPeriodSeconds,
    bool atomicExecute
)
```
- 새로운 아젠다가 생성될 때 발생

### AgendaVoteCasted
```solidity
event AgendaVoteCasted(
    address indexed from,
    uint256 indexed id,
    uint256 voting,
    string comment
)
```
- 아젠다에 투표가 진행될 때 발생

### AgendaExecuted
```solidity
event AgendaExecuted(
    uint256 indexed id,
    address[] target
)
```
- 아젠다가 실행될 때 발생

### CandidateContractCreated
```solidity
event CandidateContractCreated(
    address indexed candidate,
    address indexed candidateContract,
    string memo
)
```
- 새로운 후보자 컨트랙트가 생성될 때 발생

### ChangedMember
```solidity
event ChangedMember(
    uint256 indexed slotIndex,
    address prevMember,
    address indexed newMember
)
```
- 멤버가 변경될 때 발생

### ClaimedActivityReward
```solidity
event ClaimedActivityReward(
    address indexed candidate,
    address receiver,
    uint256 amount
)
```
- 활동 보상이 청구될 때 발생

## 주요 구조체

### AgendaCreatingData
```solidity
struct AgendaCreatingData {
    address[] target;
    uint128 noticePeriodSeconds;
    uint128 votingPeriodSeconds;
    bool atomicExecute;
    bytes[] functionBytecode;
    string memo;
}
```
- 아젠다 생성에 필요한 데이터 구조

## 주요 상수

### 함수 시그니처
```solidity
bytes private constant claimTONBytes = hex"ef0d5594";
bytes private constant claimWTONBytes = hex"f52bba70";
bytes private constant claimERC20Bytes = hex"f848091a";
```
- 차단된 함수들의 시그니처

## 접근 제어

### onlyOwner
- 관리자만 호출할 수 있는 함수들
- `DEFAULT_ADMIN_ROLE`을 가진 계정만 접근 가능

### validMemberIndex
- 유효한 멤버 인덱스인지 확인
- `maxMember`보다 작은 인덱스여야 함

### validAgendaManager
- 유효한 아젠다 매니저인지 확인

## 보안 기능

### 블랙리스트
- `retireMember`로 제거된 멤버는 블랙리스트에 추가됨
- 블랙리스트에 있는 멤버는 후보자 기능을 사용할 수 없음

### 쿨다운
- 멤버 변경 후 일정 기간 동안 재변경이 제한됨
- `cooldownTime`만큼 대기해야 함

### 함수 호출 제한
- DAO Vault에 대한 특정 함수 호출이 제한됨
- TON, WTON, TON 주소로의 claimERC20 호출 차단

## 버전 정보

```solidity
function version() public pure virtual returns (string memory)
```
- 컨트랙트 버전: "2.0.0"

## 상속 구조

DAOCommittee_V2는 다음 컨트랙트들을 상속합니다:
- `StorageStateCommittee`
- `AccessControl`
- `ERC165A`
- `StorageStateCommitteeV2`
- `StorageStateCommitteeV3`

## 사용 예시

### 후보자 등록
```javascript
// 새로운 후보자 등록
await daoCommittee.createCandidate("My Candidate Memo");
```

### 아젠다 투표
```javascript
// 아젠다에 찬성 투표
await daoCommittee.castVote(agendaId, 1, "I support this proposal");
```

### 활동 보상 청구
```javascript
// 활동 보상 청구
await daoCommittee.claimActivityReward(receiverAddress);
```

### 아젠다 상태 확인
```javascript
// 아젠다 상태 조회
const [result, status] = await daoCommittee.currentAgendaStatus(agendaId);
``` 