# Implementation Roadmap

## 목적

이 문서는 `docs/user-guide-html/`을 Next.js 문서 사이트로 전환하는 작업을 `claude-kit` 파이프라인 기준으로 실행하기 위한 상세 로드맵이다.

일반적인 웹 구현 순서가 아니라, `claude-kit`에서 실제로 사용하는 기획 명령, 리뷰 루프, 개발 handoff, 검증 단계를 기준으로 정리한다. 핵심 원칙은 그대로 유지한다. `claude-kit`의 기존 command, agent, skill, hook, rule, installer, Claude/Codex source가 우선이며, 웹사이트는 부가적인 docs surface다.

## 전체 흐름

```text
/plan-idea
  -> /plan-screen
  -> /plan-epic
       ├─ Feature: docs-shell
       │    -> Feature idea brief -> [/plan-idea -> /plan-screen if needed]
       │    -> /plan-draft -> /plan-prd -> /plan-wireframe -> /plan-design
       │    -> /plan-stitch checkpoint -> /plan-bridge -> /dev-feature -> /dev-run -> review
       ├─ Feature: planning-content-migration
       │    -> Feature idea brief -> [/plan-idea -> /plan-screen if needed]
       │    -> /plan-draft -> /plan-prd -> /plan-design checkpoint
       │    -> /plan-stitch checkpoint -> /plan-bridge -> /dev-feature -> /dev-run -> review
       ├─ Feature: runtime-tabs-and-matrices
       │    -> Feature idea brief -> [/plan-idea -> /plan-screen if needed]
       │    -> /plan-prd -> /plan-design -> /plan-stitch checkpoint
       │    -> /plan-bridge -> /dev-feature -> /dev-run -> review
       ├─ Feature: pipeline-example-pages
       │    -> Feature idea brief -> [/plan-idea -> /plan-screen if needed]
       │    -> /plan-draft -> /plan-prd -> /plan-wireframe -> /plan-design
       │    -> /plan-stitch checkpoint -> /plan-bridge -> /dev-feature -> /dev-run -> review
       └─ Feature: vercel-preview-safety
            -> Feature idea brief -> [/plan-idea -> /plan-screen if needed]
            -> /plan-prd -> /plan-design applicability check
            -> /plan-stitch applicability check -> /plan-bridge -> /dev-feature -> /dev-run -> review

전체 완료 후
  -> /plan-archive
```

## 단계 요약

| 단계 | Command | 이 작업에서의 목적 | 주요 산출물 | Gate |
| --- | --- | --- | --- | --- |
| P1 | `/plan-idea` | HTML 가이드 웹사이트화 아이디어 등록 | idea entry | core 기능 보호 조건 포함 |
| P2 | `/plan-screen` | 진행 가치와 리스크 평가 | screening result | Go 판정 또는 보류 사유 |
| P2.5 | `/plan-epic` | 큰 작업을 Feature 묶음으로 분해 | Epic, Feature map | Epic scope 승인 |
| P3 | `/plan-draft` | 1차 기능 기획 작성 | first-pass draft | scope 과확장 없음 |
| P4 | `/plan-prd` | 요구사항과 성공 기준 확정 | PRD | 비회귀 기준 포함 |
| P5 | `/plan-wireframe` | 정보 구조와 화면 흐름 설계 | wireframe, navigation map | 상세 docs 구조 확인 |
| P5.5 | `/plan-design` | Claude Code 디자인 기준 UI 설계와 적용 여부 기록 | design brief, component pattern, design decision | docs page 중심 디자인 |
| P6 | `/plan-stitch` | Google Stitch 활용 여부를 검토하고 통합 판단 기록 | stitch review, use/skip decision, HTML integration notes | checkpoint 생략 금지 |
| P7 | `/plan-bridge` | 개발 handoff 패키지 구성 | bridge package | dev task 분리 완료 |
| D1 | `/dev-feature` | Feature Package 생성 | implementation tasks | protected path 확인 |
| D2 | `/dev-run` | 구현과 검증 | code diff, test output | build/link/protected diff 통과 |
| R1 | `/plan-review`, `/dev-review` | 산출물과 구현 결과 리뷰 | review notes | high 이상 이슈 없음 |
| A1 | `/plan-archive` | 완료 산출물 정리 | archive bundle | 후속 참조 가능 |

