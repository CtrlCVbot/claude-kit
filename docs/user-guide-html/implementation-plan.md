# HTML 사용자 가이드 문서형 개편 실행 계획

## Summary

`docs/user-guide-html/index.html`을 랜딩 페이지가 아니라 실제 사용자가 반복해서 참고할 수 있는 문서형 가이드로 개편한다.

참고 구조는 Claude Code 공식 문서의 개요 페이지처럼 좌측 문서 네비게이션, 중앙 본문, 우측 현재 페이지 목차를 가진 documentation layout이다.

이번 계획의 직접 산출물은 HTML/CSS 구현 변경이 아니라, 다음 구현자가 어떤 순서로 `index.html`과 `styles.css`를 정리해야 하는지 알려주는 실행 계획이다.

## Scope

| 구분 | 포함 여부 | 설명 |
| --- | --- | --- |
| `docs/user-guide-html/index.html` 정보 구조 개편 | 포함 | 섹션 순서, 본문 밀도, 예시, 표, 단계 설명을 재정리한다. |
| `docs/user-guide-html/styles.css` 문서형 레이아웃 정리 | 포함 | 좌측 nav, 본문, 우측 TOC, 모바일 대응을 정리한다. |
| `docs/user-guide-html/assets/*` 정리 | 포함 | 사용하지 않는 시각 자산은 제거하거나 후속 사용 여부를 결정한다. |
| `docs/guide/*` 원문 수정 | 제외 | 이 HTML 문서의 source reference로만 사용한다. |
| `docs/meta-tooling/*` 수정 | 제외 | 후속 handoff 대상으로 둔다. |
| 런타임 기능 또는 installer 수정 | 제외 | 이번 작업은 정적 HTML 문서 패키지 개편이다. |

## Current Issues

| 이슈 | 영향 | 개선 방향 |
| --- | --- | --- |
| 첫 인상이 제품 소개 페이지에 가까움 | 사용자가 바로 절차를 따라가기 어렵다. | 문서 목적, 빠른 시작, 사용 흐름을 먼저 보여준다. |
| 섹션별 설명 깊이가 부족할 수 있음 | `/plan-*`, `/dev-*`, `/kit-*`를 처음 쓰는 사용자가 맥락을 놓칠 수 있다. | 각 흐름에 목적, 입력, 명령, 산출물, 완료 기준을 추가한다. |
| 좌측 nav와 우측 TOC의 정보 위계가 더 정교해야 함 | 긴 문서를 읽을 때 현재 위치와 다음 단계가 흐려진다. | 좌측은 문서 전체 구조, 우측은 현재 페이지 섹션 요약으로 분리한다. |
| source 문서와 runtime output의 경계 설명이 짧음 | `src/codex`와 `.codex`를 혼동할 수 있다. | authoring source, generated output, runtime surface를 별도 표로 설명한다. |
| 문제 해결 섹션이 대표 증상 중심으로 더 보강될 필요가 있음 | 실제 사용 중 막혔을 때 바로 해결하기 어렵다. | 증상, 원인, 확인 위치, 해결 순서로 재구성한다. |

## Target Information Architecture

새 페이지는 아래 문서 흐름을 기준으로 정리한다.

| 순서 | 섹션 | 목적 |
| --- | --- | --- |
| 1 | Overview | 이 문서가 어떤 사용자와 어떤 작업을 위한 것인지 설명한다. |
| 2 | Quickstart | 처음 실행할 때 확인할 최소 절차를 제공한다. |
| 3 | When to Use | 기획, 개발, Codex 전환 중 어떤 흐름을 선택해야 하는지 안내한다. |
| 4 | Planning Pipeline | 아이디어에서 개발 handoff까지의 `/plan-*` 흐름을 설명한다. |
| 5 | Development Workflow | Feature Package를 코드로 구현하는 `/dev-*` 흐름을 설명한다. |
| 6 | Codex Parallel Use | Claude와 Codex가 같은 기능 identity를 어떻게 다르게 소비하는지 설명한다. |
| 7 | Conversion Workflow | `src/claude -> conversion -> src/codex` 전환 기준을 설명한다. |
| 8 | Command and Asset Catalog | 주요 commands, agents, skills, hooks를 찾는 방법을 안내한다. |
| 9 | Troubleshooting | 흔한 문제와 해결 순서를 제공한다. |
| 10 | Source Documents | 더 깊이 확인할 원본 문서 위치를 연결한다. |

## Section-by-Section Content Plan

### 1. Overview

