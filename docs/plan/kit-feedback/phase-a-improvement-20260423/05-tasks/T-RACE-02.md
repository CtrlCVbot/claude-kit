# T-RACE-02 — Read 캐시 자동 재인증 hook 개선

**제안**: P-3 (RACE)
**원본 피드백**: I-04 (High), N-03
**우선순위**: 🟠 P1 High
**릴리스**: v2.4.1
**선행**: 없음
**후행**: 없음

## 목적

에이전트가 파일 수정 후 메인 세션의 Edit 시 "File has not been read yet" 에러 반복 대응 자동화. 현재는 warning 만 출력되어 메인이 수동 Read 재호출 필요.

## 수행 내용

1. 기존 `agent-completion-cache-invalidate` hook(core) 확장:

   ```javascript
   // 기존: warning 메시지 출력
   // 개선: 구조화 JSON 기록

   // on SubagentStop
   const modifiedFiles = detectAgentEditsFromSession()  // 에이전트 세션 내 Edit|Write 파일 수집
   const pendingReread = JSON.parse(readFileSync('.claude/state/pending-reread.json') || '{"files": []}')

   // 중복 제거 + 추가
   const union = Array.from(new Set([...pendingReread.files, ...modifiedFiles]))
   writeFileSync('.claude/state/pending-reread.json', JSON.stringify({
     files: union,
     updated_at: new Date().toISOString(),
     source_agent: agentName
   }))
   ```

2. 메인 Edit 도구 전 hook(`pre-tool-use-edit-reread.js` 신규):

   ```javascript
   // on PreToolUse (Edit|Write)
   const pending = JSON.parse(readFileSync('.claude/state/pending-reread.json') || '{"files": []}')
   if (pending.files.includes(args.file_path)) {
     // 자동 Read 호출 (메인 세션 컨텍스트에서 실행)
     await mainSessionRead(args.file_path)
     // 목록에서 제거
     pending.files = pending.files.filter(f => f !== args.file_path)
     writeFileSync('.claude/state/pending-reread.json', JSON.stringify(pending))
     // systemMessage: "에이전트 수정 파일 자동 Read 완료"
   }
   ```

3. Read-only 에이전트 제외:
   - `agent-file-ownership.md` (T-RACE-01) 또는 verification.md 의 read-only 목록 참조
   - Read-only 에이전트(`plan-reviewer`, `dev-architect`, `dev-code-reviewer`, 등 8 개) 완료 시 **pending-reread.json 에 추가하지 않음**

4. 단위 테스트:
   - write-capable 에이전트 완료 → pending-reread.json 에 파일 추가 확인
   - 메인 Edit 시도 → 자동 Read 선행 → 목록에서 제거 확인
   - read-only 에이전트 완료 → pending-reread.json 변동 없음

5. `verification.md` Agent Edit Race 섹션 갱신:
   - 기존 "수동 Read 재호출 권장" 을 "자동 재인증 작동" 으로 갱신
   - hook 실패 시 fallback 경로(수동 Read) 명시 유지

## AC

- [ ] `agent-completion-cache-invalidate.js` 구조화 JSON 기록으로 개선
- [ ] `pre-tool-use-edit-reread.js` 신규 hook 존재
- [ ] `.claude/state/pending-reread.json` 정상 작성
- [ ] 메인 Edit 시도 시 자동 Read 선행 작동
- [ ] Read-only 에이전트(8 개) 완료 시 목록 추가 없음
- [ ] 단위 테스트 ≥ 3 건 통과
- [ ] `verification.md` 갱신

## 파일

- 수정: `src/claude/core/hooks/agent-completion-cache-invalidate.js`
- 신규: `src/claude/core/hooks/pre-tool-use-edit-reread.js`
- 신규: `src/claude/core/hooks/agent-completion-cache-invalidate.test.js`
- 수정: `src/claude/core/rules/verification.md` (Agent Edit Race 섹션)

## 리스크

- **R-새**: 자동 Read 가 큰 파일에서 context 사용량 증가 → **완화**: Read 호출 전 파일 크기 확인 (≥500 KB 시 수동 Read 권장 경고)

## 롤백

`pre-tool-use-edit-reread.js` 비활성화 → `agent-completion-cache-invalidate.js` 경고 메시지 출력 방식으로 복귀.

## 검증 방법

```
# Case 1: write-capable 에이전트 후 메인 Edit
에이전트(plan-draft-writer) 완료 → pending-reread.json 에 draft.md 추가 확인
메인 Edit(draft.md) → systemMessage "자동 Read 완료" → Edit 성공

# Case 2: Read-only 에이전트 후 메인 Edit
에이전트(plan-reviewer) 완료 → pending-reread.json 변동 없음
메인 Edit(IDEA.md) → 자동 Read 불필요 → 기존 동작

# Case 3: hook 실패 fallback
.claude/state/ 권한 제거 → Edit 시도 → 기존 에러 "File has not been read yet" → 사용자 수동 Read
```

## 보존 원칙

- **P-07 Read-only 에이전트 분리**: Read-only 에이전트 제외 로직이 분리 원칙을 시스템에 통합.
- **Agent Edit Race 룰**: verification.md 의 기존 체크리스트는 fallback 경로로 유지.
