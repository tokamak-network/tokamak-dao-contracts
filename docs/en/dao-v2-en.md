# DAO Contract V2 Upgrade for DAO Lifecycle Enhancement and Bug Fixes

## Overview

This is a DAO contract upgrade to support the future TIP (Tokamak Improvement Proposal) lifecycle and fix critical bugs that affect DAO functionality.

## Upgrade Purpose

### 1. Support TIP Lifecycle
- Add memo field to support on-chain voting process
- Build systematic governance process
- Improve community participation

### 2. Fix important bugs
- Fix currentAgendaStatus function bug
- Fix CandidateAddOnFactoryProxy storage configuration issue

## Upgrade Contents

### 1. Add memo field (Support TIP Lifecycle)

#### Role of memo field
- **Community Discussion Link**: Store link to pre-community discussion process for proposals
- **Temperature Check Link**: Store link to Snapshot Temperature Check voting
- **References**: Store link to additional documents that provide background and rationale for the proposal
- **Enhanced Transparency**: Provide full traceability of the proposal process

#### Implementation Method
- Include Temperature Check Snapshot link in memo field when creating on-chain agenda
- Use as reference to help member voting decisions
- Optional inclusion of community discussion link and other references
- Complete proposal history tracking through step-by-step links Possible

### 2. Bug Fixes

#### A. currentAgendaStatus function bug
- **Issue**: Function does not display correct agenda state
- **Impact**: Incorrect status reporting affecting governance decisions
- **Fix**: Logic fix to correctly reflect current agenda state

#### B. CandidateAddOnFactoryProxy storage configuration bug
- **Issue**: Memory configuration mismatch between CandidateAddOnFactoryProxy and CandidateAddOnFactory (logic contract)
- **Impact**: Registered CandidateAddOnFactory contracts cannot become DAO members, blocking important functions
- changeMember: cannot become DAO members
- retireMember: cannot withdraw from DAO
- castVote: cannot participate in votes
- claimActivityReward: cannot claim rewards
- **Fix**: Align memory configuration between proxy and logic contract

## Fixed Contracts

### DAOCommittee_V2
- `onApprove(address owner, address, uint256, bytes calldata data)`
- `_decodeAgendaData(bytes calldata input)`
- `_createAgenda(address _creator, address[] memory _targets, uint128 _noticePeriodSeconds, uint128 _votingPeriodSeconds, bool _atomicExecute, bytes[] memory _functionBytecodes, string memory _memo)`
- `currentAgendaStatus(uint256 _agendaID)`

### CandidateAddOnProxy
- Change storage from CandidateStorage to CandidateAddOnStorage1
- Upgrade CandidateAddOnFactoryProxy to new implementation (CandidateAddOnFactory) via upgradeTo(address)

## Upgrade Effect

### Positive Effects
- **Systematic Governance**: Full technical support for the TIP lifecycle
- **Full Transparency**: Full traceability from pre-discussion to final implementation
- **Enhanced Community Participation**: Support for step-by-step discussion and voting process
- **Critical Bug Fixes**: Restore DAO member functionality in CandidateAddOn contract

### Risk Mitigation
- **Upgrade Risk**: Thoroughly tested through internal audit
- **Backwards Compatibility**: Maintain compatibility with existing agenda processes
- **Storage Layout**: Carefully validated to avoid additional storage conflicts

## Upgrade Schedule

| Phase | Status | Completion Date |
|------|------|--------|
| Development | ✅ Completed | - | | Internal Audit | ✅ Completed | - | | | DAO Proposal | 🔄 In Progress | - | | Implementation | ⏳ Pending | After DAO Approval |

## References

- [DAO Agenda #15 Proposal](https://github.com/tokamak-network/ton-staking-v2/issues/311)
- [CandidateAddOnFactory Bug (Issue #304)](https://github.com/tokamak-network/ton-staking-v2/issues/304)
- [DAO Upgraded Internal Audit](https://github.com/tokamak-network/tokamak-dao-contracts/blob/main/docs/kr/dao-upgraded.md)

## Verification Method

### 1. Memo Field Function Test
```javascript
// Include memo field when creating agenda
const agendaData = {
targets: [targetAddress],
noticePeriodSeconds: [3600],
votingPeriodSeconds: [3600],
atomicExecute: true,
functionBytecode: [functionData],
memo: "https://snapshot.org/#/tokamak.eth/proposal/~"
};

await daoCommittee.onApprove(owner, spender, amount, encodedData);
```

### 2. Test currentAgendaStatus function
```javascript
// Check the correctness of agenda status
const [result, status] = await daoCommittee.currentAgendaStatus(agendaId);
console.log("Agenda Result:", result);
console.log("Agenda Status:", status); 
```

### 3. Test CandidateAddOn membership feature
```javascript
// Check if CandidateAddOn can be a DAO member
await candidateAddOn.changeMember(memberIndex);

// Test voting feature
await candidateAddOn.castVote(agendaId, voteType, comment);

// Test claiming reward
await candidateAddOn.claimActivityReward(receiver); 
```

## Monitoring Plan

### 1. Function Monitoring
- Tracking the usage of TIP Lifecycle memo fields
- Checking the accuracy of agenda status display
- Monitoring the usage of CandidateAddOn membership features

### 2. Performance Monitoring
- Measuring storage access performance
- Checking gas usage optimization
- Tracking transaction success rate

### 3. User Feedback
- Collecting community feedback
- Accepting suggestions for improvements
- Reporting and responding to issues

## Future Plans

### 1. Building TIP Lifecycle
- Standardizing Temperature Check process
- Linking to community discussion platform
- Automating voting process

### 2. Developing additional features
- Improving the usability of memo fields
- Developing governance dashboards
- Building voting analysis tools

### 3. Documentation and Education
- Writing TIP Lifecycle guides
- Updating user manuals
- Supplementing developer documentation

## Conclusion

DAOCommitteeV2 upgrade prepares to support future TIP Lifecycles while building systematic and transparent governance for Tokamak DAO and implementing important changes to the current system. Fix bugs.

### Key Achievements
- ✅ Added memo field to support TIP Lifecycle
- ✅ Fixed bug in currentAgendaStatus function
- ✅ Fixed CandidateAddOnFactoryProxy storage configuration issue
- ✅ Fully restored DAO member functionality
- ✅ Support improved governance process

### Next Steps
- Implement after DAO approval
- Build TIP Lifecycle process
- Continuous monitoring and validation
- Collect and improve community feedback