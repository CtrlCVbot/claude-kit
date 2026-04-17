# AI-Worker Workload Map

## 1. 문서 목적

이 문서는 `ai-worker`를 단순한 참고 사례가 아니라
이번 연구의 대표 workload로 놓고,
현재 문서 묶음을 Claude Team이 실행 가능한 workstream으로 재해석한다.

핵심 질문은 아래와 같다.

> `ai-worker` 문서는 이미 잘 정리되어 있다.
> 그렇다면 Claude Team은 어떤 단위로 읽고, 끊고, 넘기고, 검증해야 가장 수월한가?

## 2. 근거 문서

이번 재해석은 아래 문서를 기준으로 한다.

| 문서 | 이번 연구에서 읽는 역할 |
| --- | --- |
| `C:\Program Files (user)\ai-worker\docs\follow-up\00-program-index.md` | 프로그램 목적, phase 순서, 구현 원칙, 읽는 순서 |
| `C:\Program Files (user)\ai-worker\docs\07-phase-feature-packages.md` | phase별 package 설계, 병렬 가능 묶음, 권장 구현 순서 |
| `C:\Program Files (user)\ai-worker\docs\08-sprint-backlog-p0-p1.md` | 실제 sprint/ticket 수준 backlog, 선행 의존성, MVP 종료 기준 |
| `C:\Program Files (user)\ai-worker\docs\09-implementation-gap-report.md` | 현재 미구현 범위, 특히 multi-agent/subagent orchestration 부재 |

## 3. `ai-worker` workload를 workstream으로 다시 읽기

### Workstream map

| Workstream | 주요 질문 | 주요 source docs | 주 산출물 | 권장 target pipeline |
| --- | --- | --- | --- | --- |
| 기획 | 이번 phase에서 무엇을 끝내야 하는가 | `00-program-index`, `09-implementation-gap-report` | 목표, 범위, 제외 범위, 성공 기준 | `/plan-idea` -> `/plan-screen` -> `/plan-prd` |
| 설계 | package가 실제 개발 진입 가능한 contract인가 | `07-phase-feature-packages` | package spec, acceptance 관점, 병렬 가능 묶음 | `/plan-prd`, `/plan-wireframe`, `/plan-review` |
| 패키지 분해 | package를 sprint/ticket 수준으로 어떻게 쪼갤 것인가 | `07-phase-feature-packages`, `08-sprint-backlog-p0-p1` | ticket 묶음, 선행 관계, 실행 순서 | `/plan-stitch`, `/plan-bridge` |
| 구현 | 어느 package/ticket 묶음을 어떤 execution path로 태울 것인가 | `08-sprint-backlog-p0-p1` | feature slice, code change, tests | `/dev-feature`, `/dev-run`, `dev-architect` |
| 검증 | package 완료를 무엇으로 증명할 것인가 | `08-sprint-backlog-p0-p1`, `09-implementation-gap-report` | acceptance pack, verify report, review 결과 | `/dev-handoff-verify`, `dev-verify-agent` |
| 운영 회고 | 다음 package 진입 전에 무엇을 갱신해야 하는가 | `09-implementation-gap-report`, backlog 문서 | gap refresh, backlog sync, doc closure | `dev-doc-updater` + review/closure 규칙 |

## 4. `AIWorkerWorkItem` 카드로 본 실제 실행 단위

### Example 1. Program-level planning item

```yaml
AIWorkerWorkItem:
  workstream: "기획"
  source_docs:
    - "follow-up/00-program-index.md"
    - "09-implementation-gap-report.md"
  target_pipeline: "/plan-idea -> /plan-screen -> /plan-prd"
  done_signal: "이번 라운드의 phase/package 범위와 제외 범위가 문서로 고정된다"
  blocking_inputs:
    - "현재 구현 상태 요약"
    - "이번 라운드 우선순위"
```

### Example 2. Package design item

```yaml
AIWorkerWorkItem:
  workstream: "설계"
  source_docs:
    - "07-phase-feature-packages.md"
  target_pipeline: "/plan-prd -> /plan-review"
  done_signal: "P1-02 같은 package가 입력, 경계, acceptance 기준을 가진 개발 계약으로 정리된다"
  blocking_inputs:
    - "선행 package 완료 여부"
    - "phase 목표"
```

### Example 3. Ticket bundle decomposition item

```yaml
AIWorkerWorkItem:
  workstream: "패키지 분해"
  source_docs:
    - "08-sprint-backlog-p0-p1.md"
  target_pipeline: "/plan-stitch -> /plan-bridge"
  done_signal: "S2-T01 ~ S2-T06 같은 ticket 묶음이 구현 순서와 병렬 가능 단위를 가진 handoff bundle로 정리된다"
  blocking_inputs:
    - "package acceptance 기준"
    - "절대 선행 ticket"
```

