# Cross-AI Rules

> 상태: 제안
> 목적: Claude Code와 Codex가 같은 프로젝트에서 같은 lifecycle 규칙을 따르게 한다

## 공통 규칙

| ID | 규칙 | 이유 |
| --- | --- | --- |
| R1 | 작업 전 source와 generated output을 구분한다 | generated output 직접 수정 방지 |
| R2 | docs-only 요청이면 `src/**`, `scripts/**`, generated output을 수정하지 않는다 | 계획과 구현이 섞이지 않게 함 |
| R3 | 승인 전 파일과 승인 후 파일은 같은 위치에 두지 않는다 | 상태 혼동 방지 |
| R4 | 파일 이동 시 index, manifest, backlog를 함께 갱신한다 | 상태와 위치 불일치 방지 |
| R5 | 사용자 승인 없이 `approved`, `closed`, `archived` 상태를 기록하지 않는다 | 승인 흐름 보존 |
| R6 | 변경 요청은 draft 수정, approved revise, archive improve 중 하나로 분류한다 | 변경 이력 추적 |
| R7 | hook이나 guard가 있는 이동은 먼저 허용 transition을 확인한다 | 자동 차단과 문서 불일치 방지 |
| R8 | 완료 보고에는 실제 실행한 검증만 적는다 | evidence-first 유지 |
| R9 | Epic은 기본값이 아니라 opt-in 상위 계층으로만 사용한다 | 작은 Feature에 과한 계층을 만들지 않기 위함 |
| R10 | 날짜는 시스템/runtime 도구로 확인하고 파일명은 표준 매트릭스를 따른다 | AI별 임의 채번과 날짜 오판 방지 |

## Claude Code 전용 규칙

| 영역 | 규칙 |
| --- | --- |
| runtime output | `.claude/**`와 `CLAUDE.md`는 설치 결과로 본다 |
| source edit | Claude Code용 command, skill, agent, hook, rule은 `src/claude/**`를 먼저 확인한다 |
| Epic command | `/plan-epic`은 현재 Claude command source가 확인된다 |
| hook behavior | Claude hook은 `.claude/hooks/**`로 설치되지만 source는 `src/claude/**`다 |
| settings | `.claude/settings.json`은 generated output으로 보고 template과 emitter를 우선 확인한다 |
| maintainer commands | `.claude/commands/kit-*`는 repo maintenance toolchain으로 보고 소비자 프로젝트 runtime 기능으로 오해하지 않는다 |

## Codex 전용 규칙

| 영역 | 규칙 |
| --- | --- |
| runtime guidance | `AGENTS.md`는 Codex guidance surface다 |
| direct-use skills | `.agents/skills/**`는 `src/codex/**/skills/**`에서 생성된다 |
| direct-use agents | `.codex/agents/*.toml`은 `src/codex/**/agents/*.md`에서 생성된다 |
| plugin output | `plugins/claude-kit/**`는 plugin packaging output으로 본다 |
| commands | Codex commands는 plugin output에는 있지만 direct-use output 대상은 현재 아니다 |
| Epic command gap | `plan-epic`은 Codex command source가 현재 확인되지 않으므로, command-primary 전환 여부를 결정해야 한다 |
| Epic skill gap | `.agents/skills/plan-epic-workflow`는 있으나 현재 `src/codex` skill source와 metadata 연결은 확인되지 않는다 |
| rules | Codex guidance-style rules는 현재 `AGENTS.md` fallback이 중심이다 |
| hooks | compatible hook만 `plugins/claude-kit/hooks/**`와 `hooks.json`으로 emit된다 |

## Source 선택 규칙

| 작업 유형 | 먼저 볼 위치 | 수정 후보 |
| --- | --- | --- |
| Claude command 변경 | `src/claude/{domain}/commands/*.md` | source와 registry |
| Codex command 변경 | `src/codex/{domain}/commands/*.md` | source와 registry |
| Claude skill 변경 | `src/claude/{domain}/skills/**` | source와 support files |
| Codex skill 변경 | `src/codex/{domain}/skills/**` | source와 support files |
| Claude/Codex agent 변경 | `src/claude/**/agents`, `src/codex/**/agents` | source와 pairing registry |
| Epic workflow 변경 | `src/claude/plan/commands/plan-epic.md`, `src/claude/plan/skills/plan-epic-workflow/**`, `src/claude/plan/rules/plan-epic-hierarchy.md`, Codex sibling 여부 | Codex command/skill surface 결정 후 source와 registry |
| hook portability 변경 | `src/claude/**/hooks`, `src/codex/**/hooks`, `scripts/codex-hook-compat.js`, `src/claude/_meta/codex-portability.json` | source, metadata, compat logic |
| `AGENTS.md` guidance 변경 | `src/templates/agents-md/**`, `src/templates/AGENTS.md.template` | template |
| install output 변경 | `scripts/setup.js` | emitter |

