# 02. 개선 계획서 — claude-kit 템플릿 전면 개선

> **작성일**: 2026-04-23 (초안) / **갱신**: 2026-04-24 (Phase A 9 TASK 완료 반영)
> **작성자**: Claude (claude-kit 메인테이너 역할)
> **Status**: **In Progress** — D-01/02/03 승인 완료 (2026-04-23), 9/17 TASK 완료
> **선행 문서**: [01-current-state.md](./01-current-state.md) — 17 이슈 근거
> **연계 문서**: [03-decision-log.md](./03-decision-log.md) — 주요 결정 사항

---

## 0. 결론

17 개 이슈를 **17 TASK (T-TMPL-01 ~ T-TMPL-17)** 로 분해하고, **3 Phase (A/B/C)** 로 순차 실행한다. Phase A 는 Critical + High 5 건 (SSOT 룰 신설 + 구조 통합). Phase B 는 Medium 7 건 (네이밍·링크·enum). Phase C 는 Low 4 건 + H3 결정 반영.

Breaking Change **최대 3 건** 예상 (BC-TMPL-01~03). 모두 deprecation 기간 2 minor version 제공.

> **2026-04-24 업데이트**: BC-TMPL-03 **제거 확정** (D-02 옵션 B 선택으로 리네이밍 no-op). 실제 BC 2건으로 축소.

---

## 0.5. 진행 현황 (2026-04-24)

### 0.5-1. 완료 TASK (9 건)

| TASK | Commit | 핵심 변경 |
|------|:---:|---|
| T-TMPL-01 | [`8cfc9ba`](../../../src/claude/core/rules/template-governance.md) | `template-governance.md` 신설 (3 Location SSOT + 결정 트리) |
| T-TMPL-03 | [`6c81a35`](../../../src/templates/AGENTS.md.template) | AGENTS.md.template 91→80줄, 4 rule 링크 치환 |
| T-TMPL-04 | `8cfc9ba` | 네이밍 컨벤션 → `template-governance §3` 통합 |
| T-TMPL-05 | [`7058eb9`](../../../src/claude/plan/skills/plan-epic-workflow/templates/) | `.template.md` (본문) + `.md` (사용법) 2쌍 분리 |
| T-TMPL-08 | [`daffea4`](../../../src/templates/quickstart/blocks/10-repo-appendix.md) | `10-repo-appendix.md` 링크 7건 실제 docs 구조 반영 |
| T-TMPL-10 | `daffea4` | Epic/Feature 상태 enum 하드코딩 3곳 → SSOT 링크 |
| T-TMPL-11 | (D-02 no-op) | 의미 우선 원칙으로 현행 유지 — BC-TMPL-03 제거 |
| T-TMPL-13 | `daffea4` | `# Current Date` + merger 정규식 alternation 확장 |
| T-TMPL-14 | `8cfc9ba` | 확장자 표준 → `template-governance §3-4` 통합 |
| T-TMPL-17 | `8cfc9ba` | 변경 이력 3 컬럼 형식 → `template-governance §7` 통합 |

### 0.5-2. 미완료 TASK (7 건) — 권장 처리 순서

| 순서 | TASK | 규모 | 비고 |
|:---:|------|:---:|------|
| 1 | **T-TMPL-02** (AGENTS.md 블록 구조 전환) | 1.5 인·일 | Phase A 마지막. setup.js + agents-md-merger/renderer 신설 + TDD. **별도 세션 권장** |
| 2 | T-TMPL-15 (AGENTS 금지 패턴 lint 강화) | 0.3 인·일 | T-02 후. `AGENTS_MD_RUNTIME_FORBIDDEN` constants 분리 |
| 3 | T-TMPL-07 (quickstart 05b 순차화) | 0.3 인·일 | BC-TMPL-02 동반 |
| 4 | T-TMPL-06 (profile.json `_note` 보강) | 0.2 인·일 | D-01 반영 |
| 5 | T-TMPL-09 (settings.json drift 테스트) | 0.3 인·일 | D-03 반영. vitest 테스트 신설 |
| 6 | T-TMPL-12 (kit-scaffolding TODO 보강) | 0.5 인·일 | `/kit-validate` TODO 감지 룰 추가 |
| 7 | T-TMPL-16 (변수 치환 공통 유틸) | 0.8 인·일 | `substituteVars` 추출 + TDD |

### 0.5-3. 목표 지표 달성률 중간 집계

