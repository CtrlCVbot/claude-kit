# T-BRDG-02 — Writer 에이전트 출력 표준 (IMP-AGENT-012)

**제안**: P-5 (BRDG)
**원본 피드백**: I-09 (Medium), N-10
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: 없음
**후행**: T-SHOW-02 (Phase 진행률 섹션 확장)

## 목적

writer 계 에이전트(idea-collector · draft-writer · prd-writer · bridge-writer)의 보고 형식을 통일. IMP-AGENT-002(reviewer 계 표준화)를 writer 계로 확장.

## 수행 내용

1. `src/claude/core/rules/writer-output-format.md` 신규 룰 작성:

   ```markdown
   # Writer Agent Output Format (SSOT)

   > **결론**: writer 계 에이전트 공통 보고 형식. reviewer 계(IMP-AGENT-002) 의 writer 버전.

   **적용 대상**: plan-idea-collector, plan-idea-screener, plan-draft-writer, plan-prd-writer, plan-bridge-writer, plan-wireframe-designer, plan-stitch-integrator, plan-design-writer

   ---

   ## 1. 필수 섹션 5 종

   ### 1-1. 생성 / 수정 파일

   | 파일 | 상태 | 크기 | 주요 섹션 |
   |------|:---:|-----:|----------|
   | (절대 경로) | 신규/수정 | XX KB | §1, §2, §N |

   ### 1-2. 주요 결정 (해당 시)

   - 결정 항목 1: 값 + 근거 2~3 문장
   - 결정 항목 2: ...

   ### 1-3. 검증 결과 (해당 시)

   - 자동 검증: PASS/FAIL + 이유
   - 수동 검증 권장: 항목 리스트

   ### 1-4. 다음 단계

   - 직접 다음 커맨드: `/plan-...`
   - 선행 조건: ...

   ### 1-5. Agent Edit Race 주의

   - 수정 파일 목록 (메인 Read 재호출 대상)
   - 참조: verification.md Agent Edit Race 섹션

   ## 2. 선택 섹션 (해당 시)

   ### 2-1. Phase 진행률 (T-SHOW-02 에서 표준화)
   ### 2-2. 기술 정정 발견 (draft-writer 등)
   ### 2-3. 가중 조정 근거 (idea-screener)

   ## 3. 형식 규칙

   - 각 섹션 제목: `### 1-N. 섹션명` 형식
   - 표 사용 권장 (파일 목록, 결정 사항 등)
   - 3 문장 이하 요약 권장 (상세는 파일 내용)

   ## 4. 변경 이력

   | 날짜 | 내용 |
   |------|------|
   | 2026-04-23 | 초안 — T-BRDG-02 (IMP-AGENT-012 표준화) |
   ```

2. writer 계 에이전트 8 개 프롬프트 수정:
   - plan-idea-collector
   - plan-idea-screener
   - plan-draft-writer
   - plan-prd-writer
   - plan-bridge-writer
   - plan-wireframe-designer
   - plan-stitch-integrator
   - plan-design-writer

   각 에이전트에 `<Output_Format>` 블록 추가:
   ```
   <Output_Format>
   참조: src/claude/core/rules/writer-output-format.md

   필수 섹션 5 종:
   1. 생성/수정 파일
   2. 주요 결정 (해당 시)
   3. 검증 결과 (해당 시)
   4. 다음 단계
   5. Agent Edit Race 주의

   선택 섹션:
   - [에이전트별 고유 섹션 추가]
   </Output_Format>
   ```

3. 호환성:
   - 기존 에이전트 출력 형식과 100% 하위 호환 (추가 섹션만, 제거 없음)
   - 사용자 관점: 파싱 편의 향상, 해석 시간 감소

## AC

- [ ] `writer-output-format.md` 존재 (≥50 줄)
- [ ] 필수 섹션 5 종 + 선택 섹션 명시
- [ ] writer 계 에이전트 8 개 프롬프트에 `<Output_Format>` 블록 주입
- [ ] 실제 에이전트 호출 시 5 섹션 출력 확인
- [ ] Agent Edit Race 섹션이 자동으로 수정 파일 목록 포함

## 파일

- 신규: `src/claude/core/rules/writer-output-format.md`
- 수정: `src/claude/plan/agents/plan-idea-collector.md`
- 수정: `src/claude/plan/agents/plan-idea-screener.md`
- 수정: `src/claude/plan/agents/plan-draft-writer.md`
- 수정: `src/claude/plan/agents/plan-prd-writer.md`
- 수정: `src/claude/plan/agents/plan-bridge-writer.md`
- 수정: `src/claude/plan/agents/plan-wireframe-designer.md`
- 수정: `src/claude/plan/agents/plan-stitch-integrator.md`
- 수정: `src/claude/plan/agents/plan-design-writer.md`

## 롤백

룰 파일 삭제 + 에이전트 프롬프트 revert → 기존 자유 형식으로 복귀.

## 보존 원칙

- **P-06 plan-reviewer PCC 품질**: reviewer 계 표준(IMP-AGENT-002) 가 writer 계로 확장되며 일관성 증대.
