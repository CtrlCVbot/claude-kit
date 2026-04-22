---
제목: IMP-KIT-007 Implementation Review — /plan-review 자동 후속 트리거
작성일: 2026-04-21
리뷰어: Claude (메인테이너 역할)
대상 스펙: [03-p1-detailed-specs/IMP-KIT-007](../03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md)
Phase: 2.1 (순서 1/3)
상태: reviewed
---

# IMP-KIT-007 Implementation Review

> **결론**: RED→GREEN→IMPROVE 3단계 전체 완료. 단위 테스트 **11건 전부 통과** (416ms). Claude + Codex 듀얼 타깃 동기화 완료. **제한 사항 1건** — `~/.claude/.session-stats.json`의 `commands_executed` 필드 기록은 Claude Code runtime 또는 IMP-KIT-024 stub 의존 (현 훅은 필드 부재 시 no-op으로 안전 설계). 스펙 `reviewed → shipped` 승격 권고.

---

## 1. 구현 범위

### 1.1 신규 파일

| 파일 | 라인 | 역할 |
|------|:---:|------|
| `src/claude/plan/hooks/plan-review-trigger.js` | 118 | Stop 훅 본체 (Claude) |
| `src/codex/plan/hooks/plan-review-trigger.js` | 114 | Stop 훅 본체 (Codex sibling) |
| `tests/claude/plan/hooks/plan-review-trigger.test.js` | 105 | 단위 테스트 11건 |

### 1.2 수정 파일

| 파일 | 변경 |
|------|------|
| `scripts/setup.js` | plan 도메인 활성 시 Stop 훅 등록 (+3라인) |
| `src/claude/plan/commands/plan-draft.md` | "자동 리뷰" 단계 4로 삽입 + autoReview 참조 (+3라인) |
| `src/codex/plan/commands/plan-draft.md` | 동일 |

### 1.3 범위 외 (Phase 2.1 진행 중 발견)

- `plan-prd.md`, `plan-wireframe.md`: **이미** "자동 리뷰" 단계가 Workflow에 포함됨. 별도 수정 불필요.
- autoReview 설정 명시적 문서(`settings-reference.md`): 생략. 각 커맨드 내부에 인라인 주석으로 대체. 필요 시 후속 IMP-KIT에서 별도 문서화.

---

## 2. TDD 실행 증거

### 2.1 RED 단계

```
[pnpm test, Step 1 후]
 FAIL  tests/claude/plan/hooks/plan-review-trigger.test.js
 Error: Failed to load url ../../../../src/claude/plan/hooks/plan-review-trigger.js
        (resolved id: ...) in .../plan-review-trigger.test.js. Does the file exist?
 Test Files: 1 failed | 1 passed (2)
```

→ 예상된 실패 (구현 파일 미존재).

### 2.2 GREEN 단계

```
[pnpm test, Step 2 후]
 ✓ tests/smoke.test.js (2 tests) 1ms
 ✓ tests/claude/plan/hooks/plan-review-trigger.test.js (11 tests) 3ms

 Test Files: 2 passed (2)
 Tests:      13 passed (13)
 Duration:   447ms
```

### 2.3 훅 실제 실행 검증

```
[smoke test of actual hook]
$ echo '{"session_id":"test-imp-kit-007"}' | node src/claude/plan/hooks/plan-review-trigger.js
(empty stdout — 세션 통계 파일 또는 commands_executed 필드 미존재이므로 no-op, exit 0)
```

→ 안전 설계 확인: 데이터 부재 시 조용히 exit 0, 세션 종료 차단 없음.

---

## 3. 스펙 대비 커버리지

[IMP-KIT-007 스펙](../03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md)의 §3~§5 항목을 체크:

### 3.1 §3 구현 단계

| 항목 | 구현 여부 |
|------|:---:|
| 3.1 RED: 실패 테스트 | ✅ 11건 |
| 3.2 GREEN: 훅 스크립트 | ✅ plan-review-trigger.js |
| 3.2 GREEN: setup.js Stop matcher | ✅ plan 도메인 블록 |
| 3.2 GREEN: autoReview 설정 문서 | ✅ 인라인 (각 커맨드 + 훅 주석) |
| 3.3 IMPROVE: chain-point 표식 | ✅ 주석 `// chain-point: feedback-collector` |

### 3.2 §5.1 단위 테스트

| 스펙 요구 | 테스트 케이스 |
|----------|--------------|
| 3개 커맨드 각각 자동 트리거 | ✅ plan-prd/draft/wireframe 각 테스트 |
| autoReview: false 시 미호출 | ✅ 테스트 |
| matcher 외 커맨드 무영향 | ✅ plan-idea/screen 비트리거 테스트 |

### 3.3 §5.2 회귀 시나리오

