# Claude Team Orchestration Current Capability Map

## 1. 문서 목적

이 문서는 `claude-kit`에 이미 구현되어 있는 기획/개발/검증 자산을
`ai-worker` workload 기준으로 다시 읽기 위한 현재 능력 지도다.

이번 연구의 질문은 이론적으로 "좋은 오케스트레이션이 무엇인가"가 아니다.
질문은 더 실전적이다.

> 이미 있는 `plan pipeline`, `dev workflow`, 에이전트, 훅, 룰을 어떻게 조합하면
> `ai-worker` 작업을 가장 수월하게 밀 수 있는 Claude Team 구성이 되는가?

따라서 이 문서는 새 시스템 설계보다 현재 재사용 가능한 자산을 먼저 정리한다.

## 2. 읽는 순서

1. 이 문서에서 현재 자산을 파악한다.
2. [01-ai-worker-workload-map.md](./01-ai-worker-workload-map.md)에서 `ai-worker` workload를 본다.
3. [02-option-a-reuse-first.md](./02-option-a-reuse-first.md) ~ [04-option-c-control-tower.md](./04-option-c-control-tower.md)에서 세 가지 운영안을 비교한다.
4. [05-comparison-matrix.md](./05-comparison-matrix.md)에서 선택 근거를 확인한다.
5. [06-recommended-operating-model.md](./06-recommended-operating-model.md)과 [07-additions-backlog.md](./07-additions-backlog.md)로 다음 단계를 정한다.

## 3. 이번 연구에서 보는 자산 범위

이번 비교 연구는 아래 자산군을 "현재 이미 있는 운영 자산"으로 간주한다.

| 그룹 | 현재 자산 | 이번 연구에서 보는 역할 |
| --- | --- | --- |
| Planning backbone | `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-wireframe-designer`, `plan-stitch-integrator`, `plan-reviewer`, `/plan-idea`, `/plan-screen`, `/plan-draft`, `/plan-prd`, `/plan-wireframe`, `/plan-stitch`, `/plan-review`, `/plan-bridge` | 아이디어 정리, 문서 구체화, 기획 검토, 개발 진입 전 handoff 준비 |
| Delivery backbone | `/dev-feature`, `/dev-run`, `dev-architect` | 기능 구현 진입, 작업 실행, 구조 결정 |
| Verification backbone | `/dev-handoff-verify`, `dev-verify-agent`, `dev-code-reviewer`, `dev-security-reviewer` | fresh-context 검증, 코드 리뷰, 보안 검토 |
| Guardrails | `plan-doc-guard`, `dev-tdd-guard`, `dev-db-guard`, core rules `verification`, `security`, `interaction` | 작업 도중 품질 기준과 차단 규칙 제공 |
| Closure/Operations | `dev-doc-updater`, `/dev-commit-push-pr`, 관련 훅과 상호작용 규칙 | 문서 동기화, 마감, 운영자 피드백 루프 |

## 4. Lifecycle 기준 재분류

### Planning

| 자산 | 강점 | `ai-worker`에 바로 쓸 수 있는 방식 | 현재 한계 |
| --- | --- | --- | --- |
| `plan-idea-collector` / `plan-idea-screener` | 요구를 넓게 받고 좁히는 흐름이 이미 있다 | `ai-worker`의 phase 목표와 package 후보를 정리할 때 사용 가능 | package와 sprint ticket 단위로 바로 떨어지지는 않는다 |
| `plan-prd-writer` | 범위, 사용자 가치, 성공 기준 정리가 강하다 | `P0-01`, `P1-02` 같은 package를 실제 feature contract로 정리할 때 유용 | `phase -> package -> task` 계층을 그대로 이해하지는 못한다 |
| `plan-wireframe-designer` | UI/흐름 설명을 보강한다 | `Run Editor MVP`, `Console Observability UI`처럼 화면형 package에 적합 | 비-UI 패키지에는 과하게 느껴질 수 있다 |
| `plan-stitch-integrator` | 여러 산출물을 연결하고 handoff-ready 상태를 만드는 데 유리하다 | package spec, acceptance, dev 진입 문서를 한 세트로 엮을 수 있다 | ticket bundle 개념은 아직 약하다 |
| `plan-reviewer` | 계획 문서의 모순과 누락을 미리 잡는다 | sprint 전 설계 검토 게이트 역할 | 검토 통과 후 delivery ownership을 자동으로 넘겨주지는 않는다 |
| `/plan-bridge` | 기획에서 개발로 넘어가는 공식 접점이 이미 있다 | `ai-worker`에서 package별 개발 진입점을 정할 때 backbone으로 유지 가능 | "누가 받고 무엇을 검증해야 하는가"가 아직 사람 규칙에 많이 의존한다 |

