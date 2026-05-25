# schema-pairing-registry

> pairing-registry (`src/pairing-registry.json`) 검증 스키마 (codex-sync v2)

## 대상

`src/pairing-registry.json`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/pairing-registry.json` |
| JSON 유효 | FAIL | `JSON.parse` 성공 |
| `$schema` 필드 | FAIL | `"pairing-registry-v1"` 또는 `"pairing-registry-v2"` |
| `description` 필드 | WARN | 비어있지 않은 문자열 |
| `entries` 배열 | FAIL | 배열 타입 |

## Entry 필드 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `identity` | FAIL | 존재 + 비어있지 않음 |
| `type` | FAIL | enum: `skill` / `agent` / `command` / `hook` / `rule` |
| `domain` | FAIL | enum: `core` / `dev` / `plan` / `copy` |
| `status` | FAIL | enum: `paired` / `codex-skip` / `codex-native-only` / `unpaired` |
| `reason` | WARN | status=codex-skip/codex-native-only일 때 비어있지 않음 |
| `claude` | WARN | null 또는 존재하는 파일 경로 string |
| `codex` | WARN | null 또는 존재하는 파일 경로 string |
| `createdAt` | WARN | ISO 8601 timestamp |
| `lastSyncedAt` | INFO | ISO 8601 timestamp 또는 null |
| `contentHash` | INFO | Claude source SHA-256 앞 8자 hex 또는 null |

## v2 추가 필드

`pairing-registry-v2`는 기존 relationship `status`를 유지하고, command 전환 상태와 drift 상태를 별도 필드로 둡니다.

| 필드 | 수준 | 대상 | 기준 |
|------|------|------|------|
| `primaryCodex` | FAIL | all | enum: `command` / `skill` / `agent` / `hook` / `fallback` / `none` |
| `driftStatus` | FAIL | all | null / `content-drift` / `metadata-drift` / `generated-mismatch` |
| `transitionState` | FAIL | command | `command-primary` / `skill-primary` / `dual-output` / `command-wrapper` / `deprecated-command` |
| `codexSkill` | INFO | command | null 또는 `src/codex/<domain>/skills/<name>/SKILL.md` |

Migration defaults:

- 기존 `type=command`, `status=paired` entry는 `transitionState: "command-primary"`, `primaryCodex: "command"`, `codexSkill: null`로 시작합니다.
- command를 skill로 전환할 때는 기존 `codex` command path를 보존하고 먼저 `dual-output`으로 둡니다.
- `metadata-drift`는 persistent `status`가 아니라 `driftStatus` 또는 analyze report status입니다.
- `src/codex/kit/**`와 `src/claude/kit/**` domain은 만들지 않습니다.

## 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| identity 중복 없음 | FAIL | `identity` 값이 유일 |
| `status=paired` + `claude` 파일 존재 | FAIL | 파일이 실제 존재 |
| `status=paired` + `codex` 파일 존재 | FAIL | 파일이 실제 존재 |
| `status=codex-skip` + `reason` 필수 | FAIL | reason이 null이 아니고 비어있지 않음 |
| `status=codex-native-only` + `claude=null` | FAIL | Codex 전용이므로 Claude source는 null이어야 함 |
| `status=codex-native-only` + `codex` 파일 존재 | FAIL | 파일이 실제 존재 |

## 조건부 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `status=paired` ↔ exception-registry `strategy=paired-direct` + `status=resolved` | WARN | 두 registry entry가 모순 없음 |
| `status=codex-skip` ↔ exception-registry `strategy=blocked` | WARN | 의미 일치 |
| rule type entry | INFO | v1 fallback rule은 registry에 없을 수 있고, v2에서는 `primaryCodex=fallback` 또는 `none`으로 추적 가능 |
| paired-fallback entry | INFO | fallback artifact는 exception-registry + fallbackTarget으로 추적 가능 |

## 즉시 실행 가능한 검증 명령

```bash
node scripts/audit-pairing.js
```
