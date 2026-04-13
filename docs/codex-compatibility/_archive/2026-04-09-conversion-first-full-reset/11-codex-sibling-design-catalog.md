# Codex Sibling Design Catalog

> conversion 결과로 생성될 `src/codex` authoring source 규격을 정의하는 문서

## 단계 위치

- 실행 단계: `3단계-b`
- 선행 조건: `10`
- 후속 문서: `12`, `13`, `14`

## 목적

이 문서는 conversion tooling이 `src/claude`를 읽고 어떤 파일을 `src/codex`에 생성해야 하는지 path와 format 기준을 고정한다.

## 기본 원칙

- `src/codex`는 runtime artifact가 아니다.
- `src/codex`는 conversion-generated 후 수동 보정 가능한 authoring source다.
- 기존 Claude source를 그대로 복사하지 않고, Codex surface에 맞는 sibling을 생성한다.

## 기본 출력 규격

| Claude kind | Codex authoring output | companion |
|-------------|------------------------|-----------|
| `agent` | `src/codex/{domain}/agents/{identity}.toml` | write-capable인 경우 `{identity}.contract.json` |
| `command` | `src/codex/{domain}/skills/{identity}/SKILL.md` | 없음 |
| `skill` | `src/codex/{domain}/skills/{identity}/SKILL.md` | 선택적 reference 자산 |
| `hook` | `src/codex/{domain}/hooks/{identity}.js` | `{identity}.hook.json` |
| `instruction-rule` | 직접 file 생성 없음 | `AGENTS.md` synthesis 입력 |

## companion 규칙

### hook companion

- 모든 Codex hook sibling은 `*.js + *.hook.json` pair를 기본으로 한다.
- `*.hook.json`은 최소한 아래를 담는다.
  - event
  - matcher
  - enabled 기본값
  - skip reason 또는 runtime note

### write-capable subagent companion

- write-capable Codex subagent는 `*.toml + *.contract.json` pair를 기본으로 한다.
- `*.contract.json`은 최소한 아래를 담는다.
  - allowed write targets
  - deliverable shape
  - completion check
  - fallback mode

## 생성 결과 분류

이 문서에서 sibling 생성 결과는 아래로 나눈다.

| 상태 | 의미 |
|------|------|
| `required` | bulk migration 완료 전까지 반드시 생성되어야 하는 Codex sibling |
| `optional` | 선택적으로 생성 가능하지만 1차 cutover blocker는 아님 |
| `shared-guidance` | `src/codex` file 대신 shared synthesis로 처리 |
| `skip` | Codex sibling을 만들지 않고 명시적으로 생략 |

## 기본 catalog 규칙

- `agent`와 `command`는 기본적으로 `required`
- `skill`은 Claude와 Codex UX 차이가 작으면 `optional`
- `hook`은 호환 가능 항목만 `required` 또는 `optional`
- `instruction-rule`은 기본적으로 `shared-guidance`

## 대표 identity 규격

| identity | Claude source | Codex output | 상태 |
|----------|---------------|--------------|------|
| `dev-architect` | `dev/agents/*.md` | `dev/agents/dev-architect.toml` | `required` |
| `plan-prd-writer` | `plan/agents/*.md` | `plan/agents/plan-prd-writer.toml` + `.contract.json` | `required` |
| `dev-feature` | `dev/commands/*.md` | `dev/skills/dev-feature/SKILL.md` | `required` |
| `dev-tdd-guard` | `dev/hooks/*.js` | `dev/hooks/dev-tdd-guard.js` + `.hook.json` | `required` |
| `session-wrap-suggest` | `core/hooks/*.js` | none | `skip` |

## 완료 기준

- conversion tooling이 생성해야 할 `src/codex` path와 file 형식이 고정된다.
- hook과 write-capable subagent의 companion 규칙이 명시된다.
- `required / optional / shared-guidance / skip`가 구현 우선순위가 아니라 최종 지원 책임임이 분명해진다.