### Delivery

| 자산 | 강점 | `ai-worker`에 바로 쓸 수 있는 방식 | 현재 한계 |
| --- | --- | --- | --- |
| `/dev-feature` | feature package 진입 구조가 정형화되어 있다 | `P0-01`, `P1-02`, `P1-04` 같은 package 단위 착수에 적합 | `ai-worker` 문서의 package/ticket 계층을 직접 해석해주지는 않는다 |
| `/dev-run` | 실행, 로그, 산출물 흐름을 다루기 쉽다 | `run lifecycle`, `workspace persistence`, `artifact access`처럼 실행 중심 과제와 잘 맞는다 | 여러 package를 병렬로 운영하는 control view는 없다 |
| `dev-architect` | 구현 전 구조 분해와 경계 정의에 강하다 | `Run Orchestrator`, `CLI Adapter Contract`, `Background Runner Readiness` 같은 구조 중심 과제에 유리 | ownership 분배가 별도 규칙 없이 즉석 결정되기 쉽다 |

### Verification

| 자산 | 강점 | `ai-worker`에 바로 쓸 수 있는 방식 | 현재 한계 |
| --- | --- | --- | --- |
| `/dev-handoff-verify` | handoff 기반 검증 흐름이 이미 매우 강하다 | package 완료 후 acceptance pack 검증 backbone으로 유지 가능 | handoff bundle이 사람마다 달라질 위험이 있다 |
| `dev-verify-agent` | fresh-context 검증 역할이 명확하다 | `P1-02`, `P1-04` 같은 핵심 package에 필수 검증 레이어로 적합 | 검증 입력이 구조화되지 않으면 품질 편차가 날 수 있다 |
| `dev-code-reviewer` | 로직/구현 결함 점검 | 위험 package 재검토 | 스케줄러 역할은 하지 않는다 |
| `dev-security-reviewer` | 보안 관련 변경의 추가 방어선 | auth/settings, shell 실행, local DB readiness 류 변경에 적합 | 모든 package에 항상 필요한 것은 아니다 |

### Operations

| 자산 | 강점 | `ai-worker`에 바로 쓸 수 있는 방식 | 현재 한계 |
| --- | --- | --- | --- |
| `plan-doc-guard` | 문서 수정의 최소 품질선을 강제한다 | package spec, backlog sync 정합성 유지 | orchestration ownership까지는 관리하지 않는다 |
| `dev-tdd-guard` | 테스트 없는 구현을 막는 방향성이 있다 | lifecycle contract, parser, adapter 같은 코어 작업에 유용 | 여러 티켓 묶음의 완료 정의를 추적하지는 않는다 |
| `dev-db-guard` | DB 관련 리스크를 초기에 드러낸다 | `P3-01` 대응 준비에 적합 | 현재 `ai-worker` 초기 범위에서는 일부 단계만 해당 |
| core rules `verification`, `security`, `interaction` | 검증, 보안, 상호작용 기준을 공통화한다 | 모든 옵션의 최소 guardrail로 유지 가능 | 팀 구성과 handoff 형식을 직접 설계해주지는 않는다 |
| `dev-doc-updater` | 완료 후 문서 sync에 강하다 | backlog/gap report 갱신 루프에 적합 | "언제 어떤 문서를 갱신해야 하는가"는 운영 모델이 더 필요하다 |

## 5. 현재 backbone을 한 줄로 요약하면

현재 `claude-kit`은 아래 backbone을 이미 갖고 있다.

```text
Idea / Screening
  -> PRD / Wireframe / Stitch / Review
  -> /plan-bridge
  -> /dev-feature or /dev-run
  -> /dev-handoff-verify
  -> doc sync / closure
```

