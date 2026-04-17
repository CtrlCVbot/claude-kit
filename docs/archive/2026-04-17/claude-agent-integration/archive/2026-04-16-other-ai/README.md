# claude-kit copy 도메인 도입 문서

- 문서 상태: 재작성 완료
- 기준일: 2026-04-16
- 기준 관점: `claude-kit` 패키지에 선택형 `copy` 도메인을 추가하기 위한 설계와 구현 계획
- 현재 구현 상태: `src/claude/copy`는 아직 존재하지 않는다.
- 이전 문서 보존 위치: [archive/2026-04-16-original/README.md](./archive/2026-04-16-original/README.md)
- 기준 피드백 문서: [archive/2026-04-16-feedback/14_copy-domain-docs-feedback-proposal.md](./archive/2026-04-16-feedback/14_copy-domain-docs-feedback-proposal.md)

## 1. 목적

이 문서 패키지는 `claude-kit`에 `copy` 도메인을 도입하기 위한 실행형 문서 세트다.

`copy` 도메인은 특정 고객 사이트 구현 자체가 아니라, 기준 화면과 현재 구현을 비교해 시각적 충실도(visual fidelity), 인터랙션 충실도(interaction fidelity), evidence 관리, QA readiness를 표준화하는 선택형 도메인이다. Turner 홈페이지 관련 내용은 더 이상 본문 기준이 아니며, 필요한 사례만 [appendix/legacy-turner-mapping.md](./appendix/legacy-turner-mapping.md)에 보존한다.

## 2. 현재 상태

| 항목 | 상태 |
| --- | --- |
| 기존 15개 문서 | [archive/2026-04-16-original/](./archive/2026-04-16-original/README.md)에 보존 |
| 피드백 문서 | [archive/2026-04-16-feedback/](./archive/2026-04-16-feedback/14_copy-domain-docs-feedback-proposal.md)에 보존 |
| 새 문서 구조 | README + `01`~`06` + appendix |
| `src/claude/copy` | 없음. 구현 계획 단계에서 생성 대상 |
| `.claude/*` | generated output으로만 취급. 본문은 source 경로 기준으로 작성 |
| Turner/P문서/R문서 참조 | 본문 기준에서 제거, appendix 사례로 격리 |

## 3. 읽기 순서

| 순서 | 문서 | 목적 |
| --- | --- | --- |
| 1 | [01-scope-and-decisions.md](./01-scope-and-decisions.md) | `copy` 도메인의 범위와 결정 사항 확인 |
| 2 | [02-target-architecture.md](./02-target-architecture.md) | source/deploy 구조와 setup/registry 영향 확인 |
| 3 | [03-workflow-contracts.md](./03-workflow-contracts.md) | `plan`, `copy`, `dev` workflow 책임 경계 확인 |
| 4 | [04-component-specs.md](./04-component-specs.md) | agents, commands, hooks, rules, skills의 contract 확인 |
| 5 | [05-implementation-plan.md](./05-implementation-plan.md) | 실제 구현 단계와 파일 단위 계획 확인 |
| 6 | [06-readiness-and-verification.md](./06-readiness-and-verification.md) | 구현 전후 검증 기준과 피드백 반영 결과 확인 |
| 7 | [appendix/legacy-turner-mapping.md](./appendix/legacy-turner-mapping.md) | 기존 Turner 특화 내용을 사례로 확인 |

## 4. 핵심 원칙

| 원칙 | 설명 |
| --- | --- |
| package-first | 본문은 `claude-kit` 패키지 도메인 설계를 기준으로 한다. |
| source-first | 실제 수정 대상은 `src/claude/copy/*`와 setup/template/registry이며, `.claude/*`는 생성 결과로만 다룬다. |
| opt-in default | `copy`는 기본 도메인이 아니라 `profile.json`에서 선택하는 opt-in 도메인으로 시작한다. |
| evidence-first | 충실도 판단은 screenshot, state capture, manifest, QA report 같은 evidence와 연결되어야 한다. |
| boundary-first | `plan`은 선별/PRD/bridge, `copy`는 evidence/gap/QA, `dev`는 구현을 담당한다. |
| reminder-first hooks | 신규 hook은 초기에는 reminder로 시작하고, blocking은 gate 위반처럼 위험이 명확한 경우로 제한한다. |
| legacy isolation | 특정 프로젝트 사례는 appendix로 격리해 도메인 본문을 재사용 가능하게 유지한다. |

## 5. 최종 산출물

| 문서 | 산출물 성격 |
| --- | --- |
| `README.md` | 패키지 입구와 상태판 |
| `01-scope-and-decisions.md` | 범위, 비범위, 결정 기록 |
| `02-target-architecture.md` | 목표 아키텍처와 source/deploy 매핑 |
| `03-workflow-contracts.md` | workflow, command, gate contract |
| `04-component-specs.md` | component별 구현 contract |
| `05-implementation-plan.md` | 단계별 구현 계획 |
| `06-readiness-and-verification.md` | readiness, 검증, 피드백 반영표 |
| `appendix/legacy-turner-mapping.md` | legacy 사례 보존 |

## 6. 이전 문서와의 관계

기존 문서는 삭제하지 않고 archive에 보존했다. 새 문서에는 기존 문서의 모든 문장을 옮기지 않았고, 다음 항목만 선별 이관했다.

| 이관 항목 | 새 위치 |
| --- | --- |
| Gap Row, State Map, Manifest, QA Result Schema | [04-component-specs.md](./04-component-specs.md) |
| plan/copy/dev 책임 경계 | [03-workflow-contracts.md](./03-workflow-contracts.md) |
| source/deploy 경로 원칙 | [02-target-architecture.md](./02-target-architecture.md) |
| hook CommonJS와 reminder 우선 정책 | [04-component-specs.md](./04-component-specs.md), [05-implementation-plan.md](./05-implementation-plan.md) |
| readiness와 검증 방법 | [06-readiness-and-verification.md](./06-readiness-and-verification.md) |
| Turner 특화 사례 | [appendix/legacy-turner-mapping.md](./appendix/legacy-turner-mapping.md) |

## 7. 다음 액션

1. [06-readiness-and-verification.md](./06-readiness-and-verification.md)의 `Pre-Implementation Readiness`를 먼저 통과시킨다.
2. [05-implementation-plan.md](./05-implementation-plan.md)의 A-1부터 순서대로 구현한다.
3. 구현은 문서 변경과 코드 변경을 섞지 않고 실행 단위별로 나눈다.
4. 각 단계 완료 후 setup, quickstart, registry, generated output 검증을 기록한다.
