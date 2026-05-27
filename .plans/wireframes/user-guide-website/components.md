# Component Spec: user-guide-website

| Component | Type | State | Behavior | Requirement |
| --- | --- | --- | --- | --- |
| `DocsShell` | Layout | default/mobile | Provides header, sidebar, content region | REQ-UGW-001 |
| `PageHeader` | Header | default | Shows title, summary, metadata | REQ-UGW-001 |
| `InfoGrid` | Content grid | default | Displays cards and comparisons | REQ-UGW-002 |
| `PlanningCommandPage` | Page template | default | Renders command details and artifact tables | REQ-UGW-002 |
| `RuntimeTabs` | Tab UI | Claude/Codex active | Switches runtime-specific content | REQ-UGW-003 |
| Example content model | Static data | default | Renders pipeline examples | REQ-UGW-004 |

## Responsive Requirements

| Viewport | Behavior |
| --- | --- |
| Desktop | Sidebar and content are visible together |
| Tablet | Sidebar can stack above content |
| Mobile | Navigation remains readable and tabs do not overflow |
