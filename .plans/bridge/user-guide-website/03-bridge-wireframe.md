# Bridge Wireframe: user-guide-website

## Source

- PRD: `.plans/prd/10-approved/user-guide-website-prd.md`
- Wireframes: `.plans/wireframes/user-guide-website/`
- Stitch mapping: `.plans/stitch/user-guide-website/mapping.md`

## Screen to Implementation Mapping

| SCR-ID | Implementation target |
| --- | --- |
| SCR-001 | `src/app/page.tsx`, `src/components/docs/DocsShell.tsx` |
| SCR-002 | `src/app/planning/page.tsx`, `src/lib/docs/navigation.ts` |
| SCR-003 | `src/app/planning/[slug]/page.tsx`, `src/components/docs/PlanningCommandPage.tsx`, `src/components/docs/RuntimeTabs.tsx` |
| SCR-004 | `src/app/planning/lifecycle/page.tsx`, `src/app/planning/reference/page.tsx` |
| SCR-005 | `src/app/examples/[slug]/page.tsx`, `src/lib/docs/examples.ts` |
