# TASK ID 네이밍 표준

> **결론**: IMP-KIT-015. claude-kit 전체에서 TASK ID는 **4패턴** 중 하나를 따른다. 정규식 SSOT + validateTaskId 유틸로 자동 검증. golden-principles #14 참조.

**정규식 SSOT**: `src/claude/core/_constants/task-id-patterns.json`
**유틸**: `src/claude/core/_utils/task-id.js`
**스펙**: `docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-015-task-id-naming.md`

---

## 1. 4패턴

| 도메인 | 패턴 | 예시 |
|--------|------|------|
| **dev** | `T-{AREA}-{NN}` | `T-HERO-01`, `T-AUTH-12` |
| **plan** | `TASK-{SLUG}-{NN}` | `TASK-hero-refresh-03` |
| **legacy** | `LEGACY-{AREA}-{NN}` | `LEGACY-AUTH-07` |
| **spike** | `SPIKE-{AREA}-{NN}` | `SPIKE-PERF-02` |

### 필드 정의

- `AREA`: 영어 대문자 2~6자 (예: HERO, AUTH, PERF)
- `SLUG`: 영어 소문자 + 숫자 + 하이픈, 3~40자 (예: hero-refresh)
- `NN`: 숫자 2~3자리 (01, 12, 123)

### Legacy 접두사

기존 코드의 레거시 격리 TASK는 반드시 `LEGACY-` 접두사 사용. 시각적 분리 + `T-` 대비 별도 추적.

---

## 2. 검증

### 자동 검증 (가드 훅)

다음 가드가 Edit|Write 시점에 TASK ID를 자동 검증:

- `src/claude/plan/hooks/plan-doc-guard.js` (향후 확장 예정)
- `src/claude/dev/hooks/dev-feature-scope-guard.js` (향후 확장 예정)

현재는 **유틸만 제공**. 가드 훅 통합은 Phase 2.3 마무리 단계에서 선택적 적용.

### 수동 검증

```javascript
const { validateTaskId, detectDomain } = require('src/claude/core/_utils/task-id.js')
validateTaskId('T-HERO-01', 'dev')   // true
detectDomain('M1-07')                // null (비표준)
```

---

## 3. 마이그레이션 (Breaking Change BC-2.3.0-01)

기존 Feature Package에 `T-HERO-01` 이외 형태(예: `M1-07`)가 있으면:

1. 2.3.0: **경고 수준** — 가드 훅이 경고 출력 + `suggestFix()`로 수정 제안
2. 2.4.0+: **차단 수준** — 무효 ID 편집 차단

---

## 4. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (IMP-KIT-015 SSOT) | Claude (메인테이너 역할) |
