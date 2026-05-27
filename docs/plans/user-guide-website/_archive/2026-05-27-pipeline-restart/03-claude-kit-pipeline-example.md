# Claude Kit Pipeline Example Plan

## 목적

이 웹사이트 전환 작업 자체를 `claude-kit` 기획/개발 파이프라인의 실제 사용 예시로 문서화한다.

사용자가 단순히 완성된 문서를 보는 데서 끝나지 않고, `claude-kit`으로 아이디어를 등록하고, 선별하고, PRD를 만들고, 디자인하고, 개발 handoff를 만드는 과정을 따라갈 수 있게 하는 것이 목표다.

## 예시 시나리오

| 항목 | 내용 |
| --- | --- |
| 예시 프로젝트 | `claude-kit` HTML 가이드를 Next.js 문서 사이트로 전환 |
| 제품 목표 | 사용자용 공식 가이드를 웹사이트 형태로 제공 |
| 제약 | 기존 `claude-kit` 기능을 깨뜨리지 않음 |
| 기술 목표 | Next.js App Router, Vercel Preview 배포 |
| 문서 목표 | 진행 과정과 산출물을 HTML/Next.js 문서 안에서 같이 설명 |

## 파이프라인 단계

| 단계 | Command | 이 예시에서 보여줄 내용 | 대표 산출물 |
| --- | --- | --- | --- |
| P1 | `/plan-idea` | 문서 사이트 아이디어 등록 | idea card, problem statement |
| P2 | `/plan-screen` | 왜 지금 필요한지 평가 | screening score, go/hold 판단 |
| P2.5 | `/plan-epic` | docs website를 여러 Feature로 나누는 Epic 구성 | epic scope, feature grouping, milestone map |
| P3 | `/plan-draft` | 초기 기획 초안 작성 | draft spec |
| P4 | `/plan-prd` | 요구사항과 성공 기준 정리 | PRD |
| P5 | `/plan-wireframe` | 문서 구조와 화면 흐름 설계 | wireframe, navigation map |
| P5.5 | `/plan-design` | Claude Code 디자인 중심 UI 설계와 적용 여부 기록 | design brief, page pattern, design decision |
| P6 | `/plan-stitch` | Google Stitch 활용 여부를 검토하고 통합 판단 기록 | stitch review, use/skip decision, HTML integration notes |
| P7 | `/plan-bridge` | 개발 handoff 패키지 구성 | dev handoff, task split |
| D1 | `/dev-feature` | Next.js feature package 작성 | feature overview, tasks |
| D2 | `/dev-run` | 구현과 검증 | implementation diff, tests |
| R1 | `/plan-review` 또는 `/dev-review` | 결과 검토 | review notes |
| A1 | `/plan-archive` | 완료 산출물 정리 | archive bundle |

## 예시 문서 페이지 후보

| 페이지 | 목적 | 위치 후보 |
| --- | --- | --- |
| Website build pipeline | 전체 파이프라인 흐름 설명 | `docs/user-guide-html/examples/website-build-pipeline.html` |
| Website build epic | 웹사이트 작업을 Epic과 Feature 단위로 나누는 예시 | `docs/user-guide-html/examples/website-build-epic.html` |
| Website build artifacts | 단계별 산출물 위치와 이동 설명 | `docs/user-guide-html/examples/website-build-artifacts.html` |
| Website build commands | 실제 command 실행 예시 모음 | `docs/user-guide-html/examples/website-build-commands.html` |

Next.js 전환 후에는 같은 내용을 `/examples/website-build-pipeline`, `/examples/website-build-epic`, `/examples/website-build-artifacts`, `/examples/website-build-commands` route로 제공한다.

## 단계별 예시 내용

### `/plan-idea`

| 항목 | 예시 |
| --- | --- |
| 입력 | "현재 HTML 가이드를 Next.js/Vercel 문서 사이트로 전환" |
| 참조 | `docs/user-guide-html`, `docs/guide`, 기존 planning docs |
| 출력 | docs website idea entry |
| 검증 | 기존 기능 보호 조건이 idea에 포함됐는지 확인 |

### `/plan-epic`

