# Scope and Decisions

- 문서 ID: CAI-01
- 목적: `claude-kit`의 `copy` 도메인 범위, 비범위, 책임 경계, 결정 기록을 고정한다.
- 선행 문서: [README.md](./README.md)
- 후행 문서: [02-target-architecture.md](./02-target-architecture.md), [03-workflow-contracts.md](./03-workflow-contracts.md)

## 1. copy 도메인 정의

`copy` 도메인은 기준 화면(reference)과 현재 구현(current)을 비교해 충실도 개선 workflow를 표준화하는 `claude-kit` 선택 도메인이다.

| 포함 영역 | 설명 |
| --- | --- |
| visual fidelity | layout, typography, spacing, density, component treatment 차이 분석 |
| interaction fidelity | hover, sticky, open/close, state transition, timing 차이 분석 |
| reference baseline | viewport, state, capture naming, manifest, pairing matrix 관리 |
| copy QA | screenshot/state evidence, variant guard, readiness report 검증 |
| copy workflow | `/copy-*` command, copy-specific rules, reminder hooks, reusable skills |

## 2. 비범위

| 비범위 | 이유 |
| --- | --- |
| 특정 고객 사이트 구현 | `copy` 도메인은 package-level capability이며 개별 앱 구현이 아니다. |
| 실제 Playwright screenshot 수집 구현 | evidence runner는 후속 project-level 또는 별도 skill/script에서 다룬다. |
| 원본 fidelity 최종 승인 | 최종 승인과 취향 판단은 사용자 gate에 남긴다. |
| `dev` 도메인 대체 | build/test/lint/TDD 구현 workflow는 계속 `dev`가 담당한다. |
| `plan` 도메인 대체 | idea screening, PRD, bridge는 계속 `plan`이 담당한다. |

## 3. 도메인 책임 경계

| 도메인 | 책임 | 책임지지 않는 것 |
| --- | --- | --- |
| `core` | 공통 rules, hooks, skills, target output 기반 | copy-specific schema 또는 QA 판단 |
| `dev` | 구현, TDD, build/test/lint, feature package | reference/current fidelity gap 분석 |
| `plan` | idea, screening, PRD, wireframe, stitch, bridge | screenshot evidence 판정 또는 구현 |
| `copy` | evidence/gap/QA/gate contract, copy-specific commands | code implementation과 최종 사용자 승인 |

## 4. 결정 기록

| 결정 | 내용 | 근거 | 상태 |
| --- | --- | --- | --- |
| D1 | `copy`는 `claude-kit` opt-in domain으로 설계한다. | 현재 기본 domain은 `core`, `dev`이고 `plan`도 opt-in이다. | 채택 |
| D2 | 본문에서 Turner/P문서/R문서 의존을 제거한다. | 도메인 문서가 특정 프로젝트에 묶이면 package 재사용성이 떨어진다. | 채택 |
| D3 | Turner 관련 내용은 appendix 사례로만 보존한다. | 기존 문서의 schema/사례 가치를 보존하면서 본문 drift를 줄인다. | 채택 |
| D4 | 실제 source는 `src/claude/copy/*`로 두고 `.claude/*`는 generated output으로만 설명한다. | `claude-kit`의 source/deploy 모델과 일치한다. | 채택 |
| D5 | 신규 hooks는 reminder 우선으로 도입한다. | copy 작업은 시각 판단과 evidence context가 많아 early blocking의 false positive 위험이 크다. | 채택 |
| D6 | Codex target hooks는 예외/검증 대상으로 시작한다. | 기존 portability manifest도 hook 지원을 제한적으로 다룬다. | 채택 |

## 5. 피드백 반영 기준

| 피드백 | 반영 방식 |
| --- | --- |
| 문서 목적 혼재 | scope 문서에서 package-level 도메인과 legacy 사례를 명시 분리 |
| 실제 repo 구조와 가정 불일치 | `src/claude/copy`가 아직 없음을 전제로 선언 |
| 링크 신뢰도 낮음 | 본문 링크는 새 문서와 존재하는 archive/root 파일로 제한 |
| 완료/readiness 충돌 | 상태를 "재작성 완료, 구현 미착수"로 정정 |
| 의사결정/실행 계획 중복 | 결정 기록은 이 문서, 실행 계획은 `05`, 검증은 `06`으로 분리 |

## 6. Open Questions

| 질문 | 기본 제안 | 결정 필요 시점 |
| --- | --- | --- |
| `copy`를 profile 기본 domain에 포함할까? | 기본값에는 넣지 않고 opt-in으로 유지 | A-1 구현 전 |
| Hybrid Feature를 독립 유형으로 둘까? | 문서상 `copy-reference-only` mode로 처리하고 유형은 `copy/dev` 2개로 단순화 | command 구현 전 |
| Codex target에서 copy hooks를 배포할까? | 초기에는 portability manifest에 `paired-review` 또는 `blocked`로 등록 | registry 구현 전 |
| screenshot runner까지 포함할까? | `copy` 도메인 v1에서는 runner contract만 두고 구현은 제외 | agent/command 구현 전 |

## 7. 완료 기준

| 기준 | 상태 |
| --- | --- |
| `copy` 도메인의 목적과 비범위가 분리됨 | 완료 |
| `core`, `dev`, `plan`, `copy` 책임 경계가 정의됨 | 완료 |
| Turner 사례가 본문 기준에서 제거됨 | 완료 |
| high 피드백의 반영 방향이 명시됨 | 완료 |
