# Component Specs

- 문서 ID: CAI-NEW-04
- 목적: `copy` 도메인에 추가할 agents, schemas, commands, hooks, rules, skills의 구현 contract를 정의한다.
- 선행 문서: [02-target-architecture](./02-target-architecture.md), [03-workflow-and-pipeline](./03-workflow-and-pipeline.md)
- 원본 참조: `archive/2026-04-16-original/` CAI-02 ~ CAI-07

---

## 1. Agents (4개)

### 1.1 Agent 총괄

| Agent | Source path | Deploy path | Role | Exclusions |
| --- | --- | --- | --- | --- |
| `copy-fidelity` | `src/claude/copy/agents/copy-fidelity.md` | `.claude/agents/copy-fidelity.md` | 시각적 갭 분석 (레이아웃, 타이포그래피, 간격, 카드, CTA, 구분선) | 코드 수정, evidence 없는 판단, hover/motion 분석 (CAI-03 담당) |
| `copy-interaction-fidelity` | `src/claude/copy/agents/copy-interaction-fidelity.md` | `.claude/agents/copy-interaction-fidelity.md` | 인터랙션 갭 분석 (호버, 스티키, 스크롤, 메뉴, 상태 전환) | 정적 visual gap 중복 분석, 코드 수정 |
| `copy-reference-baseline` | `src/claude/copy/agents/copy-reference-baseline.md` | `.claude/agents/copy-reference-baseline.md` | 캡처 매니페스트, 뷰포트 표준, 상태 네이밍, 페어링 검증 | visual/interaction 원인 판단, 실제 캡처 스크립트 구현 |
| `copy-qa-reviewer` | `src/claude/copy/agents/copy-qa-reviewer.md` | `.claude/agents/copy-qa-reviewer.md` | QA 검증 (빌드, 배리언트 가드, 스크린샷 diff, 인터랙티브 증거, 문서 추적성) | 최종 fidelity 승인 (사용자 gate로 분리) |

### 1.2 시나리오 조건

| Agent | 시나리오 C (충실도 교정) | 시나리오 A/B (백지/부분 카피) | Dev Feature |
| --- | --- | --- | --- |
| `copy-fidelity` | 기획 시 갭 분석 (PRD 전) | QA 시점에서만 동작 (구현 후 비교) | 미사용 |
| `copy-interaction-fidelity` | 기획 시 갭 분석 (PRD 전) | QA 시점에서만 동작 (구현 후 비교) | 미사용 |
| `copy-reference-baseline` | 원본(live) + 현재(current) 캡처 | 원본(live) 캡처만 (current는 QA 시점) | 미사용 |
| `copy-qa-reviewer` | 기획 시 식별된 갭 닫힘 재검증 | 최초 copy 비교 (원본 vs 구현 결과) | `/dev-verify`만 사용 |

### 1.3 WBS 매핑

각 에이전트의 산출물은 WBS 4계층에 매핑된다.

| Agent | 주요 산출물 | WBS 매핑 |
| --- | --- | --- |
| `copy-fidelity` | Visual Gap Row (`VF-*`) | Story 계층 `S-{AREA}-{NN}`에 1:1 매핑 |
| `copy-interaction-fidelity` | Interaction State Map (`IF-*`) | Story 계층 `S-{AREA}-{NN}`에 1:1 매핑 |
| `copy-reference-baseline` | Evidence Manifest | Feature/Story 수준의 캡처 범위 정의 |
| `copy-qa-reviewer` | QA Result Report | Story/Task 수준의 검증 결과 |

### 1.4 YAML Frontmatter 템플릿

모든 에이전트는 YAML frontmatter를 파일 최상단에 배치한다.

```yaml
# copy-fidelity
---
name: copy-fidelity
description: 기준 화면 대비 시각적 충실도 갭을 evidence 기반으로 분석하는 에이전트. 레이아웃, 타이포그래피, 간격, 카드, CTA, 구분선을 검사한다.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

```yaml
# copy-interaction-fidelity
---
name: copy-interaction-fidelity
description: 호버, 스티키, 스크롤, 메뉴 등 상태 전환 경험의 갭을 분석하는 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

```yaml
# copy-reference-baseline
---
name: copy-reference-baseline
description: 캡처 매니페스트, 뷰포트 표준, 상태 네이밍을 정의하는 레퍼런스 베이스라인 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

```yaml
# copy-qa-reviewer
---
name: copy-qa-reviewer
description: 빌드, 배리언트 가드, 스크린샷 diff, 인터랙티브 증거를 검증하는 QA 리뷰 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### 1.5 기존 컴포넌트 수정 스펙

copy 도메인 도입 시 기존 plan/dev 컴포넌트도 수정이 필요하다.

#### 1.5.1 Plan 도메인 수정

