> [REVIEW 반영] P0: 소스 경로 수정, 커맨드 개별 파일 분리 요구사항 추가, YAML 프론트매터 형식 명시. P1: 스킬 컴포넌트 제안.

# Claude Copy Command Workflow 명세

- 문서 ID: CAI-06
- 작성일: 2026-04-15
- 문서 상태: 명세 초안 완료
- 선행 문서: [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md), [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md), [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md), [05_qa-review-agent-spec.md](./05_qa-review-agent-spec.md), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner 홈페이지 정밀 카피 프로젝트에 필요한 `/plan-*`, `/copy-*`, `/dev-*` command의 책임 경계와 실행 단위 lifecycle 연결 방식을 정의한다.

## 1. 문서 목적

이 문서는 실제 `.claude/commands/` (소스: `src/claude/copy/commands/`) 파일을 만들기 전, command 단위의 역할과 입출력, 실행 순서, gate, commit 규칙을 고정한다. command는 agent를 호출하거나 문서/검증 산출물을 만들 수 있지만, 사용자 승인 gate를 우회해서는 안 된다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | Claude Agent 도입을 plan/copy/dev 단계로 나누고 실행 단위 workflow로 표준화 |
| 주요 대상 | `/plan-*` pre-stage, `/copy-reference-refresh`, `/copy-visual-review`, `/copy-interaction-review`, `/copy-verify`, `/copy-closeout`, `/dev-feature` |
| 주요 산출물 | command spec, input/output contract, lifecycle map |
| 금지 | command가 자동으로 다음 대그룹 또는 Phase로 진행 |

## 2. 실행 단위 Lifecycle

모든 `/copy-*` command는 기존 실행 단위 6단계를 보존해야 한다.

| 단계 | command가 해야 할 일 | 금지 |
| --- | --- | --- |
| 1. 실행별 계획서 작성 | 목적, 범위, 입력, 산출물, 완료 기준, 검증 방법 작성 | 바로 구현 |
| 2. 계획서 피드백 반영 | self-review 또는 사용자 피드백 반영 | 피드백 없이 구현 |
| 3. 구현 | 승인된 범위에서만 문서/코드/스크립트 작업 | 범위 밖 파일 수정 |
| 4. 구현 결과 피드백 반영 | diff/self-review/code-review 반영 | 리뷰 없이 검증 |
| 5. 검증 | build/evidence/link/QA 검증 수행 | 검증 없는 완료 |
| 6. 검증 시 피드백 반영 | 수정 가능 이슈 반영, 잔여 이슈 기록 | 잔여 이슈 숨김 |

## 3. Plan / Copy / Dev 책임 경계

| Layer | 주요 command | 책임 | 책임지지 않는 것 |
| --- | --- | --- | --- |
| Plan pre-stage | `/plan-idea`, `/plan-screen`, `/plan-draft`, `/plan-prd`, `/plan-wireframe`, `/plan-stitch`, `/plan-review`, `/plan-bridge` | fidelity 보강 후보 선별, PRD, wireframe, bridge, 사용자 승인 gate | screenshot evidence 분석 자체, 코드 구현 |
| Copy fidelity layer | `/copy-reference-refresh`, `/copy-visual-review`, `/copy-interaction-review`, `/copy-gap-board`, `/copy-plan-unit`, `/copy-verify`, `/copy-closeout` | 원본/current evidence 비교, visual/interaction gap 분석, QA readiness, closeout | plan 승인 우회, 일반 기능 구현 |
| Dev implementation layer | `/dev-feature`, `/dev-run`, `/dev-verify`, `/dev-commit` | 승인된 PRD/bridge/context 기반 구현과 일반 검증 | 원본 fidelity 최종 승인 |

`plan`은 구현을 시작하기 전 “무엇을 보강할지”를 잠그는 전단계다. `copy`는 Turner 원본과 현재 구현 사이의 fidelity evidence와 gap을 다루는 프로젝트 특화 layer다. `dev`는 승인된 산출물을 실제 구현으로 옮기는 layer다.

## 4. Plan Command 연결

| Command | copy workflow와의 연결 | Gate |
| --- | --- | --- |
| `/plan-idea` | P0/P1 fidelity gap 또는 capture 확장 요청을 idea로 등록 | 중복/범위 self-review |
| `/plan-screen` | gap을 RICE 보정 기준으로 선별하고 `/copy-gap-board` 후보를 좁힘 | 사용자 승인 필수 |
| `/plan-draft` | Lite는 `/copy-plan-unit`, Standard는 `/plan-prd`로 분기 | Lite/Standard 판정 확인 |
| `/plan-prd` | 큰 보강 항목의 요구사항과 acceptance를 고정 | PRD 승인 또는 revise |
| `/plan-wireframe` | menu/sticky/responsive state 구조를 보조 문서로 정리 | evidence 대체 금지 |
| `/plan-stitch` | PRD, wireframe, reference evidence, 구현 context를 연결 | mapping/context 검토 |
| `/plan-review` | PCC로 계획 산출물 일관성 확인 | PASS/WARN/FAIL 기록 |
| `/plan-bridge` | 승인된 plan 산출물을 `/copy-*` 또는 `/dev-feature` 입력으로 전환 | bridge context 승인 |
| `/plan-archive` | 완료된 보강 라운드를 archive로 묶음 | closeout 이후 승인 |
| `/plan-improve` | archive 기반 후속 gap을 재진입시킴 | 새 screening gate |

