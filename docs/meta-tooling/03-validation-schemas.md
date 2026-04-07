# Validation Schemas 명세

> kit-validation 스킬이 사용하는 9개 스키마의 상세 명세 (Claude 5 + Codex 4)

## 개요

각 스키마는 컴포넌트 타입별 필수/권장 요소를 정의한다. `/kit-validate`와 `/kit-audit`가 이 스키마를 참조하여 검증을 수행한다.

**위치**: `.claude/skills/kit-validation/references/`

---

## 1. schema-skill.md

**대상**: `src/claude/{domain}/skills/{name}/SKILL.md`

### 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 디렉토리 존재 | FAIL | `src/{domain}/skills/{full_name}/` 존재 |
| SKILL.md 존재 | FAIL | 디렉토리 내 `SKILL.md` 파일 |
| 디렉토리 이름 | FAIL | `{domain}-{name}` 패턴 |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

### YAML Frontmatter 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `name` | FAIL | 존재 + 디렉토리 이름과 일치 |
| `description` | FAIL | 존재 + 비어있지 않음 (권장: 1줄, 50자 이내) |
| `argument-hint` | WARN | 파라미터가 있는 스킬은 권장 |
| `tools` | WARN | 특정 도구만 사용하는 경우 명시 권장 |
| `model` | WARN | 특정 모델이 필요한 경우 명시 권장 |

### 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 존재 | FAIL | `#` 레벨 헤딩 1개 이상 |
| 워크플로우 섹션 | WARN | 단계별 절차 존재 |
| 빈 파일 | FAIL | frontmatter 외 본문 존재 |

### 참조 디렉토리 검증 (해당 시)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| references/ 내 파일 | WARN | `.md` 확장자 |
| 본문에서 참조 | WARN | SKILL.md에서 references/ 파일을 언급 |

---

## 2. schema-agent.md

**대상**: `src/claude/{domain}/agents/{full_name}.md`

### 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/{domain}/agents/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

### YAML Frontmatter 검증 (6개 필수 필드)

| 필드 | 수준 | 허용 값 | 기준 |
|------|------|---------|------|
| `name` | FAIL | string | 파일명(확장자 제외)과 일치 |
| `description` | FAIL | string | 비어있지 않음 |
| `tools` | FAIL | string[] | 유효 도구명 배열 |
| `model` | FAIL | `opus` / `sonnet` / `haiku` | 3개 중 하나 |
| `memory` | FAIL | `project` / `session` | 2개 중 하나 |
| `color` | FAIL | `blue` / `red` / `yellow` / `green` / `purple` | 5개 중 하나 |

### 유효 도구 목록

```
Read, Write, Edit, Grep, Glob, Bash, Agent, TodoWrite,
NotebookEdit, WebSearch, AskUserQuestion
```

### XML Agent_Prompt 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `<Agent_Prompt>` 태그 | FAIL | 존재 + 닫힘 |
| `<Role>` | FAIL | 역할 정의 존재 |
| `<Why_This_Matters>` | FAIL | 존재 이유 설명 |
| `<Success_Criteria>` | FAIL | 성공 기준 (1개 이상) |
| `<Constraints>` | FAIL | 제약 조건 (1개 이상) |
| `<Investigation_Protocol>` | FAIL | 조사 절차 (단계별) |
| `<Tool_Usage>` | FAIL | 도구 사용 가이드 |
| `<Execution_Policy>` | WARN | 실행 정책 |
| `<Output_Format>` | FAIL | 출력 형식 정의 |
| `<Failure_Modes>` | WARN | 안티패턴 목록 |
| `<Final_Checklist>` | WARN | 체크리스트 |

### Read-Only 일관성 검증 (3단계)

텍스트 매칭이 아닌 tools 배열 기반의 3단계 검증을 적용한다. 실제 에이전트마다 표현이 상이하므로 (예: "Write/Edit 사용하지 않음" vs "수정 구현은 담당하지 않습니다") tools 배열을 1차 기준으로 삼는다.

#### Level 1: Hard (FAIL) -- tools 배열 기반

```
IF tools 배열에 Write 또는 Edit가 포함되어 있고,
   Constraints에 읽기 전용 마커가 있으면:
  → FAIL: tools와 Constraints 불일치
```

