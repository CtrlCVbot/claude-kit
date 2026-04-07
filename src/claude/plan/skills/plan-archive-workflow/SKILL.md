---
name: plan-archive-workflow
description: >
  완료된 기획/개발 산출물의 아카이빙 워크플로우.
  파이프라인 완료 검증, 소스 파일 수집, 번들 생성, 인덱스 갱신, 원본 이동을 수행한다.
  Use when: 기능 개발 완료 후 아카이빙, 아카이브 조회, 아카이브 상태 확인 시.
---

## Overview

완료된 기능의 산출물을 하나로 묶어 아카이빙하는 워크플로우.
기획 파이프라인(P1~P7) + 개발(A~E) 완료 후, P8 단계로 실행한다.

핵심 원칙:
- **단일 번들**: 모든 산출물을 `ARCHIVE-{KEY}.md` 하나에 인라인
- **원본 보존**: `sources/` 디렉토리에 원본 파일을 `git mv`로 이동 (이력 보존)
- **인덱스 자동 갱신**: `backlog.md`, `screening-matrix.md` 경로를 아카이브로 변경
- **Active 정리**: 완료된 기능은 active 디렉토리에서 제거

## Prerequisites

- 대상 기능의 파이프라인이 완료 상태여야 함 (IDEA 파일의 파이프라인 이력 확인)
- 대상 기능의 코드가 배포/머지 완료되어야 함
- `.plans/archive/` 디렉토리 존재 (없으면 자동 생성)
- `.plans/archive/index.md` 존재 (없으면 템플릿으로 자동 생성)

## Workflow Steps

### Step 1: 완료 검증

대상 기능의 파이프라인 완료 여부를 검증한다.

1. IDEA 파일 읽기 → 파이프라인 이력 테이블에서 각 단계 상태 확인
2. Lite 기능: P1, P2, P3, P5, P7 + Dev 완료 필요
3. Standard 기능: P1~P7 + Dev 완료 필요
4. 미완료 단계가 있으면 사용자에게 알리고 중단

```
검증 체크리스트:
- IDEA 문서 존재 + 상태가 ready-to-dev 이상
- 피처 플랜 존재 (feature-plan-lite.md 또는 feature-plan-standard.md)
- 와이어프레임 존재 (screens.md 최소)
- 브릿지 문서 존재 (01-overview.md 최소)
- 코드 구현 완료 (apps/ 또는 packages/ 하위에 코드 존재)
```

### Step 2: 소스 파일 수집

슬러그 기반으로 관련 파일을 모두 수집한다.

| 디렉토리 | 패턴 | 설명 |
|----------|------|------|
| `.plans/ideas/` | `IDEA-{NNN}.md` (IDEA ID로 매칭) | 아이디어 문서 |
| `.plans/ideas/00-inbox/` | `IDEA-{NNN}.md` | 인박스 사본 |
| `.plans/features/active/` | `{slug}.md`, `{slug}/` | 피처 개요 + 플랜 |
| `.plans/wireframes/` | `{slug}/` | 와이어프레임 전체 |
| `.plans/prd/` | `{slug}/` (Standard만) | PRD 문서 |
| `.plans/stitch/` | `{slug}/` (Standard만) | 스티치 문서 |
| `.plans/bridge/` | `{slug}/` | 브릿지 문서 |

수집 결과를 사용자에게 표시한다.

### Step 3: 아카이브 디렉토리 생성

```
.plans/archive/{slug}/
.plans/archive/{slug}/sources/
.plans/archive/{slug}/improvements/
```

### Step 4: 원본 파일 이동

`git mv`를 사용하여 원본 파일을 `sources/`로 이동한다.
git 이력이 보존되어 `git log --follow`로 추적 가능.

이동 규칙:
- `ideas/IDEA-{NNN}.md` → `archive/{slug}/sources/IDEA-{NNN}.md`
- `ideas/00-inbox/IDEA-{NNN}.md` → `archive/{slug}/sources/IDEA-{NNN}-inbox.md`
- `features/active/{slug}.md` → `archive/{slug}/sources/{slug}.md`
- `features/active/{slug}/` → `archive/{slug}/sources/` (내부 파일 이동)
- `wireframes/{slug}/` → `archive/{slug}/sources/wireframes/`
- `bridge/{slug}/` → `archive/{slug}/sources/bridge/`
- `prd/{slug}/` → `archive/{slug}/sources/prd/` (Standard만)
- `stitch/{slug}/` → `archive/{slug}/sources/stitch/` (Standard만)

### Step 5: ARCHIVE 번들 생성

모든 산출물을 하나의 마크다운 파일에 인라인한다.

번들 헤더:
```markdown
# Archive: {기능 제목}

> **Key**: {KEY} | **Slug**: {slug} | **IDEA**: {IDEA-ID}
> **Category**: {Lite|Standard} | **RICE Score**: {점수} | **Archived**: {YYYY-MM-DD}
> **Code Location**: {코드 경로} | **Improvements**: {개선요청 수}
> **Pipeline**: {P1 → P2 → ... → Dev → Archive}
```

번들 섹션 구조:
1. **메타데이터** (키, 슬러그, 카테고리, 스코어, 파이프라인 경로, 코드 위치)
2. **원본 파일 매니페스트** (원본 경로 ↔ 현재 위치 매핑 테이블)
3. **아이디어 & 스크리닝** (IDEA 문서 인라인)
4. **피처 오버뷰** (피처 개요 인라인)
5. **피처 플랜** (feature-plan 인라인)
6. **PRD** (Standard만, Lite 생략)
7. **와이어프레임** (screens, navigation, components 인라인)
8. **스티치** (Standard만, Lite 생략)
9. **브릿지** (overview, wireframe-summary, dev-context 인라인)
10. **개선 이력** (IMP 처리 시 업데이트되는 테이블)
11. **교훈** (session-wrap/dev-learn에서 수집)

