> [REVIEW 반영] P0: A-1 단계 추가 (claude-kit 인프라 준비), 소스 경로 수정. P1: 게이트별 검증 증거 항목 추가.

# Claude Agent 도입 로드맵

- 문서 ID: CAI-08
- 작성일: 2026-04-15
- 문서 상태: 로드맵 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md), [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md), [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md), [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md), [05_qa-review-agent-spec.md](./05_qa-review-agent-spec.md), [06_command-workflow-spec.md](./06_command-workflow-spec.md), [07_hooks-and-rules-plan.md](./07_hooks-and-rules-plan.md), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner 홈페이지 정밀 카피 프로젝트에 Claude Agent 기능을 어떤 순서와 gate로 도입할지 정의한다.

## 1. 문서 목적

이 문서는 `docs/claude-agent-integration/` 명세 문서 작성 이후 실제 `.claude` agent/command/hook/rule 도입으로 넘어가기 위한 실행 로드맵이다. 핵심은 빠르게 자동화를 늘리는 것이 아니라, 원본 홈페이지 카피 품질을 안정적으로 끌어올리는 순서로 도입하는 것이다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | fidelity 분석, evidence 검증, command workflow, hooks/rules를 안전한 순서로 도입 |
| 기본 원칙 | 분석/검증 agent 우선, 구현/orchestrator agent 후순위 |
| 필수 gate | 실제 `.claude` 수정 전 사용자 승인 |
| 종료 상태 | 각 단계는 closeout과 commit 후 다음 단계 승인 대기 |

## 2. 도입 전략 요약

| 단계 | 도입 항목 | 이유 | 위험도 |
| --- | --- | --- | --- |
| A-1 | claude-kit 인프라 준비 | copy 도메인 디렉토리, package.json, profile/setup/template 반영 | 낮음 |
| A0 | plan workflow alignment | 이미 설치된 `/plan-*` 기능과 기존 copy/dev workflow의 책임 경계 정리 | 중간 |
| A1 | copy fidelity rules | 모든 agent가 참조할 공통 기준 | 낮음 |
| A2 | visual fidelity agent | 사용자가 체감하는 시각 차이를 가장 직접적으로 줄임 | 중간 |
| A3 | interaction fidelity agent | header/menu/sticky/state 체감 차이에 직접 대응 | 중상 |
| A4 | reference baseline agent | visual/interaction agent의 입력 품질 확보 | 중간 |
| A5 | QA review agent | evidence 없는 완료 방지 | 중간 |
| A6 | `/copy-*` command | 반복 실행 가능한 workflow 구성 | 중상 |
| A7 | hooks/rules reminder | evidence와 scope drift를 줄임 | 중상 |
| A8 | implementation-unit agent | 분석된 gap을 구현 단위로 전환 | 높음 |
| A9 | orchestrator agent | 전체 흐름 조율 | 높음, 후순위 |

## 3. 단계별 실행 계획

### 3.-1 A-1. claude-kit 인프라 준비

| 항목 | 내용 |
| --- | --- |
| 목적 | copy 도메인의 claude-kit 인프라를 준비하여 후속 단계에서 컴포넌트를 배치할 수 있게 한다. |
| 작업 항목 | `src/claude/copy/` 디렉토리 구조 생성 (`agents/`, `commands/`, `hooks/`, `rules/`, `skills/`) |
| | `src/claude/copy/hooks/package.json` 생성 (`{"type": "commonjs"}`) |
| | `profile.json`에 `"copy"` 도메인 추가 (선택 가능하도록) |
| | `setup.js`에 copy 도메인 처리 로직 추가 |
| | `CLAUDE.md.template`에 copy 도메인 섹션 추가 |
| | `CLAUDE-KIT-QUICKSTART.md.template`에 copy 도메인 가이드 추가 |
| | `exception-registry.json`에 copy 훅 Codex 호환성 예외 등록 |
| | `pairing-registry.json`에 copy 컴포넌트 항목 추가 (status: unpaired) |
| 선행 조건 | 없음 (최초 단계) |
| 검증 | `pnpm claude-kit:setup` 실행 후 `.claude/rules/copy-*.md` 등 copy 도메인 파일이 올바르게 배포되는지 확인 |
| 커밋 | `feat: claude-kit copy 도메인 인프라 추가` |
| Gate | setup.js가 copy 도메인을 올바르게 배포하는지 확인 |
| 위험 | 기존 도메인(core/dev/plan) 배포에 영향 없는지 회귀 확인 필요 |