이것만 FAIL 기준으로 사용한다. tools 배열이 명시적이고 모호함이 없기 때문.

#### Level 2: Medium (WARN) -- Constraints 텍스트 기반

```
IF tools 배열에 Write/Edit가 없으면:
  Constraints에 다음 마커 중 하나가 존재하는지 확인:
    /(읽기\s*전용|read[- ]?only|Write.*사용.*않|Edit.*사용.*않|수정.*않|변경.*않)/i
  없으면 → WARN: read-only 의도가 명시되지 않음 (권장)
```

#### Level 3: Soft (info) -- Role 텍스트 기반

```
IF Role 섹션에 "읽기 전용" 또는 "분석 에이전트" 관련 문구가 있으면:
  → info: read-only 아키타입으로 분류됨 (참고)
```

#### 검증 우선순위

```
Level 1 (Hard, tools 배열)  →  FAIL 판정에만 사용
Level 2 (Medium, Constraints) →  WARN 판정에만 사용
Level 3 (Soft, Role)         →  info (참고용, 판정 미사용)
```

---

## 3. schema-command.md

**대상**: `src/claude/{domain}/commands/{full_name}.md`

### 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/{domain}/commands/{full_name}.md` |
| 파일명 패턴 | FAIL | `{domain}-{name}.md` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

### 간단 커맨드 (frontmatter 없음)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `# /{full_name}` 패턴 |
| Usage 섹션 | WARN | 사용법 예시 존재 |
| Workflow 섹션 | FAIL | 절차 정의 존재 |
| Rules 섹션 | WARN | 규칙/제약 명시 |

### 복합 커맨드 (frontmatter 있음)

| YAML 필드 | 수준 | 기준 |
|-----------|------|------|
| `allowed-tools` | FAIL | 유효 도구명 |
| `description` | FAIL | 비어있지 않음 |
| `argument-hint` | WARN | 인자 형식 힌트 |

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `# /{full_name}` 패턴 |
| 파라미터 테이블 | WARN | `0단계: 파라미터 파싱` |
| 단계 구분 | FAIL | 번호 매김 (`1단계`, `2단계` ...) |
| 출력 포맷 | WARN | 결과 형식 정의 |
| 다음 단계 | WARN | 후속 커맨드 안내 |

---

## 4. schema-hook.md

**대상**: `src/claude/{domain}/hooks/{full_name}.js`

### 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/{domain}/hooks/{full_name}.js` |
| 파일명 패턴 | FAIL | `{domain}-{name}.js` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |
| package.json | FAIL | 동일 디렉토리에 `{"type": "commonjs"}` |

### 필수 코드 패턴

| 검증 항목 | 수준 | 정규식 / 기준 |
|-----------|------|---------------|
| shebang | FAIL | `#!/usr/bin/env node` (첫 줄) |
| JSDoc Hook | FAIL | `* Hook:` 패턴 |
| JSDoc Event | FAIL | `* Event:` + `PreToolUse` 또는 `PostToolUse` 또는 `Stop` |
| JSDoc Action | FAIL | `* Action:` 패턴 |
| stdin 파싱 | FAIL | `process.stdin` 사용 |
| JSON 파싱 | FAIL | `JSON.parse` 사용 |
| toolName 추출 | WARN | `tool_name` 참조 |
| filePath 추출 | WARN | `file_path` 또는 `tool_input` 참조 |

### 이벤트별 검증

#### PreToolUse 훅

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(2) 존재 | FAIL | 차단 코드 경로에 `process.exit(2)` |
| stderr 메시지 | WARN | 차단 시 `process.stderr.write` 사용 |
| exit(0) 통과 | FAIL | 정상 통과 경로에 `process.exit(0)` |
| fail-open | FAIL | catch 블록에서 `process.exit(0)` |

#### PostToolUse 훅

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(2) 미사용 | FAIL | `process.exit(2)` 없어야 함 |
| exit(0) 사용 | FAIL | `process.exit(0)` 존재 |
| fail-open | FAIL | catch 블록에서 `process.exit(0)` |

