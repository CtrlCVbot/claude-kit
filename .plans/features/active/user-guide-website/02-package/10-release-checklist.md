# Release Checklist: user-guide-website

| Check | Status | Evidence |
| --- | --- | --- |
| `.plans` package exists | done | `.plans/features/active/user-guide-website/02-package/**` |
| PRD approved | done | `.plans/prd/10-approved/user-guide-website-prd.md` |
| Wireframes mapped | done | `.plans/wireframes/user-guide-website/**` |
| Stitch checkpoint recorded | done | `.plans/stitch/user-guide-website/**` |
| Build passes | done | `pnpm docs:build` passed; 24 static routes generated |
| Protected path diff clear | done | `git diff --name-only -- protected paths` returned no files |
| Review completed | done | `.plans/features/active/user-guide-website/04-review/01-self-review.md` |
| Production deployment | not-in-scope | Preview/handoff only |