`.plans/` 산출물 root는 현재 미생성 상태이며, 생성 조건은 [CAI-09 `.plans/` 생성 게이트](./09_readiness-checklist.md#plans-생성-게이트-ssot)를 따른다.

## 5. Command 목록

| Command | 목적 | 주 agent | 주요 출력 |
| --- | --- | --- | --- |
| `/copy-reference-refresh` | reference/current capture 기준선과 manifest 준비 | copy-reference-baseline | baseline manifest, missing evidence report |
| `/copy-visual-review` | visual fidelity gap 분석 | copy-fidelity | visual gap board |
| `/copy-interaction-review` | hover/open/sticky/state gap 분석 | copy-interaction-fidelity | interaction state map |
| `/copy-gap-board` | visual/interaction gap을 실행 단위 후보로 통합 | copy-fidelity + copy-interaction-fidelity | prioritized gap board |
| `/copy-plan-unit` | 승인된 gap row 또는 plan bridge를 실행 단위 계획서로 변환 | implementation-unit-agent 후보 | execution unit plan |
| `/copy-verify` | build/evidence/document 검증 | copy-qa-reviewer | QA result report |
| `/copy-closeout` | 실행 단위/소그룹/Phase/R closeout 작성 | release-closeout-agent 후보 | closeout memo |
| `/copy-doc-sync` | P18/CAI 문서와 실제 `.claude` 변경 동기화 | doc-updater 확장 | doc drift report |

## 6. Command별 Input/Output Contract

### 6.1 `/copy-reference-refresh`

| 항목 | 내용 |
| --- | --- |
| 입력 | target URL, local URL, viewport list, state list, output root |
| 참조 문서 | CAI-04, P2, P11, P15 |
| 출력 | baseline manifest, missing evidence report, pairing matrix |
| 완료 기준 | P0/P1 state에 필요한 capture pair가 존재하거나 missing으로 명시 |
| gate | manifest가 바뀌면 사용자 또는 QA 담당자 확인 |

### 6.2 `/copy-visual-review`

| 항목 | 내용 |
| --- | --- |
| 입력 | section, viewport, live/current evidence paths |
| 참조 문서 | CAI-02, P3, P10 |
| 출력 | visual gap board |
| 완료 기준 | 모든 P0/P1 gap에 evidence와 verification이 있음 |
| gate | P0 visual gap은 user-review |

### 6.3 `/copy-interaction-review`

| 항목 | 내용 |
| --- | --- |
| 입력 | state name, trigger, live/current sequence evidence |
| 참조 문서 | CAI-03, P10, P11 |
| 출력 | state map, timing sheet, interaction gap board |
| 완료 기준 | idle/trigger/active/exit가 구분됨 |
| gate | header/menu/sticky P0 state는 user-review |

### 6.4 `/copy-gap-board`

| 항목 | 내용 |
| --- | --- |
| 입력 | visual gap board, interaction gap board, known gap |
| 참조 문서 | CAI-02, CAI-03, phase delta log |
| 출력 | prioritized implementation candidate table |
| 완료 기준 | P0/P1/P2, 선행 조건, 검증 방법, 권장 commit type이 있음 |
| gate | P0 실행 후보 선정 전 사용자 확인 |

### 6.5 `/copy-plan-unit`

| 항목 | 내용 |
| --- | --- |
| 입력 | gap row 또는 backlog row |
| 참조 문서 | P11, P12, CAI-06, CAI-10, 필요 시 plan bridge context |
| 출력 | 실행 단위 계획서 |
| 완료 기준 | 목적, 작업 내용, 선행 조건, 산출물, 완료 기준, 검증 방법 존재 |
| gate | 구현 전 계획 피드백 반영 |

### 6.6 `/copy-verify`

| 항목 | 내용 |
| --- | --- |
| 입력 | changed files, evidence root, expected checks |
| 참조 문서 | CAI-05, P5, P15, P17 |
| 출력 | QA result report, acceptance readiness |
| 완료 기준 | PASS/PARTIAL/FAIL/SKIPPED가 근거와 함께 기록 |
| gate | `READY_FOR_USER_GATE` 또는 `READY_WITH_LOGGED_GAPS`만 closeout 가능 |

### 6.7 `/copy-closeout`

| 항목 | 내용 |
| --- | --- |
| 입력 | execution unit result, verification report, residual issues |
| 참조 문서 | P8, P9, CAI-08 |
| 출력 | execution/section/phase closeout memo |
| 완료 기준 | 완료 범위, 검증 결과, 남은 이슈, 다음 gate가 명확함 |
| gate | Phase/R 종료 시 `승인 대기`로 멈춤 |

## 7. Workflow 조합

### 7.1 Plan pre-stage 흐름

```text
/plan-idea
-> /plan-screen
-> 사용자 승인
-> /plan-draft
-> Lite이면 /copy-plan-unit
-> Standard이면 /plan-prd -> /plan-wireframe 또는 /plan-stitch -> /plan-review -> /plan-bridge
```

### 7.2 분석 전용 흐름

```text
/copy-reference-refresh
-> /copy-visual-review
-> /copy-interaction-review
-> /copy-gap-board
-> 사용자 확인
```

### 7.3 실행 단위 구현 준비 흐름

```text
/copy-gap-board 또는 /plan-bridge
-> /copy-plan-unit
-> 계획 self-review
-> 사용자 또는 scope gate 확인
-> 구현 착수
```

### 7.4 검증/마감 흐름

```text
/copy-verify
-> /copy-closeout
-> git status scope review
-> 실행 단위 commit
-> Phase/R 종료 시 승인 대기
```

## 8. Commit 규칙

| 상황 | 커밋 기준 | 메시지 예 |
| --- | --- | --- |
| 문서 실행 단위 완료 | 문서 1개 또는 coherent 문서 묶음 | `docs: visual fidelity agent 명세 정리` |
| 구현 실행 단위 완료 | 실행 단위 1개 | `feat: header hover fidelity 보강` |
| QA 산출물 완료 | 검증 report 또는 script 단위 | `docs: R3 interactive QA 결과 정리` |
| command/hook 실제 추가 | 기능 단위 | `feat: copy visual review command 추가` |
| plan 문서 반영 | coherent 문서 묶음 | `docs: CAI plan workflow 반영` |
| 수정/보정 | 국소 수정 | `fix: copy verify evidence 판정 보정` |

커밋 전에는 반드시 unrelated dirty file을 제외한다. 현재 프로젝트의 로컬 계정은 `CtrlCVbot <ctrlcvmail@gmail.com>`를 사용한다.

## 9. 기존 `/dev-*` command와의 관계

| 기존 command | 유지 역할 | `/copy-*`와의 관계 |
| --- | --- | --- |
| `/dev-feature` | 일반 feature package 생성 | copy 실행 단위가 code feature로 전환될 때 보조 |
| `/dev-run` | TDD 기반 구현 | visual evidence guard와 충돌 여부 검토 필요 |
| `/dev-verify` | build/lint/test 검증 | `/copy-verify`가 evidence/variant 검증을 보완 |
| `/dev-handoff-verify` | fresh context 검증 | QA review agent와 결합 가능 |
| `/dev-sync-docs` | 문서 동기화 | P18/CAI 문서 drift 확인에 확장 가능 |
| `/dev-commit` | commit 생성 | 실행 단위별 commit 규칙과 연결 |

## 10. Command 구현 전 요구사항

| 요구사항 | 설명 |
| --- | --- |
| Agent spec 완료 | CAI-02~05가 먼저 작성되어야 한다. |
| Plan 통합 기준 확인 | CAI-10 기준으로 `/plan-*`, `/copy-*`, `/dev-*` 책임 경계를 확인해야 한다. |
| Hook/rule 정책 확인 | CAI-07에서 blocking/reminder 기준을 확인해야 한다. |
| Readiness 통과 | CAI-09에서 command 구현 전 checklist를 통과해야 한다. |
| 사용자 승인 | 실제 `.claude/commands/` (소스: `src/claude/copy/commands/`) 수정 전 승인 필요 |

## 11. 검증 기준

| 검증 항목 | 방법 | 통과 기준 |
| --- | --- | --- |
| lifecycle coverage | 6단계와 command 흐름 대조 | 각 command가 어느 단계에 속하는지 명확 |
| gate preservation | Phase/R 종료 흐름 확인 | `승인 대기` 상태 존재 |
| scope safety | commit 전 `git status` 확인 | unrelated dirty file 제외 |
| agent 연결 | CAI-02~05와 command 대조 | 주 agent가 명확 |
| 기존 dev command 충돌 | `/dev-*`와 역할 대조 | 중복 또는 충돌이 문서화 |
| plan command 충돌 | `/plan-*`와 `/copy-*` 역할 대조 | plan은 선별/PRD/bridge, copy는 evidence/gap/QA로 분리 |
| `.plans/` 생성 gate | `.plans/` 존재 여부와 사용자 승인 확인 | 승인 전 자동 생성하지 않음 |

## 12. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| `/copy-*` command가 기존 `/dev-*`와 중복 | medium | `2 / 2 / 1 / 5 / likely / queued` | copy-specific evidence/fidelity만 담당하도록 제한 |
| command가 사용자 gate를 우회 | high | `3 / 2 / 1 / 6 / likely / queued` | closeout command가 `승인 대기`로 종료하도록 명시 |
| visual 작업에 TDD command가 과도 적용 | medium | `2 / 2 / 1 / 5 / likely / queued` | visual evidence guard와 TDD guard를 분리 |
| command 구현 전 spec이 불충분 | medium | `2 / 1 / 1 / 4 / likely / queued` | CAI-09 readiness를 구현 전 필수로 둠 |
| `/plan-draft`와 `/copy-plan-unit` 책임 중복 | medium | `2 / 2 / 1 / 5 / likely / queued` | `/plan-draft`는 기능 범위 판정, `/copy-plan-unit`은 실행 단위 세부 계획으로 분리 |
| `.plans/`가 승인 없이 생성됨 | high | `3 / 2 / 1 / 6 / likely / queued` | 첫 `/plan-*` 실행 전 사용자 gate와 CAI-09 plan readiness 확인 |

## 13. 완료 기준

| 기준 | 상태 |
| --- | --- |
| `/copy-*` command 후보와 역할 정의 | 완료 |
| `/plan-*`, `/copy-*`, `/dev-*` 책임 경계 정의 | 완료 |
| command별 input/output/gate 정의 | 완료 |
| 실행 단위 lifecycle 연결 | 완료 |
| commit 규칙 연결 | 완료 |
| 실제 command 파일 생성은 하지 않음 | 의도적 제외 |

## 14. claude-kit 구현 요구사항

### 설계 문서와 구현 파일의 분리

CAI-06은 **설계 문서**로 유지한다. 실제 구현 시 각 커맨드를 독립 `.md` 파일로 분리해야 한다.

| 소스 경로 | 배포 경로 | 역할 |
| --- | --- | --- |
| `src/claude/copy/commands/copy-reference-refresh.md` | `.claude/commands/copy-reference-refresh.md` | 캡처 기준선/매니페스트 준비 |
| `src/claude/copy/commands/copy-visual-review.md` | `.claude/commands/copy-visual-review.md` | 시각적 충실도 갭 분석 |
| `src/claude/copy/commands/copy-interaction-review.md` | `.claude/commands/copy-interaction-review.md` | 인터랙션 충실도 갭 분석 |
| `src/claude/copy/commands/copy-gap-board.md` | `.claude/commands/copy-gap-board.md` | 통합 갭 보드 생성 |
| `src/claude/copy/commands/copy-plan-unit.md` | `.claude/commands/copy-plan-unit.md` | 실행 단위 계획서 변환 |
| `src/claude/copy/commands/copy-verify.md` | `.claude/commands/copy-verify.md` | QA 검증 수행 |
| `src/claude/copy/commands/copy-closeout.md` | `.claude/commands/copy-closeout.md` | 실행 단위/Phase 마감 |

### YAML 프론트매터 필수

각 커맨드 파일은 YAML 프론트매터를 포함해야 한다. 참조: `src/claude/dev/commands/dev-commit.md`.

```yaml
---
name: copy-reference-refresh
description: 베이스라인 매니페스트를 생성/갱신하는 커맨드.
---
```

```yaml
---
name: copy-visual-review
description: Turner 원본과 현재 구현의 시각적 충실도 갭을 분석하는 커맨드.
---
```

```yaml
---
name: copy-verify
description: build/evidence/document 검증을 수행하는 커맨드.
---
```

### P1: 스킬 컴포넌트 제안

copy 커맨드 사용법과 워크플로우 가이드를 스킬로 제공한다.

| 소스 경로 | 배포 경로 | 목적 |
| --- | --- | --- |
| `src/claude/copy/skills/copy-command-workflow/SKILL.md` | `.claude/skills/copy-command-workflow/SKILL.md` | `/copy-*` 커맨드 사용법 및 워크플로우 가이드 |

## 15. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| CAI-02~05 agent spec과 연결 | 완료 |
| 기존 `/dev-*`와 역할 분리 | 완료 |
| `/plan-*`와 역할 분리 | 완료 |
| 사용자 gate 유지 | 완료 |
| commit 규칙 반영 | 완료 |
| claude-kit 소스 경로 및 YAML 프론트매터 요구사항 반영 | 완료 |
| 실제 구현 범위 초과 여부 | 초과 없음 |