| 컴포넌트 | 소스 경로 | 수정 내용 |
|---------|---------|---------|
| `/plan-draft` | `src/claude/plan/commands/plan-draft.md` | 출력에 시나리오(A/B/C) + Feature 유형(copy/dev) + Lite/Standard 태깅 추가. 판정 의사결정 트리 프롬프트에 포함 |
| `/plan-prd` | `src/claude/plan/commands/plan-prd.md` | 시나리오 C 2-pass 모드 지원: 입력에 `mode: scope \| detail` 추가. scope 모드 = 영역/뷰포트/우선순위만, detail 모드 = 갭 데이터 기반 acceptance criteria |
| `/plan-bridge` | `src/claude/plan/commands/plan-bridge.md` | bridge context에 `Feature Type: copy \| dev`, `Scenario: A \| B \| C`, `Copy Skip: true/false` 메타데이터 추가 |
| `/plan-idea` | `src/claude/plan/commands/plan-idea.md` | idea 등록 시 WBS Epic 태깅(`E-{NN}`) 지원 |
| `/plan-screen` | `src/claude/plan/commands/plan-screen.md` | RICE 스크리닝에 충실도 해석 추가 (Reach=뷰포트/섹션, Impact=충실도차이감소, Confidence=증거품질, Effort=코드+캡처+QA비용) |
| `/plan-review` | `src/claude/plan/commands/plan-review.md` | PCC에 copy 시나리오 C 정합성 검증 추가: 갭 보드 항목이 Detail PRD acceptance criteria에 매핑되는지 확인 |
| `plan-idea-collector` | `src/claude/plan/agents/plan-idea-collector.md` | 에이전트 프롬프트에 시나리오 태깅 로직 추가 |
| `plan-prd-writer` | `src/claude/plan/agents/plan-prd-writer.md` | 2-pass PRD 모드 인식: scope 모드에서는 섹션 1-3만, detail 모드에서는 갭 데이터 포함 |
| `plan-reviewer` | `src/claude/plan/agents/plan-reviewer.md` | PCC 체크리스트에 copy 시나리오 C 항목 추가 |

#### 1.5.2 Dev 도메인 수정

| 컴포넌트 | 소스 경로 | 수정 내용 |
|---------|---------|---------|
| `/dev-feature` | `src/claude/dev/commands/dev-feature.md` | 전제 조건 추가: bridge context의 Feature Type 확인. type=copy이면 copy 도메인으로 라우팅 안내 |
| `/dev-run` | `src/claude/dev/commands/dev-run.md` | Story ID(`S-{AREA}-{NN}`) 입력 수용. copy 도메인에서 넘어온 실행 단위 추적 |
| `dev-verify-agent` | `src/claude/dev/agents/dev-verify-agent.md` | Feature 유형 인식: copy Feature는 `/copy-verify` 결과도 확인, dev Feature는 `/dev-verify`만 |
| `dev-tdd-guard.js` | `src/claude/dev/hooks/dev-tdd-guard.js` | copy Feature의 시각적 작업(CSS, 레이아웃)에서는 TDD 패턴이 다를 수 있음을 인식. 완화 조건 추가 검토 |
| `dev-feature-scope-guard.js` | `src/claude/dev/hooks/dev-feature-scope-guard.js` | WBS Story 범위 인식: copy 도메인에서 넘어온 Story 범위도 유효한 scope로 인정 |

#### 1.5.3 Core 도메인 수정

| 컴포넌트 | 소스 경로 | 수정 내용 |
|---------|---------|---------|
| `verification.md` | `src/claude/core/rules/verification.md` | 시나리오별 검증 기준 참조 추가: "copy 도메인이 활성화된 경우 시나리오별 증거 요구사항은 copy-evidence.md를 따른다" |
| `interaction.md` | `src/claude/core/rules/interaction.md` | 시나리오 판정 게이트 UX 패턴 추가: "/plan-draft에서 시나리오/Feature 유형을 사용자에게 확인" |

> **중요**: 기존 컴포넌트 수정은 copy 도메인 A-1 인프라 생성 이후, A-0 단계에서 수행한다. 기존 도메인의 기능이 깨지지 않도록 회귀 확인 필수.

### 1.5.4 Architecture Binding 적용

copy Feature도 구현 단계에서 `/dev-run`을 사용하므로, architecture binding을 동일하게 적용한다:

- `06-architecture-binding.md`가 존재해야 `/dev-run` 실행 가능
- `dev-feature-scope-guard.js`가 copy Feature의 코드 편집도 범위 검증
- copy Feature의 binding에는 **evidence 경로**도 포함:

```markdown
## Allowed Paths (copy Feature 예시)
- `apps/web/src/components/header/` (구현 대상)
- `apps/web/src/styles/header.css` (스타일 대상)

## Allowed Evidence Paths
- `.plans/features/active/{slug}/evidence/` (스크린샷, 캡처)
- `.plans/features/active/{slug}/screenshots/` (비교 이미지)
```