| 지표 | Before | 현재 | 목표 | 달성 |
|------|:---:|:---:|:---:|:---:|
| SSOT 룰 문서 | 0 | **1** | 1 | ✅ |
| AGENTS.md.template 분량 | 91 | 80 | ≤ 40 | 🟡 (T-02 필요) |
| rule 중복 (AGENTS↔rule) 줄 수 | ~40 | **~3** | 0 | 🟢 |
| 7 축 평균 | 4.30 | (미재측정) | ≥ 4.60 | ⏳ |
| Score < 3 셀 수 | 12 | (미재측정) | ≤ 3 | ⏳ |
| 네이밍 컨벤션 수 | 4 | **2** (SSOT 정의) | ≤ 2 | ✅ |
| 하드코딩 링크 stale | 5 | **0** | 0 | ✅ |

---

## 1. 목표 지표 (Success Metrics)

### 1.1 정량 지표

| 지표 | Before (2026-04-23) | After (목표) | 측정 방법 |
|------|:---:|:---:|---|
| **SSOT 룰 문서** | 0 건 | **1 건** | `src/claude/core/rules/template-governance.md` 존재 |
| **AGENTS.md.template 분량** | 91 줄 | **≤ 40 줄** | `wc -l` — 중복 내용 rule 참조로 대체 |
| **rule 중복 줄 수 (AGENTS ↔ rule)** | ~40 줄 | **0 줄** | Grep 8-gram Jaccard 유사도 < 0.3 |
| **7 축 평균 점수** | 4.30 / 5.00 | **≥ 4.60** | `01-current-state.md §3` 기준 재측정 |
| **Score <3 셀 수** | 12 개 | **≤ 3 개** | 점수 재집계 |
| **템플릿 네이밍 컨벤션 수** | 4 종 혼재 | **2 종 이하** | SSOT 룰에 명시 + 실제 파일 일치 |
| **하드코딩 링크 (stale)** | `10-repo-appendix.md` 5 건 | **0 건** | Link checker 실행 |

### 1.2 정성 지표

- ✅ 신규 템플릿 추가 시 "어느 Location 에 둘지" 판단 절차 명확
- ✅ AGENTS.md 업데이트 시 rule SSOT 만 수정하면 자동 반영 (drift 차단)
- ✅ `phase-roadmap.md` 템플릿 + 사용법 분리 → 자동 치환 가능
- ✅ `/kit-validate` 가 TODO 잔존을 경고

---

## 2. TASK 분해 (17 TASK)

> TASK ID 규칙: **[IMP-KIT-015 §1](../../../src/claude/core/rules/task-id-naming.md)** 준수 — `T-TMPL-{NN}` (dev 도메인 패턴, AREA=TMPL).

### 2.1 Phase A — Critical + High (5 TASK)

#### **T-TMPL-01** — 템플릿 소유권 SSOT 룰 신설

- **대응 이슈**: C1
- **범위**:
  - `src/claude/core/rules/template-governance.md` (신규) 작성
  - 3 Location (A/B/C) 의 관계·소유권·추가 절차 명문화
  - 신규 템플릿 추가 시 "어느 Location 에 둘지" 판단 로직
  - `golden-principles.md §13` Non-Duplication 과 교차 참조
- **수용 기준 (AC)**:
  - [ ] `template-governance.md` 파일 존재 (< 200 줄)
  - [ ] 3 Location 각각의 책임·소비자·네이밍 명시
  - [ ] "새 템플릿 추가 결정 트리" 섹션 포함
  - [ ] [`02-adding-a-component.md`](../../40-contributing/02-adding-a-component.md), [`03-domain-authoring.md`](../../40-contributing/03-domain-authoring.md) 에서 역참조
- **의존성**: 없음 (최우선)
- **예상 공수**: 0.5 인·일
- **우선순위**: **P0** (Phase A 첫 번째)
- **검증 방법**:
  - `/kit-validate` 실행 (rule 스키마 준수)
  - 룰 본문 수동 검토 (SSOT 기준 명확성)
- **미적용 시 손실**: 신규 템플릿 폭증 시 혼란 확산. 이후 TASK 모두 "어느 Location 을 기준으로 할지" 근거 부재.

---

#### **T-TMPL-02** — AGENTS.md.template 구조 통합 (블록 병합 방식 전환)