목표는 제품 홍보가 아니라 작업 시작점을 명확히 하는 것이다.

포함할 내용:

| 항목 | 내용 |
| --- | --- |
| 문서 목적 | `claude-kit`의 기획, 개발, Codex 전환 흐름을 실제 사용 기준으로 설명한다. |
| 독자 | 처음 설치한 사용자, Claude Code 사용자, Codex 병행 사용자, maintainer |
| 핵심 원칙 | source와 generated output을 구분하고, 검증 없는 완료 주장을 피한다. |
| 빠른 요약 | `planning -> development -> verification -> Codex conversion` 흐름을 한 문장으로 정리한다. |

### 2. Quickstart

사용자가 5분 안에 현재 프로젝트 상태를 확인할 수 있어야 한다.

포함할 내용:

| 단계 | 설명 | 예시 |
| --- | --- | --- |
| 설치 확인 | `.claude`, `.agents`, `.codex` 관련 output 존재 여부 확인 | `Get-ChildItem .claude` |
| 문서 선택 | 기획인지 개발인지 변환인지 선택 | `planning`, `development`, `conversion` |
| 첫 명령 | 목적에 맞는 entry command 선택 | `/plan-idea`, `/dev-feature`, `/kit-convert` |
| 산출물 확인 | 생성된 문서, package, registry, report 위치 확인 | `docs/guide`, `src/codex`, `pairing-registry` |

### 3. When to Use

사용자가 어떤 파이프라인을 선택해야 하는지 빠르게 판단할 수 있게 한다.

포함할 내용:

| 상황 | 추천 흐름 |
| --- | --- |
| 아이디어를 정리해야 함 | Planning Pipeline |
| 승인된 PRD를 구현해야 함 | Development Workflow |
| 기존 Claude 기능을 Codex에서도 쓰고 싶음 | Conversion Workflow |
| 설치 output이 이상함 | Troubleshooting |
| source와 generated output이 헷갈림 | Source Documents |

### 4. Planning Pipeline

`/plan-*` 흐름은 단순 명령 목록이 아니라 단계별 산출물 흐름으로 설명한다.

포함할 내용:

| 단계 | Command | 입력 | 산출물 |
| --- | --- | --- | --- |
| P1 | `/plan-idea` | 초기 아이디어 | idea record |
| P2 | `/plan-screen` | idea record | screening decision |
| P3 | `/plan-draft` | 승인된 idea | draft brief |
| P4 | `/plan-prd` | draft brief | PRD |
| P5 | `/plan-wireframe` | PRD | wireframe |
| P6 기본 | `/plan-design` | PRD + wireframe | Claude Code Design 기반 design package |
| P6 선택 | `/plan-stitch` | PRD + wireframe 또는 design package | Google Stitch 기반 visual/design integration |
| P7 | `/plan-bridge` | PRD + design package, stitch output, 또는 둘 다 | dev handoff |
| Archive | `/plan-archive` | 완료된 package | archive bundle |

`/plan-design`는 기본 디자인 파이프라인으로 설명한다. Claude Code Design을 활용해 PRD와 wireframe을 구현 가능한 design package로 정리하는 경로다.

`/plan-stitch`는 Google Stitch를 활용하는 선택 파이프라인으로 설명한다. 프로젝트 상황에 따라 `/plan-design`만 사용할 수도 있고, `/plan-stitch`만 사용할 수도 있으며, 두 단계를 모두 사용해 디자인을 보강할 수도 있다.

허용 흐름은 아래처럼 문서화한다.

- `PRD -> /plan-wireframe -> /plan-design -> /plan-bridge`
- `PRD -> /plan-wireframe -> /plan-stitch -> /plan-bridge`
- `PRD -> /plan-wireframe -> /plan-design -> /plan-stitch -> /plan-bridge`

### 5. Development Workflow

개발 흐름은 Feature Package를 코드 변경으로 전환하는 과정으로 설명한다.

포함할 내용:

| 단계 | 목적 | 주요 확인 |
| --- | --- | --- |
| Architecture | 현재 프로젝트 구조와 boundary 확인 | `docs/guide`, architecture source |
| Feature Planning | 구현 단위를 나누고 acceptance criteria 확인 | Feature Package |
| TDD Implementation | 실패 테스트, 구현, 리팩터링 순서 유지 | tests, build |
| Verification | 타입, 테스트, lint, 수동 확인 | command output |
| Review | 보안, 품질, 문서 반영 확인 | review checklist |
| Commit | 논리적 변경 단위로 기록 | Conventional Commits |

