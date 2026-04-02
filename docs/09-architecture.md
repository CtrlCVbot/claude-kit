# 아키텍처 + 컴포넌트 카탈로그

> claude-kit v2.0 아키텍처 레퍼런스. 도메인 분리, 네이밍, 컴포넌트 카탈로그, 산출물 구조를 한 문서로 정리.

---

## 도메인 분리

소스는 도메인별 디렉토리(`src/{domain}/`)로 분리되어 있지만, 설치 결과는 **플랫 구조**(`.claude/{category}/`)이다. 접두사가 도메인 소속을 보장한다.

### 3개 도메인

| 도메인 | 접두사 | 설치 | 설명 |
|--------|--------|------|------|
| **core** | (없음) | 항상 | AI 거버넌스 기반. 보안, 품질, 세션 관리 |
| **dev** | `dev-` | 기본 | TDD 강제, 코드 리뷰, 빌드/검증, Git 워크플로우 |
| **plan** | `plan-` | opt-in | Idea ~ PRD ~ Wireframe ~ Stitch 기획 파이프라인 |

### 도메인별 컴포넌트 수

| 카테고리 | core | dev | plan | 합계 |
|---------|:----:|:---:|:----:|:----:|
| Agents | 0 | 7 | 6 | 13 |
| Commands | 0 | 20 | 8 | 28 |
| Skills | 2 | 14 | 7 | 23 |
| Hooks | 5 | 2 | 1 | 8 |
| Rules | 6 | 0 | 0 | 6 |
| **소계** | **13** | **43** | **22** | **78+** |

### 의존성 방향

```
plan ──> core <── dev
```

- core는 dev, plan에 의존하지 않음
- dev와 plan은 서로 독립 (교차 의존 금지)
- `plan-bridge`만 예외: 두 도메인 모두 활성일 때 동작

### 플래트닝 (소스 -> 설치)

```
src/core/hooks/edit-tracker.js      -> .claude/hooks/edit-tracker.js
src/dev/commands/dev-commit.md      -> .claude/commands/dev-commit.md
src/plan/agents/plan-prd-writer.md  -> .claude/agents/plan-prd-writer.md
```

### 도메인 선택 (`profile.json`)

| 시나리오 | domains 값 | 설치 결과 |
|---------|-----------|----------|
| 기본 (미지정) | (없음) | core, dev |
| 개발만 | `["core", "dev"]` | core, dev |
| 기획 포함 | `["core", "dev", "plan"]` | core, dev, plan |
| core 생략 시도 | `["dev"]` | core, dev (core 자동 추가) |

---

## 네이밍 컨벤션

### 접두사 규칙

| 도메인 | 접두사 | 예시 |
|--------|--------|------|
| core | (없음) | `edit-tracker.js`, `verification.md`, `session-wrap/` |
| dev | `dev-` | `dev-tdd-guard.js`, `dev-commit.md`, `dev-architect.md` |
| plan | `plan-` | `plan-doc-guard.js`, `plan-idea.md`, `plan-prd-writer.md` |

### 파일명 패턴

| 유형 | 패턴 | 예시 |
|------|------|------|
| Agent | `.claude/agents/{prefix}{name}.md` | `plan-prd-writer.md` |
| Command | `.claude/commands/{prefix}{name}.md` | `dev-commit.md` |
| Skill | `.claude/skills/{prefix}{name}/SKILL.md` | `plan-pipeline/SKILL.md` |
| Hook | `.claude/hooks/{prefix}{name}.js` | `dev-tdd-guard.js` |
| Rule | `.claude/rules/{name}.md` | `verification.md` |

---

## 컴포넌트 카탈로그

### 에이전트 (13)

#### Plan 도메인 에이전트 (6)

| 이름 | 모델 | 역할 | 호출 커맨드 |
|------|------|------|-----------|
| plan-idea-collector | sonnet | 아이디어 수집 + 백로그 관리 | /plan-idea |
| plan-idea-screener | sonnet | RICE 스크리닝 + 채점 | /plan-screen |
| plan-prd-writer | opus | PRD 10개 섹션 작성 | /plan-prd |
| plan-wireframe-designer | opus | 와이어프레임 + Mermaid 다이어그램 | /plan-wireframe |
| plan-stitch-integrator | sonnet | Stitch 프롬프트 생성 + HTML 검증 | /plan-stitch |
| plan-reviewer | opus | 산출물 리뷰 + PCC 검증 (read-only) | /plan-review |

#### Dev 도메인 에이전트 (7)

