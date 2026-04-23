# 03. 의사결정 로그 — claude-kit 템플릿 개선

> **작성일**: 2026-04-23
> **작성자**: Claude (claude-kit 메인테이너 역할)
> **Status**: Approved — D-01, D-02, D-03 2026-04-23 승인 완료
> **선행 문서**: [01-current-state.md](./01-current-state.md), [02-improvement-plan.md](./02-improvement-plan.md)

---

## 형식

각 결정은 ADR(Architecture Decision Record) 형식으로 기록한다:

- **Context**: 결정을 촉발한 문제·배경
- **Options**: 검토한 대안들
- **Decision**: 선택된 안
- **Rationale**: 선택 근거
- **Consequences**: 결정의 영향·트레이드오프·후속 작업

---

## D-01 — `profile.json.template` 기본 도메인 유지 여부

**Status**: ✅ **승인 완료 (2026-04-23)** — 옵션 C (주석 보강) 확정
**관련 이슈**: H3 ([`01-current-state.md §4.2 H3`](./01-current-state.md))
**관련 TASK**: T-TMPL-06 ([`02-improvement-plan.md §2.3`](./02-improvement-plan.md))

### Context

현재 [`src/templates/profile.json.template:7`](../../../src/templates/profile.json.template) 는 `"domains": ["core", "dev"]` 만 기본값. v2.4.0 에서 plan 도메인이 Hierarchical Plan Structure(Epic/Feature/Task) 도입으로 중요도 상승. copy 도메인도 프로젝트 유형에 따라 필요. fresh install 시 사용자는 수동으로 profile.json 수정해야 plan/copy 사용 가능.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **현행 유지** — `core, dev` | v2.4.0 Opt-in 원칙 준수. 무거운 도메인을 기본값에 강제하지 않음. | 신규 사용자가 plan 도메인 존재를 인지하기 어려움. |
| B | **확장** — `core, dev, plan` | plan 도메인 접근성 증가. Epic 계층 활용 자연스러움. | Opt-in 원칙 위반. plan 도메인 hook(plan-doc-guard 등) 이 원치 않는 프로젝트에서도 로드됨. |
| C | **주석 보강** — 현행 유지 + 안내 주석 | 기본값 유지 + 사용자 인지 가능. | JSON 공식 주석 미지원 → `_note` 필드로 편의. |

### Decision

**옵션 C — 주석 보강** 을 제안 (사용자 최종 결정 대기)

### Rationale

- **옵션 A 문제**: 사용자가 plan/copy 도메인 존재를 모를 수 있음.
- **옵션 B 문제**: [`docs/plan/kit-2.4.0-roadmap/README.md:45`](../kit-2.4.0-roadmap/README.md) "Opt-in 원칙 + 하위 호환 100%" 강조 — 기본값 변경은 이 원칙 위반.
- **옵션 C 절충**: 기본값은 현행 유지 + `_note` 필드로 "plan 도메인 추가: `domains` 배열에 `plan` 추가 후 `pnpm install` 재실행" 안내.
- **근거 rule**: `golden-principles.md §9 HARD-GATE`, `plan-epic-hierarchy.md §3 Opt-in 원칙`.

### Consequences

- **즉시 영향**:
  - `profile.json.template` 에 `_note` 또는 `_help` 필드 추가 (JSON 파싱 시 무시됨 — `_` prefix 관행)
  - 문서 [`docs/20-user-guide/02-configuration.md`](../../20-user-guide/02-configuration.md) 에서 plan/copy 활성화 가이드 교차 참조
- **후속**:
  - D-03 과 독립 — settings.json.template 결정과 무관
  - 하위 호환 100% 유지 (기존 사용자 영향 없음)

### 대안 선택 시 영향

- **옵션 A 선택 시**: T-TMPL-06 은 "no-op" (변경 없음) + 문서만 보강
- **옵션 B 선택 시**: profile.json.template 변경 + v2.5.0 Breaking Change 선언 (BC-TMPL-04 추가) + 마이그레이션 가이드 필요

---

## D-02 — plan-epic 템플릿 단/복수 통일 여부

**Status**: ✅ **승인 완료 (2026-04-23)** — 옵션 B (의미 우선, 현행 유지) 확정 → T-TMPL-11 no-op, BC-TMPL-03 제거
**관련 이슈**: M5
**관련 TASK**: T-TMPL-11

### Context

`src/claude/plan/skills/plan-epic-workflow/templates/` 5 개 파일의 네이밍이 단/복수 혼재:

- 단수: `epic-brief.md`, `epic-binding.md`, `phase-roadmap.md`
- 복수: `children-features.md`, `implementation-hints.md`