### Example 4. Delivery item

```yaml
AIWorkerWorkItem:
  workstream: "구현"
  source_docs:
    - "08-sprint-backlog-p0-p1.md"
    - "07-phase-feature-packages.md"
  target_pipeline: "/dev-feature or /dev-run"
  done_signal: "코드, 테스트, 산출물, 변경 문서가 package 계약을 만족한다"
  blocking_inputs:
    - "bridge 문서"
    - "ownership 결정"
    - "검증 입력 번들"
```

### Example 5. Verification item

```yaml
AIWorkerWorkItem:
  workstream: "검증"
  source_docs:
    - "08-sprint-backlog-p0-p1.md"
    - "09-implementation-gap-report.md"
  target_pipeline: "/dev-handoff-verify"
  done_signal: "acceptance pack이 통과하고 미해결 risk가 명시된다"
  blocking_inputs:
    - "handoff bundle"
    - "테스트 결과"
    - "검증 초점"
```

## 5. `ai-worker`가 오케스트레이션을 요구하는 이유

### A. 문서는 이미 구조화돼 있지만, 실행 관점 계층이 많다

`ai-worker`는 이미 아래처럼 잘 정리되어 있다.

- Program index
- Phase별 feature packages
- Sprint backlog
- Gap report

문제는 이 구조가 오히려 실행 시 여러 handoff를 만든다는 점이다.

```text
Program 목표
  -> Phase 목표
  -> Package 계약
  -> Sprint ticket 묶음
  -> 코드 구현
  -> acceptance / verify
  -> gap refresh
```

단일 작업 흐름에는 강한 파이프라인도
이렇게 계층이 여러 개인 workload에서는
"어디서 누구에게 넘길지"가 없으면 운영자가 계속 직접 붙어야 한다.

### B. 병렬화 포인트가 문서에 이미 드러나 있다

`07-phase-feature-packages.md`는 아래 병렬 포인트를 명시한다.

- `P1-01`과 `P1-03`은 `P1-02` 인터페이스가 고정되면 병렬 진행 가능
- `P2-01`과 `P2-02`는 `P1-04` 이후 병렬 진행 가능
- `P3-01`과 `P3-03`은 확장 검토 단계에서 병렬 분석 가능

`08-sprint-backlog-p0-p1.md`는 아래 ticket 병렬 포인트를 준다.

- `S1-T03`과 `S1-T04`는 `S1-T02` 이후 병렬 가능
- `S3-T02`와 `S3-T03`은 `S3-T01` 이후 병렬 가능
- `S4-T02`와 `S4-T03`은 `S4-T01` 이후 병렬 가능

즉, 오케스트레이션은 "있으면 좋은 부가 기능"이 아니라
문서 구조 자체가 이미 요구하는 운영 기능이다.

### C. Gap report가 orchestration 부재를 직접 지적한다

`09-implementation-gap-report.md`는
`multi-agent / subagent orchestration`이 미구현이라고 명시한다.

이번 비교 연구는 이 지점을 바로 메우기 위한 문서다.
단, 이번 라운드에서는 orchestration 코드를 구현하지 않고
어떤 운영 모델과 최소 추가 자산이 가장 맞는지만 결정한다.

## 6. Handoff가 특히 어려운 지점

| Handoff 구간 | 왜 어려운가 | 지금 필요한 보강 |
| --- | --- | --- |
| Program goal -> Package selection | phase 범위는 넓고 package는 구체적이다 | package selection 기준이 필요하다 |
| Package spec -> Sprint ticket bundle | 문서에는 ticket가 많지만 구현 묶음은 상황마다 다르다 | bundle 규칙과 ownership 지정이 필요하다 |
| Plan output -> Delivery start | `/plan-bridge`는 있으나 전달 세트가 사람마다 달라질 수 있다 | handoff bundle 표준이 필요하다 |
| Delivery -> Verification | `/dev-handoff-verify`는 강하지만 입력 품질 편차가 날 수 있다 | verify focus와 evidence 세트 고정이 필요하다 |
| Verification -> Backlog refresh | 완료와 미완료가 다시 문서로 반영돼야 한다 | doc sync trigger가 필요하다 |

## 7. 이번 비교에서 오케스트레이션이 반드시 해결해야 할 것

세 옵션 모두 아래 질문에 답해야 한다.

1. `ai-worker` 문서를 어떤 실행 단위로 자를 것인가
2. planning, delivery, verification 책임자를 어떻게 둘 것인가
3. package와 ticket handoff를 어떤 세트로 넘길 것인가
4. 병렬화 가능한 묶음을 어디서 판단할 것인가
5. verify 실패 후 backlog와 gap report를 어떻게 갱신할 것인가

이 질문에 대한 답이 가장 균형 잡힌 안이
이번 연구의 추천안이 된다.
