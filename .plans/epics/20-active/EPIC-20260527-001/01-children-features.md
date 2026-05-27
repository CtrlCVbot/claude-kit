# Children Features: EPIC-20260527-001

## Feature Map

| ID | Feature | Purpose | Depends on | Pipeline handling |
| --- | --- | --- | --- | --- |
| F1 | `docs-shell` | Layout, navigation, shared docs shell | none | Full planning inside parent package |
| F2 | `planning-content-migration` | Convert planning pages and command detail pages | F1 | Full planning inside parent package |
| F3 | `runtime-tabs-and-matrices` | Claude/Codex tabbed views and matrices | F1, F2 | Included as interaction requirement |
| F4 | `pipeline-example-pages` | Explain this website build as a pipeline example | F1, F2 | Included as content requirement |
| F5 | `vercel-preview-safety` | Build and preview safety | F1-F4 | Verification and release checklist |
| F6 | `guide-sync` | Future sync to `docs/guide`, `docs/meta-tooling`, README | F1-F5 | Follow-up handoff |

## Dependency Matrix

| Feature | F1 | F2 | F3 | F4 | F5 | F6 |
| --- | --- | --- | --- | --- | --- | --- |
| F1 `docs-shell` | - | before | before | before | before | before |
| F2 `planning-content-migration` | after | - | before | before | before | before |
| F3 `runtime-tabs-and-matrices` | after | after | - | parallel | before | before |
| F4 `pipeline-example-pages` | after | after | parallel | - | before | before |
| F5 `vercel-preview-safety` | after | after | after | after | - | before |
| F6 `guide-sync` | after | after | after | after | after | - |

## Feature Idea Briefs

### F1 `docs-shell`

- **Problem**: Static HTML pages are hard to navigate and extend.
- **User value**: Users get a stable landing, sidebar, and page layout.
- **Scope**: Next.js app shell, navigation model, base styling.
- **Risk**: Could become a product landing page instead of docs.
- **Decision**: Full planning inside parent package.

### F2 `planning-content-migration`

- **Problem**: Planning pages exist but are not deeply structured as a navigable docs site.
- **User value**: Each command page can explain inputs, artifacts, and locations.
- **Scope**: Planning index and command detail pages.
- **Risk**: Content loss during migration.
- **Decision**: Full planning inside parent package.

### F3 `runtime-tabs-and-matrices`

- **Problem**: Claude and Codex behavior can be confused.
- **User value**: Runtime differences are visible without duplicating pages.
- **Scope**: Tab component, matrices, capability tables.
- **Risk**: Tabs could hide important limitations.
- **Decision**: Treat as interaction requirement.

### F4 `pipeline-example-pages`

- **Problem**: Users need to see the pipeline in action, not only read command references.
- **User value**: The website build becomes a concrete example.
- **Scope**: Example pages and pipeline artifact explanation.
- **Risk**: If the pipeline log is weak, example pages become misleading.
- **Decision**: Require execution log evidence.

### F5 `vercel-preview-safety`

- **Problem**: Adding Next.js can change package/build assumptions.
- **User value**: Preview is safe and reversible.
- **Scope**: Build, route smoke, protected path diff, preview handoff.
- **Risk**: Production deployment too early.
- **Decision**: Preview-only in this stage.

### F6 `guide-sync`

- **Problem**: Once the website exists, source guide docs may drift.
- **User value**: Follow-up docs remain aligned.
- **Scope**: Handoff list only.
- **Risk**: Scope creep into unrelated docs.
- **Decision**: Follow-up handoff, not implementation in this run.
