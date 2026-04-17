# plan Domain

> **Status**: Draft (P4, 2026-04-17)
> **Source**: `src/claude/plan/`, [../30-reference/01-commands.md](../30-reference/01-commands.md), [../30-reference/02-agents.md](../30-reference/02-agents.md)
> **Related**: [02-dev-domain.md](02-dev-domain.md), [../20-user-guide/05-plan-pipeline.md](../20-user-guide/05-plan-pipeline.md)

`plan` 도메인은 **아이디어 수집 → 스크리닝 → 상세 기획 → 개발 브리지** 까지의 기획 파이프라인입니다. PRD 가 아직 없는 단계부터 시작합니다.

`profile.json` 에서 `"domains": ["core", "dev", "plan"]` 로 opt-in.

## 파이프라인 단계

```
아이디어 → /plan-idea        → .plans/ideas/00-inbox/{IDEA-ID}.md
아이디어 → /plan-screen       → RICE 스크리닝 + ★ 승인 게이트 ★
(승인)   → /plan-draft       → 1차 기획 (Lite/Standard 판정)
Standard → /plan-prd         → 상세 PRD (plan-prd-writer)
(옵션)   → /plan-wireframe   → 와이어프레임
          → /plan-stitch      → 디자인 시안 통합
 완성    → /plan-bridge      → 개발 핸드오프 (dev 도메인으로)
 완료    → /plan-archive     → 번들화 + 아카이빙
          → /plan-improve    → 회고·개선 제안
```

## 승인 게이트

**가장 중요**: `/plan-screen` 이후 `/plan-draft` 로 넘어가려면 사용자의 **명시적 승인** 이 있어야 합니다. 자동 전진 금지.

`plan-doc-guard.js` 훅 (PreToolUse) 이 계획 문서 무결성을 검증합니다.

## 커맨드 목록

| Command | 단계 | 역할 |
|---------|------|------|
| [`/plan-idea "아이디어"`](../../src/claude/plan/commands/plan-idea.md) | 수집 | `.plans/ideas/00-inbox/` 에 아이디어 문서 생성 |
| [`/plan-screen <IDEA-ID>`](../../src/claude/plan/commands/plan-screen.md) | 스크리닝 | RICE 점수·우선순위 평가, 승인 게이트 |
| [`/plan-draft <IDEA-ID>`](../../src/claude/plan/commands/plan-draft.md) | 초안 | 1차 기능 기획, Lite/Standard 판정 |
| [`/plan-prd <draft-path>`](../../src/claude/plan/commands/plan-prd.md) | PRD | Standard 기능 상세 PRD 작성 |
| [`/plan-wireframe`](../../src/claude/plan/commands/plan-wireframe.md) | 디자인 | 와이어프레임 |
| [`/plan-stitch`](../../src/claude/plan/commands/plan-stitch.md) | 디자인 | 디자인 시안 통합 |
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
| [`plan-stitch-integrator`](../../src/claude/plan/agents/plan-stitch-integrator.md) | 디자인 시안 통합 |

## 스킬

| 스킬 | 역할 |
|------|------|
| [`plan-idea-management`](../../src/claude/plan/skills/plan-idea-management/SKILL.md) | 아이디어 수집·조직화 |
| [`plan-screening-workflow`](../../src/claude/plan/skills/plan-screening-workflow/SKILL.md) | 스크리닝 절차 |
| [`plan-review-criteria`](../../src/claude/plan/skills/plan-review-criteria/SKILL.md) | 리뷰 기준 |
| [`plan-prd-authoring`](../../src/claude/plan/skills/plan-prd-authoring/SKILL.md) | PRD 작성 가이드 |
| [`plan-wireframe-design`](../../src/claude/plan/skills/plan-wireframe-design/SKILL.md) | 와이어프레임 패턴 |
| [`plan-stitch-workflow`](../../src/claude/plan/skills/plan-stitch-workflow/SKILL.md) | 시안 통합 |
| [`plan-archive-workflow`](../../src/claude/plan/skills/plan-archive-workflow/SKILL.md) | 아카이빙 절차 |

## 디렉터리 산출물

| 경로 | 내용 |
|------|------|
| `.plans/ideas/00-inbox/` | 수집된 아이디어 |
| `.plans/ideas/10-screened/` | 스크리닝 통과한 아이디어 |
| `.plans/prd/` | Standard 기능 PRD |
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
