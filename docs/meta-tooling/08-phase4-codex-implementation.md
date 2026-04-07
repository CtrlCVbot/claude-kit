# Phase 4: Codex 통합 — 상세 구현 명세

이 문서는 Phase 4(Codex 통합)를 자율 구현하기 위한 자기 완결형 명세이다.
Phase 0-3이 완료된 상태에서, Codex 또는 다른 AI 에이전트가 이 문서만으로
모든 신규 파일 생성과 기존 파일 수정을 수행할 수 있도록 작성되었다.

---

## 1. 현재 상태 (Phase 0-3 완료)

### .claude/ 구조 (22 파일)

```
.claude/
  agents/kit-maintainer.md
  commands/kit-create.md, kit-validate.md, kit-list.md, kit-audit.md
  hooks/kit-naming-guard.js, package.json
  settings.json
  skills/
    kit-scaffolding/ (SKILL.md + 8 Claude 템플릿)
    kit-validation/ (SKILL.md + 5 Claude 스키마)
```

### src/ 구조

```
src/claude/{core,dev,plan}/  ← 84 components
src/codex/{core,dev,plan}/   ← empty (.gitkeep only)
src/templates/               ← shared
```

---

## 2. 구현 순서 (위상 정렬)

```
Layer 0: T1 (pairing-registry.json) + T14 (naming-guard 검증)
Layer 1: T2-T5 (4 Codex 템플릿)
Layer 2: T6-T9 (4 Codex 스키마)
Layer 3: T10 (kit-create.md) + T16 (kit-scaffolding SKILL.md)
Layer 4: T11 (kit-validate.md) + T17 (kit-validation SKILL.md)
Layer 5: T12 (kit-list.md) + T13 (kit-audit.md) + T15 (kit-maintainer.md)
```

동일 Layer 내 작업은 병렬 실행 가능. Layer 간에는 반드시 순차 실행.

---

## 3. 신규 파일 (9개)

### T1: src/pairing-registry.json

```json
{
  "$schema": "pairing-registry-v1",
  "description": "Claude/Codex 자산 페어링 상태 추적. /kit-create가 자동 갱신, /kit-audit C7이 검증.",
  "entries": []
}
```

엔트리 스키마 (참조용):

| 필드 | 타입 | 설명 |
|------|------|------|
| `identity` | string | full_name (예: `dev-architect`) |
| `type` | enum | `"skill"` \| `"agent"` \| `"command"` \| `"hook"` \| `"rule"` |
| `domain` | enum | `"core"` \| `"dev"` \| `"plan"` |
| `status` | enum | `"paired"` \| `"codex-skip"` \| `"codex-native-only"` |
| `reason` | string \| null | `codex-skip`일 때 필수 |
| `claude` | string \| null | 경로 (예: `src/claude/dev/agents/dev-architect.md`) |
| `codex` | string \| null | 경로 (예: `src/codex/dev/agents/dev-architect.md`) |
| `createdAt` | string | ISO 8601 날짜 |

---

### T2: .claude/skills/kit-scaffolding/references/template-codex-skill.md

```markdown
---
name: {{FULL_NAME}}
description: {{DESCRIPTION}}
---

# {{FULL_NAME}}

TODO: 스킬 개요를 작성하세요.

## 워크플로우

1. TODO: 단계 1
2. TODO: 단계 2

## Codex 참고 사항

- Claude sibling: `src/claude/{{DOMAIN}}/skills/{{FULL_NAME}}/SKILL.md`
- 이 스킬은 `plugins/claude-kit/skills/`에서 자동 로드됩니다.

## 참조

- Claude sibling: (해당 시 추가)
```

---

### T3: .claude/skills/kit-scaffolding/references/template-codex-agent.md

HEADING-BASED 형식 (Agent_Prompt XML이 아님):

