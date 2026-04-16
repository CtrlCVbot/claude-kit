# CAI 통합 계획서 — claude-kit 아키텍처 적합성 리뷰

> **리뷰어**: claude-kit 기술 리뷰어  
> **리뷰 대상**: `docs/claude-agent-integration/` (CAI-00 ~ CAI-10, README)  
> **기준 아키텍처**: claude-kit v2.1.0 (`src/claude/` 3도메인 × 4컴포넌트)  
> **작성일**: 2026-04-15

---

## 1. 문서 개요

| 파일명 | 핵심 제안 | 대상 영역 |
|--------|----------|----------|
| `README.md` | CAI 패키지 진입점, 상태 대시보드, 읽기 순서 | 전체 네비게이션 |
| `00_docs-split-plan.md` | P18을 11개 하위 문서로 분리하는 계획 | 문서 구조 |
| `01_package-map.md` | CAI↔기존 P문서 SSOT 매핑, `.claude/` 요소 연결 | 아키텍처 매핑 |
| `02_copy-fidelity-agent-spec.md` | 시각적 충실도 갭 분석 에이전트 (레이아웃, 타이포, 간격) | `.claude/agents/` |
| `03_interaction-fidelity-agent-spec.md` | 인터랙션 충실도 에이전트 (호버, 스티키, 스크롤) | `.claude/agents/` |
| `04_reference-baseline-agent-spec.md` | 캡처 매니페스트, 뷰포트/상태 네이밍 표준 | `.claude/agents/` |
| `05_qa-review-agent-spec.md` | QA 검증 파이프라인 (빌드, 배리언트, 스크린샷 diff) | `.claude/agents/` |
| `06_command-workflow-spec.md` | `/copy-*` 커맨드 라이프사이클 및 워크플로우 | `.claude/commands/` |
| `07_hooks-and-rules-plan.md` | 5개 훅 + 5개 룰 후보, 블로킹/리마인더 정책 | `.claude/hooks/`, `.claude/rules/` |
| `08_adoption-roadmap.md` | A0-A9 단계별 도입 순서, 게이트, 롤백 기준 | 전체 `.claude/` |
| `09_readiness-checklist.md` | `.claude/` 수정 전 준비 게이트 체크리스트 | 전체 `.claude/` |
| `10_plan-workflow-integration-plan.md` | plan 도메인 통합 분석 및 기존 CAI 문서 반영 | `plan/` 도메인 연동 |

---

## 2. 제안별 상세 피드백

### 2.1 README.md — 패키지 진입점

- **요약**: 12개 문서 네비게이션 허브. 6대 운영 원칙 정의, 읽기 순서 제시.
- **평가**: **수용**
- **근거**: 문서 패키지의 진입점으로서 역할이 명확하다. 읽기 순서(P18 → CAI-00 → CAI-01 → CAI-10 → CAI-02~05 → CAI-06~09)가 의존 관계를 잘 반영한다.
- **권장 사항**: 현행 유지. 다만 claude-kit 도메인 구조(`src/claude/{domain}/`)와의 매핑 섹션을 추가하면 개발자 온보딩이 빨라진다.

---

### 2.2 CAI-00 — 문서 분리 계획

- **요약**: P18 단일 문서를 11개 하위 문서로 분리하는 이유와 배포 규칙 정의.
- **평가**: **수용**
- **근거**: "문서 먼저, 구현은 나중" 원칙은 claude-kit의 `golden-principles.md` #9(HARD-GATE: 설계 없이 코딩 금지)와 완전히 일치한다. 청중별 분리(기획자 → 패키지맵, 개발자 → 에이전트 스펙, QA → 준비 체크리스트)도 적절하다.
- **권장 사항**: 현행 유지.

---

### 2.3 CAI-01 — 패키지 맵 (SSOT 매핑)

- **요약**: CAI 문서 ↔ 기존 P문서 ↔ `.claude/` 구조의 단일 진실 원천(SSOT) 정의. 추적성 규칙 7개 제시.
- **평가**: **수정 필요**
- **근거**:
  - **정합성 문제**: CAI-01은 `.claude/agents/`, `.claude/commands/` 등을 직접 대상으로 지정하지만, claude-kit에서 이 경로들은 **생성된 출력물**이다. 실제 소스는 `src/claude/{domain}/{type}/{name}`이며, `pnpm claude-kit:setup` 실행 시 `.claude/`로 복사된다.
  - **누락**: `src/claude/` 소스 경로, `setup.js` 생성 파이프라인, `exception-registry.json`, `pairing-registry.json`에 대한 언급이 없다.
  - **충돌 위험**: `.plans/` SSOT 후보 지정은 plan 도메인의 기존 `plan-doc-guard.js`와 충돌 가능성이 있다(CAI-09에서도 인지하고 있음).
