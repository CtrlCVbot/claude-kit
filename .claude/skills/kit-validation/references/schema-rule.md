# schema-rule

> 룰 컴포넌트 검증 스키마

## 대상

`src/claude/core/rules/{name}.md`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/core/rules/{name}.md` |
| 위치 | FAIL | `src/claude/core/rules/`에만 존재 |
| 도메인 접두사 없음 | FAIL | `dev-*`, `plan-*` 패턴 금지 |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

## Frontmatter 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| frontmatter 없음 | WARN | `---` YAML 블록 없어야 함 |

## 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `#` 레벨 헤딩 |
| Why/How 구조 | WARN | `**Why?**` + `**How?**` 패턴 |
| 코드 예시 | WARN | WRONG vs CORRECT 패턴 권장 |
| Anti-Rationalization | WARN | 변명/현실 테이블 권장 |
| 체크리스트 | WARN | `- [ ]` 패턴 권장 |