```markdown
# {{FULL_NAME}}

{{DESCRIPTION}}

## Role

TODO: 역할을 설명하세요.
- 담당: TODO
- 비담당: TODO

## Capabilities

TODO: 이 에이전트가 할 수 있는 작업을 나열하세요.

## Constraints

{{CONSTRAINTS}}

## Output Format

TODO: 출력 형식을 정의하세요.

## Failure Modes

- TODO: 피해야 할 패턴

## Codex 참고 사항

- Claude sibling: `src/claude/{{DOMAIN}}/agents/{{FULL_NAME}}.md`
- Codex subagent로 실행됩니다. Claude의 Agent_Prompt XML과 다른 형식입니다.
```

---

### T4: .claude/skills/kit-scaffolding/references/template-codex-command.md

Entry Flow 형식 (슬래시 커맨드 아님):

```markdown
# {{FULL_NAME}} — Codex Entry Flow

{{DESCRIPTION}}

## Overview

TODO: 이 기능이 Codex에서 어떻게 호출되는지 설명하세요.

## Invocation

Codex에서 이 기능을 사용하려면:
- TODO: 스킬 기반 진입 또는 직접 프롬프트 접근 방법

## Parameters

| 인자 | 설명 | 기본값 |
|------|------|--------|
| TODO | TODO | - |

## Workflow

1. TODO: 단계 1
2. TODO: 단계 2

## Output

TODO: 예상 출력 형식

## Codex 참고 사항

- Claude sibling: `src/claude/{{DOMAIN}}/commands/{{FULL_NAME}}.md`
- Claude에서는 `/{{FULL_NAME}}` 슬래시 커맨드로 실행됩니다.
```

---

### T5: .claude/skills/kit-scaffolding/references/template-codex-hook.md

Claude pre-hook과 동일한 JS 구조 + Codex 등록 주석:

```javascript
#!/usr/bin/env node
/**
 * Hook: {{FULL_NAME}}
 * Event: PreToolUse ({{MATCHER}})
 * Action: BLOCKING (exit 2) -- {{DESCRIPTION}}
 *
 * Codex 등록 포맷:
 *   hooks.json: { type: "command", command: "./hooks/{{FULL_NAME}}.js" }
 *
 * 주의: Codex에서는 Stop 이벤트가 지원되지 않습니다.
 */

const fs = require("fs");
const path = require("path");

const EXEMPT_PATTERNS = [
  /\.json$/, /\.yaml$/, /\.yml$/, /\.md$/,
  /\.config\.(ts|js|mjs)$/, /\.d\.ts$/,
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

    if (!["Edit", "Write"].includes(toolName)) {
      process.exit(0);
    }

    const filePath = toolUse.tool_input?.file_path || "";
    if (!filePath) process.exit(0);

    if (EXEMPT_PATTERNS.some((p) => p.test(filePath))) {
      process.exit(0);
    }

    // TODO: 핵심 검증 로직

    const isValid = true;

    if (!isValid) {
      process.stderr.write(`[{{FULL_NAME}}] 차단됨\n파일: ${filePath}\n`);
      process.exit(2);
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

main();
```

---

### T6: .claude/skills/kit-validation/references/schema-codex-skill.md

```markdown
# schema-codex-skill

> Codex 스킬 컴포넌트 검증 스키마

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
```

---

### T7: .claude/skills/kit-validation/references/schema-codex-agent.md

```markdown
# schema-codex-agent

> Codex 에이전트 컴포넌트 검증 스키마

## 대상

`src/codex/{domain}/agents/{full_name}.md`

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
| `## Codex 참고 사항` | WARN | Claude sibling 참조 |

## 안티패턴 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Agent_Prompt XML 없음 | FAIL | `<Agent_Prompt>` 태그가 없어야 함 |
| YAML frontmatter 없음 | WARN | Claude 스타일 6필드 frontmatter 없어야 함 |

## 페어링 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| pairing-registry 등록 | FAIL | agent는 required sibling |
```

---

### T8: .claude/skills/kit-validation/references/schema-codex-command.md

```markdown
# schema-codex-command

> Codex 커맨드(Entry Flow) 컴포넌트 검증 스키마

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
```

---

### T9: .claude/skills/kit-validation/references/schema-codex-hook.md

```markdown
# schema-codex-hook

> Codex 훅 컴포넌트 검증 스키마

