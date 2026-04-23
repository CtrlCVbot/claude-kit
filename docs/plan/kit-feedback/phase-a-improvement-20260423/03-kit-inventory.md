# 03. Kit Inventory — 현재 plan 도메인 인벤토리 + 피드백 매핑

> **목적**: 피드백 대상이 되는 **현재 claude-kit plan 도메인 자산**을 인벤토리화. 각 자산의 피드백 영향(영향 없음 / 수정 필요 / 신규 필요)을 매핑하여 04-proposal.md 의 구현 영향 범위를 확정.

**스캔 대상**: `src/claude/plan/`, `src/claude/core/rules/` (plan 관련만)
**스캔 일**: 2026-04-23

---

## 1. 커맨드 (11 종)

| # | 커맨드 | 파일 | 피드백 영향 | 대응 TASK |
|:-:|--------|------|:---:|----------|
| 1 | `/plan-epic` | `src/claude/plan/commands/plan-epic.md` | 🟡 Medium (show/list 개선) | T-SHOW-01 |
| 2 | `/plan-epic advance` | (1 의 서브) | 🔴 **Critical** (자동 링크·게이트·fallback) | T-EPMV-01~03 |
| 3 | `/plan-idea` | `src/claude/plan/commands/plan-idea.md` | 🟢 Low (Brief §3 갱신 보강) | 상세 매트릭스 |
| 4 | `/plan-screen` | `src/claude/plan/commands/plan-screen.md` | 🟠 High (Lane 가중 룰 참조) | T-RICE-01 |
| 5 | `/plan-draft` | `src/claude/plan/commands/plan-draft.md` | 🟢 Low (기술 스택 스캔 확대) | 상세 매트릭스 |
| 6 | `/plan-prd` | `src/claude/plan/commands/plan-prd.md` | 🟡 Medium (PCC 확장) | T-PCC-01 |
| 7 | `/plan-bridge` | `src/claude/plan/commands/plan-bridge.md` | 🟡 Medium (5 파일 경량화) | T-BRDG-01 |
| 8 | `/plan-review` | `src/claude/plan/commands/plan-review.md` | - | - |
| 9 | `/plan-wireframe` | `src/claude/plan/commands/plan-wireframe.md` | - | - |
| 10 | `/plan-design` | `src/claude/plan/commands/plan-design.md` | - | - |
| 11 | `/plan-stitch` | `src/claude/plan/commands/plan-stitch.md` | - | - |
| 12 | `/plan-archive` | `src/claude/plan/commands/plan-archive.md` | - | - |
| 13 | `/plan-improve` | `src/claude/plan/commands/plan-improve.md` | - | - |

**신규 서브커맨드 후보**:
- `/plan-epic-phase generate` (T-TMPL-01)
- `/plan-epic show` 강화 (T-SHOW-01, 이미 정의되어 있으나 실사용성 향상)
- `/plan-revise` (T-REVP-01, 선택적)

---

## 2. 에이전트 (10 종)

| # | 에이전트 | 파일 | 도구 | 피드백 영향 | 대응 TASK |
|:-:|---------|------|------|:---:|----------|
| 1 | `plan-idea-collector` | `src/claude/plan/agents/plan-idea-collector.md` | Read/Grep/Glob/Write/Edit/Bash | 🟡 Medium (Brief §3 + slug 제안) | T-BRDG-02 (출력 표준) |
| 2 | `plan-idea-screener` | `src/claude/plan/agents/plan-idea-screener.md` | Read/Grep/Glob/Write/Edit/Bash | 🟠 **High** (Lane 가중 룰 참조) | T-RICE-01 |
| 3 | `plan-draft-writer` | `src/claude/plan/agents/plan-draft-writer.md` | Read/Grep/Glob/Write/Edit | 🟡 Medium (기술 스택 스캔 확대) | T-BRDG-02 (출력 표준) |
| 4 | `plan-prd-writer` | `src/claude/plan/agents/plan-prd-writer.md` | Read/Grep/Glob/Write/Edit | 🟡 Medium (User Story 유연성 + Risks 우선순위) | T-BRDG-02 (출력 표준) |
| 5 | `plan-reviewer` | `src/claude/plan/agents/plan-reviewer.md` | Read/Grep/Glob (**read-only**) | 🟡 Medium (PCC 확장) | T-PCC-01 |
| 6 | `plan-bridge-writer` | `src/claude/plan/agents/plan-bridge-writer.md` | Read/Grep/Glob/Write/Edit/Bash | 🟠 **High** (5 파일 경량화) | T-BRDG-01, T-BRDG-02 |
| 7 | `plan-wireframe-designer` | `src/claude/plan/agents/plan-wireframe-designer.md` | Read/Grep/Glob/Write/Edit | - | - |
| 8 | `plan-design-writer` | `src/claude/plan/agents/plan-design-writer.md` | Read/Grep/Glob/Write/Edit | - | - |
| 9 | `plan-stitch-integrator` | `src/claude/plan/agents/plan-stitch-integrator.md` | Read/Grep/Glob/Write/Edit | - | - |

