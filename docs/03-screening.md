# P2: RICE 스크리닝 + 승인 (`/plan-screen`)

## 개요

아이디어를 RICE 프레임워크(Reach, Impact, Confidence, Effort)로 정량 평가하여 Go/Hold/Kill을 **제안**하고, 사용자의 **명시적 승인**을 통해 상태를 전환하는 단계다. 스크리너 에이전트는 `screened` 상태까지만 설정하며, `approved`/`on-hold`/`rejected` 전환은 반드시 사용자 결정을 거친다. Lite/Standard 카테고리 판정도 이 단계에서 수행한다.

---

## 사용법

```
/plan-screen IDEA-20260325-001            # 특정 아이디어 단건 스크리닝
/plan-screen IDEA-20260325-001 --rescore  # 기존 스크리닝 재평가
/plan-screen --pending                    # 미스크리닝 아이디어 일괄 스크리닝
/plan-screen --pending --auto-approve     # 일괄 스크리닝 + Go 판정 자동 승인
```

| 입력 | 설명 |
|------|------|
| `IDEA-{ID}` | 특정 아이디어 단건 스크리닝 |
| `--rescore` | 기존 점수 재평가 (이력 보존) |
| `--pending` | `new` 상태 아이디어 일괄 스크리닝 |
| `--auto-approve` | Go 제안(70+) 아이디어를 Checkpoint 2 생략하고 자동 승인 (배치용) |

---

## RICE 스코어링

### 공식

```
RICE Score = (Reach x Impact x Confidence) / Effort / 100
```

Raw 값 `(R x I x C) / E`의 범위가 넓으므로 `/100`으로 정규화하여 0~10 범위로 변환한다.

### 각 요소 (1~10)

#### Reach (도달 범위)

| 점수 | 기준 |
|:----:|------|
| 1~2 | 특정 1명 또는 내부 관리자만 영향 |
| 3~4 | 소수 사용자 그룹 (특정 역할) |
| 5~6 | 다수 사용자 그룹 |
| 7~8 | 대부분의 활성 사용자 |
| 9~10 | 전체 사용자 또는 핵심 비즈니스 프로세스 |

#### Impact (영향도)

| 점수 | 기준 |
|:----:|------|
| 1~2 | 미미한 편의성 개선 |
| 3~4 | 체감 가능한 개선 (시간 절약 등) |
| 5~6 | 주요 워크플로우 개선 |
| 7~8 | 핵심 비즈니스 프로세스 개선 |
| 9~10 | 비즈니스 모델 수준의 변화 |

#### Confidence (신뢰도)

| 점수 | 기준 |
|:----:|------|
| 1~2 | 순수 추측 (데이터 없음) |
| 3~4 | 간접 근거 (유사 사례, 일반론) |
| 5~6 | 부분적 데이터 (일부 사용자 피드백) |
| 7~8 | 충분한 데이터 (다수 피드백, 로그 분석) |
| 9~10 | 확실한 근거 (정량 데이터, A/B 테스트) |

#### Effort (노력도)

| 점수 | 기준 |
|:----:|------|
| 1~2 | 1일 이내, 설정 변경 수준 |
| 3~4 | 1주 이내, 단일 컴포넌트 |
| 5~6 | 2~4주, 다수 컴포넌트 |
| 7~8 | 1~2개월, 아키텍처 변경 포함 |
| 9~10 | 3개월 이상, 대규모 리팩토링 |

### 결정 임계값

| 정규화 RICE 점수 | 결정 | 설명 |
|:----------------:|------|------|
| >= 5.0 | **Go** | P3 기능 기획 진행 추천 |
| 2.0 ~ 4.9 | **Hold** | 보류 추천 -- 추후 재검토 |
| < 2.0 | **Kill** | 반려 추천 -- 현재 시점에서 비효율적 |

예시: R=8, I=7, C=6, E=4 -> Raw = (8x7x6)/4 = 84 -> 정규화 = 84/100 = **8.4 (Go)**

---

## 워크플로우

