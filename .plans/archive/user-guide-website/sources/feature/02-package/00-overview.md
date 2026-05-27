# 기능 패키지 개요: user-guide-website

- **생성 단계**: D1 `/dev-feature`
- **스킬 계약**: `dev-feature-plan`
- **PRD**: `.plans/prd/10-approved/user-guide-website-prd.md`
- **Bridge context**: `.plans/bridge/user-guide-website/05-bridge-context.md`

## Structure Mode

`hybrid-docs-app`

## 허용 대상 경로

| 경로 | 목적 |
| --- | --- |
| `src/app/**` | Next.js routes |
| `src/components/docs/**` | Docs components |
| `src/lib/docs/**` | Static content and navigation |
| `src/app/globals.css` | Docs styling |
| `docs/plans/user-guide-website/**` | Pipeline docs |
| `.plans/**` | Pipeline artifacts |
| `package.json`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts` | Build/config |

## Layer Mapping

| Layer | 파일 |
| --- | --- |
| Route | `src/app/page.tsx`, `src/app/planning/**`, `src/app/examples/**` |
| Component | `src/components/docs/**` |
| Data | `src/lib/docs/**` |
| Verification docs | `.plans/features/active/user-guide-website/03-dev-notes/**` |

## Stack Contract

| 항목 | 계약 |
| --- | --- |
| Framework | Next.js app router |
| Language | TypeScript + React |
| Package manager | pnpm |
| Build command | `pnpm docs:build` |
| Test command | `pnpm test` |

## Shared-vs-Local Rule

Docs UI와 data는 docs site 내부에 둔다. Runtime `claude-kit` 자산은 기존 source tree에 유지하고, 이 기능으로 수정하지 않는다.

## Dev 준비 상태

`01-requirements.md`, `08-dev-tasks.md`, `09-test-cases.md`가 서로 연결되어 있으므로 `/dev-run` 기준으로 검증 가능하다.
