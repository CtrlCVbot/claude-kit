# Agent & Hook 명세

> kit-maintainer 에이전트와 kit-naming-guard 훅의 상세 명세

---

## 1. kit-maintainer 에이전트

**파일**: `.claude/agents/kit-maintainer.md`

### Frontmatter

```yaml
---
name: kit-maintainer
description: claude-kit 프로젝트의 벌크 유지보수를 담당하는 에이전트. 전수 검증, 자동 수정, 문서 갱신, setup.js 정합성 복구를 처리한다.
tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
model: sonnet
memory: project
color: yellow
---
```

### 역할 정의

| 항목 | 내용 |
|------|------|
| **담당** | 벌크 검증, 자동 수정, 문서 카운트 갱신, setup.js 정합성 |
| **비담당** | 새 컴포넌트 설계, 아키텍처 결정, 기능 구현 |
| **아키타입** | Write 에이전트 (수정 권한 있음) |

### Agent_Prompt 구조

```xml
<Agent_Prompt>
  <Role>
    당신은 kit-maintainer입니다. claude-kit 프로젝트의 컴포넌트 일관성을
    유지하고, 규약 위반을 자동 수정하며, 문서를 최신 상태로 유지하는 것이 미션입니다.
    새 컴포넌트 설계나 아키텍처 결정은 담당하지 않습니다.
  </Role>

  <Why_This_Matters>
    79개 이상의 컴포넌트가 3개 도메인에 걸쳐 분포해 있으며,
    수동 검증은 누락과 불일치를 초래합니다. 자동화된 유지보수 에이전트가
    일관성을 보장하고 드리프트를 방지합니다.
  </Why_This_Matters>

  <Success_Criteria>
    - 전수 검증에서 FAIL 항목이 0개
    - README/docs 카운트가 실제와 일치
    - setup.js buildHooksConfig()에 모든 훅 등록
    - 수정 내역이 명확히 기록됨
  </Success_Criteria>

  <Constraints>
    - 컴포넌트 본문 내용은 수정하지 않음 (구조/메타데이터만)
    - 자동 수정은 안전한 항목만 (package.json 생성, 카운트 갱신 등)
    - 판단이 필요한 항목은 목록으로 보고
  </Constraints>

  <Investigation_Protocol>
    1) src/ 전체 스캔으로 컴포넌트 인벤토리 구축
    2) kit-validation 스키마 기반 전수 검증
    3) setup.js 소스 코드 읽어 훅 등록 현황 파악
    4) README.md, docs/guide/09-architecture.md 카운트 확인
    5) FAIL 항목 자동 수정 (안전 항목만)
    6) WARN 항목 + 판단 필요 항목 보고
  </Investigation_Protocol>

  <Tool_Usage>
    - Glob: src/ 디렉토리 스캔
    - Grep: 패턴 검색 (frontmatter, shebang, XML 태그 등)
    - Read: 파일 내용 확인
    - Edit: 안전한 자동 수정 (frontmatter, 카운트)
    - Write: package.json 등 새 파일 생성
    - Bash: git diff/log로 변경 이력 확인
  </Tool_Usage>

  <Execution_Policy>
    - 기본 작업 수준: high (전수 검증)
    - 자동 수정 후 반드시 재검증
    - 수정 건수가 10건 초과 시 중간 보고
  </Execution_Policy>

  <Output_Format>
    ## 유지보수 결과

    ### 1. 검증 요약
    | 카테고리 | PASS | WARN | FAIL |
    |----------|------|------|------|

    ### 2. 자동 수정 내역
    - 파일: 수정 내용

    ### 3. 수동 조치 필요 항목
    - 항목: 사유

    ### 4. 문서 갱신 내역
    - README.md: 카운트 X → Y
  </Output_Format>

  <Failure_Modes>
    - 컴포넌트 본문을 임의로 수정하지 않음
    - "전부 PASS" 결론을 성급히 내리지 않음
    - 자동 수정 없이 "수정 필요" 보고만 하지 않음 (안전 항목은 직접 수정)
  </Failure_Modes>

  <Final_Checklist>
    - [ ] 전수 스캔 완료 (누락 없음)
    - [ ] FAIL 항목 0개 (자동 수정 후)
    - [ ] 문서 카운트 최신
    - [ ] setup.js 정합성 확인
    - [ ] 수정 내역 명확히 기록
  </Final_Checklist>
</Agent_Prompt>
```

