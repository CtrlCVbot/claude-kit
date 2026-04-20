---
name: plan-screening-workflow
description: >
  아이디어 스크리닝 기준, 평가 프레임워크(RICE/5축 가중), 점수 체계, Go/Hold/Kill 판정 로직, 폴더 이동 규칙, 승인 게이트. Use when: 아이디어 스크리닝, 우선순위 산정, RICE 또는 5축 평가 시.
---

## Overview

**두 가지 프레임워크**를 지원하는 아이디어 스크리닝 워크플로우:

1. **RICE** (Intercom 공식): Reach × Impact × Confidence / Effort → 단일 값
2. **5축 가중**: 비즈니스/사용자/기술/전략/긴급도 → 0-100 가중 합산

프레임워크는 `/plan-screen --framework {rice|5axis}`로 명시하거나 프로젝트 CLAUDE.md 기본값으로 결정됩니다. 자의적 전환 금지 — description과 실제 출력의 **silent drift 방지**가 핵심 원칙입니다. Go/Hold/Kill 판정 **제안** 및 Lite/Standard 카테고리 판정은 양 프레임워크 공통이며, 최종 승인은 사용자 명시적 확인 후 이루어집니다.

## Prerequisites

- 스크리닝 대상 아이디어가 `.plans/ideas/00-inbox/` 또는 `.plans/ideas/10-screening/`에 존재할 것
- 아이디어 상태가 `new` 또는 `screening`일 것

## Workflow Steps

1. **프레임워크 결정** (필수 선행):
   - `/plan-screen --framework rice|5axis` 인자 우선
   - 없으면 프로젝트 CLAUDE.md `idea-screening framework` 기본값 참조
   - 모두 없으면 `rice` 폴백 + 출력에 명시적 고지
2. **대상 선택**: 미스크리닝 아이디어 또는 재스크리닝 대상 식별
3. **파일 이동**: IDEA 파일을 `00-inbox/` → `10-screening/`으로 이동, 상태를 `screening`으로 전환
4. **프레임워크별 평가 수행** (선택된 프레임워크만 실행):

### 4A. RICE 프레임워크 (기본)

| 요소 | 값 범위 | 설명 |
|------|:-:|------|
| Reach | 1 ~ 5 (등급) | 분기당 영향받는 사용자/요청 수 |
| Impact | 0.25 / 0.5 / 1 / 2 / 3 | Minimal / Low / Medium / High / Massive |
| Confidence | 50 / 80 / 100 (%) | Low / Medium / High 확신도 |
| Effort | person-months | 개발 공수 추정 |

**계산**: `RICE = (Reach × Impact × Confidence) / Effort`

**판정**:
- Go (≥ 10.0): 실행 승인 제안
- Hold (2.0 ~ 10.0): 보류 제안
- Kill (< 2.0): 폐기 제안

출력 스키마: `src/claude/plan/_schemas/rice.schema.json`

### 4B. 5축 가중 프레임워크

| 축 | 가중치 | 평가 기준 |
|---|---|---|
| 비즈니스 가치 | 30% | 매출/비용/경쟁 우위 |
| 사용자 영향 | 25% | 사용자 수/빈도/만족도 |
| 기술적 실현성 | 20% | 난이도/의존성/인프라 |
| 전략적 정렬 | 15% | 비전/로드맵 적합성 |
| 긴급도 | 10% | 타이밍/규제/의존관계 |

**계산**: 각 축 0-100점 → 가중 합산 = 총점 (0-100)

**판정**:
- Go (70+): 실행 승인 제안
- Hold (40-69): 보류 제안
- Kill (< 40): 폐기 제안

출력 스키마: `src/claude/plan/_schemas/5axis.schema.json`

### 공통 후속 단계

5. **Lite/Standard 판정**: 6개 트리거 기준으로 기획 깊이 결정 (프레임워크 무관)
6. **개별 파일 생성**: `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 파일에 상세 결과 기록 (첫 줄에 framework 명시)
7. **상태 전환**: `backlog.md` 상태를 `screened`로 업데이트 (approved 아님)
8. **인덱스 업데이트**: `screening-matrix.md` 인덱스 테이블에 행 추가 (framework 컬럼 포함)
9. **승인 게이트** (Human Checkpoint):
    - 사용자에게 판정 제안 제시 → 승인/보류/반려 결정 요청
    - **승인** → IDEA + SCREENING 파일을 `10-screening/` → `20-approved/`로 이동, 상태 `approved`
    - **보류** → `10-screening/` → `90-archive/`로 이동, 상태 `on-hold`
    - **반려** → `10-screening/` → `90-archive/`로 이동, 상태 `rejected`
    - `backlog.md` 인덱스 위치 + 상태 컬럼 업데이트

## Lite/Standard 트리거

Standard로 판정되는 6개 트리거 (하나라도 해당 시):
1. 3개 이상 화면 변경 필요
2. DB 스키마 변경 수반
3. 외부 API 연동 필요
4. 보안/인증 흐름 변경
5. 2개 이상 도메인 영향
6. 예상 구현 기간 1주 이상

## screening-matrix 인덱스 예시

`framework` 컬럼을 포함한 표준 행 포맷:

```markdown
| IDEA | 제목 | 타입 | 상태 | 위치 | 생성일 | framework | 점수 | 판정 |
|------|------|------|------|------|--------|:-:|:-:|:-:|
| IDEA-20260420-001 | 대시보드 미리보기 Phase 3 | dev | screened | 10-screening | 2026-04-20 | rice | 12.8 | Go |
| IDEA-20260420-002 | 리포트 필터 개선 | dev | screened | 10-screening | 2026-04-20 | 5axis | 72.0 | Go |
```

- `framework`: `rice` 또는 `5axis` 값만 허용
- `점수`: RICE의 경우 `(R × I × C) / E` 소수점 한 자리, 5축의 경우 0-100 정수
- `판정`: `Go` / `Hold` / `Kill` (프레임워크별 임계값 적용)

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
