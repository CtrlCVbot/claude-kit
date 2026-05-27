# Navigation Flow: user-guide-website

```mermaid
flowchart TD
  A["Home /"] --> B["Planning /planning"]
  B --> C["Command detail /planning/[slug]"]
  B --> D["Lifecycle /planning/lifecycle"]
  B --> E["Reference /planning/reference"]
  A --> F["Examples /examples/[slug]"]
  C --> F
  D --> E
```

## Navigation Rules

| Rule | Detail |
| --- | --- |
| Home is the entry point | It must explain what the website is and what it is not |
| Planning index is the command map | It routes users into specific command pages |
| Command pages are detailed | They explain agents, skills, hooks, rules, artifacts, and runtime tabs |
| Examples are evidence-backed | They link to `.plans` and `docs/plans` artifacts |
