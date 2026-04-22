---
ID: IMP-KIT-002
제목: plan-idea-screener 프레임워크 파라미터화 (RICE vs 5축)
우선순위: P0 (블로커)
영향 도메인: plan, core
RICE: R5 × I4 × C5 ÷ E1 = 100 (최고)
공수: S (1일)
원본 타임라인: #5
안티패턴: 프레임워크 silent drift
상태: draft
---

# IMP-KIT-002 — plan-idea-screener 프레임워크 파라미터화

## 1. 문제 정의

**description은 RICE 프레임워크라고 명시**하지만 **실제 Output_Format은 5축 가중 점수** (비즈니스/사용자/기술/전략/긴급). description ↔ 구현 drift가 **silent**하게 발생.

### 현재 파일 상태 (실증)

`src/claude/plan/agents/plan-idea-screener.md` 3행 description:
```yaml
description: RICE 프레임워크 기반 아이디어 스크리닝 전문 에이전트.
             Reach/Impact/Confidence/Effort 점수를 산출하고
             Lite/Standard 카테고리를 판정합니다.
```

같은 파일 62~74행 Output_Format:

### 평가 요약

| 축 | 점수 (0-100) | 가중치 | 가중 점수 |
|---|---|---|---|
| 비즈니스 가치 | {score} | 30% | {weighted} |
| 사용자 영향 | {score} | 25% | {weighted} |
| 기술적 실현성 | {score} | 20% | {weighted} |
| 전략적 정렬 | {score} | 15% | {weighted} |
| 긴급도 | {score} | 10% | {weighted} |


**두 개의 서로 다른 프레임워크가 하나의 에이전트 파일에 공존**. 사용자는 description을 읽고 RICE를 기대하나 실제 출력은 5축. 이것이 **silent drift의 근원**.

---

## 2. 제안 해결안

### 2.1 커맨드 파라미터 도입

```bash
/plan-screen {IDEA-ID} --framework rice
/plan-screen {IDEA-ID} --framework 5axis
/plan-screen {IDEA-ID}                    # 프로젝트 CLAUDE.md 기본값 폴백
```

### 2.2 프레임워크별 Output 스키마 분리

**RICE 스키마**:

### 평가 요약 (RICE)
| 요소 | 값 | 근거 |
|-----|-----|------|
| Reach | {1-5} | {영향 대상자 수 근거} |
| Impact | {0.25, 0.5, 1, 2, 3} | {개별 영향 크기 근거} |
| Confidence | {50%, 80%, 100%} | {확신도 근거} |
| Effort | {person-months} | {개발 공수 근거} |
| **RICE Score** | **(R × I × C) / E** | |


**5축 스키마**: 현재 포맷 유지.

### 2.3 프로젝트 기본값 (CLAUDE.md)

`CLAUDE.md`에 섹션 추가:
```markdown
## plan 도메인 기본 설정

- idea-screening framework: `rice` | `5axis` (기본: `rice`)
```

### 2.4 명시적 고지

기본값 폴백 시 에이전트가 첫 줄에 **프레임워크 명시**:
```
> 프레임워크: RICE (CLAUDE.md 기본값)
```

---

## 3. 구현 단계 (TDD)

### 3.1 RED

**파일**: `tests/claude/plan/commands/plan-screen.framework.test.ts` (신규)

```typescript
describe('/plan-screen — 프레임워크 선택', () => {
  it('--framework rice 명시 시 RICE 스키마 출력', async () => {
    const result = await runPlanScreen({
      ideaId: 'IDEA-20260420-001',
      framework: 'rice'
    })

    expect(result.framework).toBe('rice')
    expect(result.score).toHaveProperty('reach')
    expect(result.score).toHaveProperty('impact')
    expect(result.score).toHaveProperty('confidence')
    expect(result.score).toHaveProperty('effort')
    expect(result.score).not.toHaveProperty('business_value')  // 5축 키 없음
  })

  it('--framework 5axis 명시 시 5축 스키마 출력', async () => {
    const result = await runPlanScreen({
      ideaId: 'IDEA-20260420-001',
      framework: '5axis'
    })

    expect(result.framework).toBe('5axis')
    expect(result.score).toHaveProperty('business_value')
    expect(result.score).toHaveProperty('user_impact')
    expect(result.score).not.toHaveProperty('reach')  // RICE 키 없음
  })

  it('--framework 생략 시 CLAUDE.md 기본값 사용', async () => {
    const result = await runPlanScreen({ ideaId: 'IDEA-20260420-001' })

    expect(result.framework).toMatch(/^(rice|5axis)$/)
    expect(result.source).toBe('claude-md-default')
  })

  it('잘못된 프레임워크 이름 거부', async () => {
    await expect(
      runPlanScreen({ ideaId: 'IDEA-X', framework: 'invalid' })
    ).rejects.toThrow(/프레임워크는 rice 또는 5axis/)
  })
})
```

### 3.2 GREEN

**파일 수정**:

1. `src/claude/plan/commands/plan-screen.md` — `--framework` 플래그 섹션 추가
2. `src/claude/plan/agents/plan-idea-screener.md` — description 수정 ("RICE 또는 5축 기반"), Output_Format 분리
3. `src/claude/plan/skills/plan-screening-workflow/SKILL.md` — 양 프레임워크 워크플로우 병기

### 3.3 IMPROVE

- 프레임워크 스키마를 `src/claude/plan/_schemas/{rice,5axis}.schema.json`으로 분리
- Skill에서 경로로 참조

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/commands/plan-screen.md` | `--framework` 파라미터 추가 |
| `src/claude/plan/agents/plan-idea-screener.md` | description 정정 + Output_Format 양 스키마 |
| `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 양 프레임워크 명세 |
| `CLAUDE.md` (프로젝트별) | 기본 프레임워크 설정 섹션 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/_schemas/rice.schema.json` | RICE 출력 스키마 |
| `src/claude/plan/_schemas/5axis.schema.json` | 5축 출력 스키마 |
| `tests/claude/plan/commands/plan-screen.framework.test.ts` | 프레임워크 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/commands/plan-screen.md` | Claude와 동등 `--framework` 파라미터 |
| `src/codex/plan/agents/plan-idea-screener.md` | 동등 description + Output 분리 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] `--framework rice` → RICE 스키마 출력
- [ ] `--framework 5axis` → 5축 스키마 출력
- [ ] 생략 시 CLAUDE.md 기본값 사용 + 출력 첫 줄에 명시
- [ ] 잘못된 값 거부 (명확한 에러 메시지)

### 5.2 회귀 시나리오

- [ ] dash-preview-phase3의 IDEA-20260417-001을 `--framework rice`로 재스크리닝 → RICE 스코어만 출력
- [ ] 프레임워크 drift 0건
- [ ] description ↔ 실제 출력 일치

### 5.3 기존 동작 보장

- [ ] 기존 CLAUDE.md 미설정 프로젝트는 **기본 `rice`**로 폴백 (후방 호환)
- [ ] 기존 5축 결과 파일은 유지 (재작성 강제 금지)

---

## 6. 롤백 시나리오

`--framework` 파라미터 파싱 오류 시:
1. 파라미터 무시 → 기존 동작 복귀
2. 에이전트 Output_Format을 한쪽으로 단일화 (5축 유지 권장)
3. description만 정정 ("5축 기반"으로)

---

## 7. 연관 백로그

- **IMP-KIT-008** (P1): 재판정 로그 메모리 기록 (프레임워크 선택 이력 포함)
- **IMP-KIT-009** (P1): 파일 이동 권한 (본 항목 후속)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
