---
ID: IMP-KIT-017
제목: 문서 재복제 금지 원칙 Skill 수준 강제
우선순위: P1
영향 도메인: core
RICE: R4 × I3 × C3 ÷ E2 = 18
공수: S (1~2일)
Phase: 2.1
원본 타임라인: (관찰) dash-preview-phase3 회고
선행 의존: IMP-KIT-016 (본 로드맵 Phase 2.1 선행 — 훅 체인 안정화 후 Skill 레이어 확장)
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# IMP-KIT-017 — 문서 재복제 금지 원칙 Skill 수준 강제

> **결론**: "기존 문서는 경로 인용, 복제 금지" 원칙을 `golden-principles.md` 및 각 에이전트 시스템 프롬프트에 명문화. Skill 수준 가드로 재복제 감지. 본 2.3.0 로드맵 집필 자체가 이 원칙의 선례 적용 사례.

---

## 1. 문제 정의

에이전트마다 문서 참조 기준이 다름: 일부는 기존 문서 **경로 인용**만, 일부는 **내용 복사**. 결과적으로 SSOT 다중화되고 drift 위험.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-017 라인 251~260](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- 선례: 본 2.3.0 로드맵이 이 원칙에 따라 kit-2.2.0-roadmap 복제 없이 인덱스+차분 구조 채택 ([01-delta §1](../01-delta-from-2.2.0.md#1-220-성과-요약-링크만))

### 현재 상태 (2.2.0 완료 시점)

- `src/claude/core/rules/golden-principles.md`에 재복제 금지 원칙 **부재**
- 각 에이전트 프롬프트(30+ 에이전트)에 일관된 지침 없음

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: 원칙 명문화 + Skill 가드** ⭐ | golden-principles 섹션 + 에이전트 프롬프트 공통 문장 + 감지 가드 | 중복 명시 + 자동 감지 | 가드 초기 튜닝 필요 |
| B: 원칙 명문화만 | 문서화만 | 단순 | 강제력 없음 |
| C: 편집 가드(Edit tool) 확장 | 파일 쓸 때 내용 유사도 검증 | 강제력 높음 | 오탐 과다, 검증 비용 |

**선택: A** — 문서+Skill+선택적 감지 3단 조합.

### 원칙 문구 (golden-principles.md §13 추가)

> **13. 문서 재복제 금지**
>
> **Why?** 같은 내용이 여러 문서에 복제되면 SSOT가 다중화되어 drift 불가피. 하나가 업데이트되면 다른 복사본은 구식이 된다.
>
> **How?** 기존 문서 참조 시 **경로 링크만** 제공. 본문 복제 금지. 새 기여(신규 기여가 아닌 것)는 기존 문서를 직접 Edit, 사본 생성 금지.

### 에이전트 프롬프트 공통 문장

```markdown
<Constraints>
- 기존 문서를 참조할 때는 **경로 링크**만 사용한다. 문서 본문을 복사하지 않는다.
- 신규 기여가 아닌 변경은 기존 문서를 Edit하고, 새 문서를 생성하지 않는다.
</Constraints>
```

### Skill 감지 가드 (선택적)

`src/claude/core/hooks/no-duplication-guard.js` — Write/Edit 전 대상 내용이 기존 파일과 **80% 이상 유사**하면 경고. 수치는 튜닝 후 결정.

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED

`tests/claude/core/skills/no-duplication.test.ts`:

```typescript
it('기존 파일과 유사한 내용 Write 시 가드 감지', async () => {
  const existing = await readFile('docs/A.md')
  const result = await guardedWrite('docs/B.md', existing) // 100% 복제
  expect(result.warning).toBe('재복제 감지 (유사도 100%)')
})
it('신규 기여 Write 시 통과', async () => { /* 유사도 < 20% */ })
it('Edit(동일 파일 수정)는 감지 안 함', async () => { /* 복제 아님 */ })
```

### 3.2 GREEN

1. `src/claude/core/rules/golden-principles.md` — 원칙 #13 추가
2. 30+ 에이전트 프롬프트에 공통 Constraint 문장 일괄 삽입 (스크립트 가능)
3. `src/claude/core/hooks/no-duplication-guard.js` (신규) — 유사도 검증
4. `scripts/setup.js` — Write/Edit 전 pre-check 훅 등록 (선택적 활성화)

### 3.3 IMPROVE

- 유사도 임계값을 `src/claude/core/_constants/duplication-threshold.json`으로 분리
- 에이전트 프롬프트 공통 문장을 `src/templates/agent-constraints-base.md`로 템플릿화

---

## 4. 영향 파일

### 수정

| 파일 | 변경 |
|------|------|
| `src/claude/core/rules/golden-principles.md` | 원칙 #13 추가 |
| 에이전트 프롬프트 30+건 | 공통 Constraint 삽입 |
| `scripts/setup.js` | 선택적 pre-check 훅 등록 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/hooks/no-duplication-guard.js` | 유사도 검증 가드 |
| `src/claude/core/_constants/duplication-threshold.json` | 임계값 상수 |
| `tests/claude/core/skills/no-duplication.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 |
|------|------|
| `src/codex/core/rules/golden-principles.md` | 동등 원칙 |
| `src/codex/core/hooks/no-duplication-guard.js` | 동등 가드 (Codex v1 hook 호환 검토) |
| 에이전트 프롬프트 Codex sibling | 동등 Constraint |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 유사도 100% 복제 → 경고 (WARN)
- [ ] 유사도 80% 이상 → 경고
- [ ] 신규 기여 (< 20%) → 통과
- [ ] Edit 수정은 감지 제외

### 5.2 회귀 시나리오

- [ ] 재복제 감지 건수 **0** (지표 #8)
- [ ] dash-preview-phase3 복제 세션에서 경고 1건 이상 기록 (감지 능력 증명)

### 5.3 후방 호환

- [ ] 기존 문서 구조 미변경
- [ ] 가드 pre-check opt-in 기본 (설정으로 활성화)
- [ ] 에이전트 프롬프트 Constraint 추가는 기존 동작 영향 없음

---

## 6. 롤백 시나리오

1. pre-check 훅 비활성화
2. 원칙·Constraint는 유지 (가이드라인으로 활용)
3. 유사도 임계값 완화 가능

---

## 7. 연관 백로그

- **IMP-KIT-007/016** (P1, 선행): 자동 트리거·auto-proceed 안정화 후 Skill 레이어 강화
- **IMP-KIT-011** (P1): architect 스키마 거버넌스 — 거버넌스 문서가 본 원칙의 구체 사례
- **kit-feedback-archiving**: 피드백 엔트리 SSOT 원칙 상속 ([04 §3.2](../04-feedback-archiving-integration.md#32-imp-kit-017--재복제-금지))
- **2.3.0 로드맵 자체**: 인덱스+차분 구조가 본 원칙의 선례 ([07 §5.1 단방향 참조](../07-boundary-and-contradictions.md#51-단방향-참조-원칙))

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 미니 스펙 초안 (리뷰 MEDIUM §3.2.1 해소) | claude-kit roadmap author |
