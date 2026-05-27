# Next.js Docs Site Plan

## 목적

`docs/user-guide-html/`을 Next.js 기반 문서 웹사이트로 전환할 때 필요한 정보 구조, route, component, 배포 기준을 정의한다.

이 문서의 핵심은 격리다. Next.js 사이트는 `claude-kit` 기능을 설명하는 문서 표면이며, `src/claude`, `src/codex`, 설치기, 변환기와 같은 핵심 기능 source를 직접 바꾸지 않는다.

## 기술 기준

| 항목 | 권장 기준 | 이유 |
| --- | --- | --- |
| Framework | Next.js App Router | 공식 문서의 현재 기본 route 모델 |
| 배치 후보 | `src/app`, `src/components/docs`, `src/lib/docs` | 사용자 요구인 `src/` 구현을 따르되 toolkit source와 분리 |
| Styling | 기존 `styles.css` 토큰을 기준으로 재구성 | 현재 디자인 장점을 유지 |
| Content | 초기에는 TS/MD data registry, 후속 MDX 검토 | 빠른 migration과 타입 안정성 균형 |
| Deploy | Vercel Preview 우선 | Production 전 build/링크 검증 가능 |

## 보호 경계

| 경계 | 원칙 |
| --- | --- |
| `src/claude/**` | 웹사이트 구현에서 수정하지 않음 |
| `src/codex/**` | 웹사이트 구현에서 수정하지 않음 |
| `src/templates/**` | 설치/출력 template이므로 수정하지 않음 |
| `scripts/setup.js` | 웹사이트 구현과 무관하게 유지 |
| `.claude/**`, `.agents/**`, `.codex/**` | runtime/config 산출물이므로 수정하지 않음 |

## Route 설계

| Route | 설명 | 입력 HTML |
| --- | --- | --- |
| `/` | 가이드 홈 | `index.html` |
| `/planning` | 기획 파이프라인 허브 | `planning/index.html` |
| `/planning/lifecycle` | 산출물 lifecycle | `planning/lifecycle.html` |
| `/planning/reference` | command reference | `planning/reference.html` |
| `/planning/[slug]` | 개별 command 상세 | `planning/plan-*.html` |
| `/examples/website-build-pipeline` | 웹사이트 구축 과정을 pipeline 예시로 설명 | 신규 예시 문서 |
| `/examples/website-build-epic` | `/plan-epic`으로 웹사이트 작업을 Epic/Feature로 나누는 예시 | 신규 예시 문서 |
| `/examples/website-build-artifacts` | 실제 산출물 흐름 예시 | 신규 예시 문서 |
| `/examples/website-build-commands` | 실행 command 예시 | 신규 예시 문서 |

## Source 구조 후보

```text
src/
  app/
    layout.tsx
    page.tsx
    planning/
      page.tsx
      lifecycle/page.tsx
      reference/page.tsx
      [slug]/page.tsx
    examples/
      website-build-pipeline/page.tsx
      website-build-epic/page.tsx
      website-build-artifacts/page.tsx
      website-build-commands/page.tsx
  components/
    docs/
      DocsShell.tsx
      DocsSidebar.tsx
      DocsToc.tsx
      RuntimeTabs.tsx
      CapabilityMatrix.tsx
      ArtifactFlow.tsx
      CommandExample.tsx
      SafetyNotice.tsx
  lib/
    docs/
      planning-pages.ts
      route-map.ts
      navigation.ts
```

이 구조는 Next.js의 `src/app` 관례를 따르되, 기존 `src/claude`와 `src/codex`를 문서 사이트 구현 대상으로 오해하지 않도록 `components/docs`와 `lib/docs`로 분리한다.

## Content model

| 모델 | 설명 |
| --- | --- |
| `DocPage` | title, description, route, sections, relatedPages |
| `PlanningCommandPage` | command, phase, inputs, outputs, claudeRuntime, codexRuntime, lifecycle |
| `RuntimeCapability` | target, agents/subagents, skills, hooks, rules, notes |
| `ArtifactLocation` | source path, generated path, movement rule, owner |
| `PipelineExampleStep` | command, intent, expected output, verification |

## UI 원칙

| 원칙 | 적용 |
| --- | --- |
| 상세 문서 중심 | landing page보다 docs page 구조를 우선 |
| 좌측 navigation 유지 | Claude Code docs처럼 빠른 이동 제공 |
| 타깃 차이 명확화 | Claude/Codex 탭을 실제 tab UI로 구현 |
| 산출물 위치 강조 | 사용자가 파일 위치를 바로 찾을 수 있게 표준 card 사용 |
| 모바일 대응 | sidebar collapse, table overflow, tab keyboard navigation |

## Vercel 배포 계획

| 단계 | 내용 |
| --- | --- |
| Preview | Vercel preview deployment로 링크와 build 상태 확인 |
| Production gate | HTML 링크, Next.js build, 비회귀 check 통과 후 승인 |
| Build command | Next.js 설정 후 `next build` 또는 package script 기준 |
| Project root | 현재 repo root를 기본 후보로 두되, Vercel 설정에서 불필요한 workstream 영향을 확인 |
| Ignore build | 문서 관련 변경이 아닐 때 배포 skip 가능 여부 후속 검토 |

## 1차 결론

Next.js 문서 사이트는 `claude-kit`의 새로운 runtime 기능이 아니다. 기존 HTML 문서를 더 유지보수 가능한 route/component/content 구조로 옮기는 presentation layer다.
