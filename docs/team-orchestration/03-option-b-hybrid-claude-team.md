# Option B: Hybrid Claude Team

이 안은 현재 `plan-*`와 `dev-*` backbone을 그대로 유지하면서,
그 위에 명시적인 Claude Team 역할과 handoff 규칙을 얹는 방식이다.

이번 비교 연구의 추천안은 이 안이다.

```yaml
OrchestrationOptionCard:
  reused_assets: "높음"
  new_assets: "중간"
  team_topology: "Planning Lead + Delivery Lead + Assurance Lead"
  handoff_path: "표준 handoff bundle 기반 단계 인계"
  verification_path: "/dev-handoff-verify + assurance overlay"
  operator_load: "중간"
  fit_for_ai_worker: "가장 균형이 좋음"
```

## Existing Asset Reuse

| 영역 | 그대로 쓰는 자산 | 이 안에서의 해석 |
| --- | --- | --- |
| Planning | `plan-prd-writer`, `plan-wireframe-designer`, `plan-stitch-integrator`, `plan-reviewer`, `/plan-bridge` | package contract와 bridge 세트를 팀 단위로 만든다 |
| Delivery | `/dev-feature`, `/dev-run`, `dev-architect` | package 또는 ticket bundle을 Delivery Lead가 ownership과 함께 밀어준다 |
| Verification | `/dev-handoff-verify`, `dev-verify-agent`, `dev-code-reviewer`, `dev-security-reviewer` | Assurance Lead가 verify focus를 묶어 전달한다 |
| Guardrails | `plan-doc-guard`, `dev-tdd-guard`, `dev-db-guard`, core rules | 팀이 늘어나도 guardrail은 그대로 유지한다 |
| Closure | `dev-doc-updater` | verify 종료 후 backlog/gap sync에 붙인다 |

핵심은 backbone을 바꾸지 않는다는 점이다.
새로 만드는 것은 "누가 무엇을 묶어서 넘기는가"라는 팀 운영층이다.

## New Team Composition

### Stage별 고정 팀 구성

| Stage | 고정 팀 구성 | 책임 |
| --- | --- | --- |
| Planning stage | `Planning Lead` + `plan-prd-writer` + `plan-reviewer` | 이번 라운드 package scope와 done signal 고정 |
| Design/Handoff stage | `Planning Lead` + `plan-wireframe-designer` + `plan-stitch-integrator` | design 보강, 문서 stitching, bridge-ready bundle 생성 |
| Delivery stage | `Delivery Lead` + `dev-architect` + implementation executor | 구현 ownership, 경계 정의, 실행 |
| Verification stage | `Assurance Lead` + `dev-verify-agent` + 필요 시 `dev-code-reviewer` / `dev-security-reviewer` | verify focus 설정, acceptance 및 risk 판정 |
| Doc sync/closure | 필요 시 `dev-doc-updater` | backlog/gap report 반영, 다음 package 진입 준비 |

### 역할 모델의 의도

- `Planning Lead`는 package를 "개발 가능한 계약"으로 만든다.
- `Delivery Lead`는 bundle을 받아 구현 가능한 단위로 쪼개고 ownership을 관리한다.
- `Assurance Lead`는 검증 입력 품질을 보장하고 verify 결과를 다음 단계 문서에 연결한다.

이 역할 모델이 들어오면,
기존 명령은 유지하면서도 실제 팀이 움직이는 감각이 생긴다.

## New Additive Assets

| type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- |
| `skill` | `workload-orchestration` | 현재 자산만으로는 워크로드 문서를 execution-ready bundle로 변환하는 계층이 없다 | 워크로드 문서를 프로필 기반으로 해석하여 execution-ready bundle, 의존성 그래프, 세션 모드 초안을 생성한다 | B |
| `skill` | `team-handoff` | `/plan-bridge`와 `/dev-handoff-verify` 사이 전달 세트가 사람마다 달라질 수 있다 | planning output을 delivery/verification용 handoff bundle로 정리한다 | B |
| `hook` | `ownership-hook` | 병렬 진행 시 package/ticket ownership 충돌 가능성이 있다 | 작업 시작 시 owner, scope, blocked-by를 빠르게 기록/확인한다 | B, C |
| `hook` | `handoff-bundle-hook` | verify 입력 누락이 발생하기 쉽다 | bridge 또는 handoff 시 필수 문서/acceptance/evidence 유무를 점검한다 | B, C |
| `rule` | `orchestration-rule` | 팀 역할과 인계 규칙이 없으면 다시 임기응변 운영이 된다 | stage exit 조건, lead 책임, verify 전 필수 bundle 규칙을 정의한다 | B, C |
| `command` | `/team-run` 또는 유사 wrapper | 운영자가 여러 명령 순서를 매번 기억해야 한다 | planning -> bridge -> delivery -> verify 추천 순서를 안내한다 | B |

