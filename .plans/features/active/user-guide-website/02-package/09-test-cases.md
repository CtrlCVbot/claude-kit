# Test Cases: user-guide-website

| TC-ID | REQ | 검증 | 기대 결과 |
| --- | --- | --- | --- |
| `TC-UGW-001` | `REQ-UGW-001` | `/`, `/planning` 열기 | shared docs shell이 렌더링된다. |
| `TC-UGW-002` | `REQ-UGW-002` | planning pages route smoke | command, lifecycle, reference pages가 렌더링된다. |
| `TC-UGW-003` | `REQ-UGW-003` | runtime tab UI review | Claude/Codex tab이 보이고 의미가 명확하다. |
| `TC-UGW-004` | `REQ-UGW-004` | `/examples/*` routes 열기 | pipeline example content가 렌더링된다. |
| `TC-UGW-005` | `REQ-UGW-005` | `pnpm docs:build`와 protected path diff | build가 통과하고 protected path 변경이 없다. |
| `TC-UGW-006` | `REQ-UGW-006` | handoff docs review | 후속 대상이 명확하다. |
