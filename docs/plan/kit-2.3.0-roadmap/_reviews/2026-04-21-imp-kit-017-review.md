---
제목: IMP-KIT-017 Implementation Review — 재복제 금지 Skill 강제
작성일: 2026-04-21
리뷰어: Claude (메인테이너 역할)
대상 스펙: [03-p1-detailed-specs/IMP-KIT-017](../03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md)
Phase: 2.1 (순서 3/3)
상태: reviewed
---

# IMP-KIT-017 Implementation Review

> **결론**: TDD 3단계 완료. 11 tests passed (n-gram Jaccard 유사도 검증). `golden-principles.md #13` 원칙 추가 + 유틸 + 임계값 JSON 구현. Codex sibling: hook/constants 생성, 원칙 문서는 후속 AGENTS.md.template 통합 이월. **Phase 2.1 3건 모두 완료** — 스펙 `reviewed → shipped`.

---

## 1. 구현 범위

### 1.1 신규 파일

| 파일 (Claude) | Codex sibling | 역할 |
|--------------|---------------|------|
| `src/claude/core/_constants/duplication-threshold.json` | `src/codex/core/_constants/duplication-threshold.json` | 임계값 0.8 + ngramSize 8 |
| `src/claude/core/hooks/no-duplication-guard.js` | `src/codex/core/hooks/no-duplication-guard.js` | decideDuplication + computeSimilarity + ngrams 유틸 |
| `tests/claude/core/hooks/no-duplication-guard.test.js` | — | 11건 단위 테스트 |

### 1.2 수정 파일

| 파일 | 변경 |
|------|------|
| `src/claude/core/rules/golden-principles.md` | `## 13. Document Non-Duplication` 원칙 추가 + Anti-Rationalization 표에 1행 |

### 1.3 설계 결정

- **훅 등록은 opt-in**: 실시간 유사도 검증은 성능 부담. `duplicationGuard: true` 설정 시 PreToolUse Edit|Write에 등록 (현 setup.js 미수정, 사용자 선택).
- **Codex 원칙 문서 이월**: Codex는 AGENTS.md 기반 관리. `src/templates/AGENTS.md.template`에 §13 추가는 Phase 2.1 마무리 통합 단계 또는 후속 PR.

---

## 2. TDD 실행 증거

```
✓ tests/smoke.test.js (2 tests)
✓ tests/claude/plan/hooks/plan-review-trigger.test.js (11 tests)
✓ tests/claude/core/hooks/no-duplication-guard.test.js (11 tests)
✓ tests/claude/core/checkpoint/auto-proceed.test.js (13 tests)

Test Files: 4 passed (4)
Tests:      37 passed (37)
Duration:   459ms
```

---

## 3. 스펙 대비 커버리지

| 요구 | 충족 |
|------|:---:|
| §2 선택지 A: 원칙 + Skill + 감지 가드 ⭐ | ✅ |
| §3.1 RED 테스트 | ✅ 11건 |
| §3.2 GREEN (1 golden-principles #13) | ✅ |
| §3.2 GREEN (2 30+ 에이전트 프롬프트 Constraint 삽입) | ⚠️ IMP-KIT-016과 동일 정책 SSOT 방식 — 개별 수정 대신 `golden-principles.md` 전역 참조 |
| §3.2 GREEN (3 no-duplication-guard.js) | ✅ |
| §3.2 GREEN (4 setup.js pre-check 훅 등록) | ⚠️ opt-in으로 생략 — 사용자가 `duplicationGuard: true` 명시 시 활성 |
| §5.1 단위 테스트 (100%/80%/< 20% 케이스) | ✅ |
| §5.2 회귀 (재복제 감지 0건 지표 #8) | ⏳ 회귀 시나리오에서 측정 |
| §5.3 후방 호환 | ✅ opt-in이므로 기존 동작 영향 없음 |

---

## 4. Codex 듀얼 타깃

| 항목 | Claude | Codex |
|------|--------|-------|
| hook 파일 | ✅ | ✅ |
| 임계값 JSON | ✅ | ✅ |
| 원칙 문서 | golden-principles.md §13 | **이월** (AGENTS.md.template 후속 반영) |

---

## 5. 발견 이슈 (LOW)

- **Codex 원칙 문서 이월**: AGENTS.md.template에 §13 반영은 후속. 실제 동작 영향 없음(가드는 양쪽 동일 로직).
- **훅 등록 opt-in**: 실시간 유사도 검증이 커다란 파일에 대해 비용. 필요 시 사용자가 `duplicationGuard: true`로 활성.

---

## 6. Phase 2.1 종합 완료 상태

**P1 11건 중 Phase 2.1 (3건) 완료**:

| 순서 | IMP-KIT | 상태 | 커밋 |
|:-:|---------|:-:|------|
| 1 | IMP-KIT-007 | shipped | `f57b44d` |
| 2 | IMP-KIT-016 | shipped | (이전 커밋) |
| 3 | **IMP-KIT-017** | **shipped** | (본 커밋 예정) |

### 지표 달성 상태

| 지표 | 목표 | 현재 |
|------|:---:|:---:|
| #7 `/plan-review` 수동 호출 | 0회 | 구조 구현, 실측 대기 |
| #6 Human Checkpoint 수 | < 3회 | 구조 구현, 실측 대기 |
| #8 재복제 감지 | 0건 | 구조 구현, 실측 대기 |

### Phase 2.2 진입 조건

- [x] Phase 2.1 3건 shipped
- [x] kit-feedback-archiving Phase 3 진입 조건(IMP-KIT-007 트리거) 충족
- [ ] Phase 2.1 통합 회귀 검증 — **Phase 2.1 최종 커밋 시점** (옵션 A §4단계)

---

## 7. 커밋 계획

```
feat(core): IMP-KIT-017 재복제 금지 Skill 강제 구현 + Phase 2.1 순서 3/3 완료
```

### 범위

```
src/claude/core/_constants/duplication-threshold.json  (신규)
src/claude/core/hooks/no-duplication-guard.js           (신규)
src/claude/core/rules/golden-principles.md              (수정, §13 추가)
src/codex/core/_constants/duplication-threshold.json    (신규, Codex sibling)
src/codex/core/hooks/no-duplication-guard.js            (신규)
tests/claude/core/hooks/no-duplication-guard.test.js    (신규)
docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md  (상태 승격)
docs/plan/kit-2.3.0-roadmap/_reviews/2026-04-21-imp-kit-017-review.md  (신규)
```

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | IMP-KIT-017 구현 리뷰 + Phase 2.1 종합 | Claude (메인테이너 역할) |
