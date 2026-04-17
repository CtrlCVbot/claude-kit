# Claude Source Baseline

> conversion 입력으로 삼을 `src/claude` 전체 기능 지형을 정리하는 문서

## 입력 범위

conversion 입력은 `src/claude/{core,dev,plan}` 전체다.

| kind | source 예시 | 비고 |
|------|-------------|------|
| `agent` | `src/claude/dev/agents/*.md` | subagent 후보 |
| `command` | `src/claude/dev/commands/*.md` | skill 후보 |
| `skill` | `src/claude/*/skills/*/SKILL.md` | direct or adapted skill 후보 |
| `hook` | `src/claude/*/hooks/*.js` | hook 또는 skip 후보 |
| `instruction-rule` | `src/claude/core/rules/*.md` | `AGENTS.md` synthesis 입력 |

## 현재 기준 수량

| kind | count |
|------|-------|
| `agent` | 12 |
| `command` | 31 |
| `skill` | 25 |
| `hook` | 9 |
| `instruction-rule` | 6 |
| total | 83 |

## domain 분포

- `core`: hooks, rules, skills 중심
- `dev`: agents, commands, hooks, skills가 가장 많음
- `plan`: planning agents, commands, hooks, skills가 묶여 있음

## baseline에서 반드시 기록할 것

- identity
- domain
- source kind
- source path
- 역할 요약
- trigger
- write profile
- Claude 전용 문법 여부
- conversion 난이도

## 대표 고위험 항목

- `plan-prd-writer`
- `plan-wireframe-designer`
- `dev-doc-updater`
- `session-wrap-suggest`
- `output-secret-filter`

이 항목들은 자동 전환보다 수동 보정 또는 skip 판단이 중요하다.