- **대응 이슈**: H1
- **범위**:
  - `src/templates/AGENTS.md.template` 재설계
  - CLAUDE.md 와 동일하게 `<!-- kit:managed:start -->` / `<!-- kit:managed:end -->` 마커 도입
  - 기존 91 줄 → managed 섹션 분리 + 보존 가능한 header/footer 유지
  - `src/templates/agents-md/` 블록 디렉터리 신설 (preamble + 도메인별 + currentdate)
  - `scripts/setup.js` AGENTS.md 처리 로직 변경 (전체 복사 → merger 방식)
  - `agents-md-merger.js` + `agents-md-renderer.js` 추가 (claude-md 변형 재사용 고려)
- **AC**:
  - [ ] AGENTS.md.template ≤ 30 줄 (marker 기반 wrapper)
  - [ ] `src/templates/agents-md/{preamble,domain,currentdate}.md` 블록 존재
  - [ ] fresh install + 업데이트 양쪽 동작 (기존 AGENTS.md 보존)
  - [ ] setup.js T18 dry-run 회귀 테스트 PASS
- **의존성**: T-TMPL-01 (SSOT 룰 우선), T-TMPL-03 (중복 제거와 병합 진행)
- **예상 공수**: 1.5 인·일
- **우선순위**: **P0** (Phase A 핵심)
- **검증 방법**:
  - 기존 AGENTS.md 보존 시나리오 수동 테스트
  - fresh install 시나리오 수동 테스트
  - `setup.js --dry-run` 출력 diff 확인
- **미적용 시 손실**: Codex target 사용자가 업데이트 때마다 전체 교체 겪음 + Claude 사용자와 경험 비대칭 지속.
- **Breaking Change**: **BC-TMPL-01** — 기존 AGENTS.md 구조 소비자 없음 (installer 만) → 실질적 영향 없지만 template 파일 구조 변경.

---

#### **T-TMPL-03** — AGENTS.md ↔ rule 중복 제거

- **대응 이슈**: H2
- **범위**:
  - AGENTS.md.template (또는 T-TMPL-02 후 블록) 에서 다음 섹션을 **rule 참조 링크** 로 치환:
    - "핵심 운영 원칙" → `golden-principles.md` #1, #3, #6, #10 참조
    - "검증 기준" → `verification.md` Iron Law 참조
    - "보안 기준" → `security.md` Mandatory Checks 참조
    - "코드 품질 기준" → `coding-style.md` Checklist 참조
  - AGENTS.md 는 **항목 나열** 이 아닌 **"어느 rule 을 읽으라"** 는 지표 역할
  - `no-duplication-guard.js` hook (optional) 으로 향후 재발 방지
- **AC**:
  - [ ] AGENTS.md.template 핵심 4 섹션 → 참조 링크 변경 (< 10 줄 per 섹션)
  - [ ] 8-gram Jaccard 유사도 (AGENTS.md vs rule) < 0.3
  - [ ] Codex target 소비자 관점에서 rule 파일 접근 가능 여부 확인 (AGENTS.md runtime 금지 패턴 충돌 없는지)
- **의존성**: T-TMPL-02 (구조 통합 후 진행 권장)
- **예상 공수**: 1.0 인·일
- **우선순위**: **P1**
- **검증 방법**:
  - 8-gram Jaccard 측정 스크립트 실행
  - Codex runtime 에서 rule 경로 해석 가능한지 AGENTS.md runtime 금지 패턴 (`AGENTS_MD_RUNTIME_FORBIDDEN`) 재확인
- **미적용 시 손실**: rule 업데이트 시 AGENTS.md drift. `golden-principles.md §13` 위반 상태 지속.

---

#### **T-TMPL-04** — 템플릿 네이밍 컨벤션 통일

- **대응 이슈**: H4
- **범위**:
  - `template-governance.md` 에 컨벤션 명문화 (T-TMPL-01 와 병합 검토):
    - Location A 루트: `{type}.md.template` (확장자 `.template`)
    - Location A 블록: `{NN}-{name}.md` (순차 번호)
    - Location B: `{category}-{aspect}.md` (단수·일관된 의미)
    - Location C: `template-{type}-{variant}.md` (prefix)
  - 파일 리네이밍은 **최소화** (BC 부담 고려):
    - M1 (05b-copy-flow.md) 는 별도 T-TMPL-07 에서 처리
    - plan-epic 단/복수는 T-TMPL-11
  - 본 TASK 는 **문서화 + 향후 추가 시 준수** 가 목표
- **AC**:
  - [ ] `template-governance.md` §네이밍 섹션 완비
  - [ ] 각 Location 기존 파일이 컨벤션 일치/예외 여부 전수 표
