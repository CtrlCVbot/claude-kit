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