## 대상

`src/codex/{domain}/hooks/{full_name}.js`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/codex/{domain}/hooks/{full_name}.js` |
| 파일명 패턴 | FAIL | `{domain}-{name}.js` (kebab-case) |
| package.json | FAIL | 동일 디렉토리에 `{"type": "commonjs"}` |

## 코드 패턴 (Claude 훅과 동일)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| shebang | FAIL | `#!/usr/bin/env node` |
| JSDoc | FAIL | Hook, Event, Action |
| stdin 파싱 | FAIL | `process.stdin` + `JSON.parse` |
| fail-open | FAIL | catch에서 `process.exit(0)` |

## Codex 전용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Stop 이벤트 미사용 | FAIL | `Event: Stop` 없어야 함 |
| Codex 등록 주석 | WARN | `hooks.json` 또는 `type: "command"` 언급 |
| codex-hook-compat 호환 | WARN | `scripts/codex-hook-compat.js`의 isCodexCompatible() 통과 |
```

---

## 4. 수정 파일 (8개) — Before/After Diff

각 수정 파일에 대해 Edit 도구에 전달할 정확한 `old_string`과 `new_string` 파라미터를 제공한다.

---

### T10: kit-create.md 수정 (6개 수정 지점)

파일: `.claude/commands/kit-create.md`

#### Diff 1: argument-hint에 --target과 --skip-codex 추가

**old_string:**
```
argument-hint: <type> <domain> <name> [--pre|--post|--stop] [--simple|--complex] [--readonly|--write|--monitor]
```

**new_string:**
```
argument-hint: <type> <domain> <name> [--target claude|codex|both] [--skip-codex "reason"] [--pre|--post|--stop] [--simple|--complex] [--readonly|--write|--monitor]
```

#### Diff 2: 타입별 옵션 테이블 뒤에 타깃 옵션 추가

**old_string:**
```
| `--stop` | hook | Stop (세션 종료) | |

## Workflow
```

**new_string:**
```
| `--stop` | hook | Stop (세션 종료) | |
| `--target` | 전체 | 타깃 플랫폼 (`claude`/`codex`/`both`) | 타입별 기본값 |
| `--skip-codex` | agent, command | Codex sibling 생략 + 사유 | |

### 타깃 기본값

| 타입 | 기본 --target | 근거 |
|------|--------------|------|
| agent | `both` | required codex sibling |
| command | `both` | required codex sibling |
| skill | `claude` | optional codex sibling |
| hook | `claude` | optional codex sibling |
| rule | `claude` | claude-origin shared |

## Workflow
```

#### Diff 3: Phase 2 경로 테이블 뒤에 Codex 경로 추가

**old_string:**
```
| rule | `src/claude/core/rules/{name}.md` |

7. 해당 경로에 이미 파일/디렉토리가 존재하면 중단하고 안내한다.
```

**new_string:**
```
| rule | `src/claude/core/rules/{name}.md` |

**Codex 경로** (`--target codex` 또는 `both` 시):

| 타입 | Codex 경로 |
|------|-----------|
| skill | `src/codex/{domain}/skills/{full_name}/SKILL.md` |
| agent | `src/codex/{domain}/agents/{full_name}.md` |
| command | `src/codex/{domain}/commands/{full_name}.md` |
| hook | `src/codex/{domain}/hooks/{full_name}.js` |
| rule | (Codex 대상 아님) |

7. 해당 경로에 이미 파일/디렉토리가 존재하면 중단하고 안내한다. `--target both`인 경우 양쪽 모두 확인.
```

#### Diff 4: Phase 3 템플릿 테이블에 Codex 템플릿 추가

**old_string:**
```
| rule | `template-rule.md` |

9. 변수를 치환한다:
```

**new_string:**
```
| rule | `template-rule.md` |

**Codex 템플릿** (`--target codex` 또는 `both`에서 Codex 측에 사용):

| 타입 | Codex 템플릿 |
|------|-------------|
| skill | `template-codex-skill.md` |
| agent | `template-codex-agent.md` |
| command | `template-codex-command.md` |
| hook | `template-codex-hook.md` |

