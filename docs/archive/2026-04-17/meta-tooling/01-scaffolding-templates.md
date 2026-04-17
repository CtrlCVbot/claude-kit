# Scaffolding Templates 명세

> kit-scaffolding 스킬이 사용하는 12개 템플릿의 상세 명세 (Claude 8 + Codex 4)

## 개요

각 템플릿은 `src/claude/`(Claude) 및 `src/codex/`(Codex)에 존재하는 실제 컴포넌트의 정규 패턴을 인코딩한다. `/kit-create` 커맨드가 템플릿을 로드하고 변수를 치환하여 새 컴포넌트를 생성한다.

**위치**: `.claude/skills/kit-scaffolding/references/`

## 변수 치환 시스템

> **주의**: 이 치환 시스템은 `scripts/setup.js:substituteVars()`와 **별개**이다. setup.js는 npm 설치 시 사용자 프로젝트를 위한 것(PROJECT_NAME, DATE, VERSION 등)이고, 여기서는 컴포넌트 스캐폴딩 전용 변수를 정의한다. `{{VAR}}` 문법만 동일하다.

### 변수 목록

| 변수 | 설명 | 예시 |
|------|------|------|
| `{{DOMAIN}}` | 도메인 (core, dev, plan) | `dev` |
| `{{NAME}}` | 컴포넌트 이름 (kebab-case) | `cache-manager` |
| `{{FULL_NAME}}` | 도메인-이름 결합 | `dev-cache-manager` |
| `{{DESCRIPTION}}` | 한줄 설명 (1줄, 50자 이내 권장) | `캐시 관리 워크플로우` |
| `{{MODEL}}` | 모델 선택 | `opus`, `sonnet`, `haiku` |
| `{{TOOLS}}` | 도구 배열 (JSON) | `["Read", "Grep", "Glob"]` |
| `{{COLOR}}` | 에이전트 색상 | `blue`, `red`, `yellow` |
| `{{DATE}}` | 생성 날짜 (ISO) | `2026-03-25` |
| `{{TARGET}}` | 타깃 플랫폼 | `claude`, `codex` |

### 치환 알고리즘

```
1. 사용자 입력 + 아키타입 기본값에서 변수 값 수집
2. 특수문자 이스케이프:
   - YAML 값: 따옴표 포함 시 큰따옴표로 감싸기
   - JSON 배열({{TOOLS}}): 유효한 JSON 문자열 보장
   - 줄바꿈: \n으로 치환
3. 치환 순서: DOMAIN → NAME → FULL_NAME → 나머지 (FULL_NAME이 NAME을 포함하므로)
4. 치환 후 YAML/JSON 구문 검증
```

### kebab-case 유효성 검증

```
정규식: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

유효 예시: cache-manager, dev-code-reviewer, plan-idea, a
무효 예시: 2fa-auth (숫자 시작), my--feature (이중 대시),
          Cache-Manager (대문자), cache_manager (밑줄)
```

---

## 1. template-skill.md

**참조 원본**: `src/claude/dev/skills/dev-tdd-workflow/SKILL.md`

**생성 경로**: `src/claude/{{DOMAIN}}/skills/{{FULL_NAME}}/SKILL.md`

### 구조

```markdown
---
name: {{FULL_NAME}}
description: {{DESCRIPTION}}
---

# {{TITLE}}

{{OVERVIEW}}

## 원칙

- 원칙 1: ...
- 원칙 2: ...

## 워크플로우

1. 단계 1
2. 단계 2
3. 단계 3

## 면제

설정 파일, 문서 파일, 타입 정의 파일 등

## 참조

- 관련 훅: `.claude/hooks/{{FULL_NAME}}-guard.js` (해당 시)
- 관련 스킬: `.claude/skills/...`
```

### 필수 섹션

