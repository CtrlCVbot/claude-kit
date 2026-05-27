# 기획 파이프라인 상세 문서 패키지 확장 계획

## Summary

`docs/user-guide-html/index.html`은 전체 개요와 빠른 시작을 담당하고, 기획 파이프라인의 상세 설명은 별도 페이지 패키지로 확장한다.

이번 확장의 목표는 `/plan-*` 명령을 단순 목록이 아니라 실제 실행 단위로 설명하는 것이다. 각 명령별로 Claude/Codex 탭을 두고, 호출되는 sub agents, skills, hooks, instruction rules, 생성/수정/이동되는 산출물, 경로, 규칙, 실패 조건을 함께 보여준다.

특히 현재 개요에서 빠진 `/plan-epic`을 planning 상세 패키지에 1급 항목으로 추가한다. `/plan-design`은 Claude Code Design 기본 경로, `/plan-stitch`는 Google Stitch 선택 경로로 설명한다.

## Current HTML Limitations

| 한계 | 영향 | 개선 방향 |
| --- | --- | --- |
| 단일 페이지에 전체 흐름을 압축 | `/plan-idea` 같은 개별 명령의 실제 동작을 추적하기 어렵다. | planning 전용 하위 페이지를 만든다. |
| command별 호출 자산이 보이지 않음 | sub agent, skill, hook, rule이 언제 쓰이는지 알기 어렵다. | 각 command 상세 페이지에 Claude/Codex 탭을 둔다. |
| 산출물 경로 설명이 요약 수준 | 파일이 어디에 생성되고 언제 이동되는지 확인하기 어렵다. | output lifecycle 표를 표준 템플릿으로 둔다. |
| `/plan-epic` 누락 | Epic 기반 상위 기획 구조를 사용하는 사용자가 경로를 찾을 수 없다. | `/plan-epic` 상세 페이지와 pipeline index 항목을 추가한다. |
| `/plan-design`과 `/plan-stitch` 관계가 더 자세히 필요 | Claude Design과 Google Stitch 사용 기준이 헷갈릴 수 있다. | 디자인 분기 전용 overview와 각 command 상세 페이지를 둔다. |

## Verified Source Baseline

현재 로컬 구조 기준으로 확인한 planning 자산은 아래와 같다.

### Claude Source

| 분류 | 확인된 자산 |
| --- | --- |
| Commands | `plan-archive`, `plan-bridge`, `plan-design`, `plan-draft`, `plan-epic`, `plan-idea`, `plan-improve`, `plan-prd`, `plan-review`, `plan-revise`, `plan-screen`, `plan-stitch`, `plan-wireframe` |
| Agents | `plan-bridge-writer`, `plan-design-writer`, `plan-draft-writer`, `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-reviewer`, `plan-stitch-integrator`, `plan-wireframe-designer` |
| Skills | `claude-design-workflow`, `plan-archive-workflow`, `plan-epic-workflow`, `plan-idea-management`, `plan-pipeline`, `plan-prd-authoring`, `plan-review-criteria`, `plan-screening-workflow`, `plan-stitch-workflow`, `plan-wireframe-design` |
| Hooks | `_plan-state-sync-core`, `plan-doc-guard`, `plan-epic-integrity`, `plan-idea-move-guard`, `plan-review-trigger`, `plan-state-sync` |
| Instruction rules | `plan-epic-hierarchy`, `rice-lane-weighted-adjustment` |

### Codex Source and Runtime Observations

| 항목 | 확인 내용 | 문서화 판단 |
| --- | --- | --- |
| Codex plan commands | `plan-archive`, `plan-bridge`, `plan-design`, `plan-draft`, `plan-idea`, `plan-improve`, `plan-prd`, `plan-review`, `plan-screen`, `plan-stitch`, `plan-wireframe` 확인 | `/plan-epic`, `/plan-revise` Codex source command gap 여부를 상세 문서에서 표시한다. |
| Codex plan agents | Claude plan agents와 대부분 paired 상태 | command 상세 페이지의 Codex 탭에서 `.codex/agents/*.toml` runtime 여부까지 연결한다. |
| Codex plan skills | 여러 plan skills가 존재하지만 `src/codex/plan/skills/plan-epic-workflow`는 source 기준 미확인 | `plan-epic` 페이지에서 source/runtime 차이를 명시한다. |
| Codex hooks | `plan-doc-guard`, `plan-idea-move-guard`, `plan-review-trigger` 등 일부만 확인 | hook 지원 여부는 `supported`, `partial`, `skip`, `not-applicable`로 표시한다. |
| Codex rules | `plan-epic-hierarchy`, `rice-lane-weighted-adjustment` 존재 | 일반 instruction rule로 설명하고 Codex exec-policy rule과 혼동하지 않는다. |

## Target Page Package

