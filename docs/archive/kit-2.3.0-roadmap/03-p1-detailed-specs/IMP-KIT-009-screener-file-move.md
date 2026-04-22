---
ID: IMP-KIT-009
제목: plan-idea-screener 파일 이동 권한 확장
우선순위: P1
영향 도메인: plan
RICE: R3 × I3 × C5 ÷ E1 = 45
공수: S (1일)
Phase: 2.2
원본 타임라인: #6 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-002 (2.2.0 완료) · IMP-KIT-008 (병렬 가능, 통합 시 순서 권장)
이해관계자 승인일: 2026-04-21
구현 완료일: 2026-04-21 (Claude Code 대행)
상태: shipped
---

# IMP-KIT-009 — plan-idea-screener 파일 이동 권한 확장

## 1. 문제 정의

승인 게이트 통과 후 `10-screening/` → `20-approved/` 폴더 이동이 **사용자 수동 수행**. 에이전트가 판정·기록까지만 하고 파일 시스템 조작은 수행 못 하는 권한 공백.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-009 라인 141~150](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- [03-gap-analysis.md §plan 도메인 수동 개입 지점](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/03-gap-analysis.md)

### 현재 상태

`src/claude/plan/agents/plan-idea-screener.md` 프론트매터 `tools` 필드에 `Bash` **미포함**. 이동 동작이 어떤 도구로도 불가능.

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: Bash 권한 확장** ⭐ | `tools`에 `Bash` 추가 + Skill에서 `mv` 명령 실행 | 단순, 기존 패턴(파일 이동) 재사용 | Bash 권한 확대 = 남용 위험 |
| B: 전용 move 도구 | 전용 MCP/커맨드 도구 신설 | 권한 최소화 | 공수 증가 (M 이상), 유지비 |
| C: 후속 커맨드 분리 | `/plan-screen-approve` 신설 | 관심사 분리 | 사용자 추가 입력 1회 필요 — RICE C=5 달성 불가 |

**선택: A** — Bash 권한은 "approved/승인 후 이동"으로 Skill에서 명령 화이트리스트 제약.

### 아키텍처

```
/plan-screen {IDEA-ID} (승인 게이트 통과)
  └─ plan-idea-screener
       ├─ 승인 여부 판정
       ├─ [승인 시] 이동 명령 구성
       │     mv .plans/ideas/10-screening/{IDEA-ID}.md
       │        .plans/ideas/20-approved/{IDEA-ID}.md
       ├─ Bash 실행 (Skill 화이트리스트 검증)
       └─ 이동 결과 보고 (경로 before/after)
```

### Skill 화이트리스트 제약

`src/claude/plan/skills/plan-screening-workflow/SKILL.md`에 명시:

- **허용**: `mv .plans/ideas/{10-screening,20-approved,30-on-hold}/{IDEA-ID}.md .plans/ideas/{10-screening,20-approved,30-on-hold}/{IDEA-ID}.md`
- **금지**: 다른 경로/패턴의 `mv`, `rm`, `cp`
- **검증**: 소스 경로 내 `10-screening`, 목적지 경로 내 `20-approved|30-on-hold` 정규식 검사

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/plan/agents/plan-idea-screener.file-move.test.ts` (신규)

```typescript
describe('plan-idea-screener — 파일 이동', () => {
  it('승인 시 10-screening → 20-approved 자동 이동', async () => {
    await prepareIdea('IDEA-042', '10-screening')
    await runScreener({ ideaId: 'IDEA-042', approve: true })

    expect(await exists('.plans/ideas/10-screening/IDEA-042.md')).toBe(false)
    expect(await exists('.plans/ideas/20-approved/IDEA-042.md')).toBe(true)
  })

  it('Hold 판정 시 10-screening → 30-on-hold 자동 이동', async () => { /* ... */ })
  it('비허용 경로 mv 요청은 차단', async () => { /* 화이트리스트 검증 */ })
  it('이미 20-approved에 있는 IDEA 재호출 시 no-op + 경고', async () => { /* 멱등성 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/plan/agents/plan-idea-screener.md` 프론트매터 `tools`에 `Bash` 추가
2. `src/claude/plan/skills/plan-screening-workflow/SKILL.md` — 이동 단계 + 화이트리스트 규칙
3. `src/claude/plan/hooks/plan-doc-guard.js` — mv 명령 화이트리스트 검증 확장 (기존 Edit|Write 가드와 동일 패턴)

### 3.3 IMPROVE — 리팩토링

- 경로 상수를 `src/claude/plan/_constants/idea-folders.json`으로 분리 (`.plans/ideas/00-inbox`, `10-screening`, `20-approved`, `30-on-hold`)
- Skill과 가드 훅이 동일 상수 참조 → drift 방지

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/agents/plan-idea-screener.md` | `tools` 필드에 `Bash` 추가 |
| `src/claude/plan/skills/plan-screening-workflow/SKILL.md` | 이동 단계 + 화이트리스트 |
| `src/claude/plan/hooks/plan-doc-guard.js` | mv 화이트리스트 검증 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/_constants/idea-folders.json` | 폴더 경로 SSOT |
| `tests/claude/plan/agents/plan-idea-screener.file-move.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-idea-screener.md` | 동등 `tools` 확장 |
| `src/codex/plan/skills/plan-screening-workflow/SKILL.md` | 동등 워크플로우 |
| `src/codex/plan/hooks/plan-doc-guard.js` | 동등 가드 (Codex hooks runtime 호환 분류 확인 — `_meta/codex-portability.json`) |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 승인 판정 → `20-approved` 이동 1회
- [ ] Hold 판정 → `30-on-hold` 이동 1회
- [ ] 비허용 경로(`mv .plans/ideas/20-approved/X.md /tmp/X.md`) 차단
- [ ] 멱등성: 이미 이동된 IDEA 재호출 시 경고만 출력, 에러 아님

### 5.2 회귀 시나리오

dash-preview-phase3 IDEA 처리 복제:

- [ ] 파일 이동 **수동 개입 0회**
- [ ] 5개 IDEA 모두 올바른 폴더로 이동
- [ ] 이동 실패 케이스 (권한 부재, 파일 락) 시 명확한 에러 메시지

### 5.3 후방 호환

- [ ] 기존 IDEA 파일 구조 미변경
- [ ] `Bash` 권한 추가가 다른 도구 호출에 영향 없음 (화이트리스트 가드 동작)
- [ ] `plan-doc-guard.js` 기존 Edit|Write 가드 규칙 변경 없음

---

## 6. 롤백 시나리오

자동 이동이 부작용 유발 시:

1. `plan-idea-screener.md` `tools`에서 `Bash` 제거
2. 수동 이동 지침을 Skill에 복구
3. 화이트리스트 가드 로직은 유지 (다른 mv 호출 보호)

---

## 7. 연관 백로그

- **IMP-KIT-008** (P1): 재판정 메모리 — 본 항목과 같은 screener 도메인, 이동 전 메모리 기록 순서 권장
- **IMP-KIT-002** (P0, 2.2.0 완료): 프레임워크 파라미터화 — 판정 결과가 이동 분기의 입력
- **IMP-KIT-017** (P1): 재복제 금지 — 이동은 복제 아닌 rename 확인

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
