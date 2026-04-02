# Team Orchestration 문서 리뷰 피드백

> 리뷰 일자: 2026-04-02
> 리뷰 대상: `claude-kit/docs/team-orchestration/00~07` 8개 문서, 총 2,645줄
> 교차 검증 범위: `claude-kit/src/`, `.claude/`

---

## 한 줄 결론

문서 자체의 설계 밀도는 높지만, 현재 구현 문서와 목표 설계 문서가 섞여 있다. 구현자가 실제 작업에 들어가면 가장 먼저 막히는 지점은 `실행 주체`, `상태 저장소`, `실재 자산 목록`이 문서마다 다르게 정의되어 있다는 점이다.

---

## 사실 확인

| 항목 | 확인 결과 |
|------|-----------|
| 실제 설치된 에이전트 | 12개 |
| 실제 설치된 커맨드 | 28개 |
| 실제 설치된 스킬 | 23개 |
| 오케스트레이션 전용 자산 | `team-lead.md`, `team-orchestrate/SKILL.md`, `feature-dependency-graph.yaml`, `team-orchestrate-hook.js` 없음 |
| 상태 파일 실재 여부 | `orchestration-state.json`, `stage-manifest.json` 모두 현재 저장소에 없음 |
| 자동 링크 검증 | 깨진 상대 링크 2건 발견 |

리뷰 관점에서 보면 이 문서 세트는 "현재 구현 설명서"라기보다 "구현 직전 설계 패키지"에 가깝다.

---

## 종합 평가

| 항목 | 평가 |
|------|------|
| 설계 방향 | 좋음 |
| 문서 일관성 | 보통 이하 |
| 현재 상태 정확성 | 낮음 |
| 구현 착수 적합성 | 보완 필요 |
| 우선 조치 | 문서 상태 라벨링, 실행 ownership 고정, 상태 저장소 SSOT 고정 |

---

## 주요 이슈

### C-1. 현재 구현 문서처럼 읽히지만 실제로는 future-state 설계가 섞여 있음

**근거**
- `00-overview.md:23-26`은 Team Orchestration이 이미 제공하는 가치처럼 서술한다.
- `01-architecture.md:93-95`는 `orchestration-state.json`을 실제 컴포넌트처럼 설명한다.
- `06-agent-skill-mapping.md:105-169`, `07-integration-plan.md:47-55`는 신규 자산을 설치/배치 전제로 설명한다.
- 실제 저장소에는 `team-lead`, `team-orchestrate`, `feature-dependency-graph.yaml`, `team-orchestrate-hook.js`가 없다.

**영향**
- 독자가 "이미 구현된 AI 팀"으로 이해하기 쉽다.
- 구현 범위와 현재 범위를 혼동해 일정과 기대치가 어긋난다.

**권장 수정**
- 각 문서 상단에 `Status: Proposed / Planned / Implemented` 배지를 넣는다.
- 문서 세트를 `current-state`와 `target-design`으로 분리하거나, 최소한 `00-overview.md`에서 명확히 선언한다.

### C-2. 실행 주체가 문서마다 달라서 구현 ownership이 고정되지 않음

**근거**
- `01-architecture.md:63-68`에서는 `Feature Launcher`가 Skill tool을 직접 호출하는 것처럼 보인다.
- 같은 문서의 `01-architecture.md:141-154`는 Feature Agent가 Skill tool을 사용하는 흐름으로 설명한다.
- `02-team-model.md:34-38`, `02-team-model.md:156-171`은 Feature Agent가 단계별 Task/스킬 호출 주체라고 정의한다.
- `06-agent-skill-mapping.md:23-32`, `06-agent-skill-mapping.md:49-59`는 Team Lead가 Plan/Dev를 직접 수행하는 식으로 읽힌다.
- `04-pipeline-orchestrator.md:83-99`는 command와 agent 레이어를 섞어 표기한다.

**영향**
- Team Lead, Feature Agent, 기존 에이전트 중 누가 무엇을 실행하는지 구현자가 확정할 수 없다.
- 프롬프트 설계, 상태 갱신, 에러 핸들링 책임이 흐려진다.

