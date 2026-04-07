# Option B Asset Specification

## Purpose

이 문서는 Option B를 실제로 가능하게 만드는 추가 자산의 최소 동작을 정리한다.
핵심 질문은 아래다.

> 무엇을 먼저 만들고, 각 자산은 정확히 어떤 역할까지 책임져야 하는가?

## Audience

- `skills`, `commands`, `hooks`, `rules`를 설계하거나 구현할 사람
- Option B 문서화를 실제 구현 backlog로 바꾸려는 사람

## Read After

- [01-session-modes-and-handoffs.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/01-session-modes-and-handoffs.md)

## Read Next

- [03-ai-worker-walkthrough.md](/C:/Program Files (user)/mologado/claude-kit/docs/team-orchestration/option-b/03-ai-worker-walkthrough.md)

## Asset Inventory

| 자산 | 종류 | 우선순위 | 주 사용 mode | 핵심 역할 |
| --- | --- | --- | --- | --- |
| `workload-orchestration` | skill | P0 | `Compact`, `Handoff` | 워크로드 문서를 execution-ready bundle로 변환 (프로필 기반) |
| `team-handoff` | skill | P0 | `Handoff`, `Isolated Parallel` | planning output을 bundle로 정리 |
| `Session-Bootstrap Skill` | skill | 조건부 P0 | `Handoff`, `Isolated Parallel` | 이전 bundle을 읽고 다음 stage 시작 |
| `ownership-hook` | hook | P0 | `Isolated Parallel` | owner, scope, blocked-by, write scope 점검 |
| `orchestration-rule` | rule | P0 | 전 mode | stage 책임과 handoff 기준 고정 |
| `handoff-bundle-hook` | hook | P1 | `Handoff`, `Isolated Parallel` | bundle 필수 항목 누락 검사 |
| `/team-run` | command | P1 | 전 mode | 추천 흐름 안내와 진입 보조 |
| `scope-contract` | rule | P1 | `Compact`, `Handoff` | in-scope/out-of-scope/done signal 고정 |
| `doc-sync-trigger` | hook | P1 | `Handoff`, `Isolated Parallel` | verify 후 문서 갱신 타이밍 상기 |

## Asset-by-Asset Minimum Behavior

### `workload-orchestration`

| 항목 | 내용 |
| --- | --- |
| 목적 | 임의 프로젝트의 워크로드 문서를 execution-ready bundle로 변환한다 |
| 입력 | 워크로드 문서 경로 (기획서, 백로그, 요구사항 등) + 선택적 프로필 |
| 출력 | execution-ready bundle (7-item 표준) + 의존성 그래프 + 세션 모드 초안 |
| 최소 동작 | 아래 5단계 참조 |

**5단계 최소 동작**:

```
1. SCAN    — 워크로드 문서를 읽고 작업 단위(패키지/에픽/스프린트 등)를 식별
2. EXTRACT — 각 작업 단위에서 scope, 완료 기준, 선행 조건을 추출
3. BUNDLE  — 작업 단위를 execution-ready bundle(7-item 표준)로 변환
4. GRAPH   — 번들 간 의존성 그래프(DAG) 생성
5. ADVISE  — 워크로드 크기와 리스크 기반으로 세션 모드 초안 제안
```

**프로필(Adapter) 시스템**:

도메인 특화 파싱은 프로필로 분리한다.

| 프로필 | 계층 구조 | 파싱 힌트 | 자동 감지 조건 |
| --- | --- | --- | --- |
| `generic` (기본) | Epic → Task → Subtask | 마크다운 헤딩/체크박스 기반 | 기본값 |
| `ai-worker` | Program → Phase → Package → Ticket | `P{n}-{nn}`, `S{n}-T{nn}` 패턴 | `ai-worker/docs/` 경로 감지 |
| `custom` | 사용자 정의 | `.claude/workload-profile.yaml` | 파일 존재 시 |

프로필 선택 우선순위: 사용자 명시 → `.claude/workload-profile.yaml` → 경로 패턴 자동 감지 → generic

**기존 자산과의 관계**:
- `team-orchestrator`: 범용 팀 구성 + 태스크 분배 (스테이지 내)
- `workload-orchestration`: 범용 워크로드 해석 + 번들 생성 (스테이지 진입 전)
- 두 스킬은 보완적: workload-orchestration이 "무엇을 할지" 해석, team-orchestrator가 "어떻게 나눌지" 실행

