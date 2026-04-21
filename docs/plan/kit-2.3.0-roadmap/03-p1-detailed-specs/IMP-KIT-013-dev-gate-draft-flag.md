---
ID: IMP-KIT-013
제목: Dev 착수 Gate 체크리스트 Draft 단계 조기 플래그
우선순위: P1
영향 도메인: plan, dev
RICE: R4 × I3 × C3 ÷ E2 = 18
공수: M (3일)
Phase: 2.3
원본 타임라인: #21 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-003 (2.2.0 완료 — plan-draft-writer)
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# IMP-KIT-013 — Dev 착수 Gate 체크리스트 Draft 단계 조기 플래그

## 1. 문제 정의

Legacy 격리·TASK ID 네이밍·의존 Feature 식별 같은 **Dev 착수 Gate 항목**이 `/plan-draft` 단계에서 플래그되지 않고 **Dev Phase B Human Checkpoint(Q7 등)에서야 드러남**. 이미 Phase A/B 일부 작업이 진행된 후 차단으로 되돌아가는 비용 발생.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-013 라인 198~207](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- [00-session-retrospective.md #21 Q7 사례](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/00-session-retrospective.md)

### 현재 상태 (2.2.0 완료 시점)

- `src/claude/plan/agents/plan-draft-writer.md` (IMP-KIT-003 산출) — 3중 판정·routing-metadata 기록
- Draft 산출(`.plans/features/active/{slug}/{slug}.md`)에 "Dev 착수 전 확인" 섹션 없음

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: Draft 템플릿에 강제 섹션 추가** ⭐ | plan-draft-writer가 Draft 산출 시 "Dev 착수 전 확인" 섹션 자동 주입 | 모든 Standard Feature에 적용, Phase B Checkpoint 감소 | 섹션 미충족 시 처리 정책 필요 |
| B: 별도 Gate 문서 파일 | `.plans/features/active/{slug}/dev-gate-checklist.md` 신규 파일 | 관심사 분리 | 추가 파일 유지비, 참조 분산 |
| C: Bridge에서 검증만 | Draft 자유, Bridge가 Gate 검증 | Draft 간소화 | Gate 드러남 지점이 여전히 늦음 |

**선택: A** — 조기 플래그 목적 달성의 핵심.

### Gate 체크리스트 4항목

```markdown
## Dev 착수 전 확인 (필수)

- [ ] **Legacy 격리**: 기존 코드 중 Feature 범위 내 Legacy 식별 → `LEGACY-{AREA}-{NN}` 접두사 TASK로 분리
- [ ] **TASK ID 네이밍**: `T-{AREA}-{NN}` (dev) / `TASK-{SLUG}-{NN}` (plan) 규칙 준수 (IMP-KIT-015 참조)
- [ ] **의존 Feature 식별**: 선행 완료 필수 Feature slug 목록 (없으면 "독립")
- [ ] **데이터 마이그레이션 유무**: DB 스키마 변경 여부 + Codex 듀얼 타깃 영향
```

### 아키텍처

```
/plan-draft {idea-id}
  └─ plan-draft-writer
       ├─ 3중 판정 (Lite/Standard + 시나리오 + copy/dev)
       ├─ [Standard dev/hybrid 시] Gate 체크리스트 4항목 Draft 하단 주입
       └─ routing-metadata 갱신 (dev_gate_flagged: true)
                 ↓
      [사용자 수동 보완 또는 Bridge 단계에서 보완]
                 ↓
/dev-feature {slug} Phase B
  └─ Gate 미충족 시 즉시 정지 (기존 Q7 시점이 아닌 Phase B 초입)
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/plan/agents/plan-draft-writer.dev-gate.test.ts` (신규)

```typescript
describe('plan-draft-writer — Dev 착수 Gate', () => {
  it('Standard dev Feature Draft에 Gate 섹션 4항목 주입', async () => {
    const draft = await runDraftWriter({ ideaId: 'IDEA-042', type: 'dev', scope: 'Standard' })
    expect(draft.content).toMatch(/## Dev 착수 전 확인/)
    expect(draft.content).toMatch(/Legacy 격리/)
    expect(draft.content).toMatch(/TASK ID 네이밍/)
    expect(draft.content).toMatch(/의존 Feature 식별/)
    expect(draft.content).toMatch(/데이터 마이그레이션/)
  })

  it('Lite Feature Draft는 Gate 섹션 미주입', async () => { /* Lite 제외 */ })
  it('copy Feature Draft는 Gate 섹션 미주입', async () => { /* copy 제외 */ })
  it('Gate 미충족 Draft로 Phase B 진입 시 차단', async () => { /* Phase B 조기 정지 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/plan/agents/plan-draft-writer.md` — Standard dev/hybrid 분기에서 Gate 섹션 주입
2. `src/claude/plan/_templates/dev-gate-checklist.template.md` (신규) — 4항목 템플릿
3. `src/claude/dev/commands/dev-feature.md` — Phase B 진입 시 Gate 체크 (routing-metadata `dev_gate_flagged` + 사용자 보완 여부 확인)
4. `src/claude/plan/skills/plan-draft-workflow/SKILL.md` — 3중 판정 이후 Gate 주입 스텝 추가

### 3.3 IMPROVE — 리팩토링

- Gate 체크리스트 항목을 `src/claude/core/_constants/dev-gate-items.json`으로 분리
- 향후 Gate 항목 추가 시 JSON만 갱신 → Draft·Phase B 양쪽 자동 반영

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/agents/plan-draft-writer.md` | Gate 섹션 주입 분기 |
| `src/claude/plan/skills/plan-draft-workflow/SKILL.md` | 주입 스텝 |
| `src/claude/dev/commands/dev-feature.md` | Phase B 조기 검증 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/_templates/dev-gate-checklist.template.md` | 4항목 템플릿 |
| `src/claude/core/_constants/dev-gate-items.json` | Gate 항목 SSOT |
| `tests/claude/plan/agents/plan-draft-writer.dev-gate.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-draft-writer.md` | 동등 분기 |
| `src/codex/plan/_templates/dev-gate-checklist.template.md` | 동등 템플릿 |
| `src/codex/dev/commands/dev-feature.md` | 동등 Phase B 검증 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] Standard dev Feature Draft에 4항목 섹션 존재
- [ ] Lite/copy Feature Draft에 섹션 미존재
- [ ] 미충족 Gate로 Phase B 진입 시 즉시 차단
- [ ] routing-metadata `dev_gate_flagged` 필드 정확 기록

### 5.2 회귀 시나리오

dash-preview-phase3 Q7 사례 복제:

- [ ] **Phase B Checkpoint 질문 수 감소** (원본 대비 — Gate 항목이 Phase B에서 재질문되지 않음)
- [ ] Gate 항목 4건이 Draft 시점에 플래그됨
- [ ] Phase B에서의 역전 (rewind) 횟수 0

### 5.3 후방 호환

- [ ] IMP-KIT-003의 routing-metadata 스키마 확장 (필드 추가는 하위호환)
- [ ] 기존 Draft 파일 구조 미변경 (섹션은 Standard dev/hybrid에만 추가)
- [ ] Lite Feature 워크플로우 영향 없음

---

## 6. 롤백 시나리오

Gate 조기 플래그가 Draft를 과도하게 복잡화할 경우:

1. `plan-draft-writer.md`에서 Gate 섹션 주입 분기 제거
2. Phase B 조기 검증도 경고 수준으로 하향
3. 템플릿·JSON·테스트는 유지 (차기 재시도용)

---

## 7. 연관 백로그

- **IMP-KIT-003** (P0, 2.2.0 완료): plan-draft-writer — 본 항목의 확장 지점
- **IMP-KIT-015** (P1): TASK ID 네이밍 표준 — Gate 항목 2번과 직접 연계
- **IMP-KIT-012** (P1): bridge ↔ Phase A 경계 — "Draft 강화" 공통 테마

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
