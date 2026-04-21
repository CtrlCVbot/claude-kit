---
제목: claude-kit 2.3.0 Roadmap — 문서 패키지 인덱스
작성일: 2026-04-21
대상 버전: claude-kit 2.3.0 (P1 11건)
선행 패키지: `../kit-2.2.0-roadmap/` · `../kit-feedback-archiving/`
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# claude-kit 2.3.0 Roadmap

> **결론**: 2.3.0 릴리스 계획의 **단일 네비게이션 포인트**. P1 11건을 3개 Phase로 실행하며, 피드백 아카이빙 시스템의 트리거 부분도 함께 포함한다. 본 패키지는 **인덱스+차분** 구조 — 선행 2패키지 내용을 복제하지 않고 링크만 제공 (IMP-KIT-017 재복제 금지 원칙). 8개 최상위 문서 + 8건 상세 스펙 = 16 파일.

---

## 1. 문서 맵

```
kit-2.3.0-roadmap/
├── README.md                              ← 현재 문서 (인덱스)
├── 00-executive-summary.md                ← 5분 요약 (이해관계자용)
├── 01-delta-from-2.2.0.md                 ← 차분 + 선행 2패키지 링크맵
├── 02-p1-execution-plan.md                ← P1 11건 RICE 기반 실행 계획 (SSOT)
├── 03-p1-detailed-specs/                  ← IMP-KIT-007~017 상세 스펙 11건
│   ├── IMP-KIT-007-plan-review-auto-trigger.md      (mini spec)
│   ├── IMP-KIT-008-screener-memory.md
│   ├── IMP-KIT-009-screener-file-move.md
│   ├── IMP-KIT-010-wireframe-checklist.md
│   ├── IMP-KIT-011-architect-schema.md
│   ├── IMP-KIT-012-bridge-phase-a-boundary.md
│   ├── IMP-KIT-013-dev-gate-draft-flag.md
│   ├── IMP-KIT-014-stage-manifest-schema-version.md
│   ├── IMP-KIT-015-task-id-naming.md
│   ├── IMP-KIT-016-checkpoint-auto-proceed.md       (mini spec)
│   └── IMP-KIT-017-no-duplication-skill.md          (mini spec)
├── 04-feedback-archiving-integration.md   ← Phase 3 진입 계약
├── 05-verification-2.3.0.md               ← 검증 delta (신규 4지표)
├── 06-release-notes-2.3.0-skeleton.md     ← 릴리스 노트 골격
├── 07-boundary-and-contradictions.md      ← 선행 패키지 모순 3건 해소
├── 08-next-steps-execution-plan.md        ← 5단계 실행 계획
└── _reviews/                              ← 리뷰 및 이슈 해소 기록
```

**범례**: `(mini spec)` = Phase 2.1 착수 전 추가된 축약 스펙 (50~80라인). 리뷰 MEDIUM §3.2.1 해소 결과.

---

## 2. 독자별 추천 경로

### 이해관계자 (결정권자)

