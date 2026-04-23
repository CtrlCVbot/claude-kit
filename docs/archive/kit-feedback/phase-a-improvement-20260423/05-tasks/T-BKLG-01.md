# T-BKLG-01 — 변경 이력 자동 append hook

**제안**: P-10 (BKLG)
**원본 피드백**: I-18 (Low), N-18
**우선순위**: 🟢 P3 Low
**릴리스**: Backlog
**선행**: 없음
**후행**: 없음

## 활성화 조건

- edit 요약 수집 UX 합의 (사용자에게 자동 요청 vs 에이전트 자동 감지)
- `.claude/hooks/post-edit-history.js` 표준 위치 합의

## 목적

모든 plan 문서의 `## N. 변경 이력` 테이블에 변경 사항 자동 append. 수동 append 누락·granularity 불일치 제거.

## 수행 내용

1. `src/claude/core/hooks/post-edit-history.js` 신규 hook:

   ```javascript
   // Trigger: PostToolUse (Edit|Write) on .md 파일
   on('PostToolUse', async ({tool, args}) => {
     if (tool !== 'Edit' && tool !== 'Write') return
     const file = args.file_path
     if (!file.endsWith('.md')) return

     // 변경 이력 테이블 위치 감지
     const content = readFileSync(file, 'utf-8')
     const match = content.match(/## \d+\. 변경 이력\n\n\| 날짜 \| 내용 \|\n\|[\s\S]+?\n((?:\| .+ \|\n)+)/)
     if (!match) return  // 테이블 없는 파일은 skip

     // 날짜 + 요약 수집
     const date = new Date().toISOString().split('T')[0]  // YYYY-MM-DD
     const summary = await collectEditSummary(args)       // UX 필요
     if (!summary) return                                 // 수동 skip 허용

     // Append
     const newRow = `| ${date} | ${summary} |`
     const updated = content.replace(match[0], match[0].trimEnd() + '\n' + newRow + '\n')
     writeFileSync(file, updated)
   })
   ```

2. Edit 요약 수집 UX (합의 필요):
   - **Option A**: 사용자에게 매번 요약 요청 (피로도 큼)
   - **Option B**: 에이전트가 edit 컨텍스트에서 자동 추론 (정확도 이슈)
   - **Option C**: `--summary "..."` 플래그로 명시 (편리하나 일관성 저하)
   - **Option D** (권장): 에이전트 추론 + 사용자 일괄 확인 (Phase/Step 단위 batch)

3. 안전 검증:
   - 이미 오늘 날짜 엔트리 존재 시 중복 추가 방지 (같은 Edit 을 여러 번 실행해도 1 엔트리)
   - 테이블 없는 파일은 skip (경고 없이)
   - 권한 오류 시 hook 비활성 + 경고

## AC

- [ ] `post-edit-history.js` hook 존재
- [ ] `## N. 변경 이력` 테이블 자동 감지
- [ ] 오늘 날짜 중복 엔트리 방지
- [ ] Edit 요약 수집 UX 옵션 ≥ 2 구현
- [ ] 실제 Edit 실행 시 테이블 자동 append 작동
- [ ] 테이블 없는 파일 skip (에러 없음)

## 파일

- 신규: `src/claude/core/hooks/post-edit-history.js`
- 신규: `src/claude/core/hooks/post-edit-history.test.js`
- 수정: 관련 rule(`verification.md` 또는 별도 문서) 에 자동화 옵션 안내

## 리스크

- **R-BKLG-01**: Edit 요약 수집이 사용자 피로도 증가 → **완화**: Option D (에이전트 추론 + batch 확인) 기본

## 롤백

hook 비활성화 → 기존 수동 append 로 복귀. 이미 append 된 엔트리는 보존.

## 향후 과제

- Option D UX 가 합의되면 v2.6.0 에 승격 가능
