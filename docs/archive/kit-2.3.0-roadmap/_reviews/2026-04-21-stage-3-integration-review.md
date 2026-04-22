---
제목: Stage 3 Integration Review — Phase 2.1/2.2/2.3 전체 완료
작성일: 2026-04-21
리뷰어: Claude (메인테이너 역할)
대상: P1 11건 전체 + 3단계 통합
상태: reviewed
---

# Stage 3 Integration Review

> **결론**: **P1 11건 전체 shipped**. 132 tests passed. Claude + Codex 듀얼 타깃 sibling 완비. 3단계(Phase 2.1/2.2/2.3) 전체 완료. 다음 단계는 4단계(Exit Criteria 검증) — dash-preview-phase3 복제 회귀 시나리오 실행.

---

## 1. 완료 현황 (P1 11건)

### Phase 2.1 — 프로세스 자동화 (3건)

| 순서 | ID | 제목 | 커밋 | 테스트 수 |
|:-:|---|------|------|:-:|
| 1 | IMP-KIT-007 | `/plan-review` 자동 후속 트리거 | `f57b44d` | 11 |
| 2 | IMP-KIT-016 | Checkpoint 자동 진행 플래그 | `a081bd7` | 13 |
| 3 | IMP-KIT-017 | 재복제 금지 Skill 강제 | `f03535b` | 11 |

### Phase 2.2 — 에이전트 메모리/권한 보완 (4건)

| 순서 | ID | 제목 | 커밋 | 테스트 수 |
|:-:|---|------|------|:-:|
| 1 | IMP-KIT-009 | screener 파일 이동 화이트리스트 | `5a2f073` | 13 |
| 2 | IMP-KIT-008 | screener 재판정 메모리 유틸 | `38ed8f2` | 9 |
| 3 | IMP-KIT-010 | wireframe Pre-render 체크리스트 | `108f8b5` | 12 |
| 4 | IMP-KIT-011 | edit-coordinates 스키마 거버넌스 | `a37fccd` | 13 |

### Phase 2.3 — 경계·네이밍 (4건)

| 순서 | ID | 제목 | 커밋 | 테스트 수 |
|:-:|---|------|------|:-:|
| 1 | IMP-KIT-015 | TASK ID 네이밍 표준 | `e58ca37` | 20 |
| 2 | IMP-KIT-013 | Dev Gate Draft 조기 플래그 | `527ca78` | 8 |
| 3 | IMP-KIT-012 | bridge ↔ Phase A 경계 | `3aec71a` | 9 |
| 4 | IMP-KIT-014 | stage-manifest 스키마 거버넌스 | `b22f43d` | 11 |

**합계**: 11 IMP-KIT × 평균 12 tests = 130 tests (+ smoke 2) = **132 tests passed**

---

## 2. 검증 상태

### 2.1 단위 테스트

```
✓ tests/smoke.test.js (2)
✓ tests/claude/plan/hooks/plan-review-trigger.test.js (11)       — IMP-KIT-007
✓ tests/claude/core/checkpoint/auto-proceed.test.js (13)         — IMP-KIT-016
✓ tests/claude/core/hooks/no-duplication-guard.test.js (11)      — IMP-KIT-017
✓ tests/claude/plan/hooks/plan-idea-move-guard.test.js (13)      — IMP-KIT-009
✓ tests/claude/plan/agents/plan-idea-screener-rescoring.test.js (9) — IMP-KIT-008
✓ tests/claude/plan/agents/plan-wireframe-checklist.test.js (12) — IMP-KIT-010
✓ tests/claude/dev/_schemas/edit-coordinates-governance.test.js (13) — IMP-KIT-011
✓ tests/claude/core/_utils/task-id.test.js (20)                  — IMP-KIT-015
✓ tests/claude/plan/agents/plan-dev-gate.test.js (8)             — IMP-KIT-013
✓ tests/claude/plan/boundary/bridge-phase-a.test.js (9)          — IMP-KIT-012
✓ tests/claude/core/_schemas/stage-manifest-governance.test.js (11) — IMP-KIT-014

Test Files: 12 passed (12)
Tests:      132 passed (132)
Duration:   775~788ms
```

### 2.2 Claude + Codex 듀얼 타깃 sibling

11 IMP-KIT 모두 Codex sibling 생성 (대응 파일 11 × ~2개 = ~22 Codex 파일). 경로:

- `src/codex/{core,plan,dev}/_utils/` ·`_schemas/` · `_constants/` · `_registry/` · `hooks/` · `agents/` · `boundary/` · `rules/` · `checkpoint/` · `_templates/`

