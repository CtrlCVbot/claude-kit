# 템플릿 거버넌스 (Template Governance)

> **결론**: T-TMPL-01. claude-kit 의 템플릿은 **3 Location 에 분산**되며 각 위치는 **서로 다른 소비자** 를 가진다. 본 룰은 3 Location 의 관계·소유권·네이밍·추가 절차를 단일 SSOT 로 정의하여 신규 템플릿 추가 시 혼란을 제거한다.

**스펙**: [`docs/plan/templates-improvement-20260423/02-improvement-plan.md`](../../../../../docs/plan/templates-improvement-20260423/02-improvement-plan.md) T-TMPL-01
**관련 결정**: [D-04 SSOT Location 전략](../../../../../docs/plan/templates-improvement-20260423/03-decision-log.md)
**관련 룰**: [`golden-principles.md §13`](./golden-principles.md) Document Non-Duplication

---

## 1. 3 Location 정의

| Location | 경로 | 소비자 | 용도 | 도입 |
|:---:|---|---|---|:---:|
| **A** | `src/templates/` | `scripts/setup.js` + renderer | postinstall 시점에 프로젝트 루트 문서·설정 생성 | v2.2 |
| **B** | `src/claude/plan/skills/plan-epic-workflow/templates/` | `/plan-epic` 커맨드 + `plan-bridge-writer` | Epic/Feature 계층 문서 런타임 생성 | v2.4.0 |
| **C** | `.claude/skills/kit-scaffolding/references/` | `/kit-create` 커맨드 | 새 컴포넌트 (command/agent/skill/hook/rule) 스캐폴딩 | v2.3.x |

### 1-1. 왜 3 Location 인가

D-04 결정: **통합 비용 > 유지 비용**.

- **소비자가 근본적으로 다르다**: installer (시스템 시점) vs plan-epic (사용자 명시 호출) vs kit-create (개발자 명시 호출).
- **Skill 응집 원칙**: `kit-scaffolding` skill 과 `plan-epic-workflow` skill 은 자신의 템플릿을 내부에 보유하는 게 자연스럽다. 외부 디렉터리로 분리하면 skill 독립성 훼손.
- 통합 시 import 체인 복잡화 + skill 디렉터리 자기 완결성 훼손 > 분산 유지 비용.

---

## 2. 소유권 매트릭스

### 2-1. Location A — `src/templates/` 책임

| 파일 유형 | 1 차 작성 | 후속 갱신 | 소비자 |
|:---:|:---:|:---:|:---:|
| 루트 `*.template` (installer entry) | 메인 (PR 기반) | 메인 | `setup.js` |
| `claude-md/NN-*.md` (섹션 블록) | 메인 + 도메인 오너 | 도메인 오너 | `claude-md-renderer.js` |
| `quickstart/blocks/NN-*.md` (섹션 블록) | 메인 | 메인 | `quickstart-renderer.js` |

### 2-2. Location B — `plan-epic-workflow/templates/` 책임

| 파일 | 1 차 작성 | 후속 갱신 | 소비자 |
|:---:|:---:|:---:|:---:|
| `epic-brief.md`, `children-features.md`, `epic-binding.md` | plan skill 오너 | `/plan-epic`, `plan-bridge-writer` | `/plan-epic create` |
| `phase-roadmap.md`, `implementation-hints.md` | plan skill 오너 | plan skill 오너 | `/plan-epic phase generate` (v2.5.0+) |

### 2-3. Location C — `.claude/skills/kit-scaffolding/references/` 책임

| 파일 | 1 차 작성 | 후속 갱신 | 소비자 |
|:---:|:---:|:---:|:---:|
| `template-{type}-*.md` (Claude 8 + Codex 4) | kit-scaffolding skill 오너 | kit-scaffolding skill 오너 | `/kit-create` |

---

## 3. 네이밍 컨벤션

### 3-1. Location A (`src/templates/`)

| 대상 | 규칙 | 예시 |
|---|---|---|
| 루트 래퍼 | `{NAME}.{ext}.template` | `CLAUDE.md.template`, `profile.json.template` |
| 섹션 블록 | `{NN}-{kebab-name}.md` | `10-dev.md`, `04-plan-flow.md` |
| 확장자 | `.template` = installer 진입점, `.md` = 블록 본문 | — |

