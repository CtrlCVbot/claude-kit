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
| `status` | FAIL | `"active"` / `"expired"` / `"revoked"` 중 하나 |
| `expiresDate` | WARN | null 또는 ISO 8601 날짜 |

## 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| ID 중복 없음 | FAIL | `id` 값이 유일 |
| 만료 처리 | WARN | `expiresDate` < 현재 → `status`가 `expired`여야 함 |
| component 존재 | WARN | `src/claude/`에 해당 컴포넌트가 실제 존재 |
