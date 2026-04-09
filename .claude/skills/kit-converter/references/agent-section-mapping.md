# Agent XML → Codex 헤딩 매핑

> Claude `<Agent_Prompt>` XML 10섹션을 Codex heading-based 마크다운으로 변환하는 매핑 테이블

## 매핑 테이블

| # | Claude XML 섹션 | Codex 헤딩 | 처리 |
|---|-----------------|-----------|------|
| 1 | `<Role>` | `## Role` | 직접 이전, XML 태그 제거 |
| 2 | `<Why_This_Matters>` | Role에 병합 또는 생략 | 암묵적 (Codex에서는 별도 섹션 불필요) |
| 3 | `<Success_Criteria>` | `## Capabilities`에 병합 | 능력 + 성공 기준을 하나로 |
| 4 | `<Constraints>` | `## Constraints` | 직접 이전 |
| 5 | `<Investigation_Protocol>` | `## Capabilities`에 병합 | 조사 방법론 → 능력 기술의 일부 |
| 6 | `<Tool_Usage>` | `## Capabilities`에 병합 | 도구 사용법 → 능력 기술의 일부 |
| 7 | `<Execution_Policy>` | `## Constraints`에 병합 | 실행 경계 → 제약의 일부 |
| 8 | `<Output_Format>` | `## Output Format` | 직접 이전 |
| 9 | `<Failure_Modes_To_Avoid>` | `## Failure Modes` | 직접 이전 |
| 10 | `<Final_Checklist>` | `## Output Format`에 병합 또는 생략 | 중복 시 생략 |

## 직접 이전 섹션 (4개)

이 섹션들은 XML 태그만 제거하고 내용을 그대로 옮긴다:
- `<Role>` → `## Role`
- `<Constraints>` → `## Constraints`
- `<Output_Format>` → `## Output Format`
- `<Failure_Modes_To_Avoid>` → `## Failure Modes`

## 병합 섹션 (6개)

이 섹션들은 관련 Codex 헤딩에 내용을 합친다:
- `<Why_This_Matters>` → Role 섹션 앞에 배경 설명으로 추가
- `<Success_Criteria>` + `<Investigation_Protocol>` + `<Tool_Usage>` → `## Capabilities`
- `<Execution_Policy>` → `## Constraints` 하단에 추가
- `<Final_Checklist>` → `## Output Format` 하단 또는 생략

## YAML frontmatter 처리

Claude 에이전트의 6필드 YAML frontmatter는 **제거**한다:

| Claude YAML | Codex 처리 |
|-------------|-----------|
| `name` | 제목(`# {identity}`)으로 대체 |
| `description` | 제목 아래 첫 문단으로 배치 |
| `tools` | Capabilities 섹션에 자연어로 기술 |
| `model` | 제거 (Codex runtime에서 결정) |
| `memory` | 제거 |
| `color` | 제거 |

## 비-XML 꼬리 내용

`</Agent_Prompt>` 뒤에 오는 마크다운 섹션(아키텍처 원칙, 관련 MCP 도구, 관련 스킬 등)은 **그대로 보존**하여 Codex 파일 끝에 추가한다.