### `team-handoff`

| 항목 | 내용 |
| --- | --- |
| 목적 | planning 결과를 handoff bundle 표준으로 정리한다 |
| 입력 | planning 메모, package scope, done signal |
| 출력 | delivery 또는 verification용 bundle |
| 최소 동작 | `source_docs`, `selected_scope`, `out_of_scope`, `done_signal`, `blocking_inputs`, `verification_focus`, `evidence_expectation`를 빠짐없이 정리한다 |

핵심 제약: 출력은 `.claude/handoff.md`를 확장해야 하며, 별도 번들 파일을 생성하면 안 된다.
`/handoff-verify`가 이미 이 파일을 읽는 진입점이므로, 기존 6개 섹션에 3개 추가 필드(`blocking_inputs`, `evidence_expectation`, 명시적 `out_of_scope`)를 확장하는 방식으로 통합한다.

### `Session-Bootstrap Skill`

| 항목 | 내용 |
| --- | --- |
| 목적 | handoff bundle을 읽고 다음 stage를 시작한다 |
| 입력 | bundle 파일 또는 동등한 structured handoff |
| 출력 | 다음 stage에서 읽어야 할 요약, 체크리스트, 추천 agent 구성 |
| 최소 동작 | bundle을 받아 다음 stage의 입력 요약과 시작 checklist를 생성한다 |

이 자산은 Option B 전체의 절대 선행조건은 아니다.
`Compact Mode`만 쓸 때는 없어도 시작할 수 있다.
하지만 `Handoff Mode` 이상에서는 우선순위가 급격히 높아진다.

### `ownership-hook`

| 항목 | 내용 |
| --- | --- |
| 목적 | 병렬 작업의 충돌 가능성을 낮춘다 |
| 이벤트 | `PreToolUse` (Edit\|Write matcher) |
| 입력 | `tool_input.file_path` + `ORCHESTRATION_OWNER_ID` 환경변수 |
| 출력 | owner, write scope, blocked-by 확인 결과. 불일치 시 exit 2 (차단). |
| 최소 동작 | 같은 파일/영역을 여러 흐름이 동시에 소유하는지 경고한다 |

**필수 선행 인프라**:

1. **소유권 레지스트리** (`.claude/orchestration/ownership.json`): `/orchestrate` 커맨드가 팀원 spawn 전에 자동 생성
   ```json
   {
     "owners": [
       { "pattern": "src/domain/**", "owner": "agent-core" },
       { "pattern": "src/ui/**", "owner": "agent-ui" }
     ]
   }
   ```
2. **에이전트 ID 환경변수** (`ORCHESTRATION_OWNER_ID`): 팀원 spawn 시 설정. hook은 이 값으로 현재 에이전트를 식별.
3. **Graceful no-op**: 레지스트리 파일이 없으면 경고 없이 통과 (exit 0). Compact/Handoff 모드에서 불필요한 차단 방지.

### `orchestration-rule`

| 항목 | 내용 |
| --- | --- |
| 목적 | Option B의 역할과 exit 조건을 문서적으로 고정한다 |
| 입력 | stage와 handoff 규칙 |
| 출력 | 일관된 운영 가이드 |
| 최소 동작 | planning, delivery, verification 각각의 책임과 handoff 전 필수 항목을 명시한다 |

### `handoff-bundle-hook` (→ `/handoff-verify` Step 0 내장)

| 항목 | 내용 |
| --- | --- |
| 목적 | verify 품질을 흔드는 bundle 누락을 줄인다 |
| 구현 방식 | 별도 hook이 아닌, `/handoff-verify` 커맨드의 초기 단계(Step 0)로 통합 |
| 입력 | `/handoff-verify` 실행 시 `.claude/handoff.md`의 번들 |
| 출력 | 누락 항목 경고. 누락 시 verify를 진행하지 않고 오퍼레이터에게 보고 |
| 최소 동작 | 최소 7개 bundle 항목 존재 여부를 검사한다 |

별도 hook이 아닌 커맨드 내장인 이유: 슬래시 커맨드(`/handoff-verify`)는 `PreToolUse` 이벤트를 트리거하지 않는다. `PreToolUse`는 도구(Edit, Write, Bash 등) 호출에만 반응하므로, "커맨드 진입" 시점에 hook을 걸 수 없다.

