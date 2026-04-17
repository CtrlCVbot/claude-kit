# Option B Session Modes And Handoffs

## Purpose

이 문서는 Option B의 운영 프로토콜을 설명한다.
핵심 질문은 아래다.

> 언제 한 세션으로 끝내고, 언제 handoff를 만들며, 언제 병렬 격리를 써야 하는가?

## Audience

- Option B의 운영 흐름을 설계할 구현자
- `Session-Bootstrap Skill`과 handoff bundle 규격을 설계할 사람
- package별로 어떤 mode를 써야 할지 판단해야 하는 리드 구현자

## Read After

- [00-overview.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/00-overview.md)

## Read Next

- [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md)

## Mode Comparison

| Mode | 기본 질문 | 언제 적합한가 | 주 리스크 | 핵심 대응 |
| --- | --- | --- | --- | --- |
| `Compact Mode` | 한 세션 안에서 planning, delivery, verification 흐름을 가볍게 이어갈 수 있는가 | package가 작고 handoff가 짧을 때 | 문맥 과밀, 운영자 즉흥 판단 | 최소 bundle 체크리스트만 유지 |
| `Handoff Mode` | stage 사이에 명시적인 문서 인계가 필요한가 | package 경계가 분명하고 검증 초점을 고정해야 할 때 | handoff 누락, 세션 전환 피로 | handoff bundle + bootstrap 자산 |
| `Isolated Parallel Mode` | 병렬화 이득이 충돌 비용보다 큰가 | ownership이 분리되고 인터페이스가 고정됐을 때 | 파일 덮어쓰기, coordination 증가 | ownership + worktree 또는 디렉터리 격리 |

## Session Boundary Policy

`Session Boundary Policy`는 아래 4가지 질문으로 결정한다.

| 질문 | `Yes`면 시사하는 것 |
| --- | --- |
| package 내부 ticket 수가 많아 handoff 없이 맥락 유지가 어려운가 | `Handoff Mode` 쪽으로 기운다 |
| verify에 넘길 acceptance focus가 따로 필요한가 | `Handoff Mode` 이상이 유리하다 |
| 병렬 처리 후보가 있고 write scope를 분리할 수 있는가 | `Isolated Parallel Mode`를 검토한다 |
| package가 아주 작고 risk가 낮은가 | `Compact Mode`로 충분할 수 있다 |

### 기본 정책

Option B의 기본 모드는 `Handoff Mode`가 아니다.
기본은 아래처럼 읽는다.

1. 먼저 `Compact Mode` 가능성을 본다.
2. handoff 품질이 중요하면 `Handoff Mode`로 올린다.
3. 병렬 처리 이득이 크면 `Isolated Parallel Mode`를 올린다.

즉, mode는 점점 무거워지는 방향으로 선택한다.

## Operator Flow

### Compact Mode

```text
Operator Session
  -> package 선택
  -> planning 정리
  -> delivery 실행
  -> verify 입력 정리
  -> verification
```

이 mode에서는 세션을 꼭 나눌 필요는 없지만,
아래 최소 bundle 메모는 남기는 것이 좋다.

- source docs
- selected scope
- done signal
- verification focus

### Handoff Mode

```text
Operator Session
  -> Planning stage 정리
  -> Handoff Bundle 생성
  -> Session-Bootstrap Skill로 Delivery stage 오픈
  -> Delivery 결과를 Verify bundle로 재정리
  -> Verification stage 오픈
```

이 mode의 핵심은 "세션을 나눈다"보다
"세션 경계를 bundle로 설명한다"에 있다.

### Isolated Parallel Mode

```text
Operator Session
  -> package / ticket bundle 분해
  -> file ownership 또는 isolation 단위 정의
  -> 병렬 delivery 실행
  -> 결과 집계
  -> verification bundle 통합
```

이 mode는 가장 무겁기 때문에
아래가 선행되지 않으면 쓰지 않는다.

- ownership이 문서로 명확하다
- 공통 인터페이스가 충분히 고정됐다
- 충돌 시 re-entry 경로가 있다