```
/plan-screen [IDEA-ID | --pending]
       |
       v
+---------------------------------------+
|  plan-idea-screener (sonnet)          |
|                                       |
|  1. 00-inbox/에서 대상 IDEA 로드      |
|  2. IDEA 파일을 10-screening/으로 이동 |
|  3. 5축 RICE 평가 수행                |
|  4. Go/Hold/Kill 제안 도출            |
|  5. SCREENING 개별 파일 생성          |
|  6. screening-matrix.md 인덱스 갱신   |
|  7. 상태를 screened로 업데이트        |
+---------------------------------------+
       |
       v
+---------------------------------------+
|  Checkpoint 1 -- 점수 확인            |
|                                       |
|  "RICE 점수를 확인하세요."            |
|  -> 확인: 점수 유지                   |
|  -> 오버라이드: 수동 점수 입력        |
+---------------------------------------+
       |
       v
+---------------------------------------+
|  Checkpoint 2 -- 승인 결정 (핵심)     |
|                                       |
|  -> Approve: 20-approved/ + approved  |
|  -> Hold: 90-archive/ + on-hold       |
|  -> Reject: 90-archive/ + rejected    |
+---------------------------------------+
       |
       v
  PCC-01 검증 (Idea <-> Screen)
       |
       v
  .plans/ideas/10-screening/ (개별 파일)
  .plans/ideas/screening-matrix.md (인덱스)
```

### 상세 단계

1. **대상 로드**: `backlog.md` 인덱스에서 위치 확인 후 `00-inbox/`의 IDEA 파일 로드
2. **파일 이동**: IDEA 파일을 `00-inbox/` -> `10-screening/`으로 이동
3. **RICE 채점**: 각 요소(R, I, C, E)를 1~10으로 채점하고 1줄 근거 작성
4. **결정 제안**: 정규화 점수 기준 Go/Hold/Kill 제안 도출
5. **스크리닝 결과 생성**: `10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 파일 생성
6. **인덱스 갱신**: `screening-matrix.md` 테이블에 요약 행 추가
7. **상태 업데이트**: `backlog.md` 상태를 `screened`로 업데이트
8. **Checkpoint 1**: 사용자에게 점수 확인/오버라이드 기회 제공
9. **Checkpoint 2**: 승인/보류/반려 최종 결정 (사용자 명시적 승인)

---

## 승인 게이트 (핵심)

스크리너 에이전트는 `screened` 상태까지만 설정한다. 최종 상태 전환은 사용자 결정에 따른다.

| 사용자 결정 | 상태 전환 | 파일 이동 |
|------------|----------|----------|
| **Approve** | `screened` -> `approved` | `10-screening/` -> `20-approved/` |
| **Hold** | `screened` -> `on-hold` | `10-screening/` -> `90-archive/` |
| **Reject** | `screened` -> `rejected` | `10-screening/` -> `90-archive/` |

승인 게이트 UI:

```
+------------------------------------------------------+
|  승인 결정                                            |
|                                                       |
|  IDEA-20260320-001: Go   -> [Approve] [Hold] [Reject] |
|  IDEA-20260320-002: Hold -> [Approve] [Hold] [Reject] |
|  IDEA-20260322-001: Kill -> [Approve] [Hold] [Reject] |
|                                                       |
|  각 아이디어의 최종 결정을 선택하세요.                  |
+------------------------------------------------------+
```

`--auto-approve` 옵션 사용 시 Go 제안(70+) 아이디어는 Checkpoint 2를 생략하고 자동 승인된다. Hold/Kill 제안은 여전히 수동 결정이 필요하다.

---

## SCREENING 파일 형식

`10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 템플릿:

```markdown
# SCREENING-20260320-001

> IDEA: IDEA-20260320-001 -- 브로커별 정산 엑셀 내보내기

| 요소 | 점수 | 근거 |
|------|:----:|------|
| Reach | 8 | 전체 정산 담당자가 사용 |
| Impact | 7 | 수동 작업 시간 80% 절감 예상 |
| Confidence | 6 | 담당자 3명 피드백 기반 |
| Effort | 4 | 엑셀 라이브러리 + API 1개 |
| **RICE** | **8.4** | **(8 x 7 x 6) / 4 = 84 -> /100 = 8.4** |
| **제안** | **Go** | |

### 카테고리: Lite

### 리스크 분석
- 기술적: 엑셀 라이브러리 호환성 확인 필요
- 비즈니스: 정산 양식 변경 시 재작업 발생 가능
- 일정: 1주 이내 완료 가능
```

