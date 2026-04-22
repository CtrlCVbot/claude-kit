---
제목: 04 Feedback Archiving Integration — Phase 3 착수 계약
작성일: 2026-04-21
대상: 메인테이너 (kit-feedback-archiving Phase 3 담당자)
선행 참조: `../kit-feedback-archiving/`
이해관계자 승인일: 2026-04-21 (D2)
상태: reviewed
---

# 04 Feedback Archiving Integration

> **결론**: [kit-feedback-archiving](../kit-feedback-archiving/) 설계를 2.3.0에 통합 구현하되, **IMP-KIT-007의 트리거 부분만 본 로드맵 Phase 2.1에서 구현**하고, **수집 로직(훅 스크립트 본체)은 kit-feedback-archiving Phase 3~5에서 확장**한다. 본 로드맵은 트리거의 Producer, kit-feedback-archiving은 Consumer다. [07 §2 모순 ①](07-boundary-and-contradictions.md#2-모순--imp-kit-007-구현-시점) · [07 §3 모순 ②](07-boundary-and-contradictions.md#3-모순--plan-review-자동-후속-주소권) 해소 결과를 본 문서가 운영 계약으로 구체화한다.

---

## 1. 역할 분담 (Producer/Consumer)

### 1.1 본 로드맵 (Producer)

- **IMP-KIT-007 트리거 부분** 설계·구현
- `/plan-prd`, `/plan-draft`, `/plan-wireframe` 종료 Stop 훅에서 `/plan-review` 자동 실행
- 수집 로직 부재 시 **no-op** (경고 없이 통과)
- SSOT: 본 로드맵 [`02-p1-execution-plan.md §3`](02-p1-execution-plan.md#3-phase-21--프로세스-자동화-1~4주)

### 1.2 kit-feedback-archiving (Consumer)

- **feedback-collector 훅 스크립트** 구현 (Phase 3)
- 본 로드맵의 트리거 지점에 **체이닝**
- 엔트리 JSON 생성·아카이빙·Codex fallback·월 단위 롤업
- SSOT: [kit-feedback-archiving/06-integration-with-roadmap.md](../kit-feedback-archiving/06-integration-with-roadmap.md)

### 1.3 경계선

| 활동 | 책임 패키지 | 근거 |
|------|-------------|------|
| Stop 훅 matcher 등록 | 본 로드맵 | IMP-KIT-007 spec |
| `settings.json` 훅 주입 로직 | 본 로드맵 | `scripts/setup.js` 갱신 |
| feedback-entry.json 생성 | kit-feedback-archiving | Phase 3.1 |
| `.claude/feedback-archive/` 디렉터리 구조 | kit-feedback-archiving | Phase 3 Layout |
| Codex fallback artifact | kit-feedback-archiving | Phase 4 |
| 롤업·요약 자동화 | kit-feedback-archiving | Phase 4.2 |

---

## 2. Phase 3 진입 조건 (본 로드맵이 제공)

kit-feedback-archiving Phase 3 착수가 가능하려면 **본 로드맵 Phase 2.1 완료**가 전제.

### 2.1 체크리스트

- [ ] IMP-KIT-007 트리거 훅 등록 완료 (`/plan-prd`·`/plan-draft`·`/plan-wireframe` matcher)
- [ ] IMP-KIT-016 auto-proceed 플래그 도입 (훅 체인 비차단 보증)
- [ ] IMP-KIT-017 재복제 금지 Skill 제약 도입 (엔트리 SSOT 원칙)
- [ ] 트리거 호출 로그 측정 가능 (Phase 3 베이스라인)

### 2.2 인계 산출물

본 로드맵 Phase 2.1 완료 시점에 kit-feedback-archiving Phase 3 착수팀에게 인계되는 것:

| 산출물 | 위치 | 목적 |
|--------|------|------|
| Stop 훅 matcher 예시 | `src/claude/plan/hooks/plan-review-trigger.js` | Phase 3 훅이 동일 matcher 재사용 |
| 훅 체인 표준 예시 | `scripts/setup.js` 갱신본 | 다중 훅 연쇄 패턴 |
| 트리거 호출 카운터 | (IMP-KIT-024 stub으로 시작, Phase 3에서 확장) | 베이스라인 측정 |

---

## 3. IMP-KIT-016/017 연계 지점

### 3.1 IMP-KIT-016 — Checkpoint 자동 진행 플래그

**연계 역할**: 훅 체인이 Checkpoint에서 정지하지 않음을 보증.

- kit-feedback-archiving의 feedback-collector는 엔트리 생성 후 **즉시 반환** (사용자 입력 대기 금지)
- IMP-KIT-016의 `--auto-proceed-on-pass` 플래그를 훅 스크립트 호출 시 기본 적용

### 3.2 IMP-KIT-017 — 재복제 금지

**연계 역할**: 아카이빙 엔트리의 SSOT 원칙 확립.

- 엔트리 JSON은 원본 세션 로그·에이전트 출력을 **복제하지 않고 경로 참조**
- 관련 필드: `metadata.source_session`, `metadata.source_agent_output` (경로 또는 해시)

---

## 4. IMP-KIT-024 Stub (v2.3.1에서 본체 승격)

### 4.1 2.3.0 Stub — 완료

IMP-KIT-024 (에이전트 호출 텔레메트리)는 2.3.0에서 **트리거 호출 카운터 최소 형태**만 도입.

- 파일: `.claude/telemetry-stub.json` (선택적 생성)
- 내용: `{ trigger_id, timestamp, agent_name }` 단순 배열
- 용도: Phase 3 진입 시 베이스라인 데이터 확보

### 4.2 v2.3.1 본체 승격 — IMP-AGENT-009

> **Status 갱신 (2026-04-22)**: stub → **superseded by IMP-AGENT-009**. 2.4.0+ 이월 대신 v2.3.1에서 본체 구현.

본체 스펙: [kit-agent-improvements/IMP-AGENT-009](../kit-agent-improvements/IMP-AGENT-009-agent-telemetry.md)

- 스키마: `src/claude/core/_schemas/agent-telemetry.schema.json` v1
- 훅: `src/claude/core/hooks/agent-telemetry-emit.js`
- 롤업: `src/claude/core/_utils/telemetry-rollup.js` (30일 이상 일별 파일 이관)
- 리포트: `/agent-report` 커맨드 (`src/claude/core/commands/agent-report.md`)
- SSOT 룰: `.claude/rules/agent-telemetry.md`

**사유**: kit-feedback-archiving Phase 3 완료로 필요한 인프라(SubagentStop 훅, collector, aggregator)가 조기 확보됨. IMP-AGENT-009가 IMP-KIT-024 stub을 본체로 승격시켜 2.4.0+ 이월 대신 v2.3.1에서 완료.

kit-feedback-archiving Phase 5는 IMP-AGENT-009와 **통합 완료**된 것으로 간주 ([06-integration-with-roadmap §3.4](../kit-feedback-archiving/06-integration-with-roadmap.md)).

---

## 5. 2.3.0 포함 범위 vs 이월 범위

### 5.1 2.3.0에 포함

- IMP-KIT-007 트리거 부분 (Stop 훅 등록, matcher)
- IMP-KIT-016 auto-proceed 플래그 + 훅 비차단 보증
- IMP-KIT-017 재복제 금지 Skill 제약
- IMP-KIT-024 stub (카운터 배열)

### 5.2 2.3.0+ 이월

- feedback-collector 본체 훅 스크립트 (Phase 3.1)
- 도메인별 수집 전략 (Phase 3.2)
- Codex fallback artifact (Phase 4.1)
- 월 단위 롤업 (Phase 4.2)
- ~~IMP-KIT-024 완전 구현 (Phase 5)~~ → **v2.3.1 IMP-AGENT-009로 조기 승격**

상세 일정: [kit-feedback-archiving/06-integration-with-roadmap §2](../kit-feedback-archiving/06-integration-with-roadmap.md)

---

## 6. 용어 재정의

모순 ② 해소 ([07 §3](07-boundary-and-contradictions.md#3-모순--plan-review-자동-후속-주소권))에 따른 용어 정정:

| kit-feedback-archiving 기존 표현 | 본 로드맵 기준 재해석 |
|----------------------------------|----------------------|
| "`/plan-review` 자동 후속 = **메인 트리거 지점**" | "`/plan-review` 자동 후속 = 아카이빙 시스템의 **주요 이벤트 소스**" |
| "IMP-KIT-007 = 본 시스템 메인 트리거" | "IMP-KIT-007의 트리거 부분은 2.3.0 Producer, 수집 로직은 kit-feedback-archiving Consumer" |

**주의**: 본 로드맵은 kit-feedback-archiving 파일을 수정하지 않는다. 위 표현은 kit-feedback-archiving 향후 업데이트 시 반영 권장.

---

## 7. 리스크 및 완화

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| 트리거 체인이 수집 로직 부재 시 오동작 | 중 | no-op 기본, 수집 훅 추가 시 체이닝 |
| auto-proceed가 중요 Checkpoint까지 스킵 | 중 | IMP-KIT-016 스펙에 "Critical Checkpoint 화이트리스트" 정의 |
| Phase 3 진입 전 트리거만 도입된 상태가 장기화 | 저 | 2.3.0 릴리스와 Phase 3 착수 간격 ≤ 1개월 목표 |

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 2 Layer 2) | claude-kit roadmap author |