### 3.0 A0. Plan Workflow Alignment

| 항목 | 내용 |
| --- | --- |
| 목적 | `/plan-*`, `/copy-*`, `/dev-*`의 책임 경계와 사용자 gate를 먼저 고정한다. |
| 생성 후보 | 기존 문서 갱신 중심. 즉시 `.claude` 구현 수정 없음 |
| 선행 조건 | CAI-10 작성, 현재 `.claude/commands/plan-*`, `.claude/agents/plan-*`, `.claude/skills/plan-*`, `plan-doc-guard.js` 확인 |
| 검증 | CAI-06/07/09가 plan 기능과 충돌하지 않는지 확인 |
| 커밋 | `docs: CAI plan workflow 반영` |
| Gate | `.plans/` 생성 또는 첫 `/plan-*` 실행 전 사용자 승인 |

### 3.1 A1. Copy Rules 기반 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | Claude가 Turner 홈페이지 정밀 카피 기준을 상시 참조할 수 있게 한다. |
| 생성 후보 | `.claude/rules/copy-fidelity.md` (소스: `src/claude/copy/rules/copy-fidelity.md`), `.claude/rules/copy-evidence.md` (소스: `src/claude/copy/rules/copy-evidence.md`), `.claude/rules/copy-gates.md` (소스: `src/claude/copy/rules/copy-gates.md`) |
| 선행 조건 | CAI-07 승인 |
| 검증 | rules 내용이 P1/P2/P3/P5/P10/P11과 충돌하지 않는지 확인 |
| 커밋 | `docs: copy fidelity rules 추가` |
| Gate | 사용자 확인 권장 |

### 3.2 A2. Visual Fidelity Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | visual gap board를 안정적으로 생성한다. |
| 생성 후보 | `.claude/agents/copy-fidelity.md` (소스: `src/claude/copy/agents/copy-fidelity.md`) |
| 선행 조건 | CAI-02, A1 |
| 검증 | P10의 기존 gap을 sample input으로 schema 출력 확인 |
| 커밋 | `feat: visual fidelity agent 추가` |
| Gate | P0/P1 gap output 사용자 확인 |

### 3.3 A3. Interaction Fidelity Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | hover/open/sticky/state transition gap을 분석한다. |
| 생성 후보 | `.claude/agents/copy-interaction-fidelity.md` (소스: `src/claude/copy/agents/copy-interaction-fidelity.md`) |
| 선행 조건 | CAI-03, A1 |
| 검증 | header hover/sticky/commitments sample state map 작성 |
| 커밋 | `feat: interaction fidelity agent 추가` |
| Gate | header/menu/sticky 판단 사용자 확인 |

### 3.4 A4. Reference Baseline Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | live/current evidence manifest와 missing report를 표준화한다. |
| 생성 후보 | `.claude/agents/copy-reference-baseline.md` (소스: `src/claude/copy/agents/copy-reference-baseline.md`) |
| 선행 조건 | CAI-04 |
| 검증 | 기존 R3 artifacts를 scan한 manifest sample 작성 |
| 커밋 | `feat: reference baseline agent 추가` |
| Gate | capture set 변경 시 사용자 또는 QA 확인 |

### 3.5 A5. QA Review Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | build/variant/evidence/document trace 검증을 fresh context로 수행한다. |
| 생성 후보 | `.claude/agents/copy-qa-reviewer.md` (소스: `src/claude/copy/agents/copy-qa-reviewer.md`) |
| 선행 조건 | CAI-05, A4 |
| 검증 | R3/R5 검증 항목으로 sample QA result 작성 |
| 커밋 | `feat: copy QA review agent 추가` |
| Gate | acceptance readiness 상태 사용자 확인 |

