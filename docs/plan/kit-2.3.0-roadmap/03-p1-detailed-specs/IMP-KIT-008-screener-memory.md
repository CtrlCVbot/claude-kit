---
ID: IMP-KIT-008
제목: plan-idea-screener Hold→Go 재판정 메모리 기록
우선순위: P1
영향 도메인: plan
RICE: R3 × I3 × C4 ÷ E1 = 36
공수: S (1~2일)
Phase: 2.2
원본 타임라인: #6 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-002 (2.2.0 완료 — screener 프레임워크 파라미터화)
이해관계자 승인일: 2026-04-21
구현 완료일: 2026-04-21 (Claude Code 대행)
상태: shipped
---

# IMP-KIT-008 — plan-idea-screener Hold→Go 재판정 메모리 기록

## 1. 문제 정의

Hold 판정 이후 재스크리닝으로 Go 전환할 때 **근거가 에이전트 메모리에 누적되지 않음**. 다음 세션에서 같은 IDEA를 재판정할 때 이전 판단 맥락이 소실된다.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-008 라인 128~137](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md) — 문제/해결 원안
- [01-agent-capability-matrix.md §plan-idea-screener](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/01-agent-capability-matrix.md) — 에이전트 메모리 활용도

### 현재 상태

`src/claude/plan/agents/plan-idea-screener.md` 프론트매터에 `agent-memory` 참조는 있으나, 재판정 로그 섹션 스키마 없음. `agent-memory/plan-idea-screener/MEMORY.md` 파일도 현재 **존재하지 않음** (최초 실행 시 에이전트가 생성).

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: 메모리 섹션 자동 주입** ⭐ | 에이전트가 Hold→Go 전환 시점에 MEMORY.md 하단에 섹션 append | 간단, Skill 변경 최소 | 동시 수정 경합 시 순차 처리 필요 |
| B: 별도 JSON 로그 | `agent-memory/plan-idea-screener/rescoring-log.json` 배열 누적 | 구조화 쿼리 용이 | 소비자 부재, 오버엔지니어링 |
| C: IDEA 파일 내부 기록 | IDEA 파일 자체에 재판정 이력 추가 | 맥락 근접 | SSOT 분산, 파일 이동 시 유실 |

**선택: A** — 공수 S 범위 내, 기존 에이전트 메모리 원칙과 일치.

### 아키텍처

```
/plan-screen {IDEA-ID} --rescore
  └─ plan-idea-screener
       ├─ 이전 판정 조회 (MEMORY.md 탐색)
       ├─ 새 판정 실행 (RICE/5axis)
       ├─ 결과 비교 (Hold → Go 전환 감지)
       └─ [전환 시] MEMORY.md "재판정 로그" 섹션에 entry append
             ├─ IDEA ID
             ├─ 이전 점수 + 프레임워크
             ├─ 신규 점수 + 프레임워크
             └─ 승인 질문 결과 (Q1~QN)
```

### 재판정 로그 엔트리 스키마

```markdown
## 재판정 로그

### {IDEA-ID} — {YYYY-MM-DD HH:MM}

- **이전 판정**: Hold (RICE 8.5, 2026-02-15)
- **신규 판정**: Go (RICE 12.3, 2026-04-21)
- **프레임워크**: RICE → RICE (동일) / RICE → 5axis (변경)
- **승인 질문**:
  - Q1: Reach 상향 근거? → {사용자 응답 요약}
  - Q2: Effort 하향 근거? → {사용자 응답 요약}
- **전환 사유**: {100자 이내}
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/plan/agents/plan-idea-screener.rescoring-memory.test.ts` (신규)

```typescript
describe('plan-idea-screener — 재판정 메모리 기록', () => {
  it('Hold→Go 전환 시 MEMORY.md에 엔트리 append', async () => {
    const prevJudgment = { status: 'Hold', score: 8.5, framework: 'rice' }
    const newJudgment = { status: 'Go', score: 12.3, framework: 'rice' }

    await runScreener({ ideaId: 'IDEA-042', rescore: true, prev: prevJudgment, new: newJudgment })

    const memory = await readMemory('plan-idea-screener')
    expect(memory).toMatch(/재판정 로그/)
    expect(memory).toMatch(/IDEA-042/)
    expect(memory).toMatch(/Hold \(RICE 8\.5/)
    expect(memory).toMatch(/Go \(RICE 12\.3/)
  })

  it('Go→Go 재평가는 로그 미생성', async () => { /* 전환 아닌 경우 */ })
  it('프레임워크 변경 시 "RICE → 5axis" 명시', async () => { /* 차이 추적 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/plan/agents/plan-idea-screener.md` — `<Output_Format>`에 "재판정 로그 추가" 절차 섹션 추가
2. `src/claude/plan/skills/plan-screening-workflow/SKILL.md` — Hold→Go 전환 감지 + MEMORY append 워크플로우 스텝
3. `src/claude/plan/_schemas/rescoring-log-entry.schema.json` (신규) — 엔트리 스키마 SSOT

### 3.3 IMPROVE — 리팩토링

- 엔트리 템플릿을 `src/claude/plan/_templates/rescoring-log-entry.template.md`로 분리
- 에이전트 프롬프트는 템플릿 경로만 참조

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/agents/plan-idea-screener.md` | Output_Format에 재판정 로그 섹션 |
| `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 전환 감지 워크플로우 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/_schemas/rescoring-log-entry.schema.json` | 엔트리 스키마 SSOT |
| `src/claude/plan/_templates/rescoring-log-entry.template.md` | 엔트리 템플릿 |
| `tests/claude/plan/agents/plan-idea-screener.rescoring-memory.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-idea-screener.md` | 동등 Output_Format |
| `src/codex/plan/skills/plan-screening-workflow/SKILL.md` | 동등 워크플로우 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] Hold→Go 전환 시 엔트리 1건 기록
- [ ] Go→Go 재평가 시 엔트리 미기록
- [ ] Hold→Hold 재평가 시 엔트리 미기록 (score 변경만은 로그 아님)
- [ ] 프레임워크 변경 명시 (예: `RICE → 5axis`)

### 5.2 회귀 시나리오

`IDEA-dash-preview-phase3`와 유사한 Hold→Go 전환 사례 복제 1회:

- [ ] `agent-memory/plan-idea-screener/MEMORY.md`의 "재판정 로그" 섹션 엔트리 **1건 정확히 증가**
- [ ] 엔트리가 스키마 필드 100% 충족

### 5.3 후방 호환

- [ ] 기존 IDEA 파일 구조 미변경
- [ ] `--rescore` 플래그 미사용 호출은 동작 동일
- [ ] MEMORY.md 파일 부재 시 자동 생성 (최초 재판정)

---

## 6. 롤백 시나리오

재판정 로그 기록이 부작용 유발 시:

1. `src/claude/plan/agents/plan-idea-screener.md`에서 재판정 로그 섹션 제거
2. 기존 `agent-memory/plan-idea-screener/MEMORY.md`는 유지 (수동 정리)
3. 테스트 파일은 유지 (차기 시도 시 재사용)

---

## 7. 연관 백로그

- **IMP-KIT-002** (P0, 2.2.0 완료): screener 프레임워크 파라미터화 — 본 항목 선행
- **IMP-KIT-009** (P1, 병렬 가능): screener 파일 이동 권한 — 재판정 후속 자동화
- **IMP-KIT-017** (P1): 재복제 금지 — 엔트리가 IDEA 파일 복제 금지 원칙 준수

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
