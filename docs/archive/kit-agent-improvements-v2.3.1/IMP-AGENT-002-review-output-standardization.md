# IMP-AGENT-002 — dev-code-reviewer 출력 표준화

> **결론**: IMP-KIT-028(decision-log 자동 기록)과 IMP-KIT-035(Top 3 수술적 처리 룰)를 **dev-code-reviewer 출력 스키마**로 일원화한다. 두 IMP가 동일한 에이전트 출력을 서로 다른 관점에서 소비하는 구조이므로, 계약을 먼저 정의하는 편이 중복을 제거한다.

**축**: Process Gaps (기획↔개발 핸드오프)
**우선순위**: P1
**공수**: M
**Breaking Change**: **yes** (BC-2.3.1-01)
**타깃 릴리스**: v2.3.1
**기반**: IMP-KIT-028 + IMP-KIT-035 (병합)
**관련 에이전트**: `dev-code-reviewer`

---

## 1. 문제 (증거 기반)

- IMP-KIT-028: Milestone review 결과를 decision-log에 **수동으로** 옮기는 과정에서 dash-preview-phase3 M3에서 **1회 누락**, M5에서 **포맷 불일치 2회**
- IMP-KIT-035: 리뷰 Top 3 수술적 처리 rule은 정의되었으나, **어느 에이전트 출력에 반영될지 미명시**
- 두 IMP 모두 dev-code-reviewer **출력 포맷을 건드리는 개선**이지만 서로 독립적으로 설계되어 **출력 계약 이중 정의** 위험

## 2. 해결책

### 2.1 출력 스키마 정의

`src/claude/dev/_schemas/review-output.schema.json` 신설:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["summary", "top3_surgical", "decision_log_entries"],
  "properties": {
    "summary": {
      "type": "object",
      "properties": {
        "severity_counts": {
          "critical": "integer",
          "high": "integer",
          "medium": "integer",
          "low": "integer"
        },
        "verdict": { "enum": ["PASS", "WARN", "FAIL"] }
      }
    },
    "top3_surgical": {
      "type": "array",
      "maxItems": 3,
      "items": {
        "type": "object",
        "required": ["issue_id", "file_path", "severity", "surgical_fix"],
        "properties": {
          "issue_id": "string",
          "file_path": "string",
          "line_range": "string",
          "severity": { "enum": ["CRITICAL", "HIGH"] },
          "surgical_fix": "string"
        }
      }
    },
    "decision_log_entries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["decision_id", "context", "rationale"],
        "properties": {
          "decision_id": "string",
          "context": "string",
          "rationale": "string",
          "tags": ["string"]
        }
      }
    }
  }
}
```

### 2.2 dev-code-reviewer 프롬프트 확장

```markdown
## Output Contract (v1)

모든 리뷰는 `review-output.schema.json` v1 준수. 본문 외 JSON 블록을 마지막에 포함:

\`\`\`json
{
  "summary": { ... },
  "top3_surgical": [ ... ],
  "decision_log_entries": [ ... ]
}
\`\`\`

**top3_surgical 선정 기준** (IMP-KIT-035):
1. CRITICAL 또는 HIGH severity
2. 독립적 수정 가능 (다른 이슈에 의존하지 않음)
3. 수술적 변경 (5파일 이하, 50줄 이하)

**decision_log_entries 필수 포함** (IMP-KIT-028):
- 논쟁 있던 리뷰 코멘트의 최종 판정
- `rationale`에 근거 제시
```

### 2.3 소비자

| 소비자 | 사용 필드 | 비고 |
|---|---|---|
| decision-log 훅 (IMP-KIT-028) | `decision_log_entries` | 자동 append |
| rule 문서 (IMP-KIT-035) | `top3_surgical` | rule 예시로 참조 |
| 텔레메트리 (IMP-AGENT-009) | `summary.severity_counts` | 리뷰 품질 지표 |

---

## 3. Breaking Change (BC-2.3.1-01)

**영향**: dev-code-reviewer 출력을 파싱하는 기존 소비자 (현재는 사용자 수동 소비만)
**마이그레이션 비용**: 낮음. 기존 사용자는 출력을 수동 읽기만 했으므로 호환성 부담 없음
**전환**: v2.3.1에서 스키마 도입, v2.4.0에서 validation 강제

---

## 4. 구현 범위

**파일**:
- `src/claude/dev/_schemas/review-output.schema.json` (신규)
- `src/claude/dev/_schemas/_router.js` — review-output 라우팅 추가
- `src/claude/dev/agents/dev-code-reviewer.md` — Output Contract 섹션 추가
- `src/claude/dev/hooks/review-decision-log-auto.js` (IMP-KIT-028 구현 시) — `decision_log_entries` 소비
- `.claude/rules/review-top-three-surgical.md` (IMP-KIT-035 구현 시) — `top3_surgical` 참조

**테스트**:
- 출력 스키마 validation 테스트
- top3 3건 초과 시 reviewer에게 재요청 로직
- decision-log 훅 통합 테스트

---

## 5. ROI

- **정방향**: 2개 IMP를 1개 계약으로 통합 → 유지보수 비용 50% 감소
- **측정**: decision-log 누락 0건 / Top 3 포맷 일관성 100%
- **비용**: 스키마 신규 1건 + 에이전트 프롬프트 확장. over-engineering 없음

---

## 6. 수락 기준

- [ ] review-output.schema.json v1 ajv validation 통과
- [ ] dev-code-reviewer가 모든 리뷰 세션에서 JSON 블록 포함
- [ ] top3_surgical 최대 3건 강제
- [ ] IMP-KIT-028 decision-log 훅이 `decision_log_entries` 소비
- [ ] IMP-KIT-035 rule 문서가 `top3_surgical` 예시로 참조

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-KIT-028 + 035 병합 재해석 |
