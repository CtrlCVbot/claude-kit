# Documentation Package 재구축 계획서

> Status: **Draft — 승인 대기**
> Author: Claude (claude-kit 유지보수)
> Created: 2026-04-17
> Target completion: TBD (승인 후 산정)

---

## 0. Executive Summary

`docs/` 디렉터리는 **설계/리뷰/아카이브 이력(~2.3MB, 14개 상위 디렉터리)** 과 **사용자 가이드(`docs/guide/`)** 가 섞여 있어, 처음 진입한 사용자가 "무엇부터 읽어야 하는가"를 판단하기 어렵다.

이 계획은 두 가지를 분리한다.

1. **역사/설계 문서**: `docs/archive/2026-04-17/` 하위로 이동해 **열람 가능한 아카이브**로 보존
2. **최종 문서 패키지**: `docs/` 루트를 **Overview → Features → User Guide → Reference → Contributing** 의 5계층으로 재구성

이번 턴에서는 **계획서만 작성**한다. 실제 이동·작성·삭제는 승인 이후 별도 PR로 진행한다.

---

## 1. 현재 상태 스캔 (Audit)

### 1.1 docs/ 상위 인벤토리

| 경로 | 크기 | 유형 | 재구축 판정 |
|------|------|------|-----------|
| `docs/guide/` | 164K (14 files) | User Guide (현행) | **재가공 후 유지** |
| `docs/claude-agent-integration/` | 572K | 통합 설계 이력 | Archive |
| `docs/codex-compatibility/` | 436K (대부분 `_archive/`) | Codex 호환 설계 이력 | Archive |
| `docs/meta-tooling/` | 240K | 메타 툴링 설계/로드맵 | Archive |
| `docs/codex-sync/` | 180K | Codex sync phase 리뷰 | Archive (최신 sync-report만 요약 반영) |
| `docs/notion-intake-screening/` | 132K | Notion 통합 설계 | Archive |
| `docs/team-orchestration/` | 128K | 팀 오케스트레이션 설계 | Archive |
| `docs/global-rules-review/` | 116K | 글로벌 룰 리뷰 | Archive |
| `docs/universality-analysis/` | 84K | 범용성 분석 | Archive |
| `docs/review/` | 40K | dev-architecture-gate 리뷰 | Archive |
| `docs/claude-code/` | 28K | Claude Code 관련 노트 | Archive |
| `docs/reviews/` | 24K | 리뷰 (중복성 확인 필요) | Archive (중복 시 병합) |
| `docs/agent-design/` | 20K | 에이전트 아키텍처 초안 | Archive |
| `docs/claude-home-inventory.md` | 단일 파일 | 홈 인벤토리 스냅샷 | Archive |

### 1.2 실제 소스(SSOT) 위치

최종 문서 패키지의 **사실 근거(출처)** 는 아래 위치에 존재한다. 문서는 이들을 참조/요약할 뿐이며, 사실을 중복 정의하지 않는다.

| 출처 | 경로 | 용도 |
|------|------|------|
| 패키지 메타 | [package.json](../../package.json), [README.md](../../README.md) | 버전, 설치, 개요 |
| Kit profile 기본값 | [src/templates/profile.json.template](../../src/templates/profile.json.template) | 도메인/타겟 기본값 |
| Installer | [scripts/setup.js](../../scripts/setup.js) | 설치 동작 |
| 도메인 소스 | `src/claude/{core,dev,plan}/`, `src/codex/{core,dev,plan}/` | 에이전트·커맨드·스킬·훅 실체 |
| 운영 규칙 | `src/claude/core/rules/*.md` | 핵심 원칙 |
| Pairing/Exception | [src/pairing-registry.json](../../src/pairing-registry.json), [src/exception-registry.json](../../src/exception-registry.json) | Claude↔Codex 매핑 |
| Quickstart 블록 | `src/templates/quickstart/blocks/` | 설치 후 온보딩 |

### 1.3 아카이빙 제외 (이동 금지)

