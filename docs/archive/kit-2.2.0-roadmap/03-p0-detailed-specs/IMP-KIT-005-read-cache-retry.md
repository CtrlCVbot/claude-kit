---
ID: IMP-KIT-005
제목: Read 캐시 인증 자동 재시도 ("File has not been read yet")
우선순위: P0 (블로커)
영향 도메인: core (tool harness)
RICE: R5 × I3 × C5 ÷ E2 = 37.5
공수: S (1~2일)
원본 타임라인: #16
안티패턴: Read 캐시 미인증
상태: draft
---

# IMP-KIT-005 — Read 캐시 자동 재시도

## 1. 문제 정의

에이전트가 파일을 수정한 뒤 메인 세션이 `Edit` 시도 시 "File has not been read yet in this session. Read it first before writing to it." 에러 발생. 사용자가 Read 재실행 → Edit 재시도로 수동 수습.

### 근거 (원본 회고 인용)

[04-anti-patterns.md §안티패턴 1](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/04-anti-patterns.md):

> 에이전트가 수정한 직후 메인이 Edit 시도 시 발생. 메인 세션의 Read 캐시는 **변경 전 내용**에 머묾 → Edit 시도 시 캐시 불일치로 실패.

### 근본 원인

에이전트 ↔ 메인 세션 간 Read 캐시 동기화 없음. 메인이 에이전트에게 위임한 파일 변경이 메인 캐시에 반영되지 않음.

---

## 2. 제안 해결안

### 해결안 A (권장): Edit 도구 자동 재시도 훅

Edit 도구가 "File has not been read yet" 반환 시:
1. 자동으로 해당 파일 Read 실행
2. Read 성공 시 Edit 재시도 1회
3. 재시도도 실패하면 사용자에게 명확한 에러 반환

### 해결안 B: 에이전트 완료 훅 — 변경 파일 리스트 반환

에이전트가 완료 시 변경한 파일 리스트를 반환 → 메인이 해당 파일 캐시 무효화.

**권장: A안** (B안은 에이전트 프롬프트 변경 필요, A안은 tool harness만 수정).

### A안 플로우

```
main.Edit(file_path, old, new)
  ↓
  error: "File has not been read yet"
  ↓
harness.catch(error)
  ↓
harness.Read(file_path)        ← 자동 1회 재시도
  ↓
harness.Edit(file_path, old, new)
  ↓
  success → 반환
  failure → 사용자에게 원래 에러 + 재시도 실패 근거 반환
```

---

## 3. 구현 위치

claude-kit 자체는 tool harness를 제어하지 못한다. 따라서:

### 3.1 직접 개입 불가 — 우회 전략

Tool harness는 Claude Code / Codex SDK 측에서 제공. claude-kit에서 해결 가능한 범위:

1. **Skill/에이전트 완료 훅 제안** (B안의 경량 버전)
2. **사용자 지침 강화** — rules/verification.md에 "에이전트 완료 후 Read 재인증" 체크리스트 추가
3. **업스트림 이슈 등록** — Claude Code / Codex 측에 개선 요청 연계

### 3.2 claude-kit 내 실행 계획

**Phase 1 (즉시)**: `src/claude/core/rules/verification.md`에 안티패턴 및 체크리스트 추가

**Phase 2 (훅 도입)**: `src/claude/core/hooks/agent-completion-cache-invalidate.js` 신설
- 에이전트 Stop 이벤트 훅
- 변경 파일 리스트 파싱 → `TouchFile` 마커 생성
- 메인 세션이 해당 마커 확인 후 Edit 전 Read 재호출

---

## 4. 구현 단계 (TDD)

### 4.1 RED

**파일**: `tests/claude/core/hooks/agent-cache-invalidate.test.ts` (신규)

```typescript
describe('agent-completion-cache-invalidate hook', () => {
  it('에이전트 완료 시 변경 파일 리스트 파싱', async () => {
    const agentOutput = {
      agent_type: 'dev-doc-updater',
      status: 'success',
      modified_files: ['src/foo.ts', 'src/bar.ts']
    }

    const markers = await parseCompletionHook(agentOutput)

    expect(markers).toEqual([
      { file_path: 'src/foo.ts', cache_invalid: true },
      { file_path: 'src/bar.ts', cache_invalid: true }
    ])
  })

  it('메인 세션 Edit 전 무효화된 파일은 Read 재호출 유도', async () => {
    const cacheState = { 'src/foo.ts': 'invalid' }
    const check = validateCacheBeforeEdit('src/foo.ts', cacheState)

    expect(check.shouldReRead).toBe(true)
    expect(check.reason).toContain('agent-modified')
  })

  it('modified_files 리스트가 없으면 무효화 안 함', async () => {
    const agentOutput = { agent_type: 'dev-architect', status: 'success' }
    const markers = await parseCompletionHook(agentOutput)

    expect(markers).toEqual([])
  })
})
```

### 4.2 GREEN

**파일 생성/수정**:

1. `src/claude/core/hooks/agent-completion-cache-invalidate.js` — 훅 스크립트
2. `src/claude/core/rules/verification.md` — 체크리스트 섹션 추가
3. `src/claude/core/rules/interaction.md` — 에이전트 완료 후 Read 재호출 지침

### 4.3 IMPROVE

- 무효화 마커를 Claude Code settings.json hooks 설정에 통합 가능 여부 검토
- Codex 쪽도 동등 hook 구조 검토

---

## 5. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/core/rules/verification.md` | Read 캐시 안티패턴 체크리스트 |
| `src/claude/core/rules/interaction.md` | 에이전트 위임 후 Read 재호출 지침 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/hooks/agent-completion-cache-invalidate.js` | 캐시 무효화 훅 |
| `tests/claude/core/hooks/agent-cache-invalidate.test.ts` | 훅 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/core/rules/verification.md` | 동등 지침 |
| `src/codex/core/rules/interaction.md` | 동등 지침 |
| `src/codex/core/hooks/agent-completion-cache-invalidate.js` | Codex 훅 대응 (Codex hooks runtime 없으므로 fallback artifact) |

---

## 6. 검증 기준

### 6.1 단위 테스트 통과

- [ ] 에이전트 출력 파싱으로 변경 파일 리스트 추출
- [ ] 변경 파일의 캐시 무효화 마커 생성
- [ ] 메인이 Edit 전 마커 확인 → Read 재호출 유도
- [ ] 변경 파일 없으면 마커 생성 안 함

### 6.2 회귀 시나리오 (dash-preview-phase3 #16)

- [ ] plan-wireframe-designer가 파일 수정 후 메인이 Edit 시도
- [ ] 훅이 자동 무효화 마커 생성
- [ ] 메인이 Edit 전 Read 재호출 (또는 경고)
- [ ] Edit 성공률 100%

### 6.3 기존 동작 보장

- [ ] 에이전트를 사용하지 않는 세션은 훅 미작동
- [ ] 훅 실패 시 Edit 시도는 정상 진행 (fail-open)

---

## 7. 롤백 시나리오

훅이 오탐/부작용 유발 시:
1. `src/claude/core/hooks/agent-completion-cache-invalidate.js` 비활성화
2. rules/verification.md의 체크리스트만 유지 (수동 대응)
3. 이슈 Claude Code / Codex 업스트림에 재보고

---

## 8. 연관 백로그

- **IMP-KIT-021** (P2): 에이전트 결과 trust-only 금지 가드 (본 항목의 상위 개념)
- **IMP-KIT-024** (P2): 에이전트 호출 텔레메트리 (훅 데이터 수집 기반)

---

## 9. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
