> [REVIEW 반영] claude-kit 아키텍처 리뷰 피드백 반영. 경로 참조 보정.

# Claude Agent 문서 패키지 분리 및 상세화 계획서

- 문서 ID: CAI-00
- 작성일: 2026-04-15
- 문서 상태: 작성 계획
- 기준 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 권장 패키지 경로: `docs/claude-agent-integration/`
- 목적: P18의 Claude Agent 적용 제안을 실무에서 재사용 가능한 세부 문서 패키지로 분리하기 위한 구조, 순서, 추적성, 검증 기준을 정의한다.

> 2026-04-15 보강: Claude Kit에 `plan` 도메인이 활성화되어 [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)를 CAI 패키지에 추가한다. 이 문서는 기존 00~09 구조를 대체하지 않고, `/plan-*` 흐름을 기존 copy/dev workflow와 연결하는 반영 기준으로 사용한다.

## 1. 문서 분리 목적

P18은 Claude Agent 적용 방향을 한 번에 이해하기 위한 상위 제안서다. 다만 실제 도입 단계에서는 agent별 역할, command workflow, hooks/rules, QA readiness, adoption roadmap이 서로 다른 독자와 다른 실행 타이밍을 갖기 때문에 한 문서 안에 계속 누적하면 운영성이 떨어진다.

| 분리 이유 | 설명 |
| --- | --- |
| 독자 분리 | 기획/문서 담당자는 package map을, 구현자는 agent spec을, QA 담당자는 readiness/checklist를 먼저 봐야 한다. |
| 실행 단위화 | Claude Agent 도입을 `계획 -> 설계 -> 검증 -> 구현` 단위로 쪼개기 쉽다. |
| 중복 방지 | P18은 상위 판단 문서로 남기고, 반복 참조되는 상세 기준은 하위 문서로 내린다. |
| 품질 기준 강화 | Turner 홈페이지 정밀 카피 목적에 맞춰 visual/interaction/reference/QA 기준을 각각 독립적으로 다룬다. |
| gate 유지 | 사용자 승인 gate와 실행 단위 commit 규칙을 하위 문서마다 명확히 붙일 수 있다. |

분리 후 기대 효과는 아래와 같다.

| 기대 효과 | 결과 |
| --- | --- |
| 탐색성 개선 | `docs/claude-agent-integration/README.md`만 보면 하위 문서 위치를 알 수 있다. |
| 적용 준비도 개선 | agent 구현 전 필요한 spec, command, hook, checklist를 선행 문서로 잠글 수 있다. |
| fidelity 중심성 유지 | 모든 문서가 홈페이지 정밀 카피 품질 개선 효과를 기준으로 작성된다. |
| 후속 구현 안정화 | 실제 `.claude/agents` (소스: src/claude/copy/agents/), `.claude/commands` (소스: src/claude/copy/commands/), `.claude/hooks` (소스: src/claude/copy/hooks/), `.claude/rules` (소스: src/claude/copy/rules/) 수정 전에 검토 가능한 기준이 생긴다. |

## 2. 현재 P18의 내용 구조 분석

P18에는 상위 전략, Claude Kit 분석, `.claude` 구조 분석, agent 후보, command/hook 후보, 리스크, 다음 실행 계획이 함께 들어 있다.

| P18 주제 | 현재 위치 | 분리 판단 |
| --- | --- | --- |
| 프로젝트 목적과 Claude Agent 도입 배경 | 1~3장 | P18에 유지 |
| Claude Kit / `.claude` 구조 분석 | 4~6장 | package map 문서로 요약 이전 |
| 적용 가능한 agent 개선안 | 7~8장 | agent spec 문서들로 상세 이전 |
| 기존 파이프라인 충돌 지점 | 9장 | package map + adoption roadmap으로 분리 |
| 추천 도입 전략과 우선순위 | 10~11장 | adoption roadmap으로 상세 이전 |
| 파일/폴더 변경 제안 | 12장 | command/workflow, hooks/rules 문서로 분리 |
| 추천 agent 설계 초안 | 13장 | agent별 spec 문서로 분리 |
| 운영 흐름과 검증 계획 | 14~15장 | command workflow + readiness checklist로 분리 |
| 리스크와 대응 | 16장 | adoption roadmap + readiness checklist로 분리 |
| 다음 단계 실행 계획 | 17~22장 | README, roadmap, checklist로 분리 |