`/plan-epic`은 이 작업에서 빠지면 안 되는 중간 단계다. HTML 가이드를 Next.js 문서 사이트로 전환하는 일은 단일 화면 구현이 아니라, 문서 구조, route, 컴포넌트, 예시 문서, 배포 검증, 비회귀 보호가 함께 움직이는 큰 작업이기 때문이다.

| 항목 | 예시 |
| --- | --- |
| 입력 | `/plan-screen`에서 Go 판정을 받은 "HTML 가이드 Next.js 웹사이트화" 아이디어 |
| 목적 | 하나의 큰 목표를 구현 가능한 Feature 묶음으로 나눔 |
| 참조 | `docs/user-guide-html`, `docs/plans/user-guide-website`, `docs/guide`, Vercel/Next.js 기준 |
| 출력 | docs website Epic, Feature grouping, milestone, dependency map |
| 검증 | 각 Feature가 독립적으로 구현/검증 가능하고, core 기능 보호 gate를 포함하는지 확인 |

#### Epic 예시

| 필드 | 내용 |
| --- | --- |
| Epic 이름 | `EPIC-DOCS-WEBSITE`: `claude-kit` 사용자 가이드 웹사이트화 |
| 목표 | 기존 HTML 가이드를 Next.js/Vercel 기반 문서 사이트로 제공 |
| 사용자 가치 | 사용자가 command별 상세 흐름, 산출물 위치, Claude/Codex 차이를 웹에서 빠르게 탐색 |
| 제약 | 기존 `claude-kit` runtime, installer, Claude/Codex source를 깨뜨리지 않음 |
| 완료 기준 | 주요 guide route가 구현되고, Preview build와 protected path 검증이 통과됨 |

#### Feature 분해 예시

| Feature | 범위 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- |
| `docs-shell` | Next.js layout, sidebar, toc, 기본 스타일 | 계획 패키지 승인 | home/planning shell 렌더링 |
| `planning-content-migration` | planning 상세 16개 페이지 route 전환 | `docs-shell` | 기존 HTML 대비 핵심 정보 누락 없음 |
| `runtime-tabs-and-matrices` | Claude/Codex 탭, capability matrix | planning content model | 탭 접근성, command별 기능 표 표시 |
| `pipeline-example-pages` | 이 웹사이트 작업 자체를 예시 문서로 제공 | Epic scope 확정 | pipeline, epic, artifacts, commands 예시 route 제공 |
| `vercel-preview-safety` | Vercel Preview와 비회귀 검증 | 핵심 route 구현 | `next build`, link check, protected path diff 확인 |

#### `/plan-epic`에서 반드시 잠글 결정

| 결정 | 이유 |
| --- | --- |
| 웹사이트는 core 기능이 아니라 docs surface | 구현 범위가 `src/claude`, `src/codex`로 번지지 않게 함 |
| Epic 안에 safety Feature를 포함 | 배포와 비회귀 검증을 마지막 부가 작업으로 밀지 않기 위함 |
| `/plan-design`은 필수 checkpoint | 실제 디자인 산출물을 크게 만들지 않더라도 화면 패턴 판단을 남김 |
| `/plan-stitch`도 필수 checkpoint | Google Stitch를 활용하지 않더라도 use/skip 판단과 이유를 남김 |
| Feature별 acceptance criteria 분리 | 한 번에 전체 구현을 검증하려다 놓치는 일을 줄임 |

#### Epic 이후 Feature별 후속 파이프라인

`/plan-epic`은 구현 시작 신호가 아니라, child Feature들을 어떤 파이프라인으로 넘길지 결정하는 분기점이다. 각 Feature는 먼저 `Feature idea brief`로 문제와 가치를 정리하고, 독립 가치나 리스크가 큰 경우에는 `/plan-idea`와 `/plan-screen`을 정식으로 다시 실행한다.