1. [00-executive-summary.md](00-executive-summary.md) — 5분 요약
2. [02-p1-execution-plan.md §2](02-p1-execution-plan.md#2-rice-재정렬표-ssot) — RICE 재정렬표
3. [07-boundary-and-contradictions.md §1](07-boundary-and-contradictions.md#1-모순-발견-경위) — 해소된 모순 3건

### 메인테이너 (구현 책임자)

1. [02-p1-execution-plan.md](02-p1-execution-plan.md) — 실행 순서·의존 그래프
2. [03-p1-detailed-specs/](03-p1-detailed-specs/) — 8건 상세 스펙 (담당 범위만 읽어도 OK)
3. [04-feedback-archiving-integration.md](04-feedback-archiving-integration.md) — Phase 3 착수 계약
4. [05-verification-2.3.0.md](05-verification-2.3.0.md) — 테스트 매트릭스 + Exit Criteria

### 기여자 (IMP-KIT 개별 스펙 구현)

1. 담당 IMP-KIT의 상세 스펙 (예: [IMP-KIT-008](03-p1-detailed-specs/IMP-KIT-008-screener-memory.md))
2. [02-p1-execution-plan.md §6](02-p1-execution-plan.md#6-전체-의존-그래프) — 선행 의존 확인
3. 스펙 내 §3 TDD 단계 → §4 영향 파일 → §5 검증 기준

### 릴리스 책임자

1. [06-release-notes-2.3.0-skeleton.md](06-release-notes-2.3.0-skeleton.md) — 릴리스 노트 뼈대
2. [05-verification-2.3.0.md §6](05-verification-2.3.0.md#6-exit-criteria-요약) — Exit Criteria
3. [02-p1-execution-plan.md §10](02-p1-execution-plan.md#10-이월-조건) — 2.3.1 이월 조건

### Codex runtime 담당자

1. 각 상세 스펙의 §4 "듀얼 타깃 (Codex)" 섹션
2. [05-verification-2.3.0.md §5](05-verification-2.3.0.md#5-codex-듀얼-타깃-검증) — 검증 포인트

---

## 3. 선행 패키지 연관도

```
Phase 1 완료
  └─ kit-2.2.0-roadmap (P0 6건 + IMP-KIT-027)
       ↓
Phase 2 진행 중 (현재 위치)
  ├─ kit-2.3.0-roadmap (본 패키지, P1 11건 실행 계획)
  │    ↓ 트리거 부분 제공
  └─ kit-feedback-archiving (Phase 2 설계 완료)
       ↓ 수집 로직 2.3.0+ 구현
Phase 3 예정 (2.3.0+ / 2.4.0)
  └─ kit-feedback-archiving Phase 3~5
  └─ P2 9건 (IMP-KIT-018~026)
```

| 선행 패키지 | 본 패키지 관계 |
|------------|---------------|
| [kit-2.2.0-roadmap](../kit-2.2.0-roadmap/) | **스타일 표준 + P1 원천 SSOT** — 복제 금지, 링크만 |
| [kit-feedback-archiving](../kit-feedback-archiving/) | **수집 로직 Consumer** — 본 패키지가 트리거 Producer |

상세: [01-delta-from-2.2.0.md §4](01-delta-from-2.2.0.md#4-선행-2패키지-참조-맵)

---

## 4. 백로그 번호 빠른 참조

### P1 11건 (본 로드맵 담당)

| Phase | 순서 | ID | 제목 | RICE | 공수 |
|:-----:|:----:|----|------|:----:|:---:|
| 2.1 | 1 | IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | 24 | S |
| 2.1 | 2 | IMP-KIT-016 | Checkpoint 자동 진행 플래그 | 22.5 | M |
| 2.1 | 3 | IMP-KIT-017 | 재복제 금지 Skill 강제 | 18 | S |
| 2.2 | 1 | IMP-KIT-009 | screener 파일 이동 권한 | **45** | S |
| 2.2 | 2 | IMP-KIT-008 | screener 재판정 메모리 | 36 | S |
| 2.2 | 3 | IMP-KIT-010 | wireframe 체크리스트 | 36 | S |
| 2.2 | 4 | IMP-KIT-011 | architect 스키마 거버넌스 | 24 | M |
| 2.3 | 1 | IMP-KIT-015 | TASK ID 네이밍 표준 | 30 | S |
| 2.3 | 2 | IMP-KIT-013 | Dev Gate Draft 조기 플래그 | 18 | M |
| 2.3 | 3 | IMP-KIT-012 | bridge ↔ Phase A 경계 | 13.5 | M |
| 2.3 | 4 | IMP-KIT-014 | stage-manifest 스키마 버전 | 12 | M |

### 참고: 본 로드맵이 다루지 않는 범위

- **P0 6건 + IMP-KIT-027** (2.2.0/2.2.1 완료): [kit-2.2.0-roadmap/03-p0-detailed-specs/](../kit-2.2.0-roadmap/03-p0-detailed-specs/)
- **피드백 아카이빙 수집 로직** (2.3.0+): [kit-feedback-archiving](../kit-feedback-archiving/)
- **P2 9건** (2.4.0+): [kit-2.2.0-roadmap/05-p2-backlog-summary.md](../kit-2.2.0-roadmap/05-p2-backlog-summary.md)

---

## 5. 상태 라벨

| 라벨 | 의미 | 현재 패키지 |
|------|------|:----------:|
| **draft** | 초안, 리뷰 전 | ✅ **현재** |
| reviewed | 리뷰 완료, 구현 대기 | — |
| in-progress | 구현 진행 중 | — |
| shipped | 릴리스 완료 | — |

---

## 6. 구현 시 체크리스트

본 패키지 기반 2.3.0 구현 착수 시:

- [ ] 본 README + [00-executive-summary](00-executive-summary.md) 리뷰 완료
- [ ] [02-p1-execution-plan](02-p1-execution-plan.md) RICE 재정렬 승인
- [ ] [07-boundary-and-contradictions](07-boundary-and-contradictions.md) 모순 해소 3건 승인
- [ ] Breaking Changes 3건 ([06-release-notes-skeleton](06-release-notes-2.3.0-skeleton.md#breaking-changes)) 승인
- [ ] Phase 2.1 담당자 배정
- [ ] 테스트 러너 도입 결정 (Vitest/Jest)
- [ ] Codex 듀얼 타깃 동기화 담당 확인

---

## 7. 세션별 집필 이력

본 패키지는 3개 세션 + 이슈 해소 1회로 집필 (Claude Code plan mode 내부 계획에 따름):

| 세션 | Layer | 파일 수 | 예상 라인 | 상태 |
|:----:|:-----:|:------:|:--------:|:-:|
| Session 1 | Layer 1 | 9 (8 스펙 + 07-boundary) | ~1730 | ✅ 완료 |
| Session 2 | Layer 2+3 | 5 (01, 02, 04, 05, 06) | ~820 | ✅ 완료 |
| Session 3 | Layer 4 | 2 (00, README) | ~230 | ✅ 완료 |
| Resolution | MEDIUM 3건 해소 | +3 미니 스펙 (007/016/017) + 기존 파일 보정 | ~400 | ✅ 완료 |

**총 19 파일** (최상위 9 + 상세 스펙 11). 미니 스펙 추가 내역은 [_reviews/](_reviews/) 참조.

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 3 Layer 4 — 전 패키지 완성) | claude-kit roadmap author |
