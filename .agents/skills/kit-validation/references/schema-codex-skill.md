# schema-codex-skill

> Codex 스킬 컴포넌트 검증 스키마 (authoring source 검증)

## 대상

`src/codex/{domain}/skills/{full_name}/SKILL.md`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 디렉토리 존재 | FAIL | `src/codex/{domain}/skills/{full_name}/` |
| SKILL.md 존재 | FAIL | 디렉토리 내 `SKILL.md` 파일 |
| 디렉토리 이름 패턴 | FAIL | `{domain}-{name}` (kebab-case) |

## YAML Frontmatter

| 필드 | 수준 | 기준 |
|------|------|------|
| `name` | FAIL | 존재 + 디렉토리 이름과 일치 |
| `description` | FAIL | 존재 + 비어있지 않음 |

## 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 존재 | FAIL | `#` 헤딩 1개 이상 |
| 빈 파일 | FAIL | frontmatter 외 본문 존재 |
| Codex 참고 사항 | WARN | "Codex 참고 사항" 섹션 존재 |
| Claude sibling 참조 | WARN | Claude sibling 경로 언급 |