| 이름 | 모델 | 역할 | 호출 커맨드 |
|------|------|------|-----------|
| dev-security-reviewer | opus | OWASP Top 10 보안 분석 | /dev-security-review |
| dev-verify-agent | sonnet | 빌드/타입/린트/테스트 검증 파이프라인 | /dev-handoff-verify |
| dev-code-reviewer | opus | 코드 품질 + 보안 리뷰 | /dev-review |
| dev-architect | sonnet | 아키텍처 분석 + 기술 의사결정 | (수동 호출) |
| dev-database-reviewer | opus | PostgreSQL 쿼리/스키마/보안 리뷰 | (DB 변경 시) |
| dev-doc-updater | sonnet | 문서 + 코드맵 자동 생성 | /dev-sync-docs |
| dev-frontend-reviewer | opus | 접근성/CVA/반응형/성능 리뷰 | /dev-verify-fe |

### 커맨드 (28)

#### Plan 도메인 커맨드 (8)

| 커맨드 | 파이프라인 | 설명 | 에이전트 |
|--------|:---------:|------|---------|
| /plan-idea | P1 | 아이디어 수집 | plan-idea-collector |
| /plan-screen | P2 | RICE 스크리닝 | plan-idea-screener |
| /plan-draft | P3 | 1차 기능 기획 (Lite/Standard 판정) | (직접 처리) |
| /plan-prd | P4 | PRD 상세 작성 | plan-prd-writer |
| /plan-wireframe | P5 | 와이어프레임 생성 | plan-wireframe-designer |
| /plan-stitch | P6 | PRD + Wireframe 통합 | plan-stitch-integrator |
| /plan-bridge | P7 | 기획 -> 개발 핸드오프 | (직접 처리) |
| /plan-archive | P8 | 완료 기능 아카이빙 + 번들 생성 | (직접 처리) |
| /plan-improve | - | 아카이브 개선요청 등록/분석/실행 | (직접 처리) |
| /plan-review | 전체 | 산출물 품질 리뷰 | plan-reviewer |

#### Dev 도메인 커맨드 (20)

| 그룹 | 커맨드 |
|------|--------|
| 개발 루프 | /dev-feature, /dev-run, /dev-verify, /dev-test-verify, /dev-commit |
| 검증 | /dev-verify-fe, /dev-verify-all, /dev-handoff-verify |
| 리뷰 | /dev-review, /dev-security-review |
| Git | /dev-commit-push-pr, /dev-checkpoint |
| 탐색/학습 | /dev-explore, /dev-learn, /dev-continue |
| 문서/동기화 | /dev-sync, /dev-sync-docs |
| 리팩토링 | /dev-refactor, /dev-build-fix |
| 기획(dev) | /dev-plan |

### 스킬 (23)

#### Core 스킬 (2)

| 스킬 | 설명 |
|------|------|
| continuous-learning | 에러/성능/보안/자동화 패턴 학습 기록 |
| session-wrap | 세션 종료 시 작업 요약 + 다음 세션 컨텍스트 |

#### Dev 스킬 (14)

| 그룹 | 스킬 |
|------|------|
| 개발 방법론 | dev-tdd-workflow, dev-workflow, dev-refactoring |
| 아키텍처 | dev-domain-modeling, dev-layered-architecture, dev-feature-module |
| 테스트 | dev-testing-backend, dev-testing-frontend, dev-testing-e2e |
| 프론트엔드 | dev-frontend-patterns |
| 보안 | dev-security-pipeline |
| 검증 | dev-verification-engine |
| 관찰 | dev-observability |
| 멀티테넌트 | dev-tenant-isolation |

#### Plan 스킬 (7)

| 스킬 | 관련 커맨드 | 설명 |
|------|-----------|------|
| plan-idea-management | /plan-idea | 백로그 CRUD, ID 채번, 상태 전환 |
| plan-screening-workflow | /plan-screen | RICE 채점, 정규화, 임계값 판정 |
| plan-pipeline | /plan-draft, /plan-bridge | 파이프라인 라우팅, Lite/Standard 판정 |
| plan-prd-authoring | /plan-prd | PRD 구조 검증, 섹션 완성도 |
| plan-wireframe-design | /plan-wireframe | ASCII 와이어프레임, Mermaid 패턴 |
| plan-stitch-workflow | /plan-stitch | Stitch 프롬프트, HTML 검증 |
| plan-review-criteria | /plan-review | 리뷰 기준, PCC 로직, 심각도 판정 |
| plan-archive-workflow | /plan-archive, /plan-improve | 아카이브 워크플로우, 번들 생성, 개선요청 연계 |