- **의존성**: T-TMPL-01 (통합 가능)
- **예상 공수**: 0.3 인·일 (T-TMPL-01 와 병합 시 추가 부담 적음)
- **우선순위**: **P1**
- **검증 방법**: 룰 본문 수동 검토.
- **미적용 시 손실**: 신규 템플릿 추가 시 컨벤션 혼란 재발.

---

#### **T-TMPL-05** — 메타 템플릿 분리 (`phase-roadmap.md` / `implementation-hints.md`)

- **대응 이슈**: H5
- **범위**:
  - `src/claude/plan/skills/plan-epic-workflow/templates/phase-roadmap.md` 분할:
    - `phase-roadmap.template.md` — **순수 템플릿 본문만** (현재 :24-90 codeblock 내용)
    - `phase-roadmap.md` (기존 파일 유지) — **사용법 문서** (변수 치환 규칙 + 안전 검증 + 구현 체크리스트)
  - 같은 방식으로 `implementation-hints.md` 분할:
    - `implementation-hints.template.md`
    - `implementation-hints.md`
  - 다른 3개 템플릿 (epic-brief, children-features, epic-binding) 은 **순수 템플릿이므로 변경 없음**
  - `/plan-epic phase generate` 서브커맨드 (T-TMPL-01 후 별도 세션) 가 `.template.md` 만 참조하도록 준비
- **AC**:
  - [ ] 2 개 `.template.md` 파일 신설 (순수 본문)
  - [ ] 기존 `.md` 파일은 설명 문서로 유지 (템플릿 본문 codeblock 제거)
  - [ ] `skills/plan-epic-workflow/SKILL.md` 에서 `.template.md` 참조로 경로 업데이트
- **의존성**: T-TMPL-01 (템플릿 확장자 규칙 확정 필요)
- **예상 공수**: 0.5 인·일
- **우선순위**: **P1**
- **검증 방법**:
  - 파일 존재 + 구조 확인
  - `/plan-epic phase generate` dry-run (구현 시)
- **미적용 시 손실**: `/plan-epic phase generate` 구현 시 파일 파싱 복잡도 증가. 사용자가 실제 템플릿 부분 오독 위험.

---

### 2.2 Phase B — Medium 일부 (독립 TASK 5건)

#### **T-TMPL-07** — `05b-copy-flow.md` 순차화

- **대응 이슈**: M1
- **범위**:
  - [`src/templates/quickstart/blocks/05b-copy-flow.md`](../../../src/templates/quickstart/blocks/05b-copy-flow.md) → `06-copy-flow.md` 리네이밍
  - 기존 `06-target-diff.md` → `07-target-diff.md`
  - 기존 `07-first-actions.md` → `08-first-actions.md`
  - 기존 `08-reconfig.md` → `09-reconfig.md`
  - 기존 `09-mini-glossary.md` → `10-mini-glossary.md`
  - 기존 `10-repo-appendix.md` → `11-repo-appendix.md` (변경)
  - [`scripts/quickstart-renderer.js:10-21`](../../../scripts/quickstart-renderer.js) `CORE_BLOCKS` 배열 업데이트
  - `git mv` 사용 (이력 보존)
- **AC**:
  - [ ] 모든 블록 파일 순차 `NN-*.md` (N = 2 자리 숫자, N+1 증가)
  - [ ] renderer 실행 시 기존 출력과 동일 (순서 보존)
  - [ ] `pnpm check:docs` PASS
- **의존성**: T-TMPL-04 (네이밍 컨벤션 확정 후)
- **예상 공수**: 0.3 인·일
- **우선순위**: **P2**
- **Breaking Change**: **BC-TMPL-02** — quickstart block 파일명 변경. 외부 consumer 없으므로 영향 낮음 (installer 만 사용).

---

#### **T-TMPL-08** — `10-repo-appendix.md` 링크 갱신

- **대응 이슈**: M2
- **범위**:
  - [`src/templates/quickstart/blocks/10-repo-appendix.md:5-9`](../../../src/templates/quickstart/blocks/10-repo-appendix.md) 링크 업데이트:
    - `./00-overview.md` → `../../../docs/00-overview/01-what-is-claude-kit.md`
    - `./01-planning-pipeline.md` → `../../../docs/10-features/...` (실제 매핑 확인 필요)
    - `./08-dev-workflow.md` → `../../../docs/10-features/02-dev-domain.md`
    - `./09-architecture.md` → 실제 경로 확인
    - `./10-glossary.md` → `../../../docs/20-user-guide/08-glossary.md`
  - 링크 깨짐 자동 검증 스크립트 추가 (`scripts/verify-links.js`, 신규)
