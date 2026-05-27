# P5.5 `/plan-design`: User Guide Website Design Checkpoint

- **Feature**: `user-guide-website`
- **Status**: complete
- **Decision**: Use existing warm HTML direction, rebuild as structured docs UI.

## 디자인 목표

기존 HTML 가이드의 warm editorial tone을 유지하면서, Claude Code 문서처럼 빠른 탐색이 가능한 docs layout으로 재구성한다.

## Visual thesis

`claude-kit`은 기능 문서이지만 딱딱한 API reference만은 아니다. 사용자가 “이 파이프라인을 실제로 따라갈 수 있겠다”는 느낌을 받아야 하므로, 따뜻한 배경, 강한 typography, 명확한 navigation을 조합한다.

## 컴포넌트 패턴

| 컴포넌트 | 역할 |
| --- | --- |
| `DocsShell` | sidebar, main, toc 3단 구성 |
| `PageHeader` | eyebrow, title, description |
| `InfoGrid` | 핵심 원칙과 route card |
| `PlanningCommandPage` | command 상세 공통 template |
| `RuntimeTabs` | Claude/Codex runtime 비교 |

## 색과 톤

| 토큰 | 의도 |
| --- | --- |
| warm parchment background | 문서 패키지 느낌 |
| burnt orange accent | 중요한 action과 현재 위치 |
| ink text | 긴 문서 가독성 |
| soft panels | 상세 정보 grouping |

## 접근성 결정

- Runtime tab은 `button`, `role="tab"`, `aria-selected`, `role="tabpanel"`을 사용한다.
- heading 구조는 `h1 -> h2 -> h3` 순서를 유지한다.
- 모바일에서는 sidebar sticky를 해제한다.

## Stitch 입력

이 디자인 checkpoint는 P6 `/plan-stitch`에서 Google Stitch 사용 여부를 판단하는 입력이다. 현재는 기존 HTML reference와 직접 구현이 충분하므로 Stitch는 필수로 보지 않는다.

