# 05. Domain: plan (34 entries)

> **plan 도메인은 기획 파이프라인(IDEA → PRD → Feature Package)의 구현체.** Epic / Feature / Task 3단 계층과 와이어프레임 · 디자인 통합 기능을 제공한다.

## 요약

| 항목 | 값 |
|------|---|
| pairing entries | 34 (전원 paired) |
| codex 물리 파일 수 | 34 + `_constants/` 2 + `_schemas/` 5 + `_templates/` 6 + `boundary/` 1 + JS 헬퍼 3 + `package.json` 1 + `.gitkeep` 1 = **53 파일** |
| REVIEW NEEDED marker | **8 파일** (모두 write-capable agent) |
| 관련 exception | 없음 |

## 타입별 집계

| 타입 | paired | 비고 |
|------|:---:|-----|
| agent | 9 | write-capable 8 (plan-reviewer 제외) + Read-only 1 |
| command | 11 | `/plan-*` 계열 |
| hook | 3 | doc-guard / idea-move-guard / review-trigger |
| rule | 2 | plan-epic-hierarchy (SSOT), rice-lane-weighted-adjustment |
| skill | 9 | pipeline + 단계별 워크플로우 |
| **합계** | **34** | |

## Agents (9)

| Identity | Status | Hash | REVIEW | 비고 |
|----------|:---:|---|:---:|------|
| [plan-bridge-writer](../../../src/codex/plan/agents/plan-bridge-writer.md) | ✓ | `726f3f89` | 🔶 wc | PRD → Feature Package 브리지 작성 |
| [plan-design-writer](../../../src/codex/plan/agents/plan-design-writer.md) | ✓ | `876824c7` | 🔶 wc | Claude Design 2단계 프롬프트 작성 |
| [plan-draft-writer](../../../src/codex/plan/agents/plan-draft-writer.md) | ✓ | `165c81b9` | 🔶 wc | IDEA → 1차 기능 기획 (Lite / Standard 판정) |
| [plan-idea-collector](../../../src/codex/plan/agents/plan-idea-collector.md) | ✓ | `a8eac39f` | 🔶 wc | IDEA 수집 (inbox 생성) |
| [plan-idea-screener](../../../src/codex/plan/agents/plan-idea-screener.md) | ✓ | `ad374bb4` | 🔶 wc | RICE 스크리닝 |
| [plan-prd-writer](../../../src/codex/plan/agents/plan-prd-writer.md) | ✓ | `882ba4c5` | 🔶 wc | Standard PRD 상세 작성 |
| [plan-reviewer](../../../src/codex/plan/agents/plan-reviewer.md) | ✓ | `9a6d8879` | — | **Read-only** (PCC 검증) |
| [plan-stitch-integrator](../../../src/codex/plan/agents/plan-stitch-integrator.md) | ✓ | `7ca415ad` | 🔶 wc | Stitch 디자인 시안 통합 |
| [plan-wireframe-designer](../../../src/codex/plan/agents/plan-wireframe-designer.md) | ✓ | `f87c86a9` | 🔶 wc | 와이어프레임 구조 작성 |

🔶 wc = write-capable agent. plan 도메인은 writer 계열이라 대부분 write-capable.

**plan 도메인 유틸 JS 파일 (pairing 외)**:
- `plan-dev-gate.js` (dev 게이트 체크)
- `plan-idea-screener-rescoring.js` (스크리닝 재계산)
- `plan-wireframe-checklist.js` (와이어프레임 체크리스트)

## Commands (11)

| Identity | Hash | 비고 |
|----------|---|------|
| [plan-idea](../../../src/codex/plan/commands/plan-idea.md) | `9168ca75` | IDEA 수집 |
| [plan-screen](../../../src/codex/plan/commands/plan-screen.md) | `fe2e0bad` | RICE 스크리닝 |
| [plan-draft](../../../src/codex/plan/commands/plan-draft.md) | `d3879dae` | 1차 기능 기획 |
| [plan-prd](../../../src/codex/plan/commands/plan-prd.md) | `1f8b66d3` | Standard PRD 작성 |
| [plan-wireframe](../../../src/codex/plan/commands/plan-wireframe.md) | `132e8763` | 와이어프레임 구조 |
| [plan-design](../../../src/codex/plan/commands/plan-design.md) | `e3eaf479` | Claude Design 2단계 |
| [plan-stitch](../../../src/codex/plan/commands/plan-stitch.md) | `6e115458` | Stitch 시안 통합 |
| [plan-bridge](../../../src/codex/plan/commands/plan-bridge.md) | `8b4fe53f` | 개발 핸드오프 |
| [plan-archive](../../../src/codex/plan/commands/plan-archive.md) | `a89a6f98` | 완료 기능 번들화 |
| [plan-review](../../../src/codex/plan/commands/plan-review.md) | `7d36fd31` | PCC 리뷰 |
| [plan-improve](../../../src/codex/plan/commands/plan-improve.md) | `bcdde39e` | 파이프라인 개선 |

