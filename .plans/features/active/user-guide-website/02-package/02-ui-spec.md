# UI Spec: user-guide-website

## 화면 커버리지

| SCR-ID | UI 목표 | 요구사항 |
| --- | --- | --- |
| `SCR-001` | Docs home | `REQ-UGW-001`, `REQ-UGW-004` |
| `SCR-002` | Planning index | `REQ-UGW-002` |
| `SCR-003` | Command detail | `REQ-UGW-002`, `REQ-UGW-003` |
| `SCR-004` | Lifecycle/reference | `REQ-UGW-002`, `REQ-UGW-006` |
| `SCR-005` | Pipeline example | `REQ-UGW-004`, `REQ-UGW-005` |

## 컴포넌트 요구사항

| Component | 요구사항 | 메모 |
| --- | --- | --- |
| `DocsShell` | `REQ-UGW-001` | 공통 layout과 navigation |
| `PageHeader` | `REQ-UGW-001` | 일관된 title/summary block |
| `PlanningCommandPage` | `REQ-UGW-002` | 상세 command docs |
| `RuntimeTabs` | `REQ-UGW-003` | Claude/Codex runtime comparison |
| Example route template | `REQ-UGW-004` | Prompt와 artifact evidence |

## 접근성 메모

- 탭은 색상에만 의존하지 않아야 한다.
- 링크 텍스트는 이동 목적을 알 수 있어야 한다.
- 표는 짧은 header와 읽기 쉬운 cell을 유지한다.
