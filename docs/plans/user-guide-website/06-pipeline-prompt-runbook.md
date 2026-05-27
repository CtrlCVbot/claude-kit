# Pipeline Prompt Runbook

## 목적

`docs/user-guide-html`을 Next.js/Vercel 문서 사이트로 전환하는 과정을 `claude-kit` 파이프라인으로 실행할 때 사용할 짧은 프롬프트 모음이다.

이 문서는 복사해서 쓰기 쉽게 만드는 것이 목적이다. 세부 기준은 `03-claude-kit-pipeline-example.md`, `04-implementation-roadmap.md`, `05-safety-and-non-regression-plan.md`를 따른다.

## 공통 규칙

아래 규칙은 모든 프롬프트에 공통으로 적용한다. 매번 길게 반복하지 않는다.

| 규칙 | 내용 |
| --- | --- |
| Core first | `claude-kit` 기능이 우선이고 웹사이트는 docs surface다. |
| Protected paths | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js`, `.claude`, `.agents`, `.codex`는 별도 승인 없이 수정하지 않는다. |
| HTML 보존 | `docs/user-guide-html`은 migration reference로 보존한다. |
| Preview first | Vercel은 Preview 검증이 우선이고 Production은 후속 승인 대상이다. |
| P5.5/P6 필수 | `/plan-design`, `/plan-stitch`는 실제 활용 여부와 무관하게 checkpoint를 남긴다. |
| Feature idea | `/plan-epic` 후 모든 child Feature는 먼저 `Feature idea brief`를 가진다. |
| Commit split | docs 계획, `.plans` 산출물, Next.js 구현, Vercel 검증은 커밋을 분리한다. |

## 전체 흐름

```text
준비 확인
→ /plan-idea
→ /plan-screen
→ /plan-epic
→ Feature별 idea brief
→ Feature별 planning/dev loop
→ review
→ Vercel Preview 검증
→ /plan-archive
```

## Commit checkpoint

각 큰 단계가 끝날 때 바로 커밋하지 말고, 먼저 현재 workstream만 stage 가능한지 확인한다.

```text
현재 단계의 커밋 경계를 점검해주세요.

확인:
- 이번 단계에서 stage할 파일 목록
- stage하면 안 되는 무관한 dirty file 목록
- 권장 커밋 메시지
- 커밋 전 필요한 검증

아직 stage나 commit은 하지 말고 점검만 해주세요.
```

## 0. 준비 확인

```text
claude-kit HTML guide website 작업 시작 전 준비 상태를 점검해주세요.

기준 문서:
- `docs/plans/user-guide-website`
- `docs/user-guide-html`

확인:
- 필요한 문서와 HTML reference가 있는지
- protected path를 건드리지 않고 진행 가능한지
- 현재 dirty tree에 무관한 변경이 있는지

아직 수정하지 말고 진행 가능 여부만 알려주세요.
```

## 1. Parent idea

```text
/plan-idea "현재 `docs/user-guide-html` 가이드를 Next.js 기반 문서 웹사이트로 전환하고 싶습니다.

목표는 사용자용 claude-kit 가이드를 웹사이트로 제공하고, 이 전환 과정 자체를 claude-kit 파이프라인 예시로 문서화하는 것입니다.

공통 규칙은 `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md`의 공통 규칙을 따릅니다."
```

## 2. Parent screening

```text
/plan-screen {IDEA-ID}

이 아이디어를 사용자 가치, 구현 비용, 비회귀 리스크, Vercel Preview 가능성 기준으로 평가해주세요.

Go라면 `/plan-epic`에서 나눌 Feature 후보를 함께 제안해주세요.
```

## 3. Parent epic

```text
/plan-epic {APPROVED-IDEA-ID} "EPIC-DOCS-WEBSITE"

HTML guide website 작업을 child Feature로 나눠주세요.