## Generated output 금지 목록

아래 파일은 원칙적으로 primary edit target이 아니다.

| 경로 | 이유 |
| --- | --- |
| `AGENTS.md` | `src/templates/**`와 renderer/merger가 관리 |
| `CLAUDE.md` | `src/templates/**`와 renderer/merger가 관리 |
| `.claude/**` | Claude runtime output |
| `.agents/skills/**` | Codex direct-use generated skill |
| `.codex/agents/*.toml` | Codex direct-use generated agent |
| `plugins/claude-kit/**` | plugin packaging output |
| `.agents/plugins/marketplace.json` | plugin discovery metadata |
| `.claude-kit-meta.json` | install metadata |

예외는 inspection-only, emergency debugging, 또는 사용자의 명시 요청이 있을 때만 허용한다.

## Pairing status 규칙

| status | 뜻 | 처리 |
| --- | --- | --- |
| `paired` | Claude와 Codex source가 대응됨 | 둘 다 확인하고 drift 검증 |
| `codex-skip` | Codex에서 직접 제공하지 않음 | exception 사유 확인 |
| `unpaired` | 한쪽만 존재하거나 아직 변환되지 않음 | 신규 pairing 또는 skip 결정 필요 |

| field | 뜻 |
| --- | --- |
| `primaryCodex: command` | Codex command로 직접 의미를 가진다 |
| `primaryCodex: skill` | Codex skill로 직접 의미를 가진다 |
| `primaryCodex: agent` | Codex agent로 직접 의미를 가진다 |
| `primaryCodex: hook` | Codex hook으로 직접 의미를 가진다 |
| `primaryCodex: fallback` | direct surface가 아니라 `AGENTS.md` 등으로 보존한다 |
| `primaryCodex: none` | Codex surface가 없다 |

## Hook portability 규칙

| strategy | 의미 | 처리 |
| --- | --- | --- |
| `paired-direct` | Codex hook으로 emit 가능 | `src/codex/**` 우선, 없으면 fallback 확인 |
| `paired-fallback` | direct hook으로는 어렵고 다른 surface로 보존 | fallbackTarget 확인 |
| `paired-review` | Codex 적용 검증 필요 | output으로 확정하지 않음 |
| `blocked` | Codex 제공 불가 | skip 사유 기록 |

hook 변경 시 최소 검증은 다음이다.

```bash
node scripts/codex-hook-compat.js
node scripts/setup.js --dry-run
```

## 승인과 이동 규칙

| 작업 | 공통 gate |
| --- | --- |
| `00-inbox -> 10-screening` | screening 시작 근거 필요 |
| `10-screening -> 20-approved` | 사용자 승인 필요 |
| `00-draft -> 10-approved` | review 결과와 사용자 승인 필요 |
| Epic `draft -> planning` | Epic Brief, Children Features, child IDEA 최소 1개 필요 |
| Epic `planning -> active` | child IDEA 중 approved 최소 1개 필요 |
| Epic `active -> completed` | 모든 child Feature 완료 필요 |
| active package 변경 | 현재 stage와 owner 확인 필요 |
| closeout | verify 완료와 사용자 승인 필요 |
| archive | 완료 조건 확인과 사용자 승인 필요 |

## 보고 규칙

Claude Code와 Codex 모두 최종 보고에서 다음을 분리한다.

| 항목 | 설명 |
| --- | --- |
| 완료 | 실제 생성/수정된 산출물 |
| 검증 | 실행한 명령과 결과 |
| 피드백 | self-review 또는 reviewer 결과 |
| 남은 리스크 | 아직 결정되지 않은 정책, 미검증 항목 |
| 다음 단계 | 바로 이어서 할 수 있는 실행 단위 |