- **권장 사항**:
  1. 매핑 대상을 `.claude/{type}/` → `src/claude/{domain}/{type}/`로 수정. 즉, "copy" 도메인을 새로 추가하는 형태로 재구성.
  2. SSOT 매핑에 claude-kit 레지스트리(`exception-registry.json`, `pairing-registry.json`) 연동 방안 추가.
  3. `.plans/` 생성 게이트는 기존 `plan-doc-guard.js` 로직과의 충돌 시나리오를 구체적으로 문서화.

---

### 2.4 CAI-02 — 시각적 충실도 에이전트 스펙

- **요약**: Turner 원본 vs 현재 구현의 시각적 갭을 분석하는 에이전트. `VF-{SECTION}-{NN}` 스키마 정의. 구현이 아닌 분석만 수행.
- **평가**: **수정 후 수용**
- **근거**:
  - **정합성 양호**: "분석만, 구현 안 함" 원칙은 claude-kit의 에이전트 패턴(단일 책임)과 일치한다. Gap Row Schema도 구조화되어 있다.
  - **네이밍 불일치**: 제안명 `copy-fidelity-agent.md`는 claude-kit 컨벤션을 따르려면 `copy-fidelity.md`(접두사 `copy-` + 기능명)로 해야 한다. 현재 claude-kit 에이전트는 `{domain}-{role}.md` 패턴이다 (예: `dev-architect.md`, `plan-prd-writer.md`).
  - **YAML 프론트매터 누락**: claude-kit 에이전트는 `name`, `description`, `tools`, `model` 등의 YAML 프론트매터와 `<Agent_Prompt>` XML 블록이 필수이나, CAI-02는 이 형식을 명시하지 않는다.
  - **도메인 배치**: `src/claude/copy/agents/copy-fidelity.md`로 배치해야 하는데, 현재 "copy" 도메인이 존재하지 않는다.
- **권장 사항**:
  1. 에이전트 파일명을 `copy-fidelity.md`로 변경 (claude-kit 네이밍 컨벤션).
  2. YAML 프론트매터 + `<Agent_Prompt>` 형식으로 스펙 재작성.
  3. 새 "copy" 도메인 생성을 전제로 `src/claude/copy/agents/` 경로 명시.
  4. `tools` 필드에 필요한 도구 목록 정의 (예: `["Read", "Glob", "Grep", "Bash"]`).

---

### 2.5 CAI-03 — 인터랙션 충실도 에이전트 스펙

- **요약**: 호버, 스티키, 스크롤, 메뉴 등 상태 전환 경험의 갭을 분석하는 에이전트. `IF-{AREA}-{STATE}-{NN}` 스키마 정의.
- **평가**: **수정 후 수용**
- **근거**:
  - CAI-02와 동일한 아키텍처 적합성 이슈 (네이밍, 프론트매터, 도메인 배치).
  - State Map Schema는 잘 구조화되어 있으며, CAI-02와의 책임 분리(시각적 vs 인터랙션)가 명확하다.
  - 상태 순서 분석(idle → trigger → active → exit)은 복잡한 UI 감사에 유용한 패턴이다.
- **권장 사항**: CAI-02와 동일한 형식 수정 적용. 파일명 `copy-interaction-fidelity.md`로 변경.

---

### 2.6 CAI-04 — 레퍼런스 베이스라인 에이전트 스펙

- **요약**: 캡처 매니페스트, 뷰포트 표준(1440/1280/1024/768/390), 상태 네이밍, 페어링 매트릭스 정의.
- **평가**: **수정 후 수용**
- **근거**:
  - **정합성 양호**: 표준화된 매니페스트 스키마는 재사용 가능하며, 에이전트 간 일관성을 보장한다.
  - **형식 이슈**: CAI-02/03과 동일한 claude-kit 형식 미준수.
  - **강점**: 페어링 매트릭스(live ↔ current 1:1 대응) 요구사항은 증거 기반 검증(`verification.md` 원칙)과 잘 맞는다.
- **권장 사항**: CAI-02와 동일한 형식 수정. 파일명 `copy-reference-baseline.md`로 변경.

---

