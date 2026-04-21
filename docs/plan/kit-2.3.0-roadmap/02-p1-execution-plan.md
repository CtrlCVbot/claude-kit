---
제목: 02 P1 Execution Plan — 11건 RICE 기반 실행 계획 (SSOT)
작성일: 2026-04-21
대상 릴리스: claude-kit 2.3.0
원본 출처: `../kit-2.2.0-roadmap/04-p1-backlog-summary.md`
이해관계자 승인일: 2026-04-21 (D1)
상태: reviewed
---

# 02 P1 Execution Plan

> **결론**: P1 11건의 **실행 순서 SSOT**. kit-2.2.0-roadmap의 3그룹 분류(Phase 2.1/2.2/2.3)를 계승하되, **그룹 내 순서는 RICE 점수 내림차순**으로 확정한다. 의존 그래프 + 병렬 쌍 + Exit Criteria 포함. 본 문서가 [07 §4 모순 ③](07-boundary-and-contradictions.md#4-모순--p1-11건-내부-우선순위) 해소 결과의 공식 근거다.

---

## 1. 릴리스 최소 포함 기준

2.3.0 릴리스를 위해 P1 11건 **전체가 완료**되어야 한다. 부분 완료 시 일부 항목을 2.3.1/2.4.0으로 이월한다.

### 관련 선행 문서

- 그룹 분류: [kit-2.2.0-roadmap/02-roadmap-2.2.0-to-2.4.0.md §3 Phase 2](../kit-2.2.0-roadmap/02-roadmap-2.2.0-to-2.4.0.md)
- 원본 백로그 요약: [kit-2.2.0-roadmap/04-p1-backlog-summary.md](../kit-2.2.0-roadmap/04-p1-backlog-summary.md)
- 피드백 아카이빙 연계: [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md)

---

## 2. RICE 재정렬표 (SSOT)

Phase 내 실행 순서 = RICE 점수 내림차순. 동점 시 영향 도메인 의존성 고려.

| Phase | 순서 | ID | 제목 | RICE | 공수 | 스펙 |
|:-----:|:----:|----|------|:----:|:---:|------|
| 2.1 | 1 | IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 24 | S | [03-p1-detailed-specs/IMP-KIT-007](03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md) (mini) |
| 2.1 | 2 | IMP-KIT-016 | Checkpoint 자동 진행 플래그 | 22.5 | M | [03-p1-detailed-specs/IMP-KIT-016](03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md) (mini) |
| 2.1 | 3 | IMP-KIT-017 | 재복제 금지 Skill 수준 강제 | 18 | S | [03-p1-detailed-specs/IMP-KIT-017](03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md) (mini) |
| 2.2 | 1 | IMP-KIT-009 | screener 파일 이동 권한 확장 | **45** | S | [03-p1-detailed-specs/IMP-KIT-009](03-p1-detailed-specs/IMP-KIT-009-screener-file-move.md) |
| 2.2 | 2 | IMP-KIT-008 | screener 재판정 메모리 기록 | 36 | S | [03-p1-detailed-specs/IMP-KIT-008](03-p1-detailed-specs/IMP-KIT-008-screener-memory.md) |
| 2.2 | 3 | IMP-KIT-010 | wireframe-designer 체크리스트 확장 | 36 | S | [03-p1-detailed-specs/IMP-KIT-010](03-p1-detailed-specs/IMP-KIT-010-wireframe-checklist.md) |
| 2.2 | 4 | IMP-KIT-011 | architect ↔ doc-updater 스키마 거버넌스 | 24 | M | [03-p1-detailed-specs/IMP-KIT-011](03-p1-detailed-specs/IMP-KIT-011-architect-schema.md) |
| 2.3 | 1 | IMP-KIT-015 | TASK ID 네이밍 규칙 표준화 | 30 | S | [03-p1-detailed-specs/IMP-KIT-015](03-p1-detailed-specs/IMP-KIT-015-task-id-naming.md) |
| 2.3 | 2 | IMP-KIT-013 | Dev Gate Draft 조기 플래그 | 18 | M | [03-p1-detailed-specs/IMP-KIT-013](03-p1-detailed-specs/IMP-KIT-013-dev-gate-draft-flag.md) |
| 2.3 | 3 | IMP-KIT-012 | bridge ↔ Phase A 경계 | 13.5 | M | [03-p1-detailed-specs/IMP-KIT-012](03-p1-detailed-specs/IMP-KIT-012-bridge-phase-a-boundary.md) |
| 2.3 | 4 | IMP-KIT-014 | stage-manifest 스키마 버전 관리 | 12 | M | [03-p1-detailed-specs/IMP-KIT-014](03-p1-detailed-specs/IMP-KIT-014-stage-manifest-schema-version.md) |

**주의**: IMP-KIT-007/016/017은 2026-04-21 리뷰 MEDIUM §3.2.1 해소로 **미니 스펙(50~80라인, 공통 템플릿 축약본)** 신규 집필. 원본 백로그는 여전히 SSOT이며, 미니 스펙은 TDD 파일명·영향 파일·롤백 시나리오를 추가 제공한다.

---

## 3. Phase 2.1 — 프로세스 자동화 (1~4주)

### 3.1 실행 순서

```
IMP-KIT-007 (트리거 훅 도입)
  ↓
IMP-KIT-016 (Checkpoint 자동 진행 플래그)
  ↓
IMP-KIT-017 (재복제 금지 Skill 강제)
```

### 3.2 왜 이 순서?

- **007 먼저**: 훅 인프라가 후속 두 항목의 호출 지점이 된다 (Stop 훅 matcher 패턴 재사용).
- **016 두번째**: Checkpoint 진행 플래그는 007의 자동 트리거 체인 안에서 Checkpoint 건너뛰기 정책을 결정한다.
- **017 마지막**: 재복제 금지는 Skill 수준 제약으로, 007/016의 훅·플래그가 안정화된 후 Skill 레이어에 도입.

### 3.3 검증 방법

- **007**: `/plan-draft` 종료 후 `/plan-review` 수동 호출 **0회**
- **016**: 세션당 Human Checkpoint 수 3회 이하
- **017**: 재복제 감지 **0건**

### 3.4 피드백 아카이빙 연계

Phase 2.1 종료 후 kit-feedback-archiving Phase 3 진입 조건 충족. 자세한 연계는 [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md) 참조.

---

## 4. Phase 2.2 — 에이전트 메모리/권한 보완 (5~8주)

### 4.1 실행 순서

```
IMP-KIT-009 (screener 파일 이동 권한)    ─┐
                                           │  병렬 가능
IMP-KIT-008 (screener 재판정 메모리)     ─┘
                  ↓
IMP-KIT-010 (wireframe 체크리스트)       독립, 위 완료와 무관 병렬 가능
                  ↓
IMP-KIT-011 (architect 스키마 거버넌스)  IMP-KIT-001 선행 필수 (2.2.0 완료)
```

### 4.2 왜 이 순서?

- **009 최상위 RICE 45**: screener 전체 흐름 개선 효과 최대.
- **008/009 병렬**: 둘 다 `plan-idea-screener` 확장이나 서로 독립 필드·권한.
- **010 독립**: wireframe 영역, 다른 항목과 무관.
- **011 마지막**: 거버넌스 성숙화는 기존 체이닝(IMP-KIT-001)이 2.2.0에서 안정화된 전제.

### 4.3 검증 방법

- **009**: 파일 이동 수동 개입 0회
- **008**: 재판정 건당 메모리 엔트리 1건
- **010**: Wireframe 재호출 ≤ 1회/세션
- **011**: 재위임 시 수동 파싱 0

---

## 5. Phase 2.3 — 경계/네이밍 정리 (9~12주)

### 5.1 실행 순서

```
IMP-KIT-015 (TASK ID 네이밍 표준)
  ↓
IMP-KIT-013 (Dev Gate Draft 조기 플래그)    # 015의 규칙을 Gate 검증에 활용
  ↓
IMP-KIT-012 (bridge ↔ Phase A 경계)          # 013과 Draft 강화 공통 테마
  ↓
IMP-KIT-014 (stage-manifest 스키마 버전)    # 011 거버넌스 원칙 상속
```

### 5.2 왜 이 순서?

- **015 먼저**: TASK ID 표준이 013의 Gate 체크리스트 항목 2번 "TASK ID 네이밍"의 판정 입력.
- **013 두번째**: Draft 조기 Gate가 012의 Bridge↔Phase A 경계와 합쳐져 "Draft 강화" 공통 테마.
- **012 세번째**: Bridge/Phase A 경계 명확화.
- **014 마지막**: IMP-KIT-011 거버넌스 원칙을 stage-manifest에도 확장.

### 5.3 검증 방법

- **015**: Feature 내 TASK ID 일관성 100%
- **013**: Phase B Checkpoint 질문 수 감소
- **012**: 중복 섹션 수정 건수 감소
- **014**: 스키마 변경 후 소비자 실패 0

---

## 6. 전체 의존 그래프

```
[Phase 2.1 — 1~4주]
  IMP-KIT-007 ──> IMP-KIT-016 ──> IMP-KIT-017
       ↓
[Phase 2.2 — 5~8주]
  IMP-KIT-009 ──┐
  IMP-KIT-008 ──┤ (병렬)
  IMP-KIT-010 ──┤ (병렬, 독립)
  IMP-KIT-011 ←── IMP-KIT-001 (2.2.0 완료)
       ↓
[Phase 2.3 — 9~12주]
  IMP-KIT-015 ──> IMP-KIT-013 ──> IMP-KIT-012 ──> IMP-KIT-014
                                                    ← IMP-KIT-011 거버넌스 상속
```

### 선행 의존 (2.2.0 완료분)

| 본 로드맵 항목 | 선행 의존 (2.2.0 완료) |
|---------------|----------------------|
| IMP-KIT-011 | IMP-KIT-001 (architect 체이닝) |
| IMP-KIT-012 | IMP-KIT-003, 004 (draft/bridge-writer) |
| IMP-KIT-013 | IMP-KIT-003 (plan-draft-writer) |
| IMP-KIT-008, 009 | IMP-KIT-002 (screener 파라미터화) |

---

## 7. 병렬 실행 가능 쌍

| 쌍 | 이유 | 제약 |
|----|------|------|
| IMP-KIT-008 ↔ IMP-KIT-009 | 같은 screener 에이전트지만 독립 필드·권한 | 통합 테스트 시 순서 권장 |
| IMP-KIT-008/009 ↔ IMP-KIT-010 | plan 도메인 내 다른 에이전트 | 없음 |
| IMP-KIT-013 ↔ IMP-KIT-015 | Draft 강화 vs 네이밍 규칙 | 015 우선 필요 (013이 015 규칙 참조) |
| IMP-KIT-012 ↔ IMP-KIT-014 | Phase A 경계 vs 스키마 버전 | 없음 |

병렬 실행으로 Phase 공수 압축 가능. 단 회귀 테스트는 **순차 검증**.

---

## 8. Exit Criteria (2.3.0 릴리스 가능 조건)

| # | 기준 | 측정 방법 |
|:-:|------|----------|
| 1 | P1 11건 전체 단위 테스트 통과 | `pnpm test` 0 실패 |
| 2 | dash-preview-phase3 복제 회귀 시나리오 통과 | [05-verification-2.3.0 §회귀 시나리오](05-verification-2.3.0.md) |
| 3 | 신규 4지표(#7, #8, #9, #10) 목표 달성 | [05-verification-2.3.0 §2](05-verification-2.3.0.md) |
| 4 | CHANGELOG.md Unreleased → 2.3.0 승격 | 릴리스 체크리스트 준수 |
| 5 | Codex 듀얼 타깃 sibling 동기화 | `pairing-registry.json` drift 0 |
| 6 | 08-regression-scenario.md 확장본 존재 | 본 로드맵과 링크 일치 |

Exit Criteria 불충족 항목은 2.3.1 이월.

---

## 9. 공수 합산

| Phase | 건수 | 공수 합계 (S=1, M=3) | 병렬 후 실제 |
|:-:|:-:|:-:|:-:|
| 2.1 | 3 | S + M + S = 5일 | 1~4주 |
| 2.2 | 4 | 3×S + M = 6일 | 5~8주 (병렬 008↔009 효과) |
| 2.3 | 4 | S + 3×M = 10일 | 9~12주 |
| **합계** | **11** | **21일** | **3개월** |

2.2.0(3~4주, 6건)보다 범위는 크지만 P1은 회귀 리스크 낮음.

---

## 10. 이월 조건

2.3.0 릴리스 시점에 Exit Criteria 미충족 항목은 다음 기준으로 이월:

- **2.3.1**: RICE ≥ 24 & 단위 테스트만 실패 시 (회귀는 통과)
- **2.4.0**: RICE < 24 또는 회귀 실패 시
- 항상 이월 대상: 아직 P1 상세 스펙 미존재 항목 (IMP-KIT-007/016/017은 원본 백로그 참조만 존재)

---

## 11. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 2 Layer 2) | claude-kit roadmap author |