## P1: `/plan-idea`

### 목표

HTML 가이드를 Next.js/Vercel 문서 사이트로 전환하려는 아이디어를 정식 backlog로 등록한다.

### 입력

| 입력 | 설명 |
| --- | --- |
| 사용자 요구 | "현재 HTML 문서들을 이용해 프로젝트를 웹사이트화" |
| 현재 산출물 | `docs/user-guide-html/**` |
| 핵심 제약 | 기존 `claude-kit` 기능에 문제 생기지 않게 진행 |
| 배포 목표 | Vercel Preview 우선 |

### 작성해야 할 내용

| 항목 | 내용 |
| --- | --- |
| Problem | HTML 문서는 존재하지만 장기 운영 가능한 웹사이트 구조는 아직 없음 |
| User | `claude-kit` 사용자, maintainer, Claude/Codex 병행 사용자 |
| Value | 기획/개발 파이프라인을 웹에서 탐색 가능하게 제공 |
| Constraint | 웹사이트는 부가 docs surface, core 기능은 우선 보호 |
| Non-goal | `src/claude`, `src/codex`, installer 변경 |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| 아이디어가 단일 문장으로 설명됨 | "HTML guide를 Next.js docs website로 전환" |
| protected path가 idea에 들어감 | `src/claude`, `src/codex`, `scripts/setup.js` 보호 |
| Vercel은 배포 후보로만 명시됨 | 즉시 production deploy로 쓰지 않음 |

## P2: `/plan-screen`

### 목표

웹사이트화 작업을 지금 진행할 가치가 있는지 평가하고, scope를 줄일지 확장할지 결정한다.

### 평가 축

| 축 | 질문 | 판단 기준 |
| --- | --- | --- |
| 사용자 가치 | 문서 사이트가 실제 사용성을 높이는가 | command별 상세 탐색과 예시 제공 |
| 구현 비용 | Next.js 추가가 과하지 않은가 | shell부터 단계 구현 가능 |
| 운영 리스크 | 기존 툴킷 기능에 영향이 있는가 | protected path gate로 통제 가능 |
| 배포 리스크 | Vercel 배포가 현재 repo에 무리 없는가 | Preview-first로 낮춤 |
| 대체안 | HTML만 유지해도 충분한가 | 장기 유지보수는 Next.js가 유리 |

### 완료 기준

| 결과 | 조건 |
| --- | --- |
| Go | 문서 사이트화 가치가 있고, protected path를 지킬 수 있음 |
| Hold | Next.js 추가 방식이나 package manager 영향이 불명확함 |
| Kill | 웹사이트가 core 기능보다 큰 리스크를 만든다고 판단됨 |

## P2.5: `/plan-epic`

### 목표

이 작업을 하나의 거대한 구현으로 밀어붙이지 않고, 독립적으로 설계/구현/검증 가능한 Feature 묶음으로 나눈다.

### Epic 정의

| 항목 | 내용 |
| --- | --- |
| Epic ID | `EPIC-DOCS-WEBSITE` |
| Epic 이름 | `claude-kit` 사용자 가이드 웹사이트화 |
| 목표 | 기존 HTML 가이드를 Next.js/Vercel 기반 docs website로 제공 |
| 핵심 제약 | core 기능 보호, docs-only 계획 우선, Preview-first 배포 |
| 완료 조건 | 주요 route 구현, 예시 페이지 제공, build/link/protected path 검증 통과 |

### Feature map