### P18에 남길 내용

| 남길 내용 | 이유 |
| --- | --- |
| 프로젝트 핵심 목적 | 하위 문서의 해석 기준 |
| Claude Agent 적용 전체 방향 | 상위 의사결정 문서 역할 |
| 하위 문서 패키지 링크 | 탐색 입구 역할 |
| 최종 추천안 요약 | 사용자 승인 전 빠른 판단 기준 |
| 사용자 gate 원칙 | 하위 문서가 늘어나도 운영 원칙을 유지하기 위함 |

### `docs/claude-agent-integration/`로 내릴 내용

| 내릴 내용 | 대상 문서 |
| --- | --- |
| 패키지 전체 구조와 문서 관계 | `README.md`, `01_package-map.md` |
| visual fidelity agent 상세 | `02_copy-fidelity-agent-spec.md` |
| interaction fidelity agent 상세 | `03_interaction-fidelity-agent-spec.md` |
| reference baseline agent 상세 | `04_reference-baseline-agent-spec.md` |
| QA review agent 상세 | `05_qa-review-agent-spec.md` |
| command workflow 상세 | `06_command-workflow-spec.md` |
| hooks/rules 상세 | `07_hooks-and-rules-plan.md` |
| 도입 일정과 gate | `08_adoption-roadmap.md` |
| 구현 전 readiness | `09_readiness-checklist.md` |

## 3. 제안 폴더/문서 패키지 구조

권장 root는 `docs/claude-agent-integration/`이다. 루트에는 P18만 상위 제안서로 유지하고, 세부 문서는 모두 이 폴더 아래에 둔다.

```text
docs/
└─ claude-agent-integration/
   ├─ 00_docs-split-plan.md
   ├─ README.md
   ├─ 01_package-map.md
   ├─ 02_copy-fidelity-agent-spec.md
   ├─ 03_interaction-fidelity-agent-spec.md
   ├─ 04_reference-baseline-agent-spec.md
   ├─ 05_qa-review-agent-spec.md
   ├─ 06_command-workflow-spec.md
   ├─ 07_hooks-and-rules-plan.md
   ├─ 08_adoption-roadmap.md
   ├─ 09_readiness-checklist.md
   ├─ 10_plan-workflow-integration-plan.md
   ├─ 11_work-breakdown-structure.md
   ├─ 12_pipeline-integration-diagram.md
   └─ 13_pipeline-order-analysis.md
```

| 파일 | 역할 |
| --- | --- |
| `00_docs-split-plan.md` | 지금 작성하는 분리 계획서. 실제 하위 문서 작성 전 승인 기준이다. |
| `README.md` | 하위 문서 패키지의 입구와 읽기 순서. |
| `01_package-map.md` | P18, P0, `.claude`, P10/P11/P15/P17과의 관계 맵. |
| `02_copy-fidelity-agent-spec.md` | visual fidelity agent의 목적, 입력, 출력, 판단 기준. |
| `03_interaction-fidelity-agent-spec.md` | hover/open/sticky/scroll/state transition agent 기준. |
| `04_reference-baseline-agent-spec.md` | live/current 캡처, viewport, state manifest 기준. |
| `05_qa-review-agent-spec.md` | screenshot diff, interactive evidence, build/variant guard 검증 기준. |
| `06_command-workflow-spec.md` | `/copy-*` command와 실행 단위 lifecycle 연결. |
| `07_hooks-and-rules-plan.md` | hooks/rules 추가 후보와 blocking/reminder 정책. |
| `08_adoption-roadmap.md` | Claude Agent 도입 순서, gate, commit 단위 계획. |
| `09_readiness-checklist.md` | 실제 `.claude` 수정 전 준비 완료 판정 체크리스트. |
| `10_plan-workflow-integration-plan.md` | Claude Kit `plan` 기능을 CAI 패키지와 Turner 카피 workflow에 반영하기 위한 분석 및 실행 계획. |

## 4. 각 문서별 상세 정의

