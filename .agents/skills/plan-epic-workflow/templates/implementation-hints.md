# `04-implementation-hints.md` 템플릿 — 사용법 문서

> **T-BKLG-03 (Backlog)**: Bridge 단계 TASK 힌트 ↔ 실제 구현 역기록 구조. v2.6.0+ 승격 시 활성화. 현재 상태는 **구조 정의 완료**, 자동 갱신 로직 미구현.

**순수 템플릿 본문**: [`implementation-hints.template.md`](./implementation-hints.template.md)
**활성화 조건**: `/dev-feature` + `/dev-run` 실사용 경험 축적 (현재 미검증)
**소비 주체**: `plan-bridge-writer` (§1~§5-A 1차 작성), `dev-implementer` (§5-B 역기록, v2.6.0+), `/plan-archive` (§5-C 자동 생성, v2.6.0+)
**거버넌스**: [`template-governance.md §3-2`](../../../../core/rules/template-governance.md)

---

## 1. 파일 위치

`.plans/features/active/{slug}/00-context/04-implementation-hints.md`

---

## 2. 섹션 구조

| 섹션 | 작성 주체 | 단계 |
|------|---------|------|
| §1 구조 바인딩 요약 | plan-bridge-writer | 1 차 작성 |
| §2 파일 배치 지도 | plan-bridge-writer | 1 차 작성 |
| §3 TASK 의존성 | plan-bridge-writer | 1 차 작성 |
| §4 수락 기준 | plan-bridge-writer | 1 차 작성 |
| §5-A 기획 힌트 | plan-bridge-writer | 1 차 작성 후 read-only |
| §5-B 실제 구현 | dev-implementer (v2.6.0+) | `/dev-feature` 호출 시 생성 |
| §5-C 괴리 분석 | `/plan-archive` (v2.6.0+) | archive 시 자동 |

---

## 3. 템플릿 본문 위치

순수 본문은 **[`implementation-hints.template.md`](./implementation-hints.template.md)** 에 있다. `/dev-feature` 또는 `plan-bridge-writer` 가 Feature Package 신설 시 복사하여 사용.

---

## 4. 작성 단계별 책임

| 단계 | 담당 | §5-A | §5-B | §5-C |
|------|------|:---:|:---:|:---:|
| bridge (`/plan-bridge`) | `plan-bridge-writer` | 1 차 작성 | 빈 표 (헤더만) | 빈 섹션 |
| dev 시작 (`/dev-feature`) | `dev-implementer` | read-only | 실제 TASK 목록 생성 | read-only |
| dev 진행 (`/dev-run`) | `dev-implementer` | read-only | actual_hours 갱신 | read-only |
| archive (`/plan-archive`) | `plan-archive` 커맨드 | read-only | 최종 상태 스냅샷 | 자동 생성 (통계 + 정성) |

---

## 5. 차이 표기 규칙 (§5-B)

- `▼ N`: N 인·일 단축 (음수 차이)
- `▲ N`: N 인·일 초과 (양수 차이)
- `분할`: 기획 1 TASK 를 N 개로 나눔 (`{원본}a`, `{원본}b` 형식 권장)
- `병합`: 기획 N TASK 를 1 개로 통합
- `추가`: 기획에 없던 TASK 신규 발견

---

## 6. Agent File Ownership 매트릭스 (T-RACE-01 확장)

본 템플릿 활성화 시 [`agent-file-ownership.md`](../../../../core/rules/agent-file-ownership.md) 에 다음 추가 (이미 반영됨):

| 파일 유형 | 1 차 작성 | 후속 갱신 | 메인 전담 |
|-----------|---------|---------|---------|
| `.../04-implementation-hints.md §5-A` | `plan-bridge-writer` | (read-only) | — |
| `.../04-implementation-hints.md §5-B` | `dev-implementer` | `dev-implementer` (actual_hours) | — |
| `.../04-implementation-hints.md §5-C` | `/plan-archive` | (없음, final snapshot) | — |

---

## 7. 구현 체크리스트 (v2.6.0 승격 시)

- [ ] `plan-bridge-writer` 프롬프트에 §5-A 작성 지침 추가
- [ ] `dev-implementer` 에이전트 (또는 `/dev-feature`) 에 §5-B 역기록 로직 추가
- [ ] `/dev-run` 에 `actual_hours` 기록 로직 추가
- [ ] `/plan-archive` 에 §5-C 자동 생성 로직 추가
- [x] `agent-file-ownership.md` 매트릭스 업데이트 (T-RACE-01 확장 반영 완료)
- [ ] 테스트: Bridge → `/dev-feature` → `/dev-run` → `/plan-archive` 순환 시나리오
- [ ] 문서: dev 커맨드에 역기록 정책 명시

---

## 8. 하위 호환성

- 기존 Feature Package (v2.5.0 이하) 는 §5-A/B/C 구조 없음 — 그대로 유지
- 신규 Feature Package 만 본 템플릿 적용 (v2.6.0+ 활성화 후)
- archived Feature Package 는 원본 보존 (T-BRDG-01 원칙)

---

## 9. 관련 자산

- **TASK**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-03.md`
- **Rule**: [`agent-file-ownership.md`](../../../../core/rules/agent-file-ownership.md) (T-RACE-01)
- **Rule**: [`template-governance.md`](../../../../core/rules/template-governance.md) §3-2 네이밍
- **Agent**: `plan-bridge-writer` (§5-A), `dev-implementer` (§5-B)
- **Command**: `/dev-feature`, `/dev-run`, `/plan-archive` (v2.6.0+ 확장 예정)

---

## 10. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-BKLG-03 (Phase A 피드백 Step 6, Backlog) 구조 정의 | Claude (메인테이너 역할) |
| 2026-04-23 | T-TMPL-05 — 템플릿 본문을 `implementation-hints.template.md` 로 분리. 본 파일은 사용법 문서로 재구성. | Claude (메인테이너 역할) |
