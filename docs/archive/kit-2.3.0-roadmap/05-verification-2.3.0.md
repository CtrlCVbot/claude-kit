---
제목: 05 Verification 2.3.0 — 검증 delta (신규 4지표)
작성일: 2026-04-21
대상: QA, 릴리스 책임자
선행 참조: `../kit-2.2.0-roadmap/06-verification-strategy.md` · `../kit-2.2.0-roadmap/08-regression-scenario.md`
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# 05 Verification 2.3.0

> **결론**: 2.2.0 verification 테이블(지표 #1~#6)은 [선행 문서](../kit-2.2.0-roadmap/06-verification-strategy.md)가 SSOT. 본 문서는 **2.3.0 신규 4지표(#7/#8/#9/#10)의 측정법과 P1 11건 테스트 매트릭스만 기록**한다. 회귀 시나리오는 선행 08-regression-scenario.md를 **확장**한다. Codex 듀얼 타깃 검증 포인트 포함.

---

## 1. 선행 verification 참조

2.2.0의 지표 #1~#6은 2.3.0에도 **목표 유지**. 측정법도 동일. 복제하지 않고 링크만 제공:

- [kit-2.2.0-roadmap/06-verification-strategy.md §2.1 지표 테이블](../kit-2.2.0-roadmap/06-verification-strategy.md)

지표 #1~#6 요약 (2.3.0 목표):

| # | 지표 | 2.2.0 달성 | 2.3.0 목표 |
|:-:|------|:-:|:-:|
| 1 | Phase C 재위임 | 0회 | **0회 유지** |
| 2 | 프레임워크 drift | 0회 | **0회 유지** |
| 3 | Read 캐시 에러 | < 1% | **0** |
| 4 | Hybrid 수동 지시 | 0회 | **0회 유지** |
| 5 | 수동 Edit 건수 | < 15 | **< 10** |
| 6 | Human Checkpoint 수 | < 5 | **< 3** |

---

## 2. 2.3.0 신규 4지표 측정법 (본 문서 SSOT)

### 2.1 지표 #7 — `/plan-review` 수동 호출

- **목표**: 0회
- **담당 IMP-KIT**: IMP-KIT-007
- **측정**: dash-preview-phase3 복제 세션 중 `/plan-review` 호출 로그의 `source == "auto"` 비율
- **통과 기준**: 전체 호출 중 `source == "auto"` 100% (수동 호출 0건)
- **측정 스크립트**: `scripts/verify-auto-review.js` (신규, `.claude/logs/command-invocations.jsonl` 분석)

### 2.2 지표 #8 — 재복제 감지 건수

- **목표**: 0건
- **담당 IMP-KIT**: IMP-KIT-017
- **측정**: Skill 수준 가드가 재복제 시도를 차단한 로그 카운트
- **통과 기준**: 1세션 내 감지 0건
- **측정 스크립트**: `scripts/verify-no-duplication.js` (Skill 가드 로그 파싱)

### 2.3 지표 #9 — 에이전트 호출 텔레메트리 커버리지

- **목표**: 전체 세션 (IMP-KIT-024 stub 기준)
- **담당 IMP-KIT**: IMP-KIT-007 (트리거 카운터) + IMP-KIT-024 stub
- **측정**: Stop 훅 트리거 발동 횟수 / 실제 커맨드 실행 횟수
- **통과 기준**: ≥ 95% (stub 기준, 완전 구현은 2.3.0+ Phase 5)
- **측정 스크립트**: `scripts/verify-telemetry-coverage.js` (`.claude/telemetry-stub.json` vs 커맨드 로그)

### 2.4 지표 #10 — trust-only 위반 감지

- **목표**: 감지 가능 (IMP-KIT-011 거버넌스 기반)
- **담당 IMP-KIT**: IMP-KIT-011
- **측정**: dev-doc-updater가 dev-architect 출력을 검증 없이 편집한 사례
- **통과 기준**: ajv 검증 우회 로그 0건
- **측정 스크립트**: `scripts/verify-schema-enforcement.js`

---

## 3. P1 11건 테스트 매트릭스

각 IMP-KIT의 테스트 파일 경로 + 최소 테스트 수.

| ID | 테스트 파일 | 최소 수 | 회귀 참조 |
|----|-------------|:------:|----------|
| IMP-KIT-007 | `tests/claude/plan/hooks/plan-review-trigger.test.ts` | 3 | 08-regression §3.1 |
| IMP-KIT-008 | `tests/claude/plan/agents/plan-idea-screener.rescoring-memory.test.ts` | 3 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-008-screener-memory.md#52-회귀-시나리오) |
| IMP-KIT-009 | `tests/claude/plan/agents/plan-idea-screener.file-move.test.ts` | 4 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-009-screener-file-move.md#52-회귀-시나리오) |
| IMP-KIT-010 | `tests/claude/plan/agents/plan-wireframe-designer.checklist.test.ts` | 4 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-010-wireframe-checklist.md#52-회귀-시나리오) |
| IMP-KIT-011 | `tests/claude/dev/_schemas/edit-coordinates.governance.test.ts` | 5 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-011-architect-schema.md#52-회귀-시나리오) |
| IMP-KIT-012 | `tests/claude/plan/boundary/bridge-vs-phase-a.test.ts` | 3 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-012-bridge-phase-a-boundary.md#52-회귀-시나리오) |
| IMP-KIT-013 | `tests/claude/plan/agents/plan-draft-writer.dev-gate.test.ts` | 4 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-013-dev-gate-draft-flag.md#52-회귀-시나리오) |
| IMP-KIT-014 | `tests/claude/core/_schemas/stage-manifest.governance.test.ts` | 4 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-014-stage-manifest-schema-version.md#52-회귀-시나리오) |
| IMP-KIT-015 | `tests/claude/core/rules/task-id-naming.test.ts` | 5 | [스펙 §5.2](03-p1-detailed-specs/IMP-KIT-015-task-id-naming.md#52-회귀-시나리오) |
| IMP-KIT-016 | `tests/claude/core/checkpoint/auto-proceed.test.ts` | 3 | 08-regression §3.1 |
| IMP-KIT-017 | `tests/claude/core/skills/no-duplication.test.ts` | 3 | 08-regression §3.1 |
| **합계** | — | **41** | — |

**주의**: 본 리포지토리는 2.2.0 시점 기준 테스트 러너 부재 ([CHANGELOG §테스트 인프라 알림](../../../CHANGELOG.md)). 러너 도입은 2.3.0 스프린트 내 별도 과제.

---

## 4. 회귀 시나리오 확장 (dash-preview-phase3 복제)

[kit-2.2.0-roadmap/08-regression-scenario.md](../kit-2.2.0-roadmap/08-regression-scenario.md) §3.1 V2 시나리오를 2.3.0 검증용으로 확장.

### 4.1 확장 체크리스트 (기존 + 신규)

기존 시나리오 위에 추가되는 항목:

- [ ] `/plan-screen` 이후 IDEA 파일 자동 이동 (`10-screening` → `20-approved`) 확인 (IMP-KIT-009)
- [ ] Hold→Go 재판정 시 `agent-memory/plan-idea-screener/MEMORY.md` 엔트리 1건 증가 (IMP-KIT-008)
- [ ] `/plan-wireframe` 호출 후 decision-log.md 3항목 자동 생성 (IMP-KIT-010)
- [ ] `/plan-draft` Standard dev Feature에서 "Dev 착수 전 확인" 섹션 존재 (IMP-KIT-013)
- [ ] `/plan-prd` 종료 후 `/plan-review` 자동 실행 확인 (IMP-KIT-007)
- [ ] TASK ID 4개 패턴 중 하나 미매칭 시 가드 차단 확인 (IMP-KIT-015)
- [ ] edit-coordinates JSON 검증 실패 시 dev-architect 재요청 로그 확인 (IMP-KIT-011)

### 4.2 측정 데이터 저장 위치

- 시나리오 실행 로그: `.claude/regression-2.3.0/{YYYY-MM-DD}/session.log`
- 지표 측정 결과: `.claude/regression-2.3.0/{YYYY-MM-DD}/metrics.json`

---

## 5. Codex 듀얼 타깃 검증

Codex sibling 디렉터리의 동등성 검증.

### 5.1 검증 항목

| 항목 | 검증 방법 | 통과 기준 |
|------|----------|----------|
| 에이전트 동기화 | `scripts/audit-pairing.js` | 11건 P1 모두 Claude/Codex 쌍 존재 |
| 스키마 동등성 | checksum 비교 | `edit-coordinates.schema.json`, `stage-manifest.schema.json` 일치 |
| Hook runtime 호환 | `src/claude/_meta/codex-portability.json` | IMP-KIT-009/015의 가드 확장이 Codex v1 호환 |
| 템플릿 동기화 | `scripts/audit-drift.js` | `_templates/`, `_constants/` drift 0 |

### 5.2 Codex 특화 이슈

- **IMP-KIT-009** `mv` 명령 — Codex harness 권한 모델에서 화이트리스트 검증이 동일하게 동작하는지 확인
- **IMP-KIT-015** 가드 훅 — Codex는 Stop 훅 matcher 제약이 다를 수 있어 별도 회귀 필요
- **IMP-KIT-017** Skill 수준 재복제 금지 — Codex Skill 파싱 규칙과 일치 확인

---

## 6. Exit Criteria 요약

2.3.0 릴리스 가능 조건 ([02 §8](02-p1-execution-plan.md#8-exit-criteria-230-릴리스-가능-조건)):

| # | 기준 | 본 문서 섹션 |
|:-:|------|-------------|
| 1 | P1 11건 단위 테스트 통과 | §3 테스트 매트릭스 |
| 2 | 회귀 시나리오 통과 | §4 |
| 3 | 신규 4지표 달성 | §2 |
| 4 | Codex 듀얼 타깃 동기화 | §5 |
| 5 | 2.2.0 지표 #1~#6 유지 | §1 |

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 2 Layer 3) | claude-kit roadmap author |