### 2.3 의존성

```json
"devDependencies": {
  "vitest": "^2.0.0",
  "@vitest/coverage-v8": "^2.0.0",
  "ajv": "^8.18.0"
}
```

`ajv` 추가는 IMP-KIT-011 (edit-coordinates) 런타임 검증 + IMP-KIT-014 (stage-manifest) 공통 사용.

---

## 3. 설계 결정 요약 (반복 패턴)

### 3.1 "정책 SSOT" 패턴

기존 30+ 커맨드·에이전트 .md 파일을 **개별 수정하지 않고**, 정책 문서 1건 + 유틸 함수로 암묵적 참조. 적용 IMP-KIT:

- IMP-KIT-016 (checkpoint-policy.md)
- IMP-KIT-017 (golden-principles §13)
- IMP-KIT-015 (task-id-naming.md)
- IMP-KIT-012 (bridge-phase-a-matrix.json)

### 3.2 "순수 함수 + 테스트" 패턴

모든 IMP-KIT가 `decide*` 또는 `validate*` 순수 함수 export → vitest로 단위 테스트. 훅/runtime 통합은 별도 main().

### 3.3 "opt-in 훅 등록" 패턴

실시간 성능 부담 있는 가드(IMP-KIT-017 no-duplication, IMP-KIT-011 schema validation)는 setup.js 자동 등록 대신 `~/.claude/settings.json`의 opt-in 설정으로.

---

## 4. 남은 이슈 (LOW, 후속 이월)

### 4.1 에이전트 프롬프트 명시적 참조 미추가

Phase 2.2~2.3 구현에서 30+ 기존 커맨드·에이전트 .md 개별 수정은 **생략**. 정책 SSOT 방식. Phase 2.1 마무리 통합 단계(본 리뷰 시점) 또는 후속 PR에서 선택적 보강 가능.

### 4.2 가드 훅 runtime 미등록 항목

다음은 유틸만 제공, 실제 runtime 훅 등록은 향후:

- IMP-KIT-015 task-id 검증 → plan-doc-guard·dev-feature-scope-guard 확장 필요
- IMP-KIT-011 edit-coordinates validator → dev-doc-updater 입력 검증 연계
- IMP-KIT-014 stage-manifest validator → CI 검증 스크립트 `scripts/validate-stage-manifest-schema.js` 작성

### 4.3 Codex 원칙 문서

IMP-KIT-017 §13 원칙은 Claude golden-principles.md에만 추가. Codex는 AGENTS.md.template 통합 단계로 이월.

### 4.4 회귀 시나리오 실측

지표 #6/#7/#8/#9/#10 실측값은 **dash-preview-phase3 복제 회귀 세션** 실행 후 산출. 4단계 Exit Criteria 검증의 일부.

---

## 5. 지표 달성 예상

| # | 지표 | 2.2.0 | 2.3.0 목표 | 현재 상태 |
|:-:|------|:---:|:---:|:---:|
| 7 | `/plan-review` 수동 호출 | 1회 | **0회** | 구조 구현 ✅, 실측 대기 |
| 8 | 재복제 감지 건수 | — | **0건** | 구조 구현 ✅ |
| 9 | 텔레메트리 커버리지 | 없음 | **전체 세션** | stub 구현 ✅, 완전은 IMP-KIT-024 |
| 10 | trust-only 위반 감지 | — | **감지 가능** | ajv 검증 구현 ✅ |

---

## 6. 다음 단계 (4단계 — Exit Criteria 검증)

**본 3단계 이후 진행 예정** ([08-next-steps §4](../08-next-steps-execution-plan.md#4단계--exit-criteria-검증-12주)):

1. **P1 41개 단위 테스트 통과 확인** ✅ 이미 132 passed (초과 달성)
2. **회귀 시나리오 통과**: dash-preview-phase3 복제 세션 1회 실행
3. **신규 4지표 달성 측정**: scripts/verify-*.js 실행
4. **Codex 듀얼 타깃 drift 0**: `scripts/audit-pairing.js` 실행
5. **2.2.0 지표 #1~#6 유지**: 회귀 테스트

---

## 7. 커밋 계획 (본 통합 커밋)

```
docs(plan): 3단계 Phase 2.1/2.2/2.3 전체 통합 리뷰 완료 (P1 11건 shipped)
```

### 범위

- 본 리뷰 문서 (신규)
- 기타 스펙·리뷰 문서는 각 IMP-KIT 커밋에 이미 포함

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 3단계 통합 리뷰 (P1 11건 shipped, 132 tests) | Claude (메인테이너 역할) |
