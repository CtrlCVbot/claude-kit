# Claude Kit Agent Architecture Design

> 에이전트 기능 설계 명세서 v1.0
> 작성일: 2026-04-07

## 1. 현황 분석

### 1.1 현재 에이전트 인벤토리 (12개)

| Domain | Agent | Model | Tools | Tier | 역할 |
|--------|-------|-------|-------|------|------|
| dev | dev-architect | opus | Read,Grep,Glob | Analyst | 아키텍처 분석 (read-only) |
| dev | dev-code-reviewer | sonnet | Read,Grep,Glob | Analyst | 코드 품질 리뷰 (read-only) |
| dev | dev-database-reviewer | opus | Read,Grep,Glob | Analyst | DB 스키마/쿼리 리뷰 (read-only) |
| dev | dev-security-reviewer | opus | Read,Grep,Glob | Analyst | 보안 취약점 분석 (read-only) |
| dev | dev-doc-updater | sonnet | Read,Grep,Glob | Analyst | 문서 정합성 검사 (read-only) |
| dev | dev-verify-agent | sonnet | Read,Write,Edit,Bash,Grep,Glob | Specialist | 검증 파이프라인 실행 |
| plan | plan-idea-collector | sonnet | Read,Grep,Glob,Write,Edit | Specialist | 아이디어 수집/구조화 |
| plan | plan-idea-screener | opus | Read,Grep,Glob | Analyst | RICE 스크리닝 |
| plan | plan-prd-writer | opus | Read,Grep,Glob,Write,Edit | Specialist | 10섹션 PRD 작성 |
| plan | plan-reviewer | sonnet | Read,Grep,Glob | Analyst | 요구사항 리뷰 |
| plan | plan-wireframe-designer | sonnet | Read,Grep,Glob,Write,Edit | Specialist | 와이어프레임 설계 |
| plan | plan-stitch-integrator | opus | Read,Grep,Glob,Write,Edit | Specialist | PRD-아키텍처 통합 |

### 1.2 에이전트 파일 표준 구조

모든 에이전트는 아래 구조를 따른다. 참조 구현: `src/dev/agents/dev-architect.md`

```markdown
---
name: {domain-prefix}-{name}
description: {1줄 설명. 트리거 조건 포함}
tools: ["Read", "Grep", "Glob"]
model: opus | sonnet | haiku
memory: project | session
color: {UI 색상}
---

<Agent_Prompt>
  <Role> 역할 정의 + 담당/비담당 범위 </Role>
  <Why_This_Matters> 존재 이유 </Why_This_Matters>
  <Success_Criteria> 성공 기준 목록 </Success_Criteria>
  <Constraints> 제약 조건 </Constraints>
  <Investigation_Protocol> 단계별 조사 프로토콜 </Investigation_Protocol>
  <Tool_Usage> 도구 사용 지침 </Tool_Usage>
  <Execution_Policy> 실행 정책 </Execution_Policy>
  <Output_Format> 출력 형식 </Output_Format>
  <Failure_Modes_To_Avoid> 회피할 실패 모드 </Failure_Modes_To_Avoid>
  <Final_Checklist> 최종 체크리스트 </Final_Checklist>
</Agent_Prompt>
```

### 1.3 식별된 갭

