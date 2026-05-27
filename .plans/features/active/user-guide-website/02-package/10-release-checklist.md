# Release Checklist: user-guide-website

| 점검 | 상태 | 증거 |
| --- | --- | --- |
| `.plans` package 존재 | done | `.plans/features/active/user-guide-website/02-package/**` |
| PRD 승인 | done | `.plans/prd/10-approved/user-guide-website-prd.md` |
| Wireframe 매핑 | done | `.plans/wireframes/user-guide-website/**` |
| Stitch checkpoint 기록 | done | `.plans/stitch/user-guide-website/**` |
| Build 통과 | done | `pnpm docs:build` 통과, 24 static routes generated |
| Protected path diff clear | done | protected path 대상 `git diff --name-only` 결과 없음 |
| Review 완료 | done | `.plans/features/active/user-guide-website/04-review/01-self-review.md` |
| Production deployment | not-in-scope | 이번 범위는 preview/handoff까지 |
