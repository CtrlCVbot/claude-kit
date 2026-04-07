# Option B AI-Worker Walkthrough

## Purpose

이 문서는 `ai-worker`를 기준으로 Option B가 실제로 어떻게 적용되는지 보여주는 concrete example이다.
범용 설명은 앞선 문서에 남겨 두고,
여기서는 실제 workload에 붙였을 때의 흐름만 집중해서 본다.

## Audience

- Option B를 실제 workload에 시뮬레이션해 보고 싶은 구현자
- `ai-worker`를 첫 pilot 대상으로 고려하는 사람

## Read After

- [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md)

## Read Next

- [06-recommended-operating-model.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/06-recommended-operating-model.md)

## Note

이 walkthrough는 `workload-orchestration` 스킬의 `ai-worker` 프로필 적용 예시다.
범용 스킬 사양(입력/출력/5단계 동작/프로필 시스템)은 [02-asset-specification.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/02-asset-specification.md)를 참조.

## Why P1-02

대표 사례는 `P1-02 Run Lifecycle Engine`으로 고정한다.

| 이유 | 설명 |
| --- | --- |
| 구조 중심 package | Option B의 설계/인계/검증 가치가 가장 잘 드러난다 |
| 선행 package가 명확함 | `P0-01`, `P0-02`, `P0-03` 이후 진입하는 구조다 |
| ticket bundle이 자연스럽다 | `S2-T01 ~ S2-T06`이 한 묶음으로 읽힌다 |
| 이후 UI 병렬화의 기준점 | `P1-01`, `P1-03`이 이 package의 인터페이스 안정화에 의존한다 |

필요 시 보조 비교 예시로 `P0-01 Sidecar Execution Baseline`을 쓴다.
이 예시는 `Compact Mode` 설명에 적합하다.

## Chosen Session Mode

`P1-02`의 기본 권장 mode는 `Handoff Mode`다.

| 검토 질문 | 판단 |
| --- | --- |
| package가 작고 단일 세션으로 끝내기 쉬운가 | 아니오 |
| planning에서 delivery로 넘길 명시적 계약이 필요한가 | 예 |
| verification focus를 별도로 고정해야 하는가 | 예 |
| 병렬 구현이 바로 필요한가 | 초기에는 아니오 |

즉, 시작은 `Handoff Mode`로 하고,
이후 `P1-01`과 `P1-03`으로 확장될 때 `Isolated Parallel Mode`를 검토한다.

## Source Documents

이 walkthrough는 아래 문서를 근거로 한다.

| 문서 | 이 walkthrough에서 읽는 역할 |
| --- | --- |
| `C:\Program Files (user)\ai-worker\docs\07-phase-feature-packages.md` | `P1-02`의 목표, 선행 의존성, 완료 기준 |
| `C:\Program Files (user)\ai-worker\docs\08-sprint-backlog-p0-p1.md` | `S2-T01 ~ S2-T06` ticket 범위, 의존성, 담당 성격 |

## Bundle Example

### Planning-to-Delivery Bundle

```yaml
handoff_bundle:
  package_id: "P1-02"
  package_name: "Run Lifecycle Engine"
  source_docs:
    - "07-phase-feature-packages.md"
    - "08-sprint-backlog-p0-p1.md"
  selected_scope:
    - "S2-T01 Run Domain Model & Store"
    - "S2-T02 Run Orchestrator"
    - "S2-T03 CLI Adapter Contract"
    - "S2-T04 Stop & Cleanup Flow"
    - "S2-T05 Re-run Cloning Flow"
    - "S2-T06 Lifecycle Contract Test Pack"
  out_of_scope:
    - "P1-01 Run Editor MVP"
    - "P1-03 Console Observability UI"
  blocking_inputs:
    - "P0-01 complete"
    - "P0-02 complete"
    - "P0-03 complete"
  done_signal:
    - "queued -> running -> success/failed 흐름이 코드와 UI 기대치에 맞는다"
    - "user_stopped와 rerun 흐름이 별도 상태로 정리된다"
    - "contract test pack이 회귀 검증 가능하다"
  verification_focus:
    - "state transition consistency"
    - "adapter abstraction boundary"
    - "stop / cleanup correctness"
    - "rerun non-overwrite behavior"
  evidence_expectation:
    - "상태 전이 테스트"
    - "로그 및 결과 저장 흔적"
    - "failure reason 분류 근거"
```

