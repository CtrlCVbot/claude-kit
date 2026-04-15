# schema-codex-portability

> codex-portability manifest (`src/claude/_meta/codex-portability.json`) 검증 스키마 (codex-sync Phase 4/5)

## 대상

`src/claude/_meta/codex-portability.json`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/_meta/codex-portability.json` |
| JSON 유효 | FAIL | `JSON.parse` 성공 |
| `$schema` 필드 | FAIL | `"codex-portability-v1"` |
| `description` 필드 | WARN | 비어있지 않은 문자열 |
| `generated` 필드 | WARN | ISO 8601 날짜 |
| `sources` 객체 | WARN | exception-registry / pairing-registry / hook-portability-runtime 키 존재 |
| `vocabulary` 객체 | FAIL | strategy / evidenceLevel / officialSurface / fallbackTarget 키 모두 존재 |
| `entries` 배열 | FAIL | 배열 타입, length >= 1 |

## Vocabulary 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `vocabulary.strategy` | FAIL | `["paired-direct", "paired-fallback", "paired-review", "blocked"]` 정확히 일치 |
| `vocabulary.evidenceLevel` | FAIL | `["공식 지원", "우회 가능", "추정", "검증 필요"]` 정확히 일치 |
| `vocabulary.officialSurface` | FAIL | 7+ enum 포함 (hooks, hooks.stop, hooks.pre, hooks.post, rules, agents_md, skills, subagents, cli) |
| `vocabulary.fallbackTarget` | FAIL | `["skill", "agents-guidance", "command", "wrapper", null]` 포함 |

## Entry 필드 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `identity` | FAIL | 존재 + 비어있지 않음 |
| `type` | FAIL | enum: `skill` / `agent` / `command` / `hook` / `rule` |
| `domain` | FAIL | enum: `core` / `dev` / `plan` |
| `strategy` | FAIL | `vocabulary.strategy` 값 중 하나 |
| `officialSurface` | FAIL | `vocabulary.officialSurface` 값 중 하나 또는 null |
| `officialBasis` | WARN | 배열, 각 원소 URL 형식 |
| `evidenceLevel` | FAIL | `vocabulary.evidenceLevel` 값 중 하나 |
| `docConstraints` | WARN | 배열, 각 string 비어있지 않음 |
| `fallbackTarget` | WARN | `vocabulary.fallbackTarget` 값 중 하나 또는 null |
| `exceptionId` | WARN | `EX-{NNN}` 형식 또는 null |
| `claudeSource` | WARN | 파일 경로 string 또는 null |
| `codexSource` | WARN | 파일 경로 string 또는 null |
| `confidence` | WARN | 비어있지 않은 string |

## 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| identity 중복 없음 | FAIL | `identity` 값이 유일 |
| `claudeSource` 파일 존재 | WARN | null이 아니면 파일이 실제 존재 |
| `codexSource` 파일 존재 | WARN | null이 아니면 파일이 실제 존재 |
| `exceptionId` ↔ `src/exception-registry.json` cross-check | WARN | exceptionId가 null이 아니면 exception-registry에 동일 id 존재 |
| exception-registry의 strategy/officialSurface/evidenceLevel과 일치 | WARN | exceptionId가 있는 entry는 exception-registry의 동일 필드와 값 일치 |

## 조건부 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `strategy=paired-direct` + `codexSource=null` | INFO | sibling이 미생성 상태 (예: 7개 informational hook). codex-sync Phase 5에서 evidence 재평가 후보. |
| `strategy=paired-direct` + `codexSource` 존재 | INFO | sibling 정상. C7 audit이 pairing-registry status=paired와 일치 검증. |
| `strategy=paired-fallback` + `fallbackTarget=skill` | WARN | `fallbackArtifact` 필드 또는 `src/claude/{domain}/skills/{identity}/SKILL.md` 존재 |
| `strategy=paired-fallback` + `fallbackTarget=agents-guidance` | WARN | `fallbackArtifact` 필드가 `src/templates/AGENTS.md.template` 참조 + 해당 h3 존재 |
| `evidenceLevel=추정` + `strategy=paired-direct` | INFO | Phase 5 runtime 검증 후보 — 실제 Codex 환경에서 confirm 필요 |
| `evidenceLevel=검증 필요` | INFO | runtime 검증 미실시 — Phase 5 또는 별도 task에서 검증 |
| `officialBasis` 배열이 비어있음 | WARN | 공식 문서 링크가 최소 1개 권장 (특히 strategy=paired-direct/fallback) |