| Feature | 범위 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- |
| `docs-shell` | Next.js shell, layout, sidebar, toc | PRD 승인 | home/planning route 렌더링 |
| `planning-content-migration` | planning 16개 HTML 페이지를 route/content로 전환 | `docs-shell` | 핵심 정보 누락 없음 |
| `runtime-tabs-and-matrices` | Claude/Codex 탭, capability matrix, artifact flow | content model 확정 | 탭 접근성 및 표 구조 확인 |
| `pipeline-example-pages` | 웹사이트 구축 과정을 `claude-kit` 예시로 문서화 | Epic scope 승인 | pipeline/epic/artifacts/commands 페이지 제공 |
| `vercel-preview-safety` | Vercel Preview, build, protected path 검증 | 핵심 route 구현 | `next build`, link check, diff check 통과 |
| `guide-sync` | 기존 `docs/guide`, README 반영 여부 정리 | Preview 검증 후 | 중앙 문서와 충돌 없음 |

### Epic 이후 Feature별 파이프라인 재진입 원칙

`/plan-epic`이 끝났다고 해서 바로 구현으로 넘어가지 않는다. Epic은 작업을 나누는 상위 planning 단계이고, 실제 구현 가능한 각 Feature는 자기 범위에 맞는 `claude-kit` 파이프라인을 다시 탄다.

다만 모든 Feature를 정식 backlog idea로 다시 등록할지, 경량 `Feature idea brief`로 충분한지는 다르게 판단한다. 최소 기준은 모든 child Feature에 `Feature idea brief`가 있어야 한다는 것이다.

| 원칙 | 설명 |
| --- | --- |
| Epic은 umbrella | 큰 목표와 child Feature 목록을 관리한다. |
| Feature는 실행 단위 | 각 Feature는 별도 기획, handoff, 개발, 리뷰 단위를 가진다. |
| Feature idea brief는 필수 | 각 Feature의 문제, 사용자 가치, 범위, 리스크를 짧게 정리한다. |
| 독립 가치가 있으면 P1/P2 재실행 | 별도 사용자 가치나 리스크가 크면 `/plan-idea`, `/plan-screen`을 정식으로 실행한다. |
| 경량 작업은 brief 후 P3/P4 진입 | 단순 하위 작업이면 brief를 근거로 `/plan-draft` 또는 `/plan-prd`부터 시작한다. |
| P7 직접 재진입은 제한 | 개발 task만 쪼개면 되는 경우에도 `/plan-design`과 `/plan-stitch` applicability check를 먼저 남긴 뒤 `/plan-bridge`로 간다. |
| Review는 Feature마다 수행 | 각 Feature 완료 시 `/plan-review` 또는 `/dev-review`를 실행한다. |
| Archive는 전체 완료 후 | 개별 Feature review가 끝난 뒤 Epic 단위로 `/plan-archive`한다. |

### Feature idea brief 기준

`Feature idea brief`는 정식 `/plan-idea`보다 가볍지만, 아이디어 정리를 생략하지 않기 위한 최소 산출물이다.

| 항목 | 작성 내용 |
| --- | --- |
| Feature name | Epic 안에서 사용할 고유 이름 |
| Problem | 이 Feature가 해결하는 구체 문제 |
| User value | 사용자 또는 maintainer에게 주는 가치 |
| Scope | 이번 Feature에 포함되는 것과 제외되는 것 |
| Risk | core 기능, 배포, 문서 정확성, 접근성 리스크 |
| Decision | `full idea/screen`, `lightweight idea`, `draft start`, `prd start`, `bridge start` 중 하나 |

### 정식 `/plan-idea` 재실행 판단

| 조건 | 판단 |
| --- | --- |
| 독립 사용자 가치가 큼 | `/plan-idea`와 `/plan-screen`을 정식 실행 |
| 별도 배포/운영 리스크가 큼 | `/plan-idea`와 `/plan-screen`을 정식 실행 |
| 다른 Feature와 의존성이 복잡함 | 최소 lightweight idea와 mini screening 수행 |
| 단순 구현 단위에 가까움 | `Feature idea brief` 후 `/plan-draft` 또는 `/plan-prd` 진입 |
| 구현 후 문서 동기화에 가까움 | `Feature idea brief` 후 `/plan-bridge` 진입 가능 |

