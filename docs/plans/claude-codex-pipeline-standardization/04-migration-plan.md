# Migration Plan

> 상태: 계획 초안
> 목표: 현재 구조를 표준 lifecycle과 cross-AI rules에 맞게 단계적으로 정렬

## 실행 원칙

| 원칙 | 설명 |
| --- | --- |
| docs-first | 먼저 정책과 lifecycle을 확정한 뒤 구현한다 |
| smallest change | 한 번에 하나의 lifecycle 불일치만 정리한다 |
| source first | `src/**`, registry, template, emitter 순서로 수정 대상을 정한다 |
| generated last | generated output은 dry-run 또는 rebuild 결과로만 확인한다 |
| verification required | 각 단계마다 확인 명령과 결과를 남긴다 |

## Phase plan

| Phase | 목표 | 산출물 | 검증 |
| --- | --- | --- | --- |
| P0 | 현재 기준 고정 | 이 문서 패키지 승인 | 사용자 리뷰 |
| P1 | vocabulary 결정 | 상태명과 폴더명 decision log | 문서 self-review |
| P2 | 날짜/파일명 규칙 결정 | timezone, 날짜 표기, ID/slug 채번 decision log | command source와 rule source 비교 |
| P3 | Epic surface 결정 | Codex `plan-epic` command-primary 또는 source-backed skill fallback 결정 | source/registry/metadata 비교 |
| P4 | idea 이동 규칙 정렬 | `30-on-hold`/`90-archive` 결정 반영 계획 | hook/constants/command 비교 |
| P5 | source/generated 안내 정렬 | `AGENTS.md`, quickstart, guide 문서 수정 계획 | `node scripts/setup.js --dry-run` |
| P6 | registry와 exception 정렬 | pairing/exception update task 목록 | `node scripts/codex-hook-compat.js` |
| P7 | generated output 검증 | dry-run, test, docs check 결과 | `pnpm test`, `node scripts/docs-generate.js --check` |

## P0: 문서 패키지 승인

| 작업 | 상태 | 메모 |
| --- | --- | --- |
| 현재 구조 조사 | 완료 | `scripts/setup.js`, registry, command source 확인 |
| lifecycle 표준안 작성 | 완료 | [02-lifecycle-standard.md](02-lifecycle-standard.md) |
| cross-AI 규칙 작성 | 완료 | [03-cross-ai-rules.md](03-cross-ai-rules.md) |
| 사용자 리뷰 | 대기 | 이 문서 패키지 승인 필요 |

## P1: vocabulary 결정

먼저 상태명과 폴더명을 고정한다.

| 결정 항목 | 현재 후보 | 추천 |
| --- | --- | --- |
| idea inbox | `00-inbox` | 유지 |
| screening | `10-screening` | 유지 |
| approved idea | `20-approved` | 유지 |
| hold | `30-on-hold` | 유지 |
| reject | `90-archive` 또는 archive package | `90-archive`를 명시적으로 추가하는 방향 추천 |
| final archive | `.plans/archive/{slug}/` | 유지 |
| PRD draft | `.plans/prd/00-draft/` | 유지 |
| PRD approved | `.plans/prd/10-approved/` | 유지 |

### P1 완료 조건

- `inbox`, `screened`, `approved`, `on-hold`, `rejected`, `archived`의 의미가 한 문서에 고정된다.
- 각 상태가 하나의 기본 위치를 가진다.
- `rejected`와 `archived`의 차이를 명확히 한다.

## P2: 날짜/파일명 규칙 결정

날짜와 파일명은 AI별 임의 판단이 생기기 쉬우므로 lifecycle 구현보다 먼저 고정한다.

| 결정 항목 | 현재 후보 | 추천 |
| --- | --- | --- |
| 날짜 확인 | `AGENTS.md` 안내, system date, language runtime | system date 또는 language runtime 우선 |
| timezone | 프로젝트별 local timezone, 사용자 timezone, UTC | 기본은 사용자/프로젝트 timezone, metadata에는 필요 시 UTC 병기 |
| ID 날짜 | `YYYYMMDD` | 유지 |
| 문서 metadata 날짜 | `YYYY-MM-DD` | 유지 |
| 백업 suffix | `YYYYMMDD-HHmmss` | 유지 |
| slug | lowercase kebab-case | 유지 |
| `{NNN}` 순번 | artifact type별 당일 순번, 전체 당일 순번 | artifact type별 당일 순번 추천 |