> `dev-feature-scope-guard.js`가 evidence 경로도 허용하도록, binding 파일에 evidence 경로를 명시한다. 이를 통해 scope guard와 evidence 파일 생성이 공존한다.

### 1.6 Agent Prompt Format

본문은 `<Agent_Prompt>` XML 블록으로 감싸고 최소 아래 섹션을 포함한다.

```xml
<Agent_Prompt>
  <Role>...</Role>
  <Inputs>...</Inputs>
  <Constraints>...</Constraints>
  <Workflow>...</Workflow>
  <Output_Format>...</Output_Format>
  <Gate_Rules>...</Gate_Rules>
</Agent_Prompt>
```

---

## 2. Schemas

### 2.1 Visual Gap Row Schema

시각적 갭은 반드시 아래 스키마로 작성한다.

| Column | Description | Example |
| --- | --- | --- |
| Gap ID | `VF-{SECTION}-{NN}` 형식 | `VF-HERO-01` |
| Area | 페이지 영역 | Hero, Header, News, Footer 등 |
| Viewport | 공식 뷰포트 또는 `all` | `1440`, `1280`, `1024`, `768`, `390`, `all` |
| Current State | 현재 구현의 관찰 내용 | CTA가 일반 버튼처럼 보임 |
| Reference State | 원본의 관찰 내용 | dark callout box 인상이 강함 |
| Difference | 차이 원인 | mobile first viewport의 무게감이 약함 |
| Proposed Adjustment | 조정 후보 | CTA surface, padding, contrast 조정 |
| Evidence | screenshot/report 경로 | `output/evidence/vf-hero-01.png` |
| Verification | 조정 후 확인 방법 | 390 crop 비교 |
| Priority | 우선순위 | `P0`, `P1`, `P2` |
| Gate | 사용자 gate 필요 여부 | `user-review`, `self-review` |
| WBS_ID | WBS Story 계층 매핑 ID | `S-HERO-01` |

우선순위 기준:

| Priority | Criteria |
| --- | --- |
| P0 | 첫 인상 또는 원본 카피 체감을 크게 바꾸는 차이 |
| P1 | 섹션별 완성도를 낮추는 반복 차이 |
| P2 | 특정 viewport나 세부 상태에서만 보이는 차이 |

### 2.2 Interaction State Map Schema

인터랙션 상태는 반드시 아래 스키마로 정리한다.

| Column | Description | Example |
| --- | --- | --- |
| State ID | `IF-{AREA}-{STATE}-{NN}` 형식 | `IF-HEADER-HOVER-01` |
| Area | 컴포넌트 영역 | Header, MegaMenu, Sticky, Chooser, CTA, Commitments |
| Trigger | 상태 시작 입력 | hover, click, scrollY, focus, keyboard |
| Entry Condition | 상태 시작 조건 | `Our Company` pointer enter |
| Active Visual | 활성 상태 시각 요소 | header 아래 submenu panel, active nav text |
| Motion | 모션 속성 | duration, easing, opacity, transform, stagger |
| Exit Condition | 상태 종료 조건 | pointer leave 또는 다른 nav 진입 |
| Reference Evidence | 원본 기준 캡처/관찰 경로 | live hover capture path |
| Current Evidence | 현재 구현 캡처/관찰 경로 | current hover capture path |
| Gap | 차이 요약 | panel height/type density 차이 |
| Verification | 재확인 방법 | hover sequence capture |
| Gate | 사용자 gate 필요 여부 | `user-review`, `self-review` |
| WBS_ID | WBS Story 계층 매핑 ID | `S-HEADER-01` |

### 2.3 Evidence Manifest Schema

캡처 매니페스트는 최소 아래 필드를 가져야 한다.

| Field | Description | Example |
| --- | --- | --- |
| `capture_id` | 고유 ID | `pkg-live-1440-fullpage` |
| `source` | 출처 | `live`, `current`, `approved`, `demo` |
| `variant` | 배리언트 | `turner`, `demo`, `none` |
| `viewport` | 공식 뷰포트 | `1440`, `1280`, `1024`, `768`, `390` |
| `state` | 캡처 상태 | `fullpage`, `idle`, `header-hover-nav`, `menu-open` |
| `url` | 기준 URL 또는 로컬 URL | `https://example.com/` |
| `file_path` | evidence 파일 경로 | `output/playwright/.../header-hover.png` |
| `captured_at` | 캡처 날짜/시간 | `2026-04-15` |
| `status` | 상태 | `required`, `captured`, `missing`, `stale`, `deferred` |
| `scenario` | 시나리오 (A/B/C) | `C` |
| `paired_with` | 비교 대상 capture_id | `pkg-current-1440-header-hover-nav` |
| `notes` | 품질/주의사항 | `live panel partially animated` |

