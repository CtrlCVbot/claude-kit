---
name: plan-pipeline
description: >
  전체 P1~P7 기획 파이프라인 오케스트레이션. Idea → Screen → Draft → PRD → Wireframe → Stitch → Bridge 흐름. Use when: 기획 파이프라인 실행, 전체 기획 프로세스 관리 시.
---

## Overview

아이디어 발굴부터 개발 핸드오프까지의 End-to-End 기획 파이프라인을 오케스트레이션합니다. 7단계 파이프라인, 리뷰 루프, PCC 5종 일관성 검증을 포함합니다.

## Prerequisites

- `.plans/` 디렉토리 구조가 초기화되어 있을 것
- plan 도메인이 `profile.json`에서 활성화되어 있을 것

## Pipeline Architecture

```
/plan-idea(P1) → /plan-screen(P2) → /plan-draft(P3) → /plan-prd(P4)
                                                              │
                                                              ▼
/plan-bridge(P7) ← /plan-stitch(P6) ← /plan-wireframe(P5)
       │
       ▼
  Phase A~E (개발 워크플로우)
```

## Workflow Steps

### P1: 아이디어 수집 (/plan-idea)
- 입력: 자연어, 메모, 파일
- 출력: `.plans/ideas/backlog.md` (IDEA-{NNN})
- 에이전트: plan-idea-collector (sonnet)

### P2: RICE 스크리닝 (/plan-screen)
- 입력: Backlog / IDEA ID
- 출력: `.plans/ideas/screening-matrix.md`
- 에이전트: plan-idea-screener (sonnet)
- Human Checkpoint: 점수 확인/오버라이드

### P3: 1차 기능 기획 (/plan-draft)
- 입력: 승인된 IDEA ID
- 출력: `.plans/features/drafts/{slug}/first-pass.md` 또는 `.plans/features/active/{slug}.md`
- 분기: Lite → 파이프라인 종료 가능, Standard → P4로 진행
- Human Checkpoint: Scope 확인

### P4: PRD 상세 작성 (/plan-prd)
- 입력: First-pass 문서
- 출력: `.plans/prd/00-draft/` → `10-approved/`
- 에이전트: plan-prd-writer (opus)
- Human Checkpoint: 승인/수정/반려

### P5: 와이어프레임 (/plan-wireframe)
- 입력: 승인된 PRD
- 출력: `.plans/wireframes/{slug}/`
- 에이전트: plan-wireframe-designer (opus)
- 자동 리뷰 포함

### P6: Stitch 통합 (/plan-stitch)
- 입력: PRD + Wireframe
- 출력: `.plans/stitch/{slug}/`
- 에이전트: plan-stitch-integrator (sonnet)
- Human Checkpoint: Stitch 확인

### P7: 기획→개발 핸드오프 (/plan-bridge)
- 입력: PRD + Wireframe + Stitch
- 출력: Bridge context 파일들
- 연결: `/dev-feature` (Phase A~E)

## Review Loop

모든 단계에서 `/plan-review`가 산출물 품질을 검증합니다.

```
산출물 생성 → /plan-review → PASS → 다음 단계
                  │
                  ├── WARN → 경고 표시 후 진행 가능
                  └── FAIL → 수정 → 재생성 → /plan-review (반복)
```

- P4, P5 완료 시 자동으로 `/plan-review` 호출
- 수동 호출: `/plan-review <path> --type={stage}`

## 상태 추적

`.plans/pipeline-status.json`에 각 Feature의 파이프라인 진행 상태를 기록합니다.

```json
{
  "feature-slug": {
    "currentStage": "P4",
    "stages": {
      "P1": { "status": "done", "completedAt": "2026-03-25" },
      "P2": { "status": "done", "completedAt": "2026-03-25" },
      "P3": { "status": "done", "completedAt": "2026-03-25" },
      "P4": { "status": "in-progress" }
    }
  }
}
```

## Output Format

- 상태 파일: `.plans/pipeline-status.json`
- 각 단계별 산출물은 해당 스킬/커맨드 참조
