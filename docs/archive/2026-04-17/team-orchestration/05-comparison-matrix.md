# Claude Team Orchestration Comparison Matrix

## 1. 비교 목적

이 문서는 Option A, B, C를 같은 기준으로 나란히 놓고
왜 Option B를 추천안으로 보는지 재현 가능하게 설명한다.

이번 결정의 우선순위는 아래와 같다.

1. 도입 난이도
2. 검증 안정성
3. 병렬 처리량
4. 기존 자산 재사용률
5. 운영자 개입량
6. handoff 복잡도
7. 추후 범용화 가능성

## 2. 한눈에 보는 점수표

점수는 `1`이 약함, `5`가 강함이다.
단, `운영자 개입량`과 `handoff 복잡도`는 점수가 높을수록 부담이 적다는 뜻으로 읽는다.

| 비교 축 | Option A Reuse-First | Option B Hybrid Claude Team | Option C Control Tower |
| --- | ---: | ---: | ---: |
| 기존 자산 재사용률 | 5 | 4 | 3 |
| 추가 자산 수 부담 | 5 | 3 | 1 |
| 도입 난이도 | 5 | 4 | 2 |
| 운영자 개입량 부담 | 2 | 4 | 3 |
| handoff 복잡도 관리 | 2 | 4 | 5 |
| verification 강도 | 4 | 5 | 5 |
| 병렬 처리량 | 2 | 4 | 5 |
| `ai-worker` 적합도 | 3 | 5 | 4 |
| 추후 범용화 가능성 | 3 | 4 | 5 |

## 3. 축별 해석

### 기존 자산 재사용률

- Option A가 가장 높다. 새 운영 층이 거의 없기 때문이다.
- Option B는 backbone을 유지하면서 역할층만 얹으므로 여전히 높다.
- Option C는 backbone을 쓰더라도 control plane 추가가 커서 상대적으로 낮다.

### 도입 난이도

- Option A는 가장 쉽다. 바로 시작 가능하다.
- Option B는 몇 가지 skill/hook/rule이 더 필요하지만, 현재 운영 감각을 해치지 않는다.
- Option C는 관제 개념을 도입해야 해서 초기 학습과 설계 비용이 가장 크다.

### verification 강도

- 세 안 모두 `/dev-handoff-verify` backbone을 유지하므로 기본선은 높다.
- Option B와 C는 handoff bundle 표준화와 lead 역할 덕분에 검증 입력 품질이 더 안정적이다.

### 병렬 처리량

- Option A는 사람 중심 조정이라 package/ticket 병렬화가 약하다.
- Option B는 ownership과 lead 체계 덕분에 `ai-worker`의 명시된 병렬 포인트를 활용하기 쉽다.
- Option C는 가장 강력하지만 과도한 초기 비용을 지불한다.

## 4. `ai-worker` workload 기준 비교

| workload 특성 | Option A | Option B | Option C |
| --- | --- | --- | --- |
| `program -> package -> ticket` 계층 해석 | 운영자 수동 해석 | 팀 역할로 흡수 가능 | scheduler 모델로 가장 정교하게 처리 가능 |
| `P1-02` 같은 구조 중심 package 처리 | 가능하지만 운영자 의존 | `Delivery Lead + dev-architect` 조합이 적합 | 가능하나 control setup 비용 큼 |
| `P1-01`/`P1-03` 병렬화 | 약함 | 적절함 | 매우 강함 |
| verify 이후 backlog/gap sync | 수동 | lead와 doc updater로 통제 가능 | 체계화 가능하나 구현량 큼 |
| 지금 바로 시작하는 감각 | 가장 빠름 | 충분히 빠르면서 안정적 | 느림 |

## 5. 가중 판단

이번 연구는 "가장 강력한 안"을 고르는 게 아니라
"지금 `ai-worker`를 가장 수월하게 밀 수 있는 안"을 고른다.

그 기준으로 보면:

- Option A는 시작은 빠르지만 운영자가 계속 bottleneck이 된다.
- Option C는 구조적으로 매력적이지만 1차 도입 범위를 넘기 쉽다.
- Option B는 기존 자산을 많이 살리면서도 실제 팀 역할, handoff bundle, verify 안정성을 확보한다.

## 6. 왜 Option B가 추천안인가

Option B는 아래 세 조건을 동시에 만족한다.

1. `/plan-*`, `/dev-*`, `/dev-handoff-verify` backbone을 유지한다.
2. `ai-worker`의 package/ticket 계층을 lead 역할과 handoff bundle로 흡수한다.
3. 병렬 처리와 검증 안정성을 올리되, control tower 전체를 새로 만들지는 않는다.

즉, Option B는
"Option A의 쉬운 도입"과
"Option C의 팀 orchestration 감각" 사이에서
가장 균형 잡힌 위치에 있다.

## 7. 채택 판단 표

| 질문 | A가 유리한 경우 | B가 유리한 경우 | C가 유리한 경우 |
| --- | --- | --- | --- |
| 이번 라운드가 단일 package 위주인가 | 예 | 아니오 | 아니오 |
| package와 ticket handoff가 반복적으로 발생하는가 | 아니오 | 예 | 예 |
| verify 입력 품질을 표준화해야 하는가 | 일부 | 강하게 예 | 강하게 예 |
| 병렬화가 실제 속도 차이를 만드는가 | 아니오 | 예 | 매우 예 |
| 당장 새 운영 계층을 많이 만들 수 있는가 | 아니오 | 일부 가능 | 예 |

현재 `ai-worker`는
package/ticket 계층이 분명하고 병렬 포인트가 있으며
gap report가 orchestration 부재를 지적하고 있으므로
이 표 기준에서도 Option B가 가장 자연스럽다.