### 6. Codex Parallel Use

Claude 기능을 Codex에서 그대로 복사해 쓰는 것이 아니라, Codex 공식 surface에 맞게 표현한다는 점을 분명히 한다.

포함할 내용:

| Claude source kind | Codex target | 설명 |
| --- | --- | --- |
| `command` | `skill` | 사용자 entrypoint를 Codex skill 문서로 재표현한다. |
| `agent` | `subagent` | 역할이 좁고 독립적인 작업은 custom subagent 후보가 된다. |
| `skill` | `skill` | 재사용 가능성이 가장 높지만 형식 검증이 필요하다. |
| `hook` | `hook-pair` 또는 `skip` | 공식 hook surface와 플랫폼 제약을 기준으로 판단한다. |
| `instruction-rule` | `AGENTS.md synthesis` | 일반 지침은 Codex exec-policy rule과 구분한다. |

### 7. Conversion Workflow

현재 목표가 create-time 동시 생성이 아니라 기존 Claude 자산의 Codex 전환이라는 점을 강조한다.

포함할 내용:

| 단계 | 설명 |
| --- | --- |
| Inventory | `src/claude`의 agents, commands, skills, hooks, instruction rules를 수집한다. |
| Classify | 자동 변환, 리뷰 필요, skip을 판정한다. |
| Generate | `src/codex` authoring source를 생성한다. |
| Review | 사람이 semantic drift와 runtime gap을 확인한다. |
| Validate | schema, pairing, output readiness를 검증한다. |
| Handoff | installer, guide, meta-tooling 반영 작업으로 넘긴다. |

중요 문장:

> `src/codex`는 Codex runtime artifact가 아니라 conversion-generated 후 수동 보정 가능한 authoring source다.

### 8. Command and Asset Catalog

사용자가 기능을 찾는 방법을 정리한다.

포함할 내용:

| 자산 | 확인 위치 | 설명 |
| --- | --- | --- |
| Commands | `.claude/commands`, `src/claude/**/commands` | Claude entrypoint |
| Agents | `.claude/agents`, `src/claude/**/agents` | Claude subagent 역할 자산 |
| Skills | `.claude/skills`, `.agents/skills`, `src/**/skills` | 반복 workflow package |
| Hooks | `.claude/hooks`, `src/**/hooks` | 이벤트 기반 자동화 |
| Codex agents | `.codex/agents`, `src/codex/**/agents` | Codex custom subagent output/source |

### 9. Troubleshooting

증상 중심으로 구성한다.

포함할 내용:

| 증상 | 확인 위치 | 해결 방향 |
| --- | --- | --- |
| 명령이 보이지 않음 | `.claude/commands` | 설치 output과 source를 구분해서 확인 |
| Codex에서 기능이 다르게 보임 | `src/codex`, `.agents/skills`, `.codex/agents` | direct copy가 아니라 target-specific output인지 확인 |
| hook이 실행되지 않음 | hook config, platform support | Codex hook 지원 범위와 skip 사유 확인 |
| 변환 누락 의심 | pairing registry, audit report | conversion status와 skip reason 확인 |
| 문서와 실제 파일이 다름 | `docs/guide`, `docs/codex-compatibility` | source 문서 갱신 필요 여부 확인 |

### 10. Source Documents

HTML 문서는 최종 source of truth가 아니라 사용자용 gateway로 둔다.

연결할 문서:

| 문서군 | 역할 |
| --- | --- |
| `docs/guide/shared/*` | 공통 개념, 설치, 운영 원칙 |
| `docs/guide/claude-code/*` | Claude Code 자산과 workflow 설명 |
| `docs/guide/codex/*` | Codex runtime surface 설명 |
| `docs/guide/mapping/*` | Claude to Codex mapping 기준 |
| `docs/guide/sync/*` | source of truth와 generated output 경계 |
| `docs/codex-compatibility/*` | conversion 기준과 후속 계획 |

## Layout and Styling Plan

### Desktop

| 영역 | 역할 | 스타일 방향 |
| --- | --- | --- |
| Header | 문서 패키지 이름, 검색 placeholder, 빠른 링크 | 얇고 고정감 있는 docs header |
| Left sidebar | 전체 문서 네비게이션 | grouped nav, 현재 섹션 강조 |
| Main content | 실제 가이드 본문 | 넓은 line-height, 표와 callout 중심 |
| Right TOC | 현재 페이지 내부 이동 | 짧은 anchor list |

### Mobile

