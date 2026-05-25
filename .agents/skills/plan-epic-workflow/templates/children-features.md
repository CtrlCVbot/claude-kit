# Children Features — EPIC-{YYYYMMDD}-{NNN}

> {Epic 제목} 의 자식 Feature 실행 지도.

---

## 1. Feature 목록

### F1 — {Feature 제목}

- **IDEA**: [IDEA-{YYYYMMDD}-{NNN}](../../../ideas/{status}/IDEA-{NNN}.md)
- **Lane**: {번호} ({Lane 특성 요약})
- **RICE 예상**: {점수} ({Reach} × {Impact} × {Confidence}% / {Effort})
- **범위**: {주 작업 파일 또는 영역}
- **상태**: {Feature 상태 — SSOT: [`plan-epic-hierarchy.md §5-2`](../../../rules/plan-epic-hierarchy.md)}

### F2 — {Feature 제목}

- **IDEA**: ...
- **Lane**: ...
- **RICE 예상**: ...
- **범위**: ...
- **상태**: ...

### F3, F4, ...

{동일 양식 반복}

---

## 2. 의존성 매트릭스

|         | F1  | F2  | F3  | F4  |
|---|:---:|:---:|:---:|:---:|
| F1      | —   | {✓/X/△} | ... | ... |
| F2      |     | —   | ... | ... |
| F3      |     |     | —   | ... |
| F4      |     |     |     | —   |

**범례**:
- `✓`: 완전 독립 병렬 가능
- `→`: 순차 필요 (왼쪽 완료 후 오른쪽 착수)
- `X`: 파일/범위 충돌 (동시 실행 금지)
- `△`: 대부분 독립 (부분 충돌, 주의 필요)

---

## 3. 실행 순서 (Phase 기반)

### Phase A ({기간}) — {Phase 제목}

**이유**: {왜 이 Phase 가 먼저인가 — RICE 우선순위 / Lite 우선 / 블로킹 해제 등}

- {Feature 또는 Feature 조합}
- {작업 개요}
- 예상 완료: **M-Epic-{N}**

### Phase B ({기간}) — {Phase 제목}

**이유**: {Phase A 완료 후 진입 사유 — 의존성 해소 / 병렬 가능 등}

- {Feature}
- {Feature}

### Phase C ({기간}) — {Phase 제목}

{필요 시 추가 Phase}

---

## 4. 진행 대시보드

(수동 업데이트 — Phase 3 에서 `plan-epic-integrity.js` 자동화 후보)

| Feature | 상태 | TASK 진행 | 테스트 | 번들 영향 | 리뷰 |
|---|:---:|:---:|:---:|:---:|:---:|
| F1 | pending | — | — | — | — |
| F2 | pending | — | — | — | — |
| F3 | pending | — | — | — | — |
| F4 | pending | — | — | — | — |

상태 값 SSOT: [`plan-epic-hierarchy.md §5-2`](../../../rules/plan-epic-hierarchy.md).

---

## 5. Screening 권장 순서

자식 Feature 가 `00-inbox/` 상태일 때 `/plan-screen` 실행 순서 (RICE 내림차순 권장):

1. **IDEA-{NNN}** (RICE {점수}, {Lite | Standard}) — {사유}
2. **IDEA-{NNN}** — ...
3. **IDEA-{NNN}** — ...
4. **IDEA-{NNN}** — ...

---

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| {YYYY-MM-DD} | 초안 — {Feature 수} 개 Feature 순서 + 의존성 매트릭스 |
