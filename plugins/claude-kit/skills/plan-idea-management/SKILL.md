---
name: plan-idea-management
description: >
  아이디어 수집, 분류, 태깅, 우선순위 관리 워크플로우. Use when: 아이디어 등록, 백로그 관리, 아이디어 분류, 아이디어 조회 시.
---

## Overview

아이디어 수집부터 백로그 관리까지의 전체 워크플로우를 정의합니다. 사용자의 비구조화된 입력을 일관된 형식으로 변환하고, 카테고리 분류, 태그 추천, 유사 아이디어 탐색을 수행합니다.

## Prerequisites

- `.plans/ideas/` 디렉토리와 하위 폴더(`00-inbox/`, `10-screening/`, `20-approved/`, `90-archive/`)가 존재할 것
- `.plans/ideas/backlog.md` 인덱스 파일이 초기화되어 있을 것 (없으면 자동 생성)

## Workflow Steps

1. **입력 수신**: 사용자 자연어, 메모, 파일 경로 등 다양한 형태의 입력 수신
2. **구조화**: 제목, 설명, 배경, 기대 효과를 추출하여 구조화
3. **카테고리 분류**: feature / improvement / fix / research 중 자동 판별
4. **태그 추천**: 도메인, 기술 스택, 영향 범위 기반 태그 자동 추천
5. **유사도 분석**: 기존 아이디어와 키워드 매칭으로 중복/유사 탐지
6. **ID 채번**: `IDEA-{YYYYMMDD}-{NNN}` 형식으로 채번 (날짜 + 일별 순번)
7. **개별 파일 생성**: `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` 파일 생성
8. **인덱스 업데이트**: `backlog.md` 인덱스 테이블에 행 추가 (위치 컬럼 포함)

## 아이디어 문서 구조

각 아이디어는 상태별 폴더에 개별 파일로 저장됩니다:

```
.plans/ideas/
  00-inbox/              ← 신규 아이디어 (new)
  10-screening/          ← 스크리닝 중/완료 대기 (screening/screened)
  20-approved/           ← 사용자 승인 완료 (approved) → /plan-draft 가능
  90-archive/            ← 반려/보류 (rejected/on-hold)
  backlog.md             ← 전체 인덱스
  screening-matrix.md    ← 스크리닝 인덱스
```

### 아이디어 파일 형식 (`IDEA-{YYYYMMDD}-{NNN}.md`)

```markdown
### IDEA-{YYYYMMDD}-{NNN}: {제목}
- **카테고리**: {feature|improvement|fix|research}
- **태그**: {tag1}, {tag2}
- **상태**: {new|screening|screened|approved|on-hold|rejected}
- **등록일**: {YYYY-MM-DD}

#### 설명
{상세 설명}

#### 기대 효과
{예상 가치}

#### 관련 아이디어
- {IDEA-XXXXXXXX-XXX 또는 "없음"}
```

### backlog.md 인덱스 형식

```markdown
# Idea Backlog
> 마지막 채번: IDEA-{YYYYMMDD}-{NNN}

| ID | 제목 | 카테고리 | 상태 | 위치 | 등록일 |
|---|---|---|---|---|---|
| IDEA-20260325-001 | 검색 기능 개선 | improvement | new | 00-inbox | 2026-03-25 |
```

### 폴더 전환 규칙

| 이벤트 | 이동 | 상태 전환 |
|--------|------|----------|
| `/plan-idea` 등록 | → `00-inbox/` | `new` |
| `/plan-screen` 시작 | `00-inbox/` → `10-screening/` | `screening` |
| 스크리닝 완료 | `10-screening/`에 유지 | `screened` |
| 사용자 승인 | `10-screening/` → `20-approved/` | `approved` |
| 사용자 보류/반려 | `10-screening/` → `90-archive/` | `on-hold` / `rejected` |
| 보류 → 재스크리닝 | `90-archive/` → `10-screening/` | `screening` |

## 상태 관리

| 상태 | 설명 | 폴더 |
|------|------|------|
| new | 신규 등록 | `00-inbox/` |
| screening | 스크리닝 진행 중 | `10-screening/` |
| screened | 스크리닝 완료, 승인 대기 | `10-screening/` |
| approved | 사용자 명시적 승인 | `20-approved/` |
| rejected | 반려 | `90-archive/` |
| on-hold | 보류 | `90-archive/` |

