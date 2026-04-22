---
제목: 01 Delta from 2.2.0 — 차분 + 선행 2패키지 링크맵
작성일: 2026-04-21
대상 릴리스: claude-kit 2.3.0
선행 참조: `../kit-2.2.0-roadmap/` · `../kit-feedback-archiving/`
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# 01 Delta from 2.2.0

> **결론**: 본 2.3.0 로드맵은 **차분(delta)만 기록**한다. 2.2.0 성과·kit-feedback-archiving 설계 내용은 **복제하지 않고 링크**로만 참조한다 (IMP-KIT-017 재복제 금지 원칙 선례 적용). 본 문서는 두 선행 패키지로 가는 **네비게이션 맵**이자, 2.3.0에서 신규 다루는 영역의 경계선이다.

---

## 1. 2.2.0 성과 요약 (링크만)

2.2.0은 P0 블로커 6건 + IMP-KIT-027 (2.2.1) 전체 완료. 상세는 아래 원본 문서 참조 — 본 로드맵은 복제하지 않는다.

| 주제 | 원본 위치 |
|------|----------|
| 릴리스 노트 2.2.0 | [CHANGELOG.md](../../../CHANGELOG.md#220---2026-04-20) |
| 릴리스 노트 2.2.1 | [CHANGELOG.md](../../../CHANGELOG.md#221---2026-04-20) |
| 2.2.0 로드맵 | [kit-2.2.0-roadmap/02-roadmap-2.2.0-to-2.4.0.md](../kit-2.2.0-roadmap/02-roadmap-2.2.0-to-2.4.0.md) |
| P0 6건 상세 스펙 | [kit-2.2.0-roadmap/03-p0-detailed-specs/](../kit-2.2.0-roadmap/03-p0-detailed-specs/) |
| 2.2.0 검증 전략 | [kit-2.2.0-roadmap/06-verification-strategy.md](../kit-2.2.0-roadmap/06-verification-strategy.md) |

---

## 2. 2.2.0에서 미해결로 남은 이슈 (2.3.0 목표)

2.2.0은 P0 블로커 해소에 집중했으므로 P1 11건이 그대로 이월. 본 로드맵의 [02-p1-execution-plan.md](02-p1-execution-plan.md)가 이들의 실행 계획 SSOT.

| 영역 | 2.2.0 상태 | 2.3.0 목표 | 담당 IMP-KIT |
|------|-----------|-----------|-------------|
| `/plan-review` 수동 호출 | 1회 잔존 | **0회** | IMP-KIT-007 |
| Human Checkpoint 수 | 5+회 | **< 3회** | IMP-KIT-016 |
| 재복제 감지 | 측정 안 됨 | **0건** | IMP-KIT-017 |
| screener 재판정 이력 | 미기록 | **엔트리 기록 100%** | IMP-KIT-008 |
| screener 파일 이동 | 수동 | **자동** | IMP-KIT-009 |
| wireframe 재호출 | 3회 | **≤ 1회** | IMP-KIT-010 |
| architect 스키마 거버넌스 | v1만 | **ajv 검증 + 거버넌스 문서** | IMP-KIT-011 |
| bridge/Phase A 경계 | 중복 | **append-only** | IMP-KIT-012 |
| Dev Gate Draft 플래그 | 부재 | **Draft 주입** | IMP-KIT-013 |
| stage-manifest 버전 | 미관리 | **SemVer + 등록부** | IMP-KIT-014 |
| TASK ID 네이밍 | 혼재 | **4패턴 표준** | IMP-KIT-015 |

---

## 3. 2.3.0 신규 영역 (2.2.0과 독립적으로 추가된 범위)

본 로드맵 집필 과정에서 발견·추가된 **새로운 영역**:

| 영역 | 이유 | 위치 |
|------|------|------|
| 패키지 간 모순 해소 규약 | 선행 두 패키지 간 3건 모순 발견 | [07-boundary-and-contradictions.md](07-boundary-and-contradictions.md) |
| 스키마 거버넌스 공통 원칙 | IMP-KIT-011/014 공통 적용 | 각 스펙 §2 |
| 2.3.0 검증 delta 전용 문서 | 2.2.0 verification을 참조하되 delta만 기록 | [05-verification-2.3.0.md](05-verification-2.3.0.md) |
| Feedback Archiving Phase 3 진입 계약 | 2.3.0 Phase 2.1 완료가 Phase 3 전제 | [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md) |

---

## 4. 선행 2패키지 참조 맵

본 로드맵에서 두 선행 패키지의 **어떤 섹션을 참조하는지** 정리. 단방향 참조 원칙 ([07 §5.1](07-boundary-and-contradictions.md#51-단방향-참조-원칙)) 준수.

### 4.1 kit-2.2.0-roadmap 참조

| 참조 대상 | 본 로드맵 참조 지점 | 참조 이유 |
|----------|---------------------|----------|
| [README.md](../kit-2.2.0-roadmap/README.md) | [README.md](README.md) §선행 패키지 연관도 | 스타일 표준 계승 |
| [00-executive-summary.md](../kit-2.2.0-roadmap/00-executive-summary.md) | [00-executive-summary.md](00-executive-summary.md) §1 | 2.2.0 대비 "왜 2.3.0" 논증 |
| [02-roadmap-2.2.0-to-2.4.0.md §3](../kit-2.2.0-roadmap/02-roadmap-2.2.0-to-2.4.0.md) | [02-p1-execution-plan.md](02-p1-execution-plan.md) §1 | Phase 2.1/2.2/2.3 그룹 계승 |
| [03-p0-detailed-specs/IMP-KIT-001](../kit-2.2.0-roadmap/03-p0-detailed-specs/IMP-KIT-001-dev-architect-chaining.md) | [03-p1-detailed-specs/IMP-KIT-011](03-p1-detailed-specs/IMP-KIT-011-architect-schema.md) §1 | v1 스키마 선행 근거 |
| [04-p1-backlog-summary.md](../kit-2.2.0-roadmap/04-p1-backlog-summary.md) | [02-p1-execution-plan.md](02-p1-execution-plan.md) §1 | P1 11건 원천 SSOT |
| [06-verification-strategy.md §2.1](../kit-2.2.0-roadmap/06-verification-strategy.md) | [05-verification-2.3.0.md](05-verification-2.3.0.md) §1 | 지표 #1~#10 원본 테이블 |
| [08-regression-scenario.md](../kit-2.2.0-roadmap/08-regression-scenario.md) | [05-verification-2.3.0.md](05-verification-2.3.0.md) §4 | 회귀 시나리오 재사용 + 확장 |

### 4.2 kit-feedback-archiving 참조

| 참조 대상 | 본 로드맵 참조 지점 | 참조 이유 |
|----------|---------------------|----------|
| [README.md](../kit-feedback-archiving/README.md) §Phase별 진행 | [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md) §1 | 구현 시점 명시 (모순 ① 해소) |
| [00-executive-summary.md §6](../kit-feedback-archiving/00-executive-summary.md) | [07-boundary-and-contradictions.md](07-boundary-and-contradictions.md) §3 | 주소권 재정의 (모순 ② 해소) |
| [06-integration-with-roadmap.md §2 Phase 3](../kit-feedback-archiving/06-integration-with-roadmap.md) | [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md) §2 | Phase 3 진입 조건 계약 |

### 4.3 원본 회고 참조

모든 IMP-KIT 상세 스펙의 §1 "문제 정의"는 원본 회고 링크만 제공 (본문 복제 금지).

- 경로: `../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`
- 각 스펙 상단 `원본 타임라인: #N` 필드로 세션 로그 위치 명시

### 4.4 P0 완료 커밋 교차 참조

2.3.0 상세 스펙들의 `선행 의존` 필드에서 언급되는 P0 완료분을 [CHANGELOG.md](../../../CHANGELOG.md)에서 찾을 수 있도록 커밋 SHA 매핑 제공 (리뷰 MEDIUM §3.2.2 해소).

| P0 ID | 제목 | 주요 커밋 SHA | 2.3.0 후속 항목 |
|-------|------|---------------|----------------|
| IMP-KIT-001 | dev-architect 체이닝 | [`01790d4`](https://github.com/CtrlCVbot/claude-kit/commit/01790d4), [`537e55f`](https://github.com/CtrlCVbot/claude-kit/commit/537e55f) | IMP-KIT-011 (스키마 거버넌스) |
| IMP-KIT-002 | screener 프레임워크 파라미터 | [`26962cc`](https://github.com/CtrlCVbot/claude-kit/commit/26962cc), [`37dbddf`](https://github.com/CtrlCVbot/claude-kit/commit/37dbddf) | IMP-KIT-008, 009 (screener 보완) |
| IMP-KIT-003 | plan-draft-writer | [`adc84b7`](https://github.com/CtrlCVbot/claude-kit/commit/adc84b7), [`0e9d52f`](https://github.com/CtrlCVbot/claude-kit/commit/0e9d52f) | IMP-KIT-013 (Gate), IMP-KIT-012 (경계) |
| IMP-KIT-004 | plan-bridge-writer | [`68be186`](https://github.com/CtrlCVbot/claude-kit/commit/68be186), [`e7e7742`](https://github.com/CtrlCVbot/claude-kit/commit/e7e7742) | IMP-KIT-012 (경계) |
| IMP-KIT-005 | Read 캐시 재인증 | [`84a11b2`](https://github.com/CtrlCVbot/claude-kit/commit/84a11b2), [`785ef24`](https://github.com/CtrlCVbot/claude-kit/commit/785ef24) | — (전역 효과) |
| IMP-KIT-006 | Hybrid 모드 | [`de2234e`](https://github.com/CtrlCVbot/claude-kit/commit/de2234e), [`742b176`](https://github.com/CtrlCVbot/claude-kit/commit/742b176) | — (copy 도메인) |

상세 스펙의 frontmatter `선행 의존` 필드는 위 표의 P0 ID를 참조 — 복잡한 링크 주입 대신 단방향 조회(스펙 → 본 표)로 SSOT 유지.

---

## 5. 본 로드맵이 SSOT로서 책임지는 영역

선행 패키지에는 없고, 본 로드맵이 **신규 SSOT**로 책임지는 영역:

| 주제 | SSOT 문서 |
|------|----------|
| P1 11건 실행 순서 (그룹 내 정렬) | [02-p1-execution-plan.md §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot) |
| IMP-KIT-008~015 상세 스펙 | [03-p1-detailed-specs/](03-p1-detailed-specs/) 8개 파일 |
| 패키지 간 모순 3건 해소 | [07-boundary-and-contradictions.md](07-boundary-and-contradictions.md) |
| 2.3.0 신규 4지표 측정법 | [05-verification-2.3.0.md §2](05-verification-2.3.0.md) |
| 2.3.0 릴리스 노트 스켈레톤 | [06-release-notes-2.3.0-skeleton.md](06-release-notes-2.3.0-skeleton.md) |

---

## 6. 범위 밖 (본 로드맵에서 다루지 않음)

명시적 비범위:

- 2.2.0 P0 6건 상세 (선행 `kit-2.2.0-roadmap/03-p0-detailed-specs/`가 SSOT)
- 2.2.1 IMP-KIT-027 상세 (동 디렉터리)
- 피드백 아카이빙 수집 로직 (kit-feedback-archiving Phase 3~5, 2.3.0+)
- IMP-KIT-018~026 (P2, 2.4.0+ 범위 — `kit-2.2.0-roadmap/05-p2-backlog-summary.md` 참조)
- 실제 코드 구현 (릴리스 스프린트에서 별도 진행)

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 2 Layer 2) | claude-kit roadmap author |
