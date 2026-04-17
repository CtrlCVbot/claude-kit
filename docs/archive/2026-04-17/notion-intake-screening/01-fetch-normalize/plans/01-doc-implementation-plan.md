# Documentation Implementation Plan

이 문서는 `01-fetch-normalize/` 패키지 자체를 어떤 순서로 작성하고 검토할지 정리한다. 기능 구현 순서가 아니라 문서 작성 순서다.

## Recommended Writing Order

1. `00-index.md`
2. `01-stage-spec.md`
3. `assets/06-template-spec.md`
4. `assets/02-agent-spec.md`
5. `assets/03-subagent-spec.md`
6. `assets/01-skill-spec.md`
7. `assets/04-hook-spec.md`
8. `assets/05-rule-spec.md`
9. `assets/07-command-integration.md`
10. `plans/02-review-checklist.md`

## Why This Order

### Stage 먼저

`01-stage-spec.md`가 먼저 고정되어야 나머지 자산 문서가 중복 없이 역할을 나눌 수 있다.

### Template 그다음

산출물 계약이 먼저 정리되어야 agent, sub-agent, command 문서가 같은 파일 구조를 기준으로 이야기할 수 있다.

### Agent/Sub-Agent 중간

실제 orchestration을 누가 소유하는지 정한 뒤에 skill, hook, rule 문서를 쓰는 편이 자연스럽다.

### Hook/Rule 후반

guard와 invariant는 stage와 agent 경계가 먼저 정리되어야 과도한 책임을 가져가지 않는다.

### Command는 마지막

command는 stage와 asset이 모두 정리된 뒤에야 입출력 연결을 안정적으로 문서화할 수 있다.

## Dependency Map

| 문서 | 선행 문서 |
|---|---|
| `01-stage-spec.md` | 없음 |
| `02-data-flow-and-decisions.md` | `01-stage-spec.md` |
| `assets/06-template-spec.md` | `01-stage-spec.md` |
| `assets/02-agent-spec.md` | `01-stage-spec.md`, `assets/06-template-spec.md` |
| `assets/03-subagent-spec.md` | `assets/02-agent-spec.md` |
| `assets/01-skill-spec.md` | `01-stage-spec.md`, `02-data-flow-and-decisions.md` |
| `assets/04-hook-spec.md` | `01-stage-spec.md`, `assets/06-template-spec.md` |
| `assets/05-rule-spec.md` | `01-stage-spec.md` |
| `assets/07-command-integration.md` | `assets/02-agent-spec.md`, `assets/01-skill-spec.md` |
| `plans/02-review-checklist.md` | 전체 |

## Completion Criteria

- `05-fetch-normalize.md`가 브리지 문서로 축소되어 있다.
- `01-fetch-normalize/` 폴더 안에서만 `Fetch/Normalize`의 구현 준비 문서를 읽을 수 있다.
- implementer가 stage, asset, template, command 경계를 문서만 보고 이해할 수 있다.
- 다음 단계 문서가 아직 없어도 `Fetch/Normalize`의 handoff 형태가 보인다.