### `/team-run`

| 항목 | 내용 |
| --- | --- |
| 목적 | 운영자가 흐름 조합을 매번 기억하지 않게 돕는다 |
| 입력 | package 선택, 선호 mode |
| 출력 | 추천 실행 순서 |
| 최소 동작 | `Compact`, `Handoff`, `Isolated Parallel` 중 적합한 흐름을 짧게 제안한다 |

## Trigger/Event Mapping

후속 구현 문서에서는 아래 매핑을 기본값으로 본다.

| 자산 | 권장 연결 지점 | 설명 |
| --- | --- | --- |
| `ownership-hook` | `PreToolUse` | edit/write 직전 owner와 scope 점검 |
| `handoff-bundle-hook` | `/handoff-verify` Step 0 내장 | bundle 완전성 검사는 커맨드 초기 단계로 통합. `PreToolUse`는 슬래시 커맨드에 반응하지 않음. |
| `doc-sync-trigger` | `PostToolUse` | verify 완료 뒤 문서 반영 필요성을 상기. 마커 파일 패턴 사용. |
| `status-report-hook` | `TaskCompleted` | 태스크 완료 이벤트로 상태 집계. `Notification` 이벤트는 하네스에 미존재. |

이 표의 목적은 실제 구현 이벤트를 확정하는 것이 아니라,
후속 구현자가 추상 hook 이름에 머물지 않게 만드는 것이다.

## subagent_type Mapping

| 역할 | 권장 `subagent_type` | 이유 |
| --- | --- | --- |
| planning 분석/리뷰 | `Explore` 또는 읽기 중심 타입 | 문서 해석과 검토 비중이 높다 |
| 코드 구현 | `general-purpose` | 편집과 shell 실행이 필요하다 |
| 검증/테스트 | `general-purpose` | 테스트 실행과 결과 확인이 필요하다 |
| 문서 업데이트 | `general-purpose` | 파일 편집이 필요하다 |

## File Ownership / Isolation Strategy

병렬 처리 문서화에는 아래 표를 같이 둔다.

| 전략 | 언제 적합한가 | 주의점 |
| --- | --- | --- |
| `module/file ownership` | 한 세션 내 병렬 분담이 가벼울 때 | ownership만 있고 격리가 없으면 충돌 가능성이 남는다 |
| `directory partitioning` | 프론트/UI와 코어 경계가 명확할 때 | 공유 타입과 공통 파일은 따로 owner를 정해야 한다 |
| `worktree isolation` | 충돌 위험이 높고 병렬 이점이 클 때 | merge/재통합 비용을 같이 감안해야 한다 |

## Dependencies Between Assets

| 선행 자산 | 후행 자산 | 이유 |
| --- | --- | --- |
| `orchestration-rule` | `team-handoff` | 무엇을 넘겨야 하는지 기준이 먼저 필요하다 |
| `workload-orchestration` | `team-handoff` | 무엇을 bundle로 묶을지 먼저 해석해야 한다 |
| `team-handoff` | `Session-Bootstrap Skill` | bootstrap은 bundle 없이는 의미가 약하다 |
| `ownership-hook` | `Isolated Parallel Mode` 운영 | ownership 없는 병렬화는 위험하다 |
| `handoff-bundle-hook` | verification 안정화 | verify 입력 품질을 올린다 |

## Implementation Priority

### Wave 1

- `orchestration-rule`
- `workload-orchestration`
- `team-handoff`
- `ownership-hook`

이 조합이 있으면
Option B를 최소 운영 모델로 시험할 수 있다.

### Wave 2

- `Session-Bootstrap Skill`
- `handoff-bundle-hook`
- `/team-run`
- `scope-contract`
- `doc-sync-trigger`

이 조합이 있으면
`Handoff Mode`와 closure 안정성이 올라간다.

### Wave 3

- `status-report-hook`
- Option C 확장 자산 일부

이 파동은 Option B를 넘어
관제성까지 넓히고 싶을 때 검토한다.

## Practical Default

구현자가 우선 하나만 고른다면,
가장 먼저 정의해야 하는 것은 `team-handoff`가 아니라 `orchestration-rule`이다.
기준이 없으면 bundle과 mode 설명이 계속 흔들리기 때문이다.
