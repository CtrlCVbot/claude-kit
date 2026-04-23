---
name: plan-epic-workflow
description: >
  Epic 라이프사이클 관리. 제품 목표·Theme·cross-cutting 요구사항을 여러 Feature 로 묶어 관리한다. Use when: Epic 생성, Epic 상태 전이, 자식 Feature 의존성 정의, Epic Brief/Children Features/Binding 문서 작성 시.
---

## Overview

claude-kit v2.4.0 Hierarchical Plan Structure 의 **Epic** 라이프사이클을 정의한다. Epic 은 Feature 상위 계층으로, 여러 Feature 를 묶어 제품 Theme·cross-cutting 요구사항·명시적 의존성을 관리한다. **Opt-in** 원칙 — Epic 없이도 기존 flat 구조로 작동한다.

## Prerequisites

- `.plans/epics/` 디렉터리 + 하위 5 상태 폴더(`00-draft/`, `10-planning/`, `20-active/`, `30-completed/`, `90-archive/`) 존재 (없으면 자동 생성)
- `.plans/epics/index.md` 인덱스 파일 (없으면 자동 생성)
- `plan-epic-hierarchy.md` rule 이해 (SSOT)

## When to Activate

Epic 생성은 **다음 3 기준 중 하나 이상** 충족 시에만:

1. 3개 이상 Feature 가 같은 제품 Theme
2. 여러 Feature 에 걸친 cross-cutting 요구사항 (접근성·i18n·성능 예산 등)
3. Feature 간 명시적 순서·의존성 관리 필요

**기준 미충족 시 Epic 생성 금지** — 독립 Feature 로 운영.

## Epic 상태 머신

```
draft → planning → active → completed → archived
```

| 상태 | 디렉터리 | 진입 조건 |
|:---:|---|---|
| draft | `00-draft/` | Epic 제목 결정 (최소 산출물 0건) |
| planning | `10-planning/` | Epic Brief + Children Features 작성 + 자식 IDEA 최소 1건 등록 |
| active | `20-active/` | 자식 Feature 중 최소 1건 구현 시작 |
| completed | `30-completed/` | 모든 자식 Feature completed (archive 직전) |
| archived | `90-archive/` | Epic 번들화 + `index.md` 등록 완료 |

상태 전이는 `/plan-epic advance {ID} --to={state}` 커맨드로 수행 (Phase 2 구현).

## Workflow Steps (생성)

1. **Activation 기준 검증**: 위 3 기준 중 하나 이상 충족 여부 확인. 미충족 시 종료 (독립 Feature 권장).
2. **ID 채번**: `EPIC-{YYYYMMDD}-{NNN}` 형식 (당일 순번 3자리).
3. **디렉터리 생성**: `.plans/epics/00-draft/EPIC-.../` (draft 상태로 시작).
4. **Epic Brief 작성**: `templates/epic-brief.md` 기반으로 `00-epic-brief.md` 생성.
5. **Children Features 초안**: 자식 Feature 목록이 확정되면 `templates/children-features.md` 기반으로 `01-children-features.md` 생성.
6. **Epic Binding (선택)**: 기존 Feature 를 소급 연결할 경우 각 Feature 의 `00-context/08-epic-binding.md` 를 `templates/epic-binding.md` 기반으로 생성.
7. **인덱스 등록**: `.plans/epics/index.md` 에 행 추가.

## 필수 산출물 (각 Epic 디렉터리 내부)

| 파일 | 필수/선택 | 내용 |
|---|:---:|---|
| `00-epic-brief.md` | 필수 | 목표/성공지표/범위/마일스톤/리스크 |
| `01-children-features.md` | 필수 | 자식 Feature 목록 + 의존성 매트릭스 + 실행 Phase |
| `02-roadmap.md` | 선택 | 분기별 로드맵 (Epic 수준) |
| `03-metrics.md` | 선택 | 누적 지표 대시보드 (LOC/tests/bundle/a11y) |
| `04-decision-log.md` | 선택 | Epic 레벨 결정 (Feature 간 공통) |
| `06-poc-observations.md` | PoC 전용 | Phase 1 PoC 시 관찰 기록 |

## 게이트 (상태 전이 전 자동 검증)

`/plan-epic advance` 커맨드가 자동 검증 (**T-EPMV-03**). 미충족 시 HARD FAIL + `--force` 옵션 안내.

| 전이 | 필수 조건 | 검증 방식 |
|---|---|---|
| draft → planning | `00-epic-brief.md` + `01-children-features.md` 존재, 자식 IDEA 최소 1건 등록 | 파일 존재 확인 + `.plans/ideas/**/IDEA-*.md` 의 frontmatter `Epic: EPIC-{ID}` grep |
| planning → active | 자식 Feature 중 최소 1건 IDEA 상태 `approved` | IDEA frontmatter `상태: approved` + Epic 연결 cross-check |
| active → completed | 모든 자식 Feature IDEA 상태 `archived` | 자식 전체 cross-check |
| completed → archived | `/plan-epic archive` 커맨드 + 인덱스 갱신 | 내부 절차 |

