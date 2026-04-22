---
제목: Stakeholder Approval — 2.3.0 Roadmap (D1/D2/D3)
작성일: 2026-04-21
승인일: 2026-04-21
대상: 이해관계자 (결정권자)
관련 리뷰: [2026-04-21-maintainer-technical-review.md](2026-04-21-maintainer-technical-review.md) · [2026-04-21-issues-resolved.md](2026-04-21-issues-resolved.md)
상태: approved
---

# Stakeholder Approval — 2.3.0 Roadmap

> **결론**: D1 ✅ · D2 ✅ · D3 ✅. 최종 결과: **전체 승인 (2026-04-21)**. 이 결과에 따라 [docs/archive/kit-2.3.0-roadmap/](..) 20 파일을 `draft → reviewed`로 일괄 승격하고, [08-next-steps §2 인프라 준비](../08-next-steps-execution-plan.md#2단계--인프라-준비-12주) 단계로 이행한다.

---

## 작성 안내

- 본 문서는 **템플릿**. 이해관계자가 각 D 항목의 ☐를 ☑로 표기하고 **서명란을 기입**한다.
- 기입 완료 후 frontmatter `상태: draft (승인 대기)` → `approved` (또는 `rejected`)로 승격.
- 조건부 승인 시 각 D의 **조건 섹션**에 조건 명시. 조건 미충족 시 효력 발생하지 않음.

---

## 1. 승인 대상 및 효력

### 1.1 승인 대상

본 승인은 [docs/archive/kit-2.3.0-roadmap/](..) 로드맵 패키지 전체의 **실행 개시**를 승인한다. 포함 범위:

- P1 11건 ([02-p1-execution-plan §2](../02-p1-execution-plan.md#2-rice-재정렬표-ssot))
- 피드백 아카이빙 트리거 부분 ([04-feedback-archiving-integration](../04-feedback-archiving-integration.md))
- Breaking Changes 3건 ([06-release-notes §Breaking Changes](../06-release-notes-2.3.0-skeleton.md#breaking-changes))

### 1.2 효력 발생 시점

- **전체 승인 (D1+D2+D3 모두 ☑)**: 승인일 기입 직후
- **부분 승인 (일부 반려)**: 반려 항목 제외하고 진행, 대체안 협의
- **조건부 승인**: 조건 섹션 명시된 조건 충족 확인 후

### 1.3 승인 후 자동 실행 작업

1. 20 파일 frontmatter `상태: draft → reviewed` 일괄 승격
2. [08-next-steps §2](../08-next-steps-execution-plan.md#2단계--인프라-준비-12주) 인프라 준비 착수
3. 릴리스 노트 스켈레톤([06](../06-release-notes-2.3.0-skeleton.md))에 승인일 기입

---

## 2. D1 — P1 11건 RICE 재정렬표 승인

### 2.1 결정 내용

P1 11건의 실행 순서를 **그룹(Phase 2.1/2.2/2.3) + 그룹 내 RICE 내림차순**으로 확정한다. [02-p1-execution-plan §2](../02-p1-execution-plan.md#2-rice-재정렬표-ssot)가 SSOT.

### 2.2 주요 정렬 결과

```
Phase 2.1: 007 (24) → 016 (22.5) → 017 (18)
Phase 2.2: 009 (45) → 008 (36) → 010 (36) → 011 (24)
Phase 2.3: 015 (30) → 013 (18) → 012 (13.5) → 014 (12)
```

### 2.3 메인테이너 권고

**✅ 승인 권고** — RICE 데이터가 4단계 문서(원본 회고 → 04-backlog-summary → 02-execution-plan → 03-specs) 간 100% 일치. 근거: [_reviews/2026-04-21-maintainer-technical-review.md §4.1](2026-04-21-maintainer-technical-review.md#41-d1--p1-11건-rice-재정렬표-승인)

### 2.4 이해관계자 결정

- [x] **승인** — RICE 재정렬표를 실행 SSOT로 확정
- [ ] **조건부 승인** — 아래 조건 충족 시 승인
- [ ] **반려** — 대체 정렬 기준 논의 필요

### 2.5 조건 / 반려 사유 (해당 시 기입)

```
___________________________________________________________
___________________________________________________________
___________________________________________________________
```

---

## 3. D2 — 피드백 아카이빙 수집 로직 2.3.0+ 이월 승인

### 3.1 결정 내용

[kit-feedback-archiving](../../kit-feedback-archiving/) 시스템 중 **트리거 부분(IMP-KIT-007)만 2.3.0에 포함**하고, **수집 로직(feedback-collector 훅 본체)·Codex fallback·월 단위 롤업은 2.3.0+ (Phase 3~5)로 이월**한다. [04-feedback-archiving-integration §5](../04-feedback-archiving-integration.md#5-230-포함-범위-vs-이월-범위)가 SSOT.

### 3.2 포함 vs 이월

| 범위 | 항목 |
|------|------|
| ✅ 2.3.0 포함 | IMP-KIT-007 트리거 / IMP-KIT-016 auto-proceed / IMP-KIT-017 재복제 금지 / IMP-KIT-024 stub |
| ⏳ 2.3.0+ 이월 | feedback-collector 본체 / 도메인별 수집 전략 / Codex fallback / 월 단위 롤업 / IMP-KIT-024 완전 구현 |

### 3.3 메인테이너 권고

**✅ 승인 권고** — kit-feedback-archiving 자체가 "Phase 3~5는 2.3.0+"로 명시. 수집 로직 포함 시 2.3.0 범위 30~40% 증가 → 4개월 기한 이탈 위험. 근거: [리뷰 §4.2](2026-04-21-maintainer-technical-review.md#42-d2--피드백-아카이빙-수집-로직-230-이월-승인)

### 3.4 이해관계자 결정

- [x] **승인** — Producer/Consumer 분리 구조로 진행
- [ ] **조건부 승인** — 아래 조건 충족 시 승인
- [ ] **반려** — 전체 2.3.0 포함 요구

### 3.5 조건 / 반려 사유 (해당 시 기입)

```
___________________________________________________________
___________________________________________________________
___________________________________________________________
```

---

## 4. D3 — Breaking Changes 3건 수용 승인

### 4.1 결정 내용

2.3.0 릴리스에 아래 3건의 Breaking Change를 포함한다. [06-release-notes §Breaking Changes](../06-release-notes-2.3.0-skeleton.md#breaking-changes)가 SSOT.

| ID | 내용 | 완화 |
|----|------|------|
| **BC-2.3.0-01** | TASK ID 네이밍 규칙 강제 (4패턴) | 경고 수준 시작 → 2.4.0에서 차단 |
| **BC-2.3.0-02** | stage-manifest.json `schema_version` 필수 | 기존 파일은 v0 간주, 마이그레이션 헬퍼 제공 |
| **BC-2.3.0-03** | edit-coordinates ajv 런타임 검증 | v1 payload 그대로 통과 — **하위호환 보장** |

### 4.2 메인테이너 권고

**✅ 승인 권고 (경고 수준부터 점진 차단)** — BC-03은 사실상 하위호환, "Behavioral Change (하위호환)" 분류 재검토 여지. BC-01/02는 마이그레이션 가이드 제공으로 사용자 부담 최소화. 근거: [리뷰 §4.3](2026-04-21-maintainer-technical-review.md#43-d3--breaking-changes-3건-수용-승인)

### 4.3 이해관계자 결정 (항목별 개별 승인 가능)

#### BC-2.3.0-01 TASK ID 네이밍

- [x] 승인 (경고 수준 → 점진 차단)
- [ ] 조건부 승인
- [ ] 반려

#### BC-2.3.0-02 stage-manifest schema_version

- [x] 승인 (마이그레이션 헬퍼 제공 전제)
- [ ] 조건부 승인
- [ ] 반려

#### BC-2.3.0-03 edit-coordinates ajv 검증

- [x] 승인 (Breaking 유지)
- [ ] 승인하되 **"Behavioral Change (하위호환)"** 분류로 재분류
- [ ] 조건부 승인
- [ ] 반려

> **참고**: BC-03의 "Behavioral Change 재분류" 권고(메인테이너 리뷰 §4.3)는 릴리스 노트 확정 시점에 재검토 가능한 후속 액션으로 이월.

### 4.4 조건 / 반려 사유 (해당 시 기입)

```
___________________________________________________________
___________________________________________________________
___________________________________________________________
```

---

## 5. 종합 승인

### 5.1 승인 총괄

- [x] **전체 승인** (D1+D2+D3 모두 승인) → 20 파일 즉시 `draft → reviewed` 승격
- [ ] **부분 승인** (일부만 승인) — 승인된 항목만 진행, 반려 항목은 별도 논의
- [ ] **조건부 승인** (조건 섹션 명시) — 조건 충족 확인 후 효력 발생
- [ ] **전체 반려** — 로드맵 재설계 논의

### 5.2 서명

| 역할 | 이름 | 날짜 | 서명 / 확인 수단 |
|------|------|------|-----------------|
| **이해관계자 (1차 승인자)** | jhpark (logishm) | 2026-04-21 | Claude Code 세션 내 구두 승인 ("좋습니다 종합 승인하고 다음단계로 진행해줘") |
| 이해관계자 (2차 승인자, 있으면) | — | — | — |
| 메인테이너 (확인) | Claude (메인테이너 역할) | 2026-04-21 | [2026-04-21-maintainer-technical-review.md](2026-04-21-maintainer-technical-review.md) 리뷰 완료 |

---

## 6. 사후 조치 (승인 후 실행 절차)

### 6.1 승인 효력 발생 시

1. 본 문서 frontmatter `상태: draft (승인 대기) → approved`
2. 아래 20 파일 frontmatter `상태: draft → reviewed` 일괄 Edit
   - 최상위 9: README, 00, 01, 02, 04, 05, 06, 07, 08
   - 상세 스펙 11: IMP-KIT-007 ~ IMP-KIT-017 (08의 미니 3건 포함)
3. 선행 리뷰 2건(`_reviews/`)은 이미 `reviewed` 상태 — 변경 불필요
4. [08-next-steps §2 인프라 준비](../08-next-steps-execution-plan.md#2단계--인프라-준비-12주) 착수

### 6.2 부분 승인 / 조건부 승인 시

1. 본 문서 frontmatter `상태: draft (승인 대기) → partial` 또는 `conditional`
2. 반려 항목 관련 문서는 `draft` 유지
3. 승인 항목에 대해서만 승격 + 인프라 준비 일부 착수
4. 반려 항목은 **별도 논의 문서** 생성: `_reviews/2026-__-__-{D번호}-discussion.md`

### 6.3 전체 반려 시

1. 본 문서 frontmatter `상태: draft (승인 대기) → rejected`
2. 모든 파일 `draft` 유지
3. 반려 사유를 바탕으로 로드맵 재설계 착수
4. 2.3.0 범위 재정의 필요 여부 검토

---

## 7. 조항 및 가정

- 본 승인은 2026-04-21 기준 [_reviews/2026-04-21-issues-resolved.md](2026-04-21-issues-resolved.md)에서 해소된 MEDIUM/LOW 이슈가 반영된 최종 상태를 대상으로 한다.
- 승인 후 구현 과정에서 발견되는 **신규 이슈**는 별도 PR·리뷰로 처리 (본 승인을 무효화하지 않음).
- Exit Criteria 미충족 항목의 2.3.1 이월 결정은 릴리스 시점에 별도 승인.

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 템플릿 초안 작성 (승인 대기) | Claude (메인테이너 역할) |
| 2026-04-21 | D1/D2/D3 전체 승인 기입 + 서명 + 상태 `approved` 승격 | jhpark (logishm) + Claude (메인테이너) |
