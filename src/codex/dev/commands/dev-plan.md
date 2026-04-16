<!-- kit-convert generated: 2026-04-16 -->
# dev-plan — Codex Entry Flow

## Overview

AI가 구현 계획을 세워줍니다. 확인 후 코딩 시작. This command invokes the **planner** agent to create a comprehensive implementation plan before writing any code.

## Invocation

```
dev-plan [요구사항 설명]
```

## Workflow

The planner agent will:

1. **Analyze the request** and restate requirements in clear terms
2. **Break down into phases** with specific, actionable steps
3. **Identify dependencies** between components
4. **Assess risks** and potential blockers
5. **Estimate complexity** (High/Medium/Low)
6. **Present the plan** and WAIT for your explicit confirmation

## When to Use

Use `dev-plan` when:
- Starting a new feature
- Making significant architectural changes
- Working on complex refactoring
- Multiple files/components will be affected
- Requirements are unclear or ambiguous

## Output

The planner produces:
- Requirements Restatement
- Implementation Phases (with Phase 1, Phase 2, etc.)
- Dependencies
- Risks
- Estimated Complexity

**CRITICAL**: The planner agent will **NOT** write any code until you explicitly confirm the plan with "yes" or "proceed" or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

## 후처리: 계획 저장

사용자가 계획을 확인하면, 확정된 계획을 `prompt_plan.md`에 저장한다:
1. 프로젝트 루트의 `prompt_plan.md`에 계획 내용을 기록
2. 기존 `prompt_plan.md`가 있으면 이전 내용을 "## 이전 계획" 섹션으로 아카이브 후 덮어쓰기
3. 저장 후 안내: "계획이 prompt_plan.md에 저장되었습니다."

## 다음 단계

| 계획이 확정되면 | 커맨드 |
|:---------------|:-------|
| 테스트하면서 구현 | `tdd` |
| 한 번에 자동 실행 | `auto` |
| 문서 동기화 | `dev-sync` (다른 세션에서 이어서 작업 시) |

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-plan.md