### Feature별 권장 파이프라인

| Feature | 아이디어 정리 | 권장 시작점 | 필요한 planning 단계 | 개발 단계 | Review gate |
| --- | --- | --- | --- | --- | --- |
| `docs-shell` | `full idea/screen` 권장 | `/plan-draft` | `/plan-prd`, `/plan-wireframe`, `/plan-design`, `/plan-stitch`, `/plan-bridge` | `/dev-feature`, `/dev-run` | layout, navigation, protected path |
| `planning-content-migration` | `full idea/screen` 권장 | `/plan-draft` | `/plan-prd`, `/plan-design` checkpoint, `/plan-stitch` checkpoint, `/plan-bridge` | `/dev-feature`, `/dev-run` | HTML parity, route coverage |
| `runtime-tabs-and-matrices` | `lightweight idea` 이상 | `/plan-prd` | `/plan-design`, `/plan-stitch`, `/plan-bridge` | `/dev-feature`, `/dev-run` | tab accessibility, matrix readability |
| `pipeline-example-pages` | `full idea/screen` 권장 | `/plan-draft` | `/plan-prd`, `/plan-wireframe`, `/plan-design`, `/plan-stitch`, `/plan-bridge` | `/dev-feature`, `/dev-run` | example clarity, artifact accuracy |
| `vercel-preview-safety` | `full idea/screen` 권장 | `/plan-prd` | `/plan-design` applicability check, `/plan-stitch` applicability check, `/plan-bridge` | `/dev-feature`, `/dev-run` | build, link check, Preview, protected diff |
| `guide-sync` | `Feature idea brief` | `/plan-bridge` | `/plan-design` applicability check, `/plan-stitch` applicability check, `/plan-bridge` | `/dev-feature`, `/dev-run` 또는 docs-only edit | guide/meta docs conflict check |

### Feature별 산출물 위치 예시

실제 경로는 `.plans/` 운영 규칙에 맞춰 생성하되, 개념상 아래처럼 나뉘어야 한다.

| Feature | Planning 산출물 | Dev 산출물 | 검증 산출물 |
| --- | --- | --- | --- |
| `docs-shell` | shell PRD, wireframe, design brief | Feature Package, route/component diff | shell smoke check |
| `planning-content-migration` | content migration PRD, route map | migrated planning routes | HTML parity report |
| `runtime-tabs-and-matrices` | tab/matrix interaction spec | `RuntimeTabs`, `CapabilityMatrix` implementation | accessibility check |
| `pipeline-example-pages` | example page PRD, flow map | `/examples/*` routes | example walkthrough review |
| `vercel-preview-safety` | deployment safety PRD, bridge checklist | build/deploy config changes | Preview/build/link evidence |
| `guide-sync` | docs sync checklist | guide/meta docs edits | doc consistency review |

### Epic gate

| Gate | 확인 내용 |
| --- | --- |
| Feature가 독립 실행 가능한가 | 각 Feature가 별도 PR 또는 commit으로 설명 가능 |
| safety가 별도 항목인가 | 비회귀 검증이 마지막에 묻히지 않음 |
| `/plan-design`과 `/plan-stitch` 역할이 구분됐는가 | 둘 다 checkpoint로 진행하고, 실제 활용 여부만 다르게 기록 |
| create-time 기능이 섞이지 않았는가 | 웹사이트 작업은 docs surface 구현만 다룸 |

## P3: `/plan-draft`

### 목표

Epic을 바탕으로 1차 기능 기획 초안을 만든다. 이 단계에서는 완성된 PRD보다 빠르게 scope와 흐름을 잡는 것이 중요하다.

### 초안에 포함할 항목

