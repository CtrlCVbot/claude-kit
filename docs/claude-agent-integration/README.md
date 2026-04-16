> [REVIEW 반영] claude-kit 아키텍처 리뷰 피드백 반영. copy 도메인 경로 수정, claude-kit 도메인 매핑 추가.

# Claude Agent Integration 문서 패키지

- 패키지 경로: `docs/claude-agent-integration/`
- 패키지 상태: 1차 문서 패키지 완료 + plan workflow 통합 기준 반영
- 기준 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 작성 계획: [00_docs-split-plan.md](./00_docs-split-plan.md)
- 문서 맵: [01_package-map.md](./01_package-map.md)
- plan 통합 기준: [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)
- 목적: Turner Construction 홈페이지 정밀 카피 프로젝트에 Claude Agent 기능을 안전하게 도입하기 위한 상세 명세 문서 패키지다.

## 1. 패키지 목적

이 문서 패키지는 P18의 상위 제안을 실무 문서로 분리한다. 목표는 Claude Agent를 일반 개발 자동화가 아니라 `원본 홈페이지 정밀 카피 품질 개선 체계`로 도입하는 것이다.

| 목적 | 설명 |
| --- | --- |
| 카피 품질 중심화 | visual, interaction, reference, QA 기준을 agent별로 분리한다. |
| 구현 전 명세화 | `.claude` 파일 수정 전에 agent/command/hook/rule 기준을 문서로 고정한다. |
| gate 유지 | 사용자 승인 없이 다음 대그룹, Phase, R 단계로 넘어가지 않는 규칙을 유지한다. |
| 추적성 유지 | P0~P18, Phase 2, R3/R5 문서와 Claude Agent 문서를 연결한다. |
| plan pre-stage 반영 | 새로 추가된 `/plan-*` 흐름을 fidelity gap 선별, PRD, bridge, 사용자 gate와 연결한다. |

## 2. 현재 상태판

| 문서 | 상태 | 역할 |
| --- | --- | --- |
| [00_docs-split-plan.md](./00_docs-split-plan.md) | 완료 | P18을 하위 문서 패키지로 나누는 계획 |
| [01_package-map.md](./01_package-map.md) | 완료 | 문서 관계, SSOT, 추적성, 책임 경계 |
| [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md) | 완료 | visual fidelity agent 명세 |
| [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md) | 완료 | hover/open/sticky/state agent 명세 |
| [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md) | 완료 | reference capture/manifest agent 명세 |
| [05_qa-review-agent-spec.md](./05_qa-review-agent-spec.md) | 완료 | QA/evidence 검증 agent 명세 |
| [06_command-workflow-spec.md](./06_command-workflow-spec.md) | 완료 | `/copy-*` command lifecycle 명세 |
| [07_hooks-and-rules-plan.md](./07_hooks-and-rules-plan.md) | 완료 | hooks/rules 도입 계획 |
| [08_adoption-roadmap.md](./08_adoption-roadmap.md) | 완료 | 단계별 도입 로드맵 |
| [09_readiness-checklist.md](./09_readiness-checklist.md) | 완료 | `.claude` 수정 전 readiness checklist |
| [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) | 완료 | Claude Kit `plan` 기능 분석과 기존 CAI 반영 기준 |

## 3. 추천 읽기 순서

| 순서 | 문서 | 이유 |
| --- | --- | --- |
| 1 | [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md) | Claude Agent 적용 전체 방향을 이해한다. |
| 2 | [00_docs-split-plan.md](./00_docs-split-plan.md) | 왜 하위 문서 패키지로 분리했는지 확인한다. |
| 3 | [01_package-map.md](./01_package-map.md) | 기존 문서와 `.claude` 구조의 관계를 확인한다. |
| 4 | [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) | 새 `plan` 기능이 CAI 문서와 copy workflow에 어떤 영향을 주는지 확인한다. |
| 5 | [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md) | visual fidelity agent 설계를 확인한다. |
| 6 | [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md) | interaction fidelity agent 설계를 확인한다. |
| 7 | [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md) | reference baseline agent 설계를 확인한다. |
| 8 | [05_qa-review-agent-spec.md](./05_qa-review-agent-spec.md) | QA review agent 설계를 확인한다. |
| 9 | [06_command-workflow-spec.md](./06_command-workflow-spec.md) | `/plan-*`, `/copy-*`, `/dev-*` lifecycle과 실행 단위 연결을 확인한다. |
| 10 | [07_hooks-and-rules-plan.md](./07_hooks-and-rules-plan.md) | hook/rule의 blocking/reminder 정책과 `plan-doc-guard.js` 영향을 확인한다. |
| 11 | [08_adoption-roadmap.md](./08_adoption-roadmap.md) | 실제 도입 순서와 gate를 확인한다. |
| 12 | [09_readiness-checklist.md](./09_readiness-checklist.md) | `.claude` 수정 전 준비 완료 여부를 판단한다. |