파일명 패턴: `{source}-{variant}-{viewport}-{state}.{ext}`

시나리오별 페어링:
- **A/B**: `paired_with`는 기획 시점에 불필요 (QA 시점에서 페어링)
- **C**: 기획 시 원본+현재 모두 캡처하여 즉시 페어링

#### Evidence Manifest 저장 위치

| 경로 | 용도 |
|------|------|
| `.plans/features/active/{slug}/evidence/manifest.json` | Feature별 증거 매니페스트 (SSOT) |
| `.plans/features/active/{slug}/evidence/screenshots/` | 캡처 이미지 저장 |
| `.plans/features/active/{slug}/evidence/diffs/` | 비교 diff 이미지 저장 |

- `/copy-reference-refresh`가 `manifest.json`을 생성/갱신
- `/copy-verify`가 `manifest.json`을 읽어 증거 완전성 검증
- `manifest.json`은 JSON 형식이며, 각 항목은 Evidence Manifest Schema를 따른다

### 2.4 QA Result Schema

QA 결과는 아래 스키마로 작성한다.

| Column | Description | Example |
| --- | --- | --- |
| Check ID | 검증 ID | `QA-BUILD-01`, `QA-EVIDENCE-01` |
| Category | 검증 카테고리 | `build`, `variant`, `screenshot`, `interactive`, `document`, `acceptance` |
| Input | 사용한 명령 또는 파일 | `npm run build` |
| Expected | 기대 결과 | exit 0 |
| Actual | 실제 결과 | exit 0, 0 errors |
| Status | 판정 | `PASS`, `PARTIAL`, `FAIL`, `SKIPPED` |
| Evidence | 로그, screenshot, report 경로 | `output/qa/build-log.txt` |
| Risk | 남은 리스크 | 없음 |
| Action | 후속 조치 | `auto-fixed`, `queued`, `needs-verification`, `needs-user-input` |
| Scenario Context | 시나리오별 의미 | A/B: 구현이 원본과 일치 / C: 식별된 갭이 닫힘 |

Evidence 판정 기준:

| Evidence Type | PASS | PARTIAL | FAIL |
| --- | --- | --- | --- |
| Full-page baseline | 공식 viewport 모두 존재 | 일부 viewport 누락 + missing report | 핵심 viewport 없음 |
| Screenshot diff | baseline/current/diff/report 생성됨 | diff 일부 누락 | report 구조 없음 |
| Interactive state | P0/P1 state evidence 존재 | 보조 state 일부 누락 | 핵심 state 없음 |
| Variant guard | valid build 통과 + invalid fail-fast | valid 통과하나 guard 문서 누락 | invalid 통과 또는 valid 실패 |
| Document trace | 링크와 역할 일치 | 링크 있으나 status 갱신 필요 | 링크 깨짐 또는 문서 충돌 |

### 2.5 WBS ID 생성 규칙

| ID 유형 | 생성 시점 | 생성 커맨드 | 형식 | 예시 |
|---------|---------|-----------|------|------|
| Epic ID | `/plan-screen` 승인 시 | `/plan-screen` | `E-{NN}` | `E-01` |
| Feature ID | `/plan-draft` 출력 시 | `/plan-draft` | `F-{AREA}-{NN}` | `F-HEADER-01` |
| Story ID (copy) | `/copy-gap-board` 출력 시 | `/copy-gap-board` | `S-{AREA}-{NN}` | `S-HEADER-01` |
| Story ID (dev) | `/dev-feature` task breakdown 시 | `/dev-feature` | `S-{AREA}-{NN}` | `S-AUTH-01` |
| Task ID | `/dev-run` 커밋 시 | `/dev-run` | `T-{AREA}-{NN}` | `T-HEADER-01` |

> Story ID는 copy Feature와 dev Feature에서 **동일한 체계**를 사용하지만, **생성 경로가 다르다**. Copy Feature는 갭 분석 결과에서, Dev Feature는 Feature 명세 분해에서 생성된다.

> **Dev Feature Story 자동 태깅 (향후)**: `/dev-feature`의 `08-dev-tasks.md` 출력에 Story 그룹핑을 추가하여 TASK를 Story 단위로 묶을 수 있다. 예: `S-AUTH-01: 로그인 플로우 (TASK-001~003)`. 이를 통해 dev Feature도 copy Feature와 동일한 WBS 추적이 가능해진다.

---

## 3. Commands (7 copy + dev 참조)

### 3.1 Command 총괄

