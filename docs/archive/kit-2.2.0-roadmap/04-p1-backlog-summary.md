---
제목: P1 Backlog Summary — 11건 (2.3.0 목표)
작성일: 2026-04-20
대상 릴리스: claude-kit 2.3.0 (3개월 내)
상태: draft
---

# 04 P1 Backlog Summary

> **결론**: P1은 **프로세스 자동화 + 에이전트 메모리/권한 보완 + 경계/네이밍 정리** 3개 그룹 **11건**으로 구성. 2.3.0 릴리스 목표이나 P0 완료 후 단계적 투입. 상세 RICE/해결안은 **원본 백로그**를 참조 (본 문서는 요약 + cross-ref).

---

## 1. 그룹별 분류

### 1.1 프로세스 자동화 (3건) — Phase 2.1 (1~4주)

| ID | 제목 | RICE | 원본 #N |
|----|------|:-:|:-:|
| IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 24 | #10 |
| IMP-KIT-016 | Human Checkpoint 자동 진행 플래그 | 22.5 | #8, #21 |
| IMP-KIT-017 | 재복제 금지 원칙 Skill 수준 강제 | 18 | 관찰 |

### 1.2 에이전트 메모리/권한 보완 (4건) — Phase 2.2 (5~8주)

| ID | 제목 | RICE | 원본 #N |
|----|------|:-:|:-:|
| IMP-KIT-008 | plan-idea-screener 재판정 메모리 기록 | 36 | #6 |
| IMP-KIT-009 | plan-idea-screener 파일 이동 권한 | 45 | #6 |
| IMP-KIT-010 | plan-wireframe-designer 체크리스트 확장 | 36 | #13~17 |
| IMP-KIT-011 | dev-architect ↔ doc-updater 스키마 표준화 | 24 | #22→23 |

### 1.3 경계/네이밍 정리 (4건) — Phase 2.3 (9~12주)

| ID | 제목 | RICE | 원본 #N |
|----|------|:-:|:-:|
| IMP-KIT-012 | plan-bridge ↔ dev-feature Phase A 경계 | 13.5 | #19↔#20 |
| IMP-KIT-013 | Dev 착수 Gate Draft 조기 플래그 | 18 | #21 |
| IMP-KIT-014 | stage-manifest.json 스키마 버전 관리 | 12 | 관찰 |
| IMP-KIT-015 | TASK ID 네이밍 규칙 표준화 | 30 | 관찰 |

---

## 2. 원본 백로그 참조

각 항목의 상세 RICE/해결안/검증은 **원본 회고 문서**를 그대로 참조한다. 본 로드맵은 중복 복제를 금지한다 (IMP-KIT-017 SSOT 원칙).

**원본 위치**: `C:/Program Files (user)/mologado/.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md`

### 빠른 조회 섹션

- IMP-KIT-007: 원본 §P1 IMP-KIT-007
- IMP-KIT-008: 원본 §P1 IMP-KIT-008
- IMP-KIT-009: 원본 §P1 IMP-KIT-009
- IMP-KIT-010: 원본 §P1 IMP-KIT-010
- IMP-KIT-011: 원본 §P1 IMP-KIT-011
- IMP-KIT-012: 원본 §P1 IMP-KIT-012
- IMP-KIT-013: 원본 §P1 IMP-KIT-013
- IMP-KIT-014: 원본 §P1 IMP-KIT-014
- IMP-KIT-015: 원본 §P1 IMP-KIT-015
- IMP-KIT-016: 원본 §P1 IMP-KIT-016
- IMP-KIT-017: 원본 §P1 IMP-KIT-017

---

## 3. P0 연계 체인

P0 완료 후 P1이 활성화되는 체인:

| P0 선행 | P1 후속 | 연계 이유 |
|---------|---------|----------|
| IMP-KIT-001 | IMP-KIT-011 | architect ↔ doc-updater 체이닝 성립 후 스키마 표준화 |
| IMP-KIT-002 | IMP-KIT-008, 009 | screener 파라미터화 후 메모리/권한 확장 |
| IMP-KIT-003, 004 | IMP-KIT-012, 013 | bridge/draft 에이전트 확립 후 경계 명확화 |

---

## 4. 사용자 추가 요청과의 연결

본 로드맵 별도 이니셔티브 **"파이프라인 피드백 자동 아카이빙 시스템"** (Phase 2 설계 예정)은 다음 P1 항목과 통합 구현된다:

| P1 ID | 역할 |
|-------|------|
| IMP-KIT-007 (`/plan-review` 자동 후속 트리거) | 아카이빙 시스템의 **트리거 지점** |
| IMP-KIT-016 (Checkpoint 자동 진행 플래그) | 아카이빙 시 사용자 개입 최소화 |
| IMP-KIT-017 (재복제 금지 강제) | 아카이빙 메타데이터 SSOT 보증 |

Phase 2 설계 문서(`docs/plan/kit-feedback-archiving/`)에서 이 3건의 연동 방식을 정식 명세 예정.

---

## 5. 실행 순서 참고

```
[Phase 2.1 — 1~4주 (자동화)]
  IMP-KIT-007 → IMP-KIT-016 → IMP-KIT-017
  ↓ (병렬 연장)
[Phase 2.2 — 5~8주 (에이전트 보완)]
  IMP-KIT-008 / IMP-KIT-009 (screener 계열, 병렬)
  IMP-KIT-010 (독립)
  IMP-KIT-011 (IMP-KIT-001 선행)
  ↓
[Phase 2.3 — 9~12주 (경계/네이밍)]
  IMP-KIT-012 → IMP-KIT-013
  IMP-KIT-014 → IMP-KIT-015
```

---

## 6. 2.3.0 Exit Criteria

다음 지표를 달성해야 2.3.0 릴리스 가능:

| 지표 | 2.3.0 목표 |
|------|:-:|
| `/plan-review` 수동 호출 | **0회** |
| screener 재판정 메모리 엔트리 | 재판정 건당 **1건** |
| wireframe 재호출 | **≤ 1회/세션** |
| 재복제 감지 건수 | **0건** |
| TASK ID 일관성 | **100%** |
| stage-manifest 스키마 호환성 테스트 | 통과 |

전체 검증 전략은 [06-verification-strategy.md](06-verification-strategy.md) 참조.

---

## 7. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
