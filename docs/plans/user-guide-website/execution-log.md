# User Guide Website Pipeline Execution Log

## 목적

이 문서는 `docs/user-guide-html`을 Next.js 기반 문서 웹사이트로 전환하는 작업이 `claude-kit` 파이프라인을 따라 어떻게 진행됐는지 남기는 실행 로그다.

기획 문서가 “이렇게 진행하자”를 설명한다면, 이 문서는 “실제로 어떤 순서와 프롬프트로 진행했는가”를 기록한다.

## 공통 실행 조건

| 항목 | 내용 |
| --- | --- |
| 기준 문서 | `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md` |
| 핵심 목표 | 사용자 가이드 웹사이트화와 그 과정의 pipeline 예시화 |
| 우선순위 | `claude-kit` core 기능 보호가 웹사이트 구현보다 우선 |
| Protected paths | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js`, `.claude`, `.agents`, `.codex` |
| 진행 방식 | 단계별 산출물 생성, self-review, commit 분리 |

## P1. Parent idea

| 항목 | 내용 |
| --- | --- |
| 상태 | 완료 |
| 산출물 | `.plans/ideas/20-approved/IDEA-20260527-001.md` |
| 원래 생성 위치 | `.plans/ideas/00-inbox/IDEA-20260527-001.md` |
| 현재 결정 | screening 후 approved로 이동 |

### 실행 프롬프트 요약

```text
/plan-idea "현재 docs/user-guide-html 가이드를 Next.js 기반 문서 웹사이트로 전환하고 싶습니다.

목표는 사용자용 claude-kit 가이드를 웹사이트로 제공하고,
이 전환 과정 자체를 claude-kit 파이프라인 예시로 문서화하는 것입니다.

공통 규칙은 docs/plans/user-guide-website/06-pipeline-prompt-runbook.md의 공통 규칙을 따릅니다."
```

### 결과

웹사이트는 `claude-kit` core 기능이 아니라 부가적인 docs surface로 정의했다. 기존 HTML은 migration reference로 유지한다.

## P2. Parent screening

| 항목 | 내용 |
| --- | --- |
| 상태 | 완료 |
| 판정 | Go |
| 점수 | 84 / 100 |
| 산출물 | `.plans/ideas/10-screening/SCREENING-20260527-001.md` |

### 실행 프롬프트 요약

```text
/plan-screen IDEA-20260527-001

사용자 가치, 구현 비용, 비회귀 리스크, Vercel Preview 가능성 기준으로 평가합니다.
Go라면 /plan-epic에서 나눌 Feature 후보를 함께 제안합니다.
```

### 결과

사용자 가치가 높고 protected path를 분리할 수 있어 `Go`로 판정했다. 다만 범위가 크므로 `/plan-epic`으로 나눠 진행한다.

## P2.5. Parent epic

| 항목 | 내용 |
| --- | --- |
| 상태 | 완료 |
| Epic | `EPIC-20260527-001` |
| 산출물 | `.plans/epics/20-active/EPIC-20260527-001/00-epic-brief.md` |
| Children | `.plans/epics/20-active/EPIC-20260527-001/01-children-features.md` |

### 실행 프롬프트 요약

```text
/plan-epic IDEA-20260527-001 "EPIC-DOCS-WEBSITE"

