---
제목: Executive Summary — claude-kit 2.3.0 Roadmap
작성일: 2026-04-21
대상: 이해관계자 (결정권자)
읽기 소요: 5분
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# 00 Executive Summary

> **결론**: 2.3.0은 P1 **11건**으로 **프로세스 자동화·에이전트 보완·경계 정리** 3개 그룹을 해결한다. 2.2.0의 P0 안정성 위에 **수동 개입 감소·문서 SSOT 강화·착수 Gate 조기화**가 핵심. 신규 4지표(#7/#8/#9/#10) 달성이 릴리스 조건이다. 피드백 아카이빙 시스템의 **트리거 부분만 포함**, 수집 로직은 2.3.0+로 이월. 예상 기간 **3개월**.

---

## 1. 왜 2.3.0인가?

### 1.1 2.2.0 달성과 남은 문제

2.2.0은 **P0 블로커 6건** 전체 해결 — dev-architect 체이닝·스키마·Read 캐시·Hybrid 모드·draft/bridge-writer. 그러나 **수동 개입 지점은 여전히 잔존**:

- `/plan-review` 수동 호출 **1회**/세션
- Human Checkpoint 누적 피로 (5+회)
- screener 파일 이동 수동
- wireframe 재호출 3회
- TASK ID 혼재 → Phase B에서야 발견

### 1.2 2.3.0 테마

| 그룹 | 테마 | 항목 수 |
|------|------|:------:|
| Phase 2.1 | 프로세스 자동화 | 3건 (007, 016, 017) |
| Phase 2.2 | 에이전트 메모리/권한 보완 | 4건 (008~011) |
| Phase 2.3 | 경계/네이밍 정리 | 4건 (012~015) |

---

## 2. P1 11건 요약

### 2.1 Phase 2.1 — 프로세스 자동화

| ID | 제목 | RICE |
|----|------|:----:|
| IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 24 |
| IMP-KIT-016 | Checkpoint 자동 진행 플래그 | 22.5 |
| IMP-KIT-017 | 재복제 금지 Skill 강제 | 18 |

### 2.2 Phase 2.2 — 에이전트 보완

| ID | 제목 | RICE |
|----|------|:----:|
| IMP-KIT-009 | screener 파일 이동 권한 | **45** |
| IMP-KIT-008 | screener 재판정 메모리 | 36 |
| IMP-KIT-010 | wireframe 체크리스트 | 36 |
| IMP-KIT-011 | architect 스키마 거버넌스 | 24 |

### 2.3 Phase 2.3 — 경계·네이밍

| ID | 제목 | RICE |
|----|------|:----:|
| IMP-KIT-015 | TASK ID 네이밍 표준 | 30 |
| IMP-KIT-013 | Dev Gate Draft 조기 플래그 | 18 |
| IMP-KIT-012 | bridge ↔ Phase A 경계 | 13.5 |
| IMP-KIT-014 | stage-manifest 스키마 버전 | 12 |

상세 실행 계획 + 병렬 쌍: [02-p1-execution-plan.md](02-p1-execution-plan.md)

---

## 3. 신규 달성 목표 지표 (4건)

2.2.0 지표 #1~#6은 유지하면서 아래 4지표를 신규 달성:

| # | 지표 | 2.2.0 달성 | 2.3.0 목표 | 담당 |
|:-:|------|:-:|:-:|------|
| 7 | `/plan-review` 수동 호출 | 1회 | **0회** | IMP-KIT-007 |
| 8 | 재복제 감지 건수 | 미측정 | **0건** | IMP-KIT-017 |
| 9 | 에이전트 호출 텔레메트리 커버리지 | 없음 | **전체 세션 (stub)** | IMP-KIT-007 + 024 stub |
| 10 | trust-only 위반 감지 | 미측정 | **감지 가능** | IMP-KIT-011 |

측정법: [05-verification-2.3.0.md §2](05-verification-2.3.0.md#2-230-신규-4지표-측정법-본-문서-ssot)

---

## 4. 피드백 아카이빙 통합 범위

[kit-feedback-archiving](../kit-feedback-archiving/) Phase 2 설계 완료 → Phase 3~5는 **2.3.0+로 이월**. 2.3.0 범위:

- ✅ **포함**: IMP-KIT-007 트리거 부분, IMP-KIT-016 auto-proceed, IMP-KIT-017 재복제 금지, IMP-KIT-024 stub
- ⏳ **이월**: feedback-collector 본체, Codex fallback, 월 단위 롤업, IMP-KIT-024 완전 구현

상세: [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md)

---

## 5. 주요 리스크 + 완화

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| P1 11건 동시 진행 → 품질 저하 | 중 | Phase 2.1/2.2/2.3 순차 집행, 그룹 내 병렬만 허용 |
| auto-proceed가 Critical Checkpoint 스킵 | 중 | IMP-KIT-016 스펙에 화이트리스트 정의 |
| 레거시 TASK ID 마이그레이션 저항 | 저 | 경고 수준 도입 후 점진 차단 |
| ajv 런타임 검증 오버헤드 | 저 | 목표 < 50ms/호출 (IMP-KIT-011 §5.2) |
| 3개월 기간 초과 | 중 | 미충족 항목 2.3.1 이월 ([02 §10](02-p1-execution-plan.md#10-이월-조건)) |

---

## 6. 패키지 간 모순 3건 해소

선행 두 패키지 사이 모순을 본 로드맵이 공식 해소:

| 모순 | 해소 원칙 | SSOT |
|------|----------|------|
| ① IMP-KIT-007 시점 | 트리거=2.3.0 / 수집=2.3.0+ | [07 §2](07-boundary-and-contradictions.md#2-모순--imp-kit-007-구현-시점) |
| ② `/plan-review` 주소권 | Producer=본 로드맵 / Consumer=feedback-archiving | [07 §3](07-boundary-and-contradictions.md#3-모순--plan-review-자동-후속-주소권) |
| ③ P1 11건 우선순위 | 그룹 + RICE 내림차순 SSOT | [02 §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot) |

---

## 7. 의사결정 요청

이해관계자 승인 필요 3건:

1. **P1 11건 RICE 재정렬표 승인** — [02 §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot)
2. **피드백 아카이빙 수집 로직 이월 승인** — Phase 3~5 → 2.3.0+로
3. **Breaking Changes 3건 수용 승인** — TASK ID 네이밍·stage-manifest schema_version·edit-coordinates ajv 검증

---

## 8. 공수 및 일정

| Phase | 기간 | 공수 합 | 주요 병렬 |
|:-:|:-:|:-:|---|
| 2.1 | 1~4주 | S + M + S | 순차 실행 |
| 2.2 | 5~8주 | 3×S + M | 008↔009 병렬 |
| 2.3 | 9~12주 | S + 3×M | 012↔014 병렬 가능 |
| **합계** | **3개월** | **21일 (병렬 후)** | — |

---

## 9. 후속 단계

1. 본 Executive Summary 리뷰 (이해관계자)
2. [02-p1-execution-plan.md](02-p1-execution-plan.md) + [07-boundary-and-contradictions.md](07-boundary-and-contradictions.md) 정독
3. IMP-KIT-008~015 상세 스펙 8건 리뷰 ([03-p1-detailed-specs/](03-p1-detailed-specs/))
4. 담당자 배정 → Phase 2.1 착수
5. 주간 회고 → Exit Criteria 추적 → 2.3.0 RC 빌드 → 릴리스
6. 릴리스 직후 kit-feedback-archiving Phase 3 착수 (1개월 내 목표)

---

## 10. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 3 Layer 4) | claude-kit roadmap author |