### 훅 (8)

| 훅 | 도메인 | 이벤트 | 매처 | 동작 | 설명 |
|----|--------|--------|------|------|------|
| edit-tracker.js | core | PostToolUse | Edit\|Write | NON-BLOCKING | 편집 이력 기록 |
| code-quality-reminder.js | core | PostToolUse | Edit\|Write | NON-BLOCKING | 품질 체크 리마인더 |
| output-secret-filter.js | core | PostToolUse | * | NON-BLOCKING | 시크릿 25패턴 마스킹 |
| security-auto-trigger.js | core | PostToolUse | Edit\|Write | NON-BLOCKING | 보안 민감 파일 감지 |
| session-wrap-suggest.js | core | Stop | -- | NON-BLOCKING | 세션 정리 제안 |
| dev-tdd-guard.js | dev | PreToolUse | Edit\|Write | **BLOCKING** | 테스트 없는 구현 차단 |
| dev-db-guard.js | dev | PreToolUse | Bash | **BLOCKING** | SQL 위험 명령 차단 |
| plan-doc-guard.js | plan | PreToolUse | Edit\|Write | **BLOCKING** | 기획 중 소스 코드 수정 차단 |

### 룰 (6, 모두 core)

| 룰 | 핵심 기능 |
|----|----------|
| verification.md | 증거 없는 완료 선언 금지 (Iron Law) |
| security.md | 커밋 전 보안 체크리스트 8항목 |
| date-calculation.md | 날짜/시간 수동 계산 금지 |
| golden-principles.md | 핵심 코딩 원칙 13개 (불변성, TDD, 결론우선 등) |
| coding-style.md | 파일 800줄/함수 50줄 제한, zod 검증, 불변성 |
| interaction.md | 가정 명시, 유비 설명, 결론 우선, 불확실성 정직 |

---

## .plans/ 산출물 구조

```
{project}/
└── .plans/
    ├── ideas/                          <- P1-P2 산출물
    │   ├── 00-inbox/                   <- 신규 아이디어 (new)
    │   │   └── IDEA-{YYYYMMDD}-{NNN}.md
    │   ├── 10-screening/               <- 스크리닝 중/완료 (screening/screened)
    │   │   ├── IDEA-{YYYYMMDD}-{NNN}.md
    │   │   └── SCREENING-{YYYYMMDD}-{NNN}.md
    │   ├── 20-approved/                <- 사용자 승인 완료 (approved)
    │   │   ├── IDEA-{YYYYMMDD}-{NNN}.md
    │   │   └── SCREENING-{YYYYMMDD}-{NNN}.md
    │   ├── 90-archive/                 <- 반려/보류 (rejected/on-hold)
    │   │   └── IDEA-{YYYYMMDD}-{NNN}.md
    │   ├── backlog.md                  <- 인덱스 전용
    │   └── screening-matrix.md         <- 스크리닝 인덱스 전용
    │
    ├── prd/                            <- P4: PRD
    │   ├── 00-draft/                   <- 작성 중
    │   │   └── prd-{YYYY-MM-DD}-{slug}/
    │   ├── 10-approved/                <- 승인됨 (-> /dev-feature 입력)
    │   │   └── prd-{YYYY-MM-DD}-{slug}/
    │   └── 90-archive/                 <- 반려/폐기
    │
    ├── wireframes/                     <- P5: 와이어프레임
    │   └── {slug}/
    │       ├── 00-screen-list.md
    │       ├── 01-navigation-map.md
    │       ├── 02-wireframes/screen-{nn}-{name}.md
    │       ├── 03-user-flows.md
    │       ├── 04-state-diagrams.md
    │       └── 05-interaction-notes.md
    │
    ├── stitch/                         <- P6: Stitch 디자인
    │   └── {slug}/
    │       ├── 00-stitch-prompts.md
    │       ├── html/scr-{nn}-{name}.html
    │       ├── 01-design-notes.md
    │       └── 02-validation-report.md
    │
    ├── reviews/                        <- 리뷰 리포트
    │   └── {slug}/{stage}-review-{n}.md
    │
    ├── features/                       <- Feature Plans (v5 계승)
    │   ├── drafts/{slug}/first-pass.md <- P3: First-Pass (Standard)
    │   ├── active/                     <- 진행 중 (Lite: {slug}.md, Standard: {slug}/)
    │   └── done/                       <- 완료 이력
    │
    ├── products/_registry.md           <- 제품/패키지 레지스트리
    ├── stage-manifest.json             <- 파이프라인 상태 추적
    ├── _template.md                    <- Lite Feature Plan 템플릿
    └── _template-standard.md           <- Standard 확장 가이드
```

