---
제목: 07 Boundary & Contradictions — 선행 패키지 모순 공식 해소
작성일: 2026-04-21
대상: 메인테이너, 릴리스 책임자
연관 로드맵: `../kit-2.2.0-roadmap/` · `../kit-feedback-archiving/`
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# 07 Boundary & Contradictions

> **결론**: 선행 두 패키지([kit-2.2.0-roadmap](../kit-2.2.0-roadmap/), [kit-feedback-archiving](../kit-feedback-archiving/)) 사이에서 발견된 **3건의 모순**을 공식 해소한다. IMP-KIT-007의 구현 시점, `/plan-review` 자동 후속 주소권, P1 11건 내부 우선순위. 본 문서가 **단일 해소 SSOT**이며, 향후 패키지 간 참조 규약도 여기에서 공식화한다.

---

## 1. 모순 발견 경위

본 2.3.0 로드맵 집필 전 탐색(Session 1 Phase 1)에서 두 선행 패키지의 차이를 대조한 결과, 아래 3건이 **같은 주제에 대해 상이한 진술**을 담고 있음이 확인됐다.

| # | 주제 | 선행 패키지 A 진술 | 선행 패키지 B 진술 |
|:-:|------|-------------------|-------------------|
| ① | IMP-KIT-007 구현 시점 | kit-2.2.0-roadmap `02-roadmap §3` — "Phase 2.1(2.3.0) 실행" | kit-feedback-archiving `README.md §Phase별 진행` — "Phase 3(2.3.0+) 구현 예정" |
| ② | `/plan-review` 자동 후속 주소권 | kit-2.2.0-roadmap `04-p1-backlog-summary §4` — P1 백로그 항목 | kit-feedback-archiving `00-executive-summary §6` — 아카이빙 시스템의 **메인 트리거** |
| ③ | P1 11건 내부 우선순위 | kit-2.2.0-roadmap `02-roadmap §3` — Phase 2.1/2.2/2.3 3그룹만 | 개별 RICE 점수는 `04-p1-backlog-summary`에 있으나 **실행 순서 미배정** |

---

## 2. 모순 ① — IMP-KIT-007 구현 시점

### 2.1 해소 원칙

IMP-KIT-007은 **두 구성 요소**로 분해되며, 각각 별도 시점에 구현된다.

| 구성 요소 | 구현 시점 | 담당 SSOT |
|-----------|:---------:|----------|
| **트리거 부분** (`/plan-prd`·`/plan-draft`·`/plan-wireframe` 종료 시 `/plan-review` 자동 실행) | **2.3.0 Phase 2.1** | 본 로드맵 [`02-p1-execution-plan.md`](02-p1-execution-plan.md) |
| **수집 로직** (feedback-collector 훅이 엔트리 JSON 생성·아카이빙) | **2.3.0+ (Phase 3~5)** | [kit-feedback-archiving](../kit-feedback-archiving/) 전체 |

### 2.2 진입 조건

- **2.3.0 Phase 2.1**에 트리거 훅이 먼저 도입된다. 수집 로직 부재 시 **no-op** 동작으로 시작.
- 2.3.0+ Phase 3에서 kit-feedback-archiving의 훅 스크립트가 추가되면 기존 트리거 지점에 **체이닝**된다.

### 2.3 릴리스 노트 반영

본 로드맵 [`06-release-notes-2.3.0-skeleton.md`](06-release-notes-2.3.0-skeleton.md)의 "포함/미포함" 섹션에 다음 문장 필수:

> IMP-KIT-007의 **트리거 부분만** 2.3.0에 포함. 피드백 아카이빙 시스템의 **수집 로직**은 2.3.0+ (kit-feedback-archiving Phase 3~5)에서 추가된다.

---

## 3. 모순 ② — `/plan-review` 자동 후속 주소권

### 3.1 해소 원칙

`/plan-review` 자동 후속 트리거의 **설계·구현 SSOT**는 본 로드맵이며, kit-feedback-archiving은 **consumer**(소비자) 위치에 선다.

| 역할 | 담당 패키지 | 근거 |
|------|-------------|------|
| **Producer** (트리거 설계·구현) | **본 로드맵** (IMP-KIT-007 spec → `02-p1-execution-plan.md` §Phase 2.1) | P1 백로그 원천이 kit-2.2.0-roadmap |
| **Consumer** (트리거 위에 수집 로직 덧붙이기) | kit-feedback-archiving (Phase 3 훅) | 아카이빙 시스템의 **입력 이벤트** |

### 3.2 용어 정정

kit-feedback-archiving `00-executive-summary §6`의 "`/plan-review` 자동 후속 = **메인 트리거 지점**" 표현은 **"아카이빙 시스템이 소비하는 주요 이벤트 소스"** 의미로 재해석한다. 향후 kit-feedback-archiving 업데이트 시 해당 문장을 다음으로 교체 권장:

> `/plan-review` 자동 후속 트리거 — 본 시스템의 **주요 이벤트 소스**. 트리거 자체의 구현 SSOT는 kit-2.3.0-roadmap.

> **주의**: 본 로드맵은 kit-feedback-archiving 파일을 수정하지 않는다 (본 패키지 Out of Scope 원칙). 교체 작업은 별도 PR.

### 3.3 참조 링크 규약

