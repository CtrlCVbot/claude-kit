# Source of Truth

> Audience: maintainer
> Related: [02-maintenance-workflow.md](02-maintenance-workflow.md), [03-generated-output-boundaries.md](03-generated-output-boundaries.md)

## 현재 우선순위

| 영역 | SSOT |
|---|---|
| Codex command, agent, skill source | `src/codex/**` |
| Claude source | `src/claude/**` |
| pairing 상태 | `src/pairing-registry.json` |
| exception 기록 | `src/exception-registry.json` |
| hook portability | `src/claude/_meta/codex-portability.json` |
| emitted output routing | `scripts/setup.js` |
| generated runtime output | `plugins/claude-kit/**`, `.agents/**`, `.codex/**`, `AGENTS.md` |

## 원칙

- `scripts/setup.js`가 emitted output routing의 최종 기준입니다.
- generated output은 검증 대상이지 primary edit target이 아닙니다.
- archive 문서는 배경 자료이지 live source의 대체물이 아닙니다.

## `AGENTS.md` authoring map

`AGENTS.md`는 template 한 파일만으로 완성되지 않습니다. 현재 구현 기준 source map은 아래와 같습니다.

| 단계 | source |
|---|---|
| wrapper template | `src/templates/AGENTS.md.template` |
| managed content blocks | `src/templates/agents-md/*` |
| block renderer | `scripts/agents-md-renderer.js` |
| merge policy | `scripts/agents-md-merger.js` |
| emission gate / routing | `scripts/setup.js` |
| generated output | repo root `AGENTS.md` |

유지보수 시에는 아래 순서로 확인합니다.

1. wrapper 문제인지, block content 문제인지 먼저 구분합니다.
2. `scripts/setup.js`가 현재 `targets` 기준으로 Codex emitter를 실제 호출하는지 확인합니다.
3. generated `AGENTS.md`를 직접 고치지 말고 source block 또는 emitter 정책을 수정합니다.