즉, "없어서 못 하는" 상태는 아니다.
문제는 `ai-worker`처럼 `program -> phase -> package -> sprint ticket` 계층이 분명한 workload를
"누가", "어떤 묶음으로", "어떤 handoff bundle로" 태울지 정해주는 팀 운영 모델이 아직 약하다는 점이다.

## 6. 지금 자산이 잘하는 것

- 기획 문서를 구조화하고 검토하는 능력은 이미 충분하다.
- 개발 착수와 구현 execution 흐름도 backbone이 있다.
- handoff 기반 검증은 이미 강력한 편이다.
- guardrail도 이미 존재하므로, 새 오케스트레이션은 품질 기준을 새로 만들기보다 연결 방식을 설계하면 된다.

## 7. 지금 자산만으로 부족한 것

### A. `ai-worker` 문서를 실행 단위로 재해석하는 계층

현재 자산은 일반적인 feature 흐름에는 강하지만,
`Phase 0 -> Package P0-01 -> Ticket S0-T03` 같은 계층을
자동으로 execution-ready한 묶음으로 바꾸지는 않는다.

### B. 명시적인 Claude Team 역할 모델

현재는 planning, delivery, verification 자산이 각각 강하지만
"Planning Lead", "Delivery Lead", "Assurance Lead"처럼
역할과 handoff 책임을 운영 규칙으로 고정한 모델은 약하다.

### C. ownership과 handoff bundle 표준

`/plan-bridge`와 `/dev-handoff-verify`는 존재하지만,
어떤 문서 묶음과 어떤 acceptance 기준을 반드시 같이 넘길지는
옵션별로 더 구체화할 필요가 있다.

### D. 병렬 처리 시야

`ai-worker` backlog는 `P1-01`과 `P1-03`,
`S3-T02`와 `S3-T03`처럼 병렬화 가능한 묶음을 명시한다.
하지만 현재 backbone은 병렬화 그 자체보다 단일 흐름에 더 친화적이다.

## 8. 이번 비교 연구에서 고정하는 인터페이스

비교 문서 전체는 아래 세 개의 카드 형식을 공통 언어로 쓴다.

### `AIWorkerWorkItem`

| 필드 | 의미 |
| --- | --- |
| `workstream` | 기획, 설계, 패키지 분해, 구현, 검증, 운영 회고 중 어느 흐름인가 |
| `source_docs` | 근거가 되는 `ai-worker` 문서 묶음 |
| `target_pipeline` | 현재 `claude-kit`의 어느 backbone에 태울 것인가 |
| `done_signal` | 이 work item이 완료됐다고 볼 명시적 신호 |
| `blocking_inputs` | 선행 package, 선행 ticket, 검증 문서, 승인 등 막히는 입력 |

### `OrchestrationOptionCard`

| 필드 | 의미 |
| --- | --- |
| `reused_assets` | 현재 자산을 얼마나 그대로 재사용하는가 |
| `new_assets` | 새로 필요한 skill/command/hook/rule 최소치 |
| `team_topology` | 사람과 Claude 역할을 어떻게 나누는가 |
| `handoff_path` | planning -> delivery -> verification 인계 방식 |
| `verification_path` | 검증을 어디서 어떻게 거는가 |
| `operator_load` | 운영자가 계속 붙어 있어야 하는 정도 |
| `fit_for_ai_worker` | `ai-worker`의 phase/package/ticket 구조와 얼마나 잘 맞는가 |

### `AdditiveAssetSpec`

| 필드 | 의미 |
| --- | --- |
| `type` | `skill`, `command`, `hook`, `rule` 중 하나 |
| `name` | 추가 자산 이름 |
| `why_missing_now` | 현재 자산만으로 부족한 이유 |
| `minimum_behavior` | 이번 1차 구현에서 필요한 최소 동작 |
| `which_option_uses_it` | Option A, B, C 중 어느 안이 쓰는가 |

## 9. 비교 연구를 읽을 때의 판단 기준

이번 연구에서 우선순위는 아래와 같다.

1. 도입 난이도
2. 검증 안정성
3. 병렬 처리량
4. 기존 자산 재사용률
5. 운영자 개입량과 handoff 복잡도
6. 추후 범용화 가능성

즉, 가장 멋진 control plane을 고르는 것이 아니라
가장 빨리 `ai-worker`를 밀 수 있는 Claude Team 운영 모델을 고르는 문서 세트다.