- 본 로드맵 `04-feedback-archiving-integration.md`가 "IMP-KIT-007의 consumer" 관점에서 **한 방향 참조**만 갖는다.
- kit-feedback-archiving → 본 로드맵 역참조는 차기 Phase 3 착수 시점에 추가 (현재 작업 범위 외).

---

## 4. 모순 ③ — P1 11건 내부 우선순위

### 4.1 해소 원칙

P1 11건의 **실행 순서 SSOT**는 본 로드맵 [`02-p1-execution-plan.md`](02-p1-execution-plan.md) §2 "RICE 재정렬표"다. 3그룹(Phase 2.1/2.2/2.3) 분류는 kit-2.2.0-roadmap에서 계승하되, **그룹 내 순서는 RICE 점수 내림차순**으로 확정한다.

### 4.2 확정된 순서 (RICE 기반)

| Phase | 순서 | ID | 제목 | RICE |
|:-----:|:----:|----|------|:----:|
| 2.1 | 1 | IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 24 |
| 2.1 | 2 | IMP-KIT-016 | Checkpoint 자동 진행 플래그 | 22.5 |
| 2.1 | 3 | IMP-KIT-017 | 재복제 금지 Skill 수준 강제 | 18 |
| 2.2 | 1 | IMP-KIT-009 | screener 파일 이동 권한 확장 | **45** |
| 2.2 | 2 | IMP-KIT-008 | screener 재판정 메모리 기록 | 36 |
| 2.2 | 3 | IMP-KIT-010 | wireframe-designer 체크리스트 확장 | 36 |
| 2.2 | 4 | IMP-KIT-011 | architect ↔ doc-updater 스키마 거버넌스 | 24 |
| 2.3 | 1 | IMP-KIT-015 | TASK ID 네이밍 규칙 표준화 | 30 |
| 2.3 | 2 | IMP-KIT-013 | Dev Gate Draft 조기 플래그 | 18 |
| 2.3 | 3 | IMP-KIT-012 | bridge ↔ Phase A 경계 | 13.5 |
| 2.3 | 4 | IMP-KIT-014 | stage-manifest 스키마 버전 관리 | 12 |

### 4.3 정책

- Phase 내 병렬 실행은 의존 그래프가 허용하는 범위에서 자유 (예: 2.2에서 008↔009는 병렬 가능, 011은 IMP-KIT-001 선행 필수)
- **Phase 간 경계**는 교차 금지 — Phase 2.1 완료 전 2.2 항목 착수 불허

---

## 5. 향후 모순 예방 — 패키지 간 참조 규약

본 세 모순이 반복되지 않도록 **패키지 간 참조 규약**을 정의한다.

### 5.1 단방향 참조 원칙

| 주제 | Producer (SSOT) | Consumer (참조만) |
|------|-----------------|------------------|
| P0 구현 완료분 | kit-2.2.0-roadmap | 모든 후속 패키지 |
| P1 실행 계획 | **kit-2.3.0-roadmap** | kit-feedback-archiving, 기타 후속 |
| 피드백 아카이빙 시스템 | kit-feedback-archiving | Phase 3 이후 착수 시 본 로드맵이 참조 |

**규칙**: Consumer는 Producer의 내용을 **복제하지 않고 상대 링크**로만 참조한다. (IMP-KIT-017 재복제 금지 원칙 선례)

### 5.2 시점 명시 원칙

모든 릴리스 대상 항목은 **구성 요소 분해 가능성**을 고려한다. IMP-KIT-007처럼 2개 이상 구성 요소로 분해될 수 있는 항목은 각 구성의 **구현 시점·담당 패키지를 명시**한다.

### 5.3 우선순위 일관성

| 층위 | 표기 | 예시 |
|------|------|------|
| P0/P1/P2 (우선순위) | 릴리스 단위 | P1 = 2.3.0 목표 |
| Phase 2.1/2.2/2.3 (그룹) | 릴리스 내 기간 | Phase 2.1 = 1~4주 |
| RICE 점수 (실행 순서) | 그룹 내 정렬 | 009(45) → 008(36) → 010(36) → 011(24) |

3층위가 모두 명시되어야 **실행 순서가 결정적**이다.

### 5.4 모순 발견 시 절차

1. 발견자는 본 문서에 `## 모순 ④ — {주제}` 섹션을 추가하고 해소안 제시
2. 리뷰어는 관련 패키지 변경 여부 결정 (본 문서 업데이트만 vs 원본 패키지 수정 PR)
3. 원본 패키지 수정 시 본 문서의 해당 모순 섹션은 "해소 완료" 표기 후 유지 (이력 보존)

---

## 6. 해소 완료 표

| 모순 | 해소 위치 | 보조 위치 | 상태 |
|------|-----------|-----------|------|
| ① IMP-KIT-007 시점 | 본 문서 §2 | `04-feedback-archiving-integration.md` §1, `02-p1-execution-plan.md` Phase 2.1 | 해소 (문서 내 명시) |
| ② `/plan-review` 주소권 | 본 문서 §3 | `04-feedback-archiving-integration.md` §결론 | 해소 (용어 재해석) |
| ③ P1 우선순위 | `02-p1-execution-plan.md` §2 | 본 문서 §4 정책 | 해소 (SSOT 확립) |

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
