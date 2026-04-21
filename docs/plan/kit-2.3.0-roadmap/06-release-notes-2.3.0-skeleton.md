---
제목: 06 Release Notes 2.3.0 — Skeleton
작성일: 2026-04-21
이해관계자 승인일: 2026-04-21 (D1/D2/D3 전체 승인, [_reviews/2026-04-21-stakeholder-approval.md](_reviews/2026-04-21-stakeholder-approval.md))
릴리스 일자: 2026-04-21
대상: 릴리스 책임자, 사용자 공지
상태: shipped (정식 릴리스 노트는 [CHANGELOG.md §2.3.0](../../../CHANGELOG.md#230---2026-04-21))
---

# 06 Release Notes 2.3.0 — Skeleton

> **결론**: 2.3.0 릴리스 노트의 **뼈대**. 실제 릴리스 시점에 커밋 SHA·측정값·마이그레이션 가이드를 덧붙여 정식 노트로 승격한다. 이 스켈레톤은 [`CHANGELOG.md`](../../../CHANGELOG.md)의 `[Unreleased]` → `[2.3.0] - YYYY-MM-DD` 승격 시 붙여넣기 기준.

---

## 릴리스 테마

**프로세스 자동화 + 경계 명확화 + 네이밍 표준화**

2.2.0에서 확립된 P0 안정성(에이전트 체이닝·스키마·Hybrid 모드) 위에, **수동 개입 최소화·문서 SSOT 강화·착수 Gate 조기 플래그**를 추가해 엔드투엔드 파이프라인의 **비용을 낮춘다**.

---

## 포함 범위

- **P1 11건 전체** (IMP-KIT-007 ~ IMP-KIT-017, IMP-KIT-008~015 제외 번호는 원본 백로그 참조)
- 피드백 아카이빙 **트리거 부분만** — 수집 로직은 2.3.0+ 예정 ([04 §5](04-feedback-archiving-integration.md#5-230-포함-범위-vs-이월-범위))
- IMP-KIT-024 **stub만** — 완전 구현은 2.3.0+

---

## Added (P1 11건)

각 항목은 실제 커밋 시점에 SHA + 커밋 메시지 링크 삽입.

### Phase 2.1 — 프로세스 자동화

- **IMP-KIT-007** — `/plan-review` 자동 후속 트리거 (`[TBD]`)
  - `/plan-prd`·`/plan-draft`·`/plan-wireframe` 종료 Stop 훅에서 `/plan-review` 자동 실행
  - `settings.json` 훅 주입 로직 (`scripts/setup.js` 갱신)
  - `autoReview: true|false` 설정 (기본 `true`)

- **IMP-KIT-016** — Human Checkpoint 자동 진행 플래그 (`[TBD]`)
  - `--auto-proceed-on-pass` 플래그 도입
  - Critical Checkpoint 화이트리스트 정책
  - 훅 체인 비차단 보증 (Feedback Archiving Phase 3 전제)

- **IMP-KIT-017** — 재복제 금지 Skill 수준 강제 (`[TBD]`)
  - `golden-principles.md`에 "재복제 금지" 원칙 명문화
  - 각 에이전트 프롬프트에 "경로 인용, 복제 금지" 문장 추가
  - Skill 가드로 복제 시도 감지

### Phase 2.2 — 에이전트 메모리/권한 보완

- **IMP-KIT-009** — plan-idea-screener 파일 이동 권한 확장 (`[TBD]`)
  - `tools`에 `Bash` 추가 + 화이트리스트 제약
  - `10-screening` ↔ `20-approved` ↔ `30-on-hold` 자동 이동
  - 경로 상수 `src/claude/plan/_constants/idea-folders.json`

- **IMP-KIT-008** — plan-idea-screener 재판정 메모리 기록 (`[TBD]`)
  - `agent-memory/plan-idea-screener/MEMORY.md` "재판정 로그" 섹션 자동 주입
  - 엔트리 스키마 `src/claude/plan/_schemas/rescoring-log-entry.schema.json`
  - Hold→Go 전환 감지 시에만 기록

- **IMP-KIT-010** — plan-wireframe-designer 체크리스트 확장 (`[TBD]`)
  - 4항목 Pre-render 체크리스트 (pre-filled/마스킹/viewport/decision-log)
  - PII 마스킹 규칙 JSON 분리
  - 자체 검증 실패 시 재생성 루프

- **IMP-KIT-011** — architect ↔ doc-updater 스키마 거버넌스 (`[TBD]`)
  - ajv 런타임 검증 도입 (`package.json` devDependency)
  - SemVer 원칙 + 거버넌스 문서 (`src/claude/dev/rules/edit-coordinates-governance.md`)
  - 버전 라우터 (`src/claude/dev/_schemas/_router.js`)

### Phase 2.3 — 경계/네이밍 정리

- **IMP-KIT-015** — TASK ID 네이밍 규칙 표준화 (`[TBD]`)
  - 4패턴 표준 (`T-{AREA}-{NN}`, `TASK-{SLUG}-{NN}`, `LEGACY-{AREA}-{NN}`, `SPIKE-{AREA}-{NN}`)
  - `plan-doc-guard.js`, `dev-feature-scope-guard.js` 검증 확장
  - `golden-principles.md` 섹션 추가

- **IMP-KIT-013** — Dev 착수 Gate Draft 조기 플래그 (`[TBD]`)
  - Standard dev/hybrid Feature Draft에 "Dev 착수 전 확인" 섹션 자동 주입
  - 4항목 체크리스트 (Legacy 격리·TASK ID·의존 Feature·마이그레이션)
  - routing-metadata `dev_gate_flagged` 필드

- **IMP-KIT-012** — bridge ↔ Phase A 경계 명확화 (`[TBD]`)
  - 책임 매트릭스 JSON (`bridge-phase-a-matrix.json`)
  - Phase A append-only 제약 + 가드 훅 확장
  - 초안 마커 `<!-- bridge:section -->`

- **IMP-KIT-014** — stage-manifest 스키마 버전 관리 (`[TBD]`)
  - 공식 스키마 `stage-manifest.schema.json` v1.0
  - 소비자 등록부 `stage-manifest-consumers.json`
  - 자동 검증 CI (`scripts/validate-stage-manifest-schema.js`)

---

## Changed

- `scripts/setup.js` — Stop 훅 체인 등록 로직 확장 (IMP-KIT-007/016)
- `src/claude/core/rules/golden-principles.md` — 재복제 금지 (#13) + TASK ID 네이밍 (#14) 섹션 추가
- `src/claude/plan/agents/plan-idea-screener.md` — `tools`에 `Bash` 추가, Output_Format에 재판정 로그 주입 지시
- `src/claude/plan/agents/plan-draft-writer.md` — Standard dev/hybrid 분기에서 Dev Gate 섹션 주입
- `src/claude/plan/agents/plan-wireframe-designer.md` — Pre-render 체크리스트 자체 검증 루프
- `src/claude/dev/agents/dev-architect.md`, `dev-doc-updater.md` — 거버넌스 문서 참조
- `src/claude/plan/hooks/plan-doc-guard.js`, `src/claude/dev/hooks/dev-feature-scope-guard.js` — TASK ID 정규식 검증
- `package.json` devDependency — `ajv` 추가

---

## Breaking Changes

### BC-2.3.0-01: TASK ID 네이밍 규칙

- 기존 무효 TASK ID(`M1-07`, `LEGACY` 등)를 사용하는 **레거시 Feature Package**는 가드 경고 출력
- **마이그레이션**: 기존 Feature의 TASK ID를 4패턴 중 하나로 변환 필요
- 가이드: [마이그레이션 가이드](#마이그레이션-가이드) 참조

### BC-2.3.0-02: stage-manifest.json schema_version 필수

- 새로 생성되는 `stage-manifest.json`은 `schema_version` 필드 필수
- 기존 파일은 v0으로 간주, 경고 출력
- **마이그레이션**: 기존 Feature Package의 `stage-manifest.json` 상단에 `"schema_version": "1.0"` 추가

### BC-2.3.0-03: edit-coordinates ajv 검증

- IMP-KIT-001의 v1 스키마에 런타임 검증 추가
- 잘못된 payload는 1회 재요청 후 실패 처리
- **마이그레이션**: 없음 (v1 payload는 그대로 통과)

---

## 마이그레이션 가이드 (스켈레톤)

### 2.2.1 → 2.3.0 업그레이드

1. **pnpm 재설치**: `pnpm claude-kit:setup`
2. **TASK ID 변환** (BC-2.3.0-01):
   - 기존 Feature Package의 `stage-manifest.json`·Draft 문서의 TASK ID 검색
   - 4패턴 중 하나로 변환 (예: `M1-07` → `T-M1-07`)
3. **stage-manifest 스키마 버전** (BC-2.3.0-02):
   - 기존 `stage-manifest.json` 상단에 `"schema_version": "1.0"` 추가
4. **테스트 러너 도입** (선택):
   - 2.3.0 스프린트 내 Vitest/Jest 도입 예정 (CHANGELOG 2.2.0 알림 참조)

### 후방 호환 보장

- IMP-KIT-001 v1 스키마 payload 그대로 통과
- Lite Feature 워크플로우 영향 없음
- copy Feature 워크플로우 영향 없음 (IMP-KIT-013 분기)

---

## 릴리스 메트릭 (템플릿)

| 지표 | 값 |
|------|----|
| P1 구현 | 11건 / 11건 |
| 독립 리뷰 | `[TBD]` 회 |
| 리뷰 이슈 반영 | `[TBD]` 건 |
| 커밋 수 | `[TBD]` 개 |
| 신규 4지표 달성 | `[TBD]` |
| Codex 듀얼 타깃 동기화 | `[TBD]` |

---

## 연계 릴리스

- **kit-feedback-archiving Phase 3 착수** — 2.3.0 릴리스 후 1개월 내 목표
- **2.3.1** — Exit Criteria 일부 미충족 항목 이월 수용 릴리스
- **2.4.0+** — P2 9건 (IMP-KIT-018~026) + feedback archiving 완전 구현

---

## 감사의 말

`[TBD]` — 릴리스 시점에 기여자 목록 삽입.

---

## 변경 이력 (본 스켈레톤 문서)

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 스켈레톤 초안 작성 (Session 2 Layer 3) | claude-kit roadmap author |
