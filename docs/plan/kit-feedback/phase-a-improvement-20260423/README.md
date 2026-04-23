# Phase A Dry-Run 피드백 개선 패키지

> **패키지 목적**: `phase-a-dry-run-20260423/` 피드백(18 제안)을 claude-kit 자산(커맨드 11 · 에이전트 10 · 훅 4 · 룰 · 스킬 9)에 매핑하여 **실행 가능한 TASK 18 건**으로 분해. v2.4.1 긴급 개선 + v2.5.0 중기 + Backlog 3 단계 릴리스 배치.

**패키지 생성일**: 2026-04-23
**상위 입력**: [`phase-a-dry-run-20260423/`](../phase-a-dry-run-20260423/) (6 문서, 1,778 라인)
**대상 버전**: claude-kit v2.4.1 (긴급 개선) + v2.5.0 (중기) + Backlog

---

## 읽는 순서

| # | 파일 | 내용 |
|---|------|------|
| 00 | [`README.md`](README.md) (본 문서) | 패키지 개요 + 릴리스 배치 요약 |
| 01 | [`01-overview.md`](01-overview.md) | 수용 범위 + AC-1~8 + 리스크 + BC 여부 |
| 02 | [`02-feedback-digest.md`](02-feedback-digest.md) | 피드백 18 건 요약 + P0/P1/P2 재분류 |
| 03 | [`03-kit-inventory.md`](03-kit-inventory.md) | plan 도메인 현재 인벤토리 + 피드백 매핑 |
| 04 | [`04-proposal.md`](04-proposal.md) | 10 영역 개선 제안 + 릴리스 배치 |
| 05 | [`05-tasks/`](05-tasks/) | T-EPMV-01 ~ T-BKLG-03 원자 TASK (18 건) |

---

## 핵심 요약

### 피드백 규모

- **관찰 세션**: landing 프로젝트, Phase A Step 1~8 실제 실행 (2026-04-22 ~ 04-23)
- **사용 자산**: 커맨드 7 · 에이전트 6 · 생성 파일 25+ · Edit ~50 회 · Bash 6 회
- **관찰 항목**: 긍정 18 + 불편 18 + 제안 18 + 커맨드/에이전트 상세 피드백

### 10 개선 영역

| # | AREA | 우선순위 | 릴리스 | TASK 수 |
|:-:|------|:---:|:---:|:---:|
| 1 | **EPMV** (Epic Move 자동화) | 🔴 Critical | v2.4.1 | 3 |
| 2 | **FSTATE** (Feature 상태 SSOT) | 🟠 High | v2.4.1 | 2 |
| 3 | **RACE** (에이전트 충돌 방지) | 🟠 High | v2.4.1 | 2 |
| 4 | **RICE** (Lane 가중 규칙 SSOT) | 🟠 High | v2.4.1 | 1 |
| 5 | **BRDG** (Bridge 최적화) | 🟡 Medium | v2.5.0 | 2 |
| 6 | **PCC** (PRD 검증 확장) | 🟡 Medium | v2.5.0 | 1 |
| 7 | **TMPL** (Phase 템플릿화) | 🟡 Medium | v2.5.0 | 1 |
| 8 | **SHOW** (Epic 조회 개선) | 🟡 Medium | v2.5.0 | 2 |
| 9 | **REVP** (수정 프로토콜) | 🟡 Medium | v2.5.0 | 1 |
| 10 | **BKLG** (Backlog 묶음) | 🟢 Low | Backlog | 3 |

**합계**: 18 TASK, 3 단계 릴리스 배치 (Critical 3 + High 5 + Medium 7 + Low 3)

### Breaking Change

**v2.4.1 없음**. 모든 High/Critical 개선은 신규 추가 또는 opt-in 확장. **v2.5.0 minor 가능성** — `plan-bridge-writer` 5 파일 경량화(T-BRDG-01)가 기존 Feature Package 구조 소비자(dev-implementer)에 영향 가능 → proposal §5 참조.

### 수용 기준

[`01-overview.md §4`](01-overview.md) AC-1 ~ AC-8 — Epic advance 1 커맨드 · 상태 SSOT 동기 · race 0 · Lane 규칙 SSOT · Bridge 40% 축소 · PCC 8 종 · Phase 템플릿 · show 실사용.

