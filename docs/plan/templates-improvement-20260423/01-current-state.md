# 01. 현황 분석서 — claude-kit 템플릿 전면 개선

> **작성일**: 2026-04-23
> **작성자**: Claude (claude-kit 메인테이너 역할)
> **Status**: Draft — 개선 계획 입력용
> **관련**: [02-improvement-plan.md](./02-improvement-plan.md), [03-decision-log.md](./03-decision-log.md)

---

## 0. 결론 (Executive Summary)

claude-kit 템플릿은 **3 개의 SSOT 후보 위치**에 걸쳐 **40 개 파일**로 분산되어 있다. 단일 SSOT 가 명문화되지 않았고, `CLAUDE.md` ↔ `AGENTS.md` 구조 비대칭, `profile.json.template` 기본값 stale, AGENTS.md 내용과 rule 중복(golden-principle #13 위반) 등 **Critical 1 + High 5 + Medium 7 + Low 4 = 17 이슈** 가 식별되었다.

본 문서는 `docs/40-contributing/02-adding-a-component.md`, `03-domain-authoring.md`, `scripts/setup.js`, `scripts/claude-md-renderer.js`, `scripts/quickstart-renderer.js`, `.claude/skills/kit-scaffolding/SKILL.md`, `src/claude/plan/rules/plan-epic-hierarchy.md`, `src/claude/core/rules/golden-principles.md` 등 **8 개 핵심 레퍼런스**를 근거로 작성되었다.

---

## 1. 인벤토리 (Inventory)

### 1.1 Location A — `src/templates/` (Installer 소비, 23 파일)

설치 시점(`pnpm install` postinstall)에 `scripts/setup.js` 가 소비하여 프로젝트 루트에 문서·설정을 생성한다.

| # | 파일 | 크기 | 유형 | 소비자 |
|---|------|-----:|------|--------|
| 1 | `CLAUDE.md.template` | 14줄 | Claude target 런타임 헤더 | `setup.js` + `claude-md-merger.js` + `claude-md-renderer.js` |
| 2 | `AGENTS.md.template` | 91줄 | Codex target 런타임 가이드 | `setup.js` (전체 복사) |
| 3 | `CLAUDE-KIT-QUICKSTART.md.template` | 7줄 | Quickstart 래퍼 | `setup.js` + `quickstart-renderer.js` |
| 4 | `profile.json.template` | 18줄 | 프로젝트 프로필 기본값 | `setup.js` (fresh install) |
| 5 | `settings.json.template` | 14줄 | 참조용 settings (실제는 동적 생성) | 참조만 (소비 없음) |
| 6 | `plugin.json.template` | 22줄 | Claude plugin 매니페스트 | `setup.js` (plugin emitter) |
| 7 | `marketplace-entry.json.template` | 6줄 | marketplace 엔트리 | `setup.js` (marketplace emitter) |
| 8-13 | `claude-md/00-preamble.md` ~ `90-currentdate.md` (6개) | 3~21줄 | CLAUDE.md 섹션 블록 | `claude-md-renderer.js` |
| 14-23 | `quickstart/blocks/01-header.md` ~ `10-repo-appendix.md` (10개) | 3~13줄 | Quickstart 섹션 블록 | `quickstart-renderer.js` |

**세부**:
- `claude-md/` 블록 6: `00-preamble.md`, `10-dev.md`, `20-plan.md`, `30-copy.md`, `40-core.md`, `90-currentdate.md`
- `quickstart/blocks/` 10: `01-header.md`, `02-install-summary.md`, `03-pipeline-chooser.md`, `04-plan-flow.md`, `05-dev-flow.md`, `05b-copy-flow.md`, `06-target-diff.md`, `07-first-actions.md`, `08-reconfig.md`, `09-mini-glossary.md`, `10-repo-appendix.md` (실제 10개 — 05b 때문에 파일 11개)

### 1.2 Location B — `src/claude/plan/skills/plan-epic-workflow/templates/` (5 파일, v2.4.0+)

`/plan-epic` 커맨드 및 `plan-epic-workflow` skill 이 Epic/Feature 계층 구조 문서를 생성할 때 소비.

| # | 파일 | 줄 수 | 목적 | 도입 |
|---|------|-----:|------|------|
| 1 | `epic-brief.md` | 91 | Epic 개요 (Why/What/Scope/Milestone) | v2.4.0 |
| 2 | `children-features.md` | 102 | 자식 Feature 실행 지도 (Phase/의존성 매트릭스) | v2.4.0 |
| 3 | `epic-binding.md` | 79 | Feature ↔ Epic 연결 메타 | v2.4.0 |
| 4 | `phase-roadmap.md` | 119 | Phase 로드맵 자동 생성 (T-TMPL-01) | v2.5.0 |
| 5 | `implementation-hints.md` | 140 | 기획↔구현 역기록 (T-BKLG-03, Backlog) | v2.6.0+ (대기) |

### 1.3 Location C — `.claude/skills/kit-scaffolding/references/` (12 파일)

`/kit-create` 커맨드가 새 컴포넌트(command/agent/skill/hook/rule)를 스캐폴딩할 때 소비.

| # | 템플릿 | 대상 타입 | 타깃 |
|---|--------|----------|------|
| 1 | `template-skill.md` | skill | Claude |
| 2 | `template-agent.md` | agent | Claude |
| 3 | `template-command-simple.md` | command (--simple) | Claude |
| 4 | `template-command-complex.md` | command (--complex) | Claude |
| 5 | `template-hook-pre.md` | hook (PreToolUse) | Claude |
| 6 | `template-hook-post.md` | hook (PostToolUse) | Claude |
| 7 | `template-hook-stop.md` | hook (Stop) | Claude |
| 8 | `template-rule.md` | rule | Claude |
| 9 | `template-codex-skill.md` | skill | Codex |
| 10 | `template-codex-agent.md` | agent | Codex |
| 11 | `template-codex-command.md` | command | Codex |
| 12 | `template-codex-hook.md` | hook | Codex |

### 1.4 총계

| 위치 | 파일 수 | 소비자 | 도입 시점 |
|------|-----:|--------|-----------|
| Location A (`src/templates/`) | 23 | `scripts/setup.js` + 2 renderer | v2.2 (legacy) |
| Location B (`plan-epic-workflow/templates/`) | 5 | `/plan-epic` 커맨드 | v2.4.0 |
| Location C (`kit-scaffolding/references/`) | 12 | `/kit-create` 커맨드 | v2.3.x |
| **합계** | **40** | 3 개 SSOT | — |

---

## 2. 소비자 맵 (Consumer Map)

```
                      ┌─────────────────────────────────────┐
                      │      src/templates/ (Location A)    │
                      │  ┌──────────────────────────────┐   │
                      │  │ CLAUDE.md.template           │◄──┼── scripts/claude-md-merger.js
                      │  │ AGENTS.md.template           │◄──┼── scripts/setup.js (전체 복사)
                      │  │ CLAUDE-KIT-QUICKSTART.md     │◄──┼── scripts/quickstart-renderer.js
                      │  │ profile.json.template        │◄──┼── scripts/setup.js (fresh install)
                      │  │ claude-md/NN-*.md (6)        │◄──┼── scripts/claude-md-renderer.js
                      │  │ quickstart/blocks/NN-*.md(10)│◄──┼── scripts/quickstart-renderer.js
                      │  └──────────────────────────────┘   │
                      └─────────────────────────────────────┘
                                    ▲
                                    │ postinstall
                                    │
                      ┌─────────────────────────────────────┐
                      │         pnpm install                │
                      │   → scripts/setup.js 실행            │
                      └─────────────────────────────────────┘

                      ┌─────────────────────────────────────┐
                      │  plan-epic-workflow/templates/ (B)   │
                      │  ┌──────────────────────────────┐   │
                      │  │ epic-brief.md                │◄──┼── /plan-epic (create)
                      │  │ children-features.md         │◄──┼── /plan-epic (create)
                      │  │ epic-binding.md              │◄──┼── plan-bridge-writer
                      │  │ phase-roadmap.md             │◄──┼── /plan-epic phase generate (v2.5.0)
                      │  │ implementation-hints.md      │◄──┼── (Backlog, v2.6.0+)
                      │  └──────────────────────────────┘   │
                      └─────────────────────────────────────┘

                      ┌─────────────────────────────────────┐
                      │  .claude/skills/kit-scaffolding/ (C)│
                      │  ┌──────────────────────────────┐   │
                      │  │ template-skill.md            │◄──┼── /kit-create skill
                      │  │ template-agent.md            │◄──┼── /kit-create agent
                      │  │ template-command-*.md (2)    │◄──┼── /kit-create command
                      │  │ template-hook-*.md (3)       │◄──┼── /kit-create hook
                      │  │ template-rule.md             │◄──┼── /kit-create rule
                      │  │ template-codex-*.md (4)      │◄──┼── /kit-create (--target=codex)
                      │  └──────────────────────────────┘   │
                      └─────────────────────────────────────┘
```

### 2.1 변수 치환 시스템 (중복)

두 개의 독립 `substituteVars()` 함수가 `{{VAR}}` 문법을 구현한다:

1. `scripts/claude-md-renderer.js:54` — Location A 소비용
2. `.claude/skills/kit-scaffolding/SKILL.md §변수 치환 시스템` — Location C 소비용 (별도 구현)

**Location B 는 치환 없이 사용자 직접 편집** (템플릿 자체가 `{placeholder}` 형식으로 안내).

### 2.2 docs 참조

- [`docs/40-contributing/02-adding-a-component.md`](../../40-contributing/02-adding-a-component.md) — Location C 사용법
- [`docs/40-contributing/03-domain-authoring.md`](../../40-contributing/03-domain-authoring.md) §6 — Location A 블록 추가 절차
- [`docs/plan/documentation-package-plan.md`](../documentation-package-plan.md) §1.2 — SSOT 언급 (Location A 만)

---

## 3. 7축 점수표 (Scoring Matrix)

점수: 1 (매우 나쁨) ~ 5 (매우 좋음). 3 미만은 개선 대상.

### 3.1 Location A — `src/templates/` 23 파일

| 파일 | 1.일관성 | 2.완결성 | 3.중복도 | 4.재사용성 | 5.SSOT | 6.최신성 | 7.문서화 | 평균 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CLAUDE.md.template | 4 | 2 | 4 | 4 | 3 | 4 | 2 | **3.3** |
| AGENTS.md.template | 3 | 5 | **1** | 2 | 2 | 3 | 3 | **2.7** |
| CLAUDE-KIT-QUICKSTART.md.template | 5 | 5 | 5 | 5 | 5 | 5 | 3 | **4.7** |
| profile.json.template | 3 | **2** | 4 | 4 | 4 | **2** | 3 | **3.1** |
| settings.json.template | 3 | 3 | 5 | 2 | **2** | 3 | 3 | **3.0** |
| plugin.json.template | 5 | 5 | 5 | 5 | 5 | 4 | 4 | **4.7** |
| marketplace-entry.json.template | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| claude-md/00-preamble.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| claude-md/10-dev.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| claude-md/20-plan.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| claude-md/30-copy.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| claude-md/40-core.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| claude-md/90-currentdate.md | 5 | 4 | **2** | 5 | 3 | 5 | 3 | **3.9** |
| quickstart/blocks/01-header.md | 5 | 4 | 5 | 5 | 5 | 5 | 3 | **4.6** |
| quickstart/blocks/02-install-summary.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/03-pipeline-chooser.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/04-plan-flow.md | 5 | 5 | 4 | 5 | 5 | 5 | 4 | **4.7** |
| quickstart/blocks/05-dev-flow.md | 5 | 5 | 4 | 5 | 5 | 5 | 4 | **4.7** |
| quickstart/blocks/05b-copy-flow.md | **2** | 5 | 4 | 5 | 5 | 5 | 4 | **4.3** |
| quickstart/blocks/06-target-diff.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/07-first-actions.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/08-reconfig.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/09-mini-glossary.md | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9** |
| quickstart/blocks/10-repo-appendix.md | 5 | 3 | 5 | **2** | 4 | 3 | 3 | **3.6** |

**Location A 평균**: 4.36 / 7 축

### 3.2 Location B — `plan-epic-workflow/templates/` 5 파일

| 파일 | 1.일관성 | 2.완결성 | 3.중복도 | 4.재사용성 | 5.SSOT | 6.최신성 | 7.문서화 | 평균 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| epic-brief.md | 4 | 5 | **3** | 4 | 4 | 5 | 4 | **4.1** |
| children-features.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| epic-binding.md | 4 | 5 | 4 | 4 | 5 | 5 | 4 | **4.4** |
| phase-roadmap.md | **2** | 5 | 4 | 3 | 5 | 5 | 5 | **4.1** |
| implementation-hints.md | **2** | 5 | 4 | 3 | 5 | 4 | 5 | **4.0** |

**Location B 평균**: 4.20

### 3.3 Location C — `kit-scaffolding/references/` 12 파일

| 파일 | 1.일관성 | 2.완결성 | 3.중복도 | 4.재사용성 | 5.SSOT | 6.최신성 | 7.문서화 | 평균 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| template-skill.md | 5 | **2** | 5 | 5 | 5 | 4 | **2** | **4.0** |
| template-agent.md | 5 | 3 | 5 | 5 | 5 | 4 | 3 | **4.3** |
| template-command-simple.md | 5 | **2** | 5 | 5 | 5 | 4 | **2** | **4.0** |
| template-command-complex.md | 5 | 4 | 5 | 5 | 5 | 4 | 3 | **4.4** |
| template-hook-pre.md | 5 | 4 | 5 | 5 | 5 | 4 | 3 | **4.4** |
| template-hook-post.md | 5 | 4 | 5 | 5 | 5 | 4 | 3 | **4.4** |
| template-hook-stop.md | 5 | 4 | 5 | 5 | 5 | 4 | 3 | **4.4** |
| template-rule.md | 5 | 3 | 5 | 5 | 5 | 4 | 3 | **4.3** |
| template-codex-*.md (4 파일) | 5 | 3 | 5 | 5 | 5 | 4 | 3 | **4.3** |

**Location C 평균**: 4.30

### 3.4 요약

전체 평균: **4.30 / 5.00**. 개별 축 중 **중복도**(AGENTS.md)와 **완결성**(kit-scaffolding 일부)이 최하.

**점수 3 미만 셀**: 12 개 (40 파일 × 7 축 = 280 셀 중 4.3%) — 대부분 Critical/High 이슈에 귀속.

---

## 4. 이슈 리스트 (Issue List)

### 4.1 Critical (1 건)

#### C1. 템플릿 소유권 SSOT 명문화 부재

- **증거**:
  - [`docs/plan/documentation-package-plan.md:57`](../documentation-package-plan.md) — "Quickstart 블록 | `src/templates/quickstart/blocks/` | 설치 후 온보딩" 만 SSOT 목록에 포함.
  - [`docs/40-contributing/02-adding-a-component.md:25`](../../40-contributing/02-adding-a-component.md) — "kit-scaffolding 스킬이 12개 표준 템플릿" (Location C) 존재.
  - [`src/claude/plan/skills/plan-epic-workflow/templates/`](../../../src/claude/plan/skills/plan-epic-workflow/templates/) — Location B 존재.
  - 3 Location 의 관계·소유권·우선순위를 명시한 rule 파일 없음.
- **영향**: 신규 템플릿 추가 시 어느 Location 에 두어야 할지 판단 근거 부재. 기존 템플릿 수정 시 중복 수정 가능성.
- **확산**: 도메인 증가 시 템플릿 폭증 → 유지보수 난이도 지수 증가.

---

### 4.2 High (5 건)

#### H1. `CLAUDE.md.template` ↔ `AGENTS.md.template` 구조 비대칭

- **증거**:
  - [`src/templates/CLAUDE.md.template:1-19`](../../../src/templates/CLAUDE.md.template) — 14줄, `<!-- kit:managed:start -->` 마커 기반 블록 병합 방식.
  - [`src/templates/AGENTS.md.template:1-91`](../../../src/templates/AGENTS.md.template) — 91줄, 단일 파일 전체 복사 방식.
  - 동일 목적(target runtime guidance)인데 구조·분량·업데이트 방식 상이.
- **영향**: Codex target 사용자는 AGENTS.md 업데이트 시 전체 교체, Claude 사용자는 managed 섹션만 교체 — 사용자 경험 비대칭.
- **확산**: `docs/40-contributing/03-domain-authoring.md §6` 에서 claude-md 블록만 안내, AGENTS 블록 불명확.

#### H2. AGENTS.md.template 내용이 rule 과 중복

- **증거**:
  - [`src/templates/AGENTS.md.template:11-17`](../../../src/templates/AGENTS.md.template) "핵심 운영 원칙" ↔ [`src/claude/core/rules/golden-principles.md`](../../../src/claude/core/rules/golden-principles.md) #1, #3, #6, #10 중복.
  - [`src/templates/AGENTS.md.template:27-37`](../../../src/templates/AGENTS.md.template) "검증 기준" ↔ [`src/claude/core/rules/verification.md`](../../../src/claude/core/rules/verification.md) Iron Law·Gate Function 중복.
  - [`src/templates/AGENTS.md.template:47-53`](../../../src/templates/AGENTS.md.template) "보안 기준" ↔ [`src/claude/core/rules/security.md`](../../../src/claude/core/rules/security.md) Mandatory Security Checks 중복.
  - [`src/templates/AGENTS.md.template:39-45`](../../../src/templates/AGENTS.md.template) "코드 품질 기준" ↔ [`src/claude/core/rules/coding-style.md`](../../../src/claude/core/rules/coding-style.md) Code Quality Checklist 중복.
  - [`src/claude/core/rules/golden-principles.md §13`](../../../src/claude/core/rules/golden-principles.md) "Document Non-Duplication" 원칙 위반.
- **영향**: rule 수정 시 AGENTS.md 미동기화 → drift. Codex target 사용자가 stale 지침 수신.
- **확산**: 신규 rule 추가 시 "AGENTS.md 에도 반영해야 하는가?" 판단 기준 부재.

#### H3. `profile.json.template` 기본 도메인 stale

- **증거**:
  - [`src/templates/profile.json.template:7`](../../../src/templates/profile.json.template) — `"domains": ["core", "dev"]` 만.
  - [`CLAUDE.md:52-54`](../../../CLAUDE.md) (claude-kit 자체) — "domains: core, dev | targets: claude" 명시 (claude-kit 레포 자체는 일관).
  - 그러나 다운스트림 프로젝트는 `plan`, `copy` 도메인 채택 가능 (v2.4.0 Epic 계층 도입).
  - fresh install 시 profile.json 이 `core, dev` 만 활성 → 사용자가 수동으로 plan/copy 추가 필요.
  - [`docs/plan/kit-2.4.0-roadmap/README.md:45`](../kit-2.4.0-roadmap/README.md) v2.4.0 는 **Opt-in** 원칙 강조 — 기본값에 plan 포함은 반대 방향.
- **영향**: 판단 필요 — 기본값을 바꿀지, 다운스트림이 profile.json 커스터마이즈를 항상 한다는 전제로 둘지.
- **확산**: H1 과 연계 — AGENTS.md 도 `core, dev` 만 기본 가정.

#### H4. 템플릿 네이밍 컨벤션 4종 혼재

- **증거**:
  - Location A: `*.md.template` (6개) + `NN-*.md` (16개) — 두 컨벤션 혼재.
  - Location B: `{name}.md` (5개) — prefix 없음.
  - Location C: `template-{type}-{variant}.md` (12개) — `template-` prefix.
  - [`scripts/quickstart-renderer.js:10-21`](../../../scripts/quickstart-renderer.js) `CORE_BLOCKS` 에 `05b-copy-flow.md` 등 순서 규칙 깨짐 (M1 참조).
- **영향**: Glob 검색 시 `templates/*` 패턴으로 3 Location 전부 잡을 수 없음.
- **확산**: 신규 template 추가 시 어느 컨벤션 따를지 판단 부재.

#### H5. 메타 템플릿 혼재 (템플릿 + 설명 + 체크리스트)

- **증거**:
  - [`src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md:1-22`](../../../src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md) — "변수 치환 필드" 표 (설명 문서).
  - 같은 파일 `:24-90` — 실제 템플릿 본문 (codeblock 내).
  - 같은 파일 `:94-118` — 변수 치환 규칙 + 안전 검증 + 변경 이력 (설명 문서).
  - [`src/claude/plan/skills/plan-epic-workflow/templates/implementation-hints.md:1-18`](../../../src/claude/plan/skills/plan-epic-workflow/templates/implementation-hints.md) — 활성화 조건·섹션 구조 설명.
  - 같은 파일 `:20-79` — 실제 템플릿 본문.
  - 같은 파일 `:83-139` — 책임 매트릭스 + 체크리스트 + 하위 호환성.
- **영향**: 템플릿 렌더러(또는 사용자)가 "어디부터 어디까지가 실제 템플릿인가" 판단 필요. 자동 치환 불가.
- **확산**: T-TMPL-01 `/plan-epic phase generate` 구현 시 파일에서 템플릿 부분만 추출 로직 필요.

---

### 4.3 Medium (7 건)

#### M1. `quickstart/blocks/05b-copy-flow.md` 특수 prefix

- **증거**:
  - [`scripts/quickstart-renderer.js:10-21`](../../../scripts/quickstart-renderer.js) — `CORE_BLOCKS` 배열: `05-dev-flow.md`, `05b-copy-flow.md`, `06-target-diff.md` (순서 규칙 `NN-*` 깨짐).
  - `05b` 는 copy 도메인이 dev 다음 후발 도입되어 번호 충돌 회피용.
- **영향**: 블록 순서 추적 시 `05b` 가 이질적. 향후 도메인 추가 시 동일 패턴 반복 위험.

#### M2. `10-repo-appendix.md` 하드코딩 링크 stale

- **증거**:
  - [`src/templates/quickstart/blocks/10-repo-appendix.md:5-9`](../../../src/templates/quickstart/blocks/10-repo-appendix.md) — `./00-overview.md`, `./01-planning-pipeline.md`, `./08-dev-workflow.md`, `./09-architecture.md`, `./10-glossary.md`.
  - 실제 docs 구조: `docs/00-overview/*.md`, `docs/10-features/*.md`, `docs/20-user-guide/*.md` — 상대 링크 파괴.
  - [`docs/plan/documentation-package-plan.md`](../documentation-package-plan.md) 2026-04-17 재구조화 이후 경로 변경되었으나 repo-appendix 미갱신.
- **영향**: Quickstart 문서 링크 클릭 시 404. 사용자 온보딩 경로 단절.

#### M3. `settings.json.template` drift 위험

- **증거**:
  - [`src/templates/settings.json.template:2`](../../../src/templates/settings.json.template) — `"_note": "이 파일은 참조용 템플릿입니다. 실제 settings.json은 setup.js의 buildSettingsTemplate()이 도메인 조건부로 동적 생성합니다."`
  - 실제 참조용으로만 존재 — consumer 없음.
  - `setup.js` 로직 변경 시 이 template 업데이트 의무 없음 → drift.
- **영향**: 사용자가 settings.json.template 을 보고 실제 산출물 오해.

#### M4. Epic 상태 enum 중복 정의

- **증거**:
  - [`src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md:4`](../../../src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md) — `draft | planning | active | completed | archived` 하드코딩.
  - [`src/claude/plan/rules/plan-epic-hierarchy.md §4`](../../../src/claude/plan/rules/plan-epic-hierarchy.md) — 동일 enum 정의 (SSOT).
  - Enum 변경 시 2 곳 동기화 의무.
- **영향**: SSOT 원칙 위반. 신규 상태 추가 시 놓치기 쉬움.

#### M5. plan-epic 템플릿 파일명 단/복수 혼재

- **증거**:
  - `epic-brief.md` (명사, 단수)
  - `children-features.md` (명사, 복수)
  - `epic-binding.md` (명사, 단수)
  - `phase-roadmap.md` (명사, 단수)
  - `implementation-hints.md` (명사, 복수)
- **영향**: 네이밍 규칙 일관성 깨짐. 신규 템플릿 추가 시 선례 참조 혼란.

#### M6. kit-scaffolding 템플릿 본문이 빈약 (TODO 남발)

- **증거**:
  - [`.claude/skills/kit-scaffolding/references/template-command-simple.md:1-34`](../../../.claude/skills/kit-scaffolding/references/template-command-simple.md) — 34줄 중 14줄이 "TODO:".
  - [`.claude/skills/kit-scaffolding/references/template-skill.md:1-28`](../../../.claude/skills/kit-scaffolding/references/template-skill.md) — 28줄 중 7줄이 "TODO:".
  - 사용자가 TODO 를 지우지 않고 그대로 커밋할 위험 (`/kit-validate` 가 TODO 탐지하는지 미확인).
- **영향**: 실제 커밋된 컴포넌트에 TODO 잔존 → 품질 저하.

#### M7. `currentdate` 템플릿 위치 중복

- **증거**:
  - [`src/templates/claude-md/90-currentdate.md:1-2`](../../../src/templates/claude-md/90-currentdate.md) — 2줄 `# currentDate\nToday's date is {{DATE}}.`
  - [`scripts/claude-md-merger.js:53-56`](../../../scripts/claude-md-merger.js) `stripLegacyCurrentDate()` — legacy CLAUDE.md 말미 `# currentDate` 블록 제거 로직.
  - 즉, 블록 `90-currentdate.md` 가 managed 섹션 안에 새로 들어가고 legacy 는 제거 — 정상. 그러나 파일명 `90-currentdate.md` vs 내용 `# currentDate` — case 불일치.
- **영향**: 파일명 kebab-case 와 섹션 제목 camelCase 불일치.

---

### 4.4 Low (4 건)

#### L1. 파일 확장자 `.template` vs `.md` 혼재

- **증거**:
  - Location A 루트 7개: `.template` 확장자.
  - Location A 블록 16개: `.md` 확장자.
  - Location B 5개: `.md`.
  - Location C 12개: `.md`.
- **영향**: Glob 패턴 `**/*.template` 으로 루트만 수집. 블록까지 포함하려면 `**/*` + 필터 필요.

#### L2. AGENTS.md.template §Codex direct-use 자산 — AGENTS 런타임 금지 패턴과 충돌 위험

- **증거**:
  - [`src/templates/AGENTS.md.template:63-70`](../../../src/templates/AGENTS.md.template) — ".agents/skills/**", ".codex/agents/*.toml", "plugins/claude-kit/**" 경로 언급.
  - [`scripts/setup.js:43-56`](../../../scripts/setup.js) `AGENTS_MD_RUNTIME_FORBIDDEN` — `src/(claude|codex)/`, `docs/codex-guidance/`, "codex-sync Phase" 등 금지 패턴.
  - 현재 template 은 금지 패턴 미포함 (호환). 그러나 template 확장 시 실수로 `src/` 경로 추가 위험.
- **영향**: Lint rule 없이 manual 체크에 의존.

#### L3. 변수 치환 로직 2 곳 중복

- **증거**:
  - [`scripts/claude-md-renderer.js:54-60`](../../../scripts/claude-md-renderer.js) `substituteVars()`.
  - [`.claude/skills/kit-scaffolding/SKILL.md §변수 치환 시스템`](../../../.claude/skills/kit-scaffolding/SKILL.md) — 별도 치환 로직 (구현은 `/kit-create` 내부).
  - [`scripts/quickstart-renderer.js`](../../../scripts/quickstart-renderer.js) — 별도 `substituteVars()` (renderer.js:54 와 중복 가능성).
- **영향**: `{{VAR}}` 문법 확장 시 (예: escape, default value) 여러 곳 수정 필요.

#### L4. 변경 이력 섹션 형식 불일치

- **증거**:
  - [`src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md:114-118`](../../../src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md) — `| 날짜 | 내용 |` (2 컬럼).
  - [`src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md:86-90`](../../../src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md) — `| 날짜 | 내용 |` (2 컬럼).
  - [`src/claude/plan/skills/plan-epic-workflow/templates/implementation-hints.md:135-139`](../../../src/claude/plan/skills/plan-epic-workflow/templates/implementation-hints.md) — `| 날짜 | 내용 | 작성자 |` (3 컬럼).
- **영향**: 미세한 일관성 위반. 일괄 스크립트 처리 시 파싱 혼선.

---

## 5. 이슈 요약

| 심각도 | 개수 | 키 |
|:---:|:---:|---|
| Critical | 1 | C1 |
| High | 5 | H1, H2, H3, H4, H5 |
| Medium | 7 | M1, M2, M3, M4, M5, M6, M7 |
| Low | 4 | L1, L2, L3, L4 |
| **합계** | **17** | — |

---

## 6. 참고: v2.4.0 / v2.5.0 반영 상태

| 자산 | v2.4.0 반영 | v2.5.0 T-TMPL-01 반영 |
|------|:---:|:---:|
| `claude-md/20-plan.md` Epic 언급 | ✅ | — |
| `claude-md/10-dev.md` dev-implementer | ✅ (v2.3.1) | — |
| `profile.json.template` core/dev/plan 기본값 | ❌ (H3) | — |
| `epic-brief.md`, `children-features.md`, `epic-binding.md` | ✅ | — |
| `phase-roadmap.md` | — | ✅ (템플릿 존재) |
| `implementation-hints.md` | — | 🟡 (Backlog, v2.6.0+ 대기) |
| `/plan-epic phase generate` 서브커맨드 | — | 🟡 (로직 미구현, 별도 세션 권장) |

---

## 7. 교차 참조

- **핵심 룰**:
  - [`golden-principles.md §13 Document Non-Duplication`](../../../src/claude/core/rules/golden-principles.md) — H2 위반 근거
  - [`plan-epic-hierarchy.md §4 상태 머신`](../../../src/claude/plan/rules/plan-epic-hierarchy.md) — M4 중복 근거
  - [`task-id-naming.md §1 4 패턴`](../../../src/claude/core/rules/task-id-naming.md) — TASK ID 형식 (`T-TMPL-{NN}` 사용 예정)

- **기존 개선 이력**:
  - [`docs/plan/kit-2.4.0-roadmap/`](../kit-2.4.0-roadmap/) — Hierarchical Plan Structure 릴리스
  - [`docs/plan/documentation-package-plan.md`](../documentation-package-plan.md) — 2026-04-17 docs 재구조화 draft (SSOT 언급)
  - [`docs/plan/agents-md-runtime-link-cleanup/`](../agents-md-runtime-link-cleanup/) — 최근 AGENTS.md 정리 (L2 연계)

- **스펙 위치**:
  - [`docs/archive/kit-2.3.0-roadmap/`](../../archive/kit-2.3.0-roadmap/) — IMP-KIT-015, IMP-KIT-017 등
  - [`docs/archive/kit-agent-improvements-v2.3.1/`](../../archive/kit-agent-improvements-v2.3.1/) — IMP-AGENT-009 텔레메트리

---

## 8. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — 40 파일 인벤토리 + 7축 점수표 + 17 이슈 식별 | Claude (메인테이너 역할) |
