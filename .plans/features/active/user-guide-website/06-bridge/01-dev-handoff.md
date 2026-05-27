# P7 `/plan-bridge`: User Guide Website Dev Handoff

- **Feature**: `user-guide-website`
- **Status**: complete

## 구현 범위

| 영역 | 구현 |
| --- | --- |
| Framework | Next.js App Router |
| Routes | `/`, `/planning`, `/planning/[slug]`, `/planning/lifecycle`, `/planning/reference`, `/examples/[slug]` |
| Components | `DocsShell`, `PageHeader`, `InfoGrid`, `PlanningCommandPage`, `RuntimeTabs` |
| Data | `src/lib/docs/planning-pages.ts`, `src/lib/docs/examples.ts`, `src/lib/docs/navigation.ts` |
| Styling | `src/app/globals.css` |

## Task split

| Task | 파일 |
| --- | --- |
| Next 설정 | `next.config.mjs`, `next-env.d.ts`, `tsconfig.json`, `package.json` |
| Shell route | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/planning/page.tsx` |
| Detail route | `src/app/planning/[slug]/page.tsx` |
| Example route | `src/app/examples/[slug]/page.tsx` |
| Components | `src/components/docs/**` |
| Data model | `src/lib/docs/**` |
| Execution log | `docs/plans/user-guide-website/execution-log.md` |

## Protected path gate

구현 중 아래 경로를 수정하지 않는다.

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## 검증 계획

| 검증 | 명령/방법 |
| --- | --- |
| 의존성 일관성 | `pnpm install --frozen-lockfile` |
| 기존 테스트 | `pnpm test` |
| Next build | `pnpm docs:build` |
| route smoke | local Next server + 주요 route HTTP 200 |
| protected path diff | `git diff --name-only` 대상 확인 |

## 개발자 메모

1차 구현은 content parity보다 route shell과 data model을 우선한다. 기존 HTML의 상세 표와 failure modes는 후속 content parity 작업에서 보강한다.

