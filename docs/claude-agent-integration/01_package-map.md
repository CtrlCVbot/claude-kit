> [REVIEW 반영] claude-kit 아키텍처 리뷰 피드백 반영. P0: 소스 경로 수정 (.claude/ → src/claude/copy/), 레지스트리 연동 추가. P1: .plans/ 충돌 시나리오 문서화.

# Claude Agent 문서 패키지 맵

- 문서 ID: CAI-01
- 작성일: 2026-04-15
- 문서 상태: 초안 완료
- 기준 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 선행 문서: [00_docs-split-plan.md](./00_docs-split-plan.md)
- 목적: P18의 Claude Agent 적용 제안을 `docs/claude-agent-integration/` 하위 문서 패키지로 나누기 위한 책임 경계, 문서 관계, 추적성 규칙을 고정한다.

## 1. 문서 목적

이 문서는 Claude Agent 세부 문서 패키지의 지도 역할을 한다. P18이 “무엇을 도입할지”를 설명한다면, 이 문서는 “어떤 문서가 어떤 책임을 맡고, 기존 Turner 홈페이지 카피 문서와 어떻게 연결되는지”를 정의한다.

| 질문 | 이 문서의 답 |
| --- | --- |
| P18의 내용을 어떤 하위 문서가 책임지는가 | CAI-README, CAI-02~10 문서별 책임 경계 |
| 새 `plan` 기능은 어디에 들어가는가 | CAI-10이 plan 분석을 맡고, CAI-06/08/09가 운영 반영을 맡는다. |
| 기존 P0~P18과 충돌하지 않는가 | SSOT와 추적성 규칙 |
| `.claude` 구조와 어떻게 연결되는가 | agents, commands, hooks, rules, skills 매핑 |
| 실제 구현 전 무엇을 확인해야 하는가 | 문서 패키지 readiness와 사용자 gate |

## 2. 프로젝트 기준

이 문서 패키지는 일반 Claude Agent 도입 문서가 아니다. 기준은 Turner Construction 홈페이지를 원본과 최대한 동일하게 느껴지는 수준으로 정밀 카피하는 것이다.

| 기준 | 설명 |
| --- | --- |
| 원본 fidelity 우선 | visual, interaction, motion, responsive 차이를 줄이는 것이 agent 도입의 목적이다. |
| 실행 단위 유지 | 모든 실제 구현은 `계획 -> 피드백 -> 구현 -> 피드백 -> 검증 -> 피드백`을 따른다. |
| 사용자 gate 유지 | 대그룹, Phase, R 단계 종료 후 자동으로 다음 단계로 넘어가지 않는다. |
| 문서-증거 연결 | 모든 fidelity 판단은 기준 문서, screenshot/state evidence, QA 결과와 연결되어야 한다. |
| 구현 전 명세 | `.claude` 파일을 수정하기 전 agent/command/hook/rule 문서가 먼저 있어야 한다. |
| plan 전단계 | `/plan-*` 산출물은 fidelity gap을 구현 대상으로 확정하기 전의 선별, PRD, bridge 근거로만 사용한다. |

## 3. 문서 계층 구조

| 계층 | 문서 | 역할 |
| --- | --- | --- |
| Root index | [00_master-index.md](../../00_master-index.md) | 전체 프로젝트 문서 입구 |
| Root proposal | [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md) | Claude Agent 적용 상위 제안서 |
| Package plan | [00_docs-split-plan.md](./00_docs-split-plan.md) | 하위 문서 패키지 작성 계획 |
| Package map | `01_package-map.md` | 하위 문서 책임과 추적성 고정 |
| Agent specs | `02`~`05` | fidelity/reference/QA agent 상세 명세 |
| Workflow specs | `06`~`07` | command, hook, rule 설계 |
| Adoption docs | `08`~`09` | 도입 순서, readiness, gate |
| Plan integration | [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) | Claude Kit `plan` 기능 분석과 CAI 반영 기준 |
| Package README | `README.md` | 전체 하위 패키지 입구와 상태판 |

## 4. 단일 출처 규칙