| 문서 ID | 파일 경로 | 목적 | 주요 독자 | 포함 범위 | 제외 범위 | 입력 문서 | 출력 산출물 | 완료 기준 | 검증 방법 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAI-README | `docs/claude-agent-integration/README.md` | 문서 패키지 입구와 읽기 순서 제공 | 전체 팀 | 문서 맵, 상태판, 읽기 순서, gate 요약 | 세부 agent prompt 전문 | P18, CAI-00 | 패키지 인덱스 | 모든 하위 문서 링크와 역할이 보임 | 링크 존재 확인 |
| CAI-01 | `docs/claude-agent-integration/01_package-map.md` | P18과 하위 문서, `.claude`, 기존 P문서 관계 정리 | 기획/운영/구현자 | 문서 관계, 추적성, SSOT 규칙 | agent별 상세 prompt | P0, P18, P10, P11, P15, P17 | package map | 중복/충돌 없이 관계가 설명됨 | 추적성 self-review |
| CAI-02 | `docs/claude-agent-integration/02_copy-fidelity-agent-spec.md` | visual fidelity agent 설계 | 디자인/프론트엔드 | layout, typography, spacing, card, CTA, divider 분석 | 실제 `.claude/agents` 파일 생성 | P3, P10, P11, P18 | visual agent spec | gap row schema가 명확함 | P10 gap 구조 대조 |
| CAI-03 | `docs/claude-agent-integration/03_interaction-fidelity-agent-spec.md` | interaction fidelity agent 설계 | 프론트엔드/QA | hover, submenu, sticky, chooser, commitments state, motion | 실제 browser runner 구현 | P10, P11, R3 reports | interaction agent spec | state machine schema가 명확함 | interactive evidence 대조 |
| CAI-04 | `docs/claude-agent-integration/04_reference-baseline-agent-spec.md` | reference baseline agent 설계 | QA/문서 담당 | viewport, state list, filename, capture manifest | 실제 캡처 실행 | P2, P10, P11, P15 | baseline agent spec | capture manifest 기준이 있음 | 파일명/상태 규칙 검토 |
| CAI-05 | `docs/claude-agent-integration/05_qa-review-agent-spec.md` | QA review agent 설계 | QA/운영 | build, variant guard, screenshot diff, interactive evidence, acceptance | CI 연결 구현 | P5, P15, R3 runbook, P17 | QA agent spec | 검증 명령과 evidence 판정 기준이 있음 | R3/R5 문서 대조 |
| CAI-06 | `docs/claude-agent-integration/06_command-workflow-spec.md` | `/copy-*` command 설계 | 구현자 | command entry, input, output, lifecycle, commit 규칙 | command 파일 실제 생성 | P11, P12, P18 | command workflow spec | 실행 단위 6단계와 연결됨 | lifecycle coverage 검토 |
| CAI-07 | `docs/claude-agent-integration/07_hooks-and-rules-plan.md` | hook/rule 도입 계획 | 개발 리드/운영 | copy scope, evidence reminder, gate stop, doc drift rule | hook 실제 코드 구현 | P18, `.claude/settings.json`, hooks/rules | hook/rule plan | blocking/reminder 기준이 구분됨 | risk self-review |
| CAI-08 | `docs/claude-agent-integration/08_adoption-roadmap.md` | 도입 순서와 gate 계획 | 의사결정자 | 단계별 적용, 승인 시점, commit 단위, rollback | 실제 구현 | P18, CAI-01~07, CAI-10 | adoption roadmap | 사용자 gate가 유지됨 | gate checklist 검토 |
| CAI-09 | `docs/claude-agent-integration/09_readiness-checklist.md` | 구현 전 준비 완료 판정 | 전체 팀 | 문서 completeness, link, drift, risk, approval checklist | agent 구현 자체 | CAI 전체 | readiness checklist | 실제 `.claude` 수정 전 판단 가능 | 체크리스트 통과 여부 |
| CAI-10 | `docs/claude-agent-integration/10_plan-workflow-integration-plan.md` | plan 기능 반영 기준 정의 | 기획/구현/운영 | `/plan-*` command, plan agent/skill/hook, `.plans/` gate, 기존 CAI 영향도 | 실제 `.plans/` 생성과 `.claude` 수정 | Claude Kit, CAI-01/06/08/09 | plan integration plan | plan/copy/dev 책임 경계가 설명됨 | 링크/역할/충돌 self-review |
| CAI-11 | `docs/claude-agent-integration/11_work-breakdown-structure.md` | WBS 4계층(Epic/Feature/Story/Task) 분류 체계, 카피 시나리오(A/B/C), 적응형 권장안 | 기획/구현 | WBS 4계층, 시나리오 분류 | 실제 구현 | CAI-06, CAI-10 | WBS 분류 체계 | 시나리오별 분류가 명확함 | 4계층+시나리오 기준 대조 |
| CAI-12 | `docs/claude-agent-integration/12_pipeline-integration-diagram.md` | Mermaid 파이프라인 순서도, 시나리오별 분기, 진입 조건표, 병렬 Gantt | 기획/구현/운영 | 파이프라인 다이어그램, 분기 조건 | 실제 구현 | CAI-06, CAI-11 | 파이프라인 다이어그램 | Mermaid 다이어그램 렌더링 확인 | 시나리오별 분기 검증 |
| CAI-13 | `docs/claude-agent-integration/13_pipeline-order-analysis.md` | 파이프라인 순서 분석, 시나리오별 PRD/갭 분석 순서, Feature 유형(copy/dev) 라우팅 | 기획/구현 | 순서 분석, 라우팅 규칙 | 실제 구현 | CAI-06, CAI-11, CAI-12 | 파이프라인 순서 분석 | 시나리오별 순서 검증 | Feature 유형별 라우팅 대조 |