- **AC**:
  - [ ] 모든 링크가 실제 파일 가리킴
  - [ ] `verify-links.js` PASS
- **의존성**: T-TMPL-07 (블록 리네이밍 후 — `11-repo-appendix.md`)
- **예상 공수**: 0.4 인·일
- **우선순위**: **P2**
- **검증 방법**: Link checker 스크립트 실행.

---

#### **T-TMPL-10** — Epic 상태 enum SSOT 참조

- **대응 이슈**: M4
- **범위**:
  - [`src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md:4`](../../../src/claude/plan/skills/plan-epic-workflow/templates/epic-brief.md) `draft | planning | active | completed | archived` 하드코딩 제거
  - 대신: `> **상태**: (SSOT: [plan-epic-hierarchy.md §4](../../../rules/plan-epic-hierarchy.md))`
  - 사용자는 SSOT 를 읽고 하나 선택
  - 다른 템플릿 (children-features.md, epic-binding.md) 의 상태 enum 도 동일하게 SSOT 참조로 전환
- **AC**:
  - [ ] 3 개 템플릿에서 상태 enum 하드코딩 제거
  - [ ] SSOT 링크로 대체
  - [ ] 사용 시 SSOT 참조 후 값 선택 흐름 명확
- **의존성**: 없음 (독립)
- **예상 공수**: 0.2 인·일
- **우선순위**: **P2**
- **검증 방법**: Grep 으로 하드코딩 잔존 확인.

---

#### **T-TMPL-11** — plan-epic 템플릿 파일명 단/복수 통일

- **대응 이슈**: M5
- **범위**:
  - 결정 필요 (→ `03-decision-log.md` D-02): 단수 통일 vs 복수 통일
  - 본 계획안 기본 제안: **단수 통일** (영문 기술 문서 관행)
  - 변경 대상: `children-features.md` → `children-feature.md`? 또는 `children.md`?
  - 또는: **의미 기준** — 여러 Feature 를 담으므로 복수 유지 (현재 상태)
  - 결정 후 필요 시 `git mv` + 경로 업데이트
- **AC**:
  - [ ] `03-decision-log.md D-02` 에 결정 반영
  - [ ] 결정에 따라 파일명 일관성 확보
- **의존성**: D-02 결정
- **예상 공수**: 0.2 인·일 (결정 따라 변경 없을 수도)
- **우선순위**: **P3** (영향 범위 작음)

---

#### **T-TMPL-13** — currentdate 파일명 ↔ 섹션 제목 일치

- **대응 이슈**: M7
- **범위**:
  - [`src/templates/claude-md/90-currentdate.md`](../../../src/templates/claude-md/90-currentdate.md) 파일명 유지 (kebab-case 표준)
  - 내부 섹션 제목 `# currentDate` → `# Current Date` (제목 대소문자 정상화)
  - 또는 `# current-date` (파일명 반영)
  - [`scripts/claude-md-merger.js:53`](../../../scripts/claude-md-merger.js) `stripLegacyCurrentDate` 정규식 업데이트 (기존 `currentDate` 패턴 호환 유지)
- **AC**:
  - [ ] 섹션 제목 일관성 (kebab 또는 Title Case 중 1)
  - [ ] legacy `# currentDate` 제거 로직 동작 유지
- **의존성**: 없음
- **예상 공수**: 0.1 인·일
- **우선순위**: **P3**

---

### 2.3 Phase C — Medium 나머지 + H3 결정 + Low (7 TASK)

#### **T-TMPL-06** — `profile.json.template` 기본 도메인 결정 반영

- **대응 이슈**: H3
- **범위**:
  - 결정 필요 (→ `03-decision-log.md D-01`): `core, dev` 기본값 유지 vs `core, dev, plan` 확장
  - 본 계획안 기본 제안: **현행 유지 (`core, dev`)** + 이유: v2.4.0 Opt-in 원칙 준수
  - 단, 대안: profile.json.template 상단 주석으로 "plan/copy 도메인 추가 방법" 안내
- **AC**:
  - [ ] `03-decision-log.md D-01` 에 결정 반영
  - [ ] profile.json.template 주석 (또는 기본값) 업데이트
- **의존성**: D-01 결정 (사용자 승인 필수)
- **예상 공수**: 0.2 인·일 (결정에 따라 변동)
- **우선순위**: **P1** (High 지만 결정 의존)
- **검증 방법**: fresh install 시나리오에서 profile.json 확인.

---