| 섹션 | 필수 | 설명 |
|------|------|------|
| YAML frontmatter | O | `name`, `description` 최소 |
| 제목 + 개요 | O | 한 문단 요약 |
| 원칙 | 권장 | 핵심 규칙 나열 |
| 워크플로우 | O | 단계별 절차 |
| 면제 | 권장 | 적용 제외 패턴 |
| 참조 | 권장 | 관련 컴포넌트 링크 |

### 변형: 고급 스킬 (references/ 포함)

`references/` 서브디렉토리를 포함하는 스킬에는 3가지 패턴이 있다:

#### 패턴 A: 서브에이전트 프롬프트 (병렬 실행)

여러 서브에이전트를 병렬로 실행하고 결과를 집계하는 패턴.

```
src/claude/{{DOMAIN}}/skills/{{FULL_NAME}}/
  SKILL.md                          # 오케스트레이션 로직
  references/
    prompt-{subrole-1}.md           # 서브에이전트 1 프롬프트
    prompt-{subrole-2}.md           # 서브에이전트 2 프롬프트
    prompt-duplicate-checker.md     # 결과 중복 제거 에이전트
    output-schema.md                # 구조화 JSON 출력 스키마
```

**참조 원본**: `src/claude/core/skills/session-wrap/references/`
**사용 시점**: 독립적 탐색 작업을 병렬로 수행하고 결과를 병합할 때

#### 패턴 B: 출력 스키마 (구조화 응답)

서브에이전트 없이, 스킬 자체의 출력 형식을 정의하는 패턴.

```
src/claude/{{DOMAIN}}/skills/{{FULL_NAME}}/
  SKILL.md
  references/
    output-schema.md                # JSON/마크다운 출력 형식 정의
```

**사용 시점**: 일관된 구조화 출력이 필요할 때

#### 패턴 C: 외부 바인딩 참조

스킬 본문에서 `.plans/` 등 외부 경로를 참조하는 패턴. references/ 디렉토리 없이 SKILL.md 본문에 경로를 직접 기술.

```markdown
## Preconditions
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`가 존재한다.
```

**참조 원본**: `src/claude/dev/skills/dev-feature-plan/SKILL.md`
**사용 시점**: 파이프라인의 이전 단계 산출물에 의존할 때

---

## 2. template-agent.md

**참조 원본**: `src/claude/dev/agents/dev-architect.md`

**생성 경로**: `src/claude/{{DOMAIN}}/agents/{{FULL_NAME}}.md`

### 구조

```markdown
---
name: {{FULL_NAME}}
description: {{DESCRIPTION}}
tools: {{TOOLS}}
model: {{MODEL}}
memory: project
color: {{COLOR}}
---

<Agent_Prompt>
  <Role>
    당신은 {{ROLE_TITLE}}입니다. {{ROLE_DESCRIPTION}}
    {{RESPONSIBILITIES}}
    {{NON_RESPONSIBILITIES}}
  </Role>

  <Why_This_Matters>
    {{WHY_DESCRIPTION}}
  </Why_This_Matters>

  <Success_Criteria>
    - 기준 1
    - 기준 2
    - 기준 3
  </Success_Criteria>

  <Constraints>
    - 제약 1
    - 제약 2
  </Constraints>

  <Investigation_Protocol>
    1) 컨텍스트 수집
    2) 분석
    3) 가설 수립
    4) 교차 검증
    5) 종합
  </Investigation_Protocol>

  <Tool_Usage>
    - Glob/Grep/Read: 코드베이스 탐색
    - Bash: git 이력 분석 (해당 시)
  </Tool_Usage>

  <Execution_Policy>
    - 기본 작업 수준: high
    - 종료 조건: ...
  </Execution_Policy>

  <Output_Format>
    ## 분석 결과
    ### 1. 발견 사항
    ### 2. 근본 원인
    ### 3. 권고
    ### 4. 트레이드오프
  </Output_Format>

  <Failure_Modes>
    - 피해야 할 패턴 1
    - 피해야 할 패턴 2
  </Failure_Modes>

  <Final_Checklist>
    - [ ] 모든 발견 사항에 file:line 참조
    - [ ] 근본 원인 식별
    - [ ] 권고가 구체적이고 실행 가능
  </Final_Checklist>