## 5. 문서 간 관계

| 출발 | 도착 | 관계 |
| --- | --- | --- |
| P0 | P18 | Claude Agent 적용 검토 문서의 루트 탐색 |
| P18 | CAI-00 | P18 상세 분리 계획 |
| CAI-00 | CAI-README | 계획 승인 후 실제 패키지 입구 작성 |
| CAI-README | CAI-01~10 | 하위 문서 탐색 |
| CAI-01 | P10/P11/P15/P17 | 기존 카피/QA/운영 문서와 agent 문서 연결 |
| CAI-02~05 | P10/P11/P15 | fidelity, baseline, QA 기준 연결 |
| CAI-06 | `.claude/commands/` (소스: src/claude/copy/commands/) | command 구현 전 설계 근거 |
| CAI-07 | `.claude/hooks/` (소스: src/claude/copy/hooks/), `.claude/rules/` (소스: src/claude/copy/rules/) | hook/rule 구현 전 설계 근거 |
| CAI-08 | 사용자 gate | 실제 도입 순서와 승인 시점 정의 |
| CAI-09 | 구현 착수 | agent 구현 전 readiness gate |
| CAI-10 | CAI-06/08/09 | plan workflow를 command, roadmap, readiness에 반영하는 기준 |

P18은 계속 상위 제안서로 남긴다. `docs/claude-agent-integration/README.md`는 하위 문서 패키지 입구 역할을 하며, CAI-01~10은 실무자가 각자 필요한 상세 기준을 읽는 구조로 둔다.

## 6. 추천 문서 작성 순서

| 순서 | 문서 | 작성 방식 | 이유 |
| --- | --- | --- | --- |
| 1 | `00_docs-split-plan.md` | 순차 | 문서 분리 범위와 구조를 먼저 승인받아야 한다. |
| 2 | `01_package-map.md` | 순차 | P18과 기존 문서 관계를 먼저 고정해야 중복을 줄일 수 있다. |
| 3 | `README.md` 초안 | 순차 | 하위 문서 패키지 입구와 읽기 순서를 초기에 마련한다. |
| 4 | `02_copy-fidelity-agent-spec.md` | 병렬 가능 | 카피 품질 개선 효과가 가장 크다. |
| 5 | `03_interaction-fidelity-agent-spec.md` | 병렬 가능 | header/menu/sticky 체감 차이에 직접 연결된다. |
| 6 | `04_reference-baseline-agent-spec.md` | 병렬 가능 | visual/interaction agent의 입력 품질을 보장한다. |
| 7 | `05_qa-review-agent-spec.md` | 순차 권장 | R3/R5 검증과 연결되므로 CAI-02~04 결과를 참조한다. |
| 8 | `06_command-workflow-spec.md` | 순차 | agent spec이 있어야 command input/output을 정확히 정의할 수 있다. |
| 9 | `07_hooks-and-rules-plan.md` | 순차 | command workflow와 충돌하지 않게 blocking/reminder를 정한다. |
| 10 | `08_adoption-roadmap.md` | 순차 | 전체 spec이 나온 뒤 도입 순서와 gate를 정리한다. |
| 11 | `09_readiness-checklist.md` | 마지막 | 모든 문서의 완료 기준과 구현 준비 여부를 검증한다. |
| 12 | `10_plan-workflow-integration-plan.md` | plan 도메인 확인 후 | 새 `/plan-*` 기능이 기존 CAI 문서에 미치는 영향을 분리해 정리한다. |
| 13 | `README.md` 최종화 | 마지막 | 실제 작성된 하위 문서 상태판을 반영한다. |