기존 `index.html`은 gateway로 유지하고, planning 상세 페이지를 하위 폴더로 분리한다.

```text
docs/user-guide-html/
  index.html
  styles.css
  planning/
    index.html
    plan-idea.html
    plan-epic.html
    plan-screen.html
    plan-draft.html
    plan-prd.html
    plan-wireframe.html
    plan-design.html
    plan-stitch.html
    plan-bridge.html
    plan-review.html
    plan-revise.html
    plan-improve.html
    plan-archive.html
```

`planning/index.html`은 전체 지도 역할을 한다. 각 command 상세 페이지는 동일한 정보 구조를 사용하되, command별 실제 agent, skill, hook, rule, output lifecycle만 다르게 채운다.

## Planning Command Coverage

| Command | 페이지 | 역할 | 우선순위 |
| --- | --- | --- | --- |
| `/plan-idea` | `planning/plan-idea.html` | 아이디어 등록, inbox 생성, dry-run 지원 | P0 |
| `/plan-epic` | `planning/plan-epic.html` | Epic 생성, 상태 전이, Feature binding 관리 | P0 |
| `/plan-screen` | `planning/plan-screen.html` | RICE/5축 평가, Go/Hold/Kill 판정 | P0 |
| `/plan-draft` | `planning/plan-draft.html` | First Pass, Lite/Standard 판단 | P0 |
| `/plan-prd` | `planning/plan-prd.html` | 승인 가능한 PRD 작성 | P0 |
| `/plan-wireframe` | `planning/plan-wireframe.html` | 화면 구조와 요구사항 매핑 | P0 |
| `/plan-design` | `planning/plan-design.html` | Claude Code Design용 2단계 프롬프트 생성 | P0 |
| `/plan-stitch` | `planning/plan-stitch.html` | Google Stitch 선택 경로, 통합 검증 | P0 |
| `/plan-bridge` | `planning/plan-bridge.html` | 개발 handoff와 Feature Package 생성 | P0 |
| `/plan-review` | `planning/plan-review.html` | 기획 산출물 품질 검토 | P1 |
| `/plan-revise` | `planning/plan-revise.html` | 기존 산출물 타입별 수정/재호출 | P1 |
| `/plan-improve` | `planning/plan-improve.html` | 완료/아카이브 이후 개선 요청 연계 | P1 |
| `/plan-archive` | `planning/plan-archive.html` | 완료 산출물 아카이브와 인덱스 갱신 | P1 |

## Page Template

각 command 상세 페이지는 아래 구조를 고정한다.

| 섹션 | 내용 |
| --- | --- |
| Overview | command 목적, 언제 쓰는지, 선행 조건, 후속 단계 |
| Quick Example | 가장 일반적인 실행 예시와 optional flag |
| Claude 탭 | `.claude/commands`, `.claude/agents`, `.claude/skills`, `.claude/hooks`, `.claude/rules` 연결 |
| Codex 탭 | `.agents/skills`, `.codex/agents`, `AGENTS.md`, Codex hook 지원/skip, Codex source sibling 상태 |
| Runtime Flow | command 실행 → agent spawn → skill/rule 참조 → hook guard → output 생성 순서 |
| Output Lifecycle | 생성, 수정, 이동, archive 대상 파일과 폴더 |
| Rules and Guards | 적용되는 instruction rule, hook guard, validation gate |
| Failure Modes | 중단 조건, 거부 조건, 수동 확인 조건 |
| Next Step | 다음 command와 분기 조건 |
| Source Links | `src/claude`, `src/codex`, `docs/guide`, `docs/30-reference` 원본 링크 |

## Claude / Codex Tab Design

각 상세 페이지의 탭은 기능 비교가 아니라 “동일 기능 identity를 각 runtime이 어떻게 소비하는지”를 보여준다.

### Claude Tab

| 항목 | 표시 내용 |
| --- | --- |
| Command source | `src/claude/plan/commands/{command}.md` |
| Runtime command | `.claude/commands/{command}.md` |
| Agents | command에서 spawn하는 `plan-*` agent |
| Skills | command 또는 agent가 참조하는 `plan-*` skill |
| Hooks | 실행 전후에 영향을 주는 `.claude/hooks/plan-*` guard |
| Rules | `src/claude/plan/rules/*.md` instruction rule |
| Output | `.plans/**` 생성/수정/이동 위치 |

### Codex Tab

| 항목 | 표시 내용 |
| --- | --- |
| Codex source | `src/codex/plan/**` sibling 또는 gap |
| Runtime skill | `.agents/skills/{skill}/SKILL.md` 존재 여부 |
| Runtime subagent | `.codex/agents/{agent}.toml` 존재 여부 |
| Instruction surface | `AGENTS.md` 또는 generated guidance 반영 여부 |
| Hook status | Codex hook으로 지원, 부분 지원, skip, 해당 없음 |
| Conversion status | `paired`, `source-gap`, `runtime-only`, `codex-skip`, `manual-review` |