---

## 피드백 원본과의 관계

| 피드백 원본 | 본 패키지 대응 | 비고 |
|-----------|--------------|------|
| `04-improvement-proposals.md` I-01 | T-EPMV-01 | Critical, 그대로 수용 |
| `04-improvement-proposals.md` I-02 | T-FSTATE-01 | High, 그대로 수용 |
| `04-improvement-proposals.md` I-03 | T-RACE-01 | High, 그대로 수용 |
| `04-improvement-proposals.md` I-04 | T-RACE-02 | High, 그대로 수용 |
| `04-improvement-proposals.md` I-05 | T-RICE-01 | High, 그대로 수용 |
| `04-improvement-proposals.md` I-06 | T-EPMV-03 | Medium→Critical 승격 (I-01 과 통합 실익 큼) |
| `04-improvement-proposals.md` I-07 | T-TMPL-01 | Medium |
| `04-improvement-proposals.md` I-08 | T-EPMV-02 | Medium→Critical 승격 (I-01 과 통합) |
| `04-improvement-proposals.md` I-09 | T-BRDG-02 | Medium |
| `04-improvement-proposals.md` I-10 | T-PCC-01 | Medium |
| `04-improvement-proposals.md` I-11 | T-BRDG-01 | Medium |
| `04-improvement-proposals.md` I-12 | T-REVP-01 | Medium |
| `04-improvement-proposals.md` I-13 | T-SHOW-01 | Medium |
| `04-improvement-proposals.md` I-14 | T-FSTATE-02 | Medium→High 승격 (I-02 선행) |
| `04-improvement-proposals.md` I-15 | T-BKLG-03 | Low |
| `04-improvement-proposals.md` I-16 | T-BKLG-02 | Low |
| `04-improvement-proposals.md` I-17 | T-SHOW-02 | Low (SHOW-01 과 동일 영역) |
| `04-improvement-proposals.md` I-18 | T-BKLG-01 | Low |

**조정 사항** 3 건:
1. I-06 + I-08 을 I-01 에 통합한 T-EPMV AREA — 구현 범위 겹침 + Critical 일괄 처리
2. I-14 (Feature 상태 머신 명시) 를 High 로 승격 — I-02 구현 전 필수 선행 문서
3. 원본 I-17 (진행률 가시화) 을 SHOW AREA 에 편입 — `/plan-epic show` 와 동일 출력 지점

---

## 참조

### 피드백 원본

- [`phase-a-dry-run-20260423/README.md`](../phase-a-dry-run-20260423/README.md) — Executive Summary
- [`phase-a-dry-run-20260423/03-pain-points.md`](../phase-a-dry-run-20260423/03-pain-points.md) — N-01 ~ N-18 관찰 근거
- [`phase-a-dry-run-20260423/04-improvement-proposals.md`](../phase-a-dry-run-20260423/04-improvement-proposals.md) — I-01 ~ I-18 제안 원문
- [`phase-a-dry-run-20260423/05-command-agent-matrix.md`](../phase-a-dry-run-20260423/05-command-agent-matrix.md) — 커맨드·에이전트 개별 피드백

### 관련 kit 룰

- [`plan-epic-hierarchy.md`](../../../.claude/rules/plan-epic-hierarchy.md) — Epic 계층 SSOT
- [`checkpoint-policy.md`](../../../.claude/rules/checkpoint-policy.md) — Critical checkpoint 화이트리스트
- [`edit-coordinates-governance.md`](../../../.claude/rules/edit-coordinates-governance.md) — 에이전트 체이닝 계약
- [`verification.md`](../../../.claude/rules/verification.md) — Agent Edit Race 섹션
- [`task-id-naming.md`](../../../.claude/rules/task-id-naming.md) — `T-{AREA}-{NN}` 규칙

### 핵심 원칙

- [`golden-principles.md`](../../../.claude/rules/golden-principles.md) #5(작은 파일) · #9(HARD-GATE) · #10(증거 기반) · #12(수술적 변경) · #13(문서 중복 금지)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | 초안 — 피드백 18 제안 → 10 AREA 18 TASK 패키지화, 3 단계 릴리스 배치 |