> 2026-04-15 보강: CAI-10 추가.

| 순서 | 문서 | 작성 방식 | 이유 |
| --- | --- | --- | --- |
| 11 | `10_plan-workflow-integration-plan.md` | CAI-06 이후 | plan 도메인 통합 분석과 기존 CAI 반영이 선행 문서에 의존한다. |

`README.md`는 초안을 3번째에 만들고, 마지막에 상태판과 링크를 최종 갱신하는 방식을 추천한다.

## 7. 문서별 우선순위

| 문서 | 카피 품질 개선 효과 | 구현 준비도 | 운영 리스크 감소 | 작성 난이도 | 추천 우선순위 |
| --- | --- | --- | --- | --- | --- |
| `01_package-map.md` | 중간 | 높음 | 높음 | 낮음 | 1 |
| `02_copy-fidelity-agent-spec.md` | 매우 높음 | 높음 | 중간 | 중간 | 2 |
| `03_interaction-fidelity-agent-spec.md` | 매우 높음 | 중간 | 중간 | 중상 | 3 |
| `04_reference-baseline-agent-spec.md` | 높음 | 높음 | 높음 | 중간 | 4 |
| `05_qa-review-agent-spec.md` | 높음 | 높음 | 높음 | 중간 | 5 |
| `06_command-workflow-spec.md` | 중상 | 중간 | 중간 | 중상 | 6 |
| `07_hooks-and-rules-plan.md` | 중간 | 중간 | 높음 | 중상 | 7 |
| `08_adoption-roadmap.md` | 중간 | 높음 | 높음 | 낮음 | 8 |
| `09_readiness-checklist.md` | 중간 | 높음 | 높음 | 낮음 | 9 |

## 8. 각 문서가 다뤄야 할 핵심 질문

| 문서 | 핵심 질문 |
| --- | --- |
| `01_package-map.md` | P18의 어떤 내용을 어느 하위 문서가 책임지는가? 기존 P0~P18과 충돌하지 않는가? |
| `02_copy-fidelity-agent-spec.md` | visual fidelity agent는 typography, spacing, card, CTA, divider gap을 어떤 schema로 분석하는가? |
| `03_interaction-fidelity-agent-spec.md` | interaction agent는 hover/open/sticky/scroll/state transition을 어떤 state machine으로 판단하는가? |
| `04_reference-baseline-agent-spec.md` | reference agent는 어떤 viewport, state, filename, capture batch를 기준으로 삼는가? |
| `05_qa-review-agent-spec.md` | QA agent는 screenshot diff와 interactive evidence를 어떻게 통과/보류/실패로 나누는가? |
| `06_command-workflow-spec.md` | `/copy-*` command는 실행 단위 6단계와 commit 규칙에 어떻게 연결되는가? |
| `07_hooks-and-rules-plan.md` | hooks/rules는 어디서 blocking하고 어디서 reminder만 해야 하는가? |
| `08_adoption-roadmap.md` | 어떤 순서로 도입해야 사용자 gate를 유지하면서 효과를 볼 수 있는가? |
| `09_readiness-checklist.md` | 실제 `.claude` 파일을 수정하기 전에 무엇이 준비되어 있어야 하는가? |
| `10_plan-workflow-integration-plan.md` | `/plan-*` 기능은 홈페이지 정밀 카피 pipeline의 어떤 전단계와 gate에 들어가야 하는가? |

## 9. 기존 P18에서 이동할 내용과 남길 내용

| 구분 | 내용 | 처리 방식 |
| --- | --- | --- |
| P18에 남김 | 프로젝트 목적, Claude Agent 도입 방향, 추천안 요약, gate 원칙 | 상위 요약으로 유지 |
| P18에서 요약 후 링크 | `.claude` 구조 분석, 적용 가능한 agent 개선안, 리스크 | CAI 문서로 상세 링크 |
| `README.md`로 이동 | 하위 문서 패키지 읽기 순서, 상태판, 문서 관계 요약 | 패키지 인덱스로 관리 |
| agent spec으로 이동 | visual/interaction/reference/QA agent 상세 설계 | CAI-02~05로 분리 (소스: src/claude/copy/agents/) |
| command/hook 문서로 이동 | `/copy-*` command, hook/rule 후보 | CAI-06~07로 분리 (소스: src/claude/copy/commands/, src/claude/copy/hooks/) |
| roadmap/checklist로 이동 | 도입 단계, readiness, 사용자 승인 gate | CAI-08~09로 분리 |

