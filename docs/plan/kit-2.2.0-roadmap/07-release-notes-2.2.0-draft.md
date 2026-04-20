---
제목: Release Notes Draft — claude-kit 2.2.0
작성일: 2026-04-20
대상: claude-kit 2.2.0 사용자
상태: draft (릴리스 시 확정)
---

# 07 Release Notes Draft — claude-kit 2.2.0

> **claude-kit 2.2.0 — 에이전트 권한 및 프레임워크 안정화**
>
> dash-preview-phase3 세션 회고에서 도출된 **핵심 블로커 6건**을 해결한다. Phase C 재위임, 프레임워크 silent drift, Read 캐시 에러, Hybrid 수동 지시를 **0으로 만드는 것**이 목표다.

---

## 주요 변경 (6건)

### 1. dev-architect Phase별 에이전트 자동 체이닝 (IMP-KIT-001)

`/dev-feature` Phase C에서 편집 필요 시 **dev-doc-updater로 자동 라우팅**. 기존 수동 재위임 불필요.

- **영향**: dev-architect의 read-only 원칙은 유지 — 분석과 편집의 역할 분리 명확화
- **스키마**: architect → doc-updater 간 편집 좌표 JSON 표준화 (IMP-KIT-011 선행 완료)

### 2. plan-idea-screener 프레임워크 파라미터화 (IMP-KIT-002)

`/plan-screen --framework rice|5axis` 플래그 도입. 기본값은 프로젝트 CLAUDE.md에서 지정.

- **영향**: RICE 요청 → 5축 사용 같은 silent drift 제거
- **후방 호환**: 기존 미설정 프로젝트는 `rice` 기본값 사용

### 3. plan-draft-writer 신규 에이전트 (IMP-KIT-003)

`/plan-draft`의 1차 기획 작성을 전용 에이전트가 수행. Lite/Standard + 시나리오(A/B/C) + Feature 유형(copy/dev) 3중 판정 자동화.

- **영향**: Skill-only 수동화 해소
- **출력**: routing-metadata.md에 Hybrid 자동 감지 포함 (IMP-KIT-006 연동)

### 4. plan-bridge-writer 신규 에이전트 (IMP-KIT-004)

`/plan-bridge`의 브리지 문서 4종 생성을 전용 에이전트가 수행. copy-reference-baseline과 **병렬 실행 보증**.

- **영향**: bridge 산출물 일관성 향상, PCC-01~05 자동 통과
- **템플릿**: 3개 브리지 문서 템플릿 신설

### 5. Read 캐시 자동 재시도 훅 (IMP-KIT-005)

에이전트가 수정한 파일을 메인 세션이 Edit 시도 시 발생하던 **"File has not been read yet" 에러 자동 복구**.

- **영향**: 에이전트 완료 시 변경 파일 캐시 자동 무효화
- **적용 범위**: Claude 우선. Codex는 rules 기반 fallback artifact 제공

### 6. Hybrid (reference-only) 모드 공식 정의 (IMP-KIT-006)

dev Feature + 레퍼런스 캡처 필요 시나리오를 **Hybrid 모드**로 정식화. `/copy-reference-refresh --reference-only` 플래그 + `/plan-draft` 자동 감지.

- **영향**: Hybrid 매번 수동 지시 불필요
- **rules**: `copy/rules/copy-commands.md`에 Hybrid 섹션 공식 추가

---

## 마이그레이션 영향

### 후방 호환 (변경 없음)

- 기존 `/plan-screen` 호출 → 기본값 프레임워크로 폴백
- 기존 `/plan-draft` 호출 스크립트 → 커맨드 서명 유지
- 기존 `/plan-bridge` 호출 스크립트 → 커맨드 서명 유지
- 기존 `/dev-feature` Phase A 호출 → 기존 출력 형태 유지
- 기존 `/copy-reference-refresh` 호출 → `--reference-only` 미지정 시 기존 동작

### 신규 권장 사용법

- `/plan-screen {IDEA-ID} --framework rice` 명시 권장
- `/copy-reference-refresh --reference-only` 플래그를 Hybrid 세션에서 사용
- CLAUDE.md에 "plan 도메인 기본 설정" 섹션 추가 (프레임워크 기본값 지정)

### 주의 사항

- dev-architect의 read-only 성격은 **유지**. Edit 권한 부여 아님 (B안 체이닝 선택)
- `/dev-feature` Phase C 체이닝 자동 적용 — 기존 수동 위임 스크립트가 있으면 **제거 권장** (중복 동작 방지)

---

## 신규 에이전트/커맨드/훅

### 에이전트

- `plan-draft-writer`
- `plan-bridge-writer`

### 훅

- `agent-completion-cache-invalidate` (core)

### 플래그/파라미터

- `/plan-screen --framework rice|5axis`
- `/copy-reference-refresh --reference-only`

### 스키마

- `edit-coordinates.schema.json` (dev)
- `rice.schema.json` / `5axis.schema.json` (plan)

---

## 검증 시나리오

### 필수 통과 조건

`dash-preview-phase3` 복제 회귀 테스트 1회 이상 PASS:

| 지표 | 요구 값 |
|------|:-:|
| Phase C 재위임 | **0회** |
| 프레임워크 drift | **0건** |
| Read 캐시 에러 | **< 1%** |
| Hybrid 수동 지시 | **0회** |
| 수동 Edit 건수 | **< 15** |
| 단위 테스트 | **27건 통과** |

상세: [06-verification-strategy.md](06-verification-strategy.md) 참조.

---

## 제외 (2.3.0으로 이월)

본 릴리스에서 제외되고 2.3.0에서 처리되는 항목:

- `/plan-review` 자동 후속 트리거 (IMP-KIT-007)
- Checkpoint 자동 진행 플래그 (IMP-KIT-016)
- 재복제 금지 Skill 강제 (IMP-KIT-017)
- screener 메모리/권한 보완 (IMP-KIT-008, 009)
- wireframe 체크리스트 확장 (IMP-KIT-010)
- architect/doc-updater 스키마 확장 (IMP-KIT-011 추가 작업)
- bridge ↔ Phase A 경계 (IMP-KIT-012)
- Dev 착수 Gate 조기 플래그 (IMP-KIT-013)
- stage-manifest 스키마 버전 관리 (IMP-KIT-014)
- TASK ID 네이밍 표준 (IMP-KIT-015)

---

## 별도 이니셔티브 (본 릴리스 외)

**파이프라인 피드백 자동 아카이빙 시스템** (Codex/Claude 환경 구분 포함)은 본 릴리스에 포함되지 않는다. Phase 2 설계 문서 패키지(`docs/plan/kit-feedback-archiving/`)에서 독립적으로 진행 예정. 관련 항목 IMP-KIT-007은 Phase 2 설계와 통합 구현된다.

---

## 알려진 이슈

릴리스 후 발견된 이슈는 릴리스 노트에 추가 기록 예정. 초안 단계에서는 공란.

---

## 기여자

본 릴리스는 **dash-preview-phase3 세션 회고** 산출물 기반. 회고 문서 작성: AI 에이전트 (2026-04-17). 본 로드맵 작성: claude-kit roadmap author (2026-04-20).

---

## 링크

- [Executive Summary](00-executive-summary.md)
- [Roadmap 2.2.0 → 2.4.0+](02-roadmap-2.2.0-to-2.4.0.md)
- [P0 상세 스펙](03-p0-detailed-specs/)
- [Verification Strategy](06-verification-strategy.md)
- 원본 회고: `C:/Program Files (user)/mologado/.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
