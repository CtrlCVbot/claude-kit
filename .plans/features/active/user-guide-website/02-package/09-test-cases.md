# Test Cases: user-guide-website

| TC-ID | REQ | Test / Verification | Expected Result |
| --- | --- | --- | --- |
| TC-UGW-001 | REQ-UGW-001 | Open `/` and `/planning` | Shared docs shell renders |
| TC-UGW-002 | REQ-UGW-002 | Route smoke planning pages | Command, lifecycle, and reference pages render |
| TC-UGW-003 | REQ-UGW-003 | Review runtime tab UI | Claude/Codex tabs are visible and meaningful |
| TC-UGW-004 | REQ-UGW-004 | Open `/examples/*` routes | Pipeline example content renders |
| TC-UGW-005 | REQ-UGW-005 | Run `pnpm docs:build` and protected path diff | Build passes and no protected path edits |
| TC-UGW-006 | REQ-UGW-006 | Review handoff docs | Follow-up targets are explicit |