### ideas/ 폴더 흐름

```
00-inbox/ -> 10-screening/ -> 20-approved/ (또는 90-archive/)
```

- `IDEA-{YYYYMMDD}-{NNN}.md`: 개별 아이디어 파일. 폴더 간 이동으로 상태 추적
- `SCREENING-{YYYYMMDD}-{NNN}.md`: IDEA와 동일 ID 사용. 스크리닝 결과

### ID 컨벤션

| ID 형식 | 용도 | 예시 |
|---------|------|------|
| `IDEA-{YYYYMMDD}-{NNN}` | 아이디어 | IDEA-20260320-001 |
| `{KEY}-REQ-###` | 요구사항 | BSEE-REQ-001 |
| `{KEY}-TASK-###` | 개발 태스크 | BSEE-TASK-003 |
| `FR-##` / `NFR-##` | PRD 기능/비기능 요구사항 | FR-01, NFR-03 |
| `SCR-{NN}` | 화면 | SCR-01 |

---

## stage-manifest.json

파이프라인 상태를 추적하는 JSON 파일. `/plan-draft` (P3) 실행 시 자동 생성.

```jsonc
{
  "features": {
    "broker-settlement-export": {
      "type": "standard",
      "stages": {
        "idea": { "status": "done", "completedAt": "2026-03-20T..." },
        "screening": { "status": "done", "completedAt": "2026-03-20T..." },
        "feature": { "status": "done", "completedAt": "2026-03-21T..." },
        "prd": { "status": "review-pass", "completedAt": "2026-03-22T..." },
        "wireframe": { "status": "in-progress" },
        "stitch": { "status": "pending" },
        "bridge": { "status": "pending" }
      }
    }
  }
}
```

### 파이프라인 상태 흐름

```
idea -> screening -> screened -> feature -> prd -> wireframe -> stitch -> bridge -> dev
```

- P1-P2는 `backlog.md` / `screening-matrix.md`가 상태 추적 (manifest 없음)
- P3 이후 `stage-manifest.json`이 상태 추적

---

## profile.json 설정

주요 설정 옵션:

| 필드 | 설명 | 기본값 |
|------|------|--------|
| `project.name` | 프로젝트명 (kebab-case) | -- |
| `project.domain` | 비즈니스 도메인 | -- |
| `domains` | 활성 도메인 | `["core", "dev"]` |
| `bootstrap.mode` | 부트스트랩 단계 | `pre-monorepo` |
| `stack.language` | 언어 | `typescript` |
| `monorepo.framework` | 프레임워크 | `next` |
| `monorepo.orm` | ORM | `drizzle` |
| `features.featurePackageSystem` | Standard Feature Package 사용 | `false` |

### 도메인 선택 예시

```json
{
  "domains": ["core", "dev", "plan"],
  "bootstrap": {
    "mode": "post-monorepo",
    "installedPhases": [1, 2, 3, 4]
  }
}
```

### 지원 언어 스택

| 언어 | runtime | buildTool | testFramework |
|------|---------|-----------|---------------|
| typescript | node | turbo | vitest |
| java | jvm | gradle | junit |
| python | cpython | uv | pytest |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| `docs/v6-claude/phase-1-install/reference/02-domain-separation.md` | 도메인 분리 상세 |
| `docs/v6-claude/phase-1-install/reference/03-naming-convention.md` | 네이밍 컨벤션 상세 + v1->v2 매핑 |
| `docs/v6-claude/phase-1-install/reference/04-components-hooks.md` | 훅 상세 (핵심 로직, 실행 순서) |
| `docs/v6-claude/phase-1-install/reference/05-components-commands.md` | 커맨드 상세 (28개) |
| `docs/v6-claude/phase-1-install/reference/06-components-skills.md` | 스킬 상세 (23개) |
| `docs/v6-claude/phase-1-install/reference/07-components-agents.md` | 에이전트 상세 (13개) |
| `docs/v6-claude/phase-1-install/reference/08-components-rules.md` | 룰 상세 (6개) |
| `docs/v6-claude/phase-2-planning/09-artifact-structure.md` | .plans/ 산출물 구조 |
| `docs/v6-claude/phase-2-planning/10-planning-components.md` | Plan 27개 컴포넌트 카탈로그 |
| `docs/v6-claude/profile-schema.md` | profile.json 전체 스키마 |
