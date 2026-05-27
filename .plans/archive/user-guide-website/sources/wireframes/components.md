# Component Spec: user-guide-website

| Component | 유형 | 상태 | 동작 | 요구사항 |
| --- | --- | --- | --- | --- |
| `DocsShell` | Layout | default/mobile | header, sidebar, content 영역 제공 | `REQ-UGW-001` |
| `PageHeader` | Header | default | title, summary, metadata 표시 | `REQ-UGW-001` |
| `InfoGrid` | Content grid | default | card와 비교 정보를 표시 | `REQ-UGW-002` |
| `PlanningCommandPage` | Page template | default | command 상세와 artifact table 렌더링 | `REQ-UGW-002` |
| `RuntimeTabs` | Tab UI | Claude/Codex active | runtime별 내용을 전환 | `REQ-UGW-003` |
| Example content model | Static data | default | pipeline example을 렌더링 | `REQ-UGW-004` |

## 반응형 요구사항

| Viewport | 동작 |
| --- | --- |
| Desktop | sidebar와 content를 함께 표시 |
| Tablet | sidebar가 content 위로 쌓일 수 있음 |
| Mobile | navigation과 tab 내용이 overflow 없이 읽힘 |