## 개선요청 라우팅

새 아이디어 등록 시, 카테고리가 `improvement`이고 대상 기능이 이미 아카이브되어 있으면:

1. `.plans/archive/index.md`에서 대상 슬러그 확인
2. 아카이브 존재 시 → `/plan-improve {slug} "제목"` 안내
3. 아카이브 미존재 시 → 일반 IDEA 등록 진행

이렇게 하면 완료된 기능에 대한 개선요청이 새 IDEA가 아닌 기존 아카이브의 improvement으로 자연스럽게 흘러간다.

## 경로 탐색 확장 (Archive Fallback)

IDEA 파일 탐색 시 active + archive 양쪽을 탐색한다:

1. 먼저 기존 active 경로에서 탐색 (`.plans/ideas/`)
2. 없으면 archive 경로에서 탐색 (`.plans/archive/*/sources/`)
3. 둘 다 없으면 "파일 없음" 에러

## 폴더 전환 규칙 (확장)

| 이벤트 | 이동 | 상태 전환 |
|--------|------|----------|
| `/plan-archive` 아카이빙 | `20-approved/` → `archive/{slug}/sources/` | `archived` |

## Output Format

- 개별 파일: `.plans/ideas/{폴더}/IDEA-{YYYYMMDD}-{NNN}.md`
- 인덱스: `.plans/ideas/backlog.md`
- ID 형식: `IDEA-{YYYYMMDD}-{NNN}` (날짜 + 일별 순번)
- 카테고리: feature / improvement / fix / research

## Epic 연결 (Opt-in, v2.4.0+)

claude-kit v2.4.0 Hierarchical Plan Structure 도입으로 IDEA 를 상위 Epic 에 연결할 수 있다. **Opt-in** — Epic 없이도 기존 flat 플로우 100% 호환. SSOT: `src/claude/plan/rules/plan-epic-hierarchy.md`.

### `--epic` 파라미터 (IMP-AGENT-010)

`/plan-idea "{제목}" --epic=EPIC-{YYYYMMDD}-{NNN}` 전달 시 `plan-idea-collector` 에이전트가 다음 수행:

1. Epic 디렉터리 존재 확인 (`.plans/epics/{status}/EPIC-{ID}/`) — 미존재 시 FAIL + `/plan-epic` 먼저 실행 안내
2. IDEA 파일 프론트매터에 Epic 링크 삽입
3. `backlog.md` Epic 컬럼에 Epic 링크 채움 (없으면 헤더 자동 추가)
4. Epic 의 `01-children-features.md` 에 "pending IDEA" 행 추가 (선택)

### IDEA 파일 프론트매터 확장

```markdown
### IDEA-{YYYYMMDD}-{NNN}: {제목}
- **카테고리**: {feature|improvement|fix|research}
- **태그**: {tag1}, {tag2}
- **상태**: {new|screening|screened|approved|on-hold|rejected}
- **등록일**: {YYYY-MM-DD}
- **Epic** (optional): [EPIC-{YYYYMMDD}-{NNN}](../../epics/{status}/EPIC-{ID}/00-epic-brief.md)
```

### backlog.md 인덱스 스키마 확장

```markdown
| ID | 제목 | 카테고리 | 상태 | 등록일 | 위치 | 파일 | Epic |
```

- Epic 없음: `—` 또는 빈 셀
- Epic 있음: `[EPIC-{ID}](../epics/{status}/EPIC-{ID}/00-epic-brief.md)`

### 하위 호환

- `--epic` 미지정 → 기존 동작 완전 동일
- 기존 IDEA 파일의 Epic 필드 없음 → 유효 (Epic 없는 독립 Feature)
- `backlog.md` 의 Epic 컬럼 없음 → 첫 `--epic` 요청 시 에이전트가 자동 추가
- `plan-epic-integrity.js` hook (Phase 2 disable 기본) 이 Epic ↔ Feature binding cross-reference 검증

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/skills/plan-idea-management/SKILL.md`
