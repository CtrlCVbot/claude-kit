# plan Domain

> **Status**: Updated 2026-04-23 (Phase A 피드백 반영 완료)
> **Source**: `src/claude/plan/`, [../30-reference/01-commands.md](../30-reference/01-commands.md), [../30-reference/02-agents.md](../30-reference/02-agents.md)
> **Related**: [02-dev-domain.md](02-dev-domain.md), [../20-user-guide/05-plan-pipeline.md](../20-user-guide/05-plan-pipeline.md)

`plan` 도메인은 **아이디어 수집 → 스크리닝 → 상세 기획 → 개발 브리지** 까지의 기획 파이프라인입니다. PRD 가 아직 없는 단계부터 시작합니다.

v2.4.0 부터 **Epic/Feature/Task 3단 계층** 을 **Opt-in** 으로 제공합니다 ([plan-epic-hierarchy.md](../../src/claude/plan/rules/plan-epic-hierarchy.md)).

`profile.json` 에서 `"domains": ["core", "dev", "plan"]` 로 opt-in.

## 파이프라인 단계

```
Epic(opt) → /plan-epic         → .plans/epics/00-draft/EPIC-.../ (Opt-in, v2.4.0)
아이디어  → /plan-idea          → .plans/ideas/00-inbox/{IDEA-ID}.md
                                  (--epic=EPIC-... 로 자동 연결)
아이디어  → /plan-screen        → RICE 스크리닝 + ★ 승인 게이트 ★
(승인)    → /plan-draft         → 1차 기획 (Lite/Standard 판정)
Standard  → /plan-prd           → 상세 PRD (plan-prd-writer)
(옵션)    → /plan-wireframe     → 와이어프레임 (구조 확정)
           ├─ /plan-design      → Claude Design 2단계 프롬프트 (wireframe → high fidelity)
           └─ /plan-stitch      → Stitch 기반 디자인 시안 통합
             ※ design / stitch는 둘 중 택일. 미사용 시 /plan-bridge Checkpoint에서 skip.
 완성     → /plan-bridge        → 개발 핸드오프 (dev 도메인으로)
 완료     → /plan-archive       → 번들화 + 아카이빙
           → /plan-improve      → 회고·개선 제안
(선택)    → /plan-revise        → 이전 산출물에 수정 요청 반영 (T-REVP-01, v2.5.0)
```

## 승인 게이트

**가장 중요**: `/plan-screen` 이후 `/plan-draft` 로 넘어가려면 사용자의 **명시적 승인** 이 있어야 합니다. 자동 전진 금지.

`plan-doc-guard.js` 훅 (PreToolUse) 이 계획 문서 무결성을 검증합니다.

**Checkpoint 응답 표준**: Y/수정/N 3 옵션. "수정" 선택 시 `checkpoint-policy.md §8` 프로토콜로 재호출 (T-REVP-01).

## IDEA 상태 SSOT (v2.4.1, T-FSTATE-01/02)

IDEA frontmatter `상태:` 가 **Single Source of Truth** 입니다. 변경 시 `plan-state-sync.js` 훅이 3 곳 자동 동기화:

1. `.plans/ideas/backlog.md` 행 상태 컬럼
2. Epic `01-children-features.md` §1 F{N} 상태 필드
3. Feature `08-epic-binding.md` §7 상태 동기 표

상세: [plan-epic-hierarchy.md §5](../../src/claude/plan/rules/plan-epic-hierarchy.md).

## 커맨드 목록

| Command | 단계 | 역할 |
|---------|------|------|
| [`/plan-idea "아이디어"`](../../src/claude/plan/commands/plan-idea.md) | 수집 | `.plans/ideas/00-inbox/` 에 아이디어 문서 생성 |
| [`/plan-screen <IDEA-ID>`](../../src/claude/plan/commands/plan-screen.md) | 스크리닝 | RICE 점수·우선순위 평가, 승인 게이트 |
| [`/plan-draft <IDEA-ID>`](../../src/claude/plan/commands/plan-draft.md) | 초안 | 1차 기능 기획, Lite/Standard 판정 |
| [`/plan-prd <draft-path>`](../../src/claude/plan/commands/plan-prd.md) | PRD | Standard 기능 상세 PRD 작성 |
| [`/plan-wireframe`](../../src/claude/plan/commands/plan-wireframe.md) | 디자인 | 와이어프레임 구조 확정 (design/stitch 선행 필수) |
| [`/plan-design`](../../src/claude/plan/commands/plan-design.md) | 디자인 | **(wireframe 후 택일)** Claude Design용 2단계 프롬프트 생성 + 결과 URL 등록 |
| [`/plan-stitch`](../../src/claude/plan/commands/plan-stitch.md) | 디자인 | **(wireframe 후 택일)** Stitch HTML 기반 디자인 시안 통합 |
| [`/plan-review`](../../src/claude/plan/commands/plan-review.md) | 리뷰 | plan-reviewer 서브에이전트 호출 |
| [`/plan-bridge <slug>`](../../src/claude/plan/commands/plan-bridge.md) | 브리지 | dev 도메인으로 핸드오프 (Feature Package 로 변환) |
| [`/plan-archive <slug>`](../../src/claude/plan/commands/plan-archive.md) | 아카이빙 | 완료 기능 번들화 |
| [`/plan-improve`](../../src/claude/plan/commands/plan-improve.md) | 회고 | 회고 및 개선 제안 |