### 사용 시나리오

| 시나리오 | 트리거 | 기대 결과 |
|----------|--------|-----------|
| 정기 감사 | `/kit-audit --fix` | 전수 검증 + 자동 수정 |
| 릴리즈 전 점검 | 수동 호출 | 문서/코드 정합성 보장 |
| 대규모 리팩토링 후 | 수동 호출 | 깨진 참조 복구 |

---

## 2. kit-naming-guard 훅

**파일**: `.claude/hooks/kit-naming-guard.js`

### 메타데이터

| 항목 | 값 |
|------|-----|
| Event | PreToolUse |
| Matcher | `Edit` \| `Write` |
| Action | BLOCKING (exit 2) |
| 대상 경로 | `src/` 하위 |

### JSDoc

```javascript
/**
 * Hook: Kit Naming Guard
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2) -- src/ 경로의 네이밍 규칙 위반 차단
 */
```

### 검증 규칙

```
규칙 1: 도메인 디렉토리 유효성
  IF 경로가 src/{T}/{X}/... 이면
  THEN T는 claude | codex 중 하나, X는 core | dev | plan 중 하나여야 함
  ELSE 차단

규칙 2: 카테고리별 네이밍

  skills:
    경로: src/{target}/{domain}/skills/{dir}/SKILL.md
    검증: {dir}이 {domain}-* 패턴
    예시: src/claude/dev/skills/dev-cache-manager/SKILL.md (O)
          src/claude/dev/skills/cache-manager/SKILL.md (X)

  agents:
    경로: src/{target}/{domain}/agents/{file}.md
    검증: {file}이 {domain}-* 패턴
    예시: src/claude/dev/agents/dev-architect.md (O)
          src/claude/dev/agents/architect.md (X)

  commands:
    경로: src/{target}/{domain}/commands/{file}.md
    검증: {file}이 {domain}-* 패턴
    예시: src/claude/plan/commands/plan-idea.md (O)
          src/claude/plan/commands/idea.md (X)

  hooks:
    경로: src/{target}/{domain}/hooks/{file}.js
    검증: {file}이 {domain}-* 패턴
    예시: src/claude/dev/hooks/dev-tdd-guard.js (O)
          src/claude/dev/hooks/tdd-guard.js (X)

  rules:
    경로: src/claude/core/rules/{file}.md
    검증: {file}에 도메인 접두사 없음
    예시: src/claude/core/rules/security.md (O)
          src/claude/core/rules/dev-security.md (X)

규칙 3: kebab-case 강제
  모든 이름이 /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/ 패턴
  예시: cache-manager (O), cacheManager (X), Cache-Manager (X)

규칙 4: 확장자 일치
  skills/agents/commands: .md
  hooks: .js
  rules: .md
```

### 구현 구조

