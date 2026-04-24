<!-- kit-convert generated: 2026-04-24 -->
---
name: copy-gap-analysis
description: visual/interaction 갭 분석 워크플로우 가이드
---

# Gap Analysis

디자인과 구현 사이의 시각적(VF) 및 인터랙션(IF) 차이를 체계적으로 식별하고 분류하는 워크플로우이다.

## 갭 행(Row) 생성

### VF-* (Visual Fidelity) 행

시각적 차이를 기록한다. 각 행은 하나의 시각적 불일치를 나타낸다.

- **ID 형식**: `VF-{순번}` (예: VF-001, VF-002)
- **기록 항목**: 컴포넌트, 뷰포트, 디자인 값, 구현 값, 차이 설명
- **대상**: 색상, 타이포그래피, 간격, 정렬, 크기, 그림자, 테두리, 반응형 레이아웃

### IF-* (Interaction Fidelity) 행

인터랙션 차이를 기록한다. 각 행은 하나의 동작 불일치를 나타낸다.

- **ID 형식**: `IF-{순번}` (예: IF-001, IF-002)
- **기록 항목**: 컴포넌트, 트리거, 기대 동작, 실제 동작, 차이 설명
- **대상**: hover, focus, click, 애니메이션, 전환, 스크롤, 키보드 인터랙션

## 우선순위 분류

| 등급 | 기준 | 예시 |
|---|---|---|
| P0 | 기능 차단 또는 심각한 시각 오류 | 버튼 클릭 불가, 텍스트 잘림 |
| P1 | 명확한 차이, 사용자 경험 영향 | 색상 불일치, 간격 오차 8px 이상 |
| P2 | 미세한 차이, 낮은 영향 | 그림자 미세 차이, 1px 정렬 |

## Gap Board 구성

모든 VF-*/IF-* 행을 하나의 Gap Board에 집계한다.

- **열**: ID, 유형(VF/IF), 컴포넌트, 우선순위, 상태, 담당
- **상태 흐름**: `open` → `in-progress` → `fixed` → `verified`
- P0은 즉시 dev 도메인에 fix 요청 전달

## 병렬 실행

시각(VF)과 인터랙션(IF) 리뷰는 독립 작업이므로 병렬 수행한다.

1. **Visual 리뷰어**: evidence 쌍을 비교하여 VF-* 행 생성
2. **Interaction 리뷰어**: 인터랙션 evidence를 비교하여 IF-* 행 생성
3. **통합**: 두 결과를 Gap Board에 병합, 중복 제거

## 참조

- Evidence 입력: `copy-evidence-management` 스킬
- QA 검증 입력: `copy-qa-workflow` 스킬
- 파이프라인 전체 흐름: `copy-pipeline` 스킬

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/copy/skills/copy-gap-analysis/SKILL.md`
