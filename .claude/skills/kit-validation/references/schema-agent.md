# schema-agent

> 에이전트 컴포넌트 검증 스키마

## 대상

`src/claude/{domain}/agents/{full_name}.md`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/{domain}/agents/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

## YAML Frontmatter 검증 (6개 필수)

| 필드 | 수준 | 허용 값 | 기준 |
|------|------|---------|------|
| `name` | FAIL | string | 파일명(확장자 제외)과 일치 |
| `description` | FAIL | string | 비어있지 않음 |
| `tools` | FAIL | string[] | 유효 도구명 배열 |
| `model` | FAIL | `opus` / `sonnet` / `haiku` | 3개 중 하나 |
| `memory` | FAIL | `project` / `session` | 2개 중 하나 |
| `color` | FAIL | `blue` / `red` / `yellow` / `green` / `purple` | 5개 중 하나 |

## 유효 도구 목록

```
Read, Write, Edit, Grep, Glob, Bash, Agent, TodoWrite,
NotebookEdit, WebSearch, AskUserQuestion
```

## XML Agent_Prompt 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `<Agent_Prompt>` 태그 | FAIL | 존재 + 닫힘 |
| `<Role>` | FAIL | 역할 정의 존재 |
| `<Why_This_Matters>` | FAIL | 존재 이유 |
| `<Success_Criteria>` | FAIL | 1개 이상 |
| `<Constraints>` | FAIL | 1개 이상 |
| `<Investigation_Protocol>` | FAIL | 단계별 절차 |
| `<Tool_Usage>` | FAIL | 도구 사용 가이드 |
| `<Execution_Policy>` | WARN | 실행 정책 |
| `<Output_Format>` | FAIL | 출력 형식 |
| `<Failure_Modes>` / `<Failure_Modes_To_Avoid>` | WARN | 안티패턴 |
| `<Final_Checklist>` | WARN | 체크리스트 |

## Read-Only 일관성 검증 (3단계)

### Level 1: Hard (FAIL) — tools 배열 기반

```
IF tools에 Write/Edit 포함 AND Constraints에 읽기 전용 마커 존재
  → FAIL: tools와 Constraints 불일치
```

### Level 2: Medium (WARN) — Constraints 텍스트

```
IF tools에 Write/Edit 없음
  Constraints에 다음 마커 존재 여부 확인:
    /(읽기\s*전용|read[- ]?only|Write.*사용.*않|Edit.*사용.*않|수정.*않)/i
  없으면 → WARN: read-only 의도 미명시
```

### Level 3: Soft (info) — Role 텍스트

```
IF Role에 "읽기 전용" 또는 "분석 에이전트" 문구 → info 참고
```