| 항목 | 내용 |
| --- | --- |
| 문제 정의 | HTML 가이드의 장기 운영성과 탐색성 한계 |
| 핵심 사용자 흐름 | 홈 → planning index → command 상세 → examples |
| route 초안 | `/`, `/planning`, `/planning/[slug]`, `/examples/*` |
| 컴포넌트 초안 | `DocsShell`, `RuntimeTabs`, `CapabilityMatrix`, `ArtifactFlow` |
| 안전 초안 | protected path, build/link check, Preview-first |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| Lite/Standard 판단 | 이 작업은 Standard 이상으로 보고 PRD까지 진행 |
| scope creep 방지 | 검색, auth, CMS 같은 후속 기능은 제외 |
| Epic Feature와 연결 | 각 초안 항목이 Feature map에 연결됨 |

## P4: `/plan-prd`

### 목표

실제 구현자가 따라갈 수 있도록 요구사항, 비기능 요구사항, 성공 기준을 확정한다.

### PRD 필수 요구사항

| 요구사항 | 설명 |
| --- | --- |
| 문서 탐색 | 좌측 navigation, 현재 페이지 강조, 관련 문서 이동 |
| 상세 페이지 | command별 목적, 입력, 산출물, 참조 기능, lifecycle 표시 |
| Claude/Codex 차이 | tab UI로 target별 사용 방식을 구분 |
| 예시 문서 | 웹사이트 구축 과정 자체를 pipeline 예시로 제공 |
| 배포 | Vercel Preview를 통해 확인 가능 |

### 비기능 요구사항

| 요구사항 | 설명 |
| --- | --- |
| 비회귀 | 기존 `claude-kit` 기능에 영향 없음 |
| 접근성 | heading, tab, navigation keyboard 사용 가능 |
| 모바일 | sidebar와 표가 작은 화면에서 깨지지 않음 |
| 유지보수 | content와 component를 분리해 문서 추가가 쉬움 |
| 검증 가능성 | build, link, protected path 검증이 명확함 |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| acceptance criteria 존재 | route, component, content, safety별 기준이 있음 |
| protected path 명시 | PRD 안에 수정 금지 경로가 있음 |
| Vercel은 Preview-first | Production은 별도 승인 후 진행 |

## P5: `/plan-wireframe`

### 목표

문서 사이트의 정보 구조와 화면 흐름을 설계한다.

### 화면 목록

| 화면 | 목적 |
| --- | --- |
| Home | 전체 가이드 진입점 |
| Planning index | 전체 파이프라인 지도 |
| Command detail | `/plan-*` 상세 설명 |
| Lifecycle | 산출물 생성/변경/이동 흐름 |
| Reference | 기능별 command reference |
| Example pipeline | 웹사이트 구축 예시 |
| Example epic | `/plan-epic` Feature 분해 예시 |
| Example artifacts | 실제 산출물 위치 예시 |
| Example commands | 실행 명령 예시 |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| navigation 구조 | 모든 주요 페이지로 이동 가능 |
| 상세 문서 중심 | landing page가 아니라 docs page 밀도 유지 |
| mobile 고려 | 긴 표와 탭이 깨지지 않는 대안 포함 |

## P5.5: `/plan-design`

### 목표

Claude Code 디자인 흐름을 기본으로 사용해 문서 사이트의 시각 구조와 컴포넌트 패턴을 확정한다.

이 프로젝트에서는 P5.5를 선택 단계로 보지 않는다. 실제 디자인 산출물을 크게 만들지 않더라도, 현재 HTML 디자인을 유지할지, Next.js 전환 과정에서 어떤 화면 패턴을 고정할지, 어떤 부분을 후속으로 넘길지 반드시 기록한다.

### 디자인 결정

| 항목 | 결정 |
| --- | --- |
| 기본 구조 | Claude Code docs처럼 sidebar + content + toc |
| 톤 | 현재 HTML 디자인의 선명한 카드/표 스타일 유지 |
| 탭 | Claude/Codex를 실제 tab UI로 표시 |
| 표 | capability matrix와 artifact 위치 표를 가독성 있게 제공 |
| 경고 | protected path와 non-goal은 notice component로 강조 |

### P5.5 완료 기준

