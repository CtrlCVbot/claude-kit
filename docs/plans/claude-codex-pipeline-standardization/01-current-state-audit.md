# Current State Audit

> 상태: 계획 초안
> 기준일: 2026-05-26

## 현재 구조 요약

| 영역 | 현재 경로 | 성격 | 표준 판단 |
| --- | --- | --- | --- |
| Claude authoring source | `src/claude/**` | Claude Code용 원본 | primary edit target |
| Codex authoring source | `src/codex/**` | Codex용 원본 | primary edit target |
| shared templates | `src/templates/**` | `CLAUDE.md`, `AGENTS.md`, quickstart 등 생성 템플릿 | primary edit target |
| pairing registry | `src/pairing-registry.json` | Claude/Codex 자산 관계 기록 | primary edit target |
| exception registry | `src/exception-registry.json` | Codex conversion 예외 기록 | primary edit target |
| emitter | `scripts/setup.js` | source를 runtime output으로 생성 | primary edit target |
| Claude runtime output | `.claude/**`, `CLAUDE.md` | 설치 결과 | generated output |
| Codex direct-use output | `.agents/skills/**`, `.codex/agents/*.toml`, `AGENTS.md` | Codex repo-local runtime output | generated output |
| Codex plugin output | `plugins/claude-kit/**`, `.agents/plugins/marketplace.json` | plugin packaging output | generated output |

## active domains와 targets

`profile.json` 기준 현재 저장소는 다음 설정을 가진다.

| 항목 | 값 |
| --- | --- |
| domains | `core`, `dev`, `plan`, `copy` |
| targets | `claude`, `codex` |
| package manager | `npm` |
| test runner | `vitest` |

이 설정 때문에 `scripts/setup.js`는 Claude output과 Codex output을 모두 생성 대상으로 본다.

## emitter 동작

`scripts/setup.js`의 현재 동작은 크게 세 갈래다.

| 단계 | 입력 | 출력 | 메모 |
| --- | --- | --- | --- |
| Claude emitter | `src/claude/{domain}/{agents,commands,skills,hooks,rules}` | `.claude/**`, `CLAUDE.md`, `.claude/settings.json` | Claude Code용 runtime surface |
| Codex plugin emitter | `src/codex/{domain}/{agents,commands,skills}`와 compatible hooks | `plugins/claude-kit/**`, `plugins/claude-kit/hooks.json` | hooks와 rules는 별도 제약 존재 |
| Codex direct-use emitter | `src/codex/**/skills`, `src/codex/**/agents` | `.agents/skills/**`, `.codex/agents/*.toml` | Codex가 바로 읽는 repo-local 자산 |

중요한 점은 Codex commands는 plugin output에는 생성되지만 direct-use output에는 현재 skills와 agents만 생성된다는 것이다.

## 현재 generated output 상태

`.claude-kit-meta.json` 기준 현재 generated output은 다음으로 기록되어 있다.

