# Option A: Reuse-First Overlay

이 안은 현재 `claude-kit` backbone을 거의 그대로 유지하고,
`ai-worker`에 필요한 최소한의 해석 레이어만 얹는 방식이다.

```yaml
OrchestrationOptionCard:
  reused_assets: "매우 높음"
  new_assets: "아주 적음"
  team_topology: "운영자 중심 + 기존 planning/delivery/verification 자산 호출"
  handoff_path: "문서 기반 수동 handoff"
  verification_path: "/dev-handoff-verify 중심"
  operator_load: "높음"
  fit_for_ai_worker: "초기 도입용 baseline으로 적합"
```

## Existing Asset Reuse

| 영역 | 그대로 쓰는 자산 | 이 안에서의 해석 |
| --- | --- | --- |
| Planning | `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-reviewer`, `/plan-bridge` | `ai-worker` package를 일반 feature처럼 태운다 |
| Delivery | `/dev-feature`, `/dev-run`, `dev-architect` | package 또는 ticket bundle 단위 구현 backbone으로 유지한다 |
| Verification | `/dev-handoff-verify`, `dev-verify-agent`, 필요 시 `dev-code-reviewer` | 패키지 완료 후 검증 레이어로 유지한다 |
| Guardrails | `plan-doc-guard`, `dev-tdd-guard`, `dev-db-guard`, core rules | 기존 품질선은 그대로 쓴다 |

이 안의 핵심은 오케스트레이션 자체를 새로 만들지 않는 것이다.
운영자는 현재 명령 체계를 유지한 채 `ai-worker` 문서만 더 잘 읽어 주면 된다.

## New Team Composition

| 역할 | 책임 | 특징 |
| --- | --- | --- |
| Operator | package 선택, 선행 조건 확인, handoff 문서 지정 | 가장 바쁜 사람 |
| Planning runner | 기존 `plan-*` 자산 실행 | 별도 Claude Team 역할을 강하게 두지 않는다 |
| Delivery runner | `/dev-feature` 또는 `/dev-run` 실행 | package 단위로 실행 |
| Verification runner | `/dev-handoff-verify` 실행 | 검증은 강하지만 handoff 품질이 운영자에 좌우된다 |

사실상 "팀 오케스트레이션"보다는
"기존 파이프라인 재사용 규칙"에 가깝다.

## New Additive Assets

| type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- |
| `skill` | `ai-worker-phase-task-mapper` | 현재 자산은 `phase -> package -> ticket` 계층을 직접 해석하지 못한다 | `ai-worker` 문서를 읽고 package와 ticket bundle 후보를 뽑아 준다 | A |
| `rule` | `scope-contract` | planning output과 delivery scope가 쉽게 엇갈릴 수 있다 | package 단위 범위, 제외 범위, done signal을 짧게 강제한다 | A, B |

추가 자산을 최소화한 덕분에 도입은 쉽다.
대신 orchestration 체감은 가장 약하다.

## Pipeline Overlay

```text
Operator가 ai-worker 문서에서 package 선택
  -> ai-worker-phase-task-mapper로 bundle 초안 생성
  -> /plan-prd 또는 /plan-review
  -> /plan-bridge
  -> /dev-feature 또는 /dev-run
  -> /dev-handoff-verify
  -> 필요 시 dev-doc-updater로 문서 sync
```

### `ai-worker` 적용 예시

`P1-02 Run Lifecycle Engine`을 추진한다고 가정하면:

1. 운영자가 `07-phase-feature-packages.md`와 `08-sprint-backlog-p0-p1.md`에서 관련 ticket를 고른다.
2. `ai-worker-phase-task-mapper`가 `S2-T01 ~ S2-T06` 묶음을 제안한다.
3. `/plan-review`로 계약을 다듬고 `/plan-bridge`로 개발 진입 문서를 만든다.
4. `/dev-feature` 또는 `/dev-run`으로 구현한다.
5. `/dev-handoff-verify`로 acceptance pack을 검증한다.

## Operator Flow

1. `ai-worker` 문서에서 이번 라운드 package 하나를 고른다.
2. 선행 package와 ticket를 직접 확인한다.
3. `ai-worker-phase-task-mapper`로 실행 bundle을 만든다.
4. planning 문서와 scope를 정리한다.
5. `/plan-bridge`로 개발 진입 문서를 고정한다.
6. `/dev-feature` 또는 `/dev-run`으로 구현을 진행한다.
7. `/dev-handoff-verify`로 검증한다.
8. 통과 시 backlog/gap report를 운영자가 수동 업데이트한다.

## Risks

- 운영자에게 해석과 조정 부담이 많이 남는다.
- 병렬 처리 판단이 사람 감각에 의존한다.
- handoff bundle 형식이 고정되지 않으면 verify 품질 편차가 날 수 있다.
- package가 커질수록 "단일 파이프라인 재사용"만으로는 진행 감각이 무거워진다.

## Fit for ai-worker

이 안은 `ai-worker`를 빨리 시작하는 baseline으로는 좋다.
특히 `P0-01`, `P0-02`처럼 선형으로 밀기 쉬운 초기 package에는 적합하다.

다만 `P1-02` 이후처럼 package와 ticket 묶음이 커지고,
`P1-01`/`P1-03` 병렬화처럼 coordination 요구가 생기면 한계가 빠르게 드러난다.

결론적으로 Option A는
"최소 도입으로 당장 시작하기 위한 안"이지
"가장 수월하게 밀기 위한 안"은 아니다.
