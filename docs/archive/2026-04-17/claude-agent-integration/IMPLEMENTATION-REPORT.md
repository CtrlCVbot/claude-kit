# Copy 도메인 구현 결과 리포트

- 작성일: 2026-04-16
- 브랜치: `feat/copy-domain`
- 구현 범위: 05-implementation-plan.md A-1 ~ A6
- 설계 문서: `docs/claude-agent-integration/` (01~06)

## 1. 구현 요약

claude-kit에 `copy` 도메인을 opt-in 도메인으로 추가했다. copy 도메인은 기준 화면(reference)과 현재 구현을 비교해 시각적/인터랙션 충실도, evidence 관리, QA readiness를 표준화한다.

### 핵심 설계 결정

| 결정 | 내용 |
|------|------|
| 시나리오 3분류 | A(백지), B(부분), C(충실도 교정) — `/plan-draft`에서 판정 |
| Feature 유형 2분류 | copy(원본 대응 시각/인터랙션) / dev(원본 없음 또는 비시각적) |
| WBS 4계층 | Epic > Feature > Story > Task |
| opt-in 활성화 | `profile.json`에 `"copy"` 추가 시에만 배포 |
| reminder-first hooks | 신규 훅은 모두 reminder(exit 0)로 시작, blocking은 별도 승인 |

## 2. 생성된 컴포넌트 (26개)

### 에이전트 (4개)

| 파일 | 역할 | 도구 |
|------|------|------|
| `copy-fidelity.md` | Visual Gap Row(VF-*) 출력 | Read, Glob, Grep, Bash |
| `copy-interaction-fidelity.md` | Interaction State Map(IF-*) 출력 | Read, Glob, Grep, Bash |
| `copy-reference-baseline.md` | Evidence Manifest + Pairing Matrix | Read, Glob, Grep, Bash, **Write** |
| `copy-qa-reviewer.md` | QA Result (6개 카테고리) | Read, Glob, Grep, Bash |

### 커맨드 (7개)

| 커맨드 | 역할 | 시나리오 |
|--------|------|---------|
| `/copy-reference-refresh` | 기준 캡처 + manifest 생성/갱신 | A/B/C 모두 |
| `/copy-visual-review` | visual 갭 분석 | A/B: QA시, C: 기획시 |
| `/copy-interaction-review` | interaction 갭 분석 | A/B: QA시, C: 기획시 |
| `/copy-gap-board` | 갭 우선순위 통합 | A/B: QA시, C: 기획시 |
| `/copy-plan-unit` | 갭→실행 단위 전환 | C 전용 |
| `/copy-verify` | build/evidence/document 검증 | A/B/C 모두 |
| `/copy-closeout` | 승인 + 잔여 리스크 | A/B/C 모두 |

### 룰 (5개)

| 파일 | 내용 |
|------|------|
| `copy-fidelity.md` | visual/interaction 기준, 뷰포트 표준, P0/P1/P2 |
| `copy-evidence.md` | evidence 명명, manifest 스키마, 페어링 규칙 |
| `copy-gates.md` | 6단계 실행 라이프사이클, phase/round 게이트 |
| `copy-commands.md` | 시나리오별 커맨드 시퀀스, Feature 유형 라우팅 |
| `copy-variant.md` | variant/host map 환경 변수 표준 |

### 훅 (5개)

| 파일 | 이벤트 | 모드 |
|------|--------|------|
| `copy-evidence-reminder.js` | PostToolUse Edit\|Write | reminder (exit 0) |
| `copy-doc-drift-check.js` | PostToolUse Edit\|Write | reminder (exit 0) |
| `copy-scope-guard.js` | PreToolUse Edit\|Write | reminder (exit 0) |
| `copy-variant-env-guard.js` | PostToolUse Edit\|Write | reminder (exit 0) |
| `copy-gate-stop.js` | Stop | 비활성 (exit 0) |

### 스킬 (5개)