- `.claude/` 전체 (런타임 설치물)
- 루트 `CLAUDE.md`, `AGENTS.md`, `README.md`, `LICENSE`, `package.json` 등
- `src/`, `scripts/`, `.claude-kit-meta.json`
- `docs/plan/` 자체 (본 계획서 및 후속 계획)

---

## 2. 아카이빙 전략

### 2.1 대상 및 규칙

**이동 대상**: `docs/` 하위 전체에서 아래를 제외한 모든 파일
- `docs/guide/` — 재가공 소스로 별도 처리
- `docs/plan/` — 계획 문서 영역 (본 문서 포함)

**이동 방식**: `git mv` 기반으로 히스토리를 보존하며 일괄 이동한다.

**목적지 규칙**:
```
docs/archive/2026-04-17/
  ├── README.md                         ← 아카이브 인덱스 (신규 생성)
  ├── agent-design/…                    ← 원본 구조 그대로 보존
  ├── claude-agent-integration/…
  ├── claude-code/…
  ├── claude-home-inventory.md
  ├── codex-compatibility/…
  ├── codex-sync/…
  ├── global-rules-review/…
  ├── meta-tooling/…
  ├── notion-intake-screening/…
  ├── review/…
  ├── reviews/…
  ├── team-orchestration/…
  └── universality-analysis/…
```

- **원본 디렉터리 구조 그대로 복제** (평탄화 금지, 내부 링크 안정성 유지)
- **기존 `_archive/` 중첩** (예: `codex-compatibility/_archive/`)은 그대로 둔다 — 이중 아카이브 플래트닝 금지

### 2.2 아카이브 인덱스 (`docs/archive/2026-04-17/README.md`)

아카이브 진입점. 다음 섹션 포함:

1. **Why archived** — 2026-04-17 문서 재구축 맥락
2. **디렉터리별 1줄 설명** — 14개 top-level 항목
3. **현행 문서로의 포인터** — "이 설계가 어디로 대체되었는지"
4. **재활성화 가이드** — 아카이브에서 현행 문서로 정보를 끌어올릴 때 절차

### 2.3 내부 링크 마이그레이션

- `docs/` 내부에서 아카이빙된 문서를 참조하는 링크는 **일괄 rewrite** 대상
- 코드(주석, README 등)에서 참조 중인 링크는 **grep 후 개별 판단**:
  - 현행 문서로 대체 가능 → 대체
  - 진짜 이력 참조 → `docs/archive/…` 경로로 rewrite
- rewrite 범위는 Phase 2에서 확정한다

---

## 3. 최종 문서 패키지 설계

### 3.1 디렉터리 트리 (목표 상태)

```
docs/
├── README.md                            ← 문서 진입점 (신규)
├── 00-overview/
│   ├── 01-what-is-claude-kit.md         ← 프로젝트 정체성
│   ├── 02-core-concepts.md              ← 용어·개념 (도메인, 타겟, pairing)
│   ├── 03-architecture-at-a-glance.md   ← 상위 수준 아키텍처
│   └── 04-decision-log.md               ← "왜 이 구조인가" 설계 결정 요약
├── 10-features/
│   ├── 01-core-domain.md                ← hooks/rules/skills 카탈로그
│   ├── 02-dev-domain.md                 ← agents/commands/skills/hooks
│   ├── 03-plan-domain.md                ← plan 파이프라인
│   ├── 04-multi-target.md               ← Claude + Codex 멀티타겟
│   └── 05-governance-guards.md          ← TDD gate, DB guard, Scope guard 등
├── 20-user-guide/
│   ├── 01-installation.md               ← pnpm add, profile.json
│   ├── 02-configuration.md              ← domains/targets 선택
│   ├── 03-first-run.md                  ← 설치 직후 체크리스트
│   ├── 04-daily-workflow.md             ← /dev-feature → /dev-run → /dev-commit
│   ├── 05-plan-pipeline.md              ← /plan-idea → /plan-screen → /plan-bridge
│   ├── 06-codex-dual-use.md             ← Codex 병행 사용
│   ├── 07-troubleshooting.md            ← 자주 막히는 지점
│   └── 08-glossary.md                   ← 현행 용어집
├── 30-reference/
│   ├── 01-commands.md                   ← 전체 커맨드 목록 (자동 생성 가능)
│   ├── 02-agents.md                     ← 서브에이전트 목록
│   ├── 03-skills.md                     ← 스킬 목록
│   ├── 04-hooks.md                      ← 훅 목록 + 매처
│   ├── 05-rules.md                      ← rules 카탈로그
│   ├── 06-settings.md                   ← settings.json 스키마
│   ├── 07-pairing-registry.md           ← Claude↔Codex pairing
│   └── 08-cli-scripts.md                ← scripts/ 유틸 일람
├── 40-contributing/
│   ├── 01-development-setup.md          ← 개발 환경
│   ├── 02-adding-a-component.md         ← kit-create → kit-validate → kit-sync
│   ├── 03-domain-authoring.md           ← 새 도메인 추가 절차
│   ├── 04-release-checklist.md          ← 릴리즈 기준
│   └── 05-quality-gates.md              ← audit-drift, audit-pairing 등
├── archive/
│   └── 2026-04-17/…                     ← 구 docs/ 이력 (§2)
└── plan/
    └── documentation-package-plan.md    ← 본 문서
```

