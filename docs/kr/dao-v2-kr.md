# DAO Contract V2 Upgrade for DAO Lifecycle Enhancement and Bug Fixes

## 개요

미래의 TIP (Tokamak Improvement Proposal) 라이프사이클을 지원하고 DAO 기능에 영향을 미치는 중요한 버그를 수정하기 위한 DAO 컨트랙트 업그레이드입니다.

## 업그레이드 목적

### 1. TIP Lifecycle 지원
- 온체인 투표 프로세스를 지원하기 위한 메모 필드 추가
- 체계적인 거버넌스 프로세스 구축
- 커뮤니티 참여 향상

### 2. 중요 버그 수정
- currentAgendaStatus 함수 버그 수정
- CandidateAddOnFactoryProxy 스토리지 구성 문제 해결

## 업그레이드 내용

### 1. 메모 필드 추가 (TIP Lifecycle 지원)

#### 메모 필드의 역할
- **커뮤니티 토론 링크**: 제안에 대한 사전 커뮤니티 토론 프로세스 링크 저장
- **Temperature Check 링크**: Snapshot Temperature Check 투표 링크 저장
- **참고 자료**: 제안의 배경과 근거를 제공하는 추가 문서 링크 저장
- **향상된 투명성**: 제안 프로세스의 완전한 추적 가능성 제공

#### 구현 방법
- 온체인 아젠다 생성 시 Temperature Check Snapshot 링크를 메모 필드에 포함
- 멤버 투표 결정을 돕기 위한 참고 자료로 활용
- 커뮤니티 토론 링크 및 기타 참고 자료의 선택적 포함
- 단계별 링크를 통한 완전한 제안 이력 추적 가능

### 2. 버그 수정

#### A. currentAgendaStatus 함수 버그
- **문제**: 함수가 정확한 아젠다 상태를 표시하지 않음
- **영향**: 거버넌스 결정에 영향을 미치는 잘못된 상태 보고
- **수정**: 현재 아젠다 상태를 올바르게 반영하도록 로직 수정

#### B. CandidateAddOnFactoryProxy 스토리지 구성 버그
- **문제**: CandidateAddOnFactoryProxy와 CandidateAddOnFactory(로직 컨트랙트) 간의 메모리 구성 불일치
- **영향**: 등록된 CandidateAddOnFactory 컨트랙트가 DAO 멤버가 될 수 없어 중요한 기능들이 차단됨
  - changeMember: DAO 멤버가 될 수 없음
  - retireMember: DAO에서 철회할 수 없음
  - castVote: 투표에 참여할 수 없음
  - claimActivityReward: 보상을 청구할 수 없음
- **수정**: 프록시와 로직 컨트랙트 간의 메모리 구성 정렬

## 수정된 컨트랙트

### DAOCommittee_V2
- `onApprove(address owner, address, uint256, bytes calldata data)`
- `_decodeAgendaData(bytes calldata input)`
- `_createAgenda(address _creator, address[] memory _targets, uint128 _noticePeriodSeconds, uint128 _votingPeriodSeconds, bool _atomicExecute, bytes[] memory _functionBytecodes, string memory _memo)`
- `currentAgendaStatus(uint256 _agendaID)`

### CandidateAddOnProxy
- 스토리지를 CandidateStorage에서 CandidateAddOnStorage1로 변경
- upgradeTo(address)를 통해 CandidateAddOnFactoryProxy를 새로운 구현(CandidateAddOnFactory)으로 업그레이드

## 업그레이드 효과

### 긍정적 효과
- **체계적인 거버넌스**: TIP 라이프사이클에 대한 완전한 기술적 지원
- **완전한 투명성**: 사전 토론부터 최종 실행까지의 완전한 추적 가능성
- **향상된 커뮤니티 참여**: 단계별 토론 및 투표 프로세스 지원
- **중요한 버그 수정**: CandidateAddOn 컨트랙트의 DAO 멤버 기능 복구

### 리스크 완화
- **업그레이드 리스크**: 내부 감사를 통한 철저한 테스트 완료
- **하위 호환성**: 기존 아젠다 프로세스와의 호환성 유지
- **스토리지 레이아웃**: 추가 스토리지 충돌을 방지하기 위한 신중한 검증

## 업그레이드 일정

| 단계 | 상태 | 완료일 |
|------|------|--------|
| 개발 | ✅ 완료 | - |
| 내부 감사 | ✅ 완료 | - |
| DAO 제안 | 🔄 진행 중 | - |
| 구현 | ⏳ 대기 중 | DAO 승인 후 |

## 참고 자료

- [DAO Agenda #15 Proposal](https://github.com/tokamak-network/ton-staking-v2/issues/311)
- [CandidateAddOnFactory Bug (Issue #304)](https://github.com/tokamak-network/ton-staking-v2/issues/304)
- [DAO Upgraded Internal Audit](https://github.com/tokamak-network/tokamak-dao-contracts/blob/main/docs/kr/dao-upgraded.md)

## 검증 방법

### 1. 메모 필드 기능 테스트
```javascript
// 아젠다 생성 시 메모 필드 포함
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

### 2. currentAgendaStatus 함수 테스트
```javascript
// 아젠다 상태 정확성 확인
const [result, status] = await daoCommittee.currentAgendaStatus(agendaId);
console.log("Agenda Result:", result);
console.log("Agenda Status:", status);
```

### 3. CandidateAddOn 멤버십 기능 테스트
```javascript
// CandidateAddOn이 DAO 멤버가 될 수 있는지 확인
await candidateAddOn.changeMember(memberIndex);

// 투표 기능 테스트
await candidateAddOn.castVote(agendaId, voteType, comment);

// 보상 청구 테스트
await candidateAddOn.claimActivityReward(receiver);
```

## 모니터링 계획

### 1. 기능 모니터링
- TIP Lifecycle 메모 필드 사용 현황 추적
- 아젠다 상태 표시 정확성 확인
- CandidateAddOn 멤버십 기능 사용 현황 모니터링

### 2. 성능 모니터링
- 스토리지 접근 성능 측정
- 가스 사용량 최적화 확인
- 트랜잭션 성공률 추적

### 3. 사용자 피드백
- 커뮤니티 피드백 수집
- 개선 사항 제안 접수
- 문제점 신고 및 대응

## 향후 계획

### 1. TIP Lifecycle 구축
- Temperature Check 프로세스 표준화
- 커뮤니티 토론 플랫폼 연동
- 투표 프로세스 자동화

### 2. 추가 기능 개발
- 메모 필드 활용도 향상
- 거버넌스 대시보드 개발
- 투표 분석 도구 구축

### 3. 문서화 및 교육
- TIP Lifecycle 가이드 작성
- 사용자 매뉴얼 업데이트
- 개발자 문서 보완

## 결론

DAOCommitteeV2 업그레이드는 미래의 TIP Lifecycle을 지원할 준비를 하여 Tokamak DAO를 위한 체계적이고 투명한 거버넌스를 구축하면서 현재 시스템의 중요한 버그를 해결합니다.

### 주요 성과
- ✅ TIP Lifecycle 지원을 위한 메모 필드 추가
- ✅ currentAgendaStatus 함수 버그 수정
- ✅ CandidateAddOnFactoryProxy 스토리지 구성 문제 해결
- ✅ DAO 멤버 기능 완전 복구
- ✅ 향상된 거버넌스 프로세스 지원

### 다음 단계
- DAO 승인 후 구현
- TIP Lifecycle 프로세스 구축
- 지속적인 모니터링 및 검증
- 커뮤니티 피드백 수집 및 개선 