| Command | Source path | Deploy path | Purpose |
| --- | --- | --- | --- |
| `/copy-reference-refresh` | `src/claude/copy/commands/copy-reference-refresh.md` | `.claude/commands/copy-reference-refresh.md` | 베이스라인 캡처/매니페스트 생성 및 갱신 |
| `/copy-visual-review` | `src/claude/copy/commands/copy-visual-review.md` | `.claude/commands/copy-visual-review.md` | 시각적 충실도 갭 분석 |
| `/copy-interaction-review` | `src/claude/copy/commands/copy-interaction-review.md` | `.claude/commands/copy-interaction-review.md` | 인터랙션 상태 갭 분석 |
| `/copy-gap-board` | `src/claude/copy/commands/copy-gap-board.md` | `.claude/commands/copy-gap-board.md` | 갭 우선순위화 및 실행 후보 통합 |
| `/copy-plan-unit` | `src/claude/copy/commands/copy-plan-unit.md` | `.claude/commands/copy-plan-unit.md` | 갭 row를 실행 단위 계획서로 변환 |
| `/copy-verify` | `src/claude/copy/commands/copy-verify.md` | `.claude/commands/copy-verify.md` | QA 검증 (빌드/증거/문서 통합) |
| `/copy-closeout` | `src/claude/copy/commands/copy-closeout.md` | `.claude/commands/copy-closeout.md` | 실행 단위/Phase 마감 및 잔여 리스크 기록 |

Dev 참조: `/dev-feature`, `/dev-run`, `/dev-verify`는 기존 dev 도메인 커맨드로 copy Feature 구현 시 연계 사용.

### 3.2 시나리오별 활성화 매트릭스

| Command | A: 백지 카피 | B: 부분 카피 | C: 충실도 교정 | Dev Feature |
| --- | :---: | :---: | :---: | :---: |
| `/copy-reference-refresh` | 기획 시 (원본) | 기획 시 (원본) | 기획 시 (원본+현재) | 미사용 |
| `/copy-visual-review` | **QA 시점** | **QA 시점** | **기획 시** (갭 분석) | 미사용 |
| `/copy-interaction-review` | **QA 시점** | **QA 시점** | **기획 시** (갭 분석) | 미사용 |
| `/copy-gap-board` | **QA 시점** | **QA 시점** | **기획 시** (우선순위화) | 미사용 |
| `/copy-plan-unit` | 미사용 | 미사용 | 사용 | 미사용 |
| `/copy-verify` | QA | QA | QA | 미사용 |
| `/copy-closeout` | 사용 | 사용 | 사용 | 미사용 |
| `/dev-feature` | 미사용 | 미사용 | 미사용 | 사용 |
| `/dev-run` | 사용 | 사용 | 사용 | 사용 |
| `/dev-verify` | 사용 | 사용 | 사용 | 사용 |

### 3.3 Command별 Input/Output Contract

#### `/copy-reference-refresh`

```yaml
---
name: copy-reference-refresh
description: 베이스라인 매니페스트를 생성/갱신한다.
---
```

| Item | Detail |
| --- | --- |
| Input | target URL, local URL, viewport list, state list, output root |
| Output | baseline manifest, missing evidence report, pairing matrix |
| Gate | manifest 변경 시 사용자 또는 QA 담당자 확인 |
| Scenario | 모든 copy Feature (A/B: 원본만, C: 원본+현재) |

> **Stale 감지 (향후)**: `--check-stale` 플래그로 마지막 캡처 후 N일 경과한 항목을 식별. claude-kit의 scheduled-tasks와 연계하여 주기적 baseline 최신성 유지 가능.

#### `/copy-visual-review`

```yaml
---
name: copy-visual-review
description: 기준 화면과 현재 구현의 시각적 충실도 갭을 분석한다.
---
```

| Item | Detail |
| --- | --- |
| Input | section, viewport, live/current evidence paths |
| Output | visual gap board (Gap Row Schema 준수) |
| Gate | P0 visual gap은 user-review |
| Scenario | C = 기획 시 갭 분석, A/B = QA 시점 비교 |

#### `/copy-interaction-review`

```yaml
---
name: copy-interaction-review
description: 기준 화면과 현재 구현의 인터랙션 상태 갭을 분석한다.
---
```

| Item | Detail |
| --- | --- |
| Input | state name, trigger, live/current sequence evidence |
| Output | state map, timing sheet, interaction gap board (State Map Schema 준수) |
| Gate | header/menu/sticky P0 state는 user-review |
| Scenario | C = 기획 시 갭 분석, A/B = QA 시점 비교 |

#### `/copy-gap-board`

```yaml
---
name: copy-gap-board
description: visual/interaction 갭을 우선순위화하고 실행 후보로 통합한다.
---
```

| Item | Detail |
| --- | --- |
| Input | visual gap board, interaction gap board, known gap |
| Output | prioritized implementation candidate table |
| Gate | P0 실행 후보 선정 전 사용자 확인 |
| Scenario | C = 기획 시 우선순위화, A/B = QA 시점 |

