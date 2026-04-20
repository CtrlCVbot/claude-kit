---
제목: Roadmap 2.2.0 → 2.4.0+ — 3 Phase 실행 계획
작성일: 2026-04-20
대상: claude-kit 2.1.0 → 차기 3개 마이너 릴리스
참고: 원본 `03-implementation-plan.md` + 의존 그래프/공수 보강
상태: draft
---

# 02 Roadmap — 2.2.0 → 2.4.0+

> **결론**: P0 6건 → **2.2.0 (3~4주)**, P1 11건 → **2.3.0 (8~10주)**, P2 9건 → **2.4.0+ (장기)**. Phase 내 의존 순서는 **권한 기반 인프라 → 에이전트 신설 → 프로세스 자동화 → 고급 기능** 순서로 진행한다. 주요 체인은 3개: **권한 체인, 스크리너 체인, 프로세스 체인**.

---

## 1. 릴리스 최소 포함 기준

### 2.2.0 (차기 마이너) — P0 6건 필수

| # | ID | 제목 | 공수 | 참조 |
|:-:|----|------|:-:|------|
| 1 | IMP-KIT-005 | Read 캐시 자동 재시도 | S (1~2d) | [스펙](03-p0-detailed-specs/IMP-KIT-005-read-cache-retry.md) |
| 2 | IMP-KIT-002 | screener 프레임워크 파라미터화 | S (1d) | [스펙](03-p0-detailed-specs/IMP-KIT-002-screener-framework-param.md) |
| 3 | IMP-KIT-001 | dev-architect Phase별 체이닝 | M (3~5d) | [스펙](03-p0-detailed-specs/IMP-KIT-001-dev-architect-chaining.md) |
| 4 | IMP-KIT-006 | Hybrid 모드 공식 정의 | M (3d) | [스펙](03-p0-detailed-specs/IMP-KIT-006-hybrid-mode.md) |
| 5 | IMP-KIT-003 | plan-draft-writer 신설 | M (3~5d) | [스펙](03-p0-detailed-specs/IMP-KIT-003-plan-draft-writer.md) |
| 6 | IMP-KIT-004 | plan-bridge-writer 신설 | M (3~5d) | [스펙](03-p0-detailed-specs/IMP-KIT-004-plan-bridge-writer.md) |

**2.2.0 릴리스 목표 지표**:
- Phase C 재위임 **0회**
- 프레임워크 drift **0건**
- Read 캐시 에러 **< 1%**
- Hybrid 수동 지시 **0회**
- 수동 Edit 건수 **< 15건** (현재 22+)

---

## 2. Phase 1 — 2.2.0 실행 (3~4주)

### Phase 1.1 — 기반 인프라 (1주차)

의존 루트. 후속 작업의 토대.

```
IMP-KIT-005 (Read 캐시 자동 재시도)
  ↓
IMP-KIT-002 (screener 프레임워크 파라미터)
```

**왜 먼저?**
- **Read 캐시**는 에이전트 작업 전반의 페인포인트. 우선 해결해야 후속 개선이 올바르게 측정된다.
- **screener 파라미터화**는 단일 커맨드/Skill 수정으로 즉효. 체크인 비용 최소.

**검증 방법**:
- Read 캐시: 의도적 에이전트→메인 전환 시나리오 **10회 중 실패 0**
- screener: `/plan-screen --framework rice` 호출 시 RICE 스코어만 출력

### Phase 1.2 — 에이전트 권한 재편 (2~3주차)

```
IMP-KIT-001 (dev-architect 체이닝)
  ├─→ IMP-KIT-003 (plan-draft-writer 신설)
  ├─→ IMP-KIT-004 (plan-bridge-writer 신설)
  └─→ IMP-KIT-006 (Hybrid 정의)
```

**왜 순서?**
- IMP-KIT-001이 **"분석 vs 편집 역할 분리"** 원칙을 확립해야 후속 에이전트 신설의 기본형이 된다.
- 003/004/006은 상호 의존 없음 → **병렬** 가능.

