# schema-codex-agent

> Codex 에이전트 컴포넌트 검증 스키마 (authoring source 검증)

## 대상

`src/codex/{domain}/agents/{full_name}.md`

이 스키마는 authoring source를 검증한다. `.codex/agents/*.toml` (runtime artifact) 검증은 setup/emitter 검증 단계에서 다룬다.

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/codex/{domain}/agents/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` (kebab-case) |

## 헤딩 기반 섹션 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `## Role` | FAIL | 역할 정의 존재 |
| `## Capabilities` | WARN | 기능 나열 |
| `## Constraints` | FAIL | 제약 조건 존재 |
| `## Output Format` | FAIL | 출력 형식 정의 |
| `## Failure Modes` | WARN | 안티패턴 |
| `## Codex 참고 사항` | WARN | Claude sibling 참조 + authoring source 명시 |

## 안티패턴 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Agent_Prompt XML 없음 | FAIL | `<Agent_Prompt>` 태그가 없어야 함 |
| Claude YAML frontmatter 없음 | WARN | Claude 스타일 6필드 frontmatter 없어야 함 |

## 페어링 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| pairing-registry 등록 | FAIL | agent는 required sibling |