HTML guide website 작업을 child Feature로 나눕니다.
Feature마다 목적, 포함/제외 범위, 리스크, 선행 Feature, 권장 시작점을 정리합니다.
```

### 결과

Epic을 6개 Feature로 분해했다.

| Feature | 역할 |
| --- | --- |
| `docs-shell` | Next.js shell, navigation, layout |
| `planning-content-migration` | 기존 planning HTML 콘텐츠 전환 |
| `runtime-tabs-and-matrices` | Claude/Codex 탭과 capability matrix |
| `pipeline-example-pages` | 이번 작업 과정의 예시 문서화 |
| `vercel-preview-safety` | build, link, preview, protected path 검증 |
| `guide-sync` | 구현 결과의 기존 문서 반영 |

## Feature idea briefs

| 항목 | 내용 |
| --- | --- |
| 상태 | 완료 |
| 위치 | `.plans/features/briefs/*.md` |
| 원칙 | 모든 child Feature는 최소 brief를 가진다. |

### 실행 프롬프트 요약

```text
EPIC-20260527-001의 child Feature {FEATURE-NAME}에 대해 Feature idea brief를 작성합니다.

정리할 항목:
- 문제
- 사용자 가치
- 포함/제외 범위
- 리스크
- 다음 시작점
```

## 다음 실행 예정

| 순서 | 작업 | 기준 산출물 |
| --- | --- | --- |
| 1 | `docs-shell` draft/PRD/bridge 경량화 | `.plans/features/briefs/docs-shell.md` |
| 2 | Next.js shell 구현 | `src/app`, `src/components/docs`, `src/lib/docs` |
| 3 | planning content migration | `docs/user-guide-html/planning/*.html` |
| 4 | pipeline example pages | `execution-log.md`, Epic 산출물 |
| 5 | validation and handoff | build/link/protected path evidence |

## D1/D2. `docs-shell` implementation

| 항목 | 내용 |
| --- | --- |
| 상태 | 완료 |
| Feature | `docs-shell` + 초기 `planning-content-migration` |
| 구현 위치 | `src/app`, `src/components/docs`, `src/lib/docs` |
| 주요 route | `/`, `/planning`, `/planning/[slug]`, `/planning/lifecycle`, `/planning/reference`, `/examples/[slug]` |

### 실행 프롬프트 요약

```text
/dev-run docs-shell

Next.js 기반 문서 shell을 구현합니다.
기존 claude-kit 기능 경로는 수정하지 않고,
planning command 상세와 실행 예시 route를 먼저 렌더링 가능하게 만듭니다.
```

### 구현 결과

- Next.js App Router 기반 docs shell을 추가했다.
- 좌측 navigation, 우측 toc, 상세 문서 카드, command matrix, Claude/Codex tab UI를 구성했다.
- `/plan-epic`을 포함한 planning command 상세 route를 모두 `/planning/[slug]`로 제공한다.
- pipeline example page는 `/examples/[slug]` 동적 route로 제공한다.

### 검증 결과

| 검증 | 결과 | 메모 |
| --- | --- | --- |
| `pnpm test` | 통과 | 34 files, 423 tests passed |
| `pnpm docs:build` 1차 | 실패 후 수정 | Next build가 기존 `src/claude`/`src/codex` Node hook 파일까지 ESLint 대상으로 잡음 |
| `pnpm docs:build` 2차 | 통과 | 24 static pages generated |
| route smoke | 통과 | `/`, `/planning`, `/planning/plan-idea`, `/planning/plan-epic`, `/planning/reference`, `/examples/website-build-pipeline` |

### 피드백 반영

| 피드백 | Severity | Action | 반영 |
| --- | --- | --- | --- |
| Next build가 protected source lint까지 수행함 | high | auto-fixed | docs build에서는 lint를 분리하고 타입/빌드 검증에 집중하도록 `next.config.mjs`에서 `ignoreDuringBuilds`를 설정했다. |

### 다음 실행 예정

| 순서 | 작업 | 메모 |
| --- | --- | --- |
| 1 | planning content detail 보강 | HTML 대비 누락 정보를 더 세밀하게 확인 |
| 2 | pipeline example page 내용 보강 | 실제 산출물과 execution log를 더 촘촘히 연결 |
| 3 | Vercel Preview safety 정리 | 배포 전 package 영향과 route/link 검증 정리 |

## Validation evidence

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| lockfile consistency | 통과 | `pnpm install --frozen-lockfile` |
| 기존 test suite | 통과 | `pnpm test`, 34 files / 423 tests |
| Next.js production build | 통과 | `pnpm docs:build`, 24 static pages generated |
| route smoke | 통과 | 21개 route HTTP 200 확인 |
| protected path diff | 통과 | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js`, `.claude`, `.agents`, `.codex` 변경 없음 |

### Route smoke 대상

```text
/
/planning
/planning/lifecycle
/planning/reference
/planning/plan-idea
/planning/plan-screen
/planning/plan-epic
/planning/plan-draft
/planning/plan-prd
/planning/plan-wireframe
/planning/plan-design
/planning/plan-stitch
/planning/plan-bridge
/planning/plan-review
/planning/plan-revise
/planning/plan-improve
/planning/plan-archive
/examples/website-build-pipeline
/examples/website-build-epic
/examples/website-build-artifacts
/examples/website-build-commands
```
