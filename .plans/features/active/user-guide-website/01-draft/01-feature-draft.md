# P3 `/plan-draft`: User Guide Website

- **Feature**: `user-guide-website`
- **Epic**: `EPIC-20260527-001`
- **Input**: `IDEA-20260527-001`, `SCREENING-20260527-001`, `docs/user-guide-html/**`
- **Status**: complete

## 1차 기능 초안

`docs/user-guide-html`의 정적 HTML 가이드를 Next.js 문서 웹사이트로 전환한다. 이 웹사이트는 `claude-kit`의 runtime 기능이 아니라 사용자용 docs surface다.

핵심 가치는 두 가지다.

- 사용자가 `/plan-*` 파이프라인을 문서 웹사이트에서 빠르게 탐색한다.
- 이 웹사이트 구현 과정 자체를 `claude-kit` 파이프라인 실행 예시로 보여준다.

## 사용자 흐름

| 흐름 | 설명 |
| --- | --- |
| 홈 진입 | 사용자가 `claude-kit guide`의 목적과 빠른 시작을 확인한다. |
| planning index | 전체 P1~A1 흐름을 보고 각 command 상세로 이동한다. |
| command 상세 | `/plan-idea`, `/plan-epic`, `/plan-prd` 등 각 단계의 목적, 입력, 산출물, runtime 차이를 본다. |
| lifecycle/reference | 산출물 이동 규칙과 command matrix를 확인한다. |
| example pages | 이번 웹사이트 전환 작업이 실제 pipeline에서 어떻게 진행됐는지 본다. |

## 1차 route 후보

| Route | 역할 |
| --- | --- |
| `/` | 문서 홈 |
| `/planning` | 기획 파이프라인 index |
| `/planning/[slug]` | command 상세 |
| `/planning/lifecycle` | 산출물 lifecycle |
| `/planning/reference` | command reference |
| `/examples/[slug]` | 이번 작업 실행 예시 |

## 보호 경계

아래 경로는 이 Feature에서 수정하지 않는다.

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## 초안 결정

| 항목 | 결정 |
| --- | --- |
| Framework | Next.js App Router |
| Styling | 기존 HTML의 warm docs 톤을 유지하되 Next component 구조로 재구성 |
| Content source | 초기에는 `src/lib/docs`의 typed data |
| HTML reference | 삭제하지 않고 `docs/user-guide-html`에 보존 |
| Vercel | Production이 아니라 Preview 준비만 목표 |

## 다음 단계

P4 `/plan-prd`에서 요구사항과 acceptance criteria를 확정한다.

