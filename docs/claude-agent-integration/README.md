# Copy 도메인 도입 문서

- 문서 상태: 재구성 완료 (CAI-10~13 파이프라인 설계 기반)
- 기준일: 2026-04-16
- 기준 관점: claude-kit 패키지에 선택형 `copy` 도메인을 추가하기 위한 설계와 구현 계획. 기존 plan/copy/dev 파이프라인과의 정합성이 최우선.
- 현재 구현 상태: `src/claude/copy/`는 아직 존재하지 않는다.
- 아카이브: `archive/2026-04-16-original/` (원본 CAI-00~13), `archive/2026-04-16-other-ai/` (다른 AI 재구성), `archive/2026-04-16-feedback/` (14번 피드백)

## 1. 목적

이 문서 패키지는 claude-kit에 `copy` 도메인을 도입하기 위한 실행형 문서 세트다. copy 도메인은 기준 화면과 현재 구현을 비교해 시각적/인터랙션 충실도, evidence 관리, QA readiness를 표준화하는 선택형 도메인이다.

**핵심 설계 기반**: CAI-10(plan 통합), CAI-11(WBS), CAI-12(파이프라인 다이어그램), CAI-13(파이프라인 순서 분석)에서 확정된 설계 결정을 기존 plan/copy/dev 파이프라인에 정합하도록 문서화했다.

## 2. 읽기 순서

### 2.1 핵심 문서

| 순서 | 문서 | 목적 |
|------|------|------|
| 1 | [01-scope-and-decisions.md](./01-scope-and-decisions.md) | 범위, 확정된 설계 결정 (시나리오, WBS, Feature 유형) |
| 2 | [02-target-architecture.md](./02-target-architecture.md) | source/deploy 구조, setup/registry 영향 |
| 3 | [03-workflow-and-pipeline.md](./03-workflow-and-pipeline.md) | 시나리오별 워크플로우, 커맨드 매핑, 게이트, Mermaid 다이어그램 |
| 4 | [04-component-specs.md](./04-component-specs.md) | 에이전트, 커맨드, 훅, 룰, 스킬의 contract |
| 5 | [05-implementation-plan.md](./05-implementation-plan.md) | A-1~A6 단계별 구현 계획 |
| 6 | [06-readiness-and-verification.md](./06-readiness-and-verification.md) | 구현 전후 검증 기준 |

### 2.2 보조 문서

| 문서 | 역할 |
|------|------|
| [07-cross-analysis-and-improvements.md](./07-cross-analysis-and-improvements.md) | 본문 설계(01~06)가 실제 파이프라인 가정과 어떻게 맞물리는지 다시 점검할 때 참고하는 교차 분석 메모. 기본 구현 순서의 필수 문서는 아니다 |
| [appendix/design-analysis.md](./appendix/design-analysis.md) | CAI-10~13 핵심 분석 근거 |
| [appendix/legacy-turner-mapping.md](./appendix/legacy-turner-mapping.md) | Turner 프로젝트 사례 매핑 |

## 3. 핵심 원칙

| 원칙 | 설명 |
|------|------|
| pipeline-first | 기존 plan/copy/dev 파이프라인과의 정합성이 최우선이다. |
| source-first | 실제 수정 대상은 `src/claude/copy/*`이며, `.claude/*`는 생성 결과이다. |
| scenario-adaptive | 카피 시나리오(A/B/C)에 따라 파이프라인 순서가 달라진다. |
| evidence-first | 충실도 판단은 screenshot, state capture, manifest 등 evidence에 기반한다. |
| opt-in | copy는 `profile.json`에서 선택하는 도메인이다. |
| reminder-first hooks | 신규 훅은 초기 reminder로 시작, blocking은 게이트 위반에만 적용한다. |

## 4. 확정된 설계 결정 요약

| 결정 | 내용 | 상세 |
|------|------|------|
| 시나리오 3분류 | A(백지), B(부분), C(충실도 교정) | [01-scope-and-decisions.md](./01-scope-and-decisions.md) SS2 |
| Feature 유형 2분류 | copy / dev | [01-scope-and-decisions.md](./01-scope-and-decisions.md) SS3 |
| WBS 4계층 | Epic > Feature > Story > Task | [01-scope-and-decisions.md](./01-scope-and-decisions.md) SS4 |
| 시나리오별 순서 | A/B: PRD먼저, C: 갭먼저 | [03-workflow-and-pipeline.md](./03-workflow-and-pipeline.md) SS2 |
| 판정 시점 | `/plan-draft`에서 동시 판정 | [03-workflow-and-pipeline.md](./03-workflow-and-pipeline.md) SS1 |

## 5. 다음 액션

1. [06-readiness-and-verification.md](./06-readiness-and-verification.md)의 Pre-Implementation Readiness 통과
2. [05-implementation-plan.md](./05-implementation-plan.md)의 A-1부터 순서대로 구현
3. 구현은 문서 변경과 코드 변경을 섞지 않고 실행 단위별로 분리