#### **T-TMPL-09** — `settings.json.template` 처리 결정

- **대응 이슈**: M3
- **범위**:
  - 결정 필요 (→ `03-decision-log.md D-03`): 제거 vs 유지 + 동기 테스트
  - 옵션 A: `settings.json.template` 삭제 (참조용 문서로 대체)
  - 옵션 B: 유지 + `setup.js buildSettingsTemplate()` 산출물과 drift 확인 테스트 추가
  - 본 계획안 기본 제안: **옵션 B** (최소 변경)
- **AC**:
  - [ ] D-03 결정 반영
  - [ ] 선택에 따라 구현
- **의존성**: D-03
- **예상 공수**: 0.3 인·일 (옵션 B 시) 또는 0.1 인·일 (옵션 A 시)
- **우선순위**: **P2**

---

#### **T-TMPL-12** — kit-scaffolding 템플릿 본문 보강

- **대응 이슈**: M6
- **범위**:
  - [`.claude/skills/kit-scaffolding/references/template-command-simple.md`](../../../.claude/skills/kit-scaffolding/references/template-command-simple.md) 및 `template-skill.md` 등:
    - TODO 라벨 → `## TODO (작성 전 삭제 필수)` 형태로 명확화
    - 실제 예시 1~2 줄 추가 (주석 처리된 샘플)
  - `/kit-validate` 룰에 "TODO 잔존 검사" 추가 (스키마 레벨):
    - [`.claude/skills/kit-validation/references/schema-command.md`](../../../.claude/skills/kit-validation/references/schema-command.md) 에 rule 추가
- **AC**:
  - [ ] 12 개 템플릿 모두 TODO 비율 < 20%
  - [ ] `/kit-validate` 가 TODO 잔존 감지 (warning 레벨)
- **의존성**: T-TMPL-01 (네이밍 컨벤션 확정 후)
- **예상 공수**: 0.5 인·일
- **우선순위**: **P2**

---

#### **T-TMPL-14** — 파일 확장자 표준 문서화

- **대응 이슈**: L1
- **범위**:
  - `template-governance.md` 에 확장자 규칙 명시:
    - 루트 래퍼: `.template` (installer 인식 표시)
    - 블록·템플릿 본문: `.md` (Markdown 편집기 호환)
    - 변수 치환 대상: `.template.md` (본 계획에서 Phase A T-TMPL-05 도입)
  - Glob 패턴 권장 표 추가
- **AC**: 룰 본문 포함.
- **의존성**: T-TMPL-01
- **예상 공수**: 0.1 인·일 (T-TMPL-01 병합)
- **우선순위**: **P3**

---

#### **T-TMPL-15** — AGENTS.md.template 금지 패턴 lint 강화

- **대응 이슈**: L2
- **범위**:
  - [`scripts/setup.js:43-56`](../../../scripts/setup.js) `AGENTS_MD_RUNTIME_FORBIDDEN` 배열을 별도 constants 파일로 분리
  - `src/claude/core/_constants/agents-md-forbidden.json` (신규)
  - setup.js 에서 import
  - T-TMPL-02 후 블록 추가/수정 시 동일 lint 적용
- **AC**:
  - [ ] constants JSON 분리
  - [ ] setup.js import 동작 유지
  - [ ] T-TMPL-02 블록에도 lint 적용
- **의존성**: T-TMPL-02 완료 후
- **예상 공수**: 0.3 인·일
- **우선순위**: **P3**

---

#### **T-TMPL-16** — 변수 치환 로직 공통 유틸 추출

- **대응 이슈**: L3
- **범위**:
  - `scripts/_utils/template-vars.js` (신규) — `substituteVars()` 공통 유틸
  - 3 곳 consumer (`setup.js`, `claude-md-renderer.js`, `quickstart-renderer.js`, `kit-scaffolding`) 공통 함수 사용
  - 테스트: 기존 동작 회귀 (TDD 권장)
- **AC**:
  - [ ] 공통 유틸 1 개
  - [ ] 3 consumer 전환
  - [ ] 기존 출력 100% 동일 (diff 0)
- **의존성**: T-TMPL-05 (템플릿 확장자 규칙 확정 후)
- **예상 공수**: 0.8 인·일 (TDD 포함)
- **우선순위**: **P3**

---

#### **T-TMPL-17** — 변경 이력 표 형식 통일