</Agent_Prompt>
```

### 필수 필드

| YAML 필드 | 필수 | 설명 |
|-----------|------|------|
| `name` | O | kebab-case, 도메인 접두사 포함 |
| `description` | O | 한줄 설명 |
| `tools` | O | 사용 가능한 도구 배열 |
| `model` | O | `opus` / `sonnet` / `haiku` |
| `memory` | O | `project` (고정) |
| `color` | O | `blue`, `red`, `yellow`, `green`, `purple` |

### XML 필수 섹션 (10개)

| 섹션 | 필수 | 설명 |
|------|------|------|
| `Role` | O | 역할 정의 + 담당/비담당 구분 |
| `Why_This_Matters` | O | 이 에이전트가 존재하는 이유 |
| `Success_Criteria` | O | 성공 기준 (3-5개) |
| `Constraints` | O | 하드 제약 (read-only 등) |
| `Investigation_Protocol` | O | 조사 절차 (단계별) |
| `Tool_Usage` | O | 도구 사용 방법 |
| `Execution_Policy` | O | 실행 정책 + 종료 조건 |
| `Output_Format` | O | 출력 구조 |
| `Failure_Modes` | 권장 | 피해야 할 안티패턴 |
| `Final_Checklist` | 권장 | 최종 체크리스트 |

### 아키타입 분기 (3종)

`/kit-create agent` 실행 시 아키타입을 선택한다. 각 아키타입은 tools 기본값, Constraints 기본 문구, color 기본값을 제공한다.

#### 아키타입 선택 플로우

```
/kit-create agent {domain} {name}
  │
  ├─ --readonly  → Read-Only 아키타입
  ├─ --write     → Write 아키타입
  └─ --monitor   → Monitor 아키타입
  (기본값: --readonly)
```

#### 1. Read-Only 에이전트 (분석/검토 용도, 기본값)

```yaml
tools: ["Read", "Grep", "Glob"]
color: blue
```

Constraints 기본 문구:
> "중요: Write 또는 Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트입니다."

**예시**: `dev-architect`, `dev-code-reviewer`, `dev-database-reviewer`, `plan-reviewer`

#### 2. Write 에이전트 (생성/수정 용도)

```yaml
tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
color: green
```

Constraints 기본 문구:
> "안전한 항목만 자동 수정. 판단이 필요한 항목은 보고."

**예시**: `dev-doc-updater`, `kit-maintainer`

#### 3. Monitor 에이전트 (관찰/보고 용도)

```yaml
tools: ["Read", "Grep", "Glob", "Bash"]
color: yellow
```

Constraints 기본 문구:
> "파일을 수정하지 않음. 관찰 결과만 보고."

**예시**: (추후 추가 예정 -- 성능 모니터링, 의존성 감시 등)

#### 아키타입 선택 기준

| 질문 | Yes | No |
|------|-----|----|
| 에이전트가 파일을 직접 수정해야 하는가? | Write | 다음 질문 |
| 에이전트가 Bash(git, build 등)를 실행해야 하는가? | Monitor | Read-Only |

---

## 3. template-command-simple.md

**참조 원본**: `src/claude/dev/commands/dev-run.md`

**생성 경로**: `src/claude/{{DOMAIN}}/commands/{{FULL_NAME}}.md`

### 구조

```markdown
# /{{FULL_NAME}}

{{OVERVIEW}}

> 참조: `.claude/skills/{{RELATED_SKILL}}/SKILL.md`

## Usage

\`\`\`bash
/{{FULL_NAME}} {{USAGE_ARGS}}
\`\`\`

## Preconditions

- 전제 조건 1
- 전제 조건 2

## Workflow

### Phase 1: {{PHASE_1_TITLE}}

1. 단계 1
2. 단계 2

### Phase 2: {{PHASE_2_TITLE}}

3. 단계 3
4. 단계 4

## Rules

- 규칙 1
- 규칙 2
```

