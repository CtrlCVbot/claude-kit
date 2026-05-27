# D2 `/dev-run`: User Guide Website Implementation Log

- **Feature**: `user-guide-website`
- **Status**: complete

## 구현 요약

| 영역 | 결과 |
| --- | --- |
| Next.js 설정 | `docs:dev`, `docs:build`, `docs:start` script 추가 |
| Route | `/`, `/planning`, `/planning/[slug]`, `/planning/lifecycle`, `/planning/reference`, `/examples/[slug]` |
| UI | sidebar, toc, docs card, command matrix, Claude/Codex tab |
| Data | planning command 13개와 example page 4개 |
| 검증 로그 | `docs/plans/user-guide-website/execution-log.md` |

## 생성/수정 파일 묶음

| 묶음 | 파일 |
| --- | --- |
| Config | `next.config.mjs`, `next-env.d.ts`, `tsconfig.json`, `package.json`, `.gitignore` |
| App routes | `src/app/**` |
| Components | `src/components/docs/**` |
| Data | `src/lib/docs/**` |
| Docs log | `docs/plans/user-guide-website/execution-log.md` |

## 검증 결과

| 검증 | 결과 | 메모 |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | pass | lockfile 일관성 확인 |
| `pnpm test` | pass | 34 files / 423 tests |
| `pnpm docs:build` 1차 | fail | Next가 기존 `src/claude`/`src/codex` hook 파일까지 ESLint 대상으로 잡음 |
| `pnpm docs:build` 2차 | pass | `next.config.mjs`에서 build lint를 분리한 뒤 24 static pages generated |
| route smoke | pass | 21개 route HTTP 200 |
| protected path diff | pass | core protected path 변경 없음 |

## Route smoke 대상

```text
/
/planning
/planning/lifecycle
/planning/reference
/planning/plan-idea
/planning/plan-screen
/planning/plan-epic
/planning/plan-draft
/planning/plan-prd
/planning/plan-wireframe
/planning/plan-design
/planning/plan-stitch
/planning/plan-bridge
/planning/plan-review
/planning/plan-revise
/planning/plan-improve
/planning/plan-archive
/examples/website-build-pipeline
/examples/website-build-epic
/examples/website-build-artifacts
/examples/website-build-commands
```

## Known gap

현재 구현은 route와 구조 중심의 1차 구현이다. 기존 HTML 상세 문서의 `Runtime Flow`, `Output Lifecycle`, `Failure Modes`, command별 asset table은 다음 content parity 작업에서 더 자세히 반영해야 한다.

## 세부 구현 문서

| 문서 | 역할 |
| --- | --- |
| `03-implementation-source-map.md` | 구현 파일과 책임 추적 |
| `04-route-component-data-inventory.md` | route, component, data 연결 관계 |
| `05-verification-runbook.md` | 검증 명령, 결과, preview 실행 방법 |
| `06-commit-history-and-handoff.md` | 커밋 이력과 후속 handoff |