- **대응 이슈**: L4
- **범위**:
  - 모든 `*.template.md` / `{name}.md` 템플릿 하단 `## 변경 이력` 표:
    - 형식: `| 날짜 | 내용 | 작성자 |` (3 컬럼, [`implementation-hints.md:137`](../../../src/claude/plan/skills/plan-epic-workflow/templates/implementation-hints.md) 기준)
    - 2 컬럼 형식은 3 컬럼으로 일괄 확장
  - `template-governance.md` 에 표 형식 명시
- **AC**:
  - [ ] 40 템플릿 중 변경 이력 보유 파일 전수 3 컬럼 통일
- **의존성**: 없음
- **예상 공수**: 0.2 인·일
- **우선순위**: **P3**

---

## 3. Phase 로드맵

### 3.1 Phase 구성

```
┌────────────────────────────────────────────────────────┐
│  Phase A — Critical + High (5 TASK, ~4.0 인·일)         │
├────────────────────────────────────────────────────────┤
│  T-TMPL-01 ─┬─► T-TMPL-02 ─► T-TMPL-03                 │
│             │                                           │
│             ├─► T-TMPL-04 (병렬)                        │
│             │                                           │
│             └─► T-TMPL-05 (병렬)                        │
│                                                         │
│  게이트: SSOT 룰 완성 + AGENTS.md 구조 통합 완료         │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  Phase B — Medium 독립 (5 TASK, ~1.2 인·일)             │
├────────────────────────────────────────────────────────┤
│  T-TMPL-07 ─► T-TMPL-08    (병렬 그룹 1)               │
│                                                         │
│  T-TMPL-10                   (독립)                    │
│  T-TMPL-11 ◄── D-02 결정    (독립, 결정 대기 가능)      │
│  T-TMPL-13                   (독립)                    │
│                                                         │
│  게이트: 네이밍·링크·enum 일관성 확보                   │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  Phase C — H3 + 잔여 Medium + Low (7 TASK, ~2.4 인·일) │
├────────────────────────────────────────────────────────┤
│  T-TMPL-06 ◄── D-01 결정                               │
│  T-TMPL-09 ◄── D-03 결정                               │
│  T-TMPL-12  (병렬)                                      │
│  T-TMPL-14  (T-01 병합 가능)                            │
│  T-TMPL-15  (T-02 후)                                   │
│  T-TMPL-16  (T-05 후)                                   │
│  T-TMPL-17  (독립)                                      │
│                                                         │
│  게이트: 7 축 평균 ≥ 4.60                                │
└────────────────────────────────────────────────────────┘
```

### 3.2 Phase 별 예상 공수

| Phase | TASK 수 | 예상 공수 | 병렬 가능 | 예상 기간 (1 인) |
|-------|:---:|:---:|:---:|:---:|
| Phase A | 5 | 3.8 인·일 | T-04/T-05 병렬 | 2~3 일 |
| Phase B | 5 | 1.2 인·일 | T-07→T-08 순차, 나머지 병렬 | 1 일 |
| Phase C | 7 | 2.4 인·일 | 결정 완료 후 대부분 병렬 | 1.5~2 일 |
| **합계** | **17** | **7.4 인·일** | — | **~5 일** |

### 3.3 TeamCreate 병렬 가능성

- Phase A: **dev-architect** (SSOT 룰 설계) + **dev-doc-updater** (블록 분할) 병렬
- Phase B: **dev-doc-updater** 단일 처리 (파일 리네이밍·링크 갱신)
- Phase C: **dev-architect** + **dev-doc-updater** + **dev-code-reviewer** (lint 강화) 병렬

---

## 4. 리스크 + 완화책

