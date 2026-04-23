# Epic: {제목}

> **ID**: EPIC-{YYYYMMDD}-{NNN}
> **상태**: (SSOT: [`plan-epic-hierarchy.md §4`](../../../rules/plan-epic-hierarchy.md))
> **기간**: {YYYY-MM-DD} ~ {YYYY-MM-DD} (예상)
> **책임자**: {이름 / 팀}
> **예상 RICE (가중합)**: {점수 — 자식 Feature RICE 평균 또는 합산 명시}

---

## 1. 목적 (Why)

{왜 이 Epic 이 필요한가 — 1~2 문단으로 배경·문제의식·가치 제안 작성}

---

## 2. 성공 지표 (What)

측정 가능한 성과 3~5 개를 명시한다. 각 지표는 구현 시점에 수집 가능한 형태로 기술.

- {지표 1 — 예: AI 추출값 ↔ 폼 적용값 완전 일치}
- {지표 2 — 예: 재방문 시 3개 이상 시나리오 순환}
- {지표 3 — 예: axe-core 라이트 모드 0 violations}
- {지표 4}
- {지표 5}

---

## 3. 범위 (Scope)

### In-scope (자식 Feature 목록)

- **F1**: {Feature 제목} (IDEA-{YYYYMMDD}-{NNN})
  - {범위 요약}
- **F2**: {Feature 제목} (IDEA-{YYYYMMDD}-{NNN})
- **F3**: ...
- **F4**: ...

### Out-of-scope

{Epic 범위에서 명시적으로 제외하는 것 3~5 개. 차기 Epic 후보로 이관}

- {항목 1 — 차기 Epic 후보}
- {항목 2 — 별도 Phase}
- ...

---

## 4. 자식 Feature 요약

상세는 [`01-children-features.md`](./01-children-features.md) 참조.

| Feature | 예상 RICE | 권장 순서 | Lane | Target 기간 |
|---|:---:|:---:|:---:|---|
| {F1 slug} | {점수} | {1차/2차/...} | {번호} | {YYYY-MM-DD ~ YYYY-MM-DD} |
| {F2 slug} | {점수} | ... | ... | ... |

---

## 5. 마일스톤 (Epic 수준)

- **M-Epic-1 ({YYYY-MM-DD})**: {마일스톤 1 설명}
- **M-Epic-2 ({YYYY-MM-DD})**: {마일스톤 2 설명}
- **M-Epic-3 ({YYYY-MM-DD})**: {전체 완료 / Epic archived}

---

## 6. 리스크

| # | 리스크 | 완화 |
|---|---|---|
| 1 | {리스크 1} | {완화 방안} |
| 2 | ... | ... |
| 3 | ... | ... |

---

## 7. 자식 IDEA 링크

- [IDEA-{NNN} — F1 제목](../../../ideas/{status}/IDEA-{NNN}.md)
- [IDEA-{NNN} — F2 제목](../../../ideas/{status}/IDEA-{NNN}.md)
- ...

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| {YYYY-MM-DD} | 초안 — {간단 설명} |
