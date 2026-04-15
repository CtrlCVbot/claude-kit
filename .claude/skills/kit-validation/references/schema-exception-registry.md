# schema-exception-registry

> 예외 레지스트리 (src/exception-registry.json) 검증 스키마

## 대상

`src/exception-registry.json`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/exception-registry.json` |
| JSON 유효 | FAIL | `JSON.parse` 성공 |
| `$schema` 필드 | FAIL | `"exception-registry-v1"` |
| `entries` 배열 | FAIL | 배열 타입 |

## 엔트리 필드 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `id` | FAIL | 존재 + `EX-{NNN}` 형식 |
| `component` | FAIL | 존재 + 비어있지 않음 |
| `category` | FAIL | 존재 + 유효 값 (`codex-conversion`, `C1`~`C9`) |
| `rule` | FAIL | 존재 + 비어있지 않음 |
| `detail` | FAIL | 존재 + 비어있지 않음 |
| `reason` | FAIL | 존재 + 비어있지 않음 |
| `approvedBy` | FAIL | 존재 + 비어있지 않음 |
| `approvedDate` | WARN | ISO 8601 날짜 형식 |
| `status` | FAIL | `"active"` / `"expired"` / `"revoked"` / `"resolved"` 중 하나 |
| `expiresDate` | WARN | null 또는 ISO 8601 날짜 |

## Phase 1 신규 필드 검증 (codex-sync)

> Phase 1 (rollout-validation-plan §4.2)부터 도입된 SSOT 필드. `docs/codex-sync/01-skipless-conversion-strategy.md` §4.1 상태 모델을 따른다.

| 필드 | 수준 | 기준 |
|------|------|------|
| `strategy` | FAIL | 존재 + enum: `paired-direct` / `paired-fallback` / `paired-review` / `blocked` |
| `officialSurface` | WARN | null 또는 enum: `hooks` / `hooks.stop` / `rules` / `agents_md` / `skills` / `subagents` / `cli` |
| `evidenceLevel` | FAIL | 존재 + enum: `공식 지원` / `우회 가능` / `추정` / `검증 필요` |
| `docConstraints` | WARN | 배열, 각 원소는 비어있지 않은 문자열 |
| `fallbackTarget` | WARN | null 또는 enum: `skill` / `agents-guidance` / `command` / `wrapper` |

## 조건부 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `strategy=blocked` 시 | WARN | `reason` 명확 + `category=codex-conversion` 또는 동등 사유 기록 |
| `strategy=paired-direct` 시 | WARN | `src/codex/` 실제 sibling 파일 존재 (pairing 일관성) |
| `strategy=paired-fallback` 시 | WARN | `fallbackTarget`이 null이 아님 |
| `officialSurface=hooks*` 시 | WARN | `docConstraints`에 platform/scope 제약 명시 (예: Bash 범위, Windows 비활성, experimental) |
| `officialSurface=agents_md` 시 | WARN | `fallbackTarget=agents-guidance` 권장 |
| `status=resolved` + `strategy=paired-direct` | INFO | 정상 paired 완료 상태 |
| `status=resolved` + `strategy=paired-fallback` | INFO | Phase 2+ artifact 생성 완료 정상 상태 |
| `status=resolved` + `strategy=paired-fallback` + `officialSurface=agents_md` | WARN | `src/templates/AGENTS.md.template`에 해당 component의 h3 section (`### {component}`) 존재 (artifact 무결성 검증) |
| `status=resolved` + `strategy=paired-fallback` + `fallbackTarget=skill` | WARN | `src/claude/{domain}/skills/{component}/SKILL.md` 존재 (Phase 3 hook fallback artifact 무결성 검증). 예: EX-001 → `src/claude/core/skills/session-wrap-suggest/SKILL.md` |
| `status=active` + `strategy=paired-fallback` | INFO | Phase 2+ artifact 생성 후 resolved 전환 예정 |
| `docConstraints`에 `policy-review-pending` 포함 | INFO | Phase 3 exec-policy 재검토 후보로 표시됨 (kit-validate가 자동 보고) |

## 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| ID 중복 없음 | FAIL | `id` 값이 유일 |
| 만료 처리 | WARN | `expiresDate` < 현재 → `status`가 `expired`여야 함 |
| component 존재 | WARN | `src/claude/`에 해당 컴포넌트가 실제 존재 |
