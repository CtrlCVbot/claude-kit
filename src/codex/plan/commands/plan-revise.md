<!-- kit-convert generated: 2026-05-27 -->
# plan-revise — Codex Entry Flow

기존 planning artifact에 수정 요청을 반영한다. Codex에서는 command 파일이 실행 본체가 아니라, `plan-revise-workflow` skill을 호출하기 위한 얇은 entry wrapper다.

실제 절차와 guardrail은 `src/codex/plan/skills/plan-revise-workflow/SKILL.md`를 기준으로 한다.

## Invocation

```
plan-revise {artifact-path} "수정 지시"
```

- `{artifact-path}` — 수정 대상 이전 산출물의 절대 또는 상대 경로. 필수.
- `"수정 지시"` — 자연어 수정 요청. 필수.

### Examples

```
plan-revise .plans/features/drafts/hero-refresh/01-draft.md "Lite → Standard 판정 변경 이유 명시"
plan-revise .plans/prd/10-approved/hero-refresh-prd.md "§6 결정 포인트 3번 근거 확장"
plan-revise .plans/ideas/00-inbox/IDEA-20260423-007.md "카테고리 feature → improvement"
plan-revise .plans/features/active/hero-refresh/00-context/02-scope-boundaries.md "기술 정정 SSOT 위치 재배치"
```

## Execution Model

1. `plan-revise-workflow` skill을 우선 참조한다.
2. skill은 `artifact-path`를 기준으로 적절한 plan writer subagent를 선택한다.
3. command wrapper는 입력을 정규화하고, skill/subagent 실행 흐름으로 넘긴다.
4. plugin package에 command 파일이 있더라도 사용자의 기본 실행 단위는 skill/subagent workflow다.

## Workflow

1. **경로 유효성 검증**
   - 대상 파일이 존재하는지 확인한다.
   - 파일이 없으면 HARD FAIL로 중단하고 경로 확인을 안내한다.
   - `.plans/archive/**/*.md` 아래 파일이면 원본 불변 원칙에 따라 거부한다.
2. **agent 유형 자동 추론**
   - `.plans/ideas/(00-inbox|10-screening|20-approved)/IDEA-*.md` → `plan-idea-collector`
   - `.plans/ideas/.../SCREENING-*.md` → `plan-idea-screener`
   - `.plans/features/drafts/{slug}/01-draft.md` → `plan-draft-writer`
   - `.plans/features/drafts/{slug}/first-pass.md` → `plan-draft-writer`
   - `.plans/prd/10-approved/{slug}-prd.md` → `plan-prd-writer`
   - `.plans/features/active/{slug}/00-context/*.md` → `plan-bridge-writer`
   - `.plans/wireframes/{slug}/*.md` → `plan-wireframe-designer`
   - `.plans/stitch/{slug}/*.md` → `plan-stitch-integrator`
   - `.plans/design/{slug}/*.md` → `plan-design-writer`
   - 매칭 실패 시 사용자에게 담당 agent를 명시해 달라고 요청한다.
3. **구조화 prompt 생성**
   - 이전 산출물 경로, 사용자 수정 요청, 보존할 섹션, 수정할 섹션을 명시한다.
   - 기본 shape:
     ```json
     {
       "prev_artifact": "{절대 경로}",
       "user_modification_request": "{사용자 원문}",
       "preserved_sections": [],
       "revise_sections": []
     }
     ```
   - `preserved_sections`와 `revise_sections`는 자동 추론하거나 빈 배열로 둔다.
4. **해당 agent 재호출**
   - agent는 이전 산출물을 먼저 읽는다.
   - 수정 범위를 결정한 뒤, 보존 섹션은 유지하고 변경 섹션만 갱신한다.
   - 새 파일을 만들지 않는다.
5. **결과 보고**
   - 수정된 파일 경로를 보고한다.
   - 변경된 섹션과 보존된 섹션을 분리해 보여준다.
   - 변경 이력 섹션에 "수정 요청 반영" row를 추가한다.
   - Agent Edit Race를 피하기 위해 메인 흐름에서 수정 파일을 다시 읽도록 안내한다.

## Constraints

- **Archive 파일 수정 금지**: `.plans/archive/**/*.md`는 수정하지 않는다. archive 이후 변경은 `plan-improve`로 시작한다.
- **새 파일 생성 금지**: 이 command는 기존 산출물 수정 전용이다. 새 산출물이 필요하면 원본 command를 다시 사용한다.
- **Critical checkpoint 우회 금지**: `plan-epic advance`, `plan-archive` 같은 critical checkpoint는 일반 수정으로 재시도하지 않는다.
- **Epic 전용 파일 편집 금지**: `.plans/epics/*/EPIC-*/01-children-features.md`는 메인 흐름이 소유한다.

## Output

```
# plan-revise 완료

## 수정 파일
- {절대 경로}

## 변경된 섹션 (revised)
- §{N}: {요약}

## 보존된 섹션 (preserved)
- §{N}, §{M}: 변경 없음

## 변경 이력 기록
- {파일}의 변경 이력 섹션에 "수정 요청 반영" row 추가

## 다음 단계
- 재검증: plan-review {path} (필요 시)
- 또는 다음 planning pipeline 단계
```

## Related Assets

- Skill: `src/codex/plan/skills/plan-revise-workflow/SKILL.md`
- Rule: `src/codex/core/rules/checkpoint-policy.md`
- Rule: `src/codex/core/rules/writer-output-format.md`
- Rule: `src/codex/core/rules/agent-file-ownership.md`
- Agents: `plan-idea-collector`, `plan-idea-screener`, `plan-draft-writer`, `plan-prd-writer`, `plan-bridge-writer`, `plan-wireframe-designer`, `plan-stitch-integrator`, `plan-design-writer`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- 이 command는 `command-wrapper`다. 실제 Codex direct-use 본체는 `plan-revise-workflow` skill이다.
- Claude sibling: `src/claude/plan/commands/plan-revise.md`