### Step 6: 인덱스 갱신

1. **archive/index.md**: 새 행 추가
2. **backlog.md**: 해당 IDEA의 상태를 `archived`로 변경, 위치 경로를 아카이브 번들로 변경
3. **screening-matrix.md**: 해당 IDEA의 파일 링크를 아카이브 경로로 변경
4. **IDEA 파이프라인 이력**: Archive 행 추가 (sources/ 내 IDEA 파일에)

### Step 7: 빈 디렉토리 정리

원본 이동 후 비어진 디렉토리를 정리한다.
- `wireframes/{slug}/` → 삭제 (비어있을 때만)
- `bridge/{slug}/` → 삭제 (비어있을 때만)
- `features/active/{slug}/` → 삭제 (비어있을 때만)

### Step 8: 사용자 확인

변경 요약을 표시하고 최종 확인을 받는다.

## Output Format

### 성공 시

```
아카이브 완료: {slug} (ARCHIVE-{KEY}.md)
- 번들: .plans/archive/{slug}/ARCHIVE-{KEY}.md
- 원본: .plans/archive/{slug}/sources/ ({N}개 파일)
- 개선요청: /plan-improve {slug} "제목"
```

### 실패 시

```
아카이브 불가: {slug}
- 미완료 단계: {단계 목록}
- 먼저 {필요한 커맨드} 를 실행하세요.
```

## 멀티 피처 프로젝트 처리

`00-master-plan.md`가 존재하면 멀티 피처 프로젝트로 판단한다.

- **개별 아카이브**: 서브 피처(F1~F8) 완료 시 `ARCHIVE-{KEY}-F{N}.md` 생성
- **프로젝트 아카이브**: 모든 서브 피처 완료 시 `ARCHIVE-{KEY}.md` 생성 (마스터플랜 + 서브 참조)
- `/plan-archive {slug}` → 프로젝트 전체 아카이브
- `/plan-archive {slug} --feature F1` → 개별 서브 피처 아카이브

## 개선요청 연계

아카이브 완료 후, 해당 기능에 대한 개선요청은 `/plan-improve` 커맨드로 처리한다.

워크플로우:
1. `/plan-improve {slug} "제목"` → IMP 문서 생성 + 영향도 분석
2. 사용자 승인 후 → 파이프라인 재진입 또는 Dev only
3. 완료 후 → ARCHIVE 번들의 "개선 이력" 섹션 업데이트

재진입 규칙:

| 변경 유형 | 재진입 지점 | 거치는 단계 |
|-----------|------------|-------------|
| 카피/텍스트만 | Dev only | Dev |
| 스타일/레이아웃 미세 조정 | P7 Bridge 업데이트 | P7 → Dev |
| 새 UI 섹션/컴포넌트 | P5 Wireframe | P5 → P7 → Dev |
| 스코프 확장 | P3 Draft | P3 → P5 → P7 → Dev |
| 근본적 재설계 | P1 새 Idea | 전체 파이프라인 (새 IDEA) |

## Archive Index 초기 템플릿

`/plan-archive` 최초 실행 시, `.plans/archive/index.md`가 없으면 아래 템플릿으로 자동 생성:

```markdown
# Archive Index

> 완료된 기능의 아카이브 인덱스.
> 각 행의 번들 파일에서 전체 산출물을 확인할 수 있습니다.

| Key | Slug | Title | Category | Score | Pipeline | Archived | Code | Impr. |
|-----|------|-------|----------|-------|----------|----------|------|-------|
```

## IMP(개선요청) 문서 템플릿

`/plan-improve`에서 IMP 문서 생성 시 아래 템플릿 사용:

```markdown
# IMP-{KEY}-{NNN}: {개선 제목}

> **Target**: {KEY} ({slug})
> **Category**: {enhancement|bugfix|performance|ux|accessibility}
> **Priority**: {P0|P1|P2}
> **Status**: {draft|analyzing|approved|in-progress|done|rejected}
> **Filed**: {YYYY-MM-DD}
> **Resolved**: {YYYY-MM-DD} (완료 시)

---

## 컨텍스트

왜 이 개선이 필요한가?

{배경 설명}

---

## 스코프

### 변경 요청 내용

{구체적인 변경 사항}

### 영향도 매트릭스

| 영역 | 영향도 | 설명 |
|------|--------|------|
| UI/레이아웃 | {high/medium/low/none} | {설명} |
| 데이터/상태 | {high/medium/low/none} | {설명} |
| API/통신 | {high/medium/low/none} | {설명} |
| 퍼포먼스 | {high/medium/low/none} | {설명} |
| 접근성 | {high/medium/low/none} | {설명} |

### 영향받는 ARCHIVE 섹션

- [ ] 1. 아이디어 & 스크리닝
- [ ] 2. 피처 오버뷰
- [ ] 3. 피처 플랜
- [ ] 4. PRD (해당 시)
- [ ] 5. 와이어프레임
- [ ] 6. 스티치 (해당 시)
- [ ] 7. 브릿지

---

## 파이프라인 재진입

### 추천 재진입 지점

| 재진입 지점 | 근거 |
|------------|------|
| {P3/P5/P7/Dev} | {근거} |

### 거쳐야 할 단계

{재진입 지점} → ... → Dev → 완료

### 예상 작업량

| 단계 | 예상 분량 | 설명 |
|------|----------|------|
| {단계} | {분량} | {설명} |

---

## 해결

> 완료 시 작성

- **완료일**: {YYYY-MM-DD}
- **커밋**: {커밋 해시 또는 PR 링크}
- **요약**: {1-3줄 요약}
- **ARCHIVE 갱신**: {업데이트된 섹션}
```
