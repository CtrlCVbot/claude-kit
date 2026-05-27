# Claude/Codex Pipeline Standardization

> 상태: 계획 초안
> 작성일: 2026-05-26
> 범위: docs-only

이 문서 패키지는 Claude Code와 Codex가 `claude-kit` 파이프라인을 사용할 때 파일 생성, 승인, 변경 반영, 이동, 아카이빙 흐름을 같은 규칙으로 다루기 위한 표준화 계획이다.

이번 작업은 코드나 generated output을 수정하지 않는다. 현재 저장소의 실제 파일과 emitter 동작을 근거로 표준안을 정리한다.

## 읽는 순서

| 순서 | 문서 | 역할 |
| --- | --- | --- |
| 1 | [00-overview.md](00-overview.md) | 문제, 목표, 범위, 용어를 먼저 정리 |
| 2 | [01-current-state-audit.md](01-current-state-audit.md) | 현재 Claude Code/Codex 구조와 차이 확인 |
| 3 | [02-lifecycle-standard.md](02-lifecycle-standard.md) | 파일 생성부터 아카이빙까지 표준 lifecycle 제안 |
| 4 | [03-cross-ai-rules.md](03-cross-ai-rules.md) | 두 AI가 공통으로 지킬 규칙과 전용 규칙 분리 |
| 5 | [04-migration-plan.md](04-migration-plan.md) | 현재 구조에서 표준 구조로 옮기는 실행 계획 |
| 6 | [05-date-file-naming-rules.md](05-date-file-naming-rules.md) | 날짜 계산, 파일명, ID 채번, 모호성 정리 |

## 핵심 결론

| 항목 | 결론 | 근거 |
| --- | --- | --- |
| source of truth | `src/claude/**`, `src/codex/**`, `src/templates/**`, registry 파일을 기준으로 본다 | `scripts/setup.js`가 이 경로를 읽어 output 생성 |
| generated output | `.claude/**`, `.agents/**`, `.codex/**`, `plugins/claude-kit/**`, `AGENTS.md`, `CLAUDE.md`는 직접 수정 대상이 아니다 | `.claude-kit-meta.json`와 `scripts/setup.js` output 정의 |
| Codex direct-use | Codex skill은 `.agents/skills/**`, agent는 `.codex/agents/*.toml`로 생성된다 | `emitCodexDirectUse()` |
| plugin output | Codex plugin은 `plugins/claude-kit/**`에 생성된다 | `emitCodex()` |
| Epic layer | Epic은 P1~P8 안의 한 단계가 아니라 여러 Feature를 묶는 opt-in 상위 계층이다 | `plan-epic-workflow`, `plan-epic-hierarchy.md` |
| 날짜/파일명 | 날짜는 runtime 도구로 확인하고, 파일명은 artifact type별 패턴을 따른다 | `date-calculation.md`, plan command source, task-id SSOT |
| 승인 lifecycle | idea는 `00-inbox -> 10-screening -> 20-approved`가 현재 가장 명확하다 | `plan-idea.md`, `plan-screen.md`, `idea-folders.json` |
| Codex Epic gap | `.agents/skills/plan-epic-workflow`는 있으나 현재 `src/codex` command/skill source와 install metadata entry는 확인되지 않는다 | `src/claude/plan/commands/plan-epic.md`, `src/codex/plan/commands/`, `.claude-kit-meta.json` |
| 불일치 | Hold/Reject 이동 경로가 `30-on-hold`와 `90-archive`로 갈라져 있다 | `idea-folders.json`, `plan-screen.md`, `plan-idea-move-guard.js` |
| emitter preview | Codex direct-use는 skills 31개, agents 20개, conflicts 0개로 preview된다 | `node scripts/setup.js --dry-run` |

## 이번 표준안의 권장 방향

1. 소비자 프로젝트의 산출물 lifecycle은 `.plans/**` 아래에서 관리한다.
2. Epic은 필요할 때만 생성하며, 기본 Feature pipeline을 강제로 바꾸지 않는 opt-in 상위 계층으로 둔다.
3. `claude-kit` 자체 자산 lifecycle은 `src/** -> registry -> generated output -> verification` 순서로 관리한다.
4. 승인 전 문서는 draft 또는 screening 위치에 둔다.
5. 승인된 문서만 `approved` 위치로 이동한다.
6. generated output은 검증 대상으로만 보고, primary edit target으로 삼지 않는다.
7. 경로 이동 규칙은 hook, command, schema, 문서가 같은 vocabulary를 쓰도록 정렬한다.

## 다음 실행 단계

1. [04-migration-plan.md](04-migration-plan.md)의 P0부터 진행해 현재 불일치 목록을 issue 단위로 확정한다.
2. `plan-epic`을 Codex command surface로도 제공할지, skill-only fallback으로 둘지 결정한다.
3. 날짜 기준, timezone, `{NNN}` 순번 채번 방식을 확정한다.
4. `30-on-hold`와 `90-archive` 중 idea 반려/보류 표준 경로를 결정한다.
5. 결정 후 `src/claude/**`, `src/codex/**`, `src/templates/**`, registry, docs를 같은 순서로 정렬한다.
6. `node scripts/setup.js --dry-run`, `node scripts/codex-hook-compat.js`, `pnpm test`로 generated output 영향까지 확인한다.