| Feature | 아이디어 정리 | 후속 시작점 | 필요한 흐름 | 이유 |
| --- | --- | --- | --- | --- |
| `docs-shell` | full idea/screen 권장 | `/plan-draft` | idea → screen → draft → PRD → wireframe → design → stitch decision → bridge → dev | layout과 navigation은 독립 사용자 가치가 큼 |
| `planning-content-migration` | full idea/screen 권장 | `/plan-draft` | idea → screen → draft → PRD → design check → stitch decision → bridge → dev | 기존 HTML 정보 손실 리스크가 큼 |
| `runtime-tabs-and-matrices` | lightweight idea 이상 | `/plan-prd` | brief → PRD → design → stitch decision → bridge → dev | Claude/Codex tab과 matrix UI 요구사항을 잠가야 함 |
| `pipeline-example-pages` | full idea/screen 권장 | `/plan-draft` | idea → screen → draft → PRD → wireframe → design → stitch decision → bridge → dev | 예시 페이지는 사용자 교육 기능으로 독립 가치가 있음 |
| `vercel-preview-safety` | full idea/screen 권장 | `/plan-prd` | idea → screen → PRD → design/stitch applicability check → bridge → dev | 배포와 검증은 운영 리스크가 큼 |
| `guide-sync` | Feature idea brief | `/plan-bridge` | brief → design/stitch applicability check → bridge → docs edit/review | 후속 문서 반영은 구현 결과를 기준으로 진행 |

즉, 이 프로젝트의 실제 진행은 `Epic 1개 → Feature 여러 개 → Feature별 claude-kit pipeline` 구조가 된다.

`/plan-draft`부터 바로 시작하는 것은 기본값이 아니라, `Feature idea brief`에서 독립 idea/screen이 필요 없다고 판단된 경우에만 허용한다.

### `/plan-prd`

| 항목 | 예시 |
| --- | --- |
| 사용자 | `claude-kit` 사용자, maintainer, Codex/Claude 병행 사용자 |
| 요구사항 | 상세 문서 구조, 검색/탐색, command별 runtime 차이 설명 |
| 비기능 요구사항 | 기존 toolkit 기능 비회귀, 접근성, 모바일 대응 |
| Epic 연결 | `EPIC-DOCS-WEBSITE`의 각 Feature가 PRD 요구사항으로 내려오는지 확인 |
| 성공 기준 | HTML 정보 손실 없음, Vercel Preview 확인, protected path 변경 없음 |

### `/plan-design`

| 항목 | 예시 |
| --- | --- |
| 기본 경로 | Claude Code 디자인 중심 |
| 다음 checkpoint | `/plan-stitch`에서 Google Stitch를 실제로 쓸지, 쓰지 않을지 판단과 이유를 기록 |
| 결과 | docs layout, sidebar, tab, capability matrix, artifact flow |
| 주의 | landing page보다 상세 docs page 정보 밀도를 우선 |

### `/plan-stitch`

| 항목 | 예시 |
| --- | --- |
| 목적 | Google Stitch 활용 여부를 판단하고, 사용하지 않더라도 그 이유를 기록 |
| 입력 | PRD, wireframe, `/plan-design` 산출물, 기존 `docs/user-guide-html` reference |
| 결과 | `use`, `review-only`, `skip-with-reason` 중 하나 |
| 주의 | 이 프로젝트에서는 P6를 생략하지 않는다. 실제 Stitch 산출물을 쓰지 않더라도 checkpoint는 반드시 남긴다. |

### `/plan-bridge`와 `/dev-feature`

| 항목 | 예시 |
| --- | --- |
| handoff | route map, component map, content model, safety gate |
| task split | Epic Feature 기준으로 shell, navigation, planning pages, examples, Vercel config 분리 |
| 검증 | HTML link check, Next.js build, protected path diff check |

## 문서화 원칙

| 원칙 | 설명 |
| --- | --- |
| 실제 작업 기반 | 가상의 showcase가 아니라 이 repo의 실제 변경 흐름을 예시로 사용 |
| 산출물 위치 우선 | 각 단계에서 어떤 파일이 생기는지 먼저 보여줌 |
| 명령보다 흐름 중심 | command 사용법과 산출물 lifecycle을 함께 설명 |
| Claude/Codex 차이 표시 | 필요한 곳은 탭으로 runtime 차이를 보여줌 |
| 안전 조건 반복 | 웹사이트는 부가 docs 표면이고 core 기능은 우선 보호 대상임을 유지 |

## 실행 프롬프트 예시

파이프라인을 실제로 처음부터 끝까지 실행할 때 사용할 프롬프트 예시는 `06-pipeline-prompt-runbook.md`를 기준으로 한다.

`03` 문서는 흐름과 판단 기준을 설명하고, `06` 문서는 복사해서 실행할 수 있는 프롬프트 예시를 제공한다.
