---
ID: IMP-KIT-003
제목: /plan-draft 전용 에이전트 (plan-draft-writer) 신설
우선순위: P0 (블로커)
영향 도메인: plan
RICE: R4 × I4 × C4 ÷ E2 = 32
공수: M (3~5일)
원본 타임라인: #7
안티패턴: Skill-only 수동화
상태: draft
---

# IMP-KIT-003 — plan-draft-writer 신설

## 1. 문제 정의

`/plan-draft` 커맨드는 **Skill만 있고 전용 에이전트 부재**. 결과적으로 1차 기획 작성이 수동화되거나 generalpurpose로 대행.

### 현재 파일 상태 (실증)

`src/claude/plan/commands/plan-draft.md` 11~33행 Workflow:
- 입력 확인 → 1차 기획 작성 → 3중 판정 → 경로 분기 → PCC-02 검증 → Human Checkpoint

**문제**: Workflow 2단계 "1차 기획 작성"은 실질적으로 에이전트 호출 지시 없이 커맨드 실행자(메인 세션 또는 사용자)가 **직접** 수행하는 구조. 결과 품질/일관성이 호출자에 의존.

### 근거 (원본 회고)

[00-session-retrospective.md #7](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/00-session-retrospective.md):
> `/plan-draft` first-pass + `07-routing-metadata.md` — Skill only, 수동 / 전용 에이전트 부재

[01-agent-capability-matrix.md §4 재위임 카탈로그](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/01-agent-capability-matrix.md):
> | Draft 본문 작성 | (없음) | (수동) | 전용 에이전트 부재 | `plan-draft-writer` 신설 |

---

## 2. 제안 해결안

### 2.1 plan-draft-writer 에이전트 명세

**파일**: `src/claude/plan/agents/plan-draft-writer.md` (신규)

```yaml
---
name: plan-draft-writer
description: /plan-draft 1차 기능 기획 작성 전문 에이전트.
             유저 스토리, 러프 요구사항, 실현 가능성 평가를 작성하고,
             Lite/Standard + 시나리오(A/B/C) + Feature 유형(copy/dev) 3중 판정을 수행합니다.
tools: ["Read", "Grep", "Glob", "Write", "Edit"]
model: opus
memory: project
color: green
---
```

### 2.2 책임 범위

| 수행 | 위임/비수행 |
|------|------------|
| 유저 스토리 / 러프 요구사항 작성 | PRD 상세 작성 (prd-writer 담당) |
| 기존 아키텍처 정합성 분석 (개괄) | 상세 아키텍처 분석 (architect 담당) |
| Lite/Standard 판정 (6개 트리거) | 최종 승인 (사용자 담당) |
| 시나리오 A/B/C 판정 | 갭 분석 상세 (copy 도메인 담당) |
| Feature 유형 판정 (copy/dev) | 구현 (dev 도메인 담당) |
| `07-routing-metadata.md` 작성 | bridge 문서 (bridge-writer 담당) |

### 2.3 Output 구조

- Lite: `.plans/features/active/{slug}.md`
- Standard: `.plans/features/drafts/{slug}/first-pass.md`
- Metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md`

### 2.4 커맨드 수정

`src/claude/plan/commands/plan-draft.md` Workflow 2단계를:
```
2. 1차 기획 작성 → plan-draft-writer 에이전트 호출
```
로 변경. 커맨드는 **인자 검증 + 에이전트 호출 + 결과 전달**만 담당.

---

## 3. 구현 단계 (TDD)

### 3.1 RED

**파일**: `tests/claude/plan/agents/plan-draft-writer.test.ts` (신규)

```typescript
describe('plan-draft-writer', () => {
  it('Lite 판정 시 .plans/features/active/{slug}.md 생성', async () => {
    const result = await runDraftWriter({
      ideaId: 'IDEA-20260420-001',
      expectedCategory: 'Lite'
    })

    expect(result.category).toBe('Lite')
    expect(result.output_path).toMatch(/\.plans\/features\/active\/.+\.md$/)
    expect(result.routing_metadata.scenario).toBeUndefined()  // Lite는 시나리오 없음
  })

  it('Standard 판정 시 drafts/{slug}/first-pass.md 생성', async () => {
    const result = await runDraftWriter({
      ideaId: 'IDEA-20260420-002',
      expectedCategory: 'Standard'
    })

    expect(result.category).toBe('Standard')
    expect(result.output_path).toMatch(/drafts\/.+\/first-pass\.md$/)
    expect(result.routing_metadata).toMatchObject({
      scenario: expect.stringMatching(/^[ABC]$/),
      feature_type: expect.stringMatching(/^(copy|dev)$/)
    })
  })

  it('copy Feature + 시나리오 C → 갭 분석 경로 안내', async () => {
    const result = await runDraftWriter({
      ideaId: 'IDEA-COPY-C',
      expectedType: 'copy',
      expectedScenario: 'C'
    })

    expect(result.next_steps).toContain('/copy-reference-refresh')
    expect(result.next_steps).toContain('gap analysis')
  })

  it('approved 상태 아닌 IDEA 거부', async () => {
    await expect(
      runDraftWriter({ ideaId: 'IDEA-SCREENED-ONLY' })
    ).rejects.toThrow(/approved 상태 필수/)
  })

  it('blueprint-import 태그 IDEA는 fast-track 진입', async () => {
    const result = await runDraftWriter({ ideaId: 'IDEA-BLUEPRINT' })

    expect(result.entry_point).toBe('P3-blueprint-fast-track')
    expect(result.blueprint_source).toBeDefined()
  })
})
```

### 3.2 GREEN

**파일 생성/수정**:

1. `src/claude/plan/agents/plan-draft-writer.md` (신규)
2. `src/claude/plan/commands/plan-draft.md` (Workflow 재작성 — 에이전트 호출 래퍼로)
3. `src/claude/plan/skills/plan-draft/SKILL.md` (없으면 신설, 있으면 에이전트 연계 명시)

### 3.3 IMPROVE

- 1차 기획 템플릿을 `src/claude/plan/_templates/first-pass.template.md`로 분리
- 에이전트가 템플릿 경로를 참조하여 생성

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/commands/plan-draft.md` | 에이전트 호출 래퍼로 전환 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/agents/plan-draft-writer.md` | 에이전트 정의 |
| `src/claude/plan/_templates/first-pass.template.md` | 1차 기획 템플릿 |
| `tests/claude/plan/agents/plan-draft-writer.test.ts` | 에이전트 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-draft-writer.md` | Claude와 동등 에이전트 |
| `src/codex/plan/commands/plan-draft.md` | 동등 래퍼 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] Lite 판정 시 올바른 경로 생성
- [ ] Standard 판정 시 올바른 경로 + routing-metadata 생성
- [ ] copy/dev × 시나리오 A/B/C 9가지 조합 테스트
- [ ] approved 상태 검증
- [ ] blueprint-import fast-track

### 5.2 회귀 시나리오 (dash-preview-phase3 복제)

- [ ] `/plan-draft IDEA-20260417-001` 호출 시 수동 개입 **0**
- [ ] Standard 판정 + Hybrid 시나리오 자동 감지
- [ ] `07-routing-metadata.md` 자동 생성

### 5.3 기존 동작 보장

- [ ] 기존 `/plan-draft` 호출 스크립트 미변경 (커맨드 서명 유지)
- [ ] Blueprint fast-track 경로 유지 (불변 계약)

---

## 6. 롤백 시나리오

에이전트 출력 품질이 수동 대비 낮으면:
1. `/plan-draft` Workflow 재작성 단계를 되돌림
2. 에이전트 파일은 유지 (차기 개선용)

---

## 7. 연관 백로그

- **IMP-KIT-004** (P0): plan-bridge-writer 신설 (같은 패턴)
- **IMP-KIT-013** (P1): Dev 착수 Gate 조기 플래그 (draft-writer에 통합 예정)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