### 2.7 CAI-05 — QA 리뷰 에이전트 스펙

- **요약**: 9단계 검증 파이프라인 (빌드 → 배리언트 가드 → 스크린샷 → 인터랙티브 증거 → 문서 추적 → 수용 판정). 4개 준비 상태 정의.
- **평가**: **수정 후 수용**
- **근거**:
  - **정합성 우수**: 9단계 파이프라인은 claude-kit `verification.md`의 "게이트 함수"(식별 → 실행 → 읽기 → 검증 → 주장) 패턴을 확장한 것이다. 특히 "최종 충실도 승인은 에이전트가 아닌 사용자가 한다"는 원칙이 훌륭하다.
  - **배리언트 가드**: `SITE_VARIANT=invalid`가 반드시 실패해야 한다는 역테스트는 TDD Red-Green 원칙과 일맥상통한다.
  - **형식 이슈**: 동일한 claude-kit 형식 미준수.
  - **주의점**: 기존 `dev-verify-agent.md`와의 책임 경계를 명확히 해야 한다. dev-verify는 일반 빌드/테스트 검증이고, copy-qa-review는 충실도 특화 검증이라는 분리가 필요하다.
- **권장 사항**:
  1. 형식 수정 (CAI-02 동일).
  2. 파일명 `copy-qa-reviewer.md`로 변경.
  3. `dev-verify-agent.md`와의 책임 경계를 에이전트 설명(`description`)에 명시.

---

### 2.8 CAI-06 — 커맨드 워크플로우 스펙

- **요약**: 8개 `/copy-*` 커맨드 정의. 6단계 실행 단위 라이프사이클. plan/copy/dev 경계 정의.
- **평가**: **수정 후 수용**
- **근거**:
  - **정합성 양호**: 6단계 라이프사이클(계획 → 피드백 → 구현 → 피드백 → 검증 → 피드백)은 claude-kit dev 도메인의 TDD 사이클(RED → GREEN → IMPROVE)을 확장한 것이다.
  - **plan/copy/dev 분리**: plan = 사전 기획, copy = 충실도 증거, dev = 구현이라는 3계층 분리가 명확하다. 이는 claude-kit의 기존 도메인 분리(core/dev/plan)에 "copy"를 자연스럽게 추가하는 구조이다.
  - **형식 이슈**: claude-kit 커맨드는 YAML 프론트매터 + 실행 가이드 형식인데, CAI-06은 이를 따르지 않는다.
  - **누락**: 커맨드별 독립 `.md` 파일 스펙이 없다. CAI-06은 전체 워크플로우를 하나의 문서에 담고 있지만, claude-kit에서는 각 커맨드가 `src/claude/copy/commands/copy-{name}.md`로 개별 파일이어야 한다.
- **권장 사항**:
  1. CAI-06을 "설계 문서"로 유지하되, 실제 구현 시 각 커맨드를 독립 `.md` 파일로 분리.
  2. 각 커맨드 파일에 YAML 프론트매터(`name`, `description`) 추가.
  3. `src/claude/copy/commands/` 경로에 배치.

---

### 2.9 CAI-07 — 훅 & 룰 계획

- **요약**: 5개 신규 훅(리마인더 4 + 블로킹 1) + 5개 신규 룰. 기존 훅과의 충돌 분석 포함.
- **평가**: **수정 후 수용**
- **근거**:
  - **기존 훅 분석 우수**: `dev-feature-scope-guard.js`, `dev-tdd-guard.js`, `edit-tracker.js`, `plan-doc-guard.js` 등 기존 9개 훅의 역할을 정확히 파악하고, 충돌 가능성을 사전 분석했다. 이 수준의 사전 조사는 높이 평가할 만하다.
  - **리마인더 우선 전략**: 새 훅을 블로킹이 아닌 리마인더로 시작하는 전략은 안전하다. `copy-gate-stop.js`만 블로킹인 것도 적절하다.
  - **형식 이슈**: claude-kit 훅은 CommonJS `.js` 파일이며, `#!/usr/bin/env node` 셔뱅 + 이벤트 타입 주석 + `module.exports` 패턴을 따른다. 이 형식 요구사항을 문서에 명시해야 한다.
  - **룰 배치**: claude-kit에서 룰은 `src/claude/core/rules/`에만 존재한다 (도메인 무관). 새 룰을 `src/claude/copy/rules/`에 두면 기존 패턴에서 벗어난다.
  - **충돌 위험**: `dev-tdd-guard.js`와 `copy-evidence-reminder.js`가 동일 파일 편집 이벤트에서 동시 발동될 수 있다. 우선순위 정의가 필요하다.