네이밍 컨벤션 일관성 관점에서 통일 권장.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **단수 통일** — `children-feature.md`, `implementation-hint.md` | 영문 기술 문서 관행 (예: `README.md`, `LICENSE.md`). | 복수 의미 손실 (여러 Feature 를 담는 파일인데 단수). |
| B | **복수 유지 + 의미 우선** — 단수 파일 내용이 단일 항목이면 단수, 여러 항목이면 복수 | 의미와 네이밍 일치. | 판단 기준 추가 필요. `epic-brief.md` 는 단수 유지, `children-features.md` 는 복수 유지. |
| C | **현행 유지** — 변경 없음 | 변경 비용 0. | 일관성 이슈 지속. |

### Decision

**옵션 B — 의미 우선 (현재 상태 정당화)** 를 제안 (사용자 최종 결정 대기)

### Rationale

- **옵션 B 장점**:
  - `epic-brief.md` = Epic **한 건** 의 개요 → 단수 타당.
  - `children-features.md` = 자식 Feature **여러 건** 목록 → 복수 타당.
  - `epic-binding.md` = 바인딩 **한 건** (Feature ↔ Epic 1:1) → 단수 타당.
  - `phase-roadmap.md` = 로드맵 **한 건** (여러 Phase 를 담지만 단일 문서) → 단수 타당.
  - `implementation-hints.md` = 힌트 **여러 개** → 복수 타당.
- **결론**: 현재 네이밍이 의미 기준으로 이미 일관. M5 는 "겉보기 불일치" 였으나 실제로는 내부 논리가 있음.
- 따라서 **템플릿 리네이밍 불필요**. 대신 `template-governance.md` (T-TMPL-01) 에 "파일명은 내용 스코프의 단/복수를 반영" 원칙 명문화.

### Consequences

- **즉시 영향**:
  - T-TMPL-11 은 "no-op" (파일 변경 없음) + `template-governance.md` 에 원칙 추가
  - BC-TMPL-03 제거 가능
- **후속**:
  - 신규 plan-epic 템플릿 추가 시 의미 기준 단/복수 판단
- **리스크**: 낮음 — 변경 없음

### 대안 선택 시 영향

- **옵션 A 선택 시**: `children-features.md` → `children-feature.md`, `implementation-hints.md` → `implementation-hint.md` 리네이밍. `plan-epic-workflow/SKILL.md` 와 `/plan-epic` 커맨드 소비 경로 업데이트. BC-TMPL-03 유지.

---

## D-03 — `settings.json.template` 처리 방식

**Status**: ✅ **승인 완료 (2026-04-23)** — 옵션 B (유지 + drift 테스트) 확정
**관련 이슈**: M3
**관련 TASK**: T-TMPL-09

### Context

[`src/templates/settings.json.template:2`](../../../src/templates/settings.json.template) 는 `_note` 로 "참조용" 이라고 명시. 실제 `settings.json` 은 [`scripts/setup.js`](../../../scripts/setup.js) 의 `buildSettingsTemplate()` 이 동적 생성. 현재 template 은 **consumer 없음** — 참조 문서 역할만.

하지만 `buildSettingsTemplate()` 로직 변경 시 template 업데이트 의무 없어 drift 위험.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **삭제** — template 파일 제거 | 혼란 제거 (참조용 파일 없음). buildSettingsTemplate() 가 단일 SSOT. | 사용자가 "기본 settings 어떤 구조인지?" 빠르게 확인 불가. |
| B | **유지 + drift 테스트** — template 과 buildSettingsTemplate() 출력 비교 단위 테스트 | 문서 가치 유지 + 자동 drift 차단. | 테스트 추가 비용. |
| C | **유지 + 생성 스크립트** — `scripts/generate-settings-template.js` 가 buildSettingsTemplate() 호출 후 template 파일 재생성 | Always in sync. | CI 단계 추가 필요. |

### Decision

**옵션 B — 유지 + drift 테스트** 를 제안 (사용자 최종 결정 대기)

### Rationale