자세한 표준과 남은 모호성은 [05-date-file-naming-rules.md](05-date-file-naming-rules.md)에 둔다.

### P2 완료 조건

- 날짜 계산 우선순위를 문서와 template에 같은 표현으로 고정한다.
- `IDEA`, `SCREENING`, `EPIC`, `ARCHIVE`, `IMP`, `TASK` 계열 이름 규칙을 한 표로 고정한다.
- 동시 실행 시 `{NNN}` 충돌을 어떻게 피할지 결정한다.

## P3: Epic surface 결정

Epic은 현재 Claude command source와 repo-local installed skill은 확인되지만, Codex command source와 Codex skill source, `.claude-kit-meta.json`의 direct-use manifest entry는 확인되지 않았다.

| 선택지 | 설명 | 추천 |
| --- | --- | --- |
| A. Codex command-primary 추가 | `src/codex/plan/commands/plan-epic.md`를 만들고 registry에 command pairing 추가 | 장기 추천 |
| B. source-backed skill fallback 유지 | `src/codex/plan/skills/plan-epic-workflow/SKILL.md`를 source로 두고 `.agents/skills/plan-epic-workflow`로 emit되게 정렬 | 단기 가능 |
| C. Epic을 Claude-only로 명시 | Codex pipeline에서는 Epic을 제외 | 비추천 |

### P3 완료 조건

- Codex에서 Epic을 어떤 surface로 호출할지 결정한다.
- `plan-epic-hierarchy` rule, `plan-epic-workflow` skill, `plan-epic` command의 관계를 문서화한다.
- command-primary를 선택하면 `src/codex/plan/commands/plan-epic.md`와 pairing registry update를 별도 구현 task로 만든다.
- skill fallback을 선택해도 `src/codex/plan/skills/plan-epic-workflow/SKILL.md`와 metadata 정렬 여부를 확인한다.

## P4: idea 이동 규칙 정렬

현재 가장 큰 불일치는 `30-on-hold`와 `90-archive`다.

| 대상 | 현재 상태 | 필요한 정렬 |
| --- | --- | --- |
| `src/codex/plan/_constants/idea-folders.json` | `30-on-hold` 있음, `90-archive` 없음 | reject 표준 결정 후 갱신 |
| `src/claude/plan/_constants/idea-folders.json` | sibling 존재 | Codex와 동일하게 갱신 |
| `src/codex/plan/hooks/plan-idea-move-guard.js` | 허용 폴더 4개 | reject 경로 결정 후 허용 transition 갱신 |
| `src/claude/plan/hooks/plan-idea-move-guard.js` | sibling 존재 | Codex와 동일하게 갱신 |
| `src/codex/plan/commands/plan-screen.md` | `90-archive` 언급 | constants와 같은 vocabulary로 수정 |
| `src/claude/plan/commands/plan-screen.md` | sibling 존재 | Codex와 동일하게 수정 |

### P4 검증

```bash
node scripts/codex-hook-compat.js
node scripts/setup.js --dry-run
pnpm test
```

## P5: source/generated 안내 정렬

사용자와 AI가 generated output을 직접 수정하지 않도록 안내 문서를 정렬한다.

| 대상 | 정렬 내용 |
| --- | --- |
| `src/templates/agents-md/**` | Codex runtime guidance에 source/generated 구분 추가 |
| `src/templates/claude-md/**` | Claude Code guidance도 같은 원칙으로 정렬 |
| `CLAUDE-KIT-QUICKSTART.md` template | 설치 후 무엇을 수정하면 안 되는지 명확히 안내 |
| docs guide | 소비자 프로젝트용 안내와 maintainer용 안내를 분리 |

### P5 검증

```bash
node scripts/setup.js --dry-run
node scripts/docs-generate.js --check
```

## P6: registry와 exception 정렬

source 변경이 생기면 registry도 함께 정렬한다.

| 작업 | 기준 |
| --- | --- |
| 신규 paired asset | `src/pairing-registry.json`에 `paired` 기록 |
| Codex fallback | `src/exception-registry.json`에 strategy와 fallbackTarget 기록 |
| Codex skip | skip 사유와 승인 근거 기록 |
| hook direct 전환 | `codex-hook-compat.js`와 portability metadata 확인 |

### P6 검증

```bash
node scripts/codex-hook-compat.js
node scripts/setup.js --dry-run
```

## P7: 최종 검증 루프

구현 변경이 실제로 들어간 뒤에는 다음 순서로 검증한다.

