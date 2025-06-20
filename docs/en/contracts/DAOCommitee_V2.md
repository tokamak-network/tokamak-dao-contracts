# DAOCommittee_V2

## Overview

DAOCommittee_V2 is a core contract that manages the DAO (Decentralized Autonomous Organization) system of the Tokamak Network. This contract provides functionality for candidate management, membership management, agenda creation and voting, and activity reward distribution.

## Key Features

### 1. Candidate Management

#### createCandidate
```solidity
function createCandidate(string calldata _memo) external
```
- Registers a new candidate
- Deploys a candidate contract and registers it with the Layer2 registry
- `msg.sender` becomes the registered candidate

#### createCandidateOwner
```solidity
function createCandidateOwner(string calldata _memo, address _operatorAddress) public onlyOwner
```
- Allows an admin to register a specific address as a candidate
- `_operatorAddress` becomes the registered candidate

#### createCandidateAddOn
```solidity
function createCandidateAddOn(string calldata _memo, address _operatorManagerAddress) public returns (address)
```
- Called by Layer2 manager to register an AddOn candidate
- `_operatorManagerAddress` becomes the registered candidate

### 2. Membership Management

#### changeMember
```solidity
function changeMember(uint256 _memberIndex) external validMemberIndex(_memberIndex) returns (bool)
```
- Replaces an existing member with a new candidate
- Candidates must meet the minimum staking requirement
- Candidates with more staking have priority

#### retireMember
```solidity
function retireMember() external returns (bool)
```
- Revokes the current member's qualification
- The member is added to the blacklist and cannot use candidate functions in the future

### 3. Agenda Management

#### onApprove
```solidity
function onApprove(address owner, address, uint256, bytes calldata data) external returns (bool)
```
- This is the ApproveAndCall function from the TON contract
- Decodes and validates data for agenda creation
- Restricts specific function calls to DAO Vault:
  - `claimTON`: blocked
  - `claimWTON`: blocked
  - `claimERC20` with TON address: blocked

#### castVote
```solidity
function castVote(uint256 _agendaID, uint256 _vote, string calldata _comment) external validAgendaManager
```
- Casts a vote on an agenda
- Vote types: 0(abstain), 1(yes), 2(no)
- Results are automatically set when quorum is reached

#### currentAgendaStatus
```solidity
function currentAgendaStatus(uint256 _agendaID) external view returns (CurrentResult currentResult, CurrentStatus currentStatus)
```
- Returns the current status and result of an agenda

**CurrentResult enum:**
- `PENDING`: pending
- `ACCEPT`: accepted
- `REJECT`: rejected
- `DISMISS`: dismissed
- `NO_CONSENSUS`: no consensus
- `NO_AGENDA`: no agenda

**CurrentStatus enum:**
- `NONE`: none
- `NOTICE`: notice period
- `VOTING`: voting in progress
- `WAITING_EXEC`: waiting for execution
- `EXECUTED`: executed
- `ENDED`: ended
- `NO_AGENDA`: no agenda

#### executeAgenda
```solidity
function executeAgenda(uint256 _agendaID) external validAgendaManager
```
- Executes an approved agenda
- Executes the agenda's functions sequentially

### 4. Reward Management

#### claimActivityReward
```solidity
function claimActivityReward(address _receiver) public
```
- Claims activity rewards for a member
- Rewards are paid in WTON
- Rewards are calculated proportionally to membership duration

#### getClaimableActivityReward
```solidity
function getClaimableActivityReward(address _candidate) public view returns (uint256)
```
- Calculates the claimable activity reward amount for a candidate

### 5. Query Functions

#### isCandidate
```solidity
function isCandidate(address _candidate) external view returns (bool)
```
- Checks if an address is a candidate

#### totalSupplyOnCandidate
```solidity
function totalSupplyOnCandidate(address _candidate) external view returns (uint256 totalsupply)
```
- Returns the total staking amount of a candidate

#### balanceOfOnCandidate
```solidity
function balanceOfOnCandidate(address _candidate, address _account) external view returns (uint256 amount)
```
- Returns the staking amount of a specific account for a candidate