**검증 방법**:
- 001: Phase C 엔드투엔드 테스트 — 재위임 0회
- 003: `/plan-draft` 호출 시 수동 개입 0
- 004: `/plan-bridge` + `/copy-reference-refresh` 병렬 자동화
- 006: Hybrid Feature 선언→자동 감지 성공

### Phase 1.3 — 통합 검증 (4주차)

**회귀 시나리오**: dash-preview-phase3 유사 Feature(3도메인 동시 활성)를 복제 실행.

[06-verification-strategy.md](06-verification-strategy.md)의 **현재 → 2.2.0 목표 지표 테이블** 전체 비교.

---

## 3. Phase 2 — 2.3.0 실행 (3개월 내)

### Phase 2.1 — 프로세스 자동화 (1~4주)

```
IMP-KIT-007 (plan-review 자동 트리거) ← 사용자 추가 요청 연결
  + IMP-KIT-016 (Checkpoint 자동 진행 플래그)     ─ 병렬
  + IMP-KIT-017 (재복제 금지 Skill 강제)
```

**주의**: IMP-KIT-007은 **사용자가 별도로 제안한 "/plan-review 자동 후속 트리거"** 요구의 일부다. Phase 2 별도 이니셔티브 **"파이프라인 피드백 자동 아카이빙 시스템"** 설계와 통합 구현된다. 상세는 §6 참조.

### Phase 2.2 — 에이전트 메모리/권한 보완 (5~8주)

```
IMP-KIT-008 (screener 재판정 메모리 기록)
IMP-KIT-009 (screener 파일 이동 권한)
IMP-KIT-011 (architect ↔ doc-updater 스키마 표준화)
IMP-KIT-010 (wireframe-designer 체크리스트)
```

### Phase 2.3 — 경계/네이밍 정리 (9~12주)

```
IMP-KIT-012 (bridge ↔ Phase A 경계)
IMP-KIT-013 (Dev 착수 Gate 조기 플래그)
IMP-KIT-014 (stage-manifest 스키마 버전)
IMP-KIT-015 (TASK ID 네이밍 표준)
```

상세 요약은 [04-p1-backlog-summary.md](04-p1-backlog-summary.md) 참조.

---

## 4. Phase 3 — 2.4.0+ 실행 (장기)

### Phase 3.1 — 텔레메트리 기반 (순차)

```
IMP-KIT-024 (에이전트 호출 텔레메트리)
  ↓
IMP-KIT-020 (grep truncation 가드)
  ↓
IMP-KIT-021 (trust-only 금지 가드)
```

**왜 순차?** 텔레메트리 확보 후 데이터 기반으로 가드 설계.

### Phase 3.2 — 고급 기능 (병렬, 필요 시점에 처리)

```
IMP-KIT-018 (Spike 자동/수동 명확화)
IMP-KIT-019 (병렬 실행 기본값 정책)
IMP-KIT-022 (REQ/TASK ID 레지스트리)
IMP-KIT-023 (decision-log 템플릿)
IMP-KIT-025 (프로젝트 스코프 메모리)
IMP-KIT-026 (와이어프레임 ↔ 구현 drift)
```

상세 요약은 [05-p2-backlog-summary.md](05-p2-backlog-summary.md) 참조.

---

## 5. 전체 의존 그래프

```
[Phase 1 — 2.2.0]
  IMP-KIT-005 ──┬──> IMP-KIT-001 ──┬──> IMP-KIT-003
                │                    └──> IMP-KIT-004
                └──> IMP-KIT-002
                                         IMP-KIT-006 (copy 독립)

[Phase 2 — 2.3.0]
  IMP-KIT-007 ──> IMP-KIT-016 ──> IMP-KIT-017
  (1 ← 유산) ──> IMP-KIT-011 (스키마 표준화)
  (2 ← 유산) ──> IMP-KIT-008 / IMP-KIT-009
  IMP-KIT-010 (독립)
  IMP-KIT-012 ──> IMP-KIT-013
  IMP-KIT-014 ──> IMP-KIT-015

[Phase 3 — 2.4.0+]
  IMP-KIT-024 ──> IMP-KIT-020 ──> IMP-KIT-021
  IMP-KIT-018/019/022/023/025/026 (모두 독립)
```