## 서브에이전트

| Agent | 역할 |
|-------|------|
| [`plan-idea-collector`](../../src/claude/plan/agents/plan-idea-collector.md) | 사용자 아이디어를 구조화 문서로 정리 |
| [`plan-idea-screener`](../../src/claude/plan/agents/plan-idea-screener.md) | RICE 점수 기반 스크리닝 |
| [`plan-prd-writer`](../../src/claude/plan/agents/plan-prd-writer.md) | PRD 상세 작성 |
| [`plan-reviewer`](../../src/claude/plan/agents/plan-reviewer.md) | 계획 문서 품질 리뷰 |
| [`plan-wireframe-designer`](../../src/claude/plan/agents/plan-wireframe-designer.md) | 와이어프레임 설계 |
| [`plan-design-writer`](../../src/claude/plan/agents/plan-design-writer.md) | Claude Design용 2단계 프롬프트(wireframe · high fidelity) 생성 + URL 등록 |
| [`plan-stitch-integrator`](../../src/claude/plan/agents/plan-stitch-integrator.md) | Stitch HTML 기반 디자인 시안 통합 |

## 스킬

| 스킬 | 역할 |
|------|------|
| [`plan-idea-management`](../../src/claude/plan/skills/plan-idea-management/SKILL.md) | 아이디어 수집·조직화 |
| [`plan-screening-workflow`](../../src/claude/plan/skills/plan-screening-workflow/SKILL.md) | 스크리닝 절차 |
| [`plan-review-criteria`](../../src/claude/plan/skills/plan-review-criteria/SKILL.md) | 리뷰 기준 |
| [`plan-prd-authoring`](../../src/claude/plan/skills/plan-prd-authoring/SKILL.md) | PRD 작성 가이드 |
| [`plan-wireframe-design`](../../src/claude/plan/skills/plan-wireframe-design/SKILL.md) | 와이어프레임 패턴 |
| [`claude-design-workflow`](../../src/claude/plan/skills/claude-design-workflow/SKILL.md) | Claude Design 2단계 프롬프트 워크플로우 (IMP-KIT-027) |
| [`plan-stitch-workflow`](../../src/claude/plan/skills/plan-stitch-workflow/SKILL.md) | 시안 통합 |
| [`plan-archive-workflow`](../../src/claude/plan/skills/plan-archive-workflow/SKILL.md) | 아카이빙 절차 |

## 디렉터리 산출물

| 경로 | 내용 |
|------|------|
| `.plans/ideas/00-inbox/` | 수집된 아이디어 |
| `.plans/ideas/10-screened/` | 스크리닝 통과한 아이디어 |
| `.plans/prd/` | Standard 기능 PRD |
| `.plans/wireframes/<slug>/` | 와이어프레임 산출물 (screens.md / components.md / navigation.md / decision-log.md) |
| `.plans/design/<slug>/` | Claude Design 프롬프트 및 매니페스트 (`prompt-01-wireframe.md`, `prompt-02-highfidelity.md`, `manifest.md`) |
| `.plans/features/active/<slug>/` | 진행 중 Feature (dev 도메인에서 이어서 사용) |
| `.plans/archive/<slug>/` | 완료된 Feature 번들 |

## dev 도메인과의 연결

`/plan-bridge <slug>` 가 호출되면 plan 도메인의 출력(PRD, 디자인 등)을 **dev 도메인의 `/dev-feature` 입력** 으로 변환합니다.

```
plan                                   dev
─────                                  ─────
/plan-prd   →  PRD 문서
/plan-bridge  →  Feature Overview  →  /dev-feature  →  Feature Package
                                        (구조 계약 + TASK 분할)
```

즉 plan 은 "무엇을 만들까" 에, dev 는 "어떻게 만들까" 에 집중합니다.

## 가드 훅

| Hook | Event | Action |
|------|-------|--------|
| [`plan-doc-guard.js`](../../src/claude/plan/hooks/plan-doc-guard.js) | PreToolUse (Edit\|Write) | 기획 문서 무결성 검증 — 승인 게이트 우회 차단 |

## 다음 읽기

- [02-dev-domain.md](02-dev-domain.md) — 브리지 이후 구현 단계
- [../20-user-guide/05-plan-pipeline.md](../20-user-guide/05-plan-pipeline.md) — 실제 사용 예시 (P4 예정)
