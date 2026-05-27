# UI Spec: user-guide-website

## Screen Coverage

| SCR-ID | UI Goal | Requirement |
| --- | --- | --- |
| SCR-001 | Docs home | REQ-UGW-001, REQ-UGW-004 |
| SCR-002 | Planning index | REQ-UGW-002 |
| SCR-003 | Command detail | REQ-UGW-002, REQ-UGW-003 |
| SCR-004 | Lifecycle/reference | REQ-UGW-002, REQ-UGW-006 |
| SCR-005 | Pipeline example | REQ-UGW-004, REQ-UGW-005 |

## Component Requirements

| Component | Requirement | Notes |
| --- | --- | --- |
| `DocsShell` | REQ-UGW-001 | Shared layout and navigation |
| `PageHeader` | REQ-UGW-001 | Consistent title/summary block |
| `PlanningCommandPage` | REQ-UGW-002 | Detailed command docs |
| `RuntimeTabs` | REQ-UGW-003 | Claude/Codex runtime comparison |
| Example route template | REQ-UGW-004 | Prompt and artifact evidence |

## Accessibility Notes

- Tabs must be usable without relying only on color.
- Link text must explain the destination.
- Tables must keep short headers and scannable cells.
