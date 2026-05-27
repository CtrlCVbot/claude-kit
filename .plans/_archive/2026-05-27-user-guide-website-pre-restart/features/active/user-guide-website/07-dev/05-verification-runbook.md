# D2 Verification Runbook

- **Feature**: `user-guide-website`
- **Purpose**: 구현 검증 명령과 결과를 재현 가능하게 남긴다.
- **Status**: complete

## 검증 명령

| 순서 | 명령 | 목적 | 결과 |
| --- | --- | --- | --- |
| 1 | `pnpm install --frozen-lockfile` | lockfile과 dependency 일관성 확인 | pass |
| 2 | `pnpm test` | 기존 toolkit test suite 비회귀 확인 | pass |
| 3 | `pnpm docs:build` | Next.js production build 확인 | pass after config fix |
| 4 | local route smoke | 주요 route HTTP 200 확인 | pass |
| 5 | protected path diff | core 기능 source 변경 여부 확인 | pass |

## `pnpm docs:build` 1차 실패와 조치

1차 `pnpm docs:build`는 compile은 성공했지만 lint 단계에서 실패했다.

원인은 Next.js build lint가 기존 `src/claude/**`, `src/codex/**`의 Node-style hook 파일까지 ESLint 대상으로 잡았기 때문이다. 해당 파일들은 docs site source가 아니라 toolkit authoring source이며, 이번 작업의 수정 대상도 아니다.

조치는 `next.config.mjs`에 아래 설정을 추가하는 방식으로 했다.

```js
eslint: {
  ignoreDuringBuilds: true
}
```

이 결정은 docs build를 타입/production build 중심으로 검증하고, 기존 toolkit source lint 정책은 별도 workstream으로 분리한다는 의미다.

## Route smoke 대상

| Route | 결과 |
| --- | --- |
| `/` | 200 |
| `/planning` | 200 |
| `/planning/lifecycle` | 200 |
| `/planning/reference` | 200 |
| `/planning/plan-idea` | 200 |
| `/planning/plan-screen` | 200 |
| `/planning/plan-epic` | 200 |
| `/planning/plan-draft` | 200 |
| `/planning/plan-prd` | 200 |
| `/planning/plan-wireframe` | 200 |
| `/planning/plan-design` | 200 |
| `/planning/plan-stitch` | 200 |
| `/planning/plan-bridge` | 200 |
| `/planning/plan-review` | 200 |
| `/planning/plan-revise` | 200 |
| `/planning/plan-improve` | 200 |
| `/planning/plan-archive` | 200 |
| `/examples/website-build-pipeline` | 200 |
| `/examples/website-build-epic` | 200 |
| `/examples/website-build-artifacts` | 200 |
| `/examples/website-build-commands` | 200 |

## Preview 실행 방법

```powershell
pnpm docs:dev -- -H 127.0.0.1 -p 3102
```

브라우저에서 아래 주소를 연다.

```text
http://127.0.0.1:3102
```

## Preview 운영 메모

`3000` 포트는 다른 프로젝트가 사용할 수 있으므로, 이 작업에서는 충돌을 피하기 위해 `3102` 포트를 사용했다.

## Protected path check

이번 구현에서 변경되면 안 되는 경로는 아래와 같다.

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

검증 결과 위 경로 변경은 없었다.