**주요 체인**:
- **권한 체인**: 005 → 001 → 003/004 (Read 캐시 → architect 권한 → draft/bridge 에이전트)
- **스크리너 체인**: 002 → 008 → 009 (파라미터 → 메모리 → 이동 권한)
- **프로세스 체인**: 007 → 016 → 017 (자동 리뷰 → 자동 진행 → 재복제 금지)

---

## 6. 별도 이니셔티브 — 파이프라인 피드백 아카이빙 (Phase 2 예정)

사용자가 추가 요청한 아래 시스템은 **본 로드맵의 범위 외** 별도 문서 패키지로 진행된다:

### 핵심 요구사항

1. **`/plan-review` 자동 후속 트리거** (본 로드맵 IMP-KIT-007과 연계)
2. **각 `/plan-*` 커맨드 종료 시 자동 피드백 문서화**
3. **피드백을 지정 폴더에 아카이빙** — claude-kit 지속 개선 자원화
4. **Codex/Claude 환경 구분** — 각 환경별 고유 이슈 분리 추적

### 진행 계획

| 단계 | 산출물 | 위치 |
|------|--------|------|
| Phase 2 설계 | 시스템 설계 문서 패키지 | `docs/plan/kit-feedback-archiving/` |
| Phase 3 스키마 | 피드백 메타데이터 스키마 확정 | 설계 문서 내 |
| Phase 4 훅 구현 | 각 `/plan-*` 종료 훅 구현 | `src/claude/plan/hooks/` |
| Phase 5 듀얼 타깃 | Codex `hooks` 대응 | `src/codex/plan/hooks/` |

### 본 로드맵과의 관계

- 본 로드맵의 **IMP-KIT-007 (plan-review 자동 트리거)** 는 Phase 2 설계와 통합되어 구현된다.
- 본 로드맵의 **IMP-KIT-024 (에이전트 호출 텔레메트리)** 는 피드백 데이터 수집 기반 역할.
- **Phase 1(본 로드맵) 완료 후 Phase 2 착수** — 병행하지 않음. 2.2.0 안정화 이후 진행.

---

## 7. 예상 공수 합산

| Phase | 건수 | 공수 합계 (S=1, M=3, L=5) | 병렬 후 실제 |
|:-:|:-:|:-:|:-:|
| 1 (P0) | 6 | 14일 (S 2 + M 4) | **3~4주** |
| 2 (P1) | 11 | 31일 (S 5 + M 5 + L 1) | **8~10주** |
| 3 (P2) | 9 | 22일 (S 5 + M 3 + L 1) | **분기당 2~3건** |
| **합계** | **26** | **67일** | — |

---

## 8. 실행 리스크 및 완화

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| dev-architect 권한 확장이 예상치 못한 부작용 유발 | M | **B안(체이닝)** 선택 — 역할 분리 유지 |
| 신규 에이전트 3종 동시 도입이 품질 저하 유발 | M | **스테이지 롤아웃** — 1개씩 투입, 회귀 후 다음 |
| Hybrid 모드 오탐/미탐 | L | 수동 오버라이드 플래그 유지 |
| 2.2.0 범위가 공수 초과 | M | IMP-KIT-003/004는 **2.3.0으로 이월 가능** |
| Codex/Claude 듀얼 타깃 동기화 누락 | M | 본 로드맵은 Claude 우선, Codex는 **Phase 2 이후 일괄** 동기화 |

---

## 9. 측정 가능한 성공 기준

[06-verification-strategy.md](06-verification-strategy.md)의 전체 지표 테이블과 단위 테스트 명세 참조. 각 릴리스별 **Exit Criteria**는 해당 문서에 정의된다.

---

## 10. 차기 단계

1. 본 로드맵 리뷰 완료 (이해관계자 승인)
2. P0 6건 각각의 [03-p0-detailed-specs/](03-p0-detailed-specs/) 스펙 리뷰
3. 담당자 배정 → 구현 착수
4. 주간 회고 → 지표 추적 → 2.2.0 RC 빌드 → 릴리스

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 — 3 Phase + 의존 그래프 + Phase 2 이니셔티브 언급 | claude-kit roadmap author |