기본 Feature 후보:
- `docs-shell`
- `planning-content-migration`
- `runtime-tabs-and-matrices`
- `pipeline-example-pages`
- `vercel-preview-safety`
- `guide-sync`

각 Feature마다 다음만 짧게 정리해주세요:
- 목적
- 포함/제외 범위
- 주요 리스크
- 선행 Feature
- `full idea/screen` 필요 여부
- 권장 시작점
```

## 4. Feature idea brief

각 Feature마다 아래 프롬프트를 한 번씩 실행한다.

```text
`EPIC-DOCS-WEBSITE`의 child Feature `{FEATURE-NAME}`에 대한 Feature idea brief를 작성해주세요.

짧게 정리할 것:
- 문제
- 사용자 가치
- 포함/제외 범위
- 리스크
- 다음 시작점: `full idea/screen`, `lightweight idea`, `draft`, `prd`, `bridge` 중 하나
```

## 5. Feature idea and screen

`Feature idea brief`에서 `full idea/screen`으로 판단된 Feature만 실행한다.

```text
/plan-idea "`EPIC-DOCS-WEBSITE`의 child Feature `{FEATURE-NAME}`를 진행하고 싶습니다.

목표:
{FEATURE-GOAL}

공통 규칙은 `06-pipeline-prompt-runbook.md`의 공통 규칙을 따릅니다."
```

```text
/plan-screen {FEATURE-IDEA-ID}

Parent Epic `EPIC-DOCS-WEBSITE` 안에서 이 Feature를 독립 진행할 가치가 있는지 평가해주세요.

Go라면 권장 시작점과 P5.5/P6 checkpoint 항목을 짧게 제안해주세요.
```

## 6. Feature draft

```text
/plan-draft {FEATURE-IDEA-OR-BRIEF-ID}

Parent Epic은 `EPIC-DOCS-WEBSITE`입니다.
이번 Feature는 `{FEATURE-NAME}`입니다.

1차 기획 초안에는 사용자 흐름, route/content/component 영향, 보호해야 할 경계를 간단히 포함해주세요.
```

## 7. Feature PRD

```text
/plan-prd {FEATURE-DRAFT-OR-BRIEF-PATH}

`{FEATURE-NAME}`의 요구사항과 acceptance criteria를 작성해주세요.

반드시 포함:
- 기능 요구사항
- 비기능 요구사항
- 제외 범위
- 검증 기준
- P5.5 `/plan-design` 입력
- P6 `/plan-stitch` 입력
```

## 8. Feature wireframe

화면 구조가 있는 Feature에만 실행한다.

```text
/plan-wireframe {FEATURE-PRD-PATH}

`{FEATURE-NAME}`의 문서 화면 구조를 설계해주세요.

sidebar, toc, Claude/Codex tab, 표, artifact flow가 필요한 위치를 간단히 정리해주세요.
```

## 9. Feature design checkpoint

P5.5는 항상 남긴다.

```text
/plan-design {FEATURE-PRD-OR-WIREFRAME-PATH}

`{FEATURE-NAME}`의 디자인 checkpoint를 작성해주세요.

현재 HTML 디자인을 유지할지, 어떤 컴포넌트 패턴을 쓸지, P6 `/plan-stitch`에서 무엇을 판단할지만 짧게 정리해주세요.
```

## 10. Feature stitch checkpoint

P6도 항상 남긴다. 실제 Stitch를 쓰지 않아도 실행한다.

```text
/plan-stitch {FEATURE-PRD-OR-DESIGN-PATH}

`{FEATURE-NAME}`에 대해 Google Stitch 활용 여부를 판단해주세요.

결과는 `use`, `review-only`, `skip-with-reason` 중 하나로 정리하고, `/plan-bridge`에 넘길 메모를 남겨주세요.
```

## 11. Feature bridge

```text
/plan-bridge {FEATURE-PRD-PATH}

`{FEATURE-NAME}`을 개발 handoff 패키지로 정리해주세요.

