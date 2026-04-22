---
제목: P2 Backlog Summary — 9건 (2.4.0+ 장기)
작성일: 2026-04-20
대상 릴리스: claude-kit 2.4.0+ (장기)
상태: draft
---

# 05 P2 Backlog Summary

> **결론**: P2는 **텔레메트리 기반 인프라 + 고급 기능** 2개 그룹 **9건**. 텔레메트리(3건)는 순차 진행 (데이터 수집 후 가드 설계), 나머지 6건은 필요 시점에 독립 투입. 2.2.0/2.3.0 완료 후 분기당 2~3건 처리 권장.

---

## 1. 그룹별 분류

### 1.1 텔레메트리 기반 (3건) — Phase 3.1 (순차)

| ID | 제목 | RICE | 원본 #N |
|----|------|:-:|:-:|
| IMP-KIT-024 | 에이전트 호출 횟수 텔레메트리 | 4 | 관찰 |
| IMP-KIT-020 | grep/Read 출력 truncation 가드 | 6 | 관찰 |
| IMP-KIT-021 | 에이전트 결과 trust-only 금지 가드 | 10 | 관찰 |

**의존 순서**: 024 → 020 → 021 (텔레메트리 → truncation 탐지 → trust-only 방지)

### 1.2 고급 기능 (6건) — Phase 3.2 (병렬, 독립)

| ID | 제목 | RICE | 원본 #N |
|----|------|:-:|:-:|
| IMP-KIT-018 | Spike 의사결정 자동/수동 명확화 | 9 | #18 |
| IMP-KIT-019 | 에이전트 병렬 실행 기본값 정책 | 9 | #19 |
| IMP-KIT-022 | REQ/TASK ID 프로젝트 레지스트리 | 8 | 관찰 |
| IMP-KIT-023 | decision-log.md 템플릿화 | 24 | #14 |
| IMP-KIT-025 | 세션 메모리 ↔ 프로젝트 메모리 경계 규칙 | 4 | 관찰 |
| IMP-KIT-026 | 와이어프레임 ↔ 실제 구현 drift 검출 | 4 | 관찰 |

### 1.3 사용자 요청 기반 (1건) — **2.2.1 hotfix 포함 예정** (확정)

| ID | 제목 | RICE | 원본 |
|----|------|:-:|:-:|
| **IMP-KIT-027** | `/plan-design` 커맨드 + claude-design-workflow 스킬 신설 + wireframe 후속 단계 택일 구조화 | 12 | 사용자 요청 (2026-04-20) |

**특이 사항**:
- P2 우선순위이나 **2.2.1 hotfix 릴리스 타깃**으로 2.4.0+가 아닌 **가장 빠른 경로**로 진행
- Anthropic Claude Design (2026-04-17 출시) 통합 기회 포착
- wireframe을 필수 선행 단계로 재정의 + `/plan-design` vs `/plan-stitch` 택일 구조 도입
- 프롬프트 2단계 순차 출력 (wireframe → high fidelity)
- 상세 스펙: [03-p0-detailed-specs/IMP-KIT-027-plan-design-integration.md](03-p0-detailed-specs/IMP-KIT-027-plan-design-integration.md)
  - 파일 위치는 P0 폴더에 유지 (hybrid 정책 — 본 요약 + 상세 스펙 분리 관리)

---

## 2. 원본 백로그 참조

상세 RICE/해결안/검증은 원본 회고 문서를 참조한다 (SSOT).

**원본 위치**: `C:/Program Files (user)/mologado/.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md` §P2

### 빠른 조회 섹션

- IMP-KIT-018: 원본 §P2 IMP-KIT-018
- IMP-KIT-019: 원본 §P2 IMP-KIT-019
- IMP-KIT-020: 원본 §P2 IMP-KIT-020
- IMP-KIT-021: 원본 §P2 IMP-KIT-021
- IMP-KIT-022: 원본 §P2 IMP-KIT-022
- IMP-KIT-023: 원본 §P2 IMP-KIT-023
- IMP-KIT-024: 원본 §P2 IMP-KIT-024
- IMP-KIT-025: 원본 §P2 IMP-KIT-025
- IMP-KIT-026: 원본 §P2 IMP-KIT-026
- IMP-KIT-027: **사용자 요청 기반** — 회고 외 자산. 상세 스펙은 `03-p0-detailed-specs/IMP-KIT-027-plan-design-integration.md` 참조

---

## 3. 2.4.0+ 실행 원칙

### 3.1 분기당 2~3건 제한

**이유**: 장기 백로그이므로 급하지 않다. 2.3.0 안정화 후 여유 가용량에서 진행.

### 3.2 텔레메트리 우선

IMP-KIT-024를 먼저 진행해야 020/021의 가드 설계가 데이터 기반으로 가능.

### 3.3 독립성 원칙

고급 기능 6건은 상호 의존 없음. 필요 시점에 우선순위 별도 평가.

---

## 4. 사용자 추가 요청과의 연결

**파이프라인 피드백 자동 아카이빙 시스템** (Phase 2 설계)은 다음 P2 항목의 **선행 필요 기반**을 포함:

| P2 ID | 역할 |
|-------|------|
| IMP-KIT-024 (텔레메트리) | 피드백 데이터 수집 기반 |
| IMP-KIT-019 (병렬 실행 기본값) | 아카이빙 동작의 비차단 보증 |
| IMP-KIT-025 (메모리 경계) | 환경별(Codex/Claude) 메타 분리 원칙 |

Phase 2 설계 시 위 3건을 **선행 조건 후보**로 평가 예정. 일부는 Phase 2와 병행 구현될 수 있다.

---

## 5. P2 우선순위 재평가 트리거

다음 조건 중 하나가 참일 때 P2 항목의 우선순위를 재검토:

- 해당 영역 안티패턴이 **3세션 이상 반복** 관찰
- 텔레메트리 데이터에서 해당 이슈 빈도 **top 5** 진입
- 사용자 명시 요청
- 2.2.0/2.3.0 목표 지표 달성 후 여유 가용

---

## 6. 2.4.0+ Exit Criteria (참고)

릴리스별 Exit Criteria는 각 릴리스 계획에서 재정의. 본 문서는 **후보 지표**만 제시:

| 지표 후보 | 측정 방법 |
|-----------|----------|
| 에이전트 호출 텔레메트리 커버리지 | 전체 세션의 X% |
| grep truncation 방치 사례 | 세션당 **0건** |
| VCS diff 기반 검증 수행률 | 에이전트 완료의 **100%** |
| Spike 의사결정 재질문 | **0회** |
| 병렬 실행 자동 감지 비율 | **> 50%** |

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
| 2026-04-20 | IMP-KIT-027 사용자 요청 기반 항목 추가 (2.2.1 hotfix 타깃) — §1.3 신설 + 빠른 조회 섹션 갱신 | claude-kit roadmap author |
