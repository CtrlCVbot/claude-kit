# Advisor Tool Applicability

## 결론 요약

현재 `claude-kit`는 `Claude Code`와 `Codex`용 자산을 배포하는 패키지이므로, Anthropic API의 `Advisor tool`을 그대로 켜는 위치가 없다.  
즉 "직접 적용"은 어렵고, "advisor-style orchestration 정책"으로 차용하는 것이 현실적이다.

## `Advisor tool` vs `Claude Code subagent` vs `claude-kit 현재 구조`

| 항목 | Advisor tool | Claude Code subagent | claude-kit 현재 구조와의 관계 | 시사점 |
|---|---|---|---|---|
| 표면 | Anthropic API | Claude Code runtime | claude-kit는 주로 Claude Code/Codex 자산 패키징 | direct API integration 지점이 없음 |
| 실행 단위 | 같은 요청 내부의 server tool | 별도 context window 작업 단위 | 현재 agent markdown은 subagent 성격 | advisor를 그대로 대체할 수 없음 |
| 모델 분리 | executor와 advisor를 동시 사용 | 각 subagent가 단일 model 사용 | 현재는 주로 `model: opus` 고정 | 다중모델 choreography 부재 |
| 비용 전략 | 빠른 executor + 고지능 advisor | 보통 subagent 하나가 끝까지 수행 | 현재는 대부분 최고급 모델로 가정 | 비용 최적화 여지 큼 |
| 도구 사용 | advisor는 도구 없이 조언만 반환 | subagent는 tools/permissions 사용 가능 | claude-kit는 도구 통제가 풍부 | advisor-style 역할 분리 설계 가능 |
| 결과 형태 | `advisor_tool_result` | 일반 작업 결과 | 현재는 표준 결과 포맷만 존재 | escalation 이벤트 규격이 필요 |

## 도입 적합 시나리오

### 1. planning-heavy, execution-light 작업

- `plan-draft-writer`, `plan-bridge-writer`, `plan-reviewer`
- 대부분의 텍스트 생성은 Sonnet급으로도 가능하지만, 분기 판단과 구조 조정 순간에 더 높은 지능이 유리함

### 2. 구현 에이전트의 중간 전략 교정

- `dev-implementer`
- 일반 구현은 executor가 처리하고,
- 아래 상황에서만 advisor-style escalation:
  - 테스트가 2회 이상 실패
  - architecture decision이 새로 필요
  - file_scope 안에서 해결되지 않는 설계 충돌 발생

### 3. 대규모 장기 파이프라인

- plan → dev → review 흐름
- 대부분의 기계적 단계는 cheaper model
- checkpoint / gate / rewrite 시점만 고지능 개입

## 도입 부적합 시나리오

### 1. 본질적으로 매 턴이 최고 지능을 요구하는 작업

- 최종 architecture review
- security critical review
- 고난도 database review

이 경우 executor/advisor 분리가 오히려 복잡도만 늘릴 수 있다.

### 2. 지금 구조상 API-level 제어가 없는 런타임

현재 `claude-kit`는 Claude API request body를 직접 생성하지 않는다.  
따라서 `tools: [{type: "advisor_20260301", ...}]`를 주입할 정확한 표면이 없다.

### 3. target parity가 우선 과제인 구간

Codex 쪽은 아직 단일 에이전트 모델 메타데이터 보존도 약하다.  
이 상태에서 advisor 전략까지 얹으면 기본 parity 문제를 가릴 수 있다.

## 비용/지연/품질 trade-off

공식 문서 기준으로만 정리하면 다음과 같다.

| 항목 | 기대 효과 | 주의점 |
|---|---|---|
| 품질 | Sonnet/Haiku executor에 Opus advisor를 붙여 계획 품질 향상 가능 | 워크로드별 평가 필요 |
| 비용 | executor를 더 큰 모델로 바꾸는 것보다 낮을 수 있음 | advisor 호출 빈도가 높아지면 이점 감소 |
| 지연 | 대부분 토큰은 executor 속도로 생성 | advisor 호출 시점에는 별도 하위 추론 지연 발생 |
| 운영성 | self-escalation 패턴으로 routing 코드 단순화 가능 | 잘못 설계하면 "언제 escalation할지"가 불투명 |

## claude-kit 적용 시 예상 제약

| 제약 | 설명 |
|---|---|
| API 직접 제어 부재 | current repo는 Claude API payload builder가 아님 |
| Codex parity 미완성 | 모델 메타데이터 전파부터 정리 필요 |
| 중앙 모델 정책 부재 | domain별 권장 모델/effort를 저장할 SSOT가 없음 |
| observability 부재 | 어느 단계에서 어느 모델이 실제 선택됐는지 보고가 없음 |
| escalation event spec 부재 | advisor 호출 조건/결과 형식이 정의되어 있지 않음 |

## 적용 가능성 판정

| 분류 | 판정 |
|---|---|
| Anthropic Advisor tool direct integration | 지금은 부적합 |
| advisor-style orchestration policy | 적합 |
| Claude target only MVP | 매우 적합 |
| Claude/Codex 공통 abstraction | 일부 가능, 단 API tool 자체는 공통화 어려움 |

## 현재 repo 범위 판정

| 항목 | 판정 | 설명 |
|---|---|---|
| Phase 4A direct integration | out of scope | Anthropic API request body를 직접 생성하는 런타임이 현재 repo에 없다. |
| Phase 4B orchestration policy | in scope | 현재 repo에서는 ADR/spec/documentation 수준으로만 다룬다. |
| runtime benchmark | separate project | 실제 `Advisor tool` 벤치마크는 별도 wrapper/runtime project에서 수행하는 편이 맞다. |

## 추천 접근

1. `Phase 1A`: `model configuration diagnostic report`부터 구축한다.
2. `Phase 1B`: drift detector와 consistency checker를 추가한다.
3. `Phase 2`: 중앙 `model-policy` 파일의 경로/스키마를 확정한다.
4. `Phase 3`: `codex-model-runtime` Spike가 `PASS`일 때만 emitter parity 수정을 진행한다.
5. `Phase 4B`: 현재 repo 안에서는 `advisor-ready orchestration policy`를 ADR/spec로만 정리한다.
6. Anthropic `Advisor tool` direct integration이 필요하면 별도 runtime wrapper project로 분리한다.