| target | generated output |
| --- | --- |
| shared | `CLAUDE-KIT-QUICKSTART.md` |
| Claude | `CLAUDE.md`, `.claude/settings.json` |
| Codex | `AGENTS.md`, `.agents/skills/**`, `.codex/agents/*.toml`, `plugins/claude-kit/.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `plugins/claude-kit/hooks.json` |

또한 `profile.json`, `CLAUDE.md`, `AGENTS.md`는 기존 파일로 보존되었다고 metadata에 기록되어 있다.

## pairing registry 상태

`src/pairing-registry.json` 기준 현재 pairing 상태는 다음과 같다.

| type | status | count |
| --- | --- | ---: |
| agent | paired | 20 |
| command | paired | 40 |
| hook | paired | 15 |
| hook | codex-skip | 5 |
| rule | paired | 9 |
| rule | codex-skip | 1 |
| rule | unpaired | 5 |
| skill | paired | 31 |

도메인별 분포는 다음과 같다.

| domain | agents | commands | hooks | rules | skills |
| --- | ---: | ---: | ---: | ---: | ---: |
| core | 0 | 1 | 9 | 7 | 2 |
| dev | 7 | 21 | 3 | 1 | 15 |
| plan | 9 | 11 | 3 | 2 | 9 |
| copy | 4 | 7 | 5 | 5 | 5 |

## exception registry 상태

`src/exception-registry.json` 기준 exception은 다음으로 분류된다.

| status | strategy | count | 의미 |
| --- | --- | ---: | --- |
| resolved | paired-fallback | 9 | Codex에서 direct surface가 아니라 `AGENTS.md` guidance 등 fallback으로 보존 |
| resolved | paired-direct | 1 | Codex direct hook 후보로 해결 |
| active | paired-review | 5 | Codex 검증이 아직 남은 hook |

이 구조는 rules와 hooks가 단순히 1:1 복사되는 대상이 아니라는 점을 보여준다.

## Emitter preview 상태

`node scripts/setup.js --dry-run` 기준 실제 emitter preview는 다음과 같다.

| 항목 | preview 결과 | 메모 |
| --- | --- | --- |
| Codex compatible hooks | 22개 | `filterCodexHooks()` 기준 실제 emit 후보 |
| Codex skipped hooks | 6개 | `session-wrap-suggest.js` 1개 + copy domain hook 5개 |
| repo-local skills | 31개 | `.agents/skills/**` direct-use output |
| repo-local agents | 20개 | `.codex/agents/*.toml` direct-use output |
| direct-use conflicts | 0개 | 현재 preview 기준 충돌 없음 |
| AGENTS.md lint | ok | runtime guidance lint 경고 없음 |

주의할 점은 `pairing-registry.json`의 hook status 집계와 `setup.js --dry-run`의 compatible hook preview가 같은 숫자일 필요는 없다는 것이다. dry-run은 active domains의 hook 파일을 수집한 뒤 `codex-hook-compat.js` 기준으로 emit 가능 여부를 판정한다. 따라서 표준 문서에서는 registry 집계와 emitter preview를 분리해서 기록해야 한다.

## 날짜와 파일명 현황

날짜 계산과 파일명 규칙은 source가 여러 곳에 흩어져 있다. 실행 전에 하나의 우선순위를 정하지 않으면 Claude Code와 Codex가 같은 산출물에 다른 이름을 붙일 수 있다.

| 항목 | 현재 기준 | 메모 |
| --- | --- | --- |
| 현재 system date | `2026-05-26 10:43:33 +09:00` | `Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'`로 확인 |
| AGENTS.md managed date | `Today's date is 2026-04-24` | 현재 system date와 불일치 |
| Claude date rule | `src/claude/core/rules/date-calculation.md` | 존재 |
| Codex date rule source | 확인되지 않음 | `src/codex/core/rules/date-calculation.md` 없음 |
| AGENTS template date guidance | `src/templates/agents-md/90-date-calculation.md` | `{{DATE}}` 삽입과 `.claude/rules/date-calculation.md` 참조 |
| Task ID SSOT | `src/claude/core/_constants/task-id-patterns.json` | dev/plan/legacy/spike 패턴 정의 |
| plan artifact ID | `IDEA-{YYYYMMDD}-{NNN}`, `SCREENING-{YYYYMMDD}-{NNN}`, `EPIC-{YYYYMMDD}-{NNN}` | command source에 분산 |

상세 표준안은 [05-date-file-naming-rules.md](05-date-file-naming-rules.md)에 둔다.

## Epic layer 현황

Epic은 P1~P8 안에 끼워 넣는 단일 단계가 아니라, 여러 Feature를 묶는 opt-in 상위 계층이다. Epic이 없으면 기존 flat Feature pipeline이 그대로 동작한다.

| 항목 | 현재 기준 | 메모 |
| --- | --- | --- |
| command | `src/claude/plan/commands/plan-epic.md` | Claude command source는 존재 |
| Codex command | 확인되지 않음 | `src/codex/plan/commands/plan-epic.md`는 현재 없음 |
| skill | `.agents/skills/plan-epic-workflow/SKILL.md`, `src/claude/plan/skills/plan-epic-workflow/SKILL.md` | repo-local installed skill과 Claude source 확인 |
| Codex skill source | 확인되지 않음 | `src/codex/plan/skills/plan-epic-workflow/SKILL.md`는 현재 없음 |
| rule | `src/claude/plan/rules/plan-epic-hierarchy.md`, `src/codex/plan/rules/plan-epic-hierarchy.md` | pairing registry에는 rule paired로 기록 |
| 상태 폴더 | `.plans/epics/00-draft/`, `10-planning/`, `20-active/`, `30-completed/`, `90-archive/` | Epic 자체 lifecycle |
| child 연결 | `/plan-idea --epic=EPIC-{ID}` | 자식 IDEA 자동 연결 |
| binding | `.plans/features/active/{slug}/00-context/08-epic-binding.md` | 기존 Feature를 Epic에 연결할 때 사용 |

Epic 상태는 `draft -> planning -> active -> completed -> archived` 흐름을 가진다. `advance`에서는 상태 폴더 이동, `index.md` 갱신, child Feature binding 갱신이 필요하다.

## Plan pipeline 현황

`src/codex/plan/commands/*.md`, `src/claude/plan/commands/plan-epic.md`, `plan-epic-workflow`, `plan-pipeline` 기준 plan pipeline은 다음 흐름을 가진다.

| 단계 | command | 주요 산출물 | 승인/이동 |
| --- | --- | --- | --- |
| E0 | `plan-epic` | `.plans/epics/{status}/EPIC-{YYYYMMDD}-{NNN}/` | opt-in 상위 계층, Feature 3개 이상 또는 cross-cutting 요구가 있을 때만 사용 |
| P1 | `plan-idea` | `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` | 생성 직후 inbox |
| P2 | `plan-screen` | `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md`, `screening-matrix.md` | 승인 시 `20-approved` |
| P3 | `plan-draft` | `.plans/features/drafts/{slug}/first-pass.md` 또는 `.plans/features/active/{slug}.md` | Lite/Standard 분기 |
| P4 | `plan-prd` | `.plans/prd/00-draft/{slug}-prd.md` | 승인 시 `.plans/prd/10-approved/{slug}-prd.md` |
| P5 | `plan-wireframe` | `.plans/wireframes/{slug}/` | 승인 PRD 필요 |
| P6 | `plan-stitch` | `.plans/stitch/{slug}/` | PRD + wireframe 결합 |
| P7 | `plan-bridge` | `.plans/features/active/{slug}/00-context/**` | dev handoff |
| P8 | `plan-archive` | `.plans/archive/{slug}/ARCHIVE-{KEY}.md`, `sources/` | 완료 후 source 이동 |

## Copy pipeline 현황

copy domain은 evidence와 gap row 중심으로 lifecycle을 관리한다.

| command | 조건 | 산출물 |
| --- | --- | --- |
| `copy-reference-refresh` | `.plans/features/active/{slug}/`와 디자인 소스 필요 | `.plans/features/active/{slug}/evidence/manifest.json` |
| `copy-visual-review` | evidence manifest 필요 | Visual Gap Board, `VF-*` row |
| `copy-interaction-review` | evidence manifest 필요 | Interaction Gap Board, `IF-*` row |
| `copy-gap-board` | visual/interaction board 필요 | Prioritized Gap Board |
| `copy-plan-unit` | Gap Row ID 필요 | execution unit plan |
| `copy-verify` | build와 evidence 검증 가능 상태 | QA report |
| `copy-closeout` | `copy-verify` 완료와 사용자 승인 필요 | Closeout Memo, closeout status |

`copy-closeout`는 사용자 승인 없이 closeout 상태를 기록하지 않는다고 명시되어 있다. 이 원칙은 plan pipeline에도 공통 규칙으로 승격할 가치가 있다.

## 확인된 불일치

| ID | 불일치 | 근거 | 영향 |
| --- | --- | --- | --- |
| G1 | idea 보류/반려 경로가 갈라짐 | `idea-folders.json`과 `plan-idea-move-guard.js`는 `30-on-hold`를 허용하지만 `plan-screen.md`는 `90-archive`를 언급 | 이동 guard와 command 문서가 충돌 가능 |
| G2 | `idea-folders.json`에는 `90-archive`가 없음 | `folders`와 `allowedTransitions`에 `90-archive` 미포함 | 반려/보류 파일 이동 자동화 기준 불명확 |
| G3 | generated output과 source가 모두 repo에 존재 | `.agents/**`, `.codex/**`, `plugins/**`, `src/**` 동시 존재 | 작업자가 generated output을 직접 수정할 위험 |
| G4 | rules는 paired라도 Codex direct rules output이 아님 | registry의 `primaryCodex: fallback`, exception의 `agents-guidance` | Codex Rules policy와 `AGENTS.md` guidance를 혼동할 수 있음 |
| G5 | hook은 paired라도 모두 emit되는 것이 아님 | `codex-hook-compat.js`, `.claude-kit-meta.json` skipped hooks | Claude hook과 Codex hook 동작 차이 |
| G6 | Epic command가 Claude source에는 있지만 Codex command source에는 없음 | `src/claude/plan/commands/plan-epic.md` 존재, `src/codex/plan/commands/plan-epic.md` 미확인 | Codex에서 Epic을 command로 쓸지 결정 필요 |
| G7 | Epic repo-local skill은 있으나 현재 source/metadata 연결이 불명확함 | `.agents/skills/plan-epic-workflow/SKILL.md` 존재, `src/codex/plan/skills/plan-epic-workflow/SKILL.md`와 `.claude-kit-meta.json` entry 미확인 | generated output과 source가 어긋난 drift 후보 |
| G8 | `AGENTS.md`의 날짜와 system date가 다름 | `AGENTS.md`는 `2026-04-24`, system date는 `2026-05-26 +09:00` | 날짜 기반 ID가 잘못 생성될 수 있음 |
| G9 | Codex date rule source가 없음 | Claude rule source는 있으나 Codex sibling은 없음 | Codex는 `AGENTS.md` fallback에 의존 |
| G10 | `{NNN}` 채번 단위가 명시적으로 한 곳에 고정되지 않음 | Idea/Epic/Screening command에 분산 | 동시 실행 시 파일명 충돌 가능 |

## 현재 표준화에 필요한 결정

| 결정 | 추천 | 이유 |
| --- | --- | --- |
| idea hold 경로 | `30-on-hold`를 임시 표준으로 둔다 | 현재 guard와 constants가 실행 가능한 기준으로 갖고 있음 |
| rejected 경로 | 별도 결정 필요 | `90-archive`를 쓸지 `.plans/archive`로 보낼지 현재 근거가 갈림 |
| Epic Codex surface | 별도 결정 필요 | command-primary로 만들지, source-backed skill fallback으로 둘지 선택 필요 |
| 날짜 기준 | system date 또는 language runtime 우선 | `AGENTS.md` 날짜가 stale할 수 있음 |
| `{NNN}` 채번 단위 | artifact type별 당일 순번 추천 | Idea, Epic, Improvement가 서로 다른 lifecycle을 가짐 |
| source edit 기준 | `src/**`와 registry 우선 | emitter가 이 경로를 읽음 |
| generated output 수정 | 원칙적으로 금지 | 재생성 시 덮일 수 있음 |
| Codex rules 표면 | `AGENTS.md` fallback으로 설명 | 현재 setup flow가 Codex rules policy file을 생성하지 않음 |