### 특징

- YAML frontmatter 없음 (간단 커맨드)
- 제목이 곧 커맨드명 (`# /dev-run`)
- Workflow가 Phase로 분리
- Rules 섹션으로 제약 명시

---

## 4. template-command-complex.md

**참조 원본**: `src/claude/dev/commands/dev-explore.md`

**생성 경로**: `src/claude/{{DOMAIN}}/commands/{{FULL_NAME}}.md`

### 구조

```markdown
---
allowed-tools: {{ALLOWED_TOOLS}}
description: {{DESCRIPTION}}
argument-hint: {{ARGUMENT_HINT}}
---

# /{{FULL_NAME}} - {{TITLE}} (v6)

---

## 0단계: 파라미터 파싱

| 인자 | 설명 | 기본값 |
|------|------|--------|
| 인자1 | 설명 | - |
| `--flag1` | 설명 | 기본값 |
| `--flag2` | 설명 | 기본값 |

---

## 1단계: {{STEP_1_TITLE}}

{{STEP_1_CONTENT}}

---

## 2단계: {{STEP_2_TITLE}}

{{STEP_2_CONTENT}}

---

## 3단계: {{STEP_3_TITLE}}

{{STEP_3_CONTENT}}

---

## 출력 포맷

\`\`\`
결과 출력 형식 정의
\`\`\`

---

## 다음 단계

| 상황 | 추천 커맨드 |
|------|-------------|
| 상황 1 | `/{{NEXT_COMMAND_1}}` |
| 상황 2 | `/{{NEXT_COMMAND_2}}` |
```

### 필수 YAML 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `allowed-tools` | O | 사용 허용 도구 |
| `description` | O | 한줄 설명 |
| `argument-hint` | 권장 | 인자 형식 힌트 |

### 특징

- 번호가 매겨진 단계 (`0단계`, `1단계`, ...)
- 파라미터 테이블 (0단계)
- 각 단계 사이 구분선 (`---`)
- 출력 포맷 명세
- 다음 단계 안내 테이블

---

## 5. template-hook-pre.md (PreToolUse)

**참조 원본**: `src/claude/dev/hooks/dev-tdd-guard.js`

**생성 경로**: `src/claude/{{DOMAIN}}/hooks/{{FULL_NAME}}.js`

### 구조

```javascript
#!/usr/bin/env node
/**
 * Hook: {{HOOK_TITLE}}
 * Event: PreToolUse ({{MATCHER}})
 * Action: BLOCKING (exit 2) -- {{ACTION_DESCRIPTION}}
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// 면제 패턴
// ============================================================
const EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/,
  /\.config\.(ts|js|mjs)$/, /\.d\.ts$/,
  // 프로젝트별 면제 추가
];

async function main() {
  try {
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const toolUse = parsed.tool_use || parsed;
    const toolName = toolUse.tool_name || "";

    // 대상 도구 필터링
    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    // 면제 패턴 검사
    if (EXEMPT_PATTERNS.some((p) => p.test(filePath))) {
      process.exit(0);
    }

    // ============================================================
    // 핵심 검증 로직
    // ============================================================

    // TODO: 검증 조건 구현

    const isValid = true; // 검증 결과

    if (!isValid) {
      const message = `
[{{FULL_NAME}}] 차단됨

사유: {{BLOCK_REASON}}
파일: ${filePath}

해결 방법:
  {{RESOLUTION_GUIDE}}
`;
      process.stderr.write(message);
      process.exit(2); // BLOCKING
    }

    process.exit(0); // PASS
  } catch {
    // fail-open: 훅 자체 오류로 사용자 작업을 차단하지 않음
    process.exit(0);
  }
}

main();
```

### 필수 요소

