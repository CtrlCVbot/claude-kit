# Component Specs

- 문서 ID: CAI-04
- 목적: `copy` 도메인에 추가할 agents, commands, hooks, rules, skills의 구현 contract를 정의한다.
- 선행 문서: [02-target-architecture.md](./02-target-architecture.md), [03-workflow-contracts.md](./03-workflow-contracts.md)

## 1. Agents

| Agent | Source path | 책임 | 금지 |
| --- | --- | --- | --- |
| `copy-fidelity` | `src/claude/copy/agents/copy-fidelity.md` | visual gap board 생성 | 코드 수정, evidence 없는 판단 |
| `copy-interaction-fidelity` | `src/claude/copy/agents/copy-interaction-fidelity.md` | state map, timing sheet, transition gap board 생성 | 정적 visual gap 중복 분석 |
| `copy-reference-baseline` | `src/claude/copy/agents/copy-reference-baseline.md` | manifest, missing evidence, pairing matrix 생성 | visual/interaction 원인 판단 |
| `copy-qa-reviewer` | `src/claude/copy/agents/copy-qa-reviewer.md` | evidence/build/document readiness 검증 | 최종 fidelity 승인 |

### 1.1 Agent frontmatter

각 agent는 YAML frontmatter를 가진다.

```yaml
---
name: copy-fidelity
description: 기준 화면 대비 visual fidelity gap을 evidence 기반으로 분석하는 agent.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### 1.2 Agent prompt format

본문은 `<Agent_Prompt>` XML 블록으로 감싸고 최소 아래 섹션을 포함한다.

```xml
<Agent_Prompt>
  <Role>...</Role>
  <Inputs>...</Inputs>
  <Constraints>...</Constraints>
  <Workflow>...</Workflow>
  <Output_Format>...</Output_Format>
  <Gate_Rules>...</Gate_Rules>
</Agent_Prompt>
```

## 2. Commands

| Command file | Source path | 목적 |
| --- | --- | --- |
| `copy-reference-refresh.md` | `src/claude/copy/commands/copy-reference-refresh.md` | manifest와 missing evidence report 생성 |
| `copy-visual-review.md` | `src/claude/copy/commands/copy-visual-review.md` | visual gap board 생성 |
| `copy-interaction-review.md` | `src/claude/copy/commands/copy-interaction-review.md` | interaction state map 생성 |
| `copy-gap-board.md` | `src/claude/copy/commands/copy-gap-board.md` | gap 우선순위와 실행 후보 통합 |
| `copy-plan-unit.md` | `src/claude/copy/commands/copy-plan-unit.md` | gap row를 실행 단위 계획으로 변환 |
| `copy-verify.md` | `src/claude/copy/commands/copy-verify.md` | copy QA readiness 검증 |
| `copy-closeout.md` | `src/claude/copy/commands/copy-closeout.md` | 실행 단위 마감과 잔여 리스크 기록 |

### 2.1 Command frontmatter

```yaml
---
name: copy-visual-review
description: 기준 화면과 현재 구현의 visual fidelity gap을 분석한다.
---
```

### 2.2 Command body requirements

| 항목 | 요구사항 |
| --- | --- |
| Purpose | command의 목적과 비목적 명시 |
| Inputs | 필요한 문서, evidence, path, command argument |
| Steps | 읽기, 분석, 출력, self-review 순서 |
| Output | Markdown table 또는 JSON-like schema |
| Gate | user-review 또는 self-review 조건 |
| Safety | 구현/수정 금지 또는 범위 제한 조건 |

## 3. Hooks

| Hook | Event | 기본 모드 | 목적 |
| --- | --- | --- | --- |
| `copy-evidence-reminder.js` | `PostToolUse Edit/Write` | reminder | visual/interaction 파일 수정 후 evidence 갱신 알림 |
| `copy-doc-drift-check.js` | `PostToolUse Edit/Write` | reminder | copy docs와 source 변경 drift 알림 |
| `copy-variant-env-guard.js` | `PostToolUse Edit/Write` | reminder | variant/env 변경 시 QA 요구 |
| `copy-scope-guard.js` | `PreToolUse Edit/Write` | reminder first | 실행 단위 범위 밖 수정 경고 |
| `copy-gate-stop.js` | `hooks.stop` 또는 command 종료 | blocking 후보 | closeout 이후 자동 진행 방지 |

### 3.1 Hook implementation contract

| 항목 | 요구사항 |
| --- | --- |
| Module format | CommonJS |
| `package.json` | `src/claude/copy/hooks/package.json`에 `{"type":"commonjs"}` |
| exit code | `0`은 allow/info, `2`는 blocking |
| scope | source path와 event matcher를 좁게 유지 |
| rollout | reminder hook 먼저, blocking hook은 별도 gate 후 |

## 4. Rules

| Rule | Source path | 내용 |
| --- | --- | --- |
| `copy-fidelity.md` | `src/claude/copy/rules/copy-fidelity.md` | visual/interaction fidelity 기준 |
| `copy-evidence.md` | `src/claude/copy/rules/copy-evidence.md` | capture naming, stale/missing/pairing 기준 |
| `copy-gates.md` | `src/claude/copy/rules/copy-gates.md` | P0/P1, phase, generated output gate |
| `copy-commands.md` | `src/claude/copy/rules/copy-commands.md` | `/copy-*` 사용 기준과 금지 사항 |
| `copy-variant.md` | `src/claude/copy/rules/copy-variant.md` | variant/host map 검증 기준 |

Rules는 `core` rules를 덮어쓰지 않고 copy 도메인에 독립 배치한다.

## 5. Skills

| Skill | Source path | 목적 |
| --- | --- | --- |
| `copy-command-workflow` | `src/claude/copy/skills/copy-command-workflow/SKILL.md` | `/copy-*` command 사용법 |
| `copy-evidence-management` | `src/claude/copy/skills/copy-evidence-management/SKILL.md` | manifest, pairing, stale/missing evidence 관리 |
| `copy-qa-workflow` | `src/claude/copy/skills/copy-qa-workflow/SKILL.md` | copy QA readiness 검증 |
| `copy-gap-analysis` | `src/claude/copy/skills/copy-gap-analysis/SKILL.md` | gap priority와 gate 판정 |

## 6. Component acceptance criteria

| 기준 | 완료 조건 |
| --- | --- |
| agents | 4개 agent가 frontmatter와 `<Agent_Prompt>` 구조를 가진다. |
| commands | 7개 command가 input/output/gate를 명시한다. |
| hooks | CommonJS syntax와 exit code 정책이 검증된다. |
| rules | copy rules가 core/dev/plan rules와 중복 없이 배치된다. |
| skills | skill별 `SKILL.md`가 존재하고 command/agent를 재사용 가능하게 안내한다. |