### 3-2. Location B (`plan-epic-workflow/templates/`)

| 대상 | 규칙 | 예시 |
|---|---|---|
| 순수 템플릿 본문 | `{scope}-{aspect}.template.md` | `phase-roadmap.template.md` (T-TMPL-05 후) |
| 사용법 문서 | `{scope}-{aspect}.md` | `phase-roadmap.md` |
| 단/복수 | **의미 기준** — 내용 스코프가 단일이면 단수, 복수면 복수 (D-02) | `epic-brief.md` (단수), `children-features.md` (복수) |

### 3-3. Location C (`.claude/skills/kit-scaffolding/references/`)

| 대상 | 규칙 | 예시 |
|---|---|---|
| 전체 | `template-{type}[-{variant}].md` | `template-command-simple.md`, `template-codex-agent.md` |
| Codex 구분 | `template-codex-{type}.md` prefix | `template-codex-hook.md` |

### 3-4. 공통 규칙

- **kebab-case 소문자** (파일명).
- **확장자 `.md`** 기본 (blocks / 템플릿 본문).
- **`.template`** 은 installer entry 전용 (Location A 루트만).
- **변수 치환 대상** 은 `.template.md` (Location B 의 T-TMPL-05 도입 후).

---

## 4. Glob 패턴 표준

| 목적 | 패턴 | 비고 |
|---|---|---|
| 전체 템플릿 수집 | `src/templates/**/* ∪ src/claude/**/templates/**/* ∪ .claude/skills/**/references/template-*.md` | 3 Location 병합 |
| Location A 루트만 | `src/templates/*.template` | 7 파일 |
| Location A 블록만 | `src/templates/*/blocks/**/*.md ∪ src/templates/claude-md/**/*.md` | 16 파일 |
| Location B 템플릿 본문만 | `src/claude/plan/skills/*/templates/*.template.md` | (T-TMPL-05 후) |
| Location C 전체 | `.claude/skills/kit-scaffolding/references/template-*.md` | 12 파일 |

---

## 5. 새 템플릿 추가 결정 트리

```
신규 템플릿이 필요하다
       ↓
[Q1] 이 템플릿은 언제 소비되는가?
   ├─ 설치/업데이트 시점 (pnpm install postinstall)
   │     → Location A (src/templates/)
   │     → [Q1-A] 단일 파일 래퍼인가?
   │        ├─ 예 → 루트에 {NAME}.{ext}.template
   │        └─ 아니오 → 블록 디렉터리 (claude-md/ or quickstart/blocks/ or agents-md/)
   │
   ├─ 런타임 (사용자가 커맨드로 호출)
   │     → [Q1-B] 어느 커맨드?
   │        ├─ /plan-epic        → Location B (plan-epic-workflow/templates/)
   │        ├─ /kit-create       → Location C (.claude/skills/kit-scaffolding/references/)
   │        └─ 다른 skill/커맨드 → 해당 skill 내부 templates/ 디렉터리 신설
   │
   └─ 불확실
         → 메인테이너에게 SSOT Location 질문
```

### 5-1. 판단 예시

| 시나리오 | 선택 Location | 근거 |
|---|:---:|---|
| `AGENTS.md.template` 도메인 블록 신설 (T-TMPL-02) | A (`src/templates/agents-md/`) | installer 시점 소비 |
| 새 도메인 (`copy`) quickstart 블록 | A (`src/templates/quickstart/blocks/`) | installer 소비 |
| Epic 하위 새 문서 (`04-decision-log.md`) 템플릿 | B (`plan-epic-workflow/templates/`) | `/plan-epic` 소비 |
| 새 hook 타입 (`template-hook-sessionstart.md`) | C (`kit-scaffolding/references/`) | `/kit-create hook` 소비 |
| Plan 도메인 새 skill 내부 템플릿 | 새 skill 자체 `templates/` | skill 자기 완결성 |

---

## 6. 중복 방지 (golden-principles #13)

### 6-1. rule 내용은 템플릿에 inline 금지

**예시 위반**: [`AGENTS.md.template:11-17`](../../../../src/templates/AGENTS.md.template) "핵심 운영 원칙" 이 [`golden-principles.md §1,3,6,10`](./golden-principles.md) 내용을 inline 복제 (T-TMPL-03 로 수정 예정).