9. 변수를 치환한다:
```

#### Diff 5: Phase 5 뒤에 Phase 6 페어링 레지스트리 추가

**old_string:**
```
12. hook인 경우 추가 안내:
    - "scripts/setup.js:buildHooksConfig()에 등록이 필요합니다"

## Rules
```

**new_string:**
```
12. hook인 경우 추가 안내:
    - "scripts/setup.js:buildHooksConfig()에 등록이 필요합니다"

### Phase 6: 페어링 레지스트리 갱신

13. `src/pairing-registry.json`을 읽는다 (없으면 빈 구조 생성).
14. 새 엔트리를 추가한다:

| 조건 | status | claude | codex |
|------|--------|--------|-------|
| `--target both` | `paired` | Claude 경로 | Codex 경로 |
| `--target claude` (agent/command) | 경고 출력 | Claude 경로 | null |
| `--skip-codex "사유"` | `codex-skip` | Claude 경로 | null |
| `--target codex` | `codex-native-only` | null | Codex 경로 |

15. 레지스트리를 저장한다.

## Rules
```

#### Diff 6: Rules에 Codex 관련 규칙 추가

**old_string:**
```
- 생성 후 git add는 하지 않는다 (사용자가 직접 커밋).
```

**new_string:**
```
- 생성 후 git add는 하지 않는다 (사용자가 직접 커밋).
- agent/command를 `--target claude`로만 생성하면 "required codex sibling" 경고를 표시한다.
- rule 타입은 `--target codex`를 거부한다 (claude-origin shared).
- hook `--stop`은 `--target codex`를 거부한다 (Codex에 Stop 이벤트 없음).
```

---

### T11: kit-validate.md 수정 (3개 수정 지점)

파일: `.claude/commands/kit-validate.md`

#### Diff 1: argument-hint에 --target 추가

**old_string:**
```
argument-hint: '[component] [--type <type>] [--domain <domain>] [--verbose]'
```

**new_string:**
```
argument-hint: '[component] [--type <type>] [--domain <domain>] [--target claude|codex] [--verbose]'
```

#### Diff 2: 파라미터 테이블에 --target 추가

**old_string:**
```
| `--verbose` | 상세 출력 | 꺼짐 |

## Workflow
```

**new_string:**
```
| `--verbose` | 상세 출력 | 꺼짐 |
| `--target` | 타깃 플랫폼 (`claude` / `codex`) | `claude` |

## Workflow
```

#### Diff 3: Phase 1 스캔 경로에 타깃 분기 추가

**old_string:**
```
1. 인자가 있으면 해당 컴포넌트만, 없으면 `src/claude/` 전체를 스캔한다.
```

**new_string:**
```
1. `--target`에 따라 스캔 대상을 결정한다:
   - `--target claude` (기본): `src/claude/` 스캔, `schema-{type}.md` 사용
   - `--target codex`: `src/codex/` 스캔, `schema-codex-{type}.md` 사용
```

---

### T12: kit-list.md 수정 (2개 수정 지점)

파일: `.claude/commands/kit-list.md`

#### Diff 1: argument-hint에 --target, --pairing 추가

**old_string:**
```
argument-hint: '[--domain <domain>] [--type <type>] [--verbose]'
```

**new_string:**
```
argument-hint: '[--domain <domain>] [--type <type>] [--target claude|codex|both] [--pairing] [--verbose]'
```

#### Diff 2: 파라미터 테이블에 추가

**old_string:**
```
| `--verbose` | description 포함 출력 | 꺼짐 |

## Workflow
```

**new_string:**
```
| `--verbose` | description 포함 출력 | 꺼짐 |
| `--target` | 타깃 필터 (`claude`/`codex`/`both`) | `both` |
| `--pairing` | 페어링 상태 표시 | 꺼짐 |