#### `/copy-plan-unit`

```yaml
---
name: copy-plan-unit
description: 승인된 갭 row 또는 plan bridge를 실행 단위 계획서로 변환한다.
---
```

| Item | Detail |
| --- | --- |
| Input | gap row 또는 backlog row, plan bridge context (선택) |
| Output | 실행 단위 계획서 (목적, 작업, 선행 조건, 산출물, 완료 기준, 검증 방법) |
| Gate | 구현 전 계획 피드백 반영 |
| Scenario | C만 (기획 시 갭 분석 결과를 실행 단위로 변환) |

#### `/copy-verify`

```yaml
---
name: copy-verify
description: build/evidence/document 검증을 수행한다.
---
```

| Item | Detail |
| --- | --- |
| Input | changed files, evidence root, expected checks |
| Output | QA result report (QA Result Schema 준수), acceptance readiness |
| Gate | `READY_FOR_USER_GATE` 또는 `READY_WITH_LOGGED_GAPS`만 closeout 가능 |
| Scenario | 모든 copy Feature (A/B: 최초 비교, C: 갭 닫힘 재검증) |

#### `/copy-closeout`

```yaml
---
name: copy-closeout
description: 실행 단위/Phase 마감과 잔여 리스크를 기록한다.
---
```

| Item | Detail |
| --- | --- |
| Input | execution unit result, verification report, residual issues |
| Output | closeout memo (완료 범위, 검증 결과, 남은 이슈, 다음 gate) |
| Gate | Phase/R 종료 시 `승인 대기`로 멈춤 |
| Scenario | 모든 copy Feature |

### 3.4 Command Body Requirements

모든 커맨드 파일은 아래 항목을 포함해야 한다.

| Item | Requirement |
| --- | --- |
| Purpose | 커맨드의 목적과 비목적 명시 |
| Inputs | 필요한 문서, evidence, path, argument |
| Steps | 읽기 -> 분석 -> 출력 -> self-review 순서 |
| Output | Markdown table 또는 JSON-like schema |
| Gate | user-review 또는 self-review 조건 |
| Safety | 구현/수정 금지 또는 범위 제한 조건 |

---

## 4. Hooks (5개)

### 4.1 Hook 총괄

| Hook | Source path | Deploy path | Event | Mode | Purpose |
| --- | --- | --- | --- | --- | --- |
| `copy-evidence-reminder.js` | `src/claude/copy/hooks/copy-evidence-reminder.js` | `.claude/hooks/copy-evidence-reminder.js` | PostToolUse Edit/Write | reminder | visual/interaction 파일 수정 후 증거 갱신 알림 |
| `copy-scope-guard.js` | `src/claude/copy/hooks/copy-scope-guard.js` | `.claude/hooks/copy-scope-guard.js` | PreToolUse Edit/Write | reminder -> blocking | 실행 단위 범위 밖 수정 경고 |
| `copy-gate-stop.js` | `src/claude/copy/hooks/copy-gate-stop.js` | `.claude/hooks/copy-gate-stop.js` | hooks.stop | blocking | Phase/R closeout 이후 다음 단계 자동 진행 차단 |
| `copy-doc-drift-check.js` | `src/claude/copy/hooks/copy-doc-drift-check.js` | `.claude/hooks/copy-doc-drift-check.js` | PostToolUse Edit/Write | reminder | 문서와 구현 변경 drift 감지 |
| `copy-variant-env-guard.js` | `src/claude/copy/hooks/copy-variant-env-guard.js` | `.claude/hooks/copy-variant-env-guard.js` | PostToolUse Edit/Write | reminder | 배리언트/host map 환경 변수 변경 시 QA 요구 |

시나리오 참고: 훅은 파일 편집 이벤트에 반응하며 시나리오(A/B/C)와 무관하게 동작한다. 시나리오 분기는 커맨드 계층에서 처리된다.

### 4.2 CommonJS 형식 요구사항

| Item | Requirement |
| --- | --- |
| Shebang | `#!/usr/bin/env node` |
| Event type comment | `@event PreToolUse\|PostToolUse\|hooks.stop` |
| Exit codes | `0` = allow/info, `2` = blocking |
| Module format | CommonJS (`module.exports` 또는 exit 기반) |
| `package.json` | `src/claude/copy/hooks/package.json` -- `{"type": "commonjs"}` |

### 4.3 Hook 실행 우선순위

블로킹 훅(`exit 2`)이 리마인더 훅(`exit 0`)보다 먼저 실행한다. 같은 이벤트의 훅은 도메인 순서를 따른다: plan -> dev -> copy.

#### PreToolUse Edit/Write 순서