## Handoff Bundle Lifecycle

### Bundle이 담아야 하는 최소 항목

| 항목 | 목적 |
| --- | --- |
| `source_docs` | 근거 문서 추적 |
| `selected_scope` | 이번 라운드 범위 고정 |
| `out_of_scope` | 번들 경계 명시 |
| `done_signal` | 완료 조건 통일 |
| `blocking_inputs` | 선행 조건 노출 |
| `verification_focus` | verify가 특히 볼 것 고정 |
| `evidence_expectation` | 테스트/로그/산출물 기대치 고정 |

이 7개 항목은 기존 `.claude/handoff.md` 구조를 확장한다. 별도 번들 파일을 생성하지 않는다.

### Lifecycle

1. planning 결과를 bundle 초안으로 만든다.
2. `/plan-bridge` 직전 또는 직후에 delivery용 bundle을 고정한다.
3. delivery 종료 시 verify 관점으로 bundle을 한 번 더 갱신한다.
4. `/dev-handoff-verify`는 먼저 번들 완전성을 확인하고 (내장 Step 0), 이후 검증을 실행한다.
5. 결과가 통과면 closure 메모를, 실패면 re-entry 메모를 남긴다.

### 문서화 시 권장 파일 표현

이 문서군은 실제 파일 경로를 강제하지는 않지만,
후속 구현 문서에서는 아래 패턴 중 하나를 고정하는 것을 권장한다.

- `docs/team-orchestration/bundles/<package-id>-planning.md`
- `docs/team-orchestration/bundles/<package-id>-delivery.md`
- `docs/team-orchestration/bundles/<package-id>-verify.md`

핵심은 경로 자체보다
stage별 bundle이 추적 가능하게 남는 점이다.

## Parallel Isolation

`Isolated Parallel Mode`에서는 아래 세 가지가 같이 가야 한다.

| 항목 | 설명 |
| --- | --- |
| `File Ownership` | 어떤 bundle이 어떤 파일/모듈을 주로 소유하는지 정한다 |
| `Isolation Strategy` | `worktree` 또는 디렉터리 파티셔닝 중 하나를 택한다 |
| `Merge Point` | 병렬 결과를 언제 어떤 bundle로 다시 합칠지 정한다 |

### 선택 기준

| 상황 | 권장 전략 |
| --- | --- |
| 파일 경계가 뚜렷하고 구조가 이미 나뉘어 있음 | 디렉터리 파티셔닝 |
| 같은 영역을 건드릴 가능성이 있고 독립 검증이 필요함 | worktree 격리 |
| 인터페이스가 아직 흔들림 | 병렬화하지 않고 `Handoff Mode` 유지 |

## Failure And Re-entry

옵션 B의 failure 처리는 다시 같은 mode로 돌아간다는 뜻이 아니다.
re-entry는 아래 질문으로 결정한다.

| 실패 유형 | 권장 re-entry |
| --- | --- |
| scope 모호성 | planning 단계로 복귀 |
| 구현 누락/회귀 | delivery 단계 재진입 |
| verify 입력 누락 | bundle 갱신 후 verification 재실행 |
| 병렬 충돌 | isolation 재설계 후 delivery 재시작 |

### 기본 원칙

- 검증 실패는 곧바로 blame이 아니라 mode 또는 bundle 품질 문제인지 먼저 본다.
- 병렬 충돌이 한 번 나면 다음 라운드에서는 ownership 문서를 먼저 보강한다.
- re-entry 후에는 bundle도 같이 갱신해야 한다.

## Practical Default

구현자가 아무 정보 없이 시작한다면 기본값은 아래다.

1. 작은 package는 `Compact Mode`
2. 구조 중심 package는 `Handoff Mode`
3. 인터페이스가 고정된 UI/코어 분리는 `Isolated Parallel Mode` 후보

`ai-worker` 기준으로 보면:

- `P0-01`은 보통 `Compact Mode`
- `P1-02`는 보통 `Handoff Mode`
- `P1-01`과 `P1-03`은 `P1-02` 이후 `Isolated Parallel Mode` 후보다