**Read-only 에이전트**: plan-reviewer (캐시 invalidation 없음, T-RACE-02 의 재인증 예외)

---

## 3. 훅 (4 종)

| # | 훅 | 파일 | Trigger | 피드백 영향 | 대응 TASK |
|:-:|----|------|---------|:---:|----------|
| 1 | `plan-doc-guard.js` | `src/claude/plan/hooks/plan-doc-guard.js` | PreToolUse (Edit\|Write) | - | - |
| 2 | `plan-idea-move-guard.js` | `src/claude/plan/hooks/plan-idea-move-guard.js` | PreToolUse (Bash mv) | - | - |
| 3 | `plan-review-trigger.js` | `src/claude/plan/hooks/plan-review-trigger.js` | PostToolUse (Write PRD) | - | - |
| 4 | `plan-epic-integrity.js` | `src/claude/plan/hooks/plan-epic-integrity.js` | PostToolUse (Edit epic files) | 🟡 Medium (Phase 3 enable 시 PCC 확장 연동) | T-PCC-01 (연동) |

**신규 훅 후보**:
- `plan-state-sync.js` (T-FSTATE-01) — IDEA frontmatter 변경 감지 → 3 곳 자동 동기

**기존 훅 개선**:
- `agent-completion-cache-invalidate` (T-RACE-02) — core 도메인 훅, Read 캐시 재인증 자동화

---

## 4. 룰 (SSOT 문서)

### 4-1. 현재 플랜 관련 룰

| # | 룰 | 위치 | 피드백 영향 | 대응 TASK |
|:-:|----|------|:---:|----------|
| 1 | `plan-epic-hierarchy.md` | `src/claude/plan/rules/` | 🟠 High (상태 머신 명시 + fallback 섹션) | T-FSTATE-02, T-EPMV-02 |
| 2 | `checkpoint-policy.md` | `src/claude/core/rules/` (kit) | 🟡 Medium (수정 요청 프로토콜) | T-REVP-01 |
| 3 | `verification.md` | `src/claude/core/rules/` (kit) | 🟠 High (Agent Edit Race 섹션 + Read 재인증) | T-RACE-02 (연동) |
| 4 | `edit-coordinates-governance.md` | `src/claude/core/rules/` (kit) | - | - |
| 5 | `task-id-naming.md` | `src/claude/core/rules/` (kit) | - | - |

### 4-2. 신규 룰 (본 패키지 제안)

| # | 룰 | 제안 위치 | 대응 TASK |
|:-:|----|----------|----------|
| 1 | `agent-file-ownership.md` | `src/claude/core/rules/` (kit, 도메인 간 공유) | T-RACE-01 |
| 2 | `rice-lane-weighted-adjustment.md` | `src/claude/plan/rules/` | T-RICE-01 |

---

## 5. 스킬 (9 종)