## Workflow
```

---

### T13: kit-audit.md 수정 (2개 수정 지점)

파일: `.claude/commands/kit-audit.md`

#### Diff 1: 카테고리 필터 범위 확장

**old_string:**
```
| `--category` | 감사 카테고리 필터 (`C1`~`C6`) | 전체 |
```

**new_string:**
```
| `--category` | 감사 카테고리 필터 (`C1`~`C7`) | 전체 |
```

#### Diff 2: C6 뒤에 C7 페어링 일관성 추가

**old_string:**
```
### C6: 문서 정확성 (선택)

- README.md의 컴포넌트 카운트가 실제와 일치하는지
- `docs/guide/09-architecture.md`의 컴포넌트 목록이 최신인지

## Workflow
```

**new_string:**
```
### C6: 문서 정확성 (선택)

- README.md의 컴포넌트 카운트가 실제와 일치하는지
- `docs/guide/09-architecture.md`의 컴포넌트 목록이 최신인지

### C7: 페어링 일관성 (필수)

- `src/pairing-registry.json` 존재 여부
- 레지스트리에 있는 자산이 파일시스템에 실제 존재하는지 (FAIL)
- 파일시스템의 agent/command가 레지스트리에 등록되어 있는지 (WARN)
- `codex-skip` 상태인데 reason이 비어있는 항목 (FAIL)
- `paired` 상태인데 한쪽 파일만 존재하는 항목 (FAIL)

## Workflow
```

---

### T14: kit-naming-guard.js 검증 (수정 없음)

파일: `.claude/hooks/kit-naming-guard.js`

검증만 수행: line 138 부근에 `src\/(claude|codex)\/` 정규식이 존재하는지 확인한다.
이미 듀얼 경로를 지원하므로 코드 변경은 불필요하다.

검증 명령:
```bash
grep "claude|codex" .claude/hooks/kit-naming-guard.js
```

매칭이 확인되면 T14 완료.

---

### T15: kit-maintainer.md 수정 (1개 수정 지점)

파일: `.claude/agents/kit-maintainer.md`

#### Diff 1: Investigation_Protocol에 듀얼 스캔 + 페어링 추가

**old_string:**
```
  <Investigation_Protocol>
    1) src/claude/ + src/codex/ 전체 스캔으로 컴포넌트 인벤토리 구축
    2) kit-validation 스키마 기반 전수 검증 (5개 타입 x 스키마)
    3) setup.js 소스 코드 읽어 훅 등록 현황 파악
    4) README.md, docs/guide/09-architecture.md 카운트 확인
    5) FAIL 항목 자동 수정 (안전 항목만)
    6) WARN 항목 + 판단 필요 항목 보고
  </Investigation_Protocol>
```

**new_string:**
```
  <Investigation_Protocol>
    1) src/claude/ + src/codex/ 전체 스캔으로 컴포넌트 인벤토리 구축
    2) Claude 자산: schema-{type}.md 기반 검증. Codex 자산: schema-codex-{type}.md 기반 검증
    3) src/pairing-registry.json 로드 → C7 페어링 일관성 검증
    4) setup.js 소스 코드 읽어 훅 등록 현황 파악
    5) README.md, docs/guide/09-architecture.md 카운트 확인
    6) FAIL 항목 자동 수정 (안전 항목만)
    7) WARN 항목 + 판단 필요 항목 보고
  </Investigation_Protocol>
```

---

### T16: kit-scaffolding SKILL.md 수정 (2개 수정 지점)

파일: `.claude/skills/kit-scaffolding/SKILL.md`

#### Diff 1: description + 템플릿 수

**old_string:**
```
  claude-kit 컴포넌트 스캐폴딩 엔진. 8개 Claude 템플릿으로 skill, agent, command(2종),
  hook(3종), rule을 표준 패턴에 맞게 생성한다. /kit-create 커맨드가 이 스킬을 참조한다.
```

**new_string:**
```
  claude-kit 컴포넌트 스캐폴딩 엔진. 12개 템플릿(Claude 8 + Codex 4)으로 듀얼 타깃
  컴포넌트를 표준 패턴에 맞게 생성한다. /kit-create 커맨드가 이 스킬을 참조한다.
```

#### Diff 2: 템플릿 목록에 Codex 4종 추가

**old_string:**
```
## 템플릿 목록 (8종)