**누락 주의**: `/plan-epic` 커맨드는 v2.4.0 에서 추가되었지만 현재 pairing-registry 에 없음 — Codex 측 최신화 대상 여부 별도 확인 필요.

## Hooks (3)

| Identity | Hash | 비고 |
|----------|---|------|
| [plan-doc-guard](../../../src/codex/plan/hooks/plan-doc-guard.js) | `9220939b` | 기획 문서 무결성 검증 (Edit / Write 전 게이트) |
| [plan-idea-move-guard](../../../src/codex/plan/hooks/plan-idea-move-guard.js) | `567ca36d` | IDEA 상태 전환 이동 가드 |
| [plan-review-trigger](../../../src/codex/plan/hooks/plan-review-trigger.js) | `2a11809e` | PCC 리뷰 자동 트리거 |

## Rules (2)

| Identity | Hash | 비고 |
|----------|---|------|
| [plan-epic-hierarchy](../../../src/codex/plan/rules/plan-epic-hierarchy.md) | `814c5ade` | Epic / Feature / Task 3단 계층 SSOT (v2.4.0) |
| [rice-lane-weighted-adjustment](../../../src/codex/plan/rules/rice-lane-weighted-adjustment.md) | `c6d9efb2` | RICE Lane 가중 조정 SSOT (T-RICE-01) |

## Skills (9)

| Identity | Hash | 비고 |
|----------|---|------|
| [plan-pipeline](../../../src/codex/plan/skills/plan-pipeline/SKILL.md) | `2b6afbd6` | 전체 plan 파이프라인 오케스트레이션 |
| [plan-idea-management](../../../src/codex/plan/skills/plan-idea-management/SKILL.md) | `27ec8491` | IDEA 수집 / 분류 |
| [plan-screening-workflow](../../../src/codex/plan/skills/plan-screening-workflow/SKILL.md) | `03e7de2c` | RICE 스크리닝 워크플로우 |
| [plan-prd-authoring](../../../src/codex/plan/skills/plan-prd-authoring/SKILL.md) | `84bbb789` | PRD 작성 워크플로우 |
| [plan-wireframe-design](../../../src/codex/plan/skills/plan-wireframe-design/SKILL.md) | `5958450b` | 와이어프레임 설계 |
| [claude-design-workflow](../../../src/codex/plan/skills/claude-design-workflow/SKILL.md) | `d8fc24bd` | Claude Design 워크플로우 |
| [plan-stitch-workflow](../../../src/codex/plan/skills/plan-stitch-workflow/SKILL.md) | `f19889ff` | Stitch 통합 워크플로우 |
| [plan-archive-workflow](../../../src/codex/plan/skills/plan-archive-workflow/SKILL.md) | `d235e50e` | Archive 워크플로우 |
| [plan-review-criteria](../../../src/codex/plan/skills/plan-review-criteria/SKILL.md) | `4f83e770` | PCC 리뷰 기준 |

## 유틸리티 (pairing-registry 외)

| 경로 | 파일 수 | 설명 |
|------|:---:|------|
| `src/codex/plan/_constants/` | 2 | idea-folders.json, pii-masking-rules.json |
| `src/codex/plan/_schemas/` | 5 | 5axis / rescoring-log-entry / rice / routing-metadata / handoff-contract 스키마 |
| `src/codex/plan/_templates/` | 6 | decision-log / design-manifest / design-prompt-highfidelity / design-prompt-wireframe / dev-gate-checklist / rescoring-log-entry 템플릿 |
| `src/codex/plan/boundary/bridge-phase-a.js` | 1 | Bridge Phase A 경계 로직 |
| `src/codex/plan/hooks/package.json` | 1 | hooks Node 모듈 마커 |

## 변환 시 주의사항

- **write-capable agent 8개**: Codex runtime 에서 파일 생성 · 편집 권한이 정확히 일치하는지 확인. 특히 plan-bridge-writer 는 Feature Package 생성에 핵심.
- **plan-reviewer 만 Read-only**: PCC 검증용이라 Write 도구 없음. REVIEW NEEDED marker 없는 유일한 plan agent.
- **`/plan-epic` 커맨드 미등록**: v2.4.0 신규 기능으로 `src/claude/plan/commands/plan-epic.md` 는 존재하지만 pairing-registry 에 entry 없음. 향후 Codex 버전도 필요한지 별도 결정.
- **hooks 의 조건부 동작**: plan-doc-guard 는 `.plans/` 경로 편집 시에만 트리거. Codex 에서 동일 경로 체계가 유지되는지 확인.

## Claude 원본과의 비교

모든 34 entries 가 1:1 대응:

```
Claude:  src/claude/plan/{type}/{name}{.md|.js}
Codex:   src/codex/plan/{type}/{name}{.md|.js}
```

## 참조

- [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) — write-capable agent 8개 상세 검토 가이드
