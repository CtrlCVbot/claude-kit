---
ID: IMP-KIT-015
제목: TASK ID 네이밍 규칙 표준화
우선순위: P1
영향 도메인: plan, dev
RICE: R3 × I2 × C5 ÷ E1 = 30
공수: S (1~2일)
Phase: 2.3
원본 타임라인: (관찰, Q7 관련) dash-preview-phase3 회고
선행 의존: 없음 (IMP-KIT-013과 공동 효과)
이해관계자 승인일: 2026-04-21 (BC-2.3.0-01 승인 포함)
상태: reviewed
---

# IMP-KIT-015 — TASK ID 네이밍 규칙 표준화

## 1. 문제 정의

TASK ID가 Feature마다 **혼재**: `T-HERO-01` (dev), `LEGACY` (접두사 없음), `M1-07` (마일스톤 기반), `TASK-{slug}` (plan 초안). 일관성 부재로 cross-ref·검색·리포팅이 불편하고, Legacy 구분도 시각적으로 불명확.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-015 라인 224~234](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- Q7 사례에서 Legacy 격리 미흡 — IMP-KIT-013과 연계

### 현재 상태 (2.2.0 완료 시점)

- 네이밍 규칙을 정의한 규칙 문서 **부재**
- 각 Feature의 TASK ID는 에이전트·사용자가 자유롭게 부여
- `golden-principles.md`에는 TASK ID 규칙 미포함

---

## 2. 제안 해결안

### 표준 규칙

| 도메인 | 패턴 | 예시 |
|--------|------|------|
| dev | `T-{AREA}-{NN}` | `T-HERO-01`, `T-AUTH-12` |
| plan | `TASK-{SLUG}-{NN}` | `TASK-hero-refresh-03` |
| Legacy | `LEGACY-{AREA}-{NN}` | `LEGACY-AUTH-07` |
| Spike | `SPIKE-{AREA}-{NN}` | `SPIKE-PERF-02` |

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: 규칙 문서 + 검증 훅** ⭐ | `task-id-naming.md` 규칙 + `plan-doc-guard.js`/`dev-feature-scope-guard.js`에 정규식 검증 | 자동 감지, 빠른 실패 | 기존 Feature 마이그레이션 필요 |
| B: 규칙 문서만 | 가이드라인만 제공 | 공수 최소 | 강제력 없음 |
| C: ESLint 유사 플러그인 | 전용 린터 | 표준 도구 경험 | 공수 과다, 범위 작음 |

**선택: A** — RICE C=5 달성에는 강제가 필수.

### 검증 정규식

```javascript
const TASK_ID_PATTERNS = {
  dev:    /^T-[A-Z]{2,6}-\d{2,3}$/,
  plan:   /^TASK-[a-z0-9-]{3,40}-\d{2,3}$/,
  legacy: /^LEGACY-[A-Z]{2,6}-\d{2,3}$/,
  spike:  /^SPIKE-[A-Z]{2,6}-\d{2,3}$/
}
```

### 아키텍처

```
TASK ID 작성 시점 (Draft/Phase A/B)
  ↓
plan-doc-guard.js / dev-feature-scope-guard.js
  ├─ Edit|Write 대상에 TASK ID 감지
  ├─ 4개 패턴 중 하나 매칭 여부 검사
  └─ [미매칭] 차단 + 수정 제안 표시
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/core/rules/task-id-naming.test.ts` (신규)

```typescript
import { validateTaskId, TASK_ID_PATTERNS } from '../../../../src/claude/core/_utils/task-id'

describe('TASK ID 네이밍 규칙', () => {
  it('dev 유효: T-HERO-01 통과', () => {
    expect(validateTaskId('T-HERO-01', 'dev')).toBe(true)
  })
  it('plan 유효: TASK-hero-refresh-03 통과', () => {
    expect(validateTaskId('TASK-hero-refresh-03', 'plan')).toBe(true)
  })
  it('Legacy 유효: LEGACY-AUTH-07 통과', () => {
    expect(validateTaskId('LEGACY-AUTH-07', 'legacy')).toBe(true)
  })
  it('무효: M1-07 거부 + 수정 제안 "T-M1-07" 반환', () => {
    const result = validateTaskId('M1-07', 'dev')
    expect(result).toBe(false)
  })
  it('무효: 접두사 없는 LEGACY 거부', () => {
    expect(validateTaskId('LEGACY', 'legacy')).toBe(false)
  })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/core/rules/task-id-naming.md` (신규) — 4개 패턴 SSOT
2. `src/claude/core/_utils/task-id.js` (신규) — 정규식 + validateTaskId 함수
3. `src/claude/plan/hooks/plan-doc-guard.js` — 편집 대상에서 TASK ID 추출·검증
4. `src/claude/dev/hooks/dev-feature-scope-guard.js` — 동일 검증 확장
5. `src/claude/core/rules/golden-principles.md` — "TASK ID 네이밍" 섹션 추가 (링크로 참조)

### 3.3 IMPROVE — 리팩토링

- 정규식 상수를 `src/claude/core/_constants/task-id-patterns.json`으로 분리
- 유틸·가드·테스트 동일 JSON 참조

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/hooks/plan-doc-guard.js` | TASK ID 검증 확장 |
| `src/claude/dev/hooks/dev-feature-scope-guard.js` | TASK ID 검증 확장 |
| `src/claude/core/rules/golden-principles.md` | TASK ID 네이밍 섹션 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/rules/task-id-naming.md` | 네이밍 SSOT |
| `src/claude/core/_utils/task-id.js` | 검증 유틸 |
| `src/claude/core/_constants/task-id-patterns.json` | 정규식 JSON |
| `tests/claude/core/rules/task-id-naming.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/core/rules/task-id-naming.md` | 동등 규칙 |
| `src/codex/core/_utils/task-id.js` | 동등 유틸 |
| `src/codex/plan/hooks/plan-doc-guard.js` | 동등 가드 |
| `src/codex/dev/hooks/dev-feature-scope-guard.js` | 동등 가드 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 4개 패턴 각각 유효/무효 케이스 통과
- [ ] 혼용 사례(M1-07 → T-M1-07 제안) 정상 처리
- [ ] Legacy 접두사 필수 검증
- [ ] plan-doc-guard/dev-feature-scope-guard 통합 테스트

### 5.2 회귀 시나리오

dash-preview-phase3 Q7 사례 복제 + 기존 Feature 2~3개 마이그레이션:

- [ ] **Feature 내 TASK ID 일관성 100%** (원본 목표 — 회고 라인 234)
- [ ] Q7 Legacy 항목이 Legacy 접두사 부여로 시각 분리
- [ ] Draft 시점에 무효 ID 감지 (IMP-KIT-013 Gate 항목 2번과 연동)

### 5.3 후방 호환

- [ ] 기존 무효 TASK ID가 포함된 Feature는 경고 + **마이그레이션 가이드 링크** 출력 (즉시 차단 아님)
- [ ] `golden-principles.md` 섹션 추가는 기존 원칙에 비파괴적 (#13 추가)
- [ ] 기존 가드 hooks의 Edit|Write 검증 동작 유지

---

## 6. 롤백 시나리오

검증이 레거시 Feature 편집을 과도하게 차단할 경우:

1. 가드 훅의 TASK ID 검증을 경고 수준으로 하향
2. 규칙 문서 유지 (가이드라인화)
3. 테스트는 유지 (차기 강화 시 재사용)

---

## 7. 연관 백로그

- **IMP-KIT-013** (P1): Dev Gate Draft 조기 플래그 — Gate 체크 항목 2번(TASK ID 네이밍)의 판정 로직
- **IMP-KIT-012** (P1): bridge ↔ Phase A 경계 — Bridge 초안에서도 TASK ID 부여 필요 시 동일 규칙
- **IMP-KIT-017** (P1): 재복제 금지 — TASK ID 규칙은 golden-principles에 링크로 참조

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
