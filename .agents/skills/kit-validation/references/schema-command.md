# schema-command

> 커맨드 컴포넌트 검증 스키마

## 대상

`src/claude/{domain}/commands/{full_name}.md`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/{domain}/commands/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

## 타입 판별

frontmatter(`---` 블록)의 유무로 간단/복합 커맨드를 판별한다.

## 간단 커맨드 (frontmatter 없음)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `# /{full_name}` 패턴 |
| Usage 섹션 | WARN | 사용법 예시 |
| Workflow 섹션 | FAIL | 절차 정의 (Phase 또는 단계) |
| Rules 섹션 | WARN | 규칙/제약 |

## 복합 커맨드 (frontmatter 있음)

### YAML Frontmatter

| 필드 | 수준 | 기준 |
|------|------|------|
| `allowed-tools` | FAIL | 유효 도구명 |
| `description` | FAIL | 비어있지 않음 |
| `argument-hint` | WARN | 인자 형식 힌트 |

### 내용

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `# /{full_name}` 패턴 |
| 파라미터 테이블 | WARN | `0단계: 파라미터 파싱` |
| 단계 구분 | FAIL | 번호 매김 (`1단계`, `2단계` 등) |
| 출력 포맷 | WARN | 결과 형식 정의 |
| 다음 단계 | WARN | 후속 커맨드 안내 |