#### Stop 훅

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(0) 사용 | FAIL | 항상 `process.exit(0)` |
| exit(2) 미사용 | FAIL | `process.exit(2)` 없어야 함 (Stop 훅은 차단 불가) |
| stdin 처리 | WARN | Stop 이벤트는 stdin 데이터가 제한적일 수 있음을 인지 |

### 면제 패턴 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| EXEMPT_PATTERNS 존재 | WARN | 면제 배열 정의 (PreToolUse 훅) |
| 정규식 유효 | WARN | 각 패턴이 유효한 RegExp |

---

## 5. schema-rule.md

**대상**: `src/claude/core/rules/{name}.md`

### 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/core/rules/{name}.md` |
| 위치 | FAIL | `src/claude/core/rules/`에만 존재 (다른 도메인 불가) |
| 도메인 접두사 없음 | FAIL | `dev-*`, `plan-*` 패턴 금지 |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |

### Frontmatter 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| frontmatter 없음 | WARN | `---` YAML 블록 없어야 함 |

### 내용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 제목 | FAIL | `#` 레벨 헤딩 |
| Why/How 구조 | WARN | `**Why?**` + `**How?**` 패턴 |
| 코드 예시 | WARN | WRONG vs CORRECT 패턴 권장 |
| Anti-Rationalization | WARN | 변명/현실 테이블 권장 |
| 체크리스트 | WARN | `- [ ]` 패턴 권장 |

---

## kit-validation 스킬 (SKILL.md)

```yaml
---
name: kit-validation
description: |
  claude-kit 컴포넌트 검증 엔진. 5개 스키마로 skill, agent, command, hook, rule의
  표준 준수 여부를 검증한다. /kit-validate와 /kit-audit가 이 스킬을 참조한다.
---
```

### 스킬 워크플로우

1. 검증 대상 컴포넌트 식별 (이름, 타입, 도메인)
2. 타입에 맞는 `references/schema-{type}.md` 로드
3. 스키마의 각 검증 항목을 순서대로 적용
4. 결과를 PASS / WARN / FAIL로 분류
5. 요약 리포트 생성

### 검증 수준 정의

| 수준 | 의미 | 동작 |
|------|------|------|
| **FAIL** | 필수 요소 누락/위반 | 반드시 수정 필요 |
| **WARN** | 권장 요소 누락 | 권장되지만 선택적 |
| **PASS** | 기준 충족 | 정상 |

---

## Codex 검증 스키마 (Phase 4)

> 아래 4종은 Phase 4 구현 시 `references/`에 추가된다. `src/codex/`에 실제 자산이 생성된 후 확정.

### schema-codex-agent.md

**대상**: `src/codex/{domain}/agents/{full_name}.md` (또는 .toml)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | 경로에 파일 존재 |
| 기능 identity | FAIL | Claude sibling과 동일 이름 |
| Codex surface 준수 | WARN | Codex subagent 포맷 (확정 후 상세화) |

### schema-codex-command.md

**대상**: `src/codex/{domain}/commands/{full_name}.md`

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | 경로에 파일 존재 |
| entry flow 정의 | WARN | 진입점이 문서화되어 있음 |

### schema-codex-hook.md

**대상**: `src/codex/{domain}/hooks/{full_name}.js`

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Claude 훅 공통 요소 | FAIL | shebang, stdin, fail-open (동일) |
| Stop 이벤트 미사용 | FAIL | Codex에 Stop 없음 |
| codex-hook-compat 통과 | WARN | `isCodexCompatible()` 결과 |

### schema-codex-skill.md

**대상**: `src/codex/{domain}/skills/{full_name}/SKILL.md`

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| SKILL.md 존재 | FAIL | 디렉토리 내 파일 |
| frontmatter | FAIL | name + description 존재 |

---

## 페어링 일관성 검증 (Phase 4)

`src/pairing-registry.json`과 파일시스템을 교차 검증한다.

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 레지스트리 ↔ 파일시스템 일치 | FAIL | 레지스트리에 있지만 파일 없음 |
| 파일시스템 ↔ 레지스트리 일치 | WARN | 파일 있지만 레지스트리에 없음 |
| agent/command codex-skip reason | FAIL | status=codex-skip인데 reason 없음 |
| paired 양쪽 존재 | FAIL | status=paired인데 한쪽 파일 없음 |