중복을 피하기 위해 P18은 상세 표를 계속 늘리지 않고, 하위 문서가 작성된 뒤 `자세한 내용은 docs/claude-agent-integration/README.md를 참조`하는 방식으로 유지한다.

## 10. 문서 작성 시 지켜야 할 규칙

| 규칙 | 설명 |
| --- | --- |
| 홈페이지 정밀 카피 목적 우선 | 모든 문서는 Turner 원본 대비 fidelity 향상과 연결되어야 한다. |
| 추상 표현 금지 | “적절히”, “유사하게”보다 입력/출력/검증 기준을 명시한다. |
| 표준 구조 유지 | `현재 상태 -> 문제 -> agent 역할 -> 산출물 -> 검증 방법` 흐름을 기본으로 한다. |
| 사용자 gate 유지 | 대그룹/Phase/R 단계 종료 시 다음 단계 자동 진행 금지 원칙을 반복 명시한다. |
| 실행 단위 commit 유지 | 실제 구현 라운드로 넘어가면 실행 단위 1개 종료 후 commit 원칙을 유지한다. |
| 기존 P문서와 충돌 금지 | P1 목표, P2 기준선, P3 구현 명세, P5 QA, P6 handoff와 상충하지 않는다. |
| known gap 단일 출처 유지 | 남은 차이는 기존 delta log 또는 지정된 closeout 문서로 연결한다. |
| 하위 문서 중복 최소화 | README는 안내, package map은 관계, spec은 상세 기준만 담당한다. |
| plan 기능 분리 | CAI-10은 plan 반영 판단 문서로 두고, 실제 운영 기준은 06/08/09에 연결한다. |

## 11. 검증 계획

| 검증 항목 | 방법 | 완료 기준 |
| --- | --- | --- |
| P18 핵심 내용 누락 검증 | P18 목차와 CAI 문서 목록을 대조 | P18의 주요 주제가 최소 1개 하위 문서에 매핑됨 |
| 문서 간 중복/충돌 검증 | README/package map/spec의 역할을 비교 | 같은 상세 기준이 2개 이상 문서에 중복되지 않음 |
| 링크와 파일 존재 검증 | relative link 대상으로 `Test-Path` 확인 | 작성된 문서 링크가 모두 존재 |
| Claude Agent 구현 readiness 검증 | CAI-09 체크리스트로 확인 | agent 구현 전 입력/출력/검증 기준이 모두 있음 |
| P0/P18 탐색성 검증 | P0 또는 P18에서 CAI package로 이동 가능 여부 확인 | 루트 문서에서 하위 패키지 발견 가능 |
| gate 규칙 검증 | CAI-08/09에서 승인 대기 지점 확인 | 다음 단계 자동 진행 금지 지점이 명시됨 |
| plan workflow 검증 | CAI-10과 CAI-06/08/09 대조 | `/plan-*`, `/copy-*`, `/dev-*` 책임 경계가 중복 없이 설명됨 |

## 12. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| 문서가 너무 많아져 운영이 복잡해짐 | medium | `2 / 2 / 1 / 5 / likely / queued` | README와 package map으로 읽기 순서를 단순화한다. |
| P18과 하위 문서 내용이 중복됨 | medium | `2 / 2 / 1 / 5 / likely / queued` | P18은 요약/링크, 하위 문서는 상세 기준으로 역할을 나눈다. |
| 실제 agent 구현 없이 문서만 늘어남 | high | `3 / 2 / 1 / 6 / likely / queued` | CAI-08 adoption roadmap과 CAI-09 readiness checklist를 반드시 포함한다. |
| 기존 실행 규칙과 충돌 | high | `3 / 2 / 1 / 6 / likely / queued` | 실행 단위 lifecycle, commit, 사용자 gate를 모든 workflow 문서에 반복 명시한다. |
| 사용자 gate가 흐려짐 | high | `3 / 2 / 1 / 6 / confirmed / queued` | Phase/R 종료 시 `승인 대기`를 roadmap의 필수 종료 상태로 둔다. |
| `docs/` 하위 문서가 루트 문서에서 발견되지 않음 | medium | `2 / 2 / 1 / 5 / likely / queued` | P18과 P0에 CAI 패키지 링크를 연결한다. |

