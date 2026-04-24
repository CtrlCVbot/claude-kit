---
name: plan-stitch-workflow
description: >
  PRD + Wireframe + HTML 통합 절차. 일관성 검증, 매핑, 변환 규칙 정의. Use when: 디자인 통합, Feature Package 생성, PRD-Wireframe 매핑 시.
---
<!-- kit:managed source=src/codex/plan/skills/plan-stitch-workflow/SKILL.md hash=34ae55cabfb2f68cc2f97aad57488574462d88d4d531b5e4dcccc92742426afc -->

## Overview

PRD와 Wireframe을 통합하여 Feature Package 컨텍스트를 생성하는 워크플로우를 정의합니다. 요구사항-화면 매핑 검증, 누락 탐지, 변환 추적(REQ-ID → TASK-ID)을 포함합니다.

## Prerequisites

- 승인된 PRD: `.plans/prd/10-approved/{slug}-prd.md`
- 와이어프레임: `.plans/wireframes/{slug}/`
- (선택) Stitch HTML 자산

## Workflow Steps

1. **PRD 분석**: 모든 REQ-ID와 기능 요구사항 추출
2. **Wireframe 분석**: 모든 SCR-ID와 화면 목록 추출
3. **매핑 생성**: REQ-ID ↔ SCR-ID 교차 매핑
4. **누락 탐지**:
   - PRD에 있지만 Wireframe에 없는 요구사항 (Missing Screen)
   - Wireframe에 있지만 PRD에 없는 화면 (Orphan Screen)
5. **Stitch HTML 통합** (있을 경우):
   - HTML 자산과 Wireframe 레이아웃 대조
   - 디자인 토큰 추출
6. **컨텍스트 문서 생성**: 개발 핸드오프용 통합 문서
7. **PCC-05 검증**: Wireframe ↔ Stitch 일관성

## 매핑 매트릭스 형식

```markdown
| REQ-ID | 요구사항 | SCR-ID | 화면명 | 상태 |
|---|---|---|---|---|
| REQ-feat-001 | 주문 목록 조회 | SCR-001 | 주문 목록 | Mapped |
| REQ-feat-002 | 주문 상세 보기 | SCR-002 | 주문 상세 | Mapped |
| REQ-feat-003 | 주문 내보내기 | - | - | Missing Screen |
```

## 통합 검증 항목

| 검증 | 내용 | 기준 |
|---|---|---|
| 매핑 완전성 | 모든 REQ-ID가 SCR-ID에 매핑 | 100% |
| 고아 화면 없음 | 모든 SCR-ID가 REQ-ID에 매핑 | 0개 |
| 레이아웃 일치 | Wireframe ↔ Stitch HTML 구조 | 주요 영역 일치 |

## 변환 추적

```
IDEA-{NNN} → REQ-{feat}-{seq} → SCR-{NNN} → TASK-{NNN}
```

각 단계의 ID가 추적 가능해야 하며, 변환 누락이 없어야 합니다.

## Output Format

- 디렉토리: `.plans/stitch/{slug}/`
- 파일:
  - `mapping.md` — REQ-ID ↔ SCR-ID 매핑
  - `context.md` — 개발 핸드오프 컨텍스트
  - `validation.md` — 통합 검증 결과

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/skills/plan-stitch-workflow/SKILL.md`