상세 검증 명령은 `plan-epic-hierarchy.md §4-2` 참조.

## 파일 이동 방법 (상태 전이 시)

`/plan-epic advance` 내부에서 **tracked 여부 자동 감지 후 `git mv` / `mv` 분기** (**T-EPMV-02**):

- **tracked 상태**: `git mv` (이력 보존)
- **untracked 상태**: `mv` (`.plans/` 커밋 전이거나 `.gitignore` 포함 시)

상세 로직은 `plan-epic-hierarchy.md §4-1` 참조.

## Anti-patterns (절대 금지)

| 패턴 | 이유 |
|---|---|
| Feature 2개 미만인데 Epic 생성 | Over-engineering. §Activation 기준 위반 |
| Epic 간 parent-child 관계 설정 | 4단 계층 금지 (`plan-epic-hierarchy.md` §5) |
| 한 Feature 를 여러 Epic 에 primary 연결 | 1:1 원칙. 필요 시 soft link 만 |
| 매 Feature 마다 Epic 생성 | Opt-in 원칙 위반 |
| Epic 없는 기존 Feature 에 강제 마이그레이션 | 원본 불변성 위반 |

## 템플릿

- `templates/epic-brief.md` — `00-epic-brief.md` 양식
- `templates/children-features.md` — `01-children-features.md` 양식
- `templates/epic-binding.md` — Feature 의 `08-epic-binding.md` 양식 (§7 상태 동기 표 자동 갱신 대상, T-FSTATE-01)
- `templates/phase-roadmap.md` — Phase 로드맵 자동 생성 (T-TMPL-01, v2.5.0)

### `/plan-epic phase generate` — Phase 로드맵 자동 생성 (T-TMPL-01)

Phase A 9 단계 하드코딩 대체. Phase B/C 도 30 초 내 `01-children-features.md §4` 에 append.

```
/plan-epic phase generate --phase=B --features=F2,F4
```

- 템플릿: `templates/phase-roadmap.md` (12 변수 치환)
- 안전 검증: 기존 Phase 섹션 존재 시 HARD FAIL + `--overwrite` 필수
- 상세: [`/plan-epic` 커맨드 문서](../../../plan/commands/plan-epic.md#phase-로드맵-생성-plan-epic-phase-generate--t-tmpl-01)

### Epic 정보 빠르게 확인 (`show` 권장)

```
/plan-epic show EPIC-20260422-001            # 집약 출력 (Phase 진행률 + Feature 표 + 다음 Checkpoint)
/plan-epic show EPIC-... --verbose           # + 성공 지표 + 의존성 매트릭스
/plan-epic list --status=active              # 현재 진행 중 Epic 일괄 조회 (각 Phase 진행률 포함)
```

Feature 상태는 IDEA frontmatter (SSOT, `plan-state-sync.js` 사용) 기반으로 실시간 표시. T-SHOW-01.

## Output Format

- Epic 디렉터리: `.plans/epics/{status}/EPIC-{YYYYMMDD}-{NNN}/`
- Epic 인덱스: `.plans/epics/index.md`
- Feature Binding: `.plans/features/active/{slug}/00-context/08-epic-binding.md`
- ID 형식: `EPIC-{YYYYMMDD}-{NNN}` (날짜 + 일별 순번)

## 관련 자산

- **Rule**: `plan-epic-hierarchy.md` (SSOT, 계층 정의 + §4-1 파일 이동 + §4-2 게이트 조건 + §5 IDEA/Feature 상태 + §6 금지 사항)
- **Rule**: `agent-file-ownership.md` (T-RACE-01, Epic 파일 편집 권한)
- **Command**: `/plan-epic` (create/list/show/advance/archive) — advance 는 게이트 자동 검증 + fallback 이동 통합
- **Command**: `/plan-idea --epic={ID}` (Epic 에 자동 연결)
- **Hook**: `plan-epic-integrity.js` (binding cross-reference, Phase 2 disable 기본)
- **Hook (예정)**: `plan-state-sync.js` (T-FSTATE-01, IDEA 상태 변경 시 3 곳 자동 동기)
- **Skill 참조**: `plan-idea-management` (epic 필드 처리 규칙)

## 관련 피드백 TASK

- **T-EPMV-02** (v2.4.1): 파일 이동 fallback 분기 — `plan-epic-hierarchy.md §4-1` 반영 완료
- **T-EPMV-03** (v2.4.1): advance 게이트 자동 검증 — `plan-epic-hierarchy.md §4-2` 반영 완료
- **T-EPMV-01** (v2.4.1 Step 3): **구현 완료** — `scripts/epic-advance-rewrite.js` (13 테스트 PASS) — advance 내부에서 `rewriteEpicLinks({...})` 호출