| 조건 | 처리 |
| --- | --- |
| 화면 폭이 좁음 | 3-column을 1-column으로 전환 |
| 좌측 nav | 본문 위에 접히거나 block nav로 표시 |
| 우측 TOC | 숨기거나 본문 하단으로 이동 |
| 표 | 가로 스크롤 또는 카드형으로 전환 |

## Implementation Steps

1. `index.html`에서 hero성 문구를 줄이고 문서 목적과 quickstart를 상단으로 이동한다.
2. 좌측 nav를 `Getting Started`, `Workflows`, `Codex`, `Reference` 같은 그룹으로 재구성한다.
3. 각 본문 섹션에 `목적`, `언제 쓰는가`, `실행 순서`, `산출물`, `완료 기준`을 추가한다.
4. `planning`, `development`, `conversion` 섹션은 표와 단계형 목록을 중심으로 밀도를 높인다.
5. `Codex` 섹션에는 `source`, `authoring source`, `runtime output`의 차이를 명확히 설명한다.
6. `troubleshooting` 섹션을 증상 기반 표로 확장한다.
7. `source-docs` 섹션에 원본 문서군과 역할을 연결한다.
8. `styles.css`에서 landing hero 중심 스타일을 docs layout 중심 스타일로 정리한다.
9. 사용하지 않는 `assets/*`가 있으면 삭제하거나 실제 문서 도표로 재활용한다.
10. 모바일 폭에서 nav, TOC, 표가 깨지지 않는지 확인한다.

## Verification Plan

| 검증 | 방법 | 통과 기준 |
| --- | --- | --- |
| 파일 참조 검증 | `Select-String`으로 CSS, asset 참조 확인 | 없는 파일을 참조하지 않는다. |
| 링크 검증 | 주요 anchor id와 nav href 비교 | 모든 내부 링크가 유효하다. |
| 내용 검증 | 섹션별 목적과 산출물 확인 | 각 workflow가 실제 실행 순서로 읽힌다. |
| 용어 검증 | `src/codex`, `.codex`, `AGENTS.md`, `skill`, `subagent` 설명 확인 | source와 runtime을 혼동하지 않는다. |
| 모바일 검증 | 좁은 화면에서 HTML 열람 | 본문, nav, 표가 읽을 수 있다. |
| self-review | 변경 후 문서 전체 재독 | landing copy보다 operational guide가 우선한다. |

## Self-Review Criteria

| 기준 | 질문 |
| --- | --- |
| 문서성 | 첫 화면이 제품 홍보가 아니라 사용 가이드처럼 보이는가? |
| 실행성 | 사용자가 `/plan-*`, `/dev-*`, `/kit-*` 흐름을 따라할 수 있는가? |
| 정확성 | Claude source와 Codex target surface를 혼동하지 않는가? |
| 탐색성 | 좌측 nav와 우측 TOC가 서로 다른 역할을 하는가? |
| 유지보수성 | 원본 문서 위치와 후속 반영 대상이 분명한가? |

## Risks and Open Questions

| 항목 | 리스크 | 대응 |
| --- | --- | --- |
| HTML이 너무 길어짐 | 한 페이지 reference가 과밀해질 수 있다. | 우선 단일 페이지로 유지하되, 섹션별 anchor와 표로 탐색성을 높인다. |
| 원본 문서와 중복 | `docs/guide` 내용과 HTML이 어긋날 수 있다. | HTML은 gateway로 두고 source docs 링크를 명확히 둔다. |
| Codex 설명의 기준 변화 | 공식 Codex surface가 변경될 수 있다. | `docs/codex-compatibility`와 `docs/guide/codex`를 후속 갱신 source로 둔다. |
| asset 정리 판단 | 기존 SVG를 삭제할지 재활용할지 애매할 수 있다. | 실제 본문에서 쓰지 않으면 삭제하고, 필요하면 Mermaid 또는 inline diagram으로 대체한다. |

## Implementation Boundary

이 계획을 실행할 때는 아래 순서를 지킨다.

1. 먼저 `index.html`과 `styles.css`의 현재 상태를 백업 없이 diff 기준으로 확인한다.
2. 문서 구조 변경을 먼저 적용한다.
3. 스타일은 구조 변경 이후에 맞춘다.
4. asset 삭제는 마지막에 수행한다.
5. 구현 후에는 최소 1회 self-review를 진행한다.

이번 계획 문서 작성 단계에서는 `index.html`, `styles.css`, `assets/*`를 수정하지 않는다.
