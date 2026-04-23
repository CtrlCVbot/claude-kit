# `04-implementation-hints.md` — 구현 힌트 템플릿 (T-BKLG-03, Backlog)

> **T-BKLG-03 (Phase A 피드백 Step 6, Backlog)**: Bridge 단계 TASK 힌트 ↔ 실제 구현 역기록 구조. 기획 vs 실제 괴리를 정량 기록하여 회고 품질 향상 + 기획 문서 stale 방지.

**활성화 조건**: `/dev-feature` + `/dev-run` 실사용 경험 축적 (현재 미검증). v2.6.0+ 승격 고려.

**현재 상태**: **구조 정의 완료**, dev 커맨드 역기록 로직은 활성화 시 구현.

---

## 파일 위치

`.plans/features/active/{slug}/00-context/04-implementation-hints.md`

---

## 섹션 구조

### §1~§4 (기존 — bridge-writer 작성)

- §1. 구조 바인딩 요약
- §2. 파일 배치 지도
- §3. TASK 의존성
- §4. 수락 기준

### §5. TASK 힌트 (T-BKLG-03 신설)

#### §5-A. 기획 단계 TASK 힌트 (plan-bridge-writer 1차 작성)

> **권한**: `plan-bridge-writer` 1 차 작성. 이후 read-only (dev 커맨드가 §5-A 를 수정하지 않음).

| 예상 TASK ID | PR | 범위 | 예상 소요 | AC 요약 |
|--------------|:---:|------|:-------:|--------|
| T-{AREA}-01 | PR-1 | {파일/영역} | {0.5~1 인·일} | {한 줄} |
| T-{AREA}-02 | PR-1 | ... | ... | ... |
| T-{AREA}-03 | PR-2 | ... | ... | ... |

#### §5-B. 실제 구현 TASK (`/dev-feature` 또는 `/dev-run` 역기록)

> **권한**: `dev-implementer` (또는 `/dev-feature` 호출 에이전트) 갱신 담당. T-RACE-01 `agent-file-ownership.md` 매트릭스 참조.

| 실제 TASK ID | PR | 범위 | 실제 소요 | 기획 대비 차이 | 상태 |
|--------------|:---:|------|:-------:|:-----------:|:---:|
| T-{AREA}-01 | PR-1 | ... | {실제} | {▼0.5 / ▲0.3 / 분할 / 병합} | {pending/active/completed} |
| T-{AREA}-02a | PR-1 | ... (쪼갬) | ... | 분할 | ... |
| T-{AREA}-02b | PR-2 | ... | ... | 분할 | ... |

차이 표기 규칙:

- `▼ N`: N 인·일 단축 (음수)
- `▲ N`: N 인·일 초과 (양수)
- `분할`: 기획 1 TASK 를 N 개로 나눔 (`{원본}a`, `{원본}b` 형식 권장)
- `병합`: 기획 N TASK 를 1 개로 통합
- `추가`: 기획에 없던 TASK 신규 발견

#### §5-C. 기획 ↔ 실제 괴리 분석 (archive 시 자동 생성)

> **권한**: `/plan-archive` 호출 시 자동 생성. 통계 + 정성 요약.

```markdown
### §5-C 괴리 분석 (archive 시점)

**통계**:
- 계획 대비 소요: ▼ 20% (7 인·일 → 5.6 인·일)
- TASK 수: 계획 5 → 실제 6 (+1 분할)
- PR 수: 계획 2 → 실제 2 (변화 없음)

**주요 괴리**:
- T-THEME-02/03 통합: next-themes 의 ThemeProvider wrapper 사용으로 2 TASK → 1 TASK 로 축소
- T-THEME-04 분할: 접근성 요구사항 추가 발견으로 4a/4b 로 나눔

**추가 발견**:
- {기획 단계에서 예상 못한 이슈 1}
- {기획 단계에서 예상 못한 이슈 2}

**회고 권장**:
- 유사 Feature 견적 시 ThemeProvider 패턴 존재 여부 확인
- 접근성 체크리스트를 PRD §10 NFR 에 미리 포함
```

---

## 작성 단계별 책임

| 단계 | 담당 | §5-A | §5-B | §5-C |
|------|------|:---:|:---:|:---:|
| bridge (`/plan-bridge`) | `plan-bridge-writer` | 1 차 작성 | 빈 표 (헤더만) | 빈 섹션 |
| dev 시작 (`/dev-feature`) | `dev-implementer` | read-only | 실제 TASK 목록 생성 | read-only |
| dev 진행 (`/dev-run`) | `dev-implementer` | read-only | actual_hours 갱신 | read-only |
| archive (`/plan-archive`) | `plan-archive` 커맨드 | read-only | 최종 상태 스냅샷 | 자동 생성 (통계 + 정성) |

---

## Agent File Ownership 매트릭스 (T-RACE-01 확장)

본 템플릿 활성화 시 `agent-file-ownership.md` 에 다음 추가:

| 파일 유형 | 1 차 작성 | 후속 갱신 | 메인 전담 |
|-----------|---------|---------|---------|
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md §5-A` | `plan-bridge-writer` | (없음, read-only) | — |
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md §5-B` | `dev-implementer` | `dev-implementer` (actual_hours) | — |
| `.plans/features/active/{slug}/00-context/04-implementation-hints.md §5-C` | `/plan-archive` | (없음, final) | — |

---

## 구현 체크리스트 (v2.6.0 승격 시)

- [ ] `plan-bridge-writer` 프롬프트에 §5-A 작성 지침 추가
- [ ] `dev-implementer` 에이전트 (또는 `/dev-feature`) 에 §5-B 역기록 로직 추가
- [ ] `/dev-run` 에 `actual_hours` 기록 로직 추가
- [ ] `/plan-archive` 에 §5-C 자동 생성 로직 추가
- [ ] `agent-file-ownership.md` 매트릭스 업데이트
- [ ] 테스트: Bridge → dev-feature → dev-run → archive 순환 테스트
- [ ] 문서: dev 커맨드에 역기록 정책 명시

---

## 하위 호환성

- 기존 Feature Package (v2.5.0 이하) 는 §5-A/B/C 구조 없음 — 그대로 유지
- 신규 Feature Package 만 본 템플릿 적용 (v2.6.0+ 활성화 후)
- archived Feature Package 는 원본 보존 (T-BRDG-01 원칙)

---

## 관련 자산

- **TASK**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BKLG-03.md`
- **Rule (확장 대상)**: `src/claude/core/rules/agent-file-ownership.md` (T-RACE-01)
- **Agent**: `plan-bridge-writer` (§5-A 1 차 작성), `dev-implementer` (§5-B 갱신)
- **Command**: `/dev-feature`, `/dev-run`, `/plan-archive` (v2.6.0+ 확장 예정)

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-BKLG-03 (Phase A 피드백 Step 6, Backlog) 구조 정의 | Claude (메인테이너 역할) |