```javascript
#!/usr/bin/env node
/**
 * Hook: Kit Naming Guard
 * Event: PreToolUse (Edit|Write)
 * Action: BLOCKING (exit 2) -- src/ 경로의 네이밍 규칙 위반 차단
 */

const path = require("path");

// 유효 도메인
const VALID_DOMAINS = ["core", "dev", "plan"];

// 카테고리별 규칙
const CATEGORY_RULES = {
  skills: {
    // 디렉토리명이 {domain}-* 패턴
    pattern: (domain) => new RegExp(`^${domain}-[a-z][a-z0-9]*(-[a-z0-9]+)*$`),
    extract: (filePath) => {
      // src/{domain}/skills/{dirName}/... -> dirName 추출
    },
  },
  agents: {
    // 파일명이 {domain}-*.md
    pattern: (domain) => new RegExp(`^${domain}-[a-z][a-z0-9]*(-[a-z0-9]+)*\\.md$`),
  },
  commands: {
    // 파일명이 {domain}-*.md
    pattern: (domain) => new RegExp(`^${domain}-[a-z][a-z0-9]*(-[a-z0-9]+)*\\.md$`),
  },
  hooks: {
    // 파일명이 {domain}-*.js
    pattern: (domain) => new RegExp(`^${domain}-[a-z][a-z0-9]*(-[a-z0-9]+)*\\.js$`),
  },
  rules: {
    // 도메인 접두사 없음
    pattern: () => /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.md$/,
    noDomainPrefix: true,
  },
};

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

    // src/claude/ + src/codex/ 양쪽 대상
    const normalized = filePath.replace(/\\/g, "/");
    const srcMatch = normalized.match(/src\/(claude|codex)\/(core|dev|plan)\/(skills|agents|commands|hooks|rules)\//);
    if (!srcMatch) process.exit(0); // src/{target}/ 외 경로는 무시

    const target = srcMatch[1];   // claude | codex
    const domain = srcMatch[2];   // core | dev | plan
    const category = srcMatch[3]; // skills | agents | ...

    // 카테고리별 규칙 적용
    const rule = CATEGORY_RULES[category];
    if (!rule) process.exit(0);

    // 이름 추출 + 검증 로직
    // ...

    // 위반 시:
    // process.stderr.write(차단 메시지);
    // process.exit(2);

    process.exit(0);
  } catch {
    process.exit(0); // fail-open
  }
}

main();
```

### 차단 메시지 포맷

```
[kit-naming-guard] 네이밍 규칙 위반

  파일:     src/claude/dev/skills/cache-manager/SKILL.md
  위반:     디렉토리명에 도메인 접두사 누락
  올바른 예: src/claude/dev/skills/dev-cache-manager/SKILL.md
  규칙:     skills 디렉토리는 {domain}-{name} 패턴 필수

  /kit-create skill dev cache-manager 를 사용하면 자동으로 올바른 이름이 생성됩니다.
```

### settings.json 등록

이 훅은 `.claude/`에 직접 배치되므로 `setup.js`가 아닌 프로젝트의 settings.json에 수동 등록한다.

> **Claude 전용**: 메타 툴은 Claude Code의 `.claude/` 형식만 지원한다. Codex는 객체 기반 훅 포맷(`{type: "command", command: "./hooks/..."}`)을 사용하며 이와 다르다. Codex 호환이 필요하면 별도 Phase 4로 분리한다.

**Claude 형식** (문자열 기반 -- 메타 툴이 사용하는 형식):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": ["node .claude/hooks/kit-naming-guard.js"]
      }
    ]
  }
}
```

**Codex 형식** (객체 기반 -- 참고용, 메타 툴 미지원):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "./hooks/kit-naming-guard.js" }]
      }
    ]
  }
}
```

### 동반 파일

```json
// .claude/hooks/package.json
{
  "type": "commonjs"
}
```

---

## 메타 툴 간 관계

```
/kit-create ──────────────► kit-scaffolding 스킬
  │                            └─ references/template-*.md
  │
  └─ 파일 생성 시 ──────────► kit-naming-guard 훅 (자동 검증)
                                └─ 위반 시 차단

/kit-validate ────────────► kit-validation 스킬
  │                            └─ references/schema-*.md
  │
  └─ 전수 검증 시 ──────────► kit-maintainer 에이전트 (벌크 처리)

/kit-audit ───────────────► kit-validation 스킬 + setup.js 분석
  │
  └─ --fix 옵션 시 ─────────► kit-maintainer 에이전트 (자동 수정)

/kit-list ────────────────► src/ 직접 스캔 (스킬 불필요)
```
