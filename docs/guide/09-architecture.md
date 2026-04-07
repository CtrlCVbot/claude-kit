# 아키텍처 + 컴포넌트 카탈로그

> claude-kit v2.1 아키텍처 레퍼런스. 도메인 분리, 멀티타겟 출력, 네이밍, 컴포넌트 카탈로그, 산출물 구조를 한 문서로 정리.

---

## 도메인 분리

소스는 도메인별 디렉토리(`src/{domain}/`)로 분리되어 있지만, 설치 결과는 타겟별 네이티브 구조로 출력된다. Claude는 **플랫 구조**(`.claude/{category}/`)를 쓰고, Codex는 **repo-local plugin 구조**(`plugins/claude-kit/{category}/`)를 쓴다. 접두사가 도메인 소속을 보장하는 점은 두 타겟 모두 동일하다.

### 3개 도메인

| 도메인 | 접두사 | 설치 | 설명 |
|--------|--------|------|------|
| **core** | (없음) | 항상 | AI 거버넌스 기반. 보안, 품질, 세션 관리 |
| **dev** | `dev-` | 기본 | TDD 강제, 코드 리뷰, 빌드/검증, Git 워크플로우 |
| **plan** | `plan-` | opt-in | Idea ~ PRD ~ Wireframe ~ Stitch 기획 파이프라인 |

### 도메인별 컴포넌트 수

| 카테고리 | core | dev | plan | 합계 |
|---------|:----:|:---:|:----:|:----:|
| Agents | 0 | 6 | 6 | 12 |
| Commands | 0 | 20 | 10 | 30 |
| Skills | 2 | 13 | 8 | 23 |
| Hooks | 5 | 2 | 1 | 8 |
| Rules | 6 | 0 | 0 | 6 |
| **소계** | **13** | **41** | **25** | **79** |

### 의존성 방향

```
plan ──> core <── dev
```

- core는 dev, plan에 의존하지 않음
- dev와 plan은 서로 독립 (교차 의존 금지)
- `plan-bridge`만 예외: 두 도메인 모두 활성일 때 동작

### 플래트닝 (소스 -> 설치)

**Claude 타겟** (기본):

```
src/core/hooks/edit-tracker.js      -> .claude/hooks/edit-tracker.js
src/dev/commands/dev-commit.md      -> .claude/commands/dev-commit.md
src/plan/agents/plan-prd-writer.md  -> .claude/agents/plan-prd-writer.md
```

**Codex 타겟** (선택):

```
src/dev/agents/dev-architect.md     -> plugins/claude-kit/agents/dev-architect.md
src/dev/commands/dev-commit.md      -> plugins/claude-kit/commands/dev-commit.md
src/core/hooks/edit-tracker.js      -> plugins/claude-kit/hooks/edit-tracker.js
                                    -> plugins/claude-kit/hooks.json 엔트리
```

> Codex에서는 호환 가능한 hook JS가 `plugins/claude-kit/hooks/`에 복사되고, `hooks.json`이 그 파일들을 참조한다. 호환되지 않는 훅은 skip 처리되어 `.claude-kit-meta.json`의 `skippedForCodex`에 기록된다.

### 도메인 + 타겟 선택 (`profile.json`)

| 시나리오 | domains | targets | 설치 결과 |
|---------|---------|---------|----------|
| 기본 (미지정) | (없음) | (없음) | core+dev, Claude만 |
| 개발만 | `["core", "dev"]` | `["claude"]` | core+dev, Claude만 |
| 기획 포함 | `["core", "dev", "plan"]` | `["claude"]` | core+dev+plan, Claude만 |
| Codex만 | `["core", "dev"]` | `["codex"]` | core+dev, Codex만 |
| 동시 설치 | `["core", "dev"]` | `["claude", "codex"]` | core+dev, 양쪽 |

---

## 네이밍 컨벤션

### 접두사 규칙

| 도메인 | 접두사 | 예시 |
|--------|--------|------|
| core | (없음) | `edit-tracker.js`, `verification.md`, `session-wrap/` |
| dev | `dev-` | `dev-tdd-guard.js`, `dev-commit.md`, `dev-architect.md` |
| plan | `plan-` | `plan-doc-guard.js`, `plan-idea.md`, `plan-prd-writer.md` |

### 파일명 패턴