- **옵션 A 문제**: 사용자가 setup.js 소스를 읽어야 settings 기본 구조 파악. 문서 가치 손실.
- **옵션 B 장점**:
  - 참조 문서로 유지 (UX 유지).
  - 테스트 1 건 (vitest) 으로 drift 자동 차단.
  - TDD 원칙 부합 (원칙 #3).
- **옵션 C 과잉**: 수동 편집 가치 없음 (자동 생성은 결국 setup.js 가 단일 SSOT).

### Consequences

- **즉시 영향**:
  - `tests/settings-template-drift.test.js` (신규) 추가
  - T-TMPL-09 예상 공수 0.3 인·일
- **후속**:
  - `buildSettingsTemplate()` 변경 시 template 업데이트 강제
  - CI 통과 조건에 추가

### 대안 선택 시 영향

- **옵션 A 선택 시**: `settings.json.template` 삭제 + 관련 문서 참조 제거
- **옵션 C 선택 시**: 생성 스크립트 + CI 통합 (0.8 인·일)

---

## D-04 — 템플릿 SSOT Location 전략 (3 Location 유지)

**Status**: ✅ **결정 완료 (계획 수립 과정에서)**
**관련 이슈**: C1
**관련 TASK**: T-TMPL-01

### Context

현재 3 Location (A: `src/templates/`, B: `plan-epic-workflow/templates/`, C: `kit-scaffolding/references/`) 으로 분산. 통합할지, 분리 유지할지 결정 필요.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **3 Location 유지 + SSOT 룰 명문화** | 각 Location 의 목적·소비자가 다름 (installer vs plan-epic vs kit-create). 통합 시 import 체인 복잡. | 사용자가 3 곳 추적 필요. |
| B | **1 Location 통합** — `src/templates/` 루트에 모든 40 파일 | 단일 위치. | kit-scaffolding 과 plan-epic 는 skill 내부 자산이라 skill 분리 원칙 위반. |
| C | **도메인별 분산** — 각 도메인 내부에 domain-templates/ | 도메인 응집도 증가. | dev 도메인이 없는 프로젝트도 템플릿 참조 필요 시 문제. |

### Decision

**옵션 A — 3 Location 유지 + SSOT 룰 명문화**

### Rationale

- 각 Location 의 **소비자가 근본적으로 다름**:
  - A: `scripts/setup.js` (installer, postinstall 시점)
  - B: `/plan-epic` 커맨드 (Epic 계층 운영, 런타임)
  - C: `/kit-create` 커맨드 (컴포넌트 스캐폴딩, 런타임)
- **Skill 응집 원칙**: kit-scaffolding skill 은 자신의 템플릿을 내부에 보유하는 게 자연스러움 (`.claude/skills/kit-scaffolding/references/`).
- plan-epic-workflow 도 동일 — skill 내부 `templates/` 가 자연스러움.
- **통합의 비용이 분산의 비용보다 큼** → 룰로 명문화하는 쪽이 합리적.

### Consequences

- T-TMPL-01 이 `template-governance.md` SSOT 룰 신설 — 3 Location 관계·추가 절차 명시
- 유지 비용 지속 (신규 템플릿 추가 시 올바른 Location 선택 필요)
- 룰이 제대로 관리되면 혼란 최소화 가능

---

## D-05 — AGENTS.md rule 참조 방식 (inline → 링크 전환)

**Status**: ✅ **결정 완료 (계획 수립 과정에서)**
**관련 이슈**: H2
**관련 TASK**: T-TMPL-03

### Context

`AGENTS.md.template` 의 핵심 섹션 (운영 원칙/검증/보안/코드 품질) 이 core rule 과 내용 중복. `golden-principles.md §13 Document Non-Duplication` 위반.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **rule 내용 inline 유지** — 현행 | AGENTS.md 단독으로 완결. | Drift 위험. §13 위반. |
| B | **참조 링크로 치환** — "자세한 내용은 `src/claude/core/rules/golden-principles.md` 참조" | SSOT 원칙 준수. | Codex runtime 에서 src/ 경로 금지 패턴 (`AGENTS_MD_RUNTIME_FORBIDDEN`) 과 충돌 위험. |
| C | **docs 공개 경로로 링크** — `docs/30-reference/{rule}.md` | SSOT + Codex runtime 금지 패턴 회피. | docs 재구조화 필요 (rule 을 docs 로 export). |
| D | **요약본 inline + 상세 링크** | 단독 가독성 + SSOT 링크 | 요약본도 drift 위험 (덜하지만). |

### Decision

**옵션 D — 요약본 inline + 상세 링크** (수정된 옵션 B)

### Rationale

- **옵션 A 문제**: H2 자체.
- **옵션 B 문제**: `src/claude/...` 경로는 AGENTS.md runtime 금지 패턴 (L2 참조) — 런타임에서 해석 불가 + `setup.js` `AGENTS_MD_RUNTIME_FORBIDDEN` 린트 실패.
- **옵션 C 비용**: rule 을 docs 로 export 는 별도 프로젝트. 본 계획 범위 초과.
- **옵션 D 절충**:
  - AGENTS.md 에 **2~3 줄 핵심 요약** 유지 (Codex 사용자 즉시 이해).
  - 상세는 "프로젝트 내부 `.claude/rules/` 참조" 로 안내 (상대 경로 아닌 일반 안내).
  - Jaccard 유사도 < 0.3 목표 (요약은 키워드만, 문장 구조 재작성).

### Consequences

- T-TMPL-03 구현 시 `AGENTS_MD_RUNTIME_FORBIDDEN` 확인 + 요약본 작성
- 요약 기준 명문화: "3 줄 이하 핵심 규칙 + 상세는 프로젝트 rule 참조"
- L2 (AGENTS.md runtime lint) 강화로 재발 방지 (T-TMPL-15)

---

## D-06 — Breaking Change 번들링 전략

**Status**: ✅ **결정 완료 (계획 수립 과정에서)**
**관련 이슈**: 전체
**관련 TASK**: T-TMPL-02, T-TMPL-07, T-TMPL-11

### Context

본 개선 계획은 Breaking Change 2~3 건 (BC-TMPL-01, BC-TMPL-02, 조건부 BC-TMPL-03) 포함. 번들링 vs 점진적 배포 결정 필요.

### Options

| # | 옵션 | 장점 | 단점 |
|---|---|---|---|
| A | **v2.5.0 일괄 번들** — 모든 BC 한 번에 | 마이그레이션 한 번에. CHANGELOG 단일 엔트리. | 다운스트림 영향 큼 (한 번에 여러 변경). |
| B | **점진적** — BC 별로 minor version 분리 (v2.5.0, v2.6.0, v2.7.0) | 영향 분산. 각 BC 검증 시간 확보. | 릴리스 주기 3 배. |
| C | **한 minor version + deprecation 기간** — v2.5.0 에 번들 + 2 minor 후 v2.7.0 에서 strict | 번들 효율 + 점진 전환 창구. | 구현 복잡 (Fallback 경로 유지). |

### Decision

**옵션 C — v2.5.0 번들 + deprecation 기간**

### Rationale

- **옵션 A 문제**: 본 계획의 BC 는 모두 **내부 template 구조 변경** — 외부 소비자 없음. 그러나 하위 프로젝트 스크립트가 경로 하드코딩했을 수 있음.
- **옵션 B 과잉**: 릴리스 주기 낭비.
- **옵션 C 장점**:
  - v2.5.0 에서 BC 도입 (template 구조 전환)
  - v2.7.0 까지 구 구조 참조 시 **경고 로그** 출력 (deprecation)
  - v2.7.0 에서 strict 모드로 전환 (구 구조 제거)
- 사용자가 경고를 보고 전환할 수 있는 시간 확보.

### Consequences

- **즉시 영향**:
  - v2.5.0 릴리스 노트에 "BC-TMPL-01~03 도입 + v2.7.0 deprecation" 명시
  - setup.js 에 deprecation 경고 로직 추가 (스코프 작음)
- **마이그레이션 가이드**: `docs/30-reference/07-migration-guide.md` (또는 기존 migration 문서) 업데이트
- **CHANGELOG.md**: v2.5.0 엔트리에 BC 통합 설명

---

## 사용자 결정 필요 항목 요약

| ID | 항목 | 확정안 | 상태 |
|:---:|---|:---:|:---:|
| **D-01** | profile.json.template 기본 도메인 | **옵션 C (주석 보강)** | ✅ 승인 (2026-04-23) |
| **D-02** | plan-epic 템플릿 단/복수 | **옵션 B (의미 우선, 현행 유지)** | ✅ 승인 (2026-04-23) |
| **D-03** | settings.json.template | **옵션 B (유지 + drift 테스트)** | ✅ 승인 (2026-04-23) |
| D-04 | SSOT Location 전략 | 3 Location 유지 | ✅ 자동 |
| D-05 | AGENTS.md rule 참조 방식 | 요약본 + 링크 | ✅ 자동 |
| D-06 | BC 번들링 전략 | v2.5.0 + deprecation | ✅ 자동 |

---

## 승인 절차 (Checkpoint)

- **type**: `review-approval` (Critical 화이트리스트 아님 — [`checkpoint-policy.md §1`](../../../src/claude/core/rules/checkpoint-policy.md))
- **autoProceedOnPass**: 적용 가능 (PASS 시 자동 진행 — 글로벌 설정 확인 필요)
- **사용자 응답 옵션** ([`checkpoint-policy.md §8-1`](../../../src/claude/core/rules/checkpoint-policy.md)):
  - **Y** — D-01/D-02/D-03 기본 제안 승인 → Phase A 진입
  - **수정** — 세부 결정 변경 요청 (예: "D-01 은 옵션 A 로, D-03 은 옵션 C 로")
  - **N** — 계획 전면 재검토 (재작업 불가 이유 명시)

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — 6 개 결정 항목 (D-01~D-06) 정리. D-01/D-02/D-03 사용자 승인 대기. | Claude (메인테이너 역할) |
| 2026-04-23 | D-01/D-02/D-03 사용자 승인 완료 (기본 제안 그대로). Status 갱신. BC-TMPL-03 제거 확정 (D-02 옵션 B). | Claude (메인테이너 역할) |