| # | 템플릿 | 대상 타입 | 생성 경로 |
|---|--------|----------|-----------|
| 1 | template-skill.md | skill | `src/claude/{domain}/skills/{full_name}/SKILL.md` |
| 2 | template-agent.md | agent | `src/claude/{domain}/agents/{full_name}.md` |
| 3 | template-command-simple.md | command (--simple) | `src/claude/{domain}/commands/{full_name}.md` |
| 4 | template-command-complex.md | command (--complex) | `src/claude/{domain}/commands/{full_name}.md` |
| 5 | template-hook-pre.md | hook (--pre) | `src/claude/{domain}/hooks/{full_name}.js` |
| 6 | template-hook-post.md | hook (--post) | `src/claude/{domain}/hooks/{full_name}.js` |
| 7 | template-hook-stop.md | hook (--stop) | `src/claude/{domain}/hooks/{full_name}.js` |
| 8 | template-rule.md | rule | `src/claude/core/rules/{name}.md` |
```

**new_string:**
```
## 템플릿 목록 (12종: Claude 8 + Codex 4)

### Claude 템플릿

| # | 템플릿 | 대상 타입 | 생성 경로 |
|---|--------|----------|-----------|
| 1 | template-skill.md | skill | `src/claude/{domain}/skills/{full_name}/SKILL.md` |
| 2 | template-agent.md | agent | `src/claude/{domain}/agents/{full_name}.md` |
| 3 | template-command-simple.md | command (--simple) | `src/claude/{domain}/commands/{full_name}.md` |
| 4 | template-command-complex.md | command (--complex) | `src/claude/{domain}/commands/{full_name}.md` |
| 5 | template-hook-pre.md | hook (--pre) | `src/claude/{domain}/hooks/{full_name}.js` |
| 6 | template-hook-post.md | hook (--post) | `src/claude/{domain}/hooks/{full_name}.js` |
| 7 | template-hook-stop.md | hook (--stop) | `src/claude/{domain}/hooks/{full_name}.js` |
| 8 | template-rule.md | rule | `src/claude/core/rules/{name}.md` |

### Codex 템플릿

| # | 템플릿 | 대상 타입 | 생성 경로 |
|---|--------|----------|-----------|
| 9 | template-codex-skill.md | skill | `src/codex/{domain}/skills/{full_name}/SKILL.md` |
| 10 | template-codex-agent.md | agent | `src/codex/{domain}/agents/{full_name}.md` |
| 11 | template-codex-command.md | command | `src/codex/{domain}/commands/{full_name}.md` |
| 12 | template-codex-hook.md | hook | `src/codex/{domain}/hooks/{full_name}.js` |
```

---

### T17: kit-validation SKILL.md 수정 (2개 수정 지점)

파일: `.claude/skills/kit-validation/SKILL.md`

#### Diff 1: description + 스키마 수

**old_string:**
```
  claude-kit 컴포넌트 검증 엔진. 5개 Claude 스키마로 skill, agent, command, hook, rule의
  표준 준수 여부를 검증한다. /kit-validate와 /kit-audit가 이 스킬을 참조한다.
```

**new_string:**
```
  claude-kit 컴포넌트 검증 엔진. 9개 스키마(Claude 5 + Codex 4)로 skill, agent, command,
  hook, rule의 표준 준수 여부를 검증한다. /kit-validate와 /kit-audit가 이 스킬을 참조한다.
```

#### Diff 2: 스키마 목록에 Codex 4종 추가

**old_string:**
```
## 스키마 목록 (5종)

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 1 | schema-skill.md | `src/claude/{domain}/skills/` | frontmatter, 디렉토리명 일치, 워크플로우 |
| 2 | schema-agent.md | `src/claude/{domain}/agents/` | 6 YAML 필드, Agent_Prompt XML 10섹션, Read-Only 일관성 |
| 3 | schema-command.md | `src/claude/{domain}/commands/` | 간단/복합 판별, 제목 패턴, Phase 구조 |
| 4 | schema-hook.md | `src/claude/{domain}/hooks/` | shebang, JSDoc, 이벤트별 exit 코드, fail-open |
| 5 | schema-rule.md | `src/claude/core/rules/` | frontmatter 없음, 도메인 접두사 없음, Why/How |
```

**new_string:**
```
## 스키마 목록 (9종: Claude 5 + Codex 4)