| 요소 | 설명 |
|------|------|
| shebang | `#!/usr/bin/env node` |
| JSDoc | Hook 이름, Event 타입, Action 설명 |
| stdin 파싱 | `for await...of process.stdin` + `JSON.parse` |
| 도구 필터링 | `toolName` 확인 |
| 면제 패턴 | `EXEMPT_PATTERNS` 배열 |
| exit(2) | 차단 시 stderr에 메시지 출력 후 exit(2) |
| exit(0) | 통과 시 exit(0) |
| fail-open | catch 블록에서 항상 exit(0) |

### 동반 파일

```json
// package.json (같은 디렉토리)
{
  "type": "commonjs"
}
```

---

## 6. template-hook-post.md (PostToolUse)

**참조 원본**: `src/claude/core/hooks/edit-tracker.js`

**생성 경로**: `src/claude/{{DOMAIN}}/hooks/{{FULL_NAME}}.js`

### 구조

```javascript
#!/usr/bin/env node
/**
 * Hook: {{HOOK_TITLE}}
 * Event: PostToolUse ({{MATCHER}})
 * Action: log (exit 0) -- {{ACTION_DESCRIPTION}}
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.cwd();

async function main() {
  try {
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const toolUse = parsed.tool_use || parsed;
    const toolName = toolUse.tool_name || "";

    // 대상 도구 필터링
    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    // ============================================================
    // 로깅/처리 로직
    // ============================================================

    // TODO: 로깅 또는 후처리 구현

    process.exit(0); // 항상 통과
  } catch {
    process.exit(0); // 에러 시에도 통과
  }
}

main();
```

### PreToolUse와의 차이

| 항목 | PreToolUse | PostToolUse |
|------|-----------|-------------|
| Event | `PreToolUse` | `PostToolUse` |
| 차단 가능 | O (exit 2) | X (항상 exit 0) |
| 용도 | 규칙 강제, 차단 | 로깅, 알림, 추적 |
| exit 코드 | 0 (통과) / 2 (차단) | 항상 0 |

---

## 7. template-hook-stop.md (Stop)

**참조 원본**: `src/claude/core/hooks/session-wrap-suggest.js`

**생성 경로**: `src/claude/{{DOMAIN}}/hooks/{{FULL_NAME}}.js`

### 구조

```javascript
#!/usr/bin/env node
/**
 * Hook: {{HOOK_TITLE}}
 * Event: Stop
 * Action: suggest (exit 0) -- {{ACTION_DESCRIPTION}}
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.cwd();

async function main() {
  try {
    // Stop 이벤트는 stdin 데이터가 제한적일 수 있음
    let inputData = "";
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    // ============================================================
    // 세션 종료 시 처리 로직
    // ============================================================

    // TODO: 정리/제안/로깅 구현

    process.exit(0); // Stop 훅은 항상 exit(0)
  } catch {
    process.exit(0); // 에러 시에도 통과
  }
}

main();
```

### PreToolUse/PostToolUse와의 차이

| 항목 | PreToolUse | PostToolUse | Stop |
|------|-----------|-------------|------|
| 실행 시점 | 도구 실행 전 | 도구 실행 후 | 세션 종료 시 |
| 차단 가능 | O (exit 2) | X | X |
| stdin 내용 | tool_use 객체 | tool_use 객체 | 세션 컨텍스트 |
| 용도 | 규칙 강제 | 로깅/추적 | 정리/제안 |
| exit 코드 | 0/2 | 항상 0 | 항상 0 |

---

## 8. template-rule.md

**참조 원본**: `src/claude/core/rules/golden-principles.md`

**생성 경로**: `src/claude/core/rules/{{NAME}}.md` (도메인 접두사 없음)

### 구조