**올바른 패턴**:
- 템플릿은 **2~3 줄 핵심 요약** + **rule 경로 안내** 링크.
- 상세는 프로젝트 `.claude/rules/` 를 참조하도록 유도 (D-05).
- Codex target template 은 `src/` 경로 금지 패턴 ([`AGENTS_MD_RUNTIME_FORBIDDEN`](../../../../scripts/setup.js)) 충돌 회피를 위해 `.claude/rules/` 상대 경로 또는 일반 안내 문구 사용.

### 6-2. 하드코딩된 enum 은 SSOT 참조

**예시 위반**: `epic-brief.md:4` Epic 상태 enum 하드코딩 (T-TMPL-10 로 수정 예정).

**올바른 패턴**:
- enum 참조는 SSOT 경로 링크로: `(SSOT: [plan-epic-hierarchy.md §4](../../../rules/plan-epic-hierarchy.md))`
- 사용자는 링크를 읽고 값 선택.

### 6-3. 8-gram Jaccard 임계값

- 동일 저장소 내 다른 템플릿 또는 rule 과의 **8-gram Jaccard 유사도 < 0.3** 목표.
- 초과 시 `no-duplication-guard.js` hook (optional) 이 warning 발행.

---

## 7. 변경 이력 표준 형식

모든 템플릿 파일 하단 `## 변경 이력` 표는 **3 컬럼** 으로 통일 (T-TMPL-17):

```markdown
| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — {요약} | Claude (메인테이너 역할) |
```

2 컬럼 형식 (`| 날짜 | 내용 |`) 은 점진적으로 3 컬럼으로 확장.

---

## 8. 변수 치환 문법

3 Location 모두 공통:

- 문법: `{{VARIABLE_NAME}}` (double curly brace)
- 대문자 + underscore (예: `{{PROJECT_NAME}}`, `{{ACTIVE_DOMAINS}}`)
- Location B 는 **플레이스홀더** 로 `{예시}` 한글 단일 중괄호 사용 — 치환 대상이 아니라 **사용자 편집 가이드**
- 치환 로직은 T-TMPL-16 후 `scripts/_utils/template-vars.js` 공통 유틸로 통합 예정

---

## 9. 신규 템플릿 추가 절차

1. **Location 결정**: §5 결정 트리 참조
2. **네이밍**: §3 컨벤션 준수
3. **파일 생성**:
   - Location A: `git add src/templates/...`
   - Location B: `git add src/claude/{domain}/skills/{skill}/templates/...`
   - Location C: `git add .claude/skills/kit-scaffolding/references/...`
4. **소비자 연결**:
   - Location A: `setup.js` 또는 renderer 스크립트에 블록 추가
   - Location B: `/plan-epic` 또는 관련 에이전트에 경로 참조
   - Location C: `kit-scaffolding/SKILL.md` 템플릿 목록 표에 엔트리
5. **중복 검증**: §6 기준 Jaccard 측정
6. **문서 반영**:
   - [`docs/40-contributing/02-adding-a-component.md`](../../../../docs/40-contributing/02-adding-a-component.md) 역참조 (해당 시)
   - 본 룰 §1~§5 테이블 갱신
7. **`/kit-validate`** 실행 (Location C 신규 시)
8. **회귀 테스트**: Location A 신규 시 `setup.js --dry-run` 비교

---

## 10. 관련 자산

- **룰**: [`golden-principles.md §13`](./golden-principles.md) Non-Duplication, [`task-id-naming.md`](./task-id-naming.md) TASK ID 규칙, [`verification.md`](./verification.md) Iron Law
- **소비자 스크립트**: `scripts/setup.js`, `scripts/claude-md-renderer.js`, `scripts/quickstart-renderer.js`
- **소비 커맨드**: `/plan-epic` (Location B), `/kit-create` (Location C)
- **기여 가이드**: [`docs/40-contributing/02-adding-a-component.md`](../../../../docs/40-contributing/02-adding-a-component.md), [`docs/40-contributing/03-domain-authoring.md`](../../../../docs/40-contributing/03-domain-authoring.md)

---

## 11. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-TMPL-01 (Phase A 1차). 3 Location SSOT + 네이밍 컨벤션 + 결정 트리 + Non-Duplication 원칙. | Claude (메인테이너 역할) |