## 13. 최종 추천안

### 최소 문서 패키지안

| 포함 문서 | 설명 |
| --- | --- |
| `README.md` | 패키지 인덱스 |
| `01_package-map.md` | 문서 관계와 추적성 |
| `02_copy-fidelity-agent-spec.md` | visual fidelity agent |
| `05_qa-review-agent-spec.md` | QA review agent |
| `08_adoption-roadmap.md` | 도입 순서 |

장점은 빠르고 가볍다는 것이다. 단점은 interaction, reference, hooks/rules가 충분히 상세해지지 않는다.

### 표준 문서 패키지안

| 포함 문서 | 설명 |
| --- | --- |
| `README.md` | 패키지 인덱스 |
| `01_package-map.md` | 문서 관계와 추적성 |
| `02_copy-fidelity-agent-spec.md` | visual fidelity agent |
| `03_interaction-fidelity-agent-spec.md` | interaction fidelity agent |
| `04_reference-baseline-agent-spec.md` | reference baseline agent |
| `05_qa-review-agent-spec.md` | QA review agent |
| `06_command-workflow-spec.md` | command workflow |
| `07_hooks-and-rules-plan.md` | hook/rule plan |
| `08_adoption-roadmap.md` | 도입 순서 |
| `09_readiness-checklist.md` | 구현 전 checklist |

장점은 P18의 주요 내용을 빠짐없이 실무 문서로 나눌 수 있다는 것이다. 이 프로젝트에는 표준 문서 패키지안을 추천한다.

### 확장 문서 패키지안

| 추가 문서 후보 | 설명 |
| --- | --- |
| `10_sample-agent-output.md` | agent 출력 예시 |
| `11_copy-gap-schema.md` | visual/interaction gap row schema 단독 문서 |
| `12_playwright-evidence-contract.md` | Playwright evidence naming과 artifact contract |

확장안은 실제 agent 구현 후 출력 예시와 evidence contract가 필요해질 때 추가한다. 현재 단계에서는 과하다.

## 14. 다음 실행 계획

| 실행 단위 | 목적 | 산출물 | 검증 | 권장 커밋 |
| --- | --- | --- | --- | --- |
| CAI-00-01 | 문서 분리 계획서 작성 | `00_docs-split-plan.md` | self-review, 링크 검증 | `docs: Claude Agent 문서 분리 계획 정리` |
| CAI-01-01 | package map 작성 | `01_package-map.md` | P18/P0/P10/P11/P15/P17 추적성 검증 | `docs: Claude Agent 문서 패키지 맵 정리` |
| CAI-README-01 | README 초안 작성 | `README.md` | 하위 문서 링크와 읽기 순서 확인 | `docs: Claude Agent 문서 패키지 인덱스 정리` |
| CAI-02-01 | visual fidelity agent spec 작성 | `02_copy-fidelity-agent-spec.md` | P10 gap 구조 대조 | `docs: visual fidelity agent 명세 정리` |
| CAI-03-01 | interaction fidelity agent spec 작성 | `03_interaction-fidelity-agent-spec.md` | P11 state 기준 대조 | `docs: interaction fidelity agent 명세 정리` |
| CAI-04-01 | reference baseline agent spec 작성 | `04_reference-baseline-agent-spec.md` | P2/P15 manifest 기준 대조 | `docs: reference baseline agent 명세 정리` |
| CAI-05-01 | QA review agent spec 작성 | `05_qa-review-agent-spec.md` | R3/R5 검증 항목 대조 | `docs: QA review agent 명세 정리` |
| CAI-06-01 | command workflow spec 작성 | `06_command-workflow-spec.md` | 실행 단위 6단계 coverage | `docs: Claude command workflow 명세 정리` |
| CAI-07-01 | hooks/rules plan 작성 | `07_hooks-and-rules-plan.md` | blocking/reminder risk review | `docs: Claude hooks rules 계획 정리` |
| CAI-08-01 | adoption roadmap 작성 | `08_adoption-roadmap.md` | gate 유지 검증 | `docs: Claude Agent 도입 로드맵 정리` |
| CAI-09-01 | readiness checklist 작성 | `09_readiness-checklist.md` | 구현 전 체크리스트 self-review | `docs: Claude Agent readiness checklist 정리` |
| PLAN-CAI-01 | plan workflow 통합 계획 작성 | `10_plan-workflow-integration-plan.md` | plan 파일 존재, 링크, gate self-review | `docs: plan workflow 통합 반영 계획 정리` |
| CAI-10-01 | plan workflow 통합 분석 작성 | `10_plan-workflow-integration-plan.md` | plan 도메인 컴포넌트 대조 | `docs: plan workflow 통합 분석 정리` |
| PLAN-CAI-02~05 | 기존 CAI 문서에 plan 기준 반영 | `README.md`, `00`~`09` | 문서 간 충돌, 링크, 미정 표현 검증 | `docs: CAI plan workflow 반영` |
| CAI-11-01 | WBS 분류 체계 작성 | `11_work-breakdown-structure.md` | 4계층+시나리오 기준 대조 | `docs: WBS 분류 체계 정리` |
| CAI-12-01 | 파이프라인 다이어그램 작성 | `12_pipeline-integration-diagram.md` | Mermaid 다이어그램 렌더링 확인 | `docs: 파이프라인 통합 다이어그램 정리` |
| CAI-13-01 | 파이프라인 순서 분석 작성 | `13_pipeline-order-analysis.md` | 시나리오별 순서 검증 | `docs: 파이프라인 순서 분석 정리` |
| CAI-README-02 | README 최종화 | `README.md` | 모든 링크 존재 확인 | `docs: Claude Agent 문서 패키지 마감 정리` |