| 기준 | 확인 |
| --- | --- |
| design decision | 현재 HTML 디자인을 유지/확장/수정할 범위가 기록됨 |
| component pattern | sidebar, toc, tab, matrix, artifact flow 패턴이 정해짐 |
| applicability | UI가 거의 없는 Feature도 디자인 영향 없음 또는 영향 작음을 기록 |
| handoff 준비 | `/plan-stitch`와 `/plan-bridge`가 참조할 화면 판단 근거가 있음 |

## P6: `/plan-stitch`

### 목표

Google Stitch를 실제로 활용할지 검토하고, 활용하지 않더라도 그 판단과 이유를 기록한다.

이 프로젝트에서는 P6도 생략하지 않는다. `use`, `review-only`, `skip-with-reason` 중 하나를 남겨야 하며, 아무 기록 없이 `/plan-bridge`로 넘어가지 않는다.

### Stitch 판단 결과

| 결과 | 의미 | 다음 단계 |
| --- | --- | --- |
| `use` | Stitch 산출물을 실제 reference로 사용 | Stitch artifact를 bridge에 포함 |
| `review-only` | Stitch를 참고만 하고 구현 source로 삼지 않음 | 참고 메모만 bridge에 포함 |
| `skip-with-reason` | 이 Feature에서는 Stitch가 적합하지 않음 | skip 이유와 대체 기준을 bridge에 포함 |

### P6 완료 기준

| 기준 | 확인 |
| --- | --- |
| 판단 기록 | `use`, `review-only`, `skip-with-reason` 중 하나가 있음 |
| 이유 기록 | Stitch 활용 또는 미활용 이유가 명시됨 |
| HTML reference 연결 | 기존 `docs/user-guide-html`와 충돌 여부를 확인함 |
| core 보호 | Stitch 결과가 `src/claude`, `src/codex`, installer 변경으로 번지지 않음 |

## P7: `/plan-bridge`

### 목표

기획 산출물을 개발자가 바로 실행할 수 있는 handoff 패키지로 바꾼다.

### Handoff 구성

| 항목 | 내용 |
| --- | --- |
| Route map | Next.js route와 기존 HTML source 연결 |
| Component map | 필요한 docs component와 책임 |
| Content model | planning command page, runtime capability, artifact flow |
| Task split | Epic Feature별 구현 단위 |
| Safety gate | protected path, build, link, Preview 검증 |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| `/dev-feature` 입력 가능 | 개발자가 추가 질문 없이 Feature Package 작성 가능 |
| task가 너무 크지 않음 | shell, migration, examples, deploy가 분리됨 |
| 검증 명령 후보 포함 | `next build`, link check, protected path diff |

## D1: `/dev-feature`

### 목표

각 Epic Feature를 개발 가능한 Feature Package로 바꾼다.

### Feature Package 후보

| Package | 포함 작업 | 제외 작업 |
| --- | --- | --- |
| `docs-site-shell` | Next.js 기본 shell, layout, navigation | content 전체 migration |
| `planning-pages-migration` | planning route와 command detail content | Vercel 설정 |
| `docs-runtime-components` | tab, matrix, artifact flow, notice | 신규 기획 내용 작성 |
| `website-example-pages` | pipeline/epic/artifact/command 예시 | Production 배포 |
| `docs-preview-validation` | build, link, Preview 검증 | core installer 변경 |

### 완료 기준

| 기준 | 확인 |
| --- | --- |
| 구조 SSOT 확인 | 기존 `src` 구조와 충돌 없는 배치 |
| protected path 유지 | `src/claude`, `src/codex`, `scripts/setup.js` 변경 없음 |
| 테스트 계획 포함 | build/link/route/protected diff 검증 포함 |

## D2: `/dev-run`

### 목표

Feature Package를 작은 단위로 구현하고 검증한다.

### 권장 실행 순서