## Command Detail Seed Matrix

초기 구현은 아래 seed matrix를 기준으로 채운다. 실제 페이지 작성 시 command source를 다시 열어 최신 내용을 확인한다.

| Command | 주 agent | 주요 skill/rule/hook 후보 | 주요 output |
| --- | --- | --- | --- |
| `/plan-idea` | `plan-idea-collector` | `plan-idea-management`, `plan-idea-move-guard`, `dry-run-mode` | `.plans/ideas/00-inbox/IDEA-*.md` |
| `/plan-epic` | 별도 agent 미확인, `plan-epic-workflow` 중심 | `plan-epic-workflow`, `plan-epic-hierarchy`, `plan-epic-integrity` | `.plans/epics/**`, Feature binding |
| `/plan-screen` | `plan-idea-screener` | `plan-screening-workflow`, `rice-lane-weighted-adjustment`, `plan-idea-move-guard` | screening result, idea folder transition |
| `/plan-draft` | `plan-draft-writer` | `plan-pipeline` | `.plans/features/drafts/{slug}/` |
| `/plan-prd` | `plan-prd-writer` | `plan-prd-authoring`, `plan-review-criteria` | `.plans/prd/10-approved/{slug}-prd.md` |
| `/plan-wireframe` | `plan-wireframe-designer` | `plan-wireframe-design`, `plan-review-criteria` | `.plans/wireframes/{slug}/` |
| `/plan-design` | `plan-design-writer` | `claude-design-workflow`, routing metadata | `.plans/design/{slug}/prompt-*.md`, `manifest.md` |
| `/plan-stitch` | `plan-stitch-integrator` | `plan-stitch-workflow`, routing metadata | `.plans/stitch/{slug}/mapping.md`, `context.md`, `validation.md` |
| `/plan-bridge` | `plan-bridge-writer` | `plan-pipeline`, `plan-review-criteria` | `.plans/features/active/{slug}/` handoff context |
| `/plan-review` | `plan-reviewer` | `plan-review-criteria`, `plan-review-trigger` | review report, PCC result |
| `/plan-revise` | source type별 기존 agent 재호출 | output owner mapping | revised source artifact |
| `/plan-improve` | archive/improve workflow 중심 | `plan-archive-workflow` | improvement request, archive linkage |
| `/plan-archive` | archive workflow 중심 | `plan-archive-workflow` | archive bundle, index update |

## Output Lifecycle Documentation Standard

각 상세 페이지에는 아래 표를 반드시 넣는다.

| 단계 | 파일/폴더 | 작업 | 규칙 |
| --- | --- | --- | --- |
| Input | 선행 산출물 경로 | 읽기 | 없으면 중단 또는 안내 |
| Create | 새 산출물 경로 | 생성 | template/source 기준 |
| Update | metadata 또는 manifest | 갱신 | 허용 필드만 수정 |
| Move | folder transition | 이동 | guard hook 또는 explicit command만 허용 |
| Review | report/checklist | 검증 | human checkpoint 포함 |
| Handoff | 다음 단계 입력 | 전달 | 다음 command 조건 충족 |

## Asset Collection Method

페이지 생성 전에 각 command별로 아래 순서로 정보를 수집한다.

1. `src/claude/plan/commands/{command}.md`에서 Usage, Workflow, Output, Rules를 추출한다.
2. command source에서 `plan-*` agent 이름을 추출한다.
3. `src/claude/plan/agents/{agent}.md`에서 역할, 모델, output contract를 추출한다.
4. `src/claude/plan/skills/*/SKILL.md`에서 해당 command가 참조하는 workflow를 연결한다.
5. `src/claude/plan/hooks/*`와 `docs/30-reference/04-hooks.md`에서 guard 영향을 확인한다.
6. `src/claude/plan/rules/*`와 `docs/30-reference/05-rules.md`에서 instruction rule을 연결한다.
7. `src/codex/plan/**`, `.agents/skills/**`, `.codex/agents/*.toml`, `AGENTS.md`에서 Codex 탭 정보를 채운다.
8. `docs/30-reference/07-pairing-registry.md`에서 pairing status와 known exception을 확인한다.

## Path and Naming Rules

| 규칙 | 설명 |
| --- | --- |
| Command page file | command 이름에서 `/`를 제거해 `planning/plan-idea.html` 형식으로 둔다. |
| Anchor id | `#overview`, `#claude`, `#codex`, `#flow`, `#outputs`, `#rules`, `#failure`, `#next`를 공통 사용한다. |
| Source path 표기 | HTML 본문에서는 full path 대신 repo-relative path를 쓰고, 링크는 상대 경로로 연결한다. |
| Rules 용어 | `instruction rule`과 Codex `exec-policy rule`을 분리한다. |
| Codex source 용어 | `src/codex`는 runtime artifact가 아니라 authoring source로 설명한다. |
| Stitch 용어 | `Google Stitch`, `/plan-stitch`, `stitch output`으로 통일한다. |

