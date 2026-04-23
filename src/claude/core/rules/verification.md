# Verification Before Completion

> Extends [Golden Principle #10: Evidence-Based Completion](golden-principles.md#10-evidence-based-completion).
> Think of it like a courtroom: "it probably works" is as valid as "probably innocent" — not at all. Evidence first, claims second.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you did not run a verification command **in this message**, you cannot claim it passed. Previous runs do not count — the code may have changed since then.

## The Gate Function

Before making any claim about success, completion, or satisfaction:

```
1. IDENTIFY  — What command proves this claim?
2. RUN       — Execute the full command (fresh, complete)
3. READ      — Read the entire output, check exit code, count failures
4. VERIFY    — Does the output confirm the claim?
                No  → Report actual state with evidence
                Yes → Proceed to claim with evidence
5. CLAIM     — Only now state the result

Skipping any step = not verification, just guessing.
```

## Verification Checklist

| Claim | Required Evidence | Insufficient Evidence |
|-------|------------------|----------------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, assumption |
| Build succeeds | Build command: exit 0 | "Linter passed so build will too" |
| Bug fixed | Regression test: passes | "Code changed, assume fixed" |
| Regression test works | Red-Green cycle verified | Single pass without failure check |
| Agent task complete | VCS diff confirms changes | Agent self-reported "success" |
| Requirements met | Line-by-line checklist verified | "Tests pass so requirements met" |

## Red-Green Verification (TDD)

For regression tests and bug fixes, a single pass is not enough:

```
1. Write test       → Run → PASS (confirms test works)
2. Revert the fix   → Run → FAIL (confirms test catches the bug)
3. Restore the fix  → Run → PASS (confirms fix resolves the bug)
```

If step 2 does not fail, the test is not actually testing the fix.

## Red Flags — Stop If You Think This

| Thought | Reality |
|---------|---------|
| "It probably works" | Run verification |
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Linter passed, so..." | Linter ≠ compiler ≠ tests |
| "The agent said it succeeded" | Verify independently |
| "It's a simple change, no need to verify" | Simple changes break too |
| "I already ran it earlier" | Earlier ≠ now. Run again |
| "Should", "probably", "seems to" | Probabilistic language is not evidence |
| "Great!", "Perfect!", "Done!" | Do not express satisfaction before verification |
| "Partial check is enough" | Partial proves nothing |

## Verification Patterns

### Tests

```
CORRECT: [run test command] → [output: 34/34 passed] → "All 34 tests passed"
WRONG:   "It should pass" / "Looks correct to me"
```

### Build

```
CORRECT: [run build] → [output: exit 0, 0 errors] → "Build succeeded"
WRONG:   "Linter passed, so build should work too"
```

### Requirements

```
CORRECT: Re-read plan → Create checklist → Verify each item → Report gaps or completion
WRONG:   "Tests pass, so the feature is done"
```

### Agent Delegation

```
CORRECT: Agent reports success → Check VCS diff → Verify changes → Report actual state
WRONG:   Trust agent report without independent verification
```

### Agent Edit Race (Read Cache)

에이전트(Task tool) 위임 시 **메인 세션의 Read 캐시**와 에이전트가 실제 수정한 파일 내용이 불일치할 수 있다. 에이전트 완료 직후 메인이 같은 파일을 Edit하려 시도하면 `File has not been read yet in this session. Read it first before writing to it.` 에러가 발생한다.

```
CORRECT: Agent(write-capable) completes → Read(file) → Edit(file) → "Success"
WRONG:   Agent(write-capable) completes → Edit(file) → "File has not been read yet" error
```

**Checklist (에이전트 위임 후)**:

- [ ] 에이전트가 **파일을 수정했는지** (read-only 에이전트면 skip)
- [ ] 수정 대상 파일이 **메인이 이어서 Edit할 파일과 겹치는지**
- [ ] 겹치면 **Edit 전 Read를 반드시 재호출** (캐시 재인증)
- [ ] `agent-completion-cache-invalidate` 훅 경고 메시지가 떴다면 무시하지 말 것

**에이전트 분류 원천**: 각 에이전트 파일(`src/claude/**/agents/*.md`)의 `tools:` 필드가 SSOT. Write/Edit 보유 시 write-capable. Role 서술이 아닌 **능력 기반** 분류.

**Read-only 에이전트** (Read 재호출 불필요):

| 에이전트 | 도메인 | 비고 |
|----------|--------|------|
| `dev-architect` | dev | Read/Grep/Glob만 보유 |
| `dev-code-reviewer` | dev | Bash 추가, 분석 전용 |
| `plan-reviewer` | plan | Read/Grep/Glob, PCC 검증 |
| `copy-fidelity` | copy | visual fidelity 리뷰 |
| `copy-interaction-fidelity` | copy | interaction 리뷰 |
| `copy-qa-reviewer` | copy | 최종 QA |
| `Explore` | (Claude Code 기본) | 탐색 전용 |
| `Plan` | (Claude Code 기본) | 계획 설계 |

**Write-capable 에이전트** (완료 후 Read 재호출 권장):

| 에이전트 | 도메인 | 비고 |
|----------|--------|------|
| `dev-doc-updater` | dev | Write/Edit 보유 |
| `dev-security-reviewer` | dev | Write/Edit 보유 (보고서/fix 작성) |
| `dev-database-reviewer` | dev | Write/Edit 보유 (SQL/migration 작성) |
| `dev-verify-agent` | dev | Write/Edit 보유 (라운드당 ≤10파일) |
| `plan-idea-collector` | plan | IDEA 파일 생성/수정 |
| `plan-idea-screener` | plan | SCREENING 파일 생성 |
| `plan-prd-writer` | plan | PRD 문서 작성 |
| `plan-stitch-integrator` | plan | Feature Package 작성 |
| `plan-wireframe-designer` | plan | 와이어프레임 파일 작성 |
| `copy-reference-baseline` | copy | evidence/ 파일 생성 |
| `general-purpose` | (Claude Code 기본) | 전범위 Edit 가능 |
| `plan-draft-writer` | plan | (IMP-KIT-003, 2.2.0+ 예정) |
| `plan-bridge-writer` | plan | (IMP-KIT-004, 2.2.0+ 예정) |

### Agent File Ownership (T-RACE-01)

에이전트 race 방지를 위해 파일 유형별 소유권 매트릭스를 SSOT 로 분리: **[`agent-file-ownership.md`](agent-file-ownership.md)** 참조.

핵심 원칙:
- **1 차 작성** 권한: 해당 파일을 처음 생성하는 주체 (한 파일당 1 주체)
- **후속 갱신** 권한: 프롬프트에 명시된 필드만 수정
- **메인 전담** 파일: 서브 에이전트 편집 금지 — 대표적으로 `.plans/epics/*/EPIC-*/01-children-features.md`

**Checklist (에이전트 위임 전)**:

- [ ] 위임하려는 작업의 파일이 매트릭스의 "메인 전담" 컬럼에 있는가? → 있으면 메인이 직접 Edit
- [ ] 서브 에이전트 프롬프트에 `<File_Ownership>` 블록이 있거나 참조 링크가 명시됐는가?
- [ ] 병렬 호출 에이전트 2+ 개가 동일 파일에 "1 차 작성/후속 갱신" 권한을 가지면 순차 실행 고려

## When to Apply

**Always**, before:
- Any claim of success or completion
- Expressing satisfaction about results
- Positive statements about work status
- Creating commits or pull requests
- Marking tasks as complete
- Moving to the next task
- Delegating to sub-agents

## Copy Domain Verification (copy 도메인 활성 시)

copy 도메인이 활성화된 경우, 시나리오별로 evidence 요구사항이 다르다:
- **시나리오 A/B**: 구현 후 QA 시점에서 `/copy-verify` 실행. evidence manifest 존재 필수.
- **시나리오 C**: 갭 분석 데이터가 상세 PRD에 반영되었는지 PCC-06으로 추가 검증.
- 상세 기준은 `copy-evidence.md` 룰 참조.

## The Bottom Line

There are no shortcuts to verification.

Run the command. Read the output. Then — and only then — state the result.

This is non-negotiable.
