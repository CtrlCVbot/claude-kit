<!-- kit-convert generated: 2026-04-23 -->
<!-- Claude sibling: src/claude/core/rules/agent-file-ownership.md -->
# Agent File Ownership Matrix

> **결론**: T-RACE-01. 병렬 에이전트 호출 시 파일 편집 race 방지. 파일 유형별 "1 차 작성 / 후속 갱신 / 메인 전담" 3 구분 SSOT. 각 에이전트 프롬프트는 본 룰을 참조하여 편집 범위를 제한한다.

**관련 룰**: [`verification.md`](verification.md) (Agent Edit Race 섹션)
**스펙**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RACE-01.md`

---

## 1. 매트릭스

### 1-1. plan 도메인 파일

| 파일 유형 | 1 차 작성 | 후속 갱신 | 메인 전담 (race 위험) |
|-----------|---------|----------|---------------------|
| `.plans/ideas/00-inbox/IDEA-*.md` | plan-idea-collector | plan-idea-screener / plan-draft-writer / plan-prd-writer / plan-bridge-writer | — |
| `.plans/ideas/10-screening/SCREENING-*.md` | plan-idea-screener | — | — |
| `.plans/ideas/backlog.md` | plan-idea-collector | plan-idea-screener, **plan-state-sync.js (hook, T-FSTATE-01)** | — |
| `.plans/ideas/screening-matrix.md` | plan-idea-screener | — | — |
| `.plans/epics/*/EPIC-*/00-epic-brief.md` | 메인 (`/plan-epic`) | plan-idea-collector (§7 자식 IDEA 링크만) | 메인 (§3 범위, §4 표 등 본문) |
| `.plans/epics/*/EPIC-*/01-children-features.md` | 메인 (`/plan-epic`) | plan-idea-collector (F{N} IDEA 필드), **plan-state-sync.js (F{N} 상태 필드)** | **메인 전담** (§1 전체 구조, §2 매트릭스, §4 Phase 로드맵 등) |
| `.plans/epics/*/EPIC-*/index.md` | 메인 (`/plan-epic`) | 메인 (advance 시) | — |
| `.plans/epics/index.md` | 메인 (`/plan-epic`) | 메인 (Epic 생성·advance 시) | — |
| `.plans/drafts/{slug}/01-draft.md` | plan-draft-writer | — | — |
| `.plans/drafts/{slug}/07-routing-metadata.md` | plan-draft-writer | — | — |
| `.plans/drafts/{slug}/02-prd.md` | plan-prd-writer | — | — |
| `.plans/features/active/{slug}/00-context/01-product-context.md` | plan-bridge-writer | — | — |
| `.plans/features/active/{slug}/00-context/02-scope-boundaries.md` | plan-bridge-writer | — | — |
| `.plans/features/active/{slug}/00-context/03-design-decisions.md` | plan-bridge-writer | — | — |
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md` §1~§4 + §5-A | plan-bridge-writer | — (read-only after initial write) | — |
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md §5-B` (T-BKLG-03, Backlog) | dev-implementer / `/dev-feature` | dev-implementer (`/dev-run` 시 actual_hours) | — |
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md §5-C` (T-BKLG-03, Backlog) | `/plan-archive` | — (final snapshot) | — |
| `.plans/features/active/{slug}/00-context/08-epic-binding.md` | plan-bridge-writer | **plan-state-sync.js (§7 상태 표)** | 메인 (§1 Epic 상태 라인) |
| `.plans/features/active/{slug}/dev-tasks.md` | `/dev-feature` | dev-implementer | — |

### 1-2. copy 도메인 파일

| 파일 유형 | 1 차 작성 | 후속 갱신 | 메인 전담 |
|-----------|---------|----------|---------|
| `.plans/features/active/{slug}/evidence/*.png` | copy-reference-baseline | — | — |
| `.plans/features/active/{slug}/evidence/manifest.json` | copy-reference-baseline | — | — |
| `.plans/features/active/{slug}/copy/gap-board.md` | 메인 (`/copy-gap-board`) | — | 메인 |

