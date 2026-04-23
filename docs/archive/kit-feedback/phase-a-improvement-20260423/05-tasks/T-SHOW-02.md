# T-SHOW-02 — 에이전트 보고 Phase 진행률 표준

**제안**: P-8 (SHOW)
**원본 피드백**: I-17 (Low → P3 SHOW AREA 편입), N-17
**우선순위**: 🟢 P3 Low (SHOW AREA 통합)
**릴리스**: v2.5.0 (SHOW-01 후속)
**선행**: T-SHOW-01
**후행**: 없음

## 목적

에이전트 보고 말미에 "Phase {N} Step {X}/{Y}" 진행률 표준 표시. 장시간 세션에서 방향 감각 유지 + TodoWrite 와 Epic 로드맵 동기화.

## 수행 내용

1. `src/claude/core/rules/writer-output-format.md` (T-BRDG-02 에서 신설) 에 선택 섹션 추가:

   ```markdown
   ## 2. 선택 섹션

   ### 2-1. Phase 진행률 표준 블록

   Epic 연결 Feature 작업 시 에이전트 보고 말미에 다음 블록 포함:

   ```markdown
   ---

   ### Phase {PHASE} 진행률

   [▓▓▓▓▓▓▓▓░] {CURRENT}/{TOTAL} (Step {CURRENT} {STEP_TITLE} 완료)

   다음: Step {NEXT} {NEXT_STEP_TITLE}
   ```

   예시:
   ```markdown
   ### Phase A 진행률

   [▓▓▓▓▓▓▓▓░] 8/9 (Step 8 Epic advance 완료)

   다음: Step 9 /dev-feature + /dev-run (병렬 구현)
   ```

   진행률 ASCII bar 는 9 블록 기준: `▓` = 완료, `░` = 대기.
   ```

2. writer 계 에이전트(8 개) 프롬프트에 조건부 포함 규칙:
   - Epic 연결 Feature 작업 시(`routing-metadata.md` 의 `epic-binding.epic_id != null`) 자동 포함
   - Epic 미연결 작업 시 생략

3. Phase 진행률 계산:
   - Epic `01-children-features.md` §4 Phase 로드맵 Step 수 파싱
   - 현재 Step 은 에이전트 호출 컨텍스트(커맨드명 + routing-metadata) 로 매칭
   - 예: `/plan-prd` 호출 → Step 6 (PRD 단계) 매칭

4. TodoWrite 동기 (선택적):
   - TodoWrite 가 활성화된 세션에서 Phase 진행률이 TodoWrite 항목과 연동되도록 권장
   - 강제 아님 (TodoWrite 는 선택적 도구)

5. `/plan-epic show` 출력과의 일관성:
   - T-SHOW-01 의 Phase 진행률 표시 ↔ 본 TASK 의 에이전트 보고 표시
   - 동일한 Step 정의 참조 (Epic §4)

## AC

- [ ] `writer-output-format.md` §2-1 Phase 진행률 블록 표준 명시
- [ ] 9 블록 ASCII bar 형식 (`▓`/`░`)
- [ ] writer 계 에이전트가 Epic 연결 시 자동 포함
- [ ] Phase 진행률 계산 로직 (커맨드 + routing-metadata 기반)
- [ ] `/plan-epic show` 와 표시 일관성 확인
- [ ] Epic 미연결 작업 시 블록 생략

## 파일

- 수정: `src/claude/core/rules/writer-output-format.md`
- 수정: writer 계 에이전트 8 개 (T-BRDG-02 에서 이미 주입한 `<Output_Format>` 블록 확장)

## 롤백

Phase 진행률 블록 제거 → 기존 자유 형식으로 복귀.

## 보존 원칙

- **P-17 Phase 세션 분리 권장**: 진행률 표시가 세션 종료 판단에 도움.