## 4. 핵심 운영 원칙

| 원칙 | 설명 |
| --- | --- |
| 원본 fidelity 우선 | agent의 성공 기준은 Turner 원본 대비 체감 차이를 줄이는 것이다. |
| capture-first | 기준선이나 evidence 없이 구현 제안을 먼저 하지 않는다. |
| state-first | 정적 full-page뿐 아니라 hover/open/sticky/state를 독립 검증한다. |
| 문서 먼저 | `.claude/agents` (claude-kit 소스: src/claude/copy/agents/), `.claude/commands` (claude-kit 소스: src/claude/copy/commands/), `.claude/hooks` (claude-kit 소스: src/claude/copy/hooks/), `.claude/rules` (claude-kit 소스: src/claude/copy/rules/) 수정 전 명세를 먼저 작성한다. |
| plan은 전단계 | `/plan-*`은 fidelity gap을 실행 대상으로 확정하기 전의 선별, PRD, bridge 단계로 사용한다. |
| 사용자 gate | Phase/R 종료와 실제 `.claude` 구현 전에는 사용자 확인을 받는다. |

## 5. 작성 진행 순서

| 실행 단위 | 문서 | 상태 |
| --- | --- | --- |
| CAI-00-01 | `00_docs-split-plan.md` | 완료 |
| CAI-01-01 | `01_package-map.md` | 완료 |
| CAI-README-01 | `README.md` 초안 | 완료 |
| CAI-02-01 | `02_copy-fidelity-agent-spec.md` | 완료 |
| CAI-03-01 | `03_interaction-fidelity-agent-spec.md` | 완료 |
| CAI-04-01 | `04_reference-baseline-agent-spec.md` | 완료 |
| CAI-05-01 | `05_qa-review-agent-spec.md` | 완료 |
| CAI-06-01 | `06_command-workflow-spec.md` | 완료 |
| CAI-07-01 | `07_hooks-and-rules-plan.md` | 완료 |
| CAI-08-01 | `08_adoption-roadmap.md` | 완료 |
| CAI-09-01 | `09_readiness-checklist.md` | 완료 |
| PLAN-CAI-01 | `10_plan-workflow-integration-plan.md` | 완료 |
| PLAN-CAI-02~04 | README/01/06/07/08/09 plan 반영 | 완료 |
| PLAN-CAI-05 | 02~05 plan 연결 지점 반영 | 완료 |
| CAI-README-02 | `README.md` 최종화 | 완료 |

## 6. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 현재 존재하는 문서 링크 | 정상 |
| 하위 문서 링크 | 전체 존재 확인 대상으로 전환 |
| P18 상위 제안서 연결 | 정상 |
| 홈페이지 정밀 카피 목적 반영 | 정상 |
| 실제 `.claude` 구현 분리 | 정상 |
| plan workflow 연결 | CAI-10과 00~09 문서에 반영 |

## 7. 남은 이슈

| 이슈 | 처리 계획 |
| --- | --- |
| 실제 `.claude` 구현은 아직 범위 밖 | readiness checklist 이후 별도 승인 필요 |
| `.plans/` 산출물 생성 | 첫 `/plan-*` 실행 전 별도 사용자 승인 필요 |
| 첫 구현 라운드 범위 | CAI-09 기준으로 사용자 Gate A 승인 후 A0 plan alignment 또는 A1 copy rules부터 진행 권장 |

## 8. claude-kit 도메인 매핑

copy 도메인의 컴포넌트 소스는 `src/claude/copy/` 아래에 위치하며, 하위 디렉토리 구조는 다음과 같다.

| 소스 경로 | 배포 경로 | 설명 |
| --- | --- | --- |
| `src/claude/copy/agents/` | `.claude/agents/` | copy 도메인 에이전트 |
| `src/claude/copy/commands/` | `.claude/commands/` | copy 도메인 커맨드 |
| `src/claude/copy/hooks/` | `.claude/hooks/` | copy 도메인 훅 |
| `src/claude/copy/rules/` | `.claude/rules/` | copy 도메인 룰 |
| `src/claude/copy/skills/` | `.claude/skills/` | copy 도메인 스킬 |

`pnpm claude-kit:setup` 실행 시 `src/claude/copy/` 하위의 모든 컴포넌트가 `.claude/` 대응 디렉토리로 복사된다. 따라서 `.claude/` 경로는 생성된 출력물이며, 실제 소스 수정은 `src/claude/copy/` 에서 수행해야 한다.