**권장 수정**
- 단 하나의 canonical execution matrix를 만든다.
- 추천 기준:
  - Team Lead: 스폰, 승인, 집계, 상태 기록만 담당
  - Feature Agent: 단계 실행과 기존 커맨드 호출 담당
  - 기존 specialist agent: 기존 커맨드 내부에서만 사용

### C-3. 상태 저장소 SSOT가 문서마다 다르고 동시성 전략도 충돌함

**근거**
- `00-overview.md:25`, `01-architecture.md:93`, `01-architecture.md:161-215`는 `orchestration-state.json`을 중앙 상태 저장소로 둔다.
- `04-pipeline-orchestrator.md:269`, `05-approval-gates.md:234-259`, `06-agent-skill-mapping.md:136`, `06-agent-skill-mapping.md:163`, `07-integration-plan.md:222-230`은 `stage-manifest.json`을 기준으로 설명한다.
- `04-pipeline-orchestrator.md:271-278`은 agent별 lock-free append + reconcile 전략을 제안한다.
- `07-integration-plan.md:230`, `07-integration-plan.md:272`는 Team Lead 단일 쓰기자 전략을 제안한다.

**영향**
- 어떤 파일을 상태의 정본으로 삼을지 결정할 수 없다.
- race condition 대응 방식이 문서마다 달라 구현이 분기된다.

**권장 수정**
- `orchestration-state.json` 또는 `stage-manifest.json` 중 하나만 SSOT로 선택한다.
- `writer`, `update flow`, `resume rule`, `failure recovery`를 한 문서에 통합한다.
- 다른 문서들은 그 문서를 참조만 하도록 바꾼다.

### H-1. 실제 repo inventory와 문서 inventory가 맞지 않음

**근거**
- `00-overview.md:3`, `00-overview.md:34`, `00-overview.md:141-157`
- `01-architecture.md:84-85`
- `02-team-model.md:267`
- `06-agent-skill-mapping.md:3`, `06-agent-skill-mapping.md:35-45`, `06-agent-skill-mapping.md:246`

문서는 13개 에이전트를 전제하지만 실제 `.claude/agents/`와 `claude-kit/src/*/agents/`에는 12개만 있다. `dev-frontend-reviewer`는 존재하지 않는다.

**영향**
- `06-agent-skill-mapping.md`의 Dev Phase C.fe가 실제 자산에 연결되지 않는다.
- "기존 컴포넌트 수정 ZERO"라는 결론의 신뢰도가 떨어진다.

**권장 수정**
- inventory 표를 실제 repo 기준으로 먼저 바로잡는다.
- 프론트엔드 검증을 agent 기반으로 유지할지, command/skill 기반으로 유지할지 결정해서 문서를 맞춘다.

### H-2. 문서 목차와 상대 링크가 깨져 있어서 읽기 흐름이 끊김

**근거**
- `00-overview.md:206-215`는 실제 존재하지 않는 파일명(`02-dag-scheduler.md`, `03-state-management.md`, `04-feature-agent.md` 등)을 안내한다.
- `04-pipeline-orchestrator.md:334`의 `./03-dag-engine.md` 링크는 깨져 있다.
- `05-approval-gates.md:288`의 `./03-dag-engine.md` 링크도 깨져 있다.

**영향**
- 문서 세트를 처음 읽는 사람이 바로 길을 잃는다.
- 세부 설계가 맞더라도 문서 신뢰도가 크게 떨어진다.

**권장 수정**
- 실제 파일명 기준으로 목차를 다시 작성한다.
- 문서 저장 시 상대 링크 검사를 자동화한다.

### H-3. stage 정의와 step count가 서로 달라 메트릭과 스키마가 흔들림

**근거**
- `03-dependency-engine.md:18-63`은 `estimated_stages: 12`를 기본으로 둔다.
- `04-pipeline-orchestrator.md:83-99`는 `P4-R`, `P5-R`, `E-V`, `E-C`처럼 세분화된 단계를 사용한다.
- `06-agent-skill-mapping.md:156-164`는 `P4.5`, `P5.5`를 별도 단계로 본다.
- `07-integration-plan.md:184-185`의 standard pipeline도 12단계보다 많다.
- 그런데 `07-integration-plan.md:258`은 다시 `8 Feature x 12 steps = 96`으로 계산한다.

