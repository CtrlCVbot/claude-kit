---
ID: IMP-KIT-006
제목: Hybrid (reference-only) 모드 공식 정의
우선순위: P0 (블로커)
영향 도메인: copy
RICE: R3 × I4 × C5 ÷ E2 = 30
공수: M (3일)
원본 타임라인: #8
안티패턴: 미정의 모드 수동 지시
상태: draft
---

# IMP-KIT-006 — Hybrid (reference-only) 모드 공식 정의

## 1. 문제 정의

`.claude/rules/copy-commands.md`에 **Hybrid 모드가 언급만 되고 정식 워크플로우 정의 없음**. 매 세션마다 사용자가 수동으로 "reference-only 모드"를 지시해야 함.

### 현재 파일 상태 (실증)

`src/claude/copy/commands/copy-reference-refresh.md` 36~40행 Rules:
- `--scope`/`--viewport` 파라미터만 존재
- **`--reference-only` 플래그 없음**

`src/claude/copy/rules/copy-commands.md` (프로젝트 내 mologado 쪽 파일 기준 — kit 내 동등 rules 문서 확인 필요):
- Hybrid Feature의 처리가 "reference-only 모드 사용" 언급 있으나 구체 워크플로우 미정

### 근거 (원본 회고)

[00-session-retrospective.md §4.2](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/00-session-retrospective.md):
> 교훈: `.claude/rules/copy-commands.md`에 Hybrid가 언급되나 **정식 워크플로우 정의가 없어 매번 수동 지시** 필요 (이슈 #11)

---

## 2. 제안 해결안

### 2.1 Hybrid 모드 정의

**정의**: dev Feature이지만 레퍼런스 캡처가 필요한 경우 사용하는 경량 copy 워크플로우.

| 항목 | Hybrid 모드 |
|------|------------|
| Feature 유형 | dev |
| 수행 작업 | `/copy-reference-refresh`만 실행 (evidence 캡처) |
| 건너뛰는 단계 | 갭 분석, visual/interaction review, plan-unit, verify, closeout |
| 용도 | dev 구현 시 **시각적 참조로만** 사용 |

### 2.2 `--reference-only` 플래그 도입

`/copy-reference-refresh --reference-only --scope {sections} --viewport {viewports}`

### 2.3 자동 감지 (draft 단계 연계)

`/plan-draft`가 Feature 유형 판정 시 Hybrid 후보 감지:
- Feature 유형: `dev`
- 단, 레퍼런스 캡처 필요 시그널 (와이어프레임에 "레퍼런스" 언급 등)

감지 시 `07-routing-metadata.md`에 `hybrid: true` 기록.

### 2.4 rules 문서 정식화

`src/claude/copy/rules/copy-commands.md`에 "Hybrid Feature 처리" 섹션 정식 작성:
- 진입 조건
- 수행 작업
- 건너뛰는 단계
- 예외 처리

---

## 3. 구현 단계 (TDD)

### 3.1 RED

**파일**: `tests/claude/copy/commands/copy-reference-refresh.hybrid.test.ts` (신규)

```typescript
describe('/copy-reference-refresh — Hybrid 모드', () => {
  it('--reference-only 플래그 시 evidence만 생성', async () => {
    const result = await runCopyReferenceRefresh({
      slug: 'hybrid-feature',
      referenceOnly: true,
      scope: ['hero', 'cta'],
      viewport: ['desktop', 'mobile']
    })

    expect(result.mode).toBe('reference-only')
    expect(result.files_created).toContain('evidence/manifest.json')
    expect(result.gap_analysis_performed).toBe(false)
    expect(result.visual_review_performed).toBe(false)
  })

  it('Hybrid 자동 감지 (routing-metadata.hybrid=true) 시 reference-only 강제', async () => {
    const result = await runCopyReferenceRefresh({
      slug: 'auto-hybrid',
      autoDetect: true
    })

    expect(result.mode).toBe('reference-only')
    expect(result.detected_from).toBe('routing-metadata')
  })

  it('Hybrid 모드에서 갭 분석 시도 시 거부', async () => {
    await expect(
      runCopyGapAnalysis({
        slug: 'hybrid-feature',
        mode: 'reference-only'
      })
    ).rejects.toThrow(/Hybrid 모드는 갭 분석 불가/)
  })

  it('일반 copy 시나리오 A/B/C는 기존 동작 유지', async () => {
    const result = await runCopyReferenceRefresh({
      slug: 'scenario-c',
      referenceOnly: false
    })

    expect(result.mode).toBe('full')
  })
})

describe('plan-draft — Hybrid 자동 감지', () => {
  it('dev Feature + 레퍼런스 필요 시그널 → hybrid=true', async () => {
    const result = await runDraftWriter({
      ideaId: 'IDEA-WITH-WIREFRAME-REF'
    })

    expect(result.routing_metadata.feature_type).toBe('dev')
    expect(result.routing_metadata.hybrid).toBe(true)
  })

  it('dev Feature + 레퍼런스 시그널 없음 → hybrid=false', async () => {
    const result = await runDraftWriter({ ideaId: 'IDEA-PURE-DEV' })

    expect(result.routing_metadata.hybrid).toBe(false)
  })
})
```

### 3.2 GREEN

**파일 수정/생성**:

1. `src/claude/copy/commands/copy-reference-refresh.md` — `--reference-only` 플래그 추가
2. `src/claude/copy/rules/copy-commands.md` (또는 신설) — Hybrid 섹션 정식화
3. `src/claude/copy/agents/copy-reference-baseline.md` — reference-only 모드 처리 로직 추가
4. `src/claude/plan/agents/plan-draft-writer.md` (IMP-KIT-003과 연동) — Hybrid 감지 로직

### 3.3 IMPROVE

- Hybrid 모드의 evidence manifest에 `"mode": "reference-only"` 메타 추가
- rules/copy-commands.md에 Hybrid 플로우 다이어그램

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/copy/commands/copy-reference-refresh.md` | `--reference-only` 플래그 |
| `src/claude/copy/rules/copy-commands.md` | Hybrid 섹션 신설 |
| `src/claude/copy/agents/copy-reference-baseline.md` | reference-only 분기 |
| `src/claude/plan/agents/plan-draft-writer.md` | Hybrid 감지 (IMP-KIT-003 연동) |

### 신규

| 파일 | 목적 |
|------|------|
| `tests/claude/copy/commands/copy-reference-refresh.hybrid.test.ts` | Hybrid 모드 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/copy/commands/copy-reference-refresh.md` | 동등 플래그 |
| `src/codex/copy/rules/copy-commands.md` | 동등 Hybrid 섹션 |
| `src/codex/copy/agents/copy-reference-baseline.md` | 동등 분기 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] `--reference-only` 플래그 → evidence만 생성
- [ ] 자동 감지 (routing-metadata.hybrid=true) → 강제 reference-only
- [ ] Hybrid 모드에서 갭 분석 시도 → 거부
- [ ] 기존 시나리오 A/B/C 동작 유지

### 5.2 회귀 시나리오 (dash-preview-phase3 복제)

- [ ] `/plan-draft` 단계에서 Hybrid 자동 감지
- [ ] `/copy-reference-refresh` 자동으로 reference-only 모드 실행
- [ ] Hybrid 수동 지시 **0회**

### 5.3 기존 동작 보장

- [ ] 기존 `--scope`, `--viewport` 파라미터 유지
- [ ] 시나리오 A/B/C 파이프라인 후방 호환

---

## 6. 롤백 시나리오

자동 감지 오탐 시:
1. 자동 감지 비활성화 — `--reference-only` 명시 플래그만 허용
2. rules 섹션만 유지 (수동 워크플로우 안내)

---

## 7. 연관 백로그

- **IMP-KIT-003** (P0): plan-draft-writer (Hybrid 감지 연동)
- **IMP-KIT-019** (P2): 병렬 실행 기본값 정책

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
