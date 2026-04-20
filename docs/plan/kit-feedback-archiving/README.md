---
제목: Pipeline Feedback Archiving System — 문서 패키지 인덱스
작성일: 2026-04-20
대상 버전: claude-kit 2.3.0+ (Phase 3 이후 구현)
연관 로드맵: `../kit-2.2.0-roadmap/`
상태: draft (Phase 2 설계)
---

# Pipeline Feedback Archiving System

> **결론**: 각 `/plan-*`, `/copy-*`, `/dev-*` 커맨드 종료 시 **훅 스크립트**가 자동으로 claude-kit 에이전트 개선점을 문서화하고, **프로젝트 내 `.claude/feedback-archive/`에 아카이빙**한다. 환경(Codex/Claude)별 구분 메타데이터로 듀얼 타깃 차이도 추적한다. 본 패키지는 이 시스템의 **설계 문서만** 포함 (구현 아님).

---

## 문서 맵

```
kit-feedback-archiving/
├── README.md                          ← 현재 문서
├── 00-executive-summary.md            ← 1페이지 요약
├── 01-architecture.md                 ← 데이터 흐름 + 컴포넌트 다이어그램
├── 02-feedback-schema.md              ← JSON Schema (환경 구분 필드)
├── 03-trigger-points.md               ← 커맨드별 훅 지점
├── 04-archive-layout.md               ← 저장 구조 + 네이밍 + 인덱스
├── 05-codex-vs-claude.md              ← 듀얼 타깃 차이점
└── 06-integration-with-roadmap.md     ← kit-2.2.0-roadmap 연계
```

---

## 사용자 요청 요약

> "각 파이프 라인의 피드백을 받아 문서 폴더에 따로 아카이빙하는 방식이었으면 함. 그럼 클로드 키트를 계속해서 수정해나갈수 있으니까. codex에서 진행했는지 클로드에서 진행했는지 나눠서 각 진행에 대한 피드백도 필요로 함"

본 시스템의 **핵심 목적**:
1. **파이프라인 진행 중 발견된 claude-kit 개선점을 자동 수집**
2. **프로젝트 폴더에 아카이빙하여 지속 개선 자원화**
3. **Codex/Claude 환경 구분** — 각 환경별 고유 이슈 분리 추적
4. **`/plan-review` 자동 후속 트리거**와 통합 (본 로드맵 IMP-KIT-007)

---

## 핵심 결정 사항 (사용자 승인, 2026-04-20)

| 결정 | 선택값 | 근거 |
|------|--------|------|
| 아카이브 저장 위치 | **프로젝트 내 `.claude/feedback-archive/`** | PR 기반 공유 + 프로젝트별 문맥 보존 |
| 피드백 수집 주체 | **훅 스크립트가 자동 추출** | 사용자 개입 최소, 토큰 비용 절감 |
| 트리거 범위 | **plan + copy + dev 3도메인 전역** | dash-preview-phase3같은 전범위 세션 완경 |

---

## 독자별 경로

### 이해관계자 (결정권자)

1. [00-executive-summary.md](00-executive-summary.md)
2. [06-integration-with-roadmap.md](06-integration-with-roadmap.md) §구현 순서

### 메인테이너 (구현 책임자)

1. [01-architecture.md](01-architecture.md) — 전체 데이터 흐름
2. [02-feedback-schema.md](02-feedback-schema.md) — 스키마 계약
3. [03-trigger-points.md](03-trigger-points.md) — 훅 구현 위치
4. [05-codex-vs-claude.md](05-codex-vs-claude.md) — 듀얼 타깃 제약

### 기여자 (훅 스크립트 작성)

1. [03-trigger-points.md](03-trigger-points.md) — 담당 훅 지점
2. [02-feedback-schema.md](02-feedback-schema.md) — 출력 형식
3. [04-archive-layout.md](04-archive-layout.md) — 저장 경로/네이밍

---

## Phase별 진행 상태

| Phase | 범위 | 상태 |
|-------|------|:-:|
| Phase 1 | 2.2.0 로드맵 (kit-2.2.0-roadmap/) | **완료** (2026-04-20) |
| Phase 2 | 본 문서 패키지 (설계) | **진행 중** |
| Phase 3 | 훅/스키마 구현 (Claude) | 예정 |
| Phase 4 | Codex 듀얼 타깃 대응 | 예정 |
| Phase 5 | 회귀 검증 + 릴리스 | 예정 |

---

## 연관 백로그

kit-2.2.0-roadmap의 다음 항목이 본 시스템과 통합 구현된다:

| IMP-KIT ID | 우선순위 | 역할 |
|-----------|:-:|------|
| IMP-KIT-007 | P1 | `/plan-review` 자동 후속 트리거 = 본 시스템의 **메인 트리거 지점** |
| IMP-KIT-016 | P1 | Checkpoint 자동 진행 플래그 — 아카이빙 시 사용자 개입 최소화 |
| IMP-KIT-017 | P1 | 재복제 금지 강제 — 아카이빙 메타데이터 SSOT |
| IMP-KIT-024 | P2 | 에이전트 호출 텔레메트리 — 피드백 데이터 수집 기반 |

상세 연계: [06-integration-with-roadmap.md](06-integration-with-roadmap.md)

---

## 상태 라벨

- **draft**: 초안, 리뷰 전 ← 현재
- **reviewed**: 리뷰 완료, 구현 대기
- **in-progress**: 구현 진행 중
- **shipped**: 릴리스 완료

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 (8개 문서 패키지) | claude-kit roadmap author |
