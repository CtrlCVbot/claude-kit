# Epic Binding: {feature-slug}

> **Feature**: {slug}
> **Epic**: EPIC-{YYYYMMDD}-{NNN}
> **연결일**: {YYYY-MM-DD}
> **연결 이유**: {왜 이 Feature 가 Epic 에 속하는가 — 1~2 문장}

---

## 1. Epic 컨텍스트

- **Epic 목표**: {Epic Brief §2 "성공 지표" 핵심 3개 요약}
- **이 Feature 의 Epic 내 역할**: {Phase/Lane/Feature 번호 + 1~2 문장}

---

## 2. 자매 Feature (같은 Epic 소속)

| Feature | 상태 | 의존 관계 | 참조 |
|---|:---:|---|---|
| {sibling1-slug} | {상태} | {본 Feature 의 선행 / 병렬 / 후행} | [PRD](../../{sibling1-slug}/02-package/01-prd-freeze.md) |
| {sibling2-slug} | {상태} | {병렬 독립 (⊥)} | [PRD](../../{sibling2-slug}/02-package/01-prd-freeze.md) |
| ... | ... | ... | ... |

---

## 3. Epic 레벨 공통 결정 (본 Feature 에 영향)

Epic 의 `04-decision-log.md` 에서 본 Feature 에 적용되는 결정을 나열:

- **{결정 ID/제목}**: {결정 내용 + 본 Feature 영향 1 줄}
- ...

(Epic decision-log 가 없으면 본 섹션 빈 값 유지)

---

## 4. Epic 범위 cross-reference

- **Epic Brief**: [`00-epic-brief.md`](../../../../epics/{status}/EPIC-{YYYYMMDD}-{NNN}/00-epic-brief.md)
- **Children Features**: [`01-children-features.md`](../../../../epics/{status}/EPIC-{YYYYMMDD}-{NNN}/01-children-features.md)
- **Epic Roadmap (선택)**: [`02-roadmap.md`](../../../../epics/{status}/EPIC-{YYYYMMDD}-{NNN}/02-roadmap.md)

---

## 5. 해제 방법 (롤백)

본 Feature 를 Epic 에서 분리하려면:

1. 본 파일 (`08-epic-binding.md`) 삭제
2. Epic 의 `01-children-features.md` 에서 해당 Feature 행 제거
3. `.plans/ideas/backlog.md` (또는 `.plans/archive/index.md`) 의 epic 컬럼 `—` 로 복원
4. Feature 의 PRD 상단 `**Epic**:` 메타 라인 제거 (있으면)

`plan-epic-integrity.js` hook (Phase 2 disable 기본) 이 위 4 단계 중 일부 누락 시 경고.

---

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| {YYYY-MM-DD} | 초안 — EPIC-{NNN} 에 연결 |
