# D2 Route, Component, Data Inventory

- **Feature**: `user-guide-website`
- **Purpose**: route, component, data의 연결 관계를 문서화한다.
- **Status**: complete

## Route inventory

| Route | Page file | Data source | 주요 component | 상태 |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | inline page content | `DocsShell`, `PageHeader`, `InfoGrid` | implemented |
| `/planning` | `src/app/planning/page.tsx` | `planningPages` | `DocsShell`, `PageHeader` | implemented |
| `/planning/lifecycle` | `src/app/planning/lifecycle/page.tsx` | inline page content | `DocsShell`, `PageHeader` | implemented |
| `/planning/reference` | `src/app/planning/reference/page.tsx` | `planningPages` | `DocsShell`, `PageHeader` | implemented |
| `/planning/[slug]` | `src/app/planning/[slug]/page.tsx` | `getPlanningPage`, `planningPages` | `DocsShell`, `PlanningCommandPage` | implemented |
| `/examples/[slug]` | `src/app/examples/[slug]/page.tsx` | `getExamplePage`, `examplePages` | `DocsShell`, `PageHeader` | implemented |

## Planning command route coverage

| Command | Route | Data status | Content parity |
| --- | --- | --- | --- |
| `/plan-idea` | `/planning/plan-idea` | present | summary |
| `/plan-screen` | `/planning/plan-screen` | present | summary |
| `/plan-epic` | `/planning/plan-epic` | present | summary |
| `/plan-draft` | `/planning/plan-draft` | present | summary |
| `/plan-prd` | `/planning/plan-prd` | present | summary |
| `/plan-wireframe` | `/planning/plan-wireframe` | present | summary |
| `/plan-design` | `/planning/plan-design` | present | summary |
| `/plan-stitch` | `/planning/plan-stitch` | present | summary |
| `/plan-bridge` | `/planning/plan-bridge` | present | summary |
| `/plan-review` | `/planning/plan-review` | present | summary |
| `/plan-revise` | `/planning/plan-revise` | present | summary |
| `/plan-improve` | `/planning/plan-improve` | present | summary |
| `/plan-archive` | `/planning/plan-archive` | present | summary |

## Example route coverage

| Example | Route | Data status | 목적 |
| --- | --- | --- | --- |
| Website build pipeline | `/examples/website-build-pipeline` | present | 전체 파이프라인 흐름 |
| Website build epic | `/examples/website-build-epic` | present | Epic/Feature 분해 |
| Website build artifacts | `/examples/website-build-artifacts` | present | 산출물 위치 |
| Website build commands | `/examples/website-build-commands` | present | 실행 프롬프트 예시 |

## Component responsibility matrix

| Component | Used by | Responsibility |
| --- | --- | --- |
| `DocsShell` | all routes | 전체 layout, sidebar navigation, toc |
| `PageHeader` | home, planning, lifecycle, reference, examples, command detail | page heading consistency |
| `InfoGrid` | home | 원칙과 route card |
| `PlanningCommandPage` | `/planning/[slug]` | command detail template |
| `RuntimeTabs` | `PlanningCommandPage` | Claude/Codex runtime comparison |

## Data model coverage

| Type | Fields | 현재 활용 |
| --- | --- | --- |
| `PlanningPage` | `slug`, `command`, `phase`, `title`, `description`, `purpose`, `whenToUse`, `inputs`, `outputs`, `lifecycle`, `rules`, `runtimes` | command 상세 |
| `RuntimeInfo` | `target`, `summary`, `assets`, `notes` | Claude/Codex tab |
| `ExamplePage` | `slug`, `title`, `description`, `sections` | example route |

## HTML parity gap

기존 HTML은 command별로 다음 상세 섹션을 갖고 있다.

```text
실행 예시
Claude / Codex asset table
Runtime Flow
Output Lifecycle
Rules and Guards
Failure Modes
Next Step
```

현재 Next.js data model은 이 중 일부를 요약형으로 표현한다. 따라서 최종 문서 품질을 위해서는 `PlanningPage` 타입을 확장하거나 command별 상세 section model을 추가해야 한다.