포함:
- route/content/component 영향
- `/plan-design` 결정
- `/plan-stitch` 결정
- task split
- 검증 기준
- protected path 주의사항
```

## 12. Feature dev package

```text
/dev-feature {FEATURE-BRIDGE-PATH}

`{FEATURE-NAME}`을 개발 가능한 Feature Package로 전환해주세요.

구현 task, 파일 영향, 검증 계획, protected path check를 짧게 정리해주세요.
```

## 13. Feature implementation

```text
/dev-run {FEATURE-PACKAGE-PATH}

`{FEATURE-NAME}`을 구현하고 검증해주세요.

검증은 route smoke, link check, build, protected path diff를 기준으로 보고해주세요.
```

## 14. Review

```text
/dev-review {FEATURE-IMPLEMENTATION-PATH}

`{FEATURE-NAME}` 구현을 리뷰해주세요.

확인:
- PRD와 bridge를 만족하는지
- `/plan-design`과 `/plan-stitch` 결정이 반영됐는지
- protected path 침범이 없는지
- HTML reference 대비 핵심 정보 손실이 없는지
```

기획 산출물만 리뷰할 때는 아래처럼 실행한다.

```text
/plan-review {ARTIFACT-PATH} --type={stage}
```

## 15. Vercel Preview 검증

```text
Vercel Preview 전 검증 상태를 점검해주세요.

확인:
- build 통과 여부
- 주요 route smoke
- 내부 링크
- Claude/Codex tab
- HTML reference 대비 핵심 정보
- protected path diff

Production 배포가 아니라 Preview 진행 가능 여부만 판단해주세요.
```

## 16. Archive

```text
/plan-archive EPIC-DOCS-WEBSITE

Parent idea, screening, Epic, Feature briefs, PRD, design/stitch decisions, bridge, dev package, review, 검증 evidence를 묶어 아카이브해주세요.
```

## Feature별 빠른 체인

### `docs-shell`

```text
Feature idea brief
→ /plan-idea
→ /plan-screen
→ /plan-draft
→ /plan-prd
→ /plan-wireframe
→ /plan-design
→ /plan-stitch
→ /plan-bridge
→ /dev-feature
→ /dev-run
→ /dev-review
```

### `planning-content-migration`

```text
Feature idea brief
→ /plan-idea
→ /plan-screen
→ /plan-draft
→ /plan-prd
→ /plan-design
→ /plan-stitch
→ /plan-bridge
→ /dev-feature
→ /dev-run
→ /dev-review
```

### `runtime-tabs-and-matrices`

```text
Feature idea brief
→ lightweight idea 판단
→ /plan-prd
→ /plan-design
→ /plan-stitch
→ /plan-bridge
→ /dev-feature
→ /dev-run
→ /dev-review
```

### `pipeline-example-pages`

```text
Feature idea brief
→ /plan-idea
→ /plan-screen
→ /plan-draft
→ /plan-prd
→ /plan-wireframe
→ /plan-design
→ /plan-stitch
→ /plan-bridge
→ /dev-feature
→ /dev-run
→ /dev-review
```

### `vercel-preview-safety`

```text
Feature idea brief
→ /plan-idea
→ /plan-screen
→ /plan-prd
→ /plan-design
→ /plan-stitch
→ /plan-bridge
→ /dev-feature
→ /dev-run
→ /dev-review
```

### `guide-sync`

```text
Feature idea brief
→ /plan-design applicability check
→ /plan-stitch applicability check
→ /plan-bridge
→ docs-only edit 또는 /dev-feature
→ /plan-review
```

## 종료 점검

```text
`EPIC-DOCS-WEBSITE` 진행 상태를 점검해주세요.

확인:
- 모든 Feature idea brief가 있는지
- 필요한 Feature가 idea/screen을 거쳤는지
- P5.5/P6 checkpoint가 모두 있는지
- build/link/Preview/protected path evidence가 있는지
- `/plan-archive` 진행 가능한지
```