| 디렉터리 | 내용 |
|----------|------|
| `copy-pipeline/` | 전체 copy 파이프라인 워크플로우 |
| `copy-evidence-management/` | evidence 수집/manifest/페어링 |
| `copy-gap-analysis/` | visual/interaction 갭 분석 |
| `copy-qa-workflow/` | QA 검증 파이프라인 |
| `copy-closeout-workflow/` | closeout 프로세스 |

## 3. 수정된 기존 파일

### 스크립트 (인프라)

| 파일 | 변경 내용 |
|------|----------|
| `scripts/setup.js` | `buildHooksConfig()` copy 조건 블록, `buildCodexHooksJson()` 분류 |
| `scripts/claude-md-renderer.js` | `DOMAIN_BLOCKS`에 `copy: '30-copy.md'` |
| `scripts/quickstart-renderer.js` | `normalizeDomains`, 파이프라인/용어/액션 함수 |
| `scripts/codex-hook-compat.js` | `HOOK_PORTABILITY`에 5개 copy 훅 |

### Plan 도메인 (시나리오/WBS 인식)

| 파일 | 변경 내용 |
|------|----------|
| `plan-draft.md` | 3중 판정 (Lite/Standard + 시나리오 + Feature 유형), routing metadata |
| `plan-prd.md` | 2-pass PRD 모드 (--scope/--detail) |
| `plan-bridge.md` | routing metadata를 bridge context에 포함 |
| `plan-screen.md` | WBS 예비 분류, 충실도 해석 |
| `plan-review.md` | PCC-06 추가 |
| `plan-idea-collector.md` | 시나리오 태깅 |
| `plan-prd-writer.md` | routing metadata 확인, PRD 모드 결정 |
| `plan-reviewer.md` | PCC-06 검증 |

### Dev 도메인 (Feature 유형 인식)

| 파일 | 변경 내용 |
|------|----------|
| `dev-feature.md` | routing metadata 기반 Feature 유형 확인 |
| `dev-run.md` | `--story S-{AREA}-{NN}` 옵션 |
| `dev-verify-agent.md` | Feature 유형별 QA 범위 조정 |
| `dev-tdd-guard.js` | CSS/SCSS 스타일 파일 면제 |

### Core 도메인

| 파일 | 변경 내용 |
|------|----------|
| `verification.md` | Copy Domain Verification 섹션 |
| `interaction.md` | Scenario Determination Gate |

### 레지스트리

| 파일 | 변경 내용 |
|------|----------|
| `exception-registry.json` | EX-010~014 (copy 훅 5개) |
| `pairing-registry.json` | 26개 copy 컴포넌트 (unpaired) |
| `codex-portability.json` | 26개 copy 전략 (paired-review) |

## 4. 테스트 결과

### 배포 테스트 매트릭스

| # | Profile Domains | 컴포넌트 수 | copy 아티팩트 | 결과 |
|---|----------------|------------|-------------|------|
| T1 | `["core", "dev"]` | 59 | 없음 | PASS |
| T2 | `["core", "dev", "plan"]` | 84 | 없음 | PASS |
| T3 | `["core", "dev", "copy"]` | 85 | 26개 배포 | PASS |
| T4 | `["core", "dev", "plan", "copy"]` | 110 | 26개 배포 | PASS |

### 검증 항목

| 항목 | 결과 |
|------|------|
| Hook 구문 검증 (`node --check`) | 5/5 OK |
| settings.json copy 훅 등록 | Pre 1 + Post 3 + Stop 1 = 5개 |
| CLAUDE.md copy 섹션 렌더링 | OK |
| CLAUDE-KIT-QUICKSTART.md copy 참조 | 25회 |
| 기존 도메인 회귀 (core/dev/plan) | 변경 없음 |
| JSON 레지스트리 유효성 | 3개 모두 유효 |
| Agent frontmatter 완전성 | 4/4 OK |
| Command 섹션 구조 | 7/7 OK |
| Rule: frontmatter 없음 | 5/5 OK |
| Skill: frontmatter 완전성 | 5/5 OK |
| 에이전트↔커맨드 참조 정합성 | 전부 유효 |
| 시나리오 정의 일관성 | 전체 파일 일관 |

