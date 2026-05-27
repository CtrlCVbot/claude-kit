# D1 `/dev-feature`: User Guide Website Feature Package

- **Feature**: `user-guide-website`
- **Status**: complete
- **Bridge**: `../06-bridge/01-dev-handoff.md`

## Feature Overview

Next.js 기반 사용자 가이드 웹사이트를 추가한다. 기존 `docs/user-guide-html`은 reference로 유지하고, 새 웹사이트는 `src/app`, `src/components/docs`, `src/lib/docs`에 분리한다.

## 구현 Task

| Task ID | 작업 | 파일 |
| --- | --- | --- |
| T1 | Next.js docs scripts와 설정 추가 | `package.json`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts` |
| T2 | docs shell과 global style 추가 | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/docs/DocsShell.tsx` |
| T3 | home/planning/reference/lifecycle route 추가 | `src/app/page.tsx`, `src/app/planning/**` |
| T4 | command detail template 추가 | `src/components/docs/PlanningCommandPage.tsx`, `src/components/docs/RuntimeTabs.tsx` |
| T5 | planning/example data model 추가 | `src/lib/docs/**` |
| T6 | execution log 갱신 | `docs/plans/user-guide-website/execution-log.md` |

## 테스트 계획

| 테스트 | 목적 |
| --- | --- |
| `pnpm test` | 기존 `claude-kit` 테스트 비회귀 |
| `pnpm docs:build` | Next.js production build |
| route smoke | 주요 route HTTP 200 |
| protected path diff | core 기능 source 미변경 확인 |

## 구현 금지 사항

- installer 수정 금지
- Claude/Codex source 수정 금지
- runtime output 수정 금지
- 기존 HTML 삭제 금지
- Production 배포 금지

## Commit boundary

이 Feature package는 이미 다음 커밋으로 구현되었다.

- `f26d6a2 feat: 사용자 가이드 Next.js 문서 사이트 추가`
- `835e42c docs: 사용자 가이드 사이트 검증 로그 추가`

