# P5 `/plan-wireframe`: User Guide Website Wireframe

- **Feature**: `user-guide-website`
- **Status**: complete

## Layout 구조

```text
┌────────────────────┬────────────────────────────────────┬──────────────┐
│ Sidebar            │ Main document                       │ TOC          │
│ - 시작하기          │ - Header / lead                     │ - 목적       │
│ - Planning          │ - Sections                          │ - Runtime    │
│ - Commands          │ - Tables / tabs / steps             │ - Rules      │
│ - Examples          │ - Footer / related links            │              │
└────────────────────┴────────────────────────────────────┴──────────────┘
```

## Route별 화면

| Route | 주요 화면 요소 |
| --- | --- |
| `/` | hero, quickstart, 운영 원칙, 주요 route cards |
| `/planning` | pipeline map, command grid, design branch 설명 |
| `/planning/[slug]` | command header, 목적, 사용 시점, 입력/산출물, Claude/Codex tabs, lifecycle, rules |
| `/planning/lifecycle` | idea/epic/feature 이동 단계 |
| `/planning/reference` | command matrix table |
| `/examples/[slug]` | 이번 웹사이트 작업의 pipeline example sections |

## Command 상세 공통 구조

```text
PageHeader
  목적
  언제 사용하나
  입력과 산출물
  Claude / Codex 기능 탭
  Lifecycle
  운영 규칙
```

## 모바일 대응

- sidebar는 상단 블록으로 내려간다.
- toc는 숨긴다.
- 2열 grid는 1열로 접는다.
- table은 가로 overflow를 허용한다.

## Wireframe 결정

1차 구현은 “Claude Code docs 같은 좌측 navigation + 본문 중심 구조”를 따른다. 랜딩 페이지보다 문서 상세 탐색이 우선이다.

