# /dev-run

Feature Package의 TASK를 TDD 기반으로 구현한다. 구현 범위와 파일 경로는 기능 구조 바인딩 안에서만 허용된다.

> 참조: `.claude/skills/dev-workflow/SKILL.md`

## Usage

```bash
/dev-run .plans/features/active/{slug}
/dev-run .plans/features/active/{slug} --story S-HEADER-01  # copy 도메인에서 넘어온 Story ID 지정
/dev-run .plans/features/active/{slug} --inline             # 메인 세션 직접 구현 (하위호환 플래그)
```

### Flags

| 플래그 | 기본값 | 설명 |
|--------|--------|------|
| `--story {ID}` | 없음 | copy 도메인에서 넘어온 Story ID 필터 |
| `--inline` | off | 메인 세션이 직접 구현. 기본값(off)은 `dev-implementer` 에이전트 위임 (IMP-AGENT-005). 과거 동작 호환 목적. |

## Preconditions

- `02-package/08-dev-tasks.md`가 준비되어 있다.
- `.plans/project/00-dev-architecture.md`가 존재한다.
- `.plans/features/active/{slug}/00-context/06-architecture-binding.md`가 존재한다.

## Workflow

### Phase D1: Task Resolution

1. Feature Package, 구조 SSOT, 기능 바인딩을 함께 읽는다.
   - `--story S-{AREA}-{NN}` 옵션이 있으면 copy 도메인의 해당 Story 범위로 TASK 필터링
   - `07-routing-metadata.md`가 있으면 시나리오/Feature 유형을 인식하여 copy Feature 맥락 반영
2. 다음 실행 가능한 TASK를 고른다.
3. REQ, DEC, TC, target path를 묶은 Task Context Bundle을 만든다.

### Phase D2: TDD Implementation

4. **디스패치 결정 (IMP-AGENT-005)**:
   - `--inline` 플래그 없으면 각 TASK를 `dev-implementer` 에이전트에 위임 (기본)
   - `--inline` 플래그 있으면 메인 세션이 직접 구현 (과거 동작)
   - `handoff-contract.json` 존재 시 `constraints.file_scope` 와 `task_ids` 를 에이전트 프롬프트에 포함
5. 테스트를 먼저 작성해 Red를 확인한다.
6. 바인딩된 경로 안에서 최소 구현으로 Green을 만든다.
7. 구조 계약을 지키는 선에서 리팩터링한다.
8. **Read 캐시 재인증**: 에이전트 위임 모드에서 TASK 완료 후 메인 세션이 같은 파일을 Edit하려면 Read 재호출 필요 (verification.md "Agent Edit Race" 룰).

### Phase D3: Quality Gate

9. Scope Guard 통과 여부를 확인한다.
10. TDD Guard, typecheck, lint, traceability를 확인한다.
11. TASK 상태와 생성 파일 목록을 갱신한다.
12. 모든 TASK가 끝나면 `03-dev-notes/dev-output-summary.md`를 만들고 `/dev-verify`로 넘긴다.

## Rules

- 테스트 없이 구현 파일만 먼저 만들지 않는다.
- 기능 바인딩에 없는 경로는 수정하지 않는다.
- 공유 코드가 필요하면 먼저 구조 SSOT와 기능 바인딩에 맞는 위치인지 확인한다.
- 구조 충돌이 생기면 구현보다 문서 결정 정리가 우선이다.