- **권장 사항**:
  1. 훅 파일 형식을 claude-kit CommonJS 패턴으로 명시 (셔뱅, 이벤트 주석, exit 코드 규약).
  2. 룰 배치를 두 가지 중 선택:
     - **옵션 A**: `src/claude/core/rules/copy-*.md` (기존 패턴 유지, core 도메인에 통합)
     - **옵션 B**: `src/claude/copy/rules/copy-*.md` (새 도메인 독립성 유지, 단 setup.js 수정 필요)
     - 권장: **옵션 B** — copy 도메인의 독립성이 롤백과 선택적 도입에 유리.
  3. 훅 우선순위 규칙 추가: PreToolUse 이벤트에서 `dev-tdd-guard` → `copy-scope-guard` → `copy-evidence-reminder` 순서 정의.

---

### 2.10 CAI-08 — 도입 로드맵

- **요약**: A0(plan 정렬) ~ A9(오케스트레이터) 10단계 순차 도입. 6개 게이트, 롤백 기준 정의.
- **평가**: **수용**
- **근거**:
  - **정합성 우수**: "분석/검증 에이전트 먼저, 구현/오케스트레이터 마지막" 전략은 claude-kit의 점진적 도입 철학과 완벽히 일치한다.
  - **게이트 정책**: Gate 0 → Gate A → ... → Gate F까지의 단계별 승인은 `golden-principles.md` #9(HARD-GATE)와 `verification.md`의 증거 기반 완료 원칙을 충실히 따른다.
  - **롤백 기준**: `git revert` 기반 비파괴적 롤백은 안전하다.
  - **보완점**: A0(plan 정렬)이 "문서 업데이트만"이라고 했는데, 실제로는 `setup.js`에 "copy" 도메인을 추가하는 것이 선행되어야 한다.
- **권장 사항**:
  1. A0 이전에 **A-1 단계**(claude-kit 인프라 준비)를 추가:
     - `src/claude/copy/` 디렉토리 구조 생성
     - `profile.json`에 `"copy"` 도메인 추가
     - `setup.js`에 copy 도메인 처리 로직 추가
     - `CLAUDE.md.template`에 copy 도메인 섹션 추가
  2. 각 게이트에 "검증 증거" 항목 추가 (어떤 명령을 실행해서 통과를 확인하는지).

---

### 2.11 CAI-09 — 준비 체크리스트

- **요약**: 문서 완전성, plan 도메인 준비, 충실도 준비, 구현 범위, Git/커밋, 검증, 사용자 게이트 등 7개 체크리스트.
- **평가**: **수정 후 수용**
- **근거**:
  - **정합성 우수**: `verification.md`의 "철칙: 신선한 검증 증거 없이 완료 주장 불가"를 체크리스트 형태로 구체화했다. 특히 "상태 정의"(READY, READY_WITH_GAPS, NOT_READY, BLOCKED)가 명확하다.
  - **plan 도메인 검증 포함**: 기존 plan 컴포넌트(10 commands, 6 agents, 8 skills, 1 hook)의 존재 여부를 확인하는 항목이 있어 충돌 사전 방지에 효과적이다.
  - **누락**: claude-kit 인프라 준비 체크리스트가 없다:
    - `setup.js`가 copy 도메인을 처리할 수 있는가?
    - `profile.json`에 copy가 등록되었는가?
    - `exception-registry.json`에 copy 컴포넌트 예외가 등록되었는가?
    - Codex 호환성이 검토되었는가?
- **권장 사항**:
  1. "claude-kit 인프라 준비" 체크리스트 섹션 추가:
     - `[ ]` `src/claude/copy/` 디렉토리 구조 존재
     - `[ ]` `profile.json`에 `"copy"` 도메인 등록
     - `[ ]` `setup.js`가 copy 도메인을 올바르게 처리
     - `[ ]` `CLAUDE.md.template`에 copy 섹션 존재
     - `[ ]` Codex 대상 시 `pairing-registry.json` 항목 추가
  2. 각 체크리스트 항목에 "검증 명령" 컬럼 추가 (예: `node --check plan-doc-guard.js` → `node --check copy-gate-stop.js`).

---

### 2.12 CAI-10 — Plan 워크플로우 통합 계획