### 3.6 A6. Copy Command 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | agent를 반복 가능한 `/copy-*` workflow로 묶는다. |
| 생성 후보 | `.claude/commands/copy-reference-refresh.md` (소스: `src/claude/copy/commands/copy-reference-refresh.md`), `.claude/commands/copy-visual-review.md` (소스: `src/claude/copy/commands/copy-visual-review.md`), `.claude/commands/copy-interaction-review.md` (소스: `src/claude/copy/commands/copy-interaction-review.md`), `.claude/commands/copy-verify.md` (소스: `src/claude/copy/commands/copy-verify.md`) |
| 선행 조건 | CAI-06, A2~A5 |
| 검증 | 각 command가 input/output/gate를 명시하는지 확인 |
| 커밋 | `feat: copy command workflow 추가` |
| Gate | command가 다음 Phase를 자동 진행하지 않는지 확인 |

### 3.7 A7. Hooks/Rules Reminder 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | evidence 누락, scope drift, doc drift를 조기에 알린다. |
| 생성 후보 | `copy-evidence-reminder.js` (소스: `src/claude/copy/hooks/copy-evidence-reminder.js`), `copy-doc-drift-check.js` (소스: `src/claude/copy/hooks/copy-doc-drift-check.js`), settings hook 등록 |
| 선행 조건 | CAI-07, A6 |
| 검증 | sample edit에서 reminder만 출력하고 작업을 막지 않는지 확인 |
| 커밋 | `feat: copy evidence reminder hook 추가` |
| Gate | blocking hook은 별도 승인 |

### 3.8 A8. Implementation Unit Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | 승인된 gap row를 실행 단위 계획/구현 후보로 변환한다. |
| 생성 후보 | `.claude/agents/implementation-unit-agent.md` (소스: `src/claude/copy/agents/copy-implementation-unit.md`) |
| 선행 조건 | A2~A7 안정화 |
| 검증 | 실제 코드 수정 없이 execution unit plan sample 생성 |
| 커밋 | `feat: implementation unit agent 추가` |
| Gate | 실제 구현 권한은 사용자 승인 후 |

### 3.9 A9. Orchestrator Agent 도입

| 항목 | 내용 |
| --- | --- |
| 목적 | reference -> gap -> plan -> verify -> closeout 흐름을 조율한다. |
| 생성 후보 | `.claude/agents/copy-orchestrator-agent.md` (소스: `src/claude/copy/agents/copy-orchestrator.md`) |
| 선행 조건 | A1~A8 충분한 운영 경험 |
| 검증 | dry-run으로만 다음 실행 단위 추천 |
| 커밋 | `feat: copy orchestrator agent 추가` |
| Gate | 대그룹/Phase/R 자동 진행 금지 확인 |

## 4. 권장 우선순위

| 우선순위 | 항목 | 이유 |
| --- | --- | --- |
| -1 | A-1 claude-kit 인프라 준비 | copy 도메인 디렉토리/설정이 없으면 후속 단계의 파일 배치가 불가 |
| 0 | A0 Plan Workflow Alignment | 이미 설치된 plan 기능을 무시하면 command/gate 충돌이 생김 |
| 1 | A1 Copy Rules | 낮은 비용으로 모든 후속 agent 기준을 통일 |
| 2 | A2 Visual Fidelity Agent | 홈페이지 카피 품질 개선 효과가 가장 직접적 |
| 3 | A3 Interaction Fidelity Agent | 사용자가 지적한 header/menu/sticky 체감 차이에 대응 |
| 4 | A4 Reference Baseline Agent | 분석 품질의 입력 안정화 |
| 5 | A5 QA Review Agent | evidence 없는 완료 방지 |
| 6 | A6 Copy Commands | 반복 실행 가능성 확보 |
| 7 | A7 Reminder Hooks | 문서/증거 drift 감소 |
| 8 | A8 Implementation Agent | 구현 자동화는 분석/검증 안정화 후 |
| 9 | A9 Orchestrator | 가장 위험도가 높으므로 마지막 |