---

## 2. 소유권 해석

### 2-1. 1 차 작성
해당 파일 유형을 **처음 생성** 하는 주체. 한 파일당 1 주체.

### 2-2. 후속 갱신
1 차 작성 후 **부분 수정** 하는 주체. 수정 범위는 각 에이전트 프롬프트에 명시된 필드로 제한.

예시: `plan-idea-collector` 는 IDEA 파일에 §10 Bridge 엔트리를 추가할 수 있으나 §1~§7 (원문·스크리닝·드래프트 단계) 은 편집 금지.

### 2-3. 메인 전담 (race 위험)
병렬 에이전트 호출 시 race 위험이 있는 파일은 **메인 세션만 편집**. 서브 에이전트 프롬프트에 "편집 금지" 명시 필수.

핵심 대상: `01-children-features.md` — Epic 의 전체 구조·의존성 매트릭스·Phase 로드맵이 담긴 파일. 다수 에이전트가 동시 편집하면 섹션 간 충돌 발생.

---

## 3. 시행 방법

### 3-1. 에이전트 프롬프트 주입

각 에이전트 프롬프트 상단 `<Constraints>` 또는 별도 `<File_Ownership>` 블록에 본 룰 참조 + 해당 에이전트의 소유 파일 목록 명시.

예(plan-bridge-writer 권장 형식):
```xml
<File_Ownership>
참조: src/claude/core/rules/agent-file-ownership.md

1 차 작성 권한:
  - .plans/features/active/{slug}/00-context/*.md (5 파일)

후속 갱신 권한: 없음

메인 전담 파일 (편집 금지):
  - .plans/epics/*/EPIC-*/01-children-features.md
  - .plans/epics/*/EPIC-*/00-epic-brief.md (본문)
</File_Ownership>
```

### 3-2. verification.md 섹션 참조

`verification.md` Agent Edit Race 섹션이 본 매트릭스를 참조. 위반 감지 패턴(예: 메인 전담 파일을 서브 에이전트가 수정한 git diff) 도 함께 안내.

### 3-3. 후속 주입 TASK (별도)

본 TASK 는 **SSOT 룰 신설** 에 집중. 에이전트 프롬프트에 `<File_Ownership>` 블록을 일괄 주입하는 작업은 별도 세션 권장 (에이전트 9~10 개 × 단순 섹션 추가).

---

## 4. 금지 사항

| 금지 | 사유 |
|---|---|
| 서브 에이전트가 "메인 전담" 컬럼 파일 편집 | race 위험 — 본 매트릭스의 존재 이유 |
| 1 차 작성 권한 없는 파일을 신규 생성 | 소유권 혼란 |
| 본 매트릭스에 명시되지 않은 새 파일 유형 자동 생성 | 매트릭스 갱신 없이 운영 금지 (SSOT 원칙) |

새 파일 유형 도입 시 본 매트릭스를 먼저 갱신한다.

---

## 5. 근거 (피드백 출처)

- 피드백: `docs/plan/kit-feedback/phase-a-dry-run-20260423/03-pain-points.md` N-02
- 개선 제안: `docs/plan/kit-feedback/phase-a-dry-run-20260423/04-improvement-proposals.md` I-03
- TASK: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RACE-01.md`

본 룰 적용 전: 병렬 에이전트 호출 시 Epic 공통 파일 편집 race → 순차 실행으로 회피 + 매번 프롬프트에 "편집 금지" 명시 부담.
본 룰 적용 후: race 차단 + 에이전트 프롬프트 작성 부담 감소.

---

## 6. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-RACE-01 SSOT 확립 (N-02 대응) | Claude (메인테이너 역할) |
| 2026-04-23 | §1-1 `04-implementation-hints.md` §5-A/§5-B/§5-C 소유권 행 추가 — T-BKLG-03 (Backlog) | Claude (메인테이너 역할) |
