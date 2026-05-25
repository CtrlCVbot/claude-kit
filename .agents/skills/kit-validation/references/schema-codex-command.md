# schema-codex-command

> Codex 커맨드(Entry Flow) 컴포넌트 검증 스키마 (authoring source 검증)

## 대상

`src/codex/{domain}/commands/{full_name}.md`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/codex/{domain}/commands/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` (kebab-case) |

## 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `#` 헤딩 존재 |
| Entry Flow 명시 | WARN | "Entry Flow" 또는 "Codex" 언급 |
| Overview 섹션 | WARN | 기능 설명 |
| Invocation 섹션 | WARN | 호출 방법 |
| Workflow 섹션 | FAIL | 절차 정의 |

## 안티패턴

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Claude frontmatter 없음 | WARN | `allowed-tools` frontmatter 없어야 함 |
| 슬래시 커맨드 제목 없음 | WARN | `# /` 접두사 없어야 함 |

## 페어링 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| pairing-registry 등록 | FAIL | command는 required sibling |
