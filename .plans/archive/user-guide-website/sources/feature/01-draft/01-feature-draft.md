# Feature Draft: user-guide-website

- **단계**: P3 `/plan-draft`
- **입력**: `IDEA-20260527-001`, `EPIC-20260527-001`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#4-p3-plan-draft`

## 한 줄 요약

기존 HTML 가이드를 유지보수 가능한 Next.js 문서 웹사이트로 전환하고, 그 과정을 `claude-kit` 파이프라인 예시로 기록한다.

## 주요 사용자

| 사용자 | 필요 |
| --- | --- |
| 신규 `claude-kit` 사용자 | planning/development command를 단계별로 이해 |
| maintainer | 웹사이트 변경이 runtime 기능을 침범하지 않는지 확인 |
| Claude/Codex 병행 사용자 | runtime 차이와 산출물 위치를 명확히 이해 |

## 사용자 흐름

1. 사용자가 문서 웹사이트를 연다.
2. overview와 planning pipeline을 읽는다.
3. `/plan-idea`, `/plan-epic` 같은 command 상세 페이지로 이동한다.
4. 필요한 곳에서 Claude/Codex tab을 전환한다.
5. lifecycle, reference, example page에서 더 깊은 흐름을 확인한다.

## Route 영향

| Route | 목적 |
| --- | --- |
| `/` | Overview와 진입점 |
| `/planning` | Planning pipeline map |
| `/planning/[slug]` | Command detail pages |
| `/planning/lifecycle` | Artifact lifecycle |
| `/planning/reference` | Reference and rules |
| `/examples/[slug]` | Pipeline execution examples |

## 보호 경계

이 기능으로 `src/claude/**`, `src/codex/**`, `src/templates/**`, `scripts/setup.js`, `.claude/**`, `.agents/**`, `.codex/**`를 수정하지 않는다.

## Draft 결정

여러 route, content model, UI component, verification gate가 있으므로 Standard PRD로 진행한다.