| # | 리스크 | 영향 | 가능성 | 완화책 |
|---|---|:---:|:---:|---|
| R1 | T-TMPL-02 구조 변경 시 AGENTS.md 생성 회귀 | 높음 | 중 | `setup.js --dry-run` 회귀 테스트 + 기존 AGENTS.md 보존 시나리오 수동 검증 |
| R2 | T-TMPL-03 rule 참조 링크가 Codex runtime 에서 해석 불가 | 중 | 중 | AGENTS.md runtime 금지 패턴(`src/` 경로 금지) 충돌 없는지 사전 검증. 필요 시 docs/ 공개 경로 사용 |
| R3 | T-TMPL-07 파일 리네이밍 시 외부 consumer 파괴 | 낮음 | 낮음 | `git mv` 사용 + Grep 으로 외부 참조 전수 확인. Breaking Change BC-TMPL-02 로 선언 |
| R4 | T-TMPL-11 단/복수 결정 변경 시 plan-epic 커맨드 로직 영향 | 중 | 낮음 | D-02 결정 후 커맨드 로직 grep → 경로 하드코딩 전수 확인 |
| R5 | T-TMPL-16 공통 유틸 추출 시 출력 diff | 중 | 낮음 | TDD (기존 출력 snapshot 테스트 먼저) |
| R6 | 전체 - 세션 컨텍스트 50% 초과 (원칙 #8) | 낮음 | 낮음 | Phase 단위로 세션 분리. Phase A 완료 후 커밋 + 새 세션 |
| R7 | Breaking Change 3 건 동시 도입 시 다운스트림 혼란 | 중 | 낮음 | BC 는 모두 minor version (v2.5.0) 번들 + CHANGELOG 에 통합 마이그레이션 가이드 |

---

## 5. Breaking Change 선언

### 5.1 BC-TMPL-01 — AGENTS.md.template 구조 변경

- **TASK**: T-TMPL-02
- **영향**: 기존 AGENTS.md.template 을 직접 참조하는 외부 도구 없음 → **실질 영향 없음**
- **하위 호환**: setup.js 가 기존 AGENTS.md 보존 (marker 추가로 merger 가능)
- **Deprecation**: 없음 (내부 template 구조 변경)

### 5.2 BC-TMPL-02 — quickstart block 파일명 순차화

- **TASK**: T-TMPL-07
- **영향**: `05b-copy-flow.md` → `06-copy-flow.md` + 이후 블록 번호 shift. 외부 consumer 없음 (installer 만).
- **하위 호환**: `scripts/quickstart-renderer.js:10-21` `CORE_BLOCKS` 배열 업데이트 시 동시 전환.
- **Deprecation**: 없음

### 5.3 BC-TMPL-03 — plan-epic 템플릿 리네이밍 (조건부)

- **TASK**: T-TMPL-11
- **영향**: D-02 결정에 따라 파일명 변경 가능. 현재 사용자 기존 Feature Package 에 영향 없음 (템플릿은 새 Epic 만 생성).
- **하위 호환**: 기존 생성된 파일은 원본 파일명 유지. 새 Epic 부터 신 네이밍 적용.
- **Deprecation**: 2 minor version (v2.7.0 까지 구 네이밍 참조 경고 유지)

---

## 6. 검증 전략 (Verification Strategy)

### 6.1 TASK 별 검증

각 TASK 는 `verification.md` Iron Law 준수:
- [ ] 계획 재확인 → 체크리스트 작성 → 항목별 검증 (IDENTIFY)
- [ ] 명령 실행 (RUN): `/kit-validate`, `pnpm check:docs`, `setup.js --dry-run`
- [ ] 출력 읽기 (READ): 결과 전문 확인
- [ ] 주장과 출력 비교 (VERIFY)
- [ ] 결과 보고 (CLAIM) — 증거와 함께

### 6.2 Phase 별 검증 게이트

- **Phase A 완료 조건**: SSOT 룰 파일 존재 + AGENTS.md.template ≤ 30 줄 + 중복 Jaccard < 0.3
- **Phase B 완료 조건**: 모든 quickstart 블록 순차 번호 + 링크 checker PASS + Epic 상태 enum SSOT 참조
- **Phase C 완료 조건**: 7 축 평균 ≥ 4.60 (재측정) + 3 개 결정 (D-01, D-02, D-03) 반영 + `/kit-validate` TODO 감지 동작

---

## 7. 다음 단계 (Next Actions)

1. **[사용자 승인 대기]** `03-decision-log.md` 의 D-01, D-02, D-03 결정 검토
2. **승인 후 진입**: Phase A 착수
   - `/dev-feature docs/plan/templates-improvement-20260423/02-improvement-plan.md`
   - 자동 Feature Package 생성 → `/dev-run` 으로 TDD 구현 루프
3. **Phase A 완료 후**: 커밋 (`feat(templates): Phase A 완료 - SSOT 룰 + AGENTS.md 통합`)
4. **Phase B/C**: 각 Phase 마다 새 세션 (Context 50% 원칙)

---

## 8. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — 17 TASK 분해 + 3 Phase 로드맵 + BC 3 건 선언 | Claude (메인테이너 역할) |
| 2026-04-24 | §0.5 진행 현황 추가 — Phase A 9 TASK 완료 (commit 8cfc9ba / 7058eb9 / 6c81a35 / daffea4). BC-TMPL-03 제거 확정. 남은 7 TASK 우선순위 재정렬 (T-02 최우선). | Claude (메인테이너 역할) |