| 유형 | Claude 출력 | Codex 출력 | 예시 |
|------|-------------|------------|------|
| Agent | `.claude/agents/{prefix}{name}.md` | `plugins/claude-kit/agents/{prefix}{name}.md` | `plan-prd-writer.md` |
| Command | `.claude/commands/{prefix}{name}.md` | `plugins/claude-kit/commands/{prefix}{name}.md` | `dev-commit.md` |
| Skill | `.claude/skills/{prefix}{name}/SKILL.md` | `plugins/claude-kit/skills/{prefix}{name}/SKILL.md` | `plan-pipeline/SKILL.md` |
| Hook | `.claude/hooks/{prefix}{name}.js` | `plugins/claude-kit/hooks/{prefix}{name}.js` + `hooks.json` | `dev-tdd-guard.js` |
| Rule | `.claude/rules/{name}.md` | `AGENTS.md`에 핵심 규칙 요약 | `verification.md` |

---

## Codex 지원 상세

Codex 관련 설명의 SSOT는 이 문서다. 저장소 루트 `README`는 설치 진입과 업데이트 정책을 설명하고, 여기서는 타겟별 출력 계약과 자산 매핑 규칙을 고정한다.
Codex 호환 기능 설명과 도입 계획은 [../codex-compatibility/00-overview.md](../codex-compatibility/00-overview.md)를 시작점으로 하는 별도 운영 문서 세트에서 관리한다.

### 설치 단위와 생성 산출물

| 항목 | Claude | Codex |
|------|--------|-------|
| 설치 단위 | `.claude/` 폴더 | `plugins/claude-kit/` repo-local plugin |
| 컨텍스트 문서 | `CLAUDE.md` | `AGENTS.md` |
| 설정 파일 | `.claude/settings.json` | `plugins/claude-kit/.codex-plugin/plugin.json` |
| Hook 형식 | `.claude/hooks/*.js` | `plugins/claude-kit/hooks/` + `hooks.json` |
| 플러그인 등록 | -- | `.agents/plugins/marketplace.json` |

Codex 타겟 설치 시 생성되는 대표 산출물:

```text
{project}/
├── AGENTS.md
├── .agents/
│   └── plugins/
│       └── marketplace.json
└── plugins/
    └── claude-kit/
        ├── .codex-plugin/
        │   └── plugin.json
        ├── agents/
        ├── commands/
        ├── skills/
        ├── hooks/
        └── hooks.json
```

Dual-target 설치에서는 `.claude/`와 `plugins/claude-kit/`이 서로 독립적으로 생성된다. 기존 Claude 사용자는 `targets`를 생략해도 계속 `["claude"]` 기본값으로 동작한다.

### 자산 매핑 규칙

| 자산 유형 | Claude 출력 | Codex 출력 | 지원 수준 | 처리 방식 |
|---------|------------|-----------|:--------:|----------|
| `skills` | `.claude/skills/` | `plugins/claude-kit/skills/` | Full (path copy) | 출력 경로만 전환 |
| `commands` | `.claude/commands/` | `plugins/claude-kit/commands/` | Full (path copy) | 출력 경로만 전환 |
| `agents` | `.claude/agents/` | `plugins/claude-kit/agents/` | Full (path copy) | 출력 경로만 전환 |
| `hooks` | `.claude/hooks/*.js` | `plugins/claude-kit/hooks/` + `hooks.json` | Partial | 호환 가능한 JS만 복사 + JSON 선언 생성 |
| `rules` | `.claude/rules/*.md` | `AGENTS.md` 참조 | Partial | 핵심 규칙을 템플릿에 흡수 |
| `templates` | `CLAUDE.md`, `.claude/settings.json` | `AGENTS.md`, `plugin.json`, `marketplace.json` | Target-specific | 타겟별 결과물 생성 |
| `mcp` | `.claude/settings.json` 내 참조 | -- | Excluded | v1 제외 |

`Full (path copy)`의 의미는 “파일을 plugin 내부에 그대로 복사한다”는 뜻이다. 자산 본문의 `.claude/`, `CLAUDE.md`, `~/.claude/` 문자열은 v1에서 자동 치환하지 않는다.

### 내부 참조 처리

v1에서 자동 변환하지 않는 내부 참조는 아래와 같다.