| Order | Hook | Domain | Mode | Action |
| --- | --- | --- | --- | --- |
| 1 | `plan-doc-guard.js` | plan | blocking | `.plans/` 보호, planning 중 code edit 차단 |
| 2 | `dev-tdd-guard.js` | dev | blocking | 테스트 파일 존재 확인 |
| 3 | `dev-feature-scope-guard.js` | dev | reminder | 패키지 범위 확인 |
| 4 | `copy-scope-guard.js` | copy | reminder -> blocking | 실행 단위 범위 확인 |
| 5 | `copy-evidence-reminder.js` | copy | reminder | 증거 갱신 리마인더 |

#### PostToolUse Edit/Write 순서

| Order | Hook | Domain | Action |
| --- | --- | --- | --- |
| 1 | `edit-tracker.js` | core | 파일 추적 |
| 2 | `code-quality-reminder.js` | core | 품질 리마인더 |
| 3 | `copy-doc-drift-check.js` | copy | 문서 드리프트 감지 |

#### 충돌 해결 원칙

- 블로킹 훅이 리마인더 훅보다 먼저 실행한다.
- 같은 이벤트의 훅은 도메인 순서: plan -> dev -> copy.
- `dev-tdd-guard.js`와 `copy-evidence-reminder.js`가 동일 파일 편집 이벤트에서 동시 발동될 수 있다. TDD guard는 코드 정합성, evidence reminder는 충실도 증거 갱신으로 역할이 분리되므로 양쪽 모두 실행한다.

### 4.4 Blocking vs Reminder 정책

| Situation | Initial policy | Reason |
| --- | --- | --- |
| visual 관련 파일 수정 후 evidence 없음 | reminder | 문서/스타일 작업 중 false positive 가능 |
| 실행 단위 scope 밖 code edit | reminder | 실제 implementation-unit-agent 도입 후 blocking 전환 |
| Phase/R closeout 후 다음 단계 자동 진행 | blocking | 사용자 gate가 핵심 운영 원칙 |
| 배리언트/host map 변경 | reminder + QA 요구 | 운영 영향이 있으나 문서 수정도 가능 |
| 문서-구현 drift 의심 | reminder | drift 판정이 맥락 의존적 |

### 4.5 `plan-doc-guard.js` 충돌 해결

`plan-doc-guard.js`는 planning 단계에서 코드 파일(`src/`, `packages/`, `apps/`) 편집을 **하드 블로킹**한다. copy 도메인의 기획 단계(시나리오 C 갭 분석)에서 evidence 파일 생성과 충돌할 수 있다.

**해결 방식**: copy 기획 단계의 증거 파일은 `.plans/` 하위에만 생성한다:

| 파일 유형 | 허용 경로 | `plan-doc-guard.js` 상태 |
|----------|---------|----------------------|
| Evidence manifest | `.plans/features/active/{slug}/evidence/manifest.json` | 허용 (`.plans/` 내부) |
| 스크린샷 참조 문서 | `.plans/features/active/{slug}/evidence/*.md` | 허용 |
| 갭 보드 | `.plans/features/active/{slug}/gap-board.md` | 허용 |
| 구현 코드 | `src/`, `apps/` | **차단** (구현 단계에서만) |

> 스크린샷 바이너리 파일은 `.plans/` 외부(`screenshots/` 등)에 저장될 수 있지만, 이는 Bash 도구로 수행되므로 `plan-doc-guard.js`(Edit/Write 이벤트)와 충돌하지 않는다.

### 4.6 PCC-06: Gap Board ↔ Detail PRD 매핑 검증

시나리오 C Standard에서 `/plan-review`가 수행하는 추가 PCC 항목:

| PCC ID | 검증 대상 | 조건 | PASS 기준 |
|--------|---------|------|----------|
| PCC-06 | Gap Board → Detail PRD | 시나리오 C + Standard | 모든 P0 갭 ID(VF-*/IF-*)가 Detail PRD acceptance criteria에 참조됨. Detail PRD의 각 요구사항이 Gap Board 갭 ID를 역참조함 |

기존 PCC-01~05(PRD ↔ wireframe ↔ stitch)에 추가되며, `/plan-reviewer` 에이전트의 체크리스트에 포함한다.

---

## 5. Rules (5개)

### 5.1 Rule 총괄

| Rule | Source path | Deploy path | Purpose |
| --- | --- | --- | --- |
| `copy-fidelity.md` | `src/claude/copy/rules/copy-fidelity.md` | `.claude/rules/copy-fidelity.md` | 충실도 판단 기준 + 시나리오 A/B/C 정의 |
| `copy-evidence.md` | `src/claude/copy/rules/copy-evidence.md` | `.claude/rules/copy-evidence.md` | 증거 네이밍/품질 기준 (naming, stale/missing/pairing) |
| `copy-gates.md` | `src/claude/copy/rules/copy-gates.md` | `.claude/rules/copy-gates.md` | 실행 단위/Phase 게이트 규칙 (P0/P1, phase, generated output gate) |
| `copy-commands.md` | `src/claude/copy/rules/copy-commands.md` | `.claude/rules/copy-commands.md` | copy 커맨드 사용 기준 + Feature 유형 라우팅 |
| `copy-variant.md` | `src/claude/copy/rules/copy-variant.md` | `.claude/rules/copy-variant.md` | 배리언트/host map 운영 기준 |

