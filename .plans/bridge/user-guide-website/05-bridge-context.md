# Bridge Context: user-guide-website

- **단계**: P7 `/plan-bridge`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#9-p7-plan-bridge`

## 개발 handoff

승인된 PRD와 package 구조를 기준으로 사용자 가이드 웹사이트 구현을 검증하거나 보정한다.

## 허용 대상 경로

| 경로 | 목적 |
| --- | --- |
| `src/app/**` | Next.js routes |
| `src/components/docs/**` | 문서 UI 컴포넌트 |
| `src/lib/docs/**` | 정적 문서 content와 navigation model |
| `docs/plans/user-guide-website/**` | 파이프라인 문서와 실행 로그 |
| `.plans/**` | 파이프라인 산출물 |
| `package.json`, `next.config.mjs`, `tsconfig.json` | docs build/runtime 설정 |

## 보호 경로

다음 경로는 수정하지 않는다.

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## Task 분리

| Task | 연결 요구사항 |
| --- | --- |
| `TASK-UGW-001` | `REQ-UGW-001` |
| `TASK-UGW-002` | `REQ-UGW-002` |
| `TASK-UGW-003` | `REQ-UGW-003` |
| `TASK-UGW-004` | `REQ-UGW-004` |
| `TASK-UGW-005` | `REQ-UGW-005` |
| `TASK-UGW-006` | `REQ-UGW-006` |

## 검증 handoff

1. `pnpm docs:build`
2. 주요 docs route smoke
3. protected path diff
4. `.plans/features/active/user-guide-website/02-package/` 기준 review