| # | 갭 | 영향 | 근거 |
|---|---|------|------|
| G1 | core 도메인에 에이전트 0개 | 도메인 간 조율 불가 | `src/core/agents/` 디렉토리 미존재 |
| G2 | 오케스트레이션 에이전트 부재 | Option B 운영 모델 실행 불가 | `docs/team-orchestration/06-recommended-operating-model.md` |
| G3 | 테스트 전략 에이전트 부재 | TDD(Golden Principle #3)가 guard만으로 집행 | `dev-tdd-guard.js`만 존재 |
| G4 | 리팩토링 전담 에이전트 부재 | `/dev-refactor` 명령은 있으나 전문 분석 없음 | `src/dev/commands/dev-refactor.md` |
| G5 | 성능 리뷰 에이전트 부재 | 성능 관련 분석을 dev-architect가 부수적으로 처리 | 전담 없음 |
| G6 | 세션 관찰 에이전트 부재 | continuous-learning v2가 haiku 모델 관찰자를 요구 | `src/core/skills/continuous-learning/SKILL.md` |
| G7 | Ops/배포 리뷰 에이전트 부재 | CI/CD, 인프라 변경 리뷰 불가 | 전담 없음 |
| G8 | 로드맵 종합 에이전트 부재 | 다수 PRD/Feature 간 우선순위 조율 불가 | plan 도메인에 종합 분석 없음 |

---

## 2. 에이전트 분류 체계 (Taxonomy)

### 3-Tier 모델

에이전트를 도구 접근 범위와 역할에 따라 3단계로 분류한다.

```
Tier 1: Analysts (읽기 전용, 분석/진단)
  tools: [Read, Grep, Glob]
  역할: 코드/문서 분석, 리뷰, 진단
  특징: 부수효과 없음. 안전하게 병렬 실행 가능.

Tier 2: Specialists (실행 가능, 특정 산출물 생성)
  tools: [Read, Grep, Glob, Write, Edit, Bash]
  역할: PRD 작성, 검증 실행, 문서 생성
  특징: 파일 시스템 변경. 소유권 충돌 주의 필요.

Tier 3: Orchestrators (조율, 다른 에이전트 스폰)
  tools: [Read, Grep, Glob, Task, Bash]
  역할: 팀 구성, 작업 분배, 결과 종합
  특징: 다른 에이전트를 스폰하고 결과를 종합. 최상위 조율자.
```

### 현재 Tier 분포

| Tier | 수량 | 에이전트 |
|------|------|---------|
| Analyst | 7 | dev-architect, dev-code-reviewer, dev-database-reviewer, dev-security-reviewer, dev-doc-updater, plan-idea-screener, plan-reviewer |
| Specialist | 5 | dev-verify-agent, plan-idea-collector, plan-prd-writer, plan-wireframe-designer, plan-stitch-integrator |
| Orchestrator | **0** | **(핵심 갭)** |

---

## 3. 신규 에이전트 설계 (8개)

### 3.1 Priority 0 (즉시 필요)

Option B 운영 모델 실행의 전제 조건.

#### `core-orchestrator` (Tier 3 - Orchestrator)

| 항목 | 내용 |
|------|------|
| **위치** | `src/core/agents/core-orchestrator.md` |
| **도메인** | core (항상 설치) |
| **모델** | opus |
| **도구** | Read, Grep, Glob, Task, Bash |
| **메모리** | project |
| **색상** | orange |

**역할**: Option B Hybrid Claude Team의 중앙 조율자. Planning Lead / Delivery Lead / Assurance Lead 역할을 상황에 따라 전환한다.

**핵심 기능**:
- 워크로드 문서를 execution-ready bundle(7-item 표준)로 변환
- 단계별 에이전트 스폰 및 결과 수집 (Task 도구)
- handoff bundle 필수 항목 검증 (source_docs, selected_scope, out_of_scope, done_signal, blocking_inputs, verification_focus, evidence_expectation)
- ownership registry(`.claude/orchestration/ownership.json`) 생성/관리
- 세션 모드 판단: Compact / Handoff / Isolated Parallel

**Option B 자산 매핑**:
- `workload-orchestration` 스킬 기능 통합
- `team-handoff` 스킬 기능 통합
- `orchestration-rule` 규칙 집행

**관계**:
- `docs/team-orchestration/option-b/02-asset-specification.md`의 Wave 1 자산을 구현
- `docs/team-orchestration/06-recommended-operating-model.md`의 Stage별 팀 구성을 실행

#### `dev-test-strategist` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/dev/agents/dev-test-strategist.md` |
| **도메인** | dev |
| **모델** | sonnet |
| **도구** | Read, Grep, Glob, Bash |
| **메모리** | project |
| **색상** | green |

**역할**: TDD Red-Green-Improve 사이클의 전략 수립 전문가. 테스트 커버리지 분석, 테스트 우선순위, 테스트 아키텍처를 조언한다.

**핵심 기능**:
- 테스트 커버리지 분석 및 갭 식별 (Bash로 vitest/jest 커버리지 실행)
- 테스트 우선순위 추천 (경계값, 에러 케이스, 회귀 위험)
- 테스트 파일 구조 및 네이밍 가이드
- E2E / 통합 / 단위 테스트 전략 조언
- 테스트 더블(mock/stub/spy) 사용 판단 기준 제시

**기존 자산과의 관계**:
- `dev-tdd-guard.js` (hook): 테스트 없이 코드 편집을 차단. guard는 **차단만**, strategist는 **전략 제시**.
- `dev-tdd-workflow` (skill): TDD 워크플로우 실행. skill은 **절차**, strategist는 **판단**.
- `dev-verify-agent`: 검증 실행. verify는 **사후 검증**, strategist는 **사전 전략**.

---

### 3.2 Priority 1 (Option B 안정화)

Option B 운영을 안정적으로 만드는 보조 에이전트.

#### `dev-refactor-analyst` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/dev/agents/dev-refactor-analyst.md` |
| **도메인** | dev |
| **모델** | sonnet |
| **도구** | Read, Grep, Glob |
| **메모리** | project |
| **색상** | yellow |

**핵심 기능**:
- 코드 스멜 패턴 탐지: God class, Feature envy, Long method, Shotgun surgery, Primitive obsession
- 리팩토링 안전성 평가: 테스트 커버리지 확인 + 변경 영향 범위 분석
- 리팩토링 경로 제시: Extract/Move/Rename + file:line 참조
- 복잡도 메트릭 비교: 리팩토링 전후 cyclomatic complexity

**기존 자산과의 관계**:
- `dev-refactoring` (skill): 리팩토링 패턴과 절차 제공
- `/dev-refactor` (command): 리팩토링 실행 오케스트레이션

#### `dev-perf-reviewer` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/dev/agents/dev-perf-reviewer.md` |
| **도메인** | dev |
| **모델** | sonnet |
| **도구** | Read, Grep, Glob, Bash |
| **메모리** | project |
| **색상** | red |

**핵심 기능**:
- DB 쿼리 성능 분석: N+1, 인덱스 누락, 과도한 JOIN, 불필요한 SELECT *
- 프론트엔드 렌더링 분석: 불필요한 리렌더, 무거운 연산, useMemo/useCallback 누락
- 번들 크기 분석: 트리쉐이킹, 동적 임포트 기회, 대형 의존성
- 메모리 패턴 분석: 이벤트 리스너 누수, 캐시 미스, 순환 참조

#### `core-session-observer` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/core/agents/core-session-observer.md` |
| **도메인** | core (항상 설치) |
| **모델** | **haiku** |
| **도구** | Read, Grep, Glob |
| **메모리** | session |
| **색상** | gray |

**역할**: `continuous-learning-v2` 스킬의 관찰자 에이전트. 세션 내 행동 패턴을 감지하고 instinct를 생성한다.

**핵심 기능**:
- 사용자 수정 패턴 감지 (corrections → feedback instinct)
- 에러 해결 패턴 추출 (error-fix pairs → resolution instinct)
- 반복 워크플로우 탐지 (3회 이상 반복 → skill/command 후보)
- instinct 신뢰도 스코어링 (0.3~0.9)
- instinct 저장: `~/.claude/homunculus/instincts/`

**Haiku 모델 선택 이유**: 경량 관찰 작업에 최적. 토큰 비용 절감. 높은 추론 성능이 불필요한 패턴 매칭 작업.

---

### 3.3 Priority 2 (확장)

전문 도메인 커버리지 확대를 위한 에이전트.

#### `dev-ops-reviewer` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/dev/agents/dev-ops-reviewer.md` |
| **도메인** | dev |
| **모델** | sonnet |
| **도구** | Read, Grep, Glob |
| **메모리** | project |
| **색상** | purple |

**핵심 기능**:
- CI/CD 설정 리뷰: GitHub Actions workflow, 빌드 파이프라인, 캐시 전략
- Docker/컨테이너 분석: 멀티스테이지 빌드, 이미지 크기, 보안 베이스라인
- 환경변수 및 시크릿 관리 패턴 검증
- 배포 전략 리뷰: rollback, health check, blue-green/canary

#### `plan-roadmap-synthesizer` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/plan/agents/plan-roadmap-synthesizer.md` |
| **도메인** | plan |
| **모델** | opus |
| **도구** | Read, Grep, Glob |
| **메모리** | project |
| **색상** | blue |

**핵심 기능**:
- 다수 Feature 간 의존성 그래프(DAG) 생성
- 리소스/일정 충돌 식별
- 우선순위 재조정 추천 (RICE 점수 기반)
- 기술 부채 vs 신규 기능 밸런스 분석

#### `dev-observability-agent` (Tier 1 - Analyst)

| 항목 | 내용 |
|------|------|
| **위치** | `src/dev/agents/dev-observability-agent.md` |
| **도메인** | dev |
| **모델** | sonnet |
| **도구** | Read, Grep, Glob |
| **메모리** | project |
| **색상** | teal |

**핵심 기능**:
- 로깅 패턴 일관성 검사 (구조화된 로깅, 로그 레벨 적절성)
- 에러 추적 커버리지 분석 (catch 블록 내 로깅 누락)
- 메트릭 수집 포인트 검증 (비즈니스 메트릭, 기술 메트릭)
- 알림/알람 설정 적절성 리뷰

---

## 4. 에이전트 상호작용 패턴

### 4.1 파이프라인 패턴 (순차)

전체 워크플로우를 단계별로 진행하는 패턴.

```
core-orchestrator
  → plan-* agents (P1~P7)
  → /plan-bridge
  → dev-* agents (A~D)
  → dev-verify-agent (E)
```

core-orchestrator가 Planning Lead → Delivery Lead → Assurance Lead로 역할을 전환하며 전체 흐름을 조율한다.

### 4.2 Hub-and-Spoke 패턴 (병렬)

하나의 단계 내에서 다수 분석을 병렬 실행하는 패턴.

```
core-orchestrator (hub)
  ├── dev-architect (spoke)
  ├── dev-code-reviewer (spoke)
  ├── dev-security-reviewer (spoke)
  ├── dev-test-strategist (spoke)
  └── dev-perf-reviewer (spoke)
```

core-orchestrator가 Task 도구로 Tier 1 에이전트를 병렬 스폰하고 결과를 종합한다.

### 4.3 Peer Review 패턴

상호 보완적 분석을 위한 순차적 리뷰 체인.

```
dev-code-reviewer ←→ dev-security-reviewer    (품질 + 보안)
dev-architect ←→ dev-perf-reviewer             (설계 + 성능)
dev-test-strategist ←→ dev-verify-agent        (전략 + 실행)
dev-refactor-analyst ←→ dev-code-reviewer      (리팩토링 + 품질)
```

### 4.4 Guard-Strategy 패턴

Hook이 차단하고, Agent가 전략을 제시하는 보완 관계.

```
dev-tdd-guard (차단) → dev-test-strategist (전략)
dev-db-guard (차단) → dev-database-reviewer (분석)
ownership-hook (차단) → core-orchestrator (조율)
dev-feature-scope-guard (차단) → dev-architect (범위 판단)
```

### 4.5 Observer 패턴

세션 관찰과 학습 피드백 루프.

```
core hooks (PostToolUse)
  → core-session-observer (패턴 감지)
  → instinct 생성 (0.3~0.9)
  → continuous-learning-v2 (진화)
  → 새로운 skill/command/agent 후보
```

---

## 5. 구현 로드맵

### Wave 1 (P0 - 기반)

| 순서 | 작업 | 산출물 |
|------|------|--------|
| 1 | `src/core/agents/` 디렉토리 생성 | 디렉토리 |
| 2 | `core-orchestrator.md` 작성 | 에이전트 파일 |
| 3 | `dev-test-strategist.md` 작성 | 에이전트 파일 |
| 4 | `scripts/setup.js` core agents 처리 확인 | 설치 검증 |

**참고**: `setup.js`의 `emitClaude` 함수는 이미 `COMPONENT_DIRS`에 `agents` 카테고리를 포함하고 있어, `src/core/agents/` 디렉토리만 추가하면 자동으로 처리된다.

### Wave 2 (P1 - 안정화)

| 순서 | 작업 | 산출물 |
|------|------|--------|
| 5 | `dev-refactor-analyst.md` 작성 | 에이전트 파일 |
| 6 | `dev-perf-reviewer.md` 작성 | 에이전트 파일 |
| 7 | `core-session-observer.md` 작성 | 에이전트 파일 |
| 8 | 관련 commands/skills에서 새 에이전트 참조 추가 | 기존 파일 수정 |

### Wave 3 (P2 - 확장)

| 순서 | 작업 | 산출물 |
|------|------|--------|
| 9 | `dev-ops-reviewer.md` 작성 | 에이전트 파일 |
| 10 | `plan-roadmap-synthesizer.md` 작성 | 에이전트 파일 |
| 11 | `dev-observability-agent.md` 작성 | 에이전트 파일 |

---

## 6. 변경 대상 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/core/agents/` | 신규 디렉토리 | core-orchestrator.md, core-session-observer.md |
| `src/dev/agents/` | 신규 파일 추가 | dev-test-strategist.md, dev-refactor-analyst.md, dev-perf-reviewer.md, dev-ops-reviewer.md, dev-observability-agent.md |
| `src/plan/agents/` | 신규 파일 추가 | plan-roadmap-synthesizer.md |
| `docs/guide/09-architecture.md` | 수정 | 에이전트 카탈로그 테이블 업데이트 (12 → 20) |
| `docs/guide/00-overview.md` | 수정 | 컴포넌트 수 업데이트 |

### 재사용 패턴

| 참조 파일 | 재사용 대상 |
|----------|------------|
| `src/dev/agents/dev-architect.md` | Agent_Prompt XML 구조, Investigation Protocol, Output Format |
| `src/dev/agents/dev-verify-agent.md` | 구조화된 출력 (PASS/FAIL), 자동수정 패턴, Execution Policy |
| `src/plan/agents/plan-prd-writer.md` | Specialist 에이전트의 Write/Edit 사용 패턴 |
| `scripts/setup.js` | emitClaude 함수 (COMPONENT_DIRS에 'agents' 포함) |

---

## 7. 완료 후 인벤토리

### 도메인별

| Domain | 현재 | 추가 | 합계 |
|--------|------|------|------|
| core | 0 | 2 | **2** |
| dev | 6 | 5 | **11** |
| plan | 6 | 1 | **7** |
| **합계** | **12** | **8** | **20** |

### Tier별

| Tier | 현재 | 추가 | 합계 |
|------|------|------|------|
| Analyst | 7 | 6 | **13** |
| Specialist | 5 | 0 | **5** |
| Orchestrator | 0 | 1 | **1** |
| Observer | 0 | 1 | **1** |
| **합계** | **12** | **8** | **20** |

### 모델별

| Model | 현재 | 추가 | 합계 |
|-------|------|------|------|
| opus | 5 | 2 | **7** |
| sonnet | 7 | 5 | **12** |
| haiku | 0 | 1 | **1** |
| **합계** | **12** | **8** | **20** |

---

## 8. 검증 방법

| 검증 유형 | 방법 | 성공 기준 |
|----------|------|----------|
| 구조 검증 | 각 에이전트 파일이 YAML frontmatter + Agent_Prompt XML 준수 확인 | 모든 필수 섹션(Role~Final_Checklist) 존재 |
| 설치 검증 | `node scripts/setup.js` 실행 후 `.claude/agents/` 확인 | 20개 에이전트 파일 정상 복사 |
| 호출 테스트 | Agent 도구로 개별 에이전트 스폰 | Role 인식, 도구 제약, 출력 형식 준수 |
| 통합 테스트 | core-orchestrator → Task → dev-* 병렬 스폰 | 결과 종합 및 반환 정상 |

---

## 관련 문서

- [Option B 추천 운영 모델](../team-orchestration/06-recommended-operating-model.md)
- [Option B 자산 명세](../team-orchestration/option-b/02-asset-specification.md)
- [아키텍처 가이드](../guide/09-architecture.md)
- [워크플로우 개요](../guide/00-overview.md)
