# Architecture Binding: user-guide-website

## 연결된 Architecture

`.plans/project/00-dev-architecture.md`

## Structure Mode

`hybrid-docs-app`

## 허용 대상 경로

| 경로 | Layer |
| --- | --- |
| `src/app/**` | Next.js route layer |
| `src/components/docs/**` | Docs UI component layer |
| `src/lib/docs/**` | Static content/data layer |
| `src/app/globals.css` | Docs styling layer |
| `docs/plans/user-guide-website/**` | Pipeline docs |
| `.plans/**` | Pipeline artifacts |
| `package.json`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts` | Build/config layer |

## 금지 경로

| 경로 | 이유 |
| --- | --- |
| `src/claude/**` | Claude core source |
| `src/codex/**` | Codex core source |
| `src/templates/**` | installer/template source |
| `scripts/setup.js` | installer behavior |
| `.claude/**`, `.agents/**`, `.codex/**` | runtime/generated/tooling surfaces |

## Layer Mapping

| 요구사항 | 주 layer | 검증 증거 |
| --- | --- | --- |
| `REQ-UGW-001` | Route + UI component | Home/planning route smoke |
| `REQ-UGW-002` | Content data + route | Planning pages coverage |
| `REQ-UGW-003` | UI component | Runtime tab behavior review |
| `REQ-UGW-004` | Content data + example route | Example page route smoke |
| `REQ-UGW-005` | Build/config | `pnpm docs:build`, protected path diff |
| `REQ-UGW-006` | Docs artifacts | Handoff doc review |