| 순서 | 검증 | 목적 |
| --- | --- | --- |
| 1 | `node scripts/codex-hook-compat.js` | hook portability drift 확인 |
| 2 | `node scripts/setup.js --dry-run` | generated output preview 확인 |
| 3 | `node scripts/docs-generate.js --check` | generated docs drift 확인 |
| 4 | `pnpm test` | JS 로직 회귀 확인 |
| 5 | generated output spot check | `.agents/**`, `.codex/**`, `plugins/**`, `AGENTS.md` 결과 확인 |

검증 결과를 기록할 때는 registry count와 emitter preview count를 같은 표에 섞지 않는다. 예를 들어 hook은 `pairing-registry.json`의 `paired/codex-skip` 수와 `setup.js --dry-run`의 compatible/skipped 수가 서로 다른 관점의 숫자다.

## 리스크

| ID | 리스크 | 수준 | 대응 |
| --- | --- | --- | --- |
| R1 | `30-on-hold`와 `90-archive`를 동시에 유지하면 AI별 이동 결과가 달라질 수 있음 | high | P1에서 vocabulary를 먼저 결정 |
| R2 | generated output을 직접 고치면 다음 setup에서 덮일 수 있음 | high | source first 규칙을 `AGENTS.md`/guide에 반복 명시 |
| R3 | Codex rules를 policy file로 오해할 수 있음 | medium | 현재는 `AGENTS.md` fallback이라고 문서화 |
| R4 | hook compatibility가 Claude와 Codex에서 다르게 동작할 수 있음 | medium | `codex-hook-compat.js` 검증을 gate로 둠 |
| R5 | `docs/plans`와 기존 `docs/plan` 관례가 갈릴 수 있음 | low | 이번 패키지는 사용자 요청 경로를 따르고, 후속 정리 때 위치 통합 결정 |
| R6 | Epic command가 Codex command surface에 없으면 Claude/Codex plan pipeline 체감이 달라질 수 있음 | high | P3에서 command-primary 추가 여부 결정 |
| R7 | Epic skill output이 source/metadata와 연결되지 않으면 generated output drift가 누적될 수 있음 | high | P3에서 source-backed fallback 또는 command-primary로 정렬 |
| R8 | 날짜 source가 `AGENTS.md`와 system date 사이에서 갈리면 파일명 ID가 잘못 생성될 수 있음 | high | P2에서 runtime date 우선순위와 stale date 처리 규칙 확정 |
| R9 | `{NNN}` 채번 단위가 명확하지 않으면 동시 작업에서 파일명 충돌이 생길 수 있음 | medium | P2에서 artifact type별 당일 순번과 충돌 처리 확정 |

## 사용자 승인이 필요한 결정

| 결정 | 선택지 | 추천 |
| --- | --- | --- |
| rejected idea 위치 | `30-on-hold`, `90-archive`, `.plans/archive` | `90-archive`를 explicit rejected/closed idea 위치로 추가 |
| 날짜 기준 | `AGENTS.md`, system date, language runtime | system date 또는 language runtime 우선 |
| `{NNN}` 채번 단위 | artifact type별, 전체 당일 통합, 폴더별 | artifact type별 당일 순번 추천 |
| Codex Epic surface | command-primary 추가, source-backed skill fallback, Claude-only | command-primary 추가 추천 |
| docs package 위치 | `docs/plans/**`, `docs/plan/**` | repo 관례와 맞추려면 후속에서 `docs/plan/**`로 이동 검토 |
| Codex rules surface | `AGENTS.md` fallback 유지, direct rules policy 설계 | 당장은 fallback 유지 |
| generated output 검증 방식 | dry-run only, fixture install 추가 | fixture install 추가 추천 |

## 다음 구현 단위

1. 날짜 기준과 `{NNN}` 채번 단위를 먼저 확정한다.
2. `plan-epic`을 Codex command-primary로 추가할지 결정한다.
3. `rejected`와 `archived` vocabulary decision을 확정한다.
4. `idea-folders.json`, `plan-idea-move-guard.js`, `plan-screen.md`의 경로 vocabulary를 같은 단어로 맞춘다.
5. `src/templates/agents-md/**`와 `src/templates/claude-md/**`에 source/generated 구분을 짧게 반영한다.
6. `node scripts/setup.js --dry-run`으로 generated output preview가 의도와 맞는지 확인한다.
7. `pnpm test`와 `node scripts/codex-hook-compat.js`로 회귀를 확인한다.
