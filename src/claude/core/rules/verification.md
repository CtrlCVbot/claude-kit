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
