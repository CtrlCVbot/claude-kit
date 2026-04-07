# schema-skill

> 스킬 컴포넌트 검증 스키마

## 대상

`src/claude/{domain}/skills/{full_name}/SKILL.md`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 디렉토리 존재 | FAIL | `src/claude/{domain}/skills/{full_name}/` |
| SKILL.md 존재 | FAIL | 디렉토리 내 `SKILL.md` 파일 |
| 디렉토리 이름 패턴 | FAIL | `{domain}-{name}` (kebab-case) |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

## YAML Frontmatter 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `name` | FAIL | 존재 + 디렉토리 이름과 일치 |
| `description` | FAIL | 존재 + 비어있지 않음 (권장: 1줄, 50자 이내) |
| `argument-hint` | WARN | 파라미터가 있는 스킬은 권장 |
| `tools` | WARN | 특정 도구만 사용 시 명시 권장 |
| `model` | WARN | 특정 모델 필요 시 명시 권장 |

## 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 존재 | FAIL | `#` 레벨 헤딩 1개 이상 |
| 워크플로우 섹션 | WARN | 단계별 절차 존재 |
| 빈 파일 | FAIL | frontmatter 외 본문 존재 |

## references/ 검증 (해당 시)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 확장자 | WARN | `.md` |
| 본문 참조 | WARN | SKILL.md에서 references/ 파일을 언급 |