| # | 스킬 | 파일 | 피드백 영향 | 대응 TASK |
|:-:|------|------|:---:|----------|
| 1 | `plan-pipeline` | `src/claude/plan/skills/plan-pipeline/SKILL.md` | 🟡 Medium (수정 요청 프로토콜) | T-REVP-01 |
| 2 | `plan-epic-workflow` | `src/claude/plan/skills/plan-epic-workflow/SKILL.md` | 🟠 High (Phase 템플릿) | T-TMPL-01 |
| 3 | `plan-idea-management` | `src/claude/plan/skills/plan-idea-management/SKILL.md` | 🟢 Low | - |
| 4 | `plan-screening-workflow` | `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 🟠 High (Lane 가중 규칙 링크) | T-RICE-01 |
| 5 | `plan-prd-authoring` | `src/claude/plan/skills/plan-prd-authoring/SKILL.md` | 🟡 Medium (PCC 확장) | T-PCC-01 |
| 6 | `plan-review-criteria` | `src/claude/plan/skills/plan-review-criteria/SKILL.md` | 🟡 Medium (PCC-07~09) | T-PCC-01 |
| 7 | `plan-archive-workflow` | `src/claude/plan/skills/plan-archive-workflow/SKILL.md` | - | - |
| 8 | `plan-stitch-workflow` | `src/claude/plan/skills/plan-stitch-workflow/SKILL.md` | - | - |
| 9 | `plan-wireframe-design` | `src/claude/plan/skills/plan-wireframe-design/SKILL.md` | - | - |
| 10 | `claude-design-workflow` | `src/claude/plan/skills/claude-design-workflow/SKILL.md` | - | - |

### 5-1. plan-epic-workflow 템플릿

| 템플릿 | 파일 | 피드백 영향 | 대응 TASK |
|--------|------|:---:|----------|
| epic-brief | `templates/epic-brief.md` | 🟢 Low (§3 자동 갱신) | - |
| children-features | `templates/children-features.md` | 🟠 High (§4 Phase 로드맵 템플릿화) | T-TMPL-01 |
| epic-binding | `templates/epic-binding.md` | 🟡 Medium (§7 상태 동기 표 자동화) | T-FSTATE-01 |

**신규 템플릿 후보**:
- `phase-roadmap.md` (T-TMPL-01) — Phase 로드맵 9 단계 재사용 템플릿

---

## 6. 기타 관련 구성

### 6-1. 상수 / 스키마

| 자산 | 위치 | 피드백 영향 |
|------|------|:---:|
| `task-id-patterns.json` | `src/claude/core/_constants/` | - |
| `critical-checkpoints.json` | `src/claude/core/_constants/` | - |
| `edit-coordinates.schema.json` | `src/claude/dev/_schemas/` | - |
| `agent-telemetry.schema.json` | `src/claude/core/_schemas/` | - |

### 6-2. 유틸

| 자산 | 위치 | 피드백 영향 |
|------|------|:---:|
| `task-id.js` | `src/claude/core/_utils/` | - |
| `auto-proceed.js` | `src/claude/core/checkpoint/` | - |

---

## 7. 피드백 영향 요약

### 7-1. 심각도별 자산 수

| 심각도 | 자산 수 | 주요 대상 |
|:---:|:---:|----------|
| 🔴 **Critical** | 1 | `/plan-epic advance` |
| 🟠 **High** | 6 | plan-idea-screener · plan-bridge-writer · plan-epic-hierarchy.md · verification.md · plan-epic-workflow · plan-screening-workflow |
| 🟡 **Medium** | 9 | (커맨드 2 · 에이전트 3 · 룰 1 · 훅 1 · 스킬 2) |
| 🟢 **Low** | 3 | (미수정 권장 또는 minor 제안) |

### 7-2. 신규 추가 자산 (본 패키지 구현 결과)

| 종류 | 수 | 상세 |
|------|:-:|------|
| 신규 커맨드/서브커맨드 | 2~3 | `/plan-epic-phase generate`, `/plan-revise`(선택) |
| 신규 훅 | 1 | `plan-state-sync.js` |
| 신규 룰 | 2 | `agent-file-ownership.md`, `rice-lane-weighted-adjustment.md` |
| 신규 템플릿 | 1 | `phase-roadmap.md` |
| 신규 스크립트 (선택) | 1 | `epic-advance-rewrite.js` (T-EPMV-01 추출 시) |
| 기존 훅 개선 | 1 | `agent-completion-cache-invalidate` |

### 7-3. 영향 없는 자산 (유지)

- 커맨드 6 종: `/plan-review`, `/plan-wireframe`, `/plan-design`, `/plan-stitch`, `/plan-archive`, `/plan-improve`
- 에이전트 3 종: `plan-wireframe-designer`, `plan-design-writer`, `plan-stitch-integrator`
- 훅 3 종: `plan-doc-guard`, `plan-idea-move-guard`, `plan-review-trigger`
- 스킬 4 종: `plan-archive-workflow`, `plan-stitch-workflow`, `plan-wireframe-design`, `claude-design-workflow`

---

## 8. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — plan 도메인 자산 인벤토리 (커맨드 13 · 에이전트 10 · 훅 4 · 룰 5 · 스킬 10 · 템플릿 3) + 피드백 심각도 매핑 |
