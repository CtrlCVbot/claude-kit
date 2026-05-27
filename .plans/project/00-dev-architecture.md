# 프로젝트 개발 구조 SSOT

## 목적

이 문서는 `/dev-feature`가 Feature Package를 만들기 전에 읽어야 하는 개발 구조 기준이다.

## Structure Mode

`hybrid-docs-app`

이 저장소는 여전히 npm package / toolkit이 우선이다. Next.js app은 같은 저장소 안의 문서 surface다.

## Stack Contract

| Layer | Stack |
| --- | --- |
| App router | Next.js `src/app/**` |
| UI components | React components under `src/components/docs/**` |
| Content model | Static TypeScript data under `src/lib/docs/**` |
| Styling | `src/app/globals.css` |
| Verification | `pnpm test`, `pnpm docs:build`, route smoke, protected path diff |

## Shared-vs-Local Rule

| 규칙 | 결정 |
| --- | --- |
| Docs-only UI | `src/components/docs/**`에 둔다. |
| Website content data | `src/lib/docs/**`에 둔다. |
| Runtime kit assets | `src/claude/**`, `src/codex/**`, `src/templates/**`와 분리한다. |
| Generated outputs | source of truth로 직접 수정하지 않는다. |

## 보호 경계

웹사이트 작업은 다음 경로를 수정하지 않는다.

- `src/claude/**`
- `src/codex/**`
- `src/templates/**`
- `scripts/setup.js`
- `.claude/**`
- `.agents/**`
- `.codex/**`

## 허용 문서 앱 경로

- `src/app/**`
- `src/components/docs/**`
- `src/lib/docs/**`
- `docs/plans/user-guide-website/**`
- `.plans/**`
- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `next-env.d.ts`
