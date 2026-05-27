# 파이프라인 프롬프트 런북

## 목적

이 문서는 `docs/user-guide-html`을 Next.js/Vercel 문서 사이트로 전환하는 과정을 `claude-kit` 파이프라인으로 실행할 때 사용한 프롬프트를 보존한다.

프롬프트는 일부러 짧게 유지한다. 반복되는 제약은 공통 규칙에 모아두고, 각 단계는 그 규칙을 참조한다.

## 공통 규칙

| 규칙 | 내용 |
| --- | --- |
| Core first | `claude-kit` 기능이 우선이고 웹사이트는 docs surface다. |
| Protected paths | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js`, `.claude`, `.agents`, `.codex`는 수정하지 않는다. |
| HTML reference | `docs/user-guide-html/**`은 migration/reference 자료로 보존한다. |
| 증거 우선 | 각 단계마다 프롬프트, 실행 내용, 산출물, 검증, 리뷰를 남긴다. |
| P5.5/P6 required | `/plan-design`, `/plan-stitch`는 실제 외부 도구 사용 여부와 무관하게 기록한다. |
| Archive-first | 기존 planning docs는 삭제하지 않고 archive 후 교체한다. |

## 0. 재시작 준비

```text
현재까지 작성된 user-guide-website 기획/구현 문서를 archive-first 방식으로 보존하고,
claude-kit 파이프라인을 실제로 다시 실행할 준비 상태를 점검해주세요.

기준:
- 기존 구현은 prototype/evidence로만 취급
- 기존 planning docs는 archive
- 새 active 산출물은 .plans와 docs/plans/user-guide-website에 생성
```

## 1. P1 `/plan-idea`

```text
/plan-idea "현재 docs/user-guide-html 가이드를 Next.js 기반 문서 웹사이트로 전환하고 싶습니다.

목표는 사용자용 claude-kit 가이드를 웹사이트로 제공하고, 이 전환 과정 자체를 claude-kit 파이프라인 예시로 문서화하는 것입니다.

공통 규칙은 docs/plans/user-guide-website/06-pipeline-prompt-runbook.md의 공통 규칙을 따릅니다."
```

## 2. P2 `/plan-screen`

```text
/plan-screen IDEA-20260527-001

이 아이디어를 사용자 가치, 구현 비용, 비회귀 리스크, Vercel Preview 가능성 기준으로 평가해주세요.

Go라면 /plan-epic에서 나눌 Feature 후보를 함께 제안해주세요.
```

## 3. P2.5 `/plan-epic`

```text
/plan-epic IDEA-20260527-001 "claude-kit 사용자 가이드 웹사이트화"

HTML guide website 작업을 child Feature로 나눠주세요.

기본 Feature 후보:
- docs-shell
- planning-content-migration
- runtime-tabs-and-matrices
- pipeline-example-pages
- vercel-preview-safety
- guide-sync

각 Feature마다 목적, 포함/제외 범위, 주요 리스크, 선행 Feature, 권장 시작점을 정리해주세요.
```

## 4. P3 `/plan-draft`

```text
/plan-draft IDEA-20260527-001

Epic은 EPIC-20260527-001입니다.
이번 Feature는 user-guide-website입니다.

1차 기획 초안에는 사용자 흐름, route/content/component 영향, 보호해야 할 경계를 포함해주세요.
```

## 5. P4 `/plan-prd`

```text
/plan-prd .plans/features/active/user-guide-website/01-draft/01-feature-draft.md

user-guide-website의 요구사항과 acceptance criteria를 작성해주세요.

반드시 포함:
- 기능 요구사항
- 비기능 요구사항
- 제외 범위
- 검증 기준
- P5.5 /plan-design 입력
- P6 /plan-stitch 입력
```

## 6. P5 `/plan-wireframe`

```text
/plan-wireframe .plans/prd/10-approved/user-guide-website-prd.md

user-guide-website의 문서 화면 구조를 설계해주세요.

sidebar, toc, Claude/Codex tab, 표, artifact flow, example page navigation이 필요한 위치를 정리해주세요.
```

## 7. P5.5 `/plan-design`

```text
/plan-design .plans/wireframes/user-guide-website

user-guide-website의 디자인 checkpoint를 작성해주세요.

현재 HTML 디자인을 유지할지, 어떤 컴포넌트 패턴을 쓸지, P6 /plan-stitch에서 무엇을 판단할지 정리해주세요.
```

## 8. P6 `/plan-stitch`

```text
/plan-stitch .plans/prd/10-approved/user-guide-website-prd.md

user-guide-website에 대해 Google Stitch 활용 여부를 판단해주세요.

결과는 use, review-only, skip-with-reason 중 하나로 정리하고, /plan-bridge에 넘길 메모를 남겨주세요.
```

## 9. P7 `/plan-bridge`

```text
/plan-bridge .plans/prd/10-approved/user-guide-website-prd.md

user-guide-website를 개발 handoff 패키지로 정리해주세요.

포함:
- route/content/component 영향
- /plan-design 결정
- /plan-stitch 결정
- task split
- 검증 기준
- protected path 주의사항
```

## 10. D1 `/dev-feature`

```text
/dev-feature .plans/bridge/user-guide-website/05-bridge-context.md

user-guide-website를 개발 가능한 기능 패키지로 전환해주세요.

반드시 dev-feature-plan 스킬 기준을 따르고,
architecture SSOT, architecture binding, bridge docs를 확인한 뒤
Feature Overview와 01~10 package 문서를 작성해주세요.
```

## 11. D2 `/dev-run`

```text
/dev-run .plans/features/active/user-guide-website/02-package

현재 구현된 Next.js docs site를 기능 패키지 기준으로 검증하고,
TASK/REQ/TC별 구현 증거와 남은 gap을 기록해주세요.
```

## 12. R1 Review

```text
/plan-review .plans/features/active/user-guide-website --type=feature-package

PRD, wireframe, bridge, dev package, implementation evidence를 비교해
누락, protected path 침범, 검증 부족, 문서/코드 불일치를 리뷰해주세요.
```

## 13. A1 Archive Readiness

```text
/plan-archive user-guide-website --dry-run

완료된 산출물이 archive 가능한 상태인지 점검하고,
아직 production deploy 또는 final approval이 필요하면 archive-readiness로 남겨주세요.
```