| 주제 | 단일 출처 | 하위 문서 역할 |
| --- | --- | --- |
| 프로젝트 목표와 범위 | [01_project-charter.md](../../01_project-charter.md) | 목표 재정의 금지, 링크만 참조 |
| 원본 기준선 | [02_reference-baseline.md](../../02_reference-baseline.md) | reference agent가 캡처/상태 기준을 확장 |
| 구현 명세 | [03_design-spec.md](../../03_design-spec.md) | fidelity agent가 gap 분석 기준으로 사용 |
| QA 기준 | [05_qa-acceptance.md](../../05_qa-acceptance.md) | QA agent가 evidence 판정 기준으로 사용 |
| asset/variant handoff | [06_handoff-asset-swap.md](../../06_handoff-asset-swap.md) | handoff 관련 문서는 기존 기준을 재사용 |
| Phase 2 fidelity 보강 | [10_phase2-detail-fidelity-plan.md](../../10_phase2-detail-fidelity-plan.md) | visual/interaction agent spec의 핵심 입력 |
| Phase 2 실행 단위 | [11_phase2-execution-breakdown.md](../../11_phase2-execution-breakdown.md) | command workflow의 lifecycle 기준 |
| 후속 일정 | [12_post-phase2-remaining-roadmap.md](../../12_post-phase2-remaining-roadmap.md) | adoption roadmap의 외부 기준 |
| QA 자동화 | [15_r3-qa-automation-execution-plan.md](../../15_r3-qa-automation-execution-plan.md) | QA agent와 readiness 기준 |
| 운영 전환 | [17_r5-production-transition-execution-plan.md](../../17_r5-production-transition-execution-plan.md) | handoff, preview, ops 검증 기준 |
| Claude 적용 방향 | [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md) | 하위 문서의 상위 판단 기준 |
| plan workflow 반영 기준 | [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md) | `/plan-*`, `.plans/`, plan gate를 CAI 문서와 연결 |
| planning 산출물 후보 | `.plans/` | `.plans/`는 아직 미생성 상태이며, 생성 조건은 [CAI-09 `.plans/` 생성 게이트](./09_readiness-checklist.md#plans-생성-게이트-ssot)를 따른다. |

### `.plans/` 훅 충돌 시나리오

`.plans/`를 SSOT 후보로 지정할 경우, 기존 `plan-doc-guard.js`와 제안된 copy 훅(`copy-gate-stop.js`, `copy-scope-guard.js`) 간 충돌 가능성이 있다. 아래 시나리오와 해결 방안을 사전 정의한다.

| 시나리오 | 충돌 설명 | 해결 방안 |
| --- | --- | --- |
| 시나리오 1: plan-doc-guard가 copy 워크플로우 중 `.plans/` 편집을 차단 | copy 워크플로우 실행 중 `.plans/` 산출물을 갱신해야 하는 경우, `plan-doc-guard.js`가 planning 문서 무결성 검증 목적으로 편집을 차단할 수 있다. | 이벤트 스코프 분리: `plan-doc-guard.js`는 `.plans/` 경로만 감시하고, copy 훅은 copy 실행 단위(execution unit) 범위만 감시한다. copy 워크플로우가 `.plans/`에 접근할 때는 plan 도메인의 게이트를 명시적으로 통과해야 한다. |
| 시나리오 2: copy-gate-stop이 plan 커맨드 실행 중 트리거 | `/plan-bridge` 등 plan 커맨드가 copy 도메인으로 핸드오프하는 과정에서 `copy-gate-stop.js`가 단계 자동 진행을 차단할 수 있다. | 관심사 분리: `copy-gate-stop.js`는 copy 실행 단위의 Phase 전환만 차단한다. plan 커맨드의 실행 흐름은 `plan-doc-guard.js`가 관할하며, copy 훅은 plan 커맨드 컨텍스트에서 비활성화된다. |
| 해결 원칙 | — | 이벤트 스코프 격리(event scope isolation): plan 훅은 `.plans/` 경로와 plan 커맨드 실행을 감시하고, copy 훅은 copy 실행 단위를 감시한다. 두 도메인의 훅이 동일 이벤트에서 동시 발동하지 않도록 이벤트 필터를 설정한다. |

## 5. 하위 문서 책임 맵

| 문서 | 책임 | 책임지지 않는 것 |
| --- | --- | --- |
| `README.md` | 하위 문서 상태판, 읽기 순서, 빠른 진입점 | agent별 상세 prompt |
| `01_package-map.md` | 문서 관계, SSOT, 추적성, 책임 경계 | 개별 agent 상세 동작 |
| `02_copy-fidelity-agent-spec.md` | visual gap 분석 agent 명세 | hover/sticky timing 상세 |
| `03_interaction-fidelity-agent-spec.md` | hover/open/sticky/state transition agent 명세 | typography/spacing 수치 분석 |
| `04_reference-baseline-agent-spec.md` | live/current capture manifest와 기준선 수집 규칙 | 실제 Playwright 구현 |
| `05_qa-review-agent-spec.md` | build, variant guard, screenshot/state evidence 판정 | agent 구현 순서 결정 |
| `06_command-workflow-spec.md` | `/copy-*` command와 실행 단위 lifecycle | hook blocking 정책 |
| `07_hooks-and-rules-plan.md` | hooks/rules 후보, blocking/reminder 기준 | command 입출력 상세 |
| `08_adoption-roadmap.md` | 단계별 도입 순서, gate, commit 전략 | 개별 agent prompt 전문 |
| `09_readiness-checklist.md` | 실제 `.claude` 수정 전 완료 판정 | 장기 확장 아이디어 |
| `10_plan-workflow-integration-plan.md` | plan 기능 분석, 기존 CAI 영향도, `.plans/` gate, `/plan-* -> /copy-* -> /dev-*` 연결 기준 | 실제 `.plans/` 생성 또는 `.claude` 구현 수정 |

## 6. P18 내용 분배 맵

| P18 섹션 | 유지 위치 | 상세 이동 위치 |
| --- | --- | --- |
| 1~3. 목적/프로젝트 진행 방식 | P18 유지 | README, CAI-01에서 요약 |
| 4. Claude Kit 요약 | P18 요약 유지 | CAI-01에서 구조 관계로 재정리 |
| 5. `.claude` 구조 분석 | P18 요약 유지 | CAI-01, CAI-07 |
| 6. 파이프라인 매핑 | P18 요약 유지 | CAI-01, CAI-06 |
| 7~8. 개선안 목록/상세 | P18 요약 유지 | CAI-02~05, CAI-08 |
| 9. 충돌 가능성 | P18 요약 유지 | CAI-07, CAI-08, CAI-09 |
| 10~11. 도입 전략/우선순위 | P18 요약 유지 | CAI-08 |
| 12. 파일/폴더 변경 제안 | P18 요약 유지 | CAI-06, CAI-07 |
| 13. agent 설계 초안 | P18 요약 유지 | CAI-02~05 |
| 14~15. 운영 흐름/검증 | P18 요약 유지 | CAI-05, CAI-06, CAI-09 |
| 16~22. 리스크/다음 단계 | P18 요약 유지 | CAI-08, CAI-09 |
| plan 기능 추가 영향 | P18에는 요약 링크만 유지 | CAI-10, CAI-06, CAI-08, CAI-09 |

## 7. `.claude` 구조 매핑

> **경로 규칙**: claude-kit에서 `src/claude/{domain}/{type}/`가 소스이며, `pnpm claude-kit:setup` 실행 시 `.claude/{type}/`로 배포된다. 아래 표에서 "소스"는 개발자가 편집하는 실제 파일 위치이고, "배포"는 Claude가 런타임에 참조하는 경로이다.

| `.claude` 영역 | 소스 경로 | 배포 경로 | 현재 역할 | CAI 문서 연결 | 도입 전 조건 |
| --- | --- | --- | --- | --- | --- |
| agents (dev/copy) | `src/claude/copy/agents/` | `.claude/agents/` | dev-architect, code-reviewer, doc-updater, verify-agent 등 | CAI-02~05 | agent spec 승인 |
| commands (dev/copy) | `src/claude/copy/commands/` | `.claude/commands/` | `/dev-feature`, `/dev-run`, `/dev-verify`, `/dev-commit` 등 | CAI-06 | command workflow 승인 |
| hooks (dev/copy) | `src/claude/copy/hooks/` | `.claude/hooks/` | scope guard, TDD guard, edit tracker, security trigger 등 | CAI-07 | blocking/reminder 정책 승인 |
| rules (dev/copy) | `src/claude/copy/rules/` | `.claude/rules/` | coding, interaction, security, verification 규칙 | CAI-07 | copy fidelity rule 승인 |
| settings.json | — | `.claude/settings.json` | permissions, hooks, env | CAI-07, CAI-09 | 설정 변경 리스크 검토 |
| skills | — | `.claude/skills/` | dev workflow, testing, verification, session-wrap | CAI-06, CAI-09 | 기존 skill과 중복 여부 검토 |
| commands (plan) | `src/claude/plan/commands/` | `.claude/commands/plan-*.md` | idea, screening, draft, PRD, wireframe, stitch, bridge, review, archive, improve | CAI-10, CAI-06 | copy/dev workflow와 책임 경계 검토 |
| agents (plan) | `src/claude/plan/agents/` | `.claude/agents/plan-*.md` | idea collector, screener, PRD writer, wireframe designer, stitch integrator, reviewer | CAI-10, CAI-02~05 | fidelity gap 선별과 사용자 gate 연결 |
| hooks (plan) | `src/claude/plan/hooks/` | `.claude/hooks/plan-doc-guard.js` | planning 문서 구조 검증과 planning 중 code edit 차단 의도 | CAI-07, CAI-09, CAI-10 | 실제 차단 범위와 copy hook 충돌 검증 |
| `.plans/` | — | `.plans/` | plan command 산출물 root 후보 | CAI-10, CAI-09 | 아직 미생성, 사용자 승인 후 생성 |

### claude-kit 레지스트리 연동

copy 도메인 도입 시 claude-kit 레지스트리 파일과의 연동이 필요하다.

| 레지스트리 파일 | 위치 | 연동 내용 |
| --- | --- | --- |
| `exception-registry.json` | `src/claude/_meta/` | copy 도메인 훅의 Codex 호환성 예외 등록 필요. 훅은 이벤트 모델이 Claude/Codex 간 다르므로 `copy-gate-stop.js`, `copy-scope-guard.js` 등의 예외를 사전 등록한다. |
| `pairing-registry.json` | `src/claude/_meta/` | copy 컴포넌트의 Claude↔Codex 페어링 상태 추적. 에이전트/커맨드/룰은 전환이 용이하므로 `paired` 상태로, 훅은 `exception` 상태로 등록한다. |
| `codex-portability.json` | `src/claude/_meta/` | copy 컴포넌트 전환 전략 결정. 컴포넌트별 Codex 전환 가능 여부와 전환 방식(direct/adapt/exception)을 정의한다. |

## 8. 기존 카피 파이프라인 매핑

| 기존 단계 | 현재 문서/산출물 | Claude Agent 문서 연결 |
| --- | --- | --- |
| A 기준선 수집 | P2, reference captures | CAI-04 |
| Phase 0 Reference Refresh | P11, phase0 output | CAI-04, CAI-06 |
| Phase 1 Navigation Fidelity | P10/P11, header evidence | CAI-03 |
| Phase 2 Hero Fidelity | P10/P11, hero capture | CAI-02 |
| Phase 3 Section Rhythm | P10/P11, rhythm evidence | CAI-02 |
| Phase 4 Commitments Fidelity | P10/P11, commitments states | CAI-03 |
| Phase 5 Responsive Precision | P11, responsive evidence | CAI-02, CAI-04 |
| Phase 6 QA Refresh | P5, phase6 QA docs | CAI-05 |
| R3 QA 자동화 | P15, R3 reports/scripts | CAI-05, CAI-06 |
| R4 variant 운영 | P16, R4 reports | CAI-08, CAI-09 |
| R5 운영 전환 | P17, R5 reports | CAI-05, CAI-08, CAI-09 |
| Claude Kit plan 도입 | CAI-10, `.claude/commands/plan-*` | CAI-06, CAI-08, CAI-09 |

## 9. 추적성 규칙

| 출발 | 도착 | 추적 기준 |
| --- | --- | --- |
| P18 추천 agent | CAI-02~05 | 각 agent spec이 P18의 추천 목적을 잃지 않아야 한다. |
| P10/P11 fidelity gap | CAI-02~03 | visual/interaction agent는 기존 gap 구조를 확장해야 한다. |
| P2 reference baseline | CAI-04 | 기준 viewport와 state naming이 일관되어야 한다. |
| P5/P15 QA 기준 | CAI-05 | screenshot/state evidence 판정 규칙이 기존 QA와 연결되어야 한다. |
| 실행 단위 lifecycle | CAI-06 | command workflow가 6단계 lifecycle을 누락하지 않아야 한다. |
| 사용자 gate | CAI-08~09 | adoption과 readiness가 `승인 대기` 상태를 보존해야 한다. |
| `.claude` 변경 후보 | CAI-07 | hook/rule 변경은 위험도와 blocking 여부가 있어야 한다. |
| plan 산출물 후보 | CAI-10, CAI-06, CAI-09 | `.plans/` 생성과 `/plan-*` 실행은 사용자 승인 gate 이후에만 진행한다. |
| `/plan-*` workflow | CAI-06, CAI-08 | plan은 pre-stage, copy는 fidelity evidence/gap 분석, dev는 구현으로 구분한다. |

## 10. 문서 작성 순서와 의존성

| 순서 | 문서 | 선행 | 후행 영향 |
| --- | --- | --- | --- |
| 1 | `01_package-map.md` | CAI-00 | 모든 하위 문서의 책임 경계 |
| 2 | `README.md` 초안 | CAI-01 | 탐색성과 상태판 |
| 3 | `02_copy-fidelity-agent-spec.md` | CAI-01 | visual command, QA checklist |
| 4 | `03_interaction-fidelity-agent-spec.md` | CAI-01 | interaction command, hooks/rules |
| 5 | `04_reference-baseline-agent-spec.md` | CAI-01 | QA agent, command workflow |
| 6 | `05_qa-review-agent-spec.md` | CAI-02~04 | readiness checklist |
| 7 | `06_command-workflow-spec.md` | CAI-02~05 | hooks/rules, adoption roadmap |
| 8 | `07_hooks-and-rules-plan.md` | CAI-06 | readiness checklist |
| 9 | `08_adoption-roadmap.md` | CAI-02~07, CAI-10 | 사용자 승인 gate |
| 10 | `09_readiness-checklist.md` | CAI-01~08, CAI-10 | 구현 착수 승인 |
| 11 | `10_plan-workflow-integration-plan.md` | Claude Kit plan 기능 확인 | CAI-06/08/09 반영 |
| 12 | `README.md` 최종화 | 전체 | 문서 패키지 마감 |

## 11. 사용자 gate 규칙

| Gate | 시점 | 확인 내용 | 다음 단계 조건 |
| --- | --- | --- | --- |
| Gate 1 | CAI-01 작성 후 | 문서 패키지 책임 경계가 맞는지 | README 초안 작성 |
| Gate 2 | CAI-02~05 작성 후 | agent spec이 홈페이지 카피 목적에 맞는지 | command workflow 작성 |
| Gate 3 | CAI-06~07 작성 후 | command/hook/rule이 기존 운영 규칙과 충돌하지 않는지 | adoption roadmap 작성 |
| Gate 4 | CAI-08~09 작성 후 | 실제 `.claude` 구현 준비가 됐는지 | 구현 라운드 착수 |
| Gate 5 | `.plans/` 생성 또는 첫 `/plan-*` 실행 전 | plan 산출물 tree를 운영 기준으로 받아들일지 | plan command 실행 |

현재 사용자의 “계획서대로 진행” 승인은 CAI 문서 패키지 작성 승인으로 해석한다. 실제 `.claude` agent/command/hook 구현은 CAI-09 readiness 이후 별도 승인을 받아야 한다.

## 12. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| P18의 주요 주제와 하위 문서 매핑 | 완료 |
| 기존 P0~P18 SSOT와 충돌 여부 | 충돌 없음 |
| `.claude` 구조와 문서 연결 | agents/commands/hooks/rules/skills 모두 연결 |
| plan workflow 구조와 문서 연결 | CAI-10, CAI-06, CAI-08, CAI-09에 반영 |
| 홈페이지 정밀 카피 목적 반영 | visual/interaction/reference/QA 축으로 반영 |
| 사용자 gate 유지 | CAI-08/09 이전 실제 구현 금지로 명시 |

## 13. 남은 이슈

| 이슈 | 처리 |
| --- | --- |
| 하위 문서 내용은 작성 완료 | README와 CAI-02~10에서 plan 연결까지 반영 완료 |
| 실제 `.claude` 구현은 아직 범위 밖 | CAI-09 readiness 이후 별도 승인 필요 |
| `.plans/` 산출물은 아직 미생성 | 첫 `/plan-*` 실행 전 사용자 승인 필요 |
| R3 screenshot diff와 CAI QA schema의 세부 정합성 | CAI-05에서 상세 검증 |