- **요약**: 기존 plan 도메인(10 commands, 6 agents, 8 skills, 1 hook) 분석. plan/copy/dev 3계층 워크플로우 정의. RICE 해석을 충실도 관점으로 조정.
- **평가**: **수용**
- **근거**:
  - **분석 품질 우수**: plan 도메인의 모든 컴포넌트를 정확히 파악하고, 각 커맨드가 Turner 프로젝트에서 어떤 역할을 하는지 구체적으로 매핑했다.
  - **RICE 재해석**: Reach=뷰포트/섹션/상태 수, Impact=원본-충실도-차이 감소, Confidence=증거 품질, Effort=코드+캡처+QA 비용. 이 해석은 Turner 프로젝트 맥락에서 타당하다.
  - **반영 상태 추적**: PLAN-CAI-01~05 각각의 반영 여부를 추적하는 것은 문서 관리 모범 사례이다.
  - **주의점**: "선택적 업데이트"(전면 교체가 아닌) 접근이 적절하다. plan 도메인은 이미 안정적이므로 최소한의 변경이 바람직하다.
- **권장 사항**: 현행 유지. plan 도메인 자체의 수정은 최소화하고, copy 도메인이 plan의 출력을 입력으로 받는 인터페이스만 정의.

---

## 3. 횡단 이슈: claude-kit 아키텍처 통합 관점

### 3.1 핵심 이슈 — "copy" 도메인 부재

| 항목 | 현재 상태 | 필요 조치 |
|------|----------|----------|
| 도메인 등록 | core, dev, plan만 존재 | `"copy"` 도메인 신규 추가 |
| `profile.json` | `domains: ["core", "dev"]` 기본값 | `"copy"` 선택 가능하도록 확장 |
| `setup.js` | 3도메인만 처리 | copy 도메인 복사/생성 로직 추가 |
| `CLAUDE.md.template` | core, dev, plan 섹션 | copy 도메인 섹션 템플릿 추가 |
| `CLAUDE-KIT-QUICKSTART.md` | copy 언급 없음 | copy 도메인 온보딩 가이드 추가 |

**결론**: CAI 패키지의 모든 제안은 "copy"라는 **새 도메인**을 전제로 한다. 그러나 12개 문서 어디에도 claude-kit에 새 도메인을 추가하는 인프라 작업이 명시되어 있지 않다. 이것이 가장 큰 갭이다.

### 3.2 컴포넌트 형식 불일치

CAI 문서들은 에이전트/커맨드/훅/룰의 **설계 의도**를 잘 기술하지만, claude-kit의 **구현 형식**을 따르지 않는다.

| 컴포넌트 | claude-kit 필수 형식 | CAI 문서 상태 |
|----------|---------------------|-------------|
| 에이전트 | YAML 프론트매터 + `<Agent_Prompt>` XML | 산문 형식 스펙 |
| 커맨드 | YAML 프론트매터 + 실행 가이드 마크다운 | 워크플로우 설명 문서 |
| 훅 | CommonJS `.js` + 셔뱅 + exit 코드 | 정책 설명 문서 |
| 룰 | 순수 마크다운 (프론트매터 없음) | 정책 설명 문서 |
| 스킬 | `{name}/SKILL.md` + YAML 프론트매터 | **전혀 언급 없음** |

**결론**: CAI 문서는 "설계 문서"로서 훌륭하지만, "구현 가능한 스펙"으로 전환하려면 claude-kit 형식에 맞는 재작성이 필요하다. 이는 A0-A1 단계에서 수행할 수 있다.

### 3.3 스킬(Skills) 누락

claude-kit에서 스킬은 26개 중 가장 많은 컴포넌트 유형이다. 각 도메인별로:
- core: 3개 (continuous-learning, session-wrap, session-wrap-suggest)
- dev: 13개 (tdd-workflow, testing-backend, feature-module 등)
- plan: 8개 (pipeline, idea-management, screening-workflow 등)

CAI 패키지는 에이전트/커맨드/훅/룰만 다루고 **스킬을 전혀 제안하지 않는다**. 그러나 copy 도메인에도 스킬이 필요하다:
- `copy-fidelity-workflow/SKILL.md` — 충실도 분석 워크플로우 가이드
- `copy-evidence-management/SKILL.md` — 증거 수집/관리 패턴
- `copy-gap-analysis/SKILL.md` — 갭 분석 방법론

**결론**: 스킬 컴포넌트를 추가하면 copy 도메인이 다른 도메인과 일관된 구조를 갖게 된다.