## 5. Gate 정책

| Gate | 시점 | 확인 항목 | 다음 단계 조건 | 검증 증거 |
| --- | --- | --- | --- | --- |
| Gate A-1 | A-1 완료 후 | copy 도메인 인프라가 정상 배포되는지 | A0 진입 승인 | `pnpm claude-kit:setup && ls .claude/rules/copy-*.md` (copy 룰 배포 확인) |
| Gate 0 | A0 완료 후 | plan/copy/dev 책임 경계와 `.plans/` 생성 정책이 명확한지 (SSOT: [CAI-09 `.plans/` 생성 게이트](./09_readiness-checklist.md#plans-생성-게이트-ssot)) | A1 rules 도입 또는 첫 plan command 실행 승인 | `cat src/claude/copy/commands/copy-*.md \| head -5` (plan/copy/dev 경계 파일 존재) |
| Gate A | CAI 문서 패키지 완료 후 | 명세와 readiness 완성도 | 실제 `.claude` (소스: `src/claude/copy/`) 수정 승인 | CAI 문서 링크 전수 검사 스크립트 |
| Gate B | A1 rules 도입 후 | rules가 기존 규칙과 충돌하지 않는지 | agent 도입 승인 | `ls src/claude/copy/rules/` (룰 파일 존재 + 기존 룰 충돌 없음) |
| Gate C | A2/A3 agent 도입 후 | sample output이 원본 fidelity 판단에 유용한지 | command 도입 승인 | agent dry-run sample output 검토 |
| Gate D | A4/A5 검증 agent 도입 후 | evidence와 QA 판정이 정확한지 | workflow 도입 승인 | QA result schema 준수 여부 sample 검증 |
| Gate E | A6/A7 command/hook 도입 후 | 자동화가 gate를 우회하지 않는지 | implementation agent 검토 | `node --check src/claude/copy/hooks/copy-*.js` (syntax 검증) |
| Gate F | A8/A9 도입 전 | 자동 구현/조율의 위험도 수용 여부 | 별도 사용자 승인 | dry-run 실행 단위 추천 결과 검토 |

## 6. Rollback 기준

| 변경 유형 | rollback 방식 |
| --- | --- |
| rule 문서 | 해당 rule 파일 revert 또는 비활성화 |
| agent 문서 | `.claude/agents/{name}.md` (소스: `src/claude/copy/agents/`) 제거 또는 archived 처리 |
| command 문서 | `.claude/commands/{name}.md` (소스: `src/claude/copy/commands/`) 제거 |
| hook script | settings에서 hook 제거 후 script 유지/삭제 |
| settings 변경 | 직전 commit revert 또는 hook block 제거 |

destructive command를 사용하지 않고, git revert 또는 후속 수정 커밋으로 되돌리는 것을 원칙으로 한다.

## 7. 검증 계획

| 검증 항목 | 방법 | 완료 기준 |
| --- | --- | --- |
| rules 검증 | 기존 `.claude/rules`와 중복/충돌 확인 | copy rules가 기존 rules를 덮어쓰지 않음 |
| agent 검증 | sample input -> expected table output 확인 | schema 준수 |
| command 검증 | dry-run 문서 출력 확인 | 실행 단위 lifecycle 누락 없음 |
| hook 검증 | sample edit scenario 확인 | reminder가 정상 출력, 과잉 block 없음 |
| plan 검증 | `/plan-*` command 목록과 CAI-06 책임 경계 대조 | plan은 선별/PRD/bridge, copy는 evidence/gap, dev는 구현으로 분리 |
| `.plans/` gate 검증 | `.plans/` 존재 여부와 사용자 승인 상태 확인 | 승인 전 생성하지 않음 |
| gate 검증 | closeout 후 다음 단계 시도 시나리오 확인 | 승인 대기 상태 유지 |
| commit 검증 | 실행 단위별 git status 확인 | unrelated dirty file 제외 |

## 8. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| 구현 자동화가 분석보다 먼저 도입됨 | high | `3 / 2 / 1 / 6 / likely / queued` | A8을 A1~A7 이후로 고정 |
| orchestrator가 사용자 gate를 우회 | high | `3 / 2 / 1 / 6 / likely / queued` | A9는 dry-run 추천만 허용 |
| hook blocking이 작업 속도를 떨어뜨림 | medium | `2 / 2 / 1 / 5 / likely / queued` | reminder 우선, blocking은 gate-stop만 제한 |
| 문서와 실제 `.claude` 구현이 drift | medium | `2 / 2 / 1 / 5 / likely / queued` | CAI-09 readiness와 doc sync command 사용 |
| plan workflow가 copy workflow와 중복 | high | `3 / 2 / 1 / 6 / likely / queued` | A0에서 plan은 pre-stage, copy는 fidelity evidence/gap layer로 고정 |
| `.plans/`가 승인 없이 생성됨 | high | `3 / 2 / 1 / 6 / likely / queued` | 첫 `/plan-*` 실행 전 Gate 0 확인 |

## 9. 다음 실행 단위 제안

| 실행 단위 | 목적 | 산출물 | 권장 커밋 |
| --- | --- | --- | --- |
| ADOPT-A-1-01 | claude-kit copy 도메인 인프라 준비 | `src/claude/copy/` 구조, profile.json, setup.js, 템플릿 갱신 | `feat: claude-kit copy 도메인 인프라 추가` |
| ADOPT-A-1-02 | Codex 레지스트리 copy 항목 등록 | `exception-registry.json`, `pairing-registry.json` | 레지스트리 항목 존재 | `chore: copy 도메인 Codex 레지스트리 등록` |
| ADOPT-A0-01 | plan workflow alignment 문서 반영 | CAI README/00~10 갱신 | `docs: CAI plan workflow 반영` |
| ADOPT-A1-01 | copy fidelity/evidence/gate rules 작성 | `src/claude/copy/rules/copy-*.md` | `docs: copy fidelity rules 추가` |
| ADOPT-A2-01 | visual fidelity agent 작성 | `src/claude/copy/agents/copy-fidelity.md` | `feat: visual fidelity agent 추가` |
| ADOPT-A3-01 | interaction fidelity agent 작성 | `src/claude/copy/agents/copy-interaction-fidelity.md` | `feat: interaction fidelity agent 추가` |
| ADOPT-A4-01 | reference baseline agent 작성 | `src/claude/copy/agents/copy-reference-baseline.md` | `feat: reference baseline agent 추가` |
| ADOPT-A5-01 | QA review agent 작성 | `src/claude/copy/agents/copy-qa-reviewer.md` | `feat: copy QA review agent 추가` |

## 10. 완료 기준

| 기준 | 상태 |
| --- | --- |
| 도입 단계 A-1~A9가 정의됨 | 완료 |
| 우선순위와 gate가 정의됨 | 완료 |
| rollback 기준이 있음 | 완료 |
| 다음 실행 단위 후보가 있음 | 완료 |
| 실제 `.claude` 구현은 하지 않음 | 의도적 제외 |

## 11. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 분석/검증 우선 도입 원칙 반영 | 완료 |
| 사용자 gate 유지 | 완료 |
| implementation/orchestrator 후순위 배치 | 완료 |
| plan workflow alignment 선행 단계 추가 | 완료 |
| A-1 claude-kit 인프라 준비 단계 추가 | 완료 |
| 게이트별 검증 증거 항목 추가 | 완료 |
| 소스 경로 parenthetical 반영 | 완료 |
| commit 단위 제안 포함 | 완료 |
| 실제 구현 범위 초과 여부 | 초과 없음 |
