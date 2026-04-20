# Interaction Rules

## State Assumptions Before Coding (CRITICAL)

Before implementing ambiguous requirements, **surface assumptions and ask** rather than guessing silently.

- If requirements are unclear, state your assumptions and get confirmation
- When multiple interpretations exist, present the options — don't pick silently
- If a simpler approach exists, push back ("This can be done in half the code")

```
# BAD: Assume silently and proceed
User: "Add a feature to export user data"
Claude: → Immediately implements JSON+CSV export (assumes file location, fields, scope)

# GOOD: State assumptions, then proceed
Claude: "Before implementing, let me clarify:
1. Scope: All users or filtered? (privacy implications)
2. Method: Browser download? API response? Background job?
3. Fields: Which fields? (exclude sensitive data?)
Simplest approach: paginated JSON API endpoint"
```

## Explain with Analogies

When explaining code or technical concepts, use **everyday analogies** first, then follow with technical details.

### Example

```
# BAD: No analogy
"useEffect runs side effects after component rendering."

# GOOD: Analogy first
"useEffect is like a restaurant's closing routine. After serving food (rendering),
you do the dishes and restock (side effects).
Technically, it's a Hook that runs after component rendering."
```

## Conclusion First

Present the **key conclusion first**, then add supporting details.

- One-line conclusion before long analysis
- Never start with "Because..." — conclusion first, reasoning second
- Code changes: one-line summary of what changed, then detailed diff

```
# BAD
"Looking at React's rendering cycle... (10 lines) ...so use useMemo."

# GOOD
"Wrap it with useMemo. The expensive calculation repeats on every render."
```

## Scenario Determination Gate (copy 도메인 활성 시)

copy 도메인이 활성화된 상태에서 새 Feature를 시작할 때, 시나리오(A/B/C)와 Feature 유형(copy/dev)이 아직 확정되지 않았다면:
- 가정을 명시하고 사용자에게 확인을 받는다 ("이 Feature는 시나리오 C로 보입니다 — 맞나요?")
- `/plan-draft`에서 공식 판정되므로, 판정 전에 copy 워크플로우를 자의적으로 진행하지 않는다.

## Be Honest About Uncertainty

If unsure, **say so** instead of guessing.

- No speculative answers like "maybe..." or "it could be..."
- Instead: "I'm not sure — let me verify" + provide verification method
- If verifiable via docs/source code, verify before answering

## context7 MCP Usage

Before writing code that uses a library/framework, **always query context7 MCP** for up-to-date documentation.

### When to Use

- Checking library API usage
- Framework patterns and best practices
- Version-specific breaking changes
- Introducing a new package

### Steps

1. `mcp__context7__resolve-library-id` to find library ID
2. `mcp__context7__query-docs` to query relevant docs
3. Write code based on query results

### Exceptions

- Already queried in the same session
- Basic language syntax (JavaScript, Python fundamentals)
- Project-internal code (not a context7 target)

## Web Fetching (CRITICAL)

**NEVER use the built-in WebFetch tool.** Site response delays can freeze the entire session.

Use MCP-based alternatives instead:

| Priority | Tool | Use Case |
|----------|------|----------|
| 1st | `mcp__jina-reader__*` | Token-efficient, clean markdown output |
| 2nd | `mcp__fetch__fetch` | Fallback if Jina fails, free |

No exceptions — WebFetch is denied in all scenarios.

## Agent Delegation & Read Cache (CRITICAL)

서브에이전트(Task tool)에 파일 편집을 위임한 직후, 메인 세션의 **Read 캐시가 해당 파일의 변경 전 내용을 가리킨다**. 이 상태에서 메인이 Edit를 시도하면 `File has not been read yet` 에러가 발생한다.

### 원인

메인 세션과 서브에이전트 세션은 **파일 캐시를 공유하지 않는다**. 에이전트가 수정한 파일을 메인이 편집할 때, 메인 입장에서는 "이 세션에서 처음 보는 파일"이므로 harness가 거부한다.

### 패턴

```
# BAD: 에이전트 완료 후 바로 Edit 시도
Agent(subagent_type=plan-wireframe-designer, ...)   # 파일 수정
  ↓
Edit(file_path=수정된-파일.md, ...)                 # "File has not been read yet" 에러
```

```
# GOOD: Edit 전에 Read 재호출
Agent(subagent_type=plan-wireframe-designer, ...)
  ↓
Read(file_path=수정된-파일.md)                      # 캐시 재인증
  ↓
Edit(file_path=수정된-파일.md, ...)                 # 성공
```

### 자동 알림 (hook)

`agent-completion-cache-invalidate` 훅이 write-capable 에이전트 완료 시 systemMessage로 경고한다. 경고가 보이면 **Edit 전 Read를 반드시 재호출**한다. 동일 세션 내 같은 에이전트 반복 호출은 1회만 경고한다 (tmpdir 마커 dedup).

### Read-only 에이전트는 예외

분류 원천은 각 에이전트 파일의 `tools:` 필드다. 아래 **8개**는 Write/Edit를 보유하지 않으므로 Read 재호출이 불필요하고 훅도 경고를 생략한다:

- dev 도메인: `dev-architect`, `dev-code-reviewer`
- plan 도메인: `plan-reviewer`
- copy 도메인: `copy-fidelity`, `copy-interaction-fidelity`, `copy-qa-reviewer`
- Claude Code 기본: `Explore`, `Plan`

그 외 에이전트(`dev-doc-updater`, `dev-security-reviewer`, `dev-database-reviewer`, `dev-verify-agent`, `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-stitch-integrator`, `plan-wireframe-designer`, `copy-reference-baseline`, `general-purpose` 등)는 모두 write-capable이다.

상세 규칙: `verification.md`의 "Agent Edit Race (Read Cache)" 섹션.
