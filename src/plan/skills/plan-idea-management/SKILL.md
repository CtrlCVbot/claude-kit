---
name: plan-idea-management
description: >
  아이디어 수집, 분류, 태깅, 우선순위 관리 워크플로우. Use when: 아이디어 등록, 백로그 관리, 아이디어 분류, 아이디어 조회 시.
---

## Overview

아이디어 수집부터 백로그 관리까지의 전체 워크플로우를 정의합니다. 사용자의 비구조화된 입력을 일관된 형식으로 변환하고, 카테고리 분류, 태그 추천, 유사 아이디어 탐색을 수행합니다.

## Prerequisites

- `.plans/ideas/` 디렉토리가 존재할 것
- `.plans/ideas/backlog.md` 인덱스 파일이 초기화되어 있을 것 (없으면 자동 생성)

## Workflow Steps

1. **입력 수신**: 사용자 자연어, 메모, 파일 경로 등 다양한 형태의 입력 수신
2. **구조화**: 제목, 설명, 배경, 기대 효과를 추출하여 구조화
3. **카테고리 분류**: feature / improvement / fix / research 중 자동 판별
4. **태그 추천**: 도메인, 기술 스택, 영향 범위 기반 태그 자동 추천
5. **유사도 분석**: 기존 아이디어와 키워드 매칭으로 중복/유사 탐지
6. **ID 채번**: IDEA-{NNN} 형식으로 순차 채번
7. **개별 파일 생성**: `.plans/ideas/IDEA-{NNN}.md` 파일 생성
8. **인덱스 업데이트**: `backlog.md` 인덱스 테이블에 행 추가

## 아이디어 문서 구조

각 아이디어는 `.plans/ideas/IDEA-{NNN}.md` 개별 파일로 저장됩니다:

```markdown
### IDEA-{NNN}: {제목}
- **카테고리**: {feature|improvement|fix|research}
- **태그**: {tag1}, {tag2}
- **상태**: draft
- **등록일**: {YYYY-MM-DD}

#### 설명
{상세 설명}

#### 기대 효과
{예상 가치}

#### 관련 아이디어
- {IDEA-XXX 또는 "없음"}
```

`backlog.md`는 인덱스 테이블로만 사용됩니다:

```markdown
# Idea Backlog
> 마지막 채번 ID: IDEA-{NNN}

| ID | 제목 | 카테고리 | 상태 | 등록일 |
|---|---|---|---|---|
| IDEA-001 | 검색 기능 개선 | improvement | draft | 2026-03-25 |
```

## 상태 관리

| 상태 | 설명 |
|------|------|
| draft | 초안 등록 |
| submitted | 스크리닝 대기 |
| screening | 스크리닝 진행 중 |
| approved | 승인 (Go 판정) |
| rejected | 반려 (Kill 판정) |
| on-hold | 보류 (Hold 판정) |

## Output Format

- 개별 파일: `.plans/ideas/IDEA-{NNN}.md`
- 인덱스: `.plans/ideas/backlog.md`
- ID 형식: IDEA-{NNN} (3자리 0-패딩)
- 카테고리: feature / improvement / fix / research
