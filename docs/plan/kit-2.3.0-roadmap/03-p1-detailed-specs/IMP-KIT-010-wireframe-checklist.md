---
ID: IMP-KIT-010
제목: plan-wireframe-designer 체크리스트 확장
우선순위: P1
영향 도메인: plan
RICE: R3 × I3 × C4 ÷ E1 = 36
공수: S (1~2일)
Phase: 2.2
원본 타임라인: #13~#17 (dash-preview-phase3 회고)
선행 의존: 없음 (독립)
이해관계자 승인일: 2026-04-21
상태: reviewed
---

# IMP-KIT-010 — plan-wireframe-designer 체크리스트 확장

## 1. 문제 정의

Wireframe 에이전트가 동일 세션에서 **3회 재호출** 발생. pre-filled 가상 데이터·개인정보 마스킹·5개 viewport 판정·decision-log가 Skill 체크리스트에 **부재**하여, 사용자가 피드백으로 지적한 후에야 반영됨.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-010 라인 154~166](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- [00-session-retrospective.md #13~#17](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/00-session-retrospective.md) — 3회 재호출 타임라인

### 현재 상태

`src/claude/plan/skills/plan-wireframe-design/SKILL.md`의 체크리스트가 "초안·검수" 수준 일반 항목 위주. 프로젝트 특화(화주·담당자, 개인정보, viewport) 항목이 누락.

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: Skill 체크리스트 직접 추가** ⭐ | SKILL.md에 4개 필수 항목 명시 | 단순, 즉효 | Skill 파일 비대화 |
| B: 외부 체크리스트 파일 | `_checklists/wireframe.md` 신설, SKILL이 참조 | 재사용 용이 | 간접 참조 증가, 에이전트가 2파일 읽음 |
| C: 에이전트 프롬프트에 이식 | `plan-wireframe-designer.md`에 체크리스트 | 에이전트 자율 검증 | SKILL과 중복 |

**선택: A** — 공수 S 내, 즉효. 체크리스트 4개 항목만 추가하므로 비대화 영향 미미.

### 추가할 체크리스트 4항목

```markdown
## Pre-render 체크리스트 (필수)

- [ ] **가상 데이터 pre-filled**: 화주명·담당자·연락처가 빈칸 아닌 현실적 예시값
- [ ] **개인정보 마스킹**: 연락처(010-****-1234), 사업자번호(***-**-*****)
- [ ] **Viewport 판정**: 5개 뷰포트 각각 적합 여부 (1440/1280/1024/768/390)
- [ ] **Decision-log 생성**: `decision-log.md`에 주요 UI 결정 ≥ 3건 기록
```

### 아키텍처

```
/plan-wireframe {slug}
  └─ plan-wireframe-designer
       ├─ Skill 로드 (체크리스트 포함)
       ├─ 와이어프레임 생성
       ├─ [필수 체크리스트 4항목 자체 검증]
       │    └─ 미충족 시 보완 후 재생성 (에이전트 내부 루프)
       └─ 최종 산출 + decision-log.md
```

에이전트가 **세션 종료 전에 체크리스트 자체 검증**하도록 Skill에 강제 스텝 추가 — 사용자 피드백 이후 재호출 → 사전 충족 구조로 전환.

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/plan/agents/plan-wireframe-designer.checklist.test.ts` (신규)

```typescript
describe('plan-wireframe-designer — 체크리스트 자체 검증', () => {
  it('가상 데이터 pre-filled 미충족 시 재생성', async () => {
    const result = await runWireframe({ slug: 'feat-x', mockData: 'empty' })

    expect(result.attempts).toBeGreaterThanOrEqual(2)
    expect(result.final.hasFilledMockData).toBe(true)
  })

  it('개인정보 마스킹 규칙 자동 적용', async () => {
    const result = await runWireframe({ slug: 'feat-x', mockData: 'raw-contacts' })
    expect(result.final.content).not.toMatch(/010-\d{4}-\d{4}/)
    expect(result.final.content).toMatch(/010-\*{4}-\d{4}/)
  })

  it('5개 viewport 판정 모두 포함', async () => {
    const result = await runWireframe({ slug: 'feat-x' })
    expect(result.final.viewports).toEqual(['1440', '1280', '1024', '768', '390'])
  })

  it('decision-log.md 생성 + 항목 ≥ 3건', async () => {
    const result = await runWireframe({ slug: 'feat-x' })
    const log = await readFile(`.plans/features/active/feat-x/decision-log.md`)
    expect(log.match(/^###/gm)?.length ?? 0).toBeGreaterThanOrEqual(3)
  })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/plan/skills/plan-wireframe-design/SKILL.md` — "Pre-render 체크리스트" 섹션 추가, 자체 검증 루프 명시
2. `src/claude/plan/agents/plan-wireframe-designer.md` — Skill 참조 강화 + 체크리스트 실패 시 재생성 지시
3. `src/claude/plan/_templates/decision-log.template.md` (신규) — 최소 3항목 골격

### 3.3 IMPROVE — 리팩토링

- 마스킹 규칙을 `src/claude/plan/_constants/pii-masking-rules.json`으로 분리
- Skill이 규칙 JSON 참조 → 마스킹 정책 변경 시 Skill 편집 불필요

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/skills/plan-wireframe-design/SKILL.md` | Pre-render 체크리스트 4항목 |
| `src/claude/plan/agents/plan-wireframe-designer.md` | 자체 검증 + 재생성 루프 지시 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/_templates/decision-log.template.md` | decision-log 골격 |
| `src/claude/plan/_constants/pii-masking-rules.json` | PII 마스킹 정책 SSOT |
| `tests/claude/plan/agents/plan-wireframe-designer.checklist.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/skills/plan-wireframe-design/SKILL.md` | 동등 체크리스트 |
| `src/codex/plan/agents/plan-wireframe-designer.md` | 동등 검증 루프 |
| `src/codex/plan/_templates/decision-log.template.md` | 동등 템플릿 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 4항목 각각 독립 테스트 통과
- [ ] 미충족 항목은 재생성 1~2회 내 수렴
- [ ] 5회 연속 재생성 시 실패 보고 (무한 루프 방지)

### 5.2 회귀 시나리오

dash-preview-phase3 wireframe 3회 재호출 사례 복제:

- [ ] **Wireframe 재호출 ≤ 1회/세션** (원본 3회 대비 감소)
- [ ] decision-log.md 최소 3항목 자동 생성
- [ ] 개인정보 마스킹 100%

### 5.3 후방 호환

- [ ] 기존 wireframe 산출 파일 구조 미변경 (제목/섹션 순서)
- [ ] 체크리스트 미지원 구 버전 Skill 호출 시 경고만, 실패 아님

---

## 6. 롤백 시나리오

자체 검증 루프가 무한 루프/품질 저하 유발 시:

1. SKILL.md 체크리스트 섹션 제거 (파일 자체는 유지)
2. 에이전트 프롬프트의 재생성 지시 제거
3. `decision-log.template.md`, `pii-masking-rules.json`은 유지 (향후 재사용)

---

## 7. 연관 백로그

- **IMP-KIT-007** (P1, Phase 2.1): `/plan-review` 자동 후속 — wireframe 완료 후 리뷰 자동화 대상
- **IMP-KIT-013** (P1): Dev 착수 Gate Draft 조기 플래그 — decision-log와 연계
- **IMP-KIT-017** (P1): 재복제 금지 — 체크리스트가 기존 SKILL 내용 복제 아닌 추가

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