#### candidatesLength
```solidity
function candidatesLength() external view returns (uint256)
```
- Returns the number of registered candidates

## Key Events

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
- Emitted when a new agenda is created

### AgendaVoteCasted
```solidity
event AgendaVoteCasted(
    address indexed from,
    uint256 indexed id,
    uint256 voting,
    string comment
)
```
- Emitted when a vote is cast on an agenda

### AgendaExecuted
```solidity
event AgendaExecuted(
    uint256 indexed id,
    address[] target
)
```
- Emitted when an agenda is executed

### CandidateContractCreated
```solidity
event CandidateContractCreated(
    address indexed candidate,
    address indexed candidateContract,
    string memo
)
```
- Emitted when a new candidate contract is created

### ChangedMember
```solidity
event ChangedMember(
    uint256 indexed slotIndex,
    address prevMember,
    address indexed newMember
)
```
- Emitted when a member is changed

### ClaimedActivityReward
```solidity
event ClaimedActivityReward(
    address indexed candidate,
    address receiver,
    uint256 amount
)
```
- Emitted when activity rewards are claimed

## Key Structures

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
- Data structure required for agenda creation

## Key Constants

### Function Signatures
```solidity
bytes private constant claimTONBytes = hex"ef0d5594";
bytes private constant claimWTONBytes = hex"f52bba70";
bytes private constant claimERC20Bytes = hex"f848091a";
```
- Signatures of blocked functions

## Access Control

### onlyOwner
- Functions that can only be called by administrators
- Only accounts with `DEFAULT_ADMIN_ROLE` can access

### validMemberIndex
- Validates if the member index is valid
- Index must be less than `maxMember`

### validAgendaManager
- Validates if the agenda manager is valid

## Security Features

### Blacklist
- Members removed via `retireMember` are added to the blacklist
- Blacklisted members cannot use candidate functions

### Cooldown
- Member changes are restricted for a certain period after a change
- Must wait for `cooldownTime` before another change

### Function Call Restrictions
- Specific function calls to DAO Vault are restricted
- Blocks claimERC20 calls with TON address

## Version Information

```solidity
function version() public pure virtual returns (string memory)
```
- Contract version: "2.0.0"

## Inheritance Structure

DAOCommittee_V2 inherits from the following contracts:
- `StorageStateCommittee`
- `AccessControl`
- `ERC165A`
- `StorageStateCommitteeV2`
- `StorageStateCommitteeV3`

## Usage Examples

### Register Candidate
```javascript
// Register a new candidate
await daoCommittee.createCandidate("My Candidate Memo");
```

### Vote on Agenda
```javascript
// Vote yes on an agenda
await daoCommittee.castVote(agendaId, 1, "I support this proposal");
```

### Claim Activity Reward
```javascript
// Claim activity rewards
await daoCommittee.claimActivityReward(receiverAddress);
```

### Check Agenda Status
```javascript
// Query agenda status
const [result, status] = await daoCommittee.currentAgendaStatus(agendaId);
```

## Error Handling

### CreateCandiateError
```solidity
error CreateCandiateError(uint x);
```
- `x = 1`: deployed candidateContract is zero
- `x = 2`: The candidate already has contract
- `x = 3`: failed to registerAndDeployCoinage

### PermissionError
```solidity
error PermissionError();
```
- Thrown when caller lacks required permissions

### ZeroAddressError
```solidity
error ZeroAddressError();
```
- Thrown when zero address is provided where not allowed

### ClaimTONError
```solidity
error ClaimTONError();
```
- Thrown when attempting to claim TON

### ClaimWTONError
```solidity
error ClaimWTONError();
```
- Thrown when attempting to claim WTON

## Important Notes

1. **Gas Optimization**: The contract uses efficient storage patterns and assembly code for critical operations
2. **Security**: Multiple layers of access control and validation ensure secure operation
3. **Upgradability**: The contract is designed to be upgradeable through proxy patterns
4. **Compatibility**: Maintains compatibility with existing DAO infrastructure while adding new features
