# T-REVP-01 — 수정 요청 프로토콜 + `/plan-revise` (선택)

**제안**: P-9 (REVP)
**원본 피드백**: I-12 (Medium), N-11
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: 없음
**후행**: 없음

## 목적

Checkpoint 시 "Y/수정/N" 3 옵션 중 "수정" 선택의 세부 전달 형식 표준화. 에이전트 재호출 시 이전 산출물 + 사용자 수정 지시를 구조화 prompt 로 전달하여 컨텍스트 손실 방지.

## 수행 내용

1. `src/claude/core/rules/checkpoint-policy.md` 에 신규 섹션 추가:

   ```markdown
   ## 8. 수정 요청 표준 응답

   Checkpoint 도달 시 에이전트 보고 말미에 고정 형식 응답 패턴:

   > **승인 요청** (Checkpoint type: {type}):
   > - **Y** = 현재 결과 승인 → 다음 단계 진입
   > - **수정** = 세부 수정 요청 (예: "A 섹션 scope 재작성", "판정 Lite → Standard")
   > - **N** = 전면 거부 (재작업 불가 이유 명시)

   ### 8-1. "수정" 선택 시 재호출 프로토콜

   사용자가 "수정" + 자연어 지시 입력 시 메인 세션이 에이전트 재호출:

   ```json
   {
     "prev_artifact": "{파일 경로}",
     "user_modification_request": "{사용자 자연어 지시}",
     "preserved_sections": ["§1", "§2"],
     "revise_sections": ["§3", "§4"]
   }
   ```

   - `prev_artifact`: 이전 산출 파일 경로
   - `user_modification_request`: 사용자 원문
   - `preserved_sections`: 변경 금지 섹션 (있으면 명시)
   - `revise_sections`: 수정 대상 섹션 (자동 감지 or 사용자 명시)

   ### 8-2. 재호출 에이전트 지침

   에이전트는 재호출 시:
   1. 이전 산출물 Read → 컨텍스트 이해
   2. 사용자 수정 지시 파싱 → 수정 범위 결정
   3. `preserved_sections` 유지 + `revise_sections` 만 변경
   4. 변경 이력에 "수정 요청 반영" 기록
   ```

2. `src/claude/plan/commands/plan-revise.md` 신규 커맨드 **(선택적)**:

   ```markdown
   ---
   description: 이전 plan 산출물에 수정 요청 반영
   ---

   # /plan-revise

   사용법:
   ```
   /plan-revise {artifact-path} "수정 지시"
   ```

   내부 로직:
   1. artifact-path 에서 에이전트 유형 자동 추론
      - `.plans/ideas/00-inbox/IDEA-*.md` → plan-idea-collector
      - `.plans/drafts/{slug}/01-draft.md` → plan-draft-writer
      - `.plans/drafts/{slug}/02-prd.md` → plan-prd-writer
      - `.plans/features/active/{slug}/00-context/*.md` → plan-bridge-writer
   2. 해당 에이전트 재호출 (구조화 prompt 생성)
   3. 재호출 결과 보고
   ```

3. writer 계 에이전트 프롬프트에 재호출 지침 추가:
   - 각 에이전트의 `<Output_Format>` 블록(T-BRDG-02)에 수정 요청 응답 패턴 포함
   - 재호출 시 이전 산출물 우선 Read 원칙

4. 자동 파싱:
   - `preserved_sections` / `revise_sections` 가 사용자 명시 없으면 에이전트가 자연어에서 자동 추론
   - 예: "A 섹션 scope 재작성" → `revise_sections: ["§A scope"]`

## AC

- [ ] `checkpoint-policy.md` §8 수정 요청 섹션 존재
- [ ] 재호출 프로토콜 JSON 구조 명시
- [ ] `/plan-revise` 커맨드 정의 존재 (선택적 활성화)
- [ ] writer 계 에이전트 프롬프트에 응답 패턴 포함
- [ ] 자동 파싱 규칙 명시
- [ ] 실제 수정 요청 시 이전 컨텍스트 손실 없이 재실행 작동

## 파일

- 수정: `src/claude/core/rules/checkpoint-policy.md`
- 신규 (선택): `src/claude/plan/commands/plan-revise.md`
- 수정: `src/claude/plan/skills/plan-pipeline/SKILL.md` (수정 요청 처리 패턴)

## 롤백

§8 섹션 제거 + `/plan-revise` 커맨드 제거 → 기존 자유 형식으로 복귀.

## 검증 방법

```
# 실제 수정 요청 시나리오
/plan-draft IDEA-...
# → 에이전트 결과 → "수정" 선택 + "§5.1 기술 정정을 §7.1 로 이동" 입력
# → 에이전트 재호출 → §5.1 삭제 + §7.1 에 내용 이동 + 변경 이력 기록
# → 다른 섹션 preserved 확인

# /plan-revise 사용
/plan-revise .plans/drafts/f1-.../01-draft.md "§6 결정 포인트 3 번 근거 확장"
# → plan-draft-writer 재호출 → §6 결정 포인트 3 번만 수정
```

## 보존 원칙

- **P-08 Checkpoint 정책**: 기존 7 종 타입 유지, 수정 요청은 응답 형식만 표준화 (타입 변경 없음).