**번호 체계**: `00/10/20/30/40` 10단위 간격 — 향후 `15-roadmap/` 같은 섹션 삽입 여지 확보.

### 3.2 각 문서의 출처·담당 매핑

| 문서 | 출처(SSOT) | 작성 방식 | 분량 목표 |
|------|-----------|----------|----------|
| `README.md` | 본 계획서 §3.1 | 신규 작성 | 80~150 lines |
| **00-overview** | | | |
| 01-what-is-claude-kit | README, package.json, CLAUDE.md | 재구성 | ~150 |
| 02-core-concepts | guide/10-glossary.md, profile.json.template | 재가공 | ~200 |
| 03-architecture-at-a-glance | guide/09-architecture.md | **요약·재구성** (원본은 reference로 보존) | ~250 |
| 04-decision-log | codex-sync, meta-tooling, codex-compatibility 주요 결정만 추출 | **신규 요약** (아카이브 링크 포함) | ~200 |
| **10-features** | | | |
| 01-core-domain | src/claude/core/, src/codex/core/ | 코드 스캔 기반 생성 + 수기 설명 | ~250 |
| 02-dev-domain | src/claude/dev/ | 상동 | ~300 |
| 03-plan-domain | src/claude/plan/, guide/01~04 | 상동 | ~300 |
| 04-multi-target | README §타겟, pairing-registry.json | 재구성 | ~200 |
| 05-governance-guards | src/claude/{core,dev,plan}/hooks/*.js 주석 + 코드 | **신규** (훅별 목적/trigger/block 조건 표) | ~250 |
| **20-user-guide** | | | |
| 01-installation | README §설치 | 재구성 + 검증 | ~150 |
| 02-configuration | profile.json.template + README §도메인/타겟 | 재구성 | ~200 |
| 03-first-run | CLAUDE-KIT-QUICKSTART.md.template, templates/quickstart/blocks/ | 재가공 | ~200 |
| 04-daily-workflow | guide/06, guide/08, .claude/commands/dev-* | 재구성 | ~300 |
| 05-plan-pipeline | guide/01~04, .claude/commands/plan-* | 재구성 | ~300 |
| 06-codex-dual-use | README §타겟, docs/codex-sync 최종 리포트 | **요약 신규** | ~200 |
| 07-troubleshooting | **신규** (FAQ 수집 필요) | 수기 작성 | ~200 |
| 08-glossary | guide/10-glossary.md | 재가공 | ~150 |
| **30-reference** | | | |
| 01-commands ~ 05-rules | `.claude/` + `src/` 스캔 | **generator 스크립트 도입 권장** (Phase 3) | 각 200~400 |
| 06-settings | settings.json.template, merge-settings.js | 재구성 | ~250 |
| 07-pairing-registry | pairing-registry.json, exception-registry.json | 자동 생성 권장 | ~200 |
| 08-cli-scripts | scripts/ 파일별 헤더 주석 | 수기 인덱스 | ~200 |
| **40-contributing** | | | |
| 01-development-setup | package.json scripts | 재구성 | ~150 |
| 02-adding-a-component | .claude/commands/kit-create.md 등 | 재가공 | ~250 |
| 03-domain-authoring | src 구조 + kit-sync 규약 | **신규** | ~300 |
| 04-release-checklist | 수기 작성 (기존 관행 수집 필요) | 신규 | ~150 |
| 05-quality-gates | scripts/audit-*.js | 재구성 | ~200 |

> **담당(Owner)** 은 실제 실행 시점에 사용자가 지정한다. 이 계획서는 "어디서 정보를 끌어오는지(Source)" 와 "어떻게 만드는지(Method)" 만 확정한다.

### 3.3 문서 스타일 컨벤션

- 한국어 우선, 코드/커맨드/경로는 영문 그대로
- 상대 링크 사용 (`../../src/...`)
- 각 문서 최대 **400 lines** — 초과 시 분할
- 각 상위 섹션은 **동일한 헤더 구조** (Overview → 본문 → Related)
- **자동 생성 가능한 섹션은 수기 편집 금지** (Phase 3에서 generator 확정)

---

## 4. 실행 마일스톤

| Phase | 산출물 | 검증 | 의존성 |
|-------|--------|------|--------|
| **P0. Plan 승인** | 본 문서 승인 | 사용자 명시 승인 | — |
| **P1. Archive freeze** | `docs/archive/2026-04-17/` 이동 + 인덱스 README | `git log --follow` 로 히스토리 보존 확인 / 내부 링크 rewrite grep 0건 | P0 |
| **P2. Scaffold** | 신규 5개 섹션 디렉터리 + `_placeholder.md` 스켈레톤 | 트리가 §3.1 과 일치 | P1 |
| **P3. Generator 도입** | 커맨드/에이전트/스킬/훅 목록 자동 생성 스크립트 | `node scripts/docs-generate.js --check` 통과 | P2 |
| **P4. Content draft** | 모든 문서 초안 완성 (출처 매핑에 따라) | 각 문서 내부 링크 유효성 / 용어 일관성 | P3 |
| **P5. Review & polish** | 용어집 정합성, 링크 검사, README 엔트리 정비 | 외부 독자 1명 시범 온보딩 통과 | P4 |
| **P6. Cutover** | 루트 `README.md`, `CLAUDE.md`, `CLAUDE-KIT-QUICKSTART.md.template` 에서 새 경로로 링크 rewrite | 설치 직후 quickstart→guide 흐름 재현 | P5 |

**병렬 가능 구간**: P3와 P4(수기 섹션)는 부분 병렬 가능. 단, reference 섹션은 P3 완료 후 시작.

---

## 5. 검증 기준 (Definition of Done)

Phase별 Done 조건. 각 조건은 **증거 기반**으로 확인한다 (verification.md 준수).

### 5.1 공통 게이트

- [ ] `docs/` 하위 모든 내부 링크 `grep`: 404 링크 0건
- [ ] 신규 문서에 하드코딩된 절대 경로 0건 (모두 상대 경로)
- [ ] 각 문서 < 400 lines
- [ ] 코드블록 언어 태그 누락 0건

### 5.2 Phase별

- **P1**: `git log --follow docs/archive/2026-04-17/<file>` 로 원본 이력 확인 가능 / 아카이브 인덱스 README 내 14개 항목 모두 설명 존재
- **P3**: reference 문서가 `.claude/` 실제 파일 수와 일치 (diff 0)
- **P4**: 각 문서의 "Source" 섹션에 §3.2 매핑과 일치하는 출처 명시
- **P6**: 루트 README의 "저장소 문서" 링크가 모두 신규 트리를 가리킴

### 5.3 사용자 체감 검증

- 신규 사용자가 `README.md` → `docs/README.md` → `docs/20-user-guide/01-installation.md` 순서로 읽어 **막힘 없이 설치 완료 가능해야 함**
- 기여자가 `docs/40-contributing/02-adding-a-component.md` 만 보고 새 커맨드 1개 추가 PR 가능해야 함

---

## 6. 리스크 및 롤백

| ID | 리스크 | 영향 | 대응 |
|----|--------|------|------|
| R1 | `git mv` 과정에서 히스토리 파편화 | 중 | 아카이브를 **단일 커밋**으로 이동, rename threshold 확인 |
| R2 | 외부에서 `docs/guide/*.md` 에 직링크 중 | 중 | P6 시점에 redirect stub 문서 남김 (1~2 릴리즈 유지 후 제거) |
| R3 | `codex-compatibility/_archive/` 중첩 아카이브가 이중 중첩으로 혼란 유발 | 낮 | 아카이브 인덱스에 "2단계 archive" 설명 명시 |
| R4 | generator 도입 전 수기 초안이 난립 | 중 | P3 완료 전에는 reference 섹션 작성 금지 |
| R5 | 재구축 중 `docs/guide/` 참조하는 quickstart 템플릿 깨짐 | 높 | P6 cutover 를 **원자 커밋** 으로 처리, 이전 경로 redirect 유지 |
| R6 | Codex 타겟 문서가 Claude 타겟보다 빈약 | 중 | 각 문서 "Claude vs Codex" 표 섹션 강제 |

### 롤백 전략

- **P1~P2 단계**: 해당 커밋 `git revert` — 원복 비용 낮음
- **P3 이후**: 신규 문서는 유지하고 루트 링크만 구(旧) 경로로 되돌리는 "soft rollback" 가능
- **완전 rollback 마지막 시점**: P5 완료 직전까지. P6 cutover 이후에는 forward-fix 원칙

---

## 7. 미결 사항 (승인 시 답변 요청)

다음은 계획 확정 전에 사용자 결정이 필요하다.

1. **아카이브 날짜 정책**: `archive/2026-04-17/` 고정 vs 향후 재아카이빙 시 `archive/YYYY-MM-DD/` 다중 디렉터리 운용 여부
2. **`docs/guide/` 처리 수준**:
   - (a) 통째로 archive 후 새 문서로 대체
   - (b) guide 내용을 새 20-user-guide/ 로 **인입한 후 원본 삭제**
   - (c) guide는 유지하고 신규 패키지가 링크만 함
   - 권장: **(b)**
3. **Generator 스크립트 도입**: P3에 `scripts/docs-generate.js` 신설 승인 여부 (신설 권장)
4. **언어**: 전체 한국어 / 핵심 문서만 영한 병기 / 영문화 중 선택 — **현재 가정: 한국어 우선**
5. **외부 공개 범위**: 향후 GitHub Pages / Docusaurus 같은 사이트화 고려 여부 — **현재 가정: Markdown only**

---

## 8. 승인 게이트

이 계획서는 다음 항목에 대한 사용자의 **명시적 승인** 을 받은 후에만 실행 단계로 진입한다.

- [ ] §2 아카이빙 대상/제외 규칙
- [ ] §3.1 디렉터리 트리
- [ ] §3.2 출처 매핑
- [ ] §4 마일스톤 순서
- [ ] §7 미결 사항 답변

승인 형식 예: "§2, §3 동의. §7-2는 (b) 선택. 나머지 계획대로 진행."

승인 전까지는 어떤 파일도 이동/생성/삭제하지 않는다.

---

## 참고 문서

- [README.md](../../README.md) — 패키지 개요
- [CLAUDE.md](../../CLAUDE.md) — 현행 Claude 런타임 컨텍스트
- [docs/guide/00-overview.md](../guide/00-overview.md) — 현행 가이드 진입점
- [src/templates/profile.json.template](../../src/templates/profile.json.template) — 도메인/타겟 기본값
- [scripts/setup.js](../../scripts/setup.js) — installer 동작