- PLAN-CAI-01~05 반영 완료 확인 (CAI-10 참조)

## 15. 가장 먼저 작성해야 할 하위 문서 3개

| 순서 | 문서 | 이유 |
| --- | --- | --- |
| 1 | `01_package-map.md` | P18과 기존 P문서, `.claude` 구조의 관계를 먼저 잠가야 한다. |
| 2 | `02_copy-fidelity-agent-spec.md` | 홈페이지 카피 품질 개선 효과가 가장 크다. |
| 3 | `03_interaction-fidelity-agent-spec.md` | header hover/open/sticky 등 사용자가 지적한 체감 차이에 직접 대응한다. |

## 16. P18에 남겨야 할 내용

| 내용 | 이유 |
| --- | --- |
| 프로젝트의 핵심 목적 | 하위 문서 해석 기준 |
| Claude Agent 적용 전체 방향 | 상위 의사결정 기준 |
| 가장 먼저 도입할 agent 3개 | 빠른 판단을 위한 요약 |
| 사용자 gate 유지 원칙 | 자동화가 과도해지는 것을 방지 |
| 하위 문서 패키지 링크 | 상세 문서로 이동하는 입구 |

## 17. `docs/claude-agent-integration/`로 분리해야 할 내용

| 내용 | 대상 |
| --- | --- |
| P18 상세 분석과 문서 관계 | `01_package-map.md` |
| visual gap 판단 기준 | `02_copy-fidelity-agent-spec.md` |
| interaction/state 판단 기준 | `03_interaction-fidelity-agent-spec.md` |
| capture manifest와 reference 기준 | `04_reference-baseline-agent-spec.md` |
| screenshot diff / interactive QA 검증 기준 | `05_qa-review-agent-spec.md` |
| `/copy-*` command 구조 | `06_command-workflow-spec.md` |
| hook/rule 동작 정책 | `07_hooks-and-rules-plan.md` |
| 단계별 도입 계획 | `08_adoption-roadmap.md` |
| 구현 전 준비 체크 | `09_readiness-checklist.md` |

## 18. 문서 분리 작업 전 사용자 승인이 필요한 지점

| 승인 지점 | 승인 이유 |
| --- | --- |
| 패키지 root를 `docs/claude-agent-integration/`로 고정 | 향후 모든 세부 문서의 위치 기준이 된다. |
| 표준 문서 패키지안 채택 | 문서 수와 작성 범위를 결정한다. |
| P18을 상위 제안서로 유지 | P18을 축약할지, 그대로 둘지 결정해야 한다. |
| 가장 먼저 작성할 3개 문서 순서 | 다음 실행 단위의 우선순위가 된다. |
| 실제 `.claude` 구현 전까지 문서만 작성 | 계획/명세와 구현 범위를 명확히 분리한다. |
