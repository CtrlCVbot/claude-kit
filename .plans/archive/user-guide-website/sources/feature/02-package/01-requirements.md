# Requirements: user-guide-website

이 파일은 Feature Package의 요구사항 SSOT다.

| REQ-ID | 우선순위 | 요구사항 | 수용 기준 |
| --- | --- | --- | --- |
| `REQ-UGW-001` | Must | home, navigation, 일관된 page layout을 가진 docs shell 제공 | `/`와 `/planning`이 shared docs shell로 렌더링된다. |
| `REQ-UGW-002` | Must | planning guide content를 route-backed docs page로 전환 | planning index, command pages, lifecycle, reference routes가 존재한다. |
| `REQ-UGW-003` | Must | Claude/Codex 차이를 tab 또는 matrix로 표시 | runtime comparison UI가 명확하고 접근 가능하다. |
| `REQ-UGW-004` | Must | 이번 재시작 기반 pipeline example page 추가 | example routes가 prompt/runbook/execution artifacts를 참조한다. |
| `REQ-UGW-005` | Must | build와 protected path verification 제공 | build가 통과하고 protected path diff가 기록된다. |
| `REQ-UGW-006` | Should | guide/meta-tooling 후속 sync target 기록 | handoff 문서에 후속 업데이트 대상이 명시된다. |