### 5.2 Rule 배치 원칙

- copy rules는 `src/claude/copy/rules/`에 독립 배치한다 (옵션 B: copy 도메인 독립성 유지).
- 기존 core rules (`src/claude/core/rules/`)는 수정하지 않는다.
- core/dev/plan rules와 중복 없이 배치한다.

### 5.3 Rule 상세

#### `copy-fidelity.md`

| Section | Content |
| --- | --- |
| 목적 | 원본 카피 품질 기준 |
| Visual 기준 | layout, typography, spacing, card, CTA, divider |
| Interaction 기준 | hover, open, sticky, state, scroll rhythm |
| Responsive 기준 | 1440, 1280, 1024, 768, 390 |
| 시나리오 정의 | A (백지 카피), B (부분 카피), C (충실도 교정), Dev Feature |
| 금지 | reference 없는 구현, 추상적 완료 판정 |

#### `copy-evidence.md`

| Section | Content |
| --- | --- |
| Evidence 유형 | full-page, crop, interactive, diff, report |
| Naming 규칙 | `{source}-{variant}-{viewport}-{state}.{ext}` |
| 품질 기준 | 잘림, 로딩 미완료, wrong state, stale 표시 |
| 검증 | QA Result Schema 기반 판정 |

#### `copy-gates.md`

| Section | Content |
| --- | --- |
| 실행 단위 gate | 6단계 lifecycle (계획 -> 피드백 -> 구현 -> 리뷰 -> 검증 -> 마감) |
| 소그룹/Phase gate | summary와 검증 필요 |
| 대그룹/R gate | `승인 대기` 후 중단 |
| Commit gate | 실행 단위 1개 종료 후 commit |

#### `copy-commands.md`

| Section | Content |
| --- | --- |
| 사용 기준 | `/copy-*` 커맨드의 사용 조건과 순서 |
| Feature 유형 라우팅 | copy 커맨드는 copy Feature에만 적용, Dev Feature는 건너뜀 |
| 금지 사항 | 사용자 gate 우회, scope 밖 실행 |

#### `copy-variant.md`

| Section | Content |
| --- | --- |
| Variant 기준 | 기본, demo, host map 각각의 빌드/검증 기준 |
| 환경 변수 | `SITE_VARIANT`, `SITE_VARIANT_HOST_MAP` 운영 기준 |
| Guard | invalid variant fail-fast 검증 |

---

## 6. Skills (제안)

| Skill | Source path | Purpose |
| --- | --- | --- |
| `copy-fidelity-workflow` | `src/claude/copy/skills/copy-fidelity-workflow/SKILL.md` | 시각적 충실도 분석 워크플로우 가이드 (갭 분석 방법론, 우선순위 판정 기준) |
| `copy-interaction-analysis` | `src/claude/copy/skills/copy-interaction-analysis/SKILL.md` | 인터랙션 상태 분석 방법론 (state map 작성, timing sheet 관찰) |
| `copy-evidence-management` | `src/claude/copy/skills/copy-evidence-management/SKILL.md` | 증거 수집/관리 패턴 (manifest, pairing, stale/missing evidence) |
| `copy-qa-workflow` | `src/claude/copy/skills/copy-qa-workflow/SKILL.md` | QA 파이프라인 실행 가이드 (9단계 검증 순서, 증거 판정 기준) |
| `copy-command-workflow` | `src/claude/copy/skills/copy-command-workflow/SKILL.md` | `/copy-*` 커맨드 사용법 및 워크플로우 가이드 |

Skills는 agent/command를 재사용 가능하게 안내하는 보조 문서다. 각 skill은 `SKILL.md` 파일로 구성된다.

---

## 7. Component Acceptance Criteria

| Component | Acceptance Condition |
| --- | --- |
| Agents (4개) | frontmatter + `<Agent_Prompt>` 구조. 시나리오 조건 명시. WBS 매핑 정의. |
| Schemas (4개) | Visual Gap Row, Interaction State Map, Evidence Manifest, QA Result 모두 WBS_ID 포함. |
| Commands (7개) | input/output/gate/scenario 명시. YAML frontmatter 포함. |
| Hooks (5개) | CommonJS syntax + exit code 정책 검증. 실행 우선순위 준수. |
| Rules (5개) | copy 도메인 독립 배치. core/dev/plan rules와 중복 없음. |
| Skills (5개, 제안) | `SKILL.md` 존재. command/agent 재사용 안내. |
