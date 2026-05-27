# 안전 및 비회귀 계획

## 목적

사용자 가이드 웹사이트는 `claude-kit` 기능을 돕는 문서 surface다. 따라서 웹사이트 작업이 기존 command, agent, skill, hook, rule, installer 동작을 깨면 안 된다.

## 보호 경로 점검

| 경로 | 기대 상태 |
| --- | --- |
| `src/claude/**` | 변경 없음 |
| `src/codex/**` | 변경 없음 |
| `src/templates/**` | 변경 없음 |
| `scripts/setup.js` | 변경 없음 |
| `.claude/**` | 변경 없음 |
| `.agents/**` | 변경 없음 |
| `.codex/**` | 변경 없음 |

## 검증 게이트

| 게이트 | 명령 또는 방법 | 완료 전 필수 여부 |
| --- | --- | --- |
| 회귀 테스트 | `pnpm test` | 필수 |
| 문서 사이트 빌드 | `pnpm docs:build` | 필수 |
| route smoke | 로컬 route 확인 | Preview 단계에서 필수 |
| protected path diff | 보호 경로에 대한 `git diff --name-only` | 필수 |
| 리뷰 | `.plans/features/active/user-guide-website/04-review/01-self-review.md` | 필수 |

## 실패 대응

| 실패 | 대응 |
| --- | --- |
| 보호 경로 diff 발생 | 작업을 멈추고 무관 변경 또는 범위 침범 여부를 분리한다. |
| 빌드 실패 | docs website 범위 안에서만 원인을 고친다. |
| 콘텐츠 누락 | runtime source가 아니라 content model 또는 문서 산출물을 수정한다. |
| high/critical 리뷰 이슈 | 커밋 전 수정하거나 보류 사유를 명확히 남긴다. |

## 이번 실행 결과

| 검증 | 결과 |
| --- | --- |
| `pnpm test` | 통과 |
| `pnpm docs:build` | 통과 |
| protected path diff | 통과 |
