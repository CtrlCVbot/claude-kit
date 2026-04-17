# /dev-verify

Feature Package와 실제 구현이 요구사항, 테스트, 구조 계약을 모두 만족하는지 검증한다.

## Usage

```bash
/dev-verify .plans/features/active/{slug}
```

## Inputs

- Feature Package 루트
- `.plans/project/00-dev-architecture.md`
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`

## Workflow

1. Requirements, Tasks, Test Cases, Decision Log를 읽는다.
2. 구현된 파일과 테스트 파일을 수집한다.
3. 아래 DVC를 수행한다.

## DVC Items

| ID | Check | Severity |
|---|---|---|
| DVC-01 | REQ Coverage: 모든 REQ가 구현에 반영되었는가 | FLAG |
| DVC-02 | TC Coverage: 모든 TC가 테스트로 존재하는가 | FLAG |
| DVC-03 | TASK Completion: 모든 TASK가 `done` 상태인가 | ERROR |
| DVC-04 | Architecture Compliance: 구현이 구조 SSOT와 기능 바인딩을 따르는가 | ERROR |
| DVC-05 | Edge Case Discovery: 개발 중 발견된 엣지 케이스가 문서나 테스트에 반영되었는가 | WARN |
| DVC-06 | Scope Alignment: 바인딩 밖 경로 변경이나 범위 이탈이 없는가 | FLAG |

## Output

- `03-dev-notes/dev-verification-report.md`
- DVC-01 ~ DVC-06 결과
- REQ, TASK, TC 커버리지 요약
- 필요 시 Back-Propagation 제안

## Rules

- 구조 SSOT나 기능 바인딩이 없으면 검증을 시작하지 않는다.
- DVC-04, DVC-06은 추상 패턴 점검이 아니라 실제 경로와 레이어 계약 준수 여부를 본다.
- ERROR가 있으면 `/dev-commit`으로 넘어가지 않는다.
