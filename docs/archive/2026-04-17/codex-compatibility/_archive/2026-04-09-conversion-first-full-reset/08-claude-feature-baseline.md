# Claude Feature Baseline

> 기존 `src/claude` 전체를 Codex 전환의 1차 입력으로 확정하는 문서

## 단계 위치

- 실행 단계: `1단계`
- 선행 조건: 없음
- 후속 문서: `09`, `10`

## 목적

이 문서는 현재 저장소에 이미 존재하는 Claude 기능을 빠짐없이 확인하고, migration tooling이 읽어야 할 입력 집합을 고정한다.

핵심은 새 기능 생성 규칙이 아니라 아래를 확정하는 것이다.

- 무엇이 전환 입력인가
- 어떤 기능 단위로 inventory를 만들 것인가
- 어떤 자산은 자동 전환 후보이고 어떤 자산은 수동 검토가 필요한가

## 1차 입력 범위

Migration 입력은 `src/claude/{core,dev,plan}` 전체다.

| source kind | 경로 예시 | 전환 관점 |
|-------------|-----------|-----------|
| `agent` | `src/claude/dev/agents/*.md` | Codex `subagent` 후보 |
| `command` | `src/claude/dev/commands/*.md` | Codex `skill` 후보 |
| `skill` | `src/claude/*/skills/*/SKILL.md` | Codex `skill` 후보 |
| `hook` | `src/claude/*/hooks/*.js` | Codex `hook` 또는 `skip` 후보 |
| `instruction-rule` | `src/claude/core/rules/*.md` | `AGENTS.md` synthesis 입력 |

## 현재 기준 인벤토리 요약

이 문서 세트의 baseline은 아래 수량을 기준으로 한다.

| kind | count |
|------|-------|
| `agent` | 12 |
| `command` | 31 |
| `skill` | 25 |
| `hook` | 9 |
| `instruction-rule` | 6 |
| total | 83 |

## 인벤토리 계약

이 단계의 카탈로그는 각 identity에 대해 아래 항목을 최소로 기록해야 한다.

- `identity`
- `domain`
- `source kind`
- `source path`
- `role summary`
- `trigger`
- `tool boundary`
- `write profile`
- `conversion difficulty`
- `notes`

입력/출력 contract, companion pair, Codex path는 이 단계에서 확정하지 않는다. 그 결정은 `10~12`에서 한다.

## migration 관점 기본 분류

기존 Claude 기능은 우선 아래 세 부류로 본다.

| 분류 | 의미 |
|------|------|
| `auto-convert candidate` | 기본 규칙만으로 Codex sibling 초안을 생성할 수 있음 |
| `convert-with-review` | 초안 생성은 가능하지만 수동 보정이 필요함 |
| `skip candidate` | Codex 공식 surface와 맞지 않아 `codex-skip` 검토가 필요함 |

대표 예시는 아래처럼 잠근다.

- `auto-convert candidate`: `dev-architect`, `dev-feature`, `dev-domain-modeling`
- `convert-with-review`: `plan-prd-writer`, `dev-doc-updater`, `plan-wireframe-designer`
- `skip candidate`: `session-wrap-suggest`, `output-secret-filter`

## 이 단계의 산출물

- Claude feature inventory 표
- source kind별 개수와 domain 분포
- migration 난이도 표식
- 후속 guide audit에서 봐야 할 workflow 연결점

## 완료 기준

- `src/claude` 전체 기능이 전환 입력으로 확정된다.
- 모든 Claude identity가 `agent`, `command`, `skill`, `hook`, `instruction-rule` 중 하나로 분류된다.
- 이후 단계가 create-time이 아니라 existing-source migration을 기준으로 시작할 수 있다.
