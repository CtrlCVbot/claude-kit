<!-- kit-convert generated: 2026-04-24 -->
---
name: plan-prd-authoring
description: >
  PRD 작성 표준, 10개 필수 섹션, 품질 기준, 이해관계자 리뷰 체크리스트. Use when: PRD 작성, PRD 리뷰, PRD 품질 검증 시.
---

## Overview

PRD(Product Requirements Document) 작성 표준을 정의합니다. 10개 필수 섹션 구조, 요구사항 ID 체계, 품질 기준, 리뷰 체크리스트를 포함합니다.

## Prerequisites

- First-Pass 문서 또는 승인된 Feature Overview가 존재할 것
- 프로젝트 컨텍스트(CLAUDE.md, 아키텍처 문서)에 접근 가능할 것

## 10개 필수 섹션

| # | 섹션 | 필수 내용 |
|---|------|----------|
| 1 | Overview | 기능 개요 1-2단락 |
| 2 | Problem Statement | 현재 문제, 영향, 근거 데이터 |
| 3 | Goals & Non-Goals | 명확한 범위 설정 |
| 4 | User Stories | As a / I want / So that 형식 |
| 5 | Functional Requirements | REQ-ID 기반, 수용 기준 포함 |
| 6 | UX Requirements | 화면 흐름, 인터랙션, 접근성 |
| 7 | Technical Considerations | 기술적 제약, 의존성, 아키텍처 영향 |
| 8 | Milestones | 단계별 전달 범위, 예상 기간 |
| 9 | Risks & Mitigations | 리스크 식별, 영향, 확률, 대응 |
| 10 | Success Metrics | 측정 가능한 지표, 목표값, 측정 방법 |

## 요구사항 ID 체계

```
REQ-{feature-slug}-{seq}
예: REQ-order-export-001, REQ-order-export-002
```

- feature-slug: 기능명의 kebab-case
- seq: 3자리 순차 번호 (001, 002, ...)
- 우선순위: Must / Should / Could / Won't (MoSCoW)

## 품질 기준

### 요구사항 품질 체크리스트
- [ ] 테스트 가능한가? (모호한 표현 없음)
- [ ] 측정 가능한 수용 기준이 있는가?
- [ ] 구현 세부사항이 아닌 "무엇을"을 기술하는가?
- [ ] 우선순위가 명시되어 있는가?
- [ ] 의존관계가 식별되어 있는가?

### PRD 전체 품질 체크리스트 (12항목)
1. 10개 섹션 모두 존재
2. 모든 요구사항에 REQ-ID 부여
3. User Story가 표준 형식 준수
4. 비기능 요구사항(성능, 보안, 접근성, 국제화) 포함
5. Success Metrics가 측정 가능
6. Risks에 대응 전략 포함
7. Non-Goals가 명시적으로 정의
8. 기술적 제약과 의존성 식별
9. Milestones가 현실적
10. 용어/약어가 일관적
11. 내부 참조(REQ-ID ↔ User Story ↔ Metrics)가 일관적
12. 이전 단계(First-Pass) 범위와 일치

## Output Format

- 파일 위치: `.plans/prd/00-draft/{slug}-prd.md`
- 승인 후: `.plans/prd/10-approved/{slug}-prd.md`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/skills/plan-prd-authoring/SKILL.md`