| 내부 참조 | v1 처리 | 이유 |
|----------|--------|------|
| `.claude/...` | 미변환 | 문서 설명, 실행 경로, 런타임 저장 위치의 의미가 섞여 있어 단순 치환 위험이 큼 |
| `CLAUDE.md` | 미변환 | 복사된 자산 본문은 그대로 유지되고, Codex용 `AGENTS.md`는 템플릿 산출물에만 적용 |
| `~/.claude/...` | 미변환 + 필요 시 skip | 홈 디렉토리 런타임은 repo-local Codex 모델과 직접 대응되지 않음 |

즉, v1에서 자동 변환되는 것은 설치 산출물 경로와 템플릿 결과물뿐이다. copied asset 내부 문자열 정규화는 의도적으로 v2 범위로 남겨 둔다.

### Hook 변환 규칙

Claude의 개별 JS hook 중 Codex 호환 항목은 `plugins/claude-kit/hooks/`에 복사되고, `hooks.json`이 그 파일을 참조한다.

```text
Claude:                              Codex:
.claude/hooks/                       plugins/claude-kit/hooks/
  ├── edit-tracker.js                  ├── edit-tracker.js
  ├── code-quality-reminder.js         ├── code-quality-reminder.js
  └── security-auto-trigger.js         └── security-auto-trigger.js

                                     plugins/claude-kit/hooks.json
                                     {
                                       "hooks": {
                                         "PostToolUse": [...],
                                         "PreToolUse": [...]
                                       }
                                     }
```

지원/제외 기준:

| 기준 | 결과 | 이유 |
|------|:----:|------|
| Codex `hooks.json` 형식으로 변환 가능 | 지원 | 구조 대응이 명확 |
| Claude 전용 환경변수 의존 (`CLAUDE_SESSION_ID`, `CLAUDE_REMOTE_SESSION`) | 제외 | Codex에서 동일 env 보장 안 됨 |
| `~/.claude` 런타임 저장 의존 | 제외 | repo-local 모델과 충돌 |
| Claude Stop/remote session 전용 이벤트 | 제외 | 동일한 실행 맥락이 없음 |

현재 v1 기준 hook 호환성:

| Hook | Codex v1 | 이유 |
|------|:--------:|------|
| `edit-tracker.js` | 지원 | 파일 편집 이력 기록, 범용적 |
| `code-quality-reminder.js` | 지원 | 품질 체크 리마인더, 범용적 |
| `security-auto-trigger.js` | 지원 | 보안 민감 파일 감지, 범용적 |
| `dev-tdd-guard.js` | 지원 | Codex `PreToolUse` 매처로 연결 가능 |
| `dev-db-guard.js` | 지원 | Codex `Bash` 매처로 연결 가능 |
| `plan-doc-guard.js` | 지원 | 기획 중 소스 수정 차단 규칙을 유지 가능 |
| `output-secret-filter.js` | 제외 | `CLAUDE_REMOTE_SESSION` + `~/.claude` 의존 |
| `session-wrap-suggest.js` | 제외 | Claude Stop 이벤트 전용 |

### 메타데이터와 skip 기록

Codex 타겟을 설치하면 `.claude-kit-meta.json`에 Codex 출력과 skip 정보가 함께 기록된다.

```json
{
  "targets": ["claude", "codex"],
  "outputs": {
    "codex": {
      "root": "plugins/claude-kit",
      "generated": [
        "AGENTS.md",
        "plugins/claude-kit/.codex-plugin/plugin.json",
        ".agents/plugins/marketplace.json",
        "plugins/claude-kit/hooks.json"
      ]
    }
  },
  "skippedForCodex": [
    {
      "component": "output-secret-filter.js",
      "reason": "depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime"
    }
  ]
}
```

원칙은 단순하다.

- v1에서 이식하지 못한 자산은 숨기지 않고 `skippedForCodex`에 기록한다.
- `component`와 `reason`을 함께 남겨 후속 parity 작업과 회귀 분석에 활용한다.
- `outputs.codex`는 생성 결과를 추적하는 기준으로 쓴다.

### 설치기 흐름

설치기는 3-stage 구조로 동작한다.

```text
source assets (src/{domain}/{category})
  -> normalization (도메인 계산 + 타겟 계산 + skip 판정)
  -> target emitter (Claude emitter | Codex emitter)
```