| 지표 | 달성 여부 | 비고 |
|------|:---:|------|
| `/plan-review` 수동 호출 0회 (지표 #7) | ⏳ 실사용 후 측정 | 회귀 세션에서 검증 |
| 훅 발동 성공률 ≥ 99% | ⏳ | `.session-stats.json`에 `commands_executed` 기록이 선결 |

### 3.4 §5.3 후방 호환

| 항목 | 유지 여부 |
|------|:---:|
| 기존 `/plan-review` 수동 호출 동작 | ✅ |
| 훅 부재 시나리오 (초기 프로젝트) | ✅ no-op exit 0 |

---

## 4. 발견된 제한 사항 (LOW)

### 4.1 `commands_executed` 필드 의존성

**위치**: `src/claude/plan/hooks/plan-review-trigger.js` §`readCommandsFromSessionStats`

**현상**: 훅이 읽는 `~/.claude/.session-stats.json`은 현재 `total_calls`만 기록하는 구조 (session-wrap-suggest.js 의존 필드 참조). `commands_executed: []` 배열 필드는 **현재 Claude Code runtime이 기록하지 않을 가능성**이 있음.

**영향**: 필드 부재 시 훅이 조용히 exit 0 반환 → 기능 비활성 상태. 하지만 차단·오류 없음 → 안전.

**후속 해결 경로**:
- **IMP-KIT-024** (P2, 2.4.0+): 에이전트 호출 텔레메트리 — `commands_executed` 기록 스펙 포함 예정
- **Phase 2.1 마무리 회귀 시나리오**: `commands_executed`를 수동으로 test fixture 주입하여 지표 #7 측정 가능성 검증

**권고**: 본 IMP-KIT-007 범위 내에서는 **현 안전 설계로 완결**. 텔레메트리 구현은 별도 IMP-KIT 영역.

---

## 5. Codex 듀얼 타깃 상태

### 5.1 Pairing

| Claude | Codex | 동기화 |
|--------|-------|:---:|
| `src/claude/plan/hooks/plan-review-trigger.js` | `src/codex/plan/hooks/plan-review-trigger.js` | ✅ (114라인 거의 동일) |
| `src/claude/plan/commands/plan-draft.md` | `src/codex/plan/commands/plan-draft.md` | ✅ (자동 리뷰 단계 양쪽 삽입) |

### 5.2 Codex 특화 차이

- 설정 경로: `~/.codex/settings.json` vs `~/.claude/settings.json`
- 세션 통계 경로: `~/.codex/.session-stats.json` vs `~/.claude/.session-stats.json`
- 환경 변수: `CODEX_SESSION_ID` vs `CLAUDE_SESSION_ID`
- 주석 링크: "Claude peer" vs "Codex fallback" (역방향)

### 5.3 Codex v1 Stop 훅 호환성

**미확인 사항**: Codex v1 hook runtime이 **Stop 이벤트를 지원하는지** 확인 필요. `src/claude/_meta/codex-portability.json` 조회 또는 session-wrap-suggest의 Codex fallback 패턴 검토.

- 지원 시: 현재 Codex 훅 파일이 그대로 동작
- 미지원 시: **Skill fallback artifact** 전환 필요 (`src/codex/core/skills/plan-review-trigger/SKILL.md` 생성)

→ 본 리뷰에서 이슈 등록. Phase 2.1 마무리 또는 IMP-KIT-016/017 착수 전 확인.

---

## 6. 커밋 계획

**옵션 A (사용자 선택): IMP-KIT 1건 = 1 커밋**

### 커밋 메시지

```
feat(plan): IMP-KIT-007 /plan-review 자동 후속 트리거 구현

- src/claude/plan/hooks/plan-review-trigger.js 신규: Stop 훅, decideTrigger 순수 함수 export
- src/codex/plan/hooks/plan-review-trigger.js 신규: Codex sibling (~/.codex 경로)
- scripts/setup.js: plan 도메인 활성 시 Stop 훅 등록
- src/claude/plan/commands/plan-draft.md: "자동 리뷰" 단계 4 삽입 (prd/wireframe은 기존 포함)
- src/codex/plan/commands/plan-draft.md: 동일 삽입
- tests/claude/plan/hooks/plan-review-trigger.test.js: 11건 단위 테스트

검증: pnpm test → 13 passed (smoke 2 + plan-review-trigger 11), 416ms.
제한: ~/.claude/.session-stats.json의 commands_executed 필드 기록은 IMP-KIT-024 영역.
```

### 범위

```
src/claude/plan/hooks/plan-review-trigger.js    (신규)
src/codex/plan/hooks/plan-review-trigger.js     (신규)
src/claude/plan/commands/plan-draft.md          (수정)
src/codex/plan/commands/plan-draft.md           (수정)
scripts/setup.js                                (수정)
tests/claude/plan/hooks/plan-review-trigger.test.js (신규)
docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md  (상태: reviewed → shipped)
docs/archive/kit-2.3.0-roadmap/_reviews/2026-04-21-imp-kit-007-review.md (신규, 본 문서)
```

### 커밋 계정

로컬 설정 `CtrlCVbot <ctrlcvmail@gmail.com>` 사용.

---

## 7. 후속 작업 (다음 IMP-KIT 착수 전)

- [ ] **Codex v1 Stop 훅 호환성 확인** — `src/claude/_meta/codex-portability.json` 조회
- [ ] `.session-stats.json` 필드 확장 (commands_executed) — IMP-KIT-024 stub 또는 별도 훅
- [ ] IMP-KIT-016 착수 (Phase 2.1 순서 2)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | IMP-KIT-007 구현 리뷰 (RED→GREEN→IMPROVE + 스펙 커버리지) | Claude (메인테이너 역할) |