이 예시는 실제 포맷 강제가 아니라
Option B가 어떤 수준의 handoff를 기대하는지 보여 주는 기준 예시다.

## Planning To Delivery

### Planning stage가 해야 할 일

| 단계 | 설명 |
| --- | --- |
| 1 | `P1-02`의 목표와 선행 의존성을 package 계약으로 정리한다 |
| 2 | `S2-T01 ~ S2-T06`을 하나의 delivery bundle로 묶는다 |
| 3 | `P1-01`, `P1-03`은 out-of-scope로 분리한다 |
| 4 | verification focus를 미리 초안으로 적는다 |

### Delivery stage가 bundle을 읽고 해야 할 일

| 구현 묶음 | 이유 |
| --- | --- |
| `S2-T01 + S2-T02` | 도메인 모델과 orchestrator의 중심 흐름을 먼저 고정해야 한다 |
| `S2-T03 + S2-T04` | adapter와 stop/cleanup은 실행 경로를 닫아 준다 |
| `S2-T05 + S2-T06` | rerun과 contract tests는 회귀 안정성을 만든다 |

실전에서는 이 세 묶음을 순차적으로 처리하되,
문서상으로는 한 package bundle로 유지하는 편이 안정적이다.

## Delivery To Verification

delivery가 끝나면 verify용 bundle은 planning bundle과 조금 달라진다.

### Verify bundle에서 더 강조할 것

| 항목 | 이유 |
| --- | --- |
| 상태 전이 로그 | `queued -> running -> success/failed` 흐름 확인 |
| `user_stopped` 흔적 | stop flow 검증 |
| rerun 메타 연결 | 덮어쓰기 없이 새 run 생성 여부 검증 |
| adapter abstraction 설명 | orchestrator가 concrete shell 구현에 고정되지 않았는지 확인 |
| contract test pack 결과 | 회귀 검증 가능성 확인 |

### Verification stage 질문

verification은 아래 질문에 답해야 한다.

1. lifecycle 상태 전이가 package 완료 기준과 맞는가
2. stop/cleanup 이후 상태와 로그가 일관되게 남는가
3. rerun이 기존 run을 덮어쓰지 않는가
4. adapter 경계가 후속 `P3-03 Engine Abstraction` 논의에 연결될 수 있는가

## Next Package Decision

`P1-02`가 안정화되면 다음 선택지는 자연스럽게 갈린다.

| 다음 후보 | 왜 이어지는가 | 권장 mode |
| --- | --- | --- |
| `P1-01 Run Editor MVP` | 입력 생성 UI가 lifecycle core 위에 올라간다 | 초기에는 `Compact` 또는 가벼운 `Handoff` |
| `P1-03 Console Observability UI` | 실행 상태와 로그 표시가 lifecycle core를 전제로 한다 | 초기에는 `Compact` 또는 `Isolated Parallel` 후보 |
| `P1-01` + `P1-03` 병렬 | 인터페이스가 충분히 고정되면 UI 쪽 병렬화가 가능하다 | `Isolated Parallel Mode` 후보 |

즉, `P1-02` walkthrough의 목적은 이 package 하나를 설명하는 데 그치지 않는다.
이후 어떤 지점에서 병렬화가 자연스럽게 열리는지도 보여 준다.

## Compact Mode Contrast: P0-01

보조 예시로 `P0-01 Sidecar Execution Baseline`을 보면
왜 `P1-02`가 `Handoff Mode`에 더 적합한지 비교가 쉬워진다.

| 항목 | `P0-01` | `P1-02` |
| --- | --- | --- |
| package 성격 | 실행 프로토타입과 smoke surface | 상태/실행 코어 엔진 |
| ticket 복잡도 | 상대적으로 낮음 | 높음 |
| verify focus | 실행 가능 여부 확인 | 상태 전이와 회귀 안정성 |
| 권장 mode | `Compact Mode` | `Handoff Mode` |

## What This Walkthrough Proves

이 walkthrough를 읽고 구현자가 아래를 이해하면 목적을 달성한 것이다.

1. Option B는 추상적인 팀 이야기가 아니라 package와 ticket bundle을 다루는 운영 모델이다.
2. `P1-02` 같은 package에서는 handoff bundle이 실제로 어떤 정보를 담아야 하는지 알 수 있다.
3. `Compact`, `Handoff`, `Isolated Parallel`이 추상 개념이 아니라 workload별 선택지라는 점이 드러난다.