| Stage | 역할 |
|-------|------|
| Source | `src/core/`, `src/dev/`, `src/plan/`와 `templates/` 수집 |
| Normalization | 활성 domains/targets 계산, 자산별 처리 방식 판정, skip 사유 기록 |
| Claude emitter | `.claude/` 폴더 구조 출력과 `settings.json` 병합 |
| Codex emitter | `plugins/claude-kit/` plugin 구조, `AGENTS.md`, `plugin.json`, `marketplace.json`, `hooks.json` 생성 |

### v1 제한사항

| 제한 | 이유 |
|------|------|
| Hook 부분 지원 | Claude 전용 env, 홈 디렉토리 런타임, Stop 이벤트 의존 훅은 제외 |
| Rules 간접 참조 | Codex에서 별도 rules 디렉토리 대신 `AGENTS.md`에 핵심 요약을 넣는다 |
| 자산 내부 Claude 참조 미변환 | 복사된 자산의 `.claude/` 경로 참조는 v1에서 자동 치환하지 않는다 |
| MCP 미지원 | 인증, transport, app/plugin 연결 구조가 함께 설계되어야 함 |
| 전역 설치 미지원 | `~/.codex`가 아닌 repo-local plugin 모델만 지원 |
| 런타임 100% parity 미제공 | 설치 가능성과 유지보수 안전성을 먼저 확보한 v1 범위 |

---

## 컴포넌트 카탈로그

### 에이전트 (12)

#### Plan 도메인 에이전트 (6)

| 이름 | 모델 | 역할 | 호출 커맨드 |
|------|------|------|-----------|
| plan-idea-collector | sonnet | 아이디어 수집 + 백로그 관리 | /plan-idea |
| plan-idea-screener | sonnet | RICE 스크리닝 + 채점 | /plan-screen |
| plan-prd-writer | opus | PRD 10개 섹션 작성 | /plan-prd |
| plan-wireframe-designer | opus | 와이어프레임 + Mermaid 다이어그램 | /plan-wireframe |
| plan-stitch-integrator | sonnet | Stitch 프롬프트 생성 + HTML 검증 | /plan-stitch |
| plan-reviewer | opus | 산출물 리뷰 + PCC 검증 (read-only) | /plan-review |

#### Dev 도메인 에이전트 (6)

| 이름 | 모델 | 역할 | 호출 커맨드 |
|------|------|------|-----------|
| dev-security-reviewer | opus | OWASP Top 10 보안 분석 | /dev-security-review |
| dev-verify-agent | sonnet | 빌드/타입/린트/테스트 검증 파이프라인 | /dev-handoff-verify |
| dev-code-reviewer | opus | 코드 품질 + 보안 리뷰 | /dev-review |
| dev-architect | sonnet | 아키텍처 분석 + 기술 의사결정 | (수동 호출) |
| dev-database-reviewer | opus | PostgreSQL 쿼리/스키마/보안 리뷰 | (DB 변경 시) |
| dev-doc-updater | sonnet | 문서 + 코드맵 자동 생성 | /dev-sync-docs |

### 커맨드 (30)

#### Plan 도메인 커맨드 (10)

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

#### Dev 스킬 (13)

| 그룹 | 스킬 |
|------|------|
| 개발 방법론 | dev-tdd-workflow, dev-workflow, dev-refactoring |
| 아키텍처 | dev-domain-modeling, dev-layered-architecture, dev-feature-module |
| 테스트 | dev-testing-backend, dev-testing-frontend, dev-testing-e2e |
| 프론트엔드 | dev-frontend-patterns |
| 보안 | dev-security-pipeline |
| 검증 | dev-verification-engine |
| 관찰 | dev-observability |

#### Plan 스킬 (8)

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
| `targets` | 설치 타겟 (`claude`, `codex`) | `["claude"]` |
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
| [00-overview.md](./00-overview.md) | 시스템 개요 + 전체 워크플로우 |
| [01-planning-pipeline.md](./01-planning-pipeline.md) | 기획 파이프라인 P1~P8 |
| [08-dev-workflow.md](./08-dev-workflow.md) | 개발 워크플로우 Phase A~E |
| [10-glossary.md](./10-glossary.md) | 용어집 + 커맨드 레퍼런스 |
| [11-archive-improve.md](./11-archive-improve.md) | 아카이브 + 개선요청 |
| [12-blueprint-fast-track.md](./12-blueprint-fast-track.md) | 블루프린트 Fast-Track |