## 5. 커밋 이력

| # | 커밋 | 실행 단위 |
|---|------|----------|
| 1 | `feat: claude-kit copy 도메인 인프라` | ADOPT-A-1-01 |
| 2 | `chore: copy 도메인 Codex 레지스트리` | ADOPT-A-1-02 |
| 3 | `feat: plan 커맨드 시나리오/WBS 인식` | ADOPT-A0a-01 |
| 4 | `feat: dev 커맨드 Feature 유형 인식` | ADOPT-A0a-02 |
| 5 | `docs: core 룰 시나리오 참조 추가` | ADOPT-A0a-03 |
| 6 | `feat: stage manifest copyStages 블록` | ADOPT-A0a-05 |
| 7 | `docs: copy fidelity/evidence/gates/commands/variant rules` | ADOPT-A1-01 |
| 8 | `feat: visual/interaction fidelity agents` | ADOPT-A2-01 |
| 9 | `feat: reference baseline/QA review agents` | ADOPT-A2-02 |
| 10 | `feat: copy 분석 commands` | ADOPT-A3-01 |
| 11 | `feat: copy 실행/검증 commands` | ADOPT-A3-02 |
| 12 | `feat: copy reminder hooks` | ADOPT-A4-01 |
| 13 | `feat: copy gate-stop hook (비활성)` | ADOPT-A4-02 |
| 14 | `docs: copy workflow skills` | ADOPT-A5-01 |
| 15 | `docs: CAI 문서 재구성` | docs cleanup |

## 6. 활성화 방법

```json
// profile.json
{
  "domains": ["core", "dev", "plan", "copy"],
  "targets": ["claude"]
}
```

```bash
pnpm claude-kit:setup
# 또는
pnpm install  # postinstall로 setup.js 자동 실행
```

활성화 후 확인:

```bash
ls .claude/agents/copy-*.md     # 4개
ls .claude/commands/copy-*.md   # 7개
ls .claude/rules/copy-*.md      # 5개
ls .claude/hooks/copy-*.js      # 5개
ls .claude/skills/copy-*/SKILL.md  # 5개
```

## 7. 후속 작업

| 우선순위 | 작업 | 설명 |
|---------|------|------|
| 1 | A8: implementation-unit agent | gap row를 실행 단위 계획으로 변환하는 전용 에이전트 |
| 2 | A9: orchestrator agent | 전체 흐름 조율 (dry-run 추천만, 자동 진행 금지) |
| 3 | blocking 훅 전환 | reminder → blocking (별도 승인 후) |
| 4 | Codex 포팅 | pairing-registry unpaired → paired 전환 |

## 8. 파일 구조

```
src/claude/copy/
├── agents/
│   ├── copy-fidelity.md
│   ├── copy-interaction-fidelity.md
│   ├── copy-qa-reviewer.md
│   └── copy-reference-baseline.md
├── commands/
│   ├── copy-closeout.md
│   ├── copy-gap-board.md
│   ├── copy-interaction-review.md
│   ├── copy-plan-unit.md
│   ├── copy-reference-refresh.md
│   ├── copy-verify.md
│   └── copy-visual-review.md
├── hooks/
│   ├── copy-doc-drift-check.js
│   ├── copy-evidence-reminder.js
│   ├── copy-gate-stop.js
│   ├── copy-scope-guard.js
│   ├── copy-variant-env-guard.js
│   └── package.json
├── rules/
│   ├── copy-commands.md
│   ├── copy-evidence.md
│   ├── copy-fidelity.md
│   ├── copy-gates.md
│   └── copy-variant.md
└── skills/
    ├── copy-closeout-workflow/SKILL.md
    ├── copy-evidence-management/SKILL.md
    ├── copy-gap-analysis/SKILL.md
    ├── copy-pipeline/SKILL.md
    └── copy-qa-workflow/SKILL.md
```
