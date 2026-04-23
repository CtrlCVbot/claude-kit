# T-FSTATE-01 — `plan-state-sync.js` 훅 구현

**제안**: P-2 (FSTATE)
**원본 피드백**: I-02 (High), N-04
**우선순위**: 🟠 P1 High
**릴리스**: v2.4.1
**선행**: T-FSTATE-02 (상태 머신 SSOT 문서)
**후행**: T-PCC-01 (PCC-08 연동)

## 목적

IDEA frontmatter `상태:` 를 SSOT 로 지정. 변경 감지 시 hook 이 나머지 3 곳(backlog · Epic Children §1 · binding §7) 자동 갱신. 수동 Edit 4 회 → 1 회로 감소.

## 수행 내용

1. `src/claude/plan/hooks/plan-state-sync.js` 신규 훅 작성:
   - Trigger: `PostToolUse` (Edit|Write) on `.plans/ideas/**/IDEA-*.md`
   - 로직:
     ```javascript
     // 1. 수정된 IDEA 파일 frontmatter 파싱
     const fm = parseFrontmatter(editedFile)
     const ideaId = fm.id || extractIdFromPath(editedFile)
     const newStatus = fm.상태  // or fm.status

     // 2. 기존 상태 비교 (파일 전/후 차이)
     if (prevStatus === newStatus) return  // no-op

     // 3. 3 곳 동기화
     await syncBacklog(ideaId, newStatus)           // backlog.md 행의 상태 컬럼
     if (fm.Epic) {
       await syncEpicChildren(fm.Epic, ideaId, newStatus)  // Children §1 F{N} 필드
       await syncBinding(fm.slug, newStatus)               // binding §7 표 (Feature Package 있으면)
     }

     // 4. 성공 로그: ~/.claude/logs/state-sync.jsonl
     // 5. 실패 시 rollback + 사용자 경고
     ```
2. 3 곳 동기 로직 구현:
   - **backlog.md**: 해당 `IDEA-...` 행의 `상태` 컬럼 셀 치환
   - **Epic `01-children-features.md` §1 F{N}**: `**IDEA**: [IDEA-...]` 위치에서 `**상태**:` 라인 찾아 갱신
   - **binding `08-epic-binding.md` §7**: 상태 동기 표에 현재 시점 row 추가 (기존 row 보존, 새 row append)
3. IDEA 상태 ↔ Feature 상태 매핑(T-FSTATE-02 SSOT 기반):
   ```
   IDEA inbox → Feature pending
   IDEA screened → Feature pending (변화 없음)
   IDEA approved → Feature approved (자동 동기)
   IDEA archived → Feature archived
   ```
4. 잠금 파일(lockfile) + 에러 시 rollback:
   - `.claude/state/state-sync.lock` — 동시 실행 방지
   - 3 곳 중 하나라도 쓰기 실패 시 이미 갱신된 파일 원복
5. 단위 테스트: `plan-state-sync.test.js`
   - IDEA frontmatter 변경 → backlog 갱신 확인
   - Epic 바인딩 시 Children §1 자동 갱신 확인
   - binding §7 row append 확인

## AC

- [ ] `plan-state-sync.js` 훅 존재
- [ ] IDEA frontmatter `상태:` 변경 → backlog/Children/binding 자동 갱신
- [ ] 단위 테스트 ≥ 3 건 통과
- [ ] 잠금 파일로 동시 실행 방지 작동
- [ ] 에러 시 rollback 정상
- [ ] `~/.claude/logs/state-sync.jsonl` 에 동기 이벤트 기록
- [ ] Epic 미연결 IDEA (`Epic: null`) 에서도 backlog 만 갱신 (에러 없음)

## 파일

- 신규: `src/claude/plan/hooks/plan-state-sync.js`
- 신규: `src/claude/plan/hooks/plan-state-sync.test.js`
- 수정: `src/claude/plan/skills/plan-epic-workflow/templates/epic-binding.md` (§7 표가 자동 갱신 대상임을 명시)

## 리스크

- **R2**: 여러 파일 동시 수정 race 재도입 → **완화**: lockfile + 순차 in-place edit + rollback 로직

## 롤백

`plan-state-sync.js` 비활성화 (hook 등록 해제) → 기존 수동 플로우로 복귀.

## 검증 방법

```bash
# Case 1: IDEA 단독 (Epic 없음)
# IDEA 파일 frontmatter "상태: inbox" → "상태: screened" 수정
# → backlog.md 해당 행 상태 컬럼 "screened" 로 갱신 확인

# Case 2: Epic 연결 IDEA
# IDEA 파일 frontmatter "상태: screened" → "상태: approved" 수정
# → backlog + Epic Children §1 F{N} **상태**: approved + binding §7 row 추가 3 곳 모두 갱신

# Case 3: 에러 복구
# 의도적으로 Children 파일 권한 제거 → Edit → 롤백 확인
```

## 보존 원칙

- **P-10 IDEA 생애주기 일관성**: SSOT 를 단일 파일로 확립 → 강화.
- **P-11 backlog.md 인덱스**: 자동 갱신으로 정확도 향상.
- **P-14 IMP-AGENT-010 Epic 자동 바인딩**: 등록 시 바인딩 + 본 TASK 의 상태 동기 → 전체 자동화 완성.
