---
name: plan-screening-workflow
description: >
  아이디어 스크리닝 기준, 평가 축, 점수 체계, Go/Hold/Kill 판정 로직, 폴더 이동 규칙, 승인 게이트. Use when: 아이디어 스크리닝, 우선순위 산정, RICE 평가 시.
---

## Overview

RICE 프레임워크 기반 아이디어 스크리닝 워크플로우를 정의합니다. 5개 평가 축으로 가중 점수를 산출하고, Go/Hold/Kill 판정 **제안** 및 Lite/Standard 카테고리 판정을 수행합니다. 최종 승인은 사용자 명시적 확인 후 이루어집니다.

## Prerequisites

- 스크리닝 대상 아이디어가 `.plans/ideas/00-inbox/` 또는 `.plans/ideas/10-screening/`에 존재할 것
- 아이디어 상태가 `new` 또는 `screening`일 것

## Workflow Steps

1. **대상 선택**: 미스크리닝 아이디어 또는 재스크리닝 대상 식별
2. **파일 이동**: IDEA 파일을 `00-inbox/` → `10-screening/`으로 이동, 상태를 `screening`으로 전환
3. **5축 평가 수행**:
   - 비즈니스 가치 (30%): 매출 영향, 비용 절감, 경쟁 우위
   - 사용자 영향 (25%): 영향 사용자 수, 사용 빈도, 만족도 개선
   - 기술적 실현성 (20%): 기술 난이도, 의존성, 기존 인프라 활용도
   - 전략적 정렬 (15%): 제품 비전 적합성, 로드맵 정렬
   - 긴급도 (10%): 시장 타이밍, 규제 대응, 의존 관계
4. **가중 합산**: 0-100점 산출
5. **판정 제안**:
   - Go (70+): 실행 승인 제안
   - Hold (40-69): 보류 제안 (조건 충족 시 재평가)
   - Kill (<40): 폐기 제안
6. **Lite/Standard 판정**: 6개 트리거 기준으로 기획 깊이 결정
7. **개별 파일 생성**: `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 파일에 상세 결과 기록
8. **상태 전환**: `backlog.md` 상태를 `screened`로 업데이트 (approved 아님)
9. **인덱스 업데이트**: `screening-matrix.md` 인덱스 테이블에 행 추가
10. **승인 게이트** (Human Checkpoint):
    - 사용자에게 판정 제안 제시 → 승인/보류/반려 결정 요청
    - **승인** → IDEA + SCREENING 파일을 `10-screening/` → `20-approved/`로 이동, 상태 `approved`
    - **보류** → `10-screening/` → `90-archive/`로 이동, 상태 `on-hold`
    - **반려** → `10-screening/` → `90-archive/`로 이동, 상태 `rejected`
    - `backlog.md` 인덱스 위치 + 상태 컬럼 업데이트

## 점수 체계

| 축 | 가중치 | 평가 기준 |
|---|---|---|
| 비즈니스 가치 | 30% | 매출/비용/경쟁 우위 |
| 사용자 영향 | 25% | 사용자 수/빈도/만족도 |
| 기술적 실현성 | 20% | 난이도/의존성/인프라 |
| 전략적 정렬 | 15% | 비전/로드맵 적합성 |
| 긴급도 | 10% | 타이밍/규제/의존관계 |

## Lite/Standard 트리거

Standard로 판정되는 6개 트리거 (하나라도 해당 시):
1. 3개 이상 화면 변경 필요
2. DB 스키마 변경 수반
3. 외부 API 연동 필요
4. 보안/인증 흐름 변경
5. 2개 이상 도메인 영향
6. 예상 구현 기간 1주 이상

## Archived 상태 처리

`screening-matrix.md`에서 상태가 `archived`인 항목은:
- 스크리닝 대상에서 제외
- 조회 시 별도 "Archived" 섹션에 표시
- 파일 링크는 아카이브 번들 경로를 가리킴

`/plan-archive` 실행 시 `screening-matrix.md`의 해당 항목 경로가 자동으로 아카이브 경로로 갱신된다.

## Output Format

- 개별 파일: `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md`
- 인덱스: `.plans/ideas/screening-matrix.md`
- 판정: Go / Hold / Kill + 근거 (**제안** — 사용자 승인 필요)
- 카테고리: Lite / Standard