오버라이드 시 `(overridden)` 표시와 사유가 추가된다.

---

## screening-matrix.md 인덱스

`screening-matrix.md`는 **인덱스 테이블**로만 운용한다. 상세 채점은 개별 SCREENING 파일에 저장한다.

```markdown
# Screening Matrix

> 최종 갱신: 2026-03-25

## 요약

| 결정 | 건수 |
|------|:----:|
| Go (screened) | 2 |
| Hold | 1 |
| Kill | 1 |

## 인덱스

| IDEA ID | 제목 | RICE | 제안 | 상태 | 스크리닝 파일 |
|---------|------|:----:|------|------|--------------|
| IDEA-20260320-001 | 브로커별 정산 엑셀 내보내기 | 8.4 | Go | screened | SCREENING-20260320-001.md |
| IDEA-20260320-002 | 배차 화면 로딩 속도 개선 | 3.0 | Hold | screened | SCREENING-20260320-002.md |
| IDEA-20260322-001 | 실시간 알림 시스템 | 1.2 | Kill | screened | SCREENING-20260322-001.md |
```

---

## Lite/Standard 판정

다음 6개 트리거 중 **하나라도** 해당하면 Standard로 판정한다. 모두 해당하지 않으면 Lite.

| # | Standard 트리거 |
|---|----------------|
| 1 | 3개 이상 화면 변경 필요 |
| 2 | DB 스키마 변경 수반 |
| 3 | 외부 API 연동 필요 |
| 4 | 보안/인증 흐름 변경 |
| 5 | 2개 이상 도메인 영향 |
| 6 | 예상 구현 기간 1주 이상 |

Lite는 간소화된 기획(P3)으로, Standard는 전체 기획 프로세스를 거친다.

---

## PCC-01 검증

Idea <-> Screen 일관성 검증 항목:

| # | 검증 항목 | 심각도 |
|---|----------|--------|
| 1 | 모든 `screened` IDEA 파일이 `10-screening/`에 대응하는 SCREENING 파일을 가짐 | ERROR |
| 2 | Matrix 인덱스의 모든 IDEA ID가 실제 IDEA 파일로 존재 | ERROR |
| 3 | `approved` 상태 IDEA는 `20-approved/`에, `screened`는 `10-screening/`에 위치 | WARN |
| 4 | SCREENING 파일의 RICE 점수와 Matrix 인덱스의 점수가 일치 | WARN |

---

## plan-idea-screener 에이전트

| 항목 | 값 |
|------|-----|
| **모델** | sonnet |
| **역할** | RICE 채점 + Go/Hold/Kill **제안** 도출 (승인 불가) |
| **읽기 경로** | `.plans/ideas/00-inbox/IDEA-*.md`, `.plans/ideas/screening-matrix.md` |
| **쓰기 경로** | `.plans/ideas/10-screening/` (IDEA 이동 + SCREENING 생성), `screening-matrix.md` (인덱스) |
| **상태 전환** | `screened`까지만 -- `approved`/`rejected`/`on-hold` 설정 **금지** |
| **제한** | 코드 수정 금지, `10-screening/` 외 파일 생성 금지, 기존 스크리닝 결과 덮어쓰기 금지 |

5축 가중 평가 체계:

| 축 | 가중치 |
|---|--------|
| 비즈니스 가치 | 30% |
| 사용자 영향 | 25% |
| 기술적 실현성 | 20% |
| 전략적 정렬 | 15% |
| 긴급도 | 10% |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [P1: 아이디어 수집](./02-idea-collection.md) | 이전 단계 -- 백로그 입력 |
| [P3: 1차 기능 기획](./04-feature-draft.md) | 다음 단계 -- approved 아이디어 기획 |
| [Pipeline Overview](./01-pipeline-overview.md) | 파이프라인 전체 구조 |
| [plan-screen 커맨드](../src/plan/commands/plan-screen.md) | 커맨드 명세 |
| [plan-screening-workflow 스킬](../src/plan/skills/plan-screening-workflow/SKILL.md) | 스킬 상세 |
| [plan-idea-screener 에이전트](../src/plan/agents/plan-idea-screener.md) | 에이전트 명세 |