이 안은 추가 자산이 Option A보다 많지만,
새 control plane을 통째로 만드는 수준까지는 가지 않는다.

## Pipeline Overlay

```text
Planning Lead
  -> workload-orchestration으로 package/ticket bundle 초안 생성
  -> plan-prd-writer + plan-reviewer로 계약 고정
  -> plan-wireframe-designer / plan-stitch-integrator로 handoff 문서 세트 완성
  -> /plan-bridge
Delivery Lead
  -> dev-architect와 구현 경계 정의
  -> /dev-feature or /dev-run
Assurance Lead
  -> team-handoff로 verify focus 정리
  -> /dev-handoff-verify
Closure
  -> dev-doc-updater로 backlog/gap sync
```

### `ai-worker` 적용 예시

`P1-02 Run Lifecycle Engine`을 이 안으로 운영하면:

1. `Planning Lead`가 `P1-02`와 연결된 `S2-T01 ~ S2-T06`을 하나의 delivery bundle로 정리한다.
2. `plan-reviewer`가 package contract의 누락을 검토한다.
3. `plan-stitch-integrator`가 설계, acceptance, 구현 진입 메모를 묶는다.
4. `Delivery Lead`가 `dev-architect`와 함께 `Run Domain Model`, `Run Orchestrator`, `CLI Adapter`, `Lifecycle Test Pack`의 경계를 정한다.
5. 구현 executor가 `/dev-feature` 또는 `/dev-run`으로 진행한다.
6. `Assurance Lead`가 검증 초점을 "상태 전이, 재실행, 중지/정리, contract tests"로 명시한 후 `/dev-handoff-verify`를 건다.
7. 통과하면 `dev-doc-updater`로 backlog와 gap report 반영 범위를 정리한다.

## Operator Flow

1. 운영자는 이번 라운드의 package 또는 package 묶음을 고른다.
2. `Planning Lead`가 `workload-orchestration`으로 workstream bundle 초안을 만든다.
3. planning 자산으로 scope, done signal, 제외 범위를 고정한다.
4. `team-handoff`로 delivery용 번들을 만든다.
5. `/plan-bridge`로 공식 개발 진입 상태를 만든다.
6. `Delivery Lead`가 ownership을 나누고 구현을 진행한다.
7. `Assurance Lead`가 verify focus를 지정하고 `/dev-handoff-verify`를 실행한다.
8. 통과/실패 결과를 문서에 반영해 다음 package 진입 여부를 결정한다.

운영자는 각 세부 handoff를 직접 만들기보다
lead에게 묶음과 판정을 맡기게 되므로
Option A보다 피로도가 낮아진다.

## Risks

- 역할은 명확해지지만, 실제로는 새 skill/hook/rule이 일부 필요하다.
- package가 너무 작을 때는 팀 역할이 과해 보일 수 있다.
- lead 역할이 형식만 있고 handoff bundle이 느슨하면 Option A와 차이가 줄어든다.
- wrapper command를 너무 크게 만들면 Option C처럼 무거워질 수 있다.

## Fit for ai-worker

이 안은 `ai-worker`의 구조적 특성과 가장 잘 맞는다.

- program -> package -> ticket bundle 계층을 팀 역할로 흡수하기 쉽다.
- `/plan-*`와 `/dev-*` backbone을 유지하므로 도입 비용이 낮다.
- `/dev-handoff-verify` 강점을 그대로 살릴 수 있다.
- `P1-01`/`P1-03`, `S3-T02`/`S3-T03` 같은 병렬 포인트에 ownership 규칙을 붙이기 좋다.

즉, Option B는
"지금 있는 자산을 가장 많이 살리면서도 실제 Claude Team처럼 움직이게 만드는 안"이다.
