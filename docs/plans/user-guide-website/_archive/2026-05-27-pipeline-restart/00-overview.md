# Claude Kit HTML Guide Website Plan

## 목적

이 문서 패키지는 현재 `docs/user-guide-html/`에 구현된 정적 HTML 가이드를 Next.js 기반 문서 웹사이트로 확장하기 위한 계획이다.

핵심 전제는 분명하다. `claude-kit`의 에이전트 기능, 설치기, Claude/Codex 자산이 우선이며, 웹사이트는 이를 설명하기 위한 부가 문서 표면이다. 따라서 웹사이트 구현은 기존 툴킷 기능을 바꾸거나 깨뜨리는 방식으로 진행하지 않는다.

## 현재 입력

| 입력 | 상태 | 역할 |
| --- | --- | --- |
| `docs/user-guide-html/index.html` | 존재 | 현재 HTML 가이드 홈 |
| `docs/user-guide-html/planning/*.html` | 존재 | 기획 파이프라인 상세 페이지 |
| `docs/user-guide-html/styles.css` | 존재 | 현재 HTML 가이드 디자인 기준 |
| `docs/guide/*` | 존재 | 기존 Markdown 공식 가이드 |
| `src/claude`, `src/codex`, `src/templates` | 존재 | 툴킷 authoring source, 직접 수정 보호 대상 |

## 목표

| 목표 | 설명 |
| --- | --- |
| Next.js 문서 사이트 계획 | `src/` 아래에 Next.js 문서 표면을 만들기 위한 구조와 단계 정의 |
| Vercel 배포 준비 | Preview/Production 배포에 필요한 검증과 안전장치 정리 |
| HTML 가이드 보존 | 기존 HTML을 삭제하지 않고 migration source와 reference artifact로 유지 |
| 파이프라인 예시화 | 이 웹사이트 작업 자체를 `claude-kit` 기획/개발 파이프라인 예시로 문서화 |
| 비회귀 보호 | 기존 `claude-kit` 기능, 설치기, Claude/Codex 자산이 영향받지 않도록 gate 정의 |

## 비목표

| 비목표 | 이유 |
| --- | --- |
| 이번 단계에서 Next.js 코드 구현 | 먼저 기획과 안전 경계를 고정해야 함 |
| `src/claude` 또는 `src/codex` 구조 변경 | 웹사이트는 문서 표면이며 툴킷 source가 아님 |
| 설치기 또는 emitter 변경 | 웹사이트 구현과 별도 workstream |
| `docs/user-guide-html` 삭제 | 현재 사용자 확인용 산출물이므로 보존 |
| Vercel 실배포 | 구현과 build 검증 이후 별도 단계 |

## 공식 기준

| 기준 | 적용 방식 |
| --- | --- |
| [Next.js App Router](https://nextjs.org/docs/app) | `src/app` 기반 라우팅을 기본 후보로 둔다. |
| [Vercel Next.js guide](https://vercel.com/docs/frameworks/full-stack/nextjs) | Next.js 프로젝트의 Vercel 배포 기준으로 삼는다. |
| [Vercel Builds](https://vercel.com/docs/builds) | Git push, CLI, dashboard build 흐름과 자동 framework detection을 고려한다. |

## 읽는 순서

1. `01-html-inventory.md`: 현재 HTML 산출물이 무엇인지 확인한다.
2. `02-nextjs-docs-site-plan.md`: Next.js 문서 사이트 구조를 확인한다.
3. `03-claude-kit-pipeline-example.md`: 이 작업을 `claude-kit` 파이프라인 예시로 어떻게 보여줄지 확인한다.
4. `04-implementation-roadmap.md`: 실제 구현 순서와 acceptance criteria를 확인한다.
5. `05-safety-and-non-regression-plan.md`: 기존 기능을 보호하기 위한 gate를 확인한다.
6. `06-pipeline-prompt-runbook.md`: 파이프라인 처음부터 끝까지 실행할 프롬프트 예시를 확인한다.

## 결정 요약

| 결정 | 내용 |
| --- | --- |
| 구현 방향 | Next.js App Router 기반 문서 사이트 |
| 배포 방향 | Vercel Preview 먼저, Production은 검증 후 |
| source 우선순위 | `claude-kit` 기능 source가 웹사이트보다 우선 |
| 문서 전략 | 기존 HTML을 reference로 유지하고, Next.js로 단계적 migration |
| 안전 전략 | 웹사이트 workstream은 툴킷 runtime/source와 격리 |
