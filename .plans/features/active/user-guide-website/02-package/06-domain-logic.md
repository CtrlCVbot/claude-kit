# Domain Logic: user-guide-website

## Domain Concepts

| Concept | Meaning |
| --- | --- |
| Docs route | A user-facing page in the Next.js docs site |
| Planning command page | A route explaining one `claude-kit` planning command |
| Runtime comparison | Claude/Codex-specific explanation shown in tabs or matrices |
| Pipeline evidence | Prompt, artifact, verification, and review record proving the work followed the pipeline |

## Rules

| Rule | Requirement |
| --- | --- |
| Content source rule | Planning pages should be traceable to `docs/user-guide-html/**` and `.plans/**` |
| Runtime rule | Do not imply Codex supports Claude slash commands directly |
| Pipeline rule | Do not claim a stage was executed unless its artifact exists |
| Safety rule | Do not modify protected core paths for website-only work |
