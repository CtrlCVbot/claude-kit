<!-- kit-convert generated: 2026-04-16 -->
---
name: plan-review-criteria
description: >
  기획 산출물 리뷰 기준, 체크리스트, severity 분류, PCC 5종 검증 체크리스트. Use when: 기획 리뷰, 품질 검증, PCC 검증 시.
---

## Overview

기획 파이프라인 산출물의 품질 리뷰 기준을 정의합니다. 산출물별 체크리스트, 4축 평가 기준, severity 분류 체계, PCC 5종 일관성 검증 규칙을 포함합니다.

## Prerequisites

- 리뷰 대상 산출물이 생성되어 있을 것
- 관련 선행 산출물에 접근 가능할 것 (PCC 검증 시)

## 4축 평가 기준

| 축 | 평가 관점 | 등급 |
|---|---|---|
| 완전성 | 필수 항목 누락 여부, 정보 충분성 | A/B/C/D |
| 일관성 | 단계 간 정보 일치, 용어 통일 | A/B/C/D |
| 실현가능성 | 기술적/일정적 현실성, 리소스 적합성 | A/B/C/D |
| 사용자 중심성 | 사용자 스토리 명확성, UX 고려, 접근성 | A/B/C/D |

## 산출물별 체크리스트

### 아이디어 (5항목)
1. 제목이 명확하고 구체적
2. 카테고리가 적절히 분류됨
3. 배경/동기가 설명됨
4. 기대 효과가 기술됨
5. 관련 아이디어가 식별됨

### PRD (12항목)
1. 10개 섹션 모두 존재
2. 모든 요구사항에 REQ-ID 부여
3. User Story가 표준 형식(As a/I want/So that)
4. 비기능 요구사항 포함 (성능, 보안, 접근성, 국제화)
5. Success Metrics가 측정 가능
6. Risks에 대응 전략 포함
7. Non-Goals 명시
8. 기술적 제약과 의존성 식별
9. Milestones가 현실적
10. 용어 일관성
11. 내부 참조 일관성 (REQ ↔ Story ↔ Metrics)
12. 이전 단계 범위와 일치

### Wireframe (8항목)
1. PRD의 모든 주요 화면이 포함됨
2. 화면별 레이아웃 구조가 명확
3. 네비게이션 플로우가 완전
4. 컴포넌트 명세가 상세
5. 상태별 표현(default/error/empty 등)
6. 반응형 고려
7. PRD 요구사항 매핑
8. 접근성 고려

### Feature Package (15항목)
1. PRD ↔ Wireframe 매핑 완전
2. 모든 REQ-ID가 TASK-ID로 변환
3. TASK 간 의존관계 정의
4. 테스트 케이스 존재
5. 디자인 결정 문서화
6-15. (생략 - 상세는 plan-stitch-workflow 참조)

## Severity 분류

| Severity | 의미 | 행동 |
|---|---|---|
| CRITICAL | 진행 차단 — 필수 항목 누락/심각한 불일치 | 수정 필수, 재리뷰 필요 |
| HIGH | 수정 필요 — 주요 품질 이슈 | 수정 후 진행 가능 |
| MEDIUM | 권고 — 개선하면 좋은 항목 | 판단에 따라 수정 |
| LOW | 참고 — 사소한 개선 사항 | 기록만 |

## PCC 5종 검증

| PCC | 검증 | 시점 | 비교 대상 | 항목 수 |
|---|---|---|---|---|
| PCC-01 | Idea ↔ Screen | /plan-screen 후 | 모든 아이디어가 스크리닝됨 + 승인 상태 확인 | 4 |
| PCC-02 | Screen ↔ Feature | /plan-draft 후 | 승인 아이디어에 기획 존재 | 3 |
| PCC-03 | Feature ↔ PRD | /plan-prd 후 | 기획 범위가 PRD에 반영 | 5 |
| PCC-04 | PRD ↔ Wireframe | /plan-wireframe 후 | PRD 화면에 와이어프레임 존재 | 4 |
| PCC-05 | Wireframe ↔ Stitch | /plan-stitch 후 | 레이아웃이 디자인에 반영 | 3 |

### PCC 심각도

| 심각도 | 의미 | 행동 |
|---|---|---|
| ERROR | 필수 항목 누락/불일치 | 차단 — 수정 필수 |
| FLAG | 주요 불일치 (수동 확인 필요) | 경고 — 사람 확인 후 진행 |
| WARN | 경미한 불일치 | 기록 — 진행 가능 |
| PASS | 일치 확인됨 | 통과 |

## Output Format

- 리뷰 리포트: 콘솔 출력 (읽기 전용 에이전트)
- 판정: Approve / Revise / Reject

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/skills/plan-review-criteria/SKILL.md
