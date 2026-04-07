# Option C: Control Tower

이 안은 오케스트레이션을 별도 control plane처럼 다루는 방식이다.
queue, gate, blocker, status reporting을 더 강하게 전면에 세운다.

```yaml
OrchestrationOptionCard:
  reused_assets: "중간"
  new_assets: "많음"
  team_topology: "Control Tower + Planning/Delivery/Assurance pools"
  handoff_path: "중앙 scheduler가 인계와 상태를 관리"
  verification_path: "queue/gate 중심 verify orchestration"
  operator_load: "초기 구축 시 높고, 안정화 후 낮아질 수 있음"
  fit_for_ai_worker: "장기 확장에는 좋지만 1차 도입은 무거움"
```

## Existing Asset Reuse

| 영역 | 그대로 쓰는 자산 | 이 안에서의 해석 |
| --- | --- | --- |
| Planning | 기존 `plan-*` 자산 | scheduler가 planning lane에 작업을 배치하는 하위 실행기처럼 본다 |
| Delivery | `/dev-feature`, `/dev-run`, `dev-architect` | queue에서 뽑힌 bundle을 처리하는 execution lane으로 본다 |
| Verification | `/dev-handoff-verify`, `dev-verify-agent`, reviewer 계열 | gate 통과를 판정하는 검증 lane으로 본다 |
| Guardrails | 기존 hooks/rules | 중앙 관제 하에서도 품질 기준은 재사용한다 |

이 안도 backbone을 버리지는 않는다.
다만 backbone 위에 별도 관제층을 더 두는 것이 핵심 차이다.

## New Team Composition

| 역할 | 책임 | 특징 |
| --- | --- | --- |
| Control Tower Lead | 전체 package/ticket queue 관리, blocker triage | 운영 모델의 중심 |
| Planning pool | planning lane 처리 | package spec, review, bridge 준비 |
| Delivery pool | 구현 lane 처리 | ownership과 병렬 구현 |
| Assurance pool | verify lane 처리 | gate 판정, risk escalation |
| Operator | 우선순위와 정책 승인 | 초기에는 관제층과 자주 상호작용해야 한다 |

이 안은 팀 구성 자체가 파이프라인을 닮아 있다.
즉, 사람이 stage lead가 되는 수준을 넘어
"작업 관제 시스템"을 운영하는 감각에 가깝다.

## New Additive Assets

| type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- |
| `skill` | `team-scheduler` | 현재는 병렬 가능 묶음과 blocked-by를 중앙에서 보는 시야가 약하다 | package/ticket queue와 ready set을 계산한다 | C |
| `command` | `blocker-triage` | 막힌 이유를 planning, dependency, verification으로 분류하는 공식 루프가 없다 | blocker를 기록하고 다음 액션을 제안한다 | C |
| `hook` | `status-report-hook` | 진행 중인 여러 bundle 상태를 자동으로 요약하지 못한다 | 실행 중 status, owner, next gate를 요약한다 | C |
| `hook` | `ownership-hook` | pool 기반 병렬 작업에서는 ownership 충돌 위험이 더 크다 | bundle 시작 시 owner와 write scope를 기록한다 | B, C |
| `hook` | `handoff-bundle-hook` | lane 간 인계 품질을 자동 점검할 필요가 있다 | bundle completeness를 검증한다 | B, C |
| `rule` | `orchestration-rule` | control plane 없이 규칙만으로는 lane 운영이 불안정하다 | queue, gate, escalation, re-entry 조건을 정의한다 | B, C |

## Pipeline Overlay

```text
Control Tower Lead
  -> team-scheduler로 ready bundle 계산
  -> Planning lane에 배치
  -> /plan-bridge 후 Delivery lane에 배치
  -> 구현 완료 시 Assurance lane에 배치
  -> verify 결과에 따라 done / rework / blocked 상태 분기
  -> status-report-hook으로 전체 흐름 요약
```

### `ai-worker` 적용 예시

이 안에서는 `P1-01`과 `P1-03`을
`P1-02` gate 통과 후 자동으로 ready set에 올리는 식의 운영이 가능하다.

또한 `S3-T02`와 `S3-T03`,
`S4-T02`와 `S4-T03`처럼 병렬 가능한 ticket 묶음을
Control Tower가 동일한 package umbrella 아래에서 관리할 수 있다.

장기적으로는 가장 강력한 그림이지만,
현재 1차 목적은 `ai-worker`를 수월하게 진행하는 것이므로
초기 무게감이 큰 편이다.

## Operator Flow

1. 운영자가 우선순위와 정책만 입력한다.
2. `team-scheduler`가 ready bundle과 blocked bundle을 정리한다.
3. Control Tower Lead가 planning/delivery/assurance lane에 작업을 배치한다.
4. 각 lane은 기존 `plan-*`, `dev-*`, verify 자산으로 실행한다.
5. `blocker-triage`가 막힌 bundle을 분류한다.
6. `status-report-hook`이 현재 상태를 요약한다.
7. 운영자는 관제 리포트를 보고 승인/우선순위 조정을 한다.

안정화 후에는 운영자가 가장 덜 바쁠 수 있지만,
그 지점에 도달하기 전까지는 구축 비용이 높다.

## Risks

- 1차 목적 대비 설계가 무거워질 수 있다.
- 현재 `claude-kit`의 단일 backbone 사용 감각과 거리가 생길 수 있다.
- 새 skill/command/hook/rule이 많아서 비교 연구 이후 실제 구현 규모가 커진다.
- 운영 모델이 잘못 설계되면 도입 난이도가 급격히 올라간다.

## Fit for ai-worker

이 안은 `ai-worker`의 병렬 backlog를 가장 잘 다룰 잠재력이 있다.
특히 Phase 2 이후 package 수와 운영 변수가 늘어나면 장점이 커진다.

하지만 이번 비교의 1순위가 도입 난이도인 만큼,
초기 추천안으로 채택하기에는 무겁다.

결론적으로 Option C는
"장기적 확장 후보"로는 강하지만
"지금 가장 수월하게 시작하는 안"으로는 아니다.