### Claude 스키마

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 1 | schema-skill.md | `src/claude/{domain}/skills/` | frontmatter, 디렉토리명 일치, 워크플로우 |
| 2 | schema-agent.md | `src/claude/{domain}/agents/` | 6 YAML 필드, Agent_Prompt XML 10섹션, Read-Only 일관성 |
| 3 | schema-command.md | `src/claude/{domain}/commands/` | 간단/복합 판별, 제목 패턴, Phase 구조 |
| 4 | schema-hook.md | `src/claude/{domain}/hooks/` | shebang, JSDoc, 이벤트별 exit 코드, fail-open |
| 5 | schema-rule.md | `src/claude/core/rules/` | frontmatter 없음, 도메인 접두사 없음, Why/How |

### Codex 스키마

| # | 스키마 | 대상 | 핵심 검증 |
|---|--------|------|-----------|
| 6 | schema-codex-skill.md | `src/codex/{domain}/skills/` | frontmatter, Codex 참고 사항 |
| 7 | schema-codex-agent.md | `src/codex/{domain}/agents/` | 헤딩 기반 섹션, Agent_Prompt XML 없음 |
| 8 | schema-codex-command.md | `src/codex/{domain}/commands/` | Entry Flow, 슬래시 커맨드 없음 |
| 9 | schema-codex-hook.md | `src/codex/{domain}/hooks/` | Stop 이벤트 금지, Codex 등록 주석 |
```

---

## 5. 검증 계획

17개 작업 완료 후 아래 명령으로 검증한다.

| # | 명령 | 기대값 |
|---|------|--------|
| 1 | `find .claude -name "template-codex-*" \| wc -l` | 4 |
| 2 | `find .claude -name "schema-codex-*" \| wc -l` | 4 |
| 3 | `cat src/pairing-registry.json \| python3 -c "import json,sys; json.load(sys.stdin); print('OK')"` | OK |
| 4 | `grep -c "{{FULL_NAME}}" .claude/skills/kit-scaffolding/references/template-codex-agent.md` | 3+ |
| 5 | `grep -c "src/codex/" .claude/skills/kit-validation/references/schema-codex-agent.md` | 1+ |
| 6 | `grep -c "\-\-target" .claude/commands/kit-create.md` | 5+ |
| 7 | `grep -c "\-\-pairing" .claude/commands/kit-list.md` | 2+ |
| 8 | `grep -c "C7" .claude/commands/kit-audit.md` | 2+ |
| 9 | `grep "claude\|codex" .claude/hooks/kit-naming-guard.js` | matches existing regex |
| 10 | `grep -c "template-codex" .claude/skills/kit-scaffolding/SKILL.md` | 4+ |
| 11 | `grep -c "schema-codex" .claude/skills/kit-validation/SKILL.md` | 4+ |

모든 검증이 통과하면 Phase 4 완료.

---

## 6. 커밋 메시지

```
feat(meta-tooling): Phase 4 Codex 통합 — 듀얼 타깃 + 페어링 레지스트리

신규 9파일:
- Codex 템플릿 4종 (agent, command, hook, skill)
- Codex 스키마 4종 (agent, command, hook, skill)
- src/pairing-registry.json (페어링 상태 추적)

수정 8파일:
- kit-create: --target, --skip-codex, 페어링 레지스트리 워크플로우
- kit-validate: --target 플래그, Codex 스키마 라우팅
- kit-list: --target, --pairing 플래그
- kit-audit: C7 페어링 일관성 카테고리
- kit-naming-guard: 검증 완료 (이미 듀얼 경로 지원)
- kit-maintainer: Investigation_Protocol 듀얼 스캔 + C7
- kit-scaffolding SKILL.md: 12개 템플릿 목록
- kit-validation SKILL.md: 9개 스키마 목록
```
