---
제목: claude-kit 2.2.0 Roadmap — 문서 패키지 인덱스
작성일: 2026-04-20
대상 버전: claude-kit 2.2.0 (→ 2.3.0 → 2.4.0+)
원본 회고: `../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/` (mologado 상위)
상태: draft
---

# claude-kit 2.2.0 Roadmap

> **결론**: dash-preview-phase3 세션 회고에서 도출된 **26건의 개선 항목**을 3개 마이너 릴리스(2.2.0/2.3.0/2.4.0+)로 분할 실행하는 로드맵. 본 패키지는 **P0 6건의 중량 구현 스펙 + P1/P2 요약 + 검증 전략 + 릴리스 노트 초안**을 담는다.

---

## 문서 맵

```
kit-2.2.0-roadmap/
├── README.md                          ← 현재 문서
├── 00-executive-summary.md            ← 1페이지 요약 (이해관계자용)
├── 01-source-retrospective-link.md    ← 원본 회고 5문서 참조
├── 02-roadmap-2.2.0-to-2.4.0.md       ← 3 Phase 로드맵 + 의존 그래프
├── 03-p0-detailed-specs/              ← P0 6건 중량 스펙
│   ├── IMP-KIT-001-dev-architect-chaining.md
│   ├── IMP-KIT-002-screener-framework-param.md
│   ├── IMP-KIT-003-plan-draft-writer.md
│   ├── IMP-KIT-004-plan-bridge-writer.md
│   ├── IMP-KIT-005-read-cache-retry.md
│   └── IMP-KIT-006-hybrid-mode.md
├── 04-p1-backlog-summary.md           ← P1 11건 요약
├── 05-p2-backlog-summary.md           ← P2 9건 요약
├── 06-verification-strategy.md        ← 회귀 시나리오 + 지표
├── 07-release-notes-2.2.0-draft.md    ← 릴리스 노트 (Phase 1.3 V4 확정본)
└── 08-regression-scenario.md          ← 회귀 실행 체크리스트 (Phase 1.3 V1)
```

---

## 독자별 추천 경로

### 이해관계자 (결정권자)

1. [00-executive-summary.md](00-executive-summary.md) — 5분 요약
2. [02-roadmap-2.2.0-to-2.4.0.md](02-roadmap-2.2.0-to-2.4.0.md) §1 릴리스 최소 포함 기준
3. [07-release-notes-2.2.0-draft.md](07-release-notes-2.2.0-draft.md) — 2.2.0 변경 영향

### 메인테이너 (구현 책임자)

1. [02-roadmap-2.2.0-to-2.4.0.md](02-roadmap-2.2.0-to-2.4.0.md) — 의존 그래프 + 공수
2. [03-p0-detailed-specs/](03-p0-detailed-specs/) — P0 6건 전부 정독
3. [06-verification-strategy.md](06-verification-strategy.md) — 회귀 시나리오

### 기여자 (PR 작성자)

1. 담당 IMP-KIT 번호 선택 → [03-p0-detailed-specs/](03-p0-detailed-specs/) 해당 파일
2. 해당 스펙의 "TDD 테스트 케이스" + "영향 파일" 섹션
3. [06-verification-strategy.md](06-verification-strategy.md) 단위 테스트 기준

### 사용자 (릴리스 노트 관심)

1. [07-release-notes-2.2.0-draft.md](07-release-notes-2.2.0-draft.md) — 단일 문서로 충분

---

## Phase 1 → Phase 2 연계

본 패키지는 **Phase 1 (회고 기반 개선 계획)**의 산출물이다. 사용자가 추가 요청한 **파이프라인별 피드백 자동 아카이빙 시스템** (Codex/Claude 환경 구분 포함)은 **Phase 2 별도 문서 패키지**로 분리 진행한다.

| Phase | 범위 | 산출물 위치 |
|-------|------|------------|
| Phase 1 (현재) | 회고 기반 26건 개선 로드맵 | `docs/plan/kit-2.2.0-roadmap/` |
| Phase 2 (차기) | 파이프라인 피드백 아카이빙 시스템 설계 | `docs/plan/kit-feedback-archiving/` (예정) |
| Phase 3 (그 다음) | `/plan-review` 자동 후속 트리거 + 각 파이프라인 훅 구현 | IMP-KIT-007 기반 구현 |
| Phase 4 (마지막) | Codex/Claude 환경 구분 메타데이터 스키마 | 구현 스키마 확정 |

Phase 1 범위 내에서 **"/plan-review 자동 후속 트리거"는 IMP-KIT-007 (P1)** 로 이미 등록되어 있으며, Phase 2 설계 완료 후 Phase 3에서 통합 구현한다.

---

## 백로그 번호 빠른 참조

### P0 (차기 2.2.0 필수) — 6건

| ID | 제목 | RICE |
|----|------|:-:|
| [IMP-KIT-001](03-p0-detailed-specs/IMP-KIT-001-dev-architect-chaining.md) | dev-architect Phase별 체이닝 | 62.5 |
| [IMP-KIT-002](03-p0-detailed-specs/IMP-KIT-002-screener-framework-param.md) | plan-idea-screener 프레임워크 파라미터화 | 100 |
| [IMP-KIT-003](03-p0-detailed-specs/IMP-KIT-003-plan-draft-writer.md) | plan-draft-writer 신설 | 32 |
| [IMP-KIT-004](03-p0-detailed-specs/IMP-KIT-004-plan-bridge-writer.md) | plan-bridge-writer 신설 | 40 |
| [IMP-KIT-005](03-p0-detailed-specs/IMP-KIT-005-read-cache-retry.md) | Read 캐시 자동 재시도 | 37.5 |
| [IMP-KIT-006](03-p0-detailed-specs/IMP-KIT-006-hybrid-mode.md) | Hybrid (reference-only) 모드 공식 정의 | 30 |

### P1 (2.3.0 내 목표) — 11건

[04-p1-backlog-summary.md](04-p1-backlog-summary.md) 참조.

### P2 (2.4.0+ 장기) — 9건

[05-p2-backlog-summary.md](05-p2-backlog-summary.md) 참조.

---

## 상태 라벨

- **draft**: 초안, 리뷰 전
- **reviewed**: 리뷰 완료, 구현 대기
- **in-progress**: 구현 진행 중
- **shipped**: 릴리스 완료

현재 패키지 전체 상태: **draft** (리뷰 요청 대기)

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 (9개 문서 패키지 구성) | claude-kit roadmap author |