```markdown
# {{TITLE}}

> {{SUBTITLE}}

## 1. {{PRINCIPLE_1_TITLE}}

**Why?** {{WHY_1}}

**How?** {{HOW_1}}

## 2. {{PRINCIPLE_2_TITLE}}

**Why?** {{WHY_2}}

**How?** {{HOW_2}}

---

## Anti-Rationalization

| 원칙 | 변명 | 현실 |
|------|------|------|
| {{PRINCIPLE}} | "{{EXCUSE}}" | {{REALITY}} |
```

### 특징

- YAML frontmatter 없음
- 도메인 접두사 없음 (항상 `src/claude/core/rules/`)
- Why/How 쌍으로 원칙 설명
- Anti-Rationalization 테이블로 변명 차단
- 코드 예시 포함 권장 (WRONG vs CORRECT 패턴)

---

---

## Codex 템플릿 (Phase 4)

> 아래 4종은 Phase 4 (Codex 통합) 구현 시 추가된다. `src/codex/`에 아직 실제 자산이 없으므로 `docs/codex-compatibility/` 명세 기반의 설계안이다.

### 9. template-codex-agent.md

**생성 경로**: `src/codex/{{DOMAIN}}/agents/{{FULL_NAME}}.md`

Codex 에이전트는 Claude Agent_Prompt XML이 아닌 Codex subagent 포맷을 사용한다. 실행 모델이 다르므로 Claude sibling과 동일한 기능 identity를 유지하되 구조는 독립적이다.

| 항목 | Claude | Codex |
|------|--------|-------|
| 포맷 | YAML frontmatter + Agent_Prompt XML | Codex subagent 정의 (포맷 확정 필요) |
| 실행 | Claude Agent tool로 직접 실행 | Codex plugin 내 subagent로 실행 |
| 도구 | tools 배열 | Codex capabilities |

### 10. template-codex-command.md

**생성 경로**: `src/codex/{{DOMAIN}}/commands/{{FULL_NAME}}.md`

Codex에는 Claude의 slash command가 없다. 대신 documented entry flow 또는 스킬 기반 진입점으로 표현한다.

### 11. template-codex-hook.md

**생성 경로**: `src/codex/{{DOMAIN}}/hooks/{{FULL_NAME}}.js`

JS 코드는 Claude 훅과 동일하나, 등록 포맷이 다르다:

| 항목 | Claude | Codex |
|------|--------|-------|
| 등록 | `"node .claude/hooks/..."` (문자열) | `{type: "command", command: "./hooks/..."}` (객체) |
| Stop 이벤트 | 지원 | 미지원 |
| 출력 경로 | `.claude/hooks/` | `plugins/claude-kit/hooks/` |
| 필터링 | 없음 | `codex-hook-compat.js` 적용 |

### 12. template-codex-skill.md

**생성 경로**: `src/codex/{{DOMAIN}}/skills/{{FULL_NAME}}/SKILL.md`

대부분 Claude 스킬과 동일. Codex UX 차이가 클 때만 별도 작성. `plugins/claude-kit/skills/`에서 자동 로드된다.

---

## kit-scaffolding 스킬 (SKILL.md)

```yaml
---
name: kit-scaffolding
description: |
  claude-kit 컴포넌트 스캐폴딩 엔진. 12개 템플릿(Claude 8 + Codex 4)으로
  듀얼 타깃 컴포넌트를 표준 패턴에 맞게 생성한다. /kit-create 커맨드가 이 스킬을 참조한다.
---
```

### 스킬 워크플로우

1. `/kit-create`가 `type`, `domain`, `name`, `--target` 파싱
2. 타깃별 `references/template-{type}.md` 또는 `template-codex-{type}.md` 로드
3. 변수 매핑 테이블 구성 (`{{TARGET}}` 포함)
4. `{{VAR}}` 패턴을 실제 값으로 치환
5. 대상 경로에 파일/디렉토리 생성 (`src/claude/` 또는 `src/codex/`)
6. `--target both` 시 `src/pairing-registry.json` 갱신
7. 생성 결과 출력 + 후속 작업 안내
