# D2 Implementation Source Map

- **Feature**: `user-guide-website`
- **Purpose**: 실제 구현 파일과 각 파일의 책임을 추적한다.
- **Status**: complete

## 구현 단위 요약

| 구현 영역 | 목적 | 파일 |
| --- | --- | --- |
| Next.js project wiring | docs site 실행과 build를 가능하게 한다. | `package.json`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts` |
| App routes | 사용자에게 노출되는 문서 route를 만든다. | `src/app/**` |
| Docs components | 문서 shell, header, tab, command template를 재사용한다. | `src/components/docs/**` |
| Docs data | planning command와 example page 내용을 typed data로 제공한다. | `src/lib/docs/**` |
| Style system | 기존 HTML reference의 warm docs theme을 Next.js 전역 스타일로 재구성한다. | `src/app/globals.css` |
| Execution evidence | 실제 pipeline 실행, 구현, 검증 로그를 남긴다. | `docs/plans/user-guide-website/execution-log.md` |

## Package and config changes

| 파일 | 변경 내용 | 이유 |
| --- | --- | --- |
| `package.json` | `docs:dev`, `docs:build`, `docs:start` 추가, Next/React/TypeScript dev dependency 추가 | docs site를 기존 package script와 분리해 실행하기 위함 |
| `next.config.mjs` | `reactStrictMode`, `outputFileTracingRoot`, `eslint.ignoreDuringBuilds` 설정 | workspace root 혼선과 기존 toolkit hook lint 충돌을 피하면서 docs build를 통과시키기 위함 |
| `tsconfig.json` | Next App Router용 TypeScript 설정, `@/*` path alias 추가 | `src/app`, `src/components`, `src/lib`를 타입 검증 대상으로 삼기 위함 |
| `next-env.d.ts` | Next type reference | Next 타입 인식을 명시하기 위함 |
| `.gitignore` | `.next/`, `out/` 추가 | build output을 Git에 포함하지 않기 위함 |

## App route files

| 파일 | route | 책임 |
| --- | --- | --- |
| `src/app/layout.tsx` | all routes | HTML lang, metadata, global CSS 적용 |
| `src/app/page.tsx` | `/` | 사용자 가이드 홈, quickstart, 운영 원칙, 주요 링크 |
| `src/app/planning/page.tsx` | `/planning` | planning pipeline map과 command grid |
| `src/app/planning/[slug]/page.tsx` | `/planning/[slug]` | command 상세 동적 route, static params, metadata |
| `src/app/planning/lifecycle/page.tsx` | `/planning/lifecycle` | idea/epic/feature lifecycle 설명 |
| `src/app/planning/reference/page.tsx` | `/planning/reference` | command matrix reference |
| `src/app/examples/[slug]/page.tsx` | `/examples/[slug]` | 웹사이트 구현 과정 example pages |

## Component files

| 파일 | 책임 |
| --- | --- |
| `src/components/docs/DocsShell.tsx` | sidebar, main, toc 3단 문서 layout |
| `src/components/docs/PageHeader.tsx` | eyebrow, title, description header |
| `src/components/docs/InfoGrid.tsx` | 카드형 정보 grid |
| `src/components/docs/PlanningCommandPage.tsx` | command 상세 페이지 공통 template |
| `src/components/docs/RuntimeTabs.tsx` | Claude/Codex tab UI. client component |

## Data files

| 파일 | 책임 |
| --- | --- |
| `src/lib/docs/types.ts` | `PlanningPage`, `RuntimeInfo`, `ExamplePage` 타입 |
| `src/lib/docs/planning-pages.ts` | planning command data, `getPlanningPage` |
| `src/lib/docs/examples.ts` | website example page data, `getExamplePage` |
| `src/lib/docs/navigation.ts` | sidebar navigation groups |

## Source of truth decision

현재 1차 구현의 content source는 `src/lib/docs/*.ts`다. 기존 HTML은 삭제하지 않고 `docs/user-guide-html/**`에 reference로 보존한다.

후속 content parity 작업에서는 기존 HTML의 상세 표와 failure modes를 `src/lib/docs/planning-pages.ts`의 data model 확장으로 반영한다.

## Protected path result

이번 구현에서 다음 경로는 수정하지 않았다.

```text
src/claude/**
src/codex/**
src/templates/**
scripts/setup.js
.claude/**
.agents/**
.codex/**
plugins/claude-kit/**
AGENTS.md
```