**영향**
- 진행률 계산, manifest 스키마, 검증 지표가 모두 흔들린다.
- E2E 성공 기준을 일관되게 정의하기 어렵다.

**권장 수정**
- "단계(stage)"와 "게이트(gate)"를 구분한다.
- canonical stage list를 1곳에서 정의하고 모든 문서가 이를 참조하게 한다.

### M-1. scheduling 알고리즘은 방향은 좋지만 구현 이벤트와 우선순위가 빠져 있음

**근거**
- `03-dependency-engine.md:92-115` Ready Queue 설명에는 `running_set` 정의가 없다.
- `03-dependency-engine.md:176-188`의 `ready_queue.pop_highest_priority()`는 우선순위 기준이 없다.
- `02-team-model.md:78-88`, `01-architecture.md:324-328`도 "빈 슬롯 활용"까지만 말하고 트리거 이벤트를 고정하지 않는다.

**영향**
- 같은 설계를 읽고도 구현자마다 다른 스케줄러를 만들 수 있다.

**권장 수정**
- 우선순위 기준을 명시한다. 예: `priority > dependency depth > FIFO`.
- 슬롯 회수 이벤트를 `Feature Agent completion message`로 고정한다.

### M-2. ds-customizer 예시가 좋은데 일반 규칙처럼 과장된 부분이 있음

**근거**
- `03-dependency-engine.md:410-419`는 Wave와 Master Plan Phase가 자연스럽게 일치한다고 말한다.
- 이 결론은 ds-customizer처럼 의존 그래프가 깔끔한 예시에서는 맞지만, root feature가 여러 개이거나 cross-cutting dependency가 생기면 쉽게 깨진다.

**영향**
- 다른 프로젝트에 적용할 때 "Phase 설계는 DAG만 있으면 자동으로 깔끔해진다"는 오해를 낳는다.

**권장 수정**
- ds-customizer 한정 예시임을 명시한다.
- 일반론에서는 "Wave와 Phase는 일치할 수도, 다를 수도 있다"고 적는 편이 안전하다.

---

## 좋은 점

- `00-overview.md`의 5개 설계 원칙은 방향성이 분명하고 설득력이 있다.
- `02-team-model.md`는 Team Lead / Feature Agent / Review Agent의 역할과 생명주기를 이해하기 쉽게 정리했다.
- `03-dependency-engine.md`의 DAG, cycle detection, failure isolation 설명은 문서 세트 중 가장 구현 친화적이다.
- `07-integration-plan.md`의 단계적 도입 방식은 파일럿 -> 병렬화 -> 복구 확장 순서가 현실적이다.

---

## 권장 수정 순서

### 1차: 문서 신뢰도 복구

1. `00-overview.md`의 목차와 실제 파일명을 맞춘다.
2. `04`, `05`의 깨진 상대 링크를 수정한다.
3. 문서 상단에 `현재 구현`인지 `제안 설계`인지 상태를 명시한다.
4. inventory를 실제 repo 기준으로 바로잡는다.

### 2차: 구현 가능성 확보

1. Team Lead / Feature Agent / specialist agent의 ownership을 1장의 표로 확정한다.
2. 상태 저장소를 하나로 통일하고 single-writer 전략을 명시한다.
3. stage 정의를 canonical list로 고정한다.
4. scheduling priority와 slot recycle 이벤트를 문서화한다.

### 3차: 구현 착수 문서로 승격

1. Feature Agent prompt template를 별도 문서로 추가한다.
2. message schema와 error schema를 샘플 payload까지 포함해 표준화한다.
3. "현재 구현 범위"와 "다음 구현 범위"를 체크리스트로 나눠서 릴리즈 노트처럼 관리한다.

---

## 최종 판단

현재 문서 세트는 "생각이 잘 정리된 설계 문서"로서는 강하다. 다만 "현재 구현된 AI 팀 설명서"로 사용하기에는 위험하다. 먼저 문서의 시제를 바로잡고, execution ownership과 state SSOT를 고정한 뒤에야 구현 가이드로 신뢰할 수 있다.