## Implementation Steps

1. `planning/index.html`을 만든다.
   - 전체 pipeline map
   - `/plan-epic` 포함 command catalog
   - `/plan-design` 기본 경로와 `/plan-stitch` 선택 경로
2. 공통 page template을 HTML fragment 또는 copy template 형태로 정의한다.
3. P0 상세 페이지부터 작성한다.
   - `/plan-idea`
   - `/plan-epic`
   - `/plan-screen`
   - `/plan-draft`
   - `/plan-prd`
   - `/plan-wireframe`
   - `/plan-design`
   - `/plan-stitch`
   - `/plan-bridge`
4. P1 상세 페이지를 작성한다.
   - `/plan-review`
   - `/plan-revise`
   - `/plan-improve`
   - `/plan-archive`
5. `index.html`의 planning 섹션에 `planning/index.html`로 이동하는 링크를 추가한다.
6. `styles.css`에 tab UI, command meta table, output lifecycle table, path badge 스타일을 추가한다.
7. 사용하지 않는 asset이 있으면 제거하고, 필요한 경우 pipeline diagram은 HTML/CSS 또는 Mermaid-like static block으로 구현한다.

## Verification Plan

| 검증 | 방법 | 통과 기준 |
| --- | --- | --- |
| 페이지 존재 | `Get-ChildItem docs/user-guide-html/planning` | 계획한 HTML 페이지가 모두 존재한다. |
| 링크 검증 | 모든 `href`와 `id` 비교 | 깨진 내부 링크가 없다. |
| `/plan-epic` 포함 | `Select-String`으로 전체 HTML 검색 | index, planning index, 상세 페이지에 모두 등장한다. |
| Claude 탭 완성도 | 각 P0 페이지에서 command, agent, skill, hook, rule 표 확인 | 최소 하나 이상의 근거 path가 연결된다. |
| Codex 탭 완성도 | source/runtime/gap status 확인 | gap은 숨기지 않고 명시된다. |
| 산출물 lifecycle | 각 P0 페이지의 output table 확인 | 생성/수정/이동/후속 입력이 분리된다. |
| 용어 검증 | `instruction rule`, `exec-policy rule`, `src/codex` 문구 검색 | 공식 surface와 source를 혼동하지 않는다. |
| 브라우저 확인 | `file:///.../docs/user-guide-html/planning/index.html` 열람 | 좌측 이동, 탭, 표가 읽기 좋다. |

## Risks and Open Questions

| 항목 | 리스크 | 대응 |
| --- | --- | --- |
| 페이지 수 증가 | 정적 HTML 유지보수 비용이 커진다. | 공통 template과 표준 섹션을 먼저 고정한다. |
| `/plan-epic` Codex source gap | Claude에는 command/skill/rule/hook이 있지만 Codex command sibling은 미확인이다. | `plan-epic` 페이지에서 gap으로 표시하고 후속 conversion 과제로 넘긴다. |
| Runtime output과 source 혼동 | `.agents/skills`에 있는 자산이 `src/codex` source와 다를 수 있다. | source/runtime/gap을 별도 열로 분리한다. |
| Google Stitch 설명 범위 | 실제 Stitch 사용 방법과 내부 통합 검증 역할이 섞일 수 있다. | `/plan-stitch`는 선택 경로로 두고 입력/산출물 기준을 분리한다. |
| Hooks 지원 차이 | Claude hook과 Codex hook이 1:1 대응하지 않는다. | Claude tab과 Codex tab에서 hook status를 별도로 표기한다. |

## Immediate Follow-Up Checklist

| 확인할 점 | 이유 |
| --- | --- |
| `/plan-epic`의 Codex command/skill source를 만들지, 문서상 gap으로만 둘지 결정 | 상세 페이지 작성 전 status 기준이 필요하다. |
| `/plan-stitch`를 “Google Stitch 활용”과 “PRD/Wireframe 통합 검증” 중 어떤 표현으로 우선 설명할지 결정 | 사용자-facing 설명의 혼선을 줄인다. |
| P0 페이지를 한 번에 만들지, `/plan-idea`와 `/plan-epic` pilot 2개부터 만들지 결정 | 페이지 수가 많아 초기 리뷰 부담이 크다. |
| 탭 UI를 CSS-only로 만들지, 단순 병렬 섹션으로 만들지 결정 | 정적 HTML 유지보수성과 접근성에 영향이 있다. |
| `docs/guide/claude-code/02-plan-pipeline.md`와 HTML 상세 페이지의 책임 경계를 확정 | 원본 guide와 HTML gateway가 중복되지 않게 한다. |
