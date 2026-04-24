<!-- kit-convert generated: 2026-04-24 -->

# Plan Command

This command invokes the **planner** agent to create a comprehensive implementation plan before writing any code.

## What This Command Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Identify Risks** - Surface potential issues and blockers
3. **Create Step Plan** - Break down implementation into phases
4. **Wait for Confirmation** - MUST receive user approval before proceeding

## When to Use

Use `dev-plan` when:
- Starting a new feature
- Making significant architectural changes
- Working on complex refactoring
- Multiple files/components will be affected
- Requirements are unclear or ambiguous

## How It Works

The planner agent will:

1. **Analyze the request** and restate requirements in clear terms
2. **Break down into phases** with specific, actionable steps
3. **Identify dependencies** between components
4. **Assess risks** and potential blockers
5. **Estimate complexity** (High/Medium/Low)
6. **Present the plan** and WAIT for your explicit confirmation

## Example Usage

```
User: dev-plan I need to add a user invitation system with email notifications

Agent (planner):
# Implementation Plan: User Invitation System

## Requirements Restatement
- Allow existing users to invite new users via email
- Support multiple invitation states (pending, accepted, expired)
- Send email notifications on invitation events
- Track invitation history and usage

## Implementation Phases

### Phase 1: Database Schema
- Add invitations table with columns: id, inviter_id, email, token, status, expires_at, created_at
- Add indexes on email and token for lookup performance
- Create migration file

### Phase 2: Invitation Service
- Create invitation service in lib/invitations.ts
- Implement token generation and validation
- Add expiration logic (72-hour default)
- Create email templates for invitation

### Phase 3: API Endpoints
- POST /api/invitations - create and send invitation
- GET /api/invitations/:token - validate invitation token
- POST /api/invitations/:token/accept - accept invitation
- GET /api/invitations - list sent invitations

### Phase 4: Frontend Components
- Create InviteUserForm component
- Add InvitationList page for sent invitations
- Implement accept-invitation landing page
- Add invitation status indicators

## Dependencies
- Email service (SendGrid/Resend)
- Token generation (crypto.randomUUID)

## Risks
- HIGH: Email deliverability (SPF/DKIM required)
- MEDIUM: Token security (brute-force prevention)
- MEDIUM: Rate limiting to prevent invitation spam
- LOW: Expired invitation UX

## Estimated Complexity: MEDIUM
- Backend: 4-6 hours
- Frontend: 3-4 hours
- Testing: 2-3 hours
- Total: 9-13 hours

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

## Important Notes

**CRITICAL**: The planner agent will **NOT** write any code until you explicitly confirm the plan with "yes" or "proceed" or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

## Integration with Other Commands

After planning:
- Use `/tdd` to implement with test-driven development
- Use `/build-and-fix` if build errors occur
- Use `/code-review` to review completed implementation

## Related Agents

This command invokes the `planner` agent located at:
`~/.claude/agents/planner.md`

---

## 후처리: 계획 저장

사용자가 계획을 확인하면, 확정된 계획을 `prompt_plan.md`에 저장한다:
1. 프로젝트 루트의 `prompt_plan.md`에 계획 내용을 기록
2. 기존 `prompt_plan.md`가 있으면 이전 내용을 "## 이전 계획" 섹션으로 아카이브 후 덮어쓰기
3. 저장 후 안내: "계획이 prompt_plan.md에 저장되었습니다."

이렇게 하면 다음 세션에서 `/dev-sync`로 계획을 불러올 수 있다.

## 다음 단계

| 계획이 확정되면 | 커맨드 |
|:---------------|:-------|
| 테스트하면서 구현 | `/tdd` |
| 한 번에 자동 실행 | `/auto` |
| 문서 동기화 | `/dev-sync` (다른 세션에서 이어서 작업 시) |

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/commands/dev-plan.md`
