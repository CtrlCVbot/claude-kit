# Additions Backlog

## 1. 문서 목적

이 문서는 추천안인 Option B를 실제 운영 모델로 만들기 위해
추가해야 할 자산 후보를 우선순위 순으로 정리한다.

이번 라운드의 목표는 구현이 아니다.
따라서 각 항목은 "최소 동작 명세"까지만 고정한다.

## 2. 우선순위 기준

우선순위는 아래 기준으로 정한다.

1. Option B 운영을 실제로 가능하게 만드는가
2. 운영자 부담을 줄이는가
3. `/plan-*`와 `/dev-*` backbone을 바꾸지 않고도 붙일 수 있는가
4. 이후 Option C 확장에도 재사용 가능한가

## 3. P0: Option B pilot 필수 자산

| 우선순위 | type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- | --- |
| P0 | `skill` | `workload-orchestration` | 현재 자산은 워크로드 문서를 execution-ready bundle로 변환하는 계층이 없다 | 워크로드 문서를 프로필 기반으로 해석하여 execution-ready bundle, 의존성 그래프, 세션 모드 초안을 생성한다 | B |
| P0 | `skill` | `team-handoff` | `/plan-bridge`와 `/dev-handoff-verify` 사이 전달 형식이 고정돼 있지 않다 | handoff bundle을 `scope`, `done signal`, `blocking inputs`, `verification focus`, `evidence` 형식으로 정리한다 | B |
| P0 | `hook` | `ownership-hook` | 병렬 진행 시 누가 어떤 bundle을 소유하는지 흐려질 수 있다 | 시작 시 owner, scope, blocked-by, write scope를 빠르게 확인/기록한다 | B, C |
| P0 | `rule` | `orchestration-rule` | lead 역할과 stage exit 조건이 문서만으로는 쉽게 흐려진다 | planning/delivery/verification lead 책임과 필수 handoff 조건을 정의한다 | B, C |

이 네 가지는 Option B를 "설명"이 아니라
"운영 가능한 방식"으로 만들기 위한 최소 세트다.

## 4. P1: Option B 안정화 자산

| 우선순위 | type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- | --- |
| P1 | `hook` | `handoff-bundle-hook` | verify 입력 누락이 있으면 `/dev-handoff-verify` 품질이 흔들린다 | bridge 또는 verify 진입 전에 필수 bundle 항목 누락을 검사한다 | B, C |
| P1 | `command` | `/team-run` | 운영자가 planning -> bridge -> delivery -> verify 순서를 매번 조합해야 한다 | 선택한 package 기준 추천 흐름과 필요한 자산을 안내한다 | B |
| P1 | `rule` | `scope-contract` | 작은 package에서는 범위가 자주 흔들린다 | in-scope, out-of-scope, done signal 세 줄 요약을 강제한다 | A, B |
| P1 | `hook` | `doc-sync-trigger` | verify 후 backlog/gap report 반영 타이밍이 놓치기 쉽다 | verify 결과에 따라 어떤 문서를 갱신할지 체크리스트를 띄운다 | B |

## 5. P2: Option A 보강 및 Option C 확장 자산

| 우선순위 | type | name | why_missing_now | minimum_behavior | which_option_uses_it |
| --- | --- | --- | --- | --- | --- |
| P2 | `skill` | `ai-worker-phase-task-mapper` | Option A는 `phase -> package -> ticket` 해석을 거의 사람에게 맡긴다 | 문서에서 package와 ticket bundle 후보를 추출한다 | A |
| P2 | `skill` | `team-scheduler` | 병렬 가능 bundle과 blocked bundle을 중앙에서 보기 어렵다 | ready queue, blocked queue, next candidate를 계산한다 | C |
| P2 | `command` | `blocker-triage` | 막힌 bundle을 어디로 되돌릴지 판단 루프가 약하다 | blocker를 planning/dependency/verification/classification으로 분류한다 | C |
| P2 | `hook` | `status-report-hook` | 여러 bundle 상태를 운영자가 수동 집계해야 한다 | 현재 진행 중 bundle, owner, next gate를 요약한다 | C |

## 6. 권장 구현 파동

### Wave 1

- `workload-orchestration`
- `team-handoff`
- `ownership-hook`
- `orchestration-rule`

이 파동이 끝나면 Option B pilot 운영이 가능해야 한다.

### Wave 2

- `handoff-bundle-hook`
- `/team-run`
- `scope-contract`
- `doc-sync-trigger`

이 파동이 끝나면 verify 품질과 closure 안정성이 올라간다.

### Wave 3

- `ai-worker-phase-task-mapper`
- `team-scheduler`
- `blocker-triage`
- `status-report-hook`

이 파동은 Option A fallback 보강과 Option C 탐색을 위한 확장 영역이다.

## 7. 지금 구현하지 않는 것

아래는 이번 문서 라운드에서 일부러 확정하지 않는다.

- 실제 command 문법
- 실제 hook 실행 위치와 이벤트 이름
- 실제 rule 파일 경로와 배포 방식
- scheduler의 세부 상태 모델

이번 1차 산출물은
"어떤 자산이 왜 필요한가"까지를 고정하는 문서다.

## 8. 문서 기반 완료 조건

이 backlog가 충분히 쓸모 있으려면 아래가 가능해야 한다.

1. 각 추가 자산이 왜 필요한지 한 문장으로 설명할 수 있다.
2. 각 자산이 어느 옵션에 연결되는지 헷갈리지 않는다.
3. 최소 동작만 봐도 구현 착수 범위를 감 잡을 수 있다.
4. Option B pilot을 위한 필수와 후순위를 구분할 수 있다.

이 조건이 만족되면
다음 단계에서 실제 skill/command/hook/rule 구현 계획으로 자연스럽게 이어질 수 있다.