### 3.4 Codex 호환성 미고려

claude-kit v2.1은 듀얼 타겟(Claude + Codex)을 지원한다. `pairing-registry.json`과 `exception-registry.json`으로 각 컴포넌트의 Codex 전환 전략을 관리한다.

CAI 문서에는 Codex 호환성에 대한 언급이 전혀 없다. 이는 즉시 해결할 필요는 없지만, 향후 copy 도메인 컴포넌트의 Codex 전환 가능성을 염두에 둔 설계가 바람직하다.

**결론**: 현 단계에서는 Claude 타겟에만 집중하되, 에이전트/커맨드/룰은 Codex 전환이 용이하므로 형식만 준수하면 된다. 훅은 이벤트 모델이 다르므로 `exception-registry.json`에 미리 등록해야 한다.

### 3.5 기존 컴포넌트 충돌 매트릭스

| 신규 제안 | 기존 컴포넌트 | 충돌 수준 | 해결 방안 |
|----------|------------|----------|----------|
| `copy-scope-guard.js` | `dev-feature-scope-guard.js` | **중간** | 책임 분리: dev=패키지 범위, copy=실행 단위 범위 |
| `copy-evidence-reminder.js` | `dev-tdd-guard.js` | **중간** | 이벤트 분리: tdd=테스트 파일 존재, evidence=스크린샷 존재 |
| `copy-gate-stop.js` | `plan-doc-guard.js` | **낮음** | 관심사 분리: plan=문서 무결성, copy=단계 자동 진행 차단 |
| `copy-fidelity.md` (룰) | `verification.md` | **낮음** | 상호보완: verification=일반 검증, copy-fidelity=충실도 특화 |
| `/copy-verify` (커맨드) | `/dev-verify` | **중간** | 네이밍으로 분리 완료. 설명에 차이 명시 필요 |

---

## 4. 종합 의견

### 전체 평가: **수정 후 수용** (READY_WITH_GAPS)

CAI 통합 계획서는 **설계 품질이 높다**. 특히 다음 측면이 인상적이다:

1. **철저한 사전 분석**: 기존 P문서, plan 도메인, 훅/룰 현황을 정확히 파악한 후 제안하고 있다.
2. **증거 기반 원칙 일관성**: "캡처 먼저", "분석만 수행, 구현은 별도", "사용자 게이트 유지"는 claude-kit의 `verification.md`와 `golden-principles.md`에 완벽히 부합한다.
3. **점진적 도입 전략**: A0~A9 단계별 롤아웃과 게이트 정책은 리스크를 최소화한다.
4. **plan 도메인 통합**: 기존 plan 워크플로우를 "사전 기획 계층"으로 활용하는 설계가 자연스럽다.

### 보완이 필요한 영역

| 우선순위 | 항목 | 영향도 |
|---------|------|-------|
| **P0** | claude-kit 인프라 준비 (copy 도메인 추가, setup.js 수정) | 전체 실행 차단 |
| **P0** | 컴포넌트 형식 전환 (YAML 프론트매터, Agent_Prompt 등) | 실제 배포 차단 |
| **P1** | 스킬 컴포넌트 추가 | 도메인 완전성 |
| **P1** | 훅 우선순위/충돌 해결 규칙 | 런타임 안정성 |
| **P2** | Codex 호환성 계획 | 향후 확장성 |
| **P2** | 레지스트리 연동 (exception, pairing) | 거버넌스 |

### 권장 실행 순서

```
1. [인프라] copy 도메인 생성 (src/claude/copy/{agents,commands,hooks,rules,skills}/)
2. [인프라] profile.json, setup.js, CLAUDE.md.template 업데이트
3. [A1] copy 룰 작성 (claude-kit 형식)
4. [A2~A5] copy 에이전트 작성 (YAML + Agent_Prompt 형식)
5. [A6] copy 커맨드 작성 (YAML + 실행 가이드 형식)
6. [A7] copy 훅 작성 (CommonJS 형식, 우선순위 정의)
7. [추가] copy 스킬 작성
8. [추가] 레지스트리 항목 추가
```

### 최종 판정

> CAI 문서 패키지는 **"무엇을 만들 것인가"에 대한 답**으로서 완성도가 높다.  
> 다만 **"claude-kit 안에서 어떻게 만들 것인가"에 대한 답**이 부족하다.  
> 위의 P0 항목 2개를 보완하면, A0-A1 단계부터 즉시 실행 가능하다.