| 순서 | 작업 | 검증 |
| --- | --- | --- |
| 1 | `docs-site-shell` 구현 | home/planning route smoke |
| 2 | 공통 component 구현 | tab/navigation/table 동작 확인 |
| 3 | planning content migration | HTML parity review |
| 4 | example pages 구현 | pipeline 예시 흐름 확인 |
| 5 | Vercel Preview 준비 | local build, preview route 확인 |
| 6 | 후속 문서 sync | guide/meta docs 충돌 확인 |

### 구현 중 금지

| 금지 | 이유 |
| --- | --- |
| `src/claude/**` 수정 | Claude authoring source 보호 |
| `src/codex/**` 수정 | Codex authoring source 보호 |
| `scripts/setup.js` 수정 | 설치 흐름과 무관 |
| `.claude/**`, `.agents/**`, `.codex/**` 수정 | runtime/config 산출물 보호 |
| 기존 HTML 삭제 | migration reference 보존 |

## Review loop: `/plan-review`와 `/dev-review`

### 목표

각 산출물이 다음 단계로 넘어가도 안전한지 확인한다.

### 리뷰 기준

| 리뷰 대상 | 확인 |
| --- | --- |
| 기획 산출물 | Epic, PRD, wireframe, design이 서로 충돌하지 않는가 |
| 구현 산출물 | route, component, content가 PRD를 만족하는가 |
| 문서 산출물 | 사용자에게 실제 사용 순서가 보이는가 |
| 안전 산출물 | protected path와 비회귀 검증이 통과했는가 |

### Severity 기준

| Severity | 예시 | 조치 |
| --- | --- | --- |
| critical | core 기능 source 변경, secret 노출, installer 파손 | 즉시 중단 |
| high | 주요 route 누락, build 실패, HTML 정보 손실 | 수정 후 재검증 |
| medium | 설명 부족, 모바일 표 개선 필요 | backlog 또는 즉시 보강 |
| low | 문구/표기 개선 | 후속 정리 |

## A1: `/plan-archive`

### 목표

웹사이트 작업 완료 후 산출물을 추적 가능한 형태로 정리한다.

### 아카이브 대상

| 대상 | 설명 |
| --- | --- |
| Idea/Screening/Epic | 왜 시작했고 어떻게 scope가 정해졌는지 |
| PRD/Wireframe/Design | 무엇을 만들기로 했는지 |
| Bridge/Feature Package | 구현 handoff와 task 분해 |
| Review notes | 어떤 피드백을 반영했는지 |
| Verification evidence | build, link, preview, protected diff 결과 |

## `/plan-improve` 재진입 기준

웹사이트가 배포된 뒤 개선 요청이 들어오면 변경 규모에 따라 재진입 지점을 다르게 잡는다.

| 변경 규모 | 예시 | 재진입 |
| --- | --- | --- |
| 경량 | 문구 수정, 링크 추가 | Dev only |
| 중간 | 새 guide page 추가, 표 보강 | P5 또는 P5.5/P6 확인 후 P7 |
| 대규모 | navigation 재구성, content model 변경 | P3 |
| 근본 재설계 | docs website 목표 자체 변경 | P1 |

## 최종 완료 조건

| 영역 | 완료 기준 |
| --- | --- |
| 기획 | `/plan-idea`부터 `/plan-bridge`까지 산출물 연결 |
| Epic | Feature map과 dependency가 구현 결과와 일치 |
| 구현 | Next.js route와 component가 핵심 문서 제공 |
| 검증 | build, link, protected path diff, Preview 확인 |
| 문서 | `docs/guide`, `docs/meta-tooling`, README 반영 여부 결정 |
| 보존 | 기존 HTML reference 삭제 없음 |

## 구현 전 필수 확인

| 확인 | 이유 |
| --- | --- |
| package manager와 script | Next.js 추가가 기존 install 흐름을 깨지 않도록 확인 |
| current dirty tree | 사용자 변경과 섞이지 않게 workstream 분리 |
| protected path diff | 핵심 toolkit source 변경 방지 |
| Vercel project root | repo root 배포가 맞는지 확인 |
| HTML reference 유지 | 기존 확인 가능한 문서가 사라지지 않도록 보존 |
