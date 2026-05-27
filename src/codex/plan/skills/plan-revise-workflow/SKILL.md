<!-- kit-convert generated: 2026-05-27 -->
---
name: plan-revise-workflow
description: >
  기존 planning artifact에 수정 요청을 반영하는 Codex workflow skill.
  artifact path를 기준으로 적절한 plan writer subagent를 선택하고, archive 불변성,
  preserved/revised section 분리, 변경 이력 기록, 재리뷰 안내를 수행한다.
  Use when: /plan-revise 대응, 기획 산출물 수정 요청, review 이후 보정 작업 시.
---

## Overview

`plan-revise-workflow`는 Claude의 `/plan-revise` command를 Codex에서 skill/subagent 중심으로 실행하기 위한 workflow skill이다.

Codex에서는 command 파일 자체가 실행 본체가 아니다. 이 skill이 절차의 SSOT이고, 필요한 경우 기존 plan writer subagent를 명시적으로 선택해 수정 작업을 위임한다.

핵심 원칙:
- 기존 artifact만 수정한다.
- archive 내부 원본은 수정하지 않는다.
- 새 artifact 생성은 원본 생성 command로 돌려보낸다.
- 수정 전후에 보존 섹션과 변경 섹션을 분리한다.
- 변경 후에는 `/plan-review` 또는 동등한 review workflow를 안내한다.

## Inputs

| 입력 | 필수 | 설명 |
|---|---:|---|
| `artifact_path` | 예 | 수정 대상 planning artifact 경로 |
| `modification_request` | 예 | 사용자의 자연어 수정 요청 |
| `agent_hint` | 아니오 | 자동 추론이 애매할 때 사용할 writer subagent 이름 |
| `preserved_sections` | 아니오 | 유지해야 하는 섹션 목록 |
| `revise_sections` | 아니오 | 수정해야 하는 섹션 목록 |

## Subagent Selection

대상 파일 경로로 writer subagent를 선택한다.

| 경로 패턴 | 기본 subagent |
|---|---|
| `.plans/ideas/(00-inbox|10-screening|20-approved)/IDEA-*.md` | `plan-idea-collector` |
| `.plans/ideas/**/SCREENING-*.md` | `plan-idea-screener` |
| `.plans/features/drafts/{slug}/01-draft.md` | `plan-draft-writer` |
| `.plans/features/drafts/{slug}/first-pass.md` | `plan-draft-writer` |
| `.plans/prd/10-approved/{slug}-prd.md` | `plan-prd-writer` |
| `.plans/features/active/{slug}/00-context/*.md` | `plan-bridge-writer` |
| `.plans/wireframes/{slug}/*.md` | `plan-wireframe-designer` |
| `.plans/stitch/{slug}/*.md` | `plan-stitch-integrator` |
| `.plans/design/{slug}/*.md` | `plan-design-writer` |

매칭이 실패하면 임의로 진행하지 말고 사용자에게 `agent_hint`를 요청한다.

## Workflow

1. **Validate path**
   - `artifact_path`가 존재하는지 확인한다.
   - 존재하지 않으면 HARD FAIL로 중단하고 경로 확인을 안내한다.
   - `.plans/archive/**/*.md`이면 수정하지 않는다. archive 이후 변경은 `plan-improve`로 전환한다.
2. **Classify target**
   - 경로 패턴으로 writer subagent를 선택한다.
   - 자동 추론이 애매하면 사용자에게 담당 subagent를 확인한다.
3. **Build revision context**
   - 이전 artifact 전문을 읽는다.
   - `modification_request`를 원문 그대로 보존한다.
   - `preserved_sections`와 `revise_sections`를 추론하되, 확신이 낮으면 비워 둔다.
4. **Delegate to subagent**
   - 선택한 subagent에 아래 context shape로 전달한다.
   ```json
   {
     "prev_artifact": "{absolute path}",
     "user_modification_request": "{original request}",
     "preserved_sections": [],
     "revise_sections": []
   }
   ```
   - subagent는 기존 파일을 다시 읽고, 지정된 범위만 수정한다.
5. **Record change history**
   - 수정 파일의 변경 이력 섹션에 "수정 요청 반영" row를 추가한다.
   - 변경된 섹션과 보존된 섹션을 결과에 분리해 보고한다.
6. **Review handoff**
   - 수정 후 `plan-review {artifact_path}` 또는 해당 단계의 review workflow를 안내한다.

## Guardrails

- **No archive mutation**: `.plans/archive/**/*.md`는 수정하지 않는다.
- **No new artifact**: 새 파일이 필요하면 원본 command로 돌아간다.
- **No critical checkpoint bypass**: `plan-epic advance`, `plan-archive` 같은 critical checkpoint를 일반 revise로 우회하지 않는다.
- **No silent agent guess**: 경로로 subagent를 확정할 수 없으면 사용자에게 확인한다.
- **Re-read after edit**: subagent 수정 후 메인 흐름은 수정 파일을 다시 읽어 Agent Edit Race를 피한다.

## Output Format

```markdown
# plan-revise 완료

## 수정 파일
- {absolute path}

## 변경된 섹션 (revised)
- §{N}: {summary}

## 보존된 섹션 (preserved)
- §{N}, §{M}: 변경 없음

## 변경 이력 기록
- {file} 변경 이력에 "수정 요청 반영" row 추가

## 다음 단계
- 재검증: plan-review {artifact_path}
```

## Codex 참고 사항

- 이 파일은 Codex direct-use skill authoring source다.
- Runtime output은 설치 시 `.agents/skills/plan-revise-workflow/SKILL.md`로 생성된다.
- Wrapper command source: `src/codex/plan/commands/plan-revise.md`
- Claude sibling command: `src/claude/plan/commands/plan-revise.md`
