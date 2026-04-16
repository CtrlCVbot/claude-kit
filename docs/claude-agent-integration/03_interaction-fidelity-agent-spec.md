> [REVIEW 반영] P0: claude-kit 형식 전환, 네이밍 정규화 (copy-interaction-fidelity.md), 소스 경로 수정. P1: 스킬 제안.

# Interaction Fidelity Agent 명세

- 문서 ID: CAI-03
- 작성일: 2026-04-15
- 문서 상태: 명세 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md), [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner Construction 홈페이지 정밀 카피 프로젝트에서 hover/open/sticky/scroll/state transition 체감 차이를 분석하는 Claude Agent의 기준을 정의한다.

## 1. 문서 목적

`interaction-fidelity-agent`는 정적인 레이아웃보다 상태 변화와 모션 체감이 중요한 영역을 담당한다. 특히 사용자가 명시적으로 지적한 header menu hover, submenu panel, sticky header, scroll rhythm, commitments state transition을 실행 가능한 gap으로 변환한다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | 원본 Turner 홈페이지의 상태 전환 체감을 현재 구현과 비교 |
| 주요 대상 | top nav hover, submenu/mega menu, sticky header, chooser open, CTA hover, commitments state |
| 주요 산출물 | interaction state map, timing sheet, transition gap board |
| 금지 | 단일 정적 screenshot만으로 interaction 완료 판정 |
| plan 연결 | header/menu/sticky처럼 복합 상태가 많은 P0 gap은 `/plan-prd`, `/plan-wireframe`, `/plan-bridge`를 통해 구현 전 기준을 고정한다. |

## 2. 적용 범위

| 포함 범위 | 설명 |
| --- | --- |
| Header hover | `Our Company`, `Our Services` 등 top nav hover 진입/이탈 |
| Submenu/Mega menu | panel open timing, position, background, column reveal, close behavior |
| Sticky header | scroll threshold, height change, contrast, border/blur, logo/menu density |
| Search/menu overlay | open/close transition, focus state, backdrop treatment |
| Hero chooser | open anchor, panel reveal, overlay density, exit behavior |
| CTA/card hover | arrow movement, underline, opacity, color/line transition |
| Commitments state | active nav marker, content/media transition, stagger timing |
| Scroll rhythm | hero to first white section handoff, section reveal cadence |

| 제외 범위 | 이유 |
| --- | --- |
| Typography/spacing static gap | CAI-02 copy fidelity agent가 담당 |
| Reference capture manifest 작성 | CAI-04 reference baseline agent가 담당 |
| Build/diff pass/fail 판정 | CAI-05 QA review agent가 담당 |
| 실제 component 구현 | 별도 implementation 실행 단위에서 처리 |

## 3. 입력 자료

| 입력 | 필수 여부 | 사용 방식 |
| --- | --- | --- |
| [10_phase2-detail-fidelity-plan.md](../../10_phase2-detail-fidelity-plan.md) | 필수 | header/menu/sticky/commitments gap 기준 |
| [11_phase2-execution-breakdown.md](../../11_phase2-execution-breakdown.md) | 필수 | Phase 1/4/6 실행 단위 기준 |
| [15_r3-qa-automation-execution-plan.md](../../15_r3-qa-automation-execution-plan.md) | 권장 | interactive evidence runner 기준 |
| R3 interactive reports | 권장 | hover/open/sticky/state evidence 확인 |
| live/current interaction captures | 필수 | 상태별 비교 근거 |
| browser observation note | 권장 | duration/easing/scroll 체감 기록 |

## 4. 출력 산출물

| 산출물 | 형식 | 설명 |
| --- | --- | --- |
| Interaction state map | Markdown table | idle, hover, open, sticky, active 등 상태 정의 |
| Transition timing sheet | Markdown table | trigger, enter, active, exit, duration, easing 관찰 |
| Interaction gap board | Markdown table | 원본 대비 상태/모션 차이와 보강 방법 |
| State evidence checklist | Markdown checklist | 필요한 상태 캡처와 누락 여부 |
| Gate review note | Markdown section | 사용자 확인이 필요한 체감 차이 |

## 5. State Map Schema

interaction state는 반드시 아래 schema로 정리한다.

| 컬럼 | 설명 |
| --- | --- |
| State ID | `IF-AREA-STATE-NN` 형식 |
| Area | Header, MegaMenu, Sticky, Chooser, CTA, Commitments 등 |
| Trigger | hover, click, scrollY, focus, keyboard 등 |
| Entry Condition | 상태가 시작되는 조건 |
| Active Visual | 활성 상태에서 보여야 하는 시각 요소 |
| Motion | duration, easing, opacity, transform, stagger |
| Exit Condition | 상태가 종료되는 조건 |
| Reference Evidence | live 기준 캡처/관찰 경로 |
| Current Evidence | 현재 구현 캡처/관찰 경로 |
| Gap | 차이 요약 |
| Verification | 재확인 방법 |
| Gate | self-review 또는 user-review |

예시 형식은 아래와 같다.

| State ID | Area | Trigger | Entry Condition | Active Visual | Motion | Exit Condition | Reference Evidence | Current Evidence | Gap | Verification | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `IF-HEADER-HOVER-01` | Header | hover | `Our Company` pointer enter | header 아래 submenu panel, active nav text | short fade + vertical settle | pointer leave 또는 다른 nav 진입 | live hover capture | current hover capture | panel height/type density 차이 | hover sequence capture | user-review |

## 6. 분석 절차

| 단계 | 작업 | 완료 기준 |
| --- | --- | --- |
| 1. 상태 목록 확정 | 비교할 interaction state를 나열 | idle/hover/open/sticky/active가 분리됨 |
| 2. Trigger 분석 | 어떤 입력이 상태를 여는지 기록 | hover/click/scroll/focus 기준 명시 |
| 3. Entry/exit 관찰 | 상태가 시작/종료되는 조건 기록 | enter/exit 조건이 분리됨 |
| 4. Active visual 관찰 | 활성 상태의 레이아웃, 계층, affordance 기록 | static visual과 motion이 분리됨 |
| 5. Motion 분석 | duration/easing/opacity/translate/stagger 기록 | 수치 또는 관찰 표현으로 정리 |
| 6. Current와 reference 비교 | state별 차이 기록 | state map에 evidence 연결 |
| 7. 보강 후보 작성 | 구현 후보와 검증 방법 작성 | interaction gap board 완성 |

## 7. 핵심 상태별 기준

### 7.1 Header Hover / Submenu

| 항목 | 분석 기준 |
| --- | --- |
| hover 진입 | pointer enter 후 panel이 열리는 지연, active nav 처리 |
| panel 위치 | header bottom과의 연결감, top offset, width, column alignment |
| panel 내부 | title, group label, featured card, divider, link hierarchy |
| exit | pointer leave, 다른 nav hover, scroll 시 닫힘 여부 |
| motion | opacity, y-offset, panel height settle, background transition |

### 7.2 Sticky Header

| 항목 | 분석 기준 |
| --- | --- |
| trigger | scrollY 몇 지점에서 전환되는지 |
| transition | height, background, border, blur, logo/menu density 변화 |
| 단계성 | 0/40/80/120 같은 step에서 상태가 어떻게 보이는지 |
| 안정성 | 빠른 scroll에서 flicker나 jitter가 없는지 |

### 7.3 CTA / Card Hover

| 항목 | 분석 기준 |
| --- | --- |
| pointer feedback | hover 진입 시 cursor, opacity, underline, arrow 변화 |
| arrow motion | translate distance, duration, easing |
| text treatment | color, weight, letter spacing, line treatment |
| card media | scale, overlay, shadow, border 변화 |

### 7.4 Commitments State

| 항목 | 분석 기준 |
| --- | --- |
| active nav | number, label, marker, line, contrast |
| content transition | copy block enter/exit, stagger, height stability |
| media transition | image swap, opacity, scale, layout shift |
| keyboard/click | click order, focus retention, active state persistence |

## 8. Interaction Gap Priority

| 우선순위 | 기준 | 예시 |
| --- | --- | --- |
| P0 | 원본 카피 체감에 즉시 영향 | header hover panel, sticky header |
| P1 | 특정 섹션의 고급감과 사용감에 영향 | commitments state transition, CTA hover |
| P2 | 일부 viewport 또는 세부 경로에서만 영향 | focus ring, minor arrow offset |

## 9. Agent Prompt 요구사항

| 요구사항 | 설명 |
| --- | --- |
| State-first | 먼저 상태 목록을 만들고 분석한다. |
| Sequence-aware | idle -> trigger -> active -> exit 순서를 기록한다. |
| Evidence-required | live/current evidence가 없는 state는 `missing evidence`로 남긴다. |
| Visual separation | 정적 visual gap은 CAI-02로 넘기고 motion/state gap만 다룬다. |
| User gate | P0 interaction gap은 사용자 확인 대상으로 표시한다. |
| No implementation | agent는 수정하지 않고 분석/명세만 작성한다. |

## 10. Command 연결

| Command 후보 | 역할 | 출력 |
| --- | --- | --- |
| `/copy-interaction-review` | 특정 state 또는 component interaction 분석 | interaction gap board |
| `/copy-state-map` | header/chooser/commitments state map 생성 | state map |
| `/copy-sticky-review` | scroll step별 sticky 상태 분석 | sticky timing sheet |
| `/copy-hover-review` | hover/open 상태 분석 | hover sequence report |

command 상세는 `06_command-workflow-spec.md`에서 다룬다.

## 11. Plan Workflow 연결

interaction gap은 상태 전환, timing, pointer path, responsive menu 구조가 얽히기 때문에 단일 실행 단위로 바로 구현하면 기준이 흔들릴 수 있다. 아래 조건에 해당하면 `plan` workflow로 넘긴다.

| 상황 | plan 연결 | 이유 |
| --- | --- | --- |
| Header hover/mega menu 구조 보강 | `/plan-prd` + `/plan-wireframe` | panel 구조, 열 배치, hover 진입/이탈 조건을 구현 전 고정 |
| Sticky header 전환 기준 재정의 | `/plan-draft` 또는 `/plan-prd` | scroll threshold, height, contrast, transition timing이 함께 움직임 |
| Commitments state transition 보강 | `/plan-wireframe` 선택 | active nav, content, media state 관계를 시각화 |
| mobile menu와 desktop hover가 함께 변경 | `/plan-screen`으로 scope 판정 | responsive 영향 범위가 크므로 사용자 gate 필요 |
| 승인된 interaction 보강을 구현으로 넘김 | `/plan-bridge` | state map과 구현 context를 연결 |

wireframe은 reference evidence를 대체하지 않는다. `/plan-wireframe` 산출물은 상태 구조를 설명하는 보조 문서이며, 최종 판단은 live/current state evidence와 사용자 gate를 따른다.

## 12. 검증 기준

| 검증 항목 | 방법 | 통과 기준 |
| --- | --- | --- |
| state coverage | idle/trigger/active/exit 존재 여부 | P0 state는 4단계 모두 기록 |
| evidence coverage | live/current evidence 경로 확인 | P0/P1 state에 evidence 존재 |
| motion 분리 | visual gap과 motion gap 구분 | CAI-02와 중복 최소화 |
| 실행 가능성 | 보강 후보 검토 | 구현자가 target state를 이해 가능 |
| gate 보존 | P0 state user-review 표시 | 사용자 확인 대상 명확 |

## 13. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| 모션 체감을 screenshot으로만 판단 | high | `3 / 2 / 1 / 6 / likely / queued` | sequence capture와 observation note를 필수화한다. |
| hover/open 상태가 local 환경에서 재현 불안정 | medium | `2 / 2 / 1 / 5 / likely / queued` | state runner와 수동 확인을 함께 둔다. |
| visual gap과 interaction gap이 중복 기록 | medium | `2 / 1 / 1 / 4 / likely / queued` | 정적 layout은 CAI-02, state/motion은 CAI-03으로 분리한다. |
| P0 interaction을 self-review만으로 완료 처리 | high | `3 / 2 / 1 / 6 / likely / queued` | P0 state에는 user-review gate를 강제한다. |
| wireframe이 원본 evidence를 대체하는 것으로 오해 | medium | `2 / 2 / 1 / 5 / likely / queued` | `/plan-wireframe`은 구조 보조 산출물로만 사용하고 evidence 필드를 유지한다. |

## 14. 완료 기준

| 기준 | 상태 |
| --- | --- |
| interaction fidelity agent의 적용 범위와 비범위가 정의됨 | 완료 |
| state map schema가 정의됨 | 완료 |
| header/sticky/CTA/commitments 기준이 정의됨 | 완료 |
| command 연결 후보가 정의됨 | 완료 |
| plan workflow 승격 기준이 정의됨 | 완료 |
| 실제 interaction runner 구현은 하지 않음 | 의도적 제외 |

## 15. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 사용자가 지적한 header hover/open 문제 반영 | 완료 |
| sticky/scroll/commitments/CTA 포함 | 완료 |
| CAI-02와 역할 분리 | 완료 |
| evidence와 gate 기준 포함 | 완료 |
| plan workflow 연결 | 복합 state 보강 기준으로 반영 |
| 실제 구현 범위 초과 여부 | 초과 없음 |

## 16. claude-kit 형식 전환 가이드

### claude-kit 구현 정보

| 항목 | 값 |
| --- | --- |
| 파일명 | `copy-interaction-fidelity.md` (claude-kit 컨벤션: `{domain}-{role}.md`) |
| 소스 경로 | `src/claude/copy/agents/copy-interaction-fidelity.md` |
| 배포 경로 | `.claude/agents/copy-interaction-fidelity.md` |

### YAML 프론트매터 템플릿

실제 에이전트 파일 작성 시 아래 YAML 프론트매터를 파일 최상단에 배치한다.

```yaml
---
name: copy-interaction-fidelity
description: 호버, 스티키, 스크롤, 메뉴 등 상태 전환 경험의 갭을 분석하는 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### Agent_Prompt 래핑

실제 `src/claude/copy/agents/copy-interaction-fidelity.md` 파일을 생성할 때, 본 명세의 핵심 프롬프트 내용은 `<Agent_Prompt>` XML 블록으로 감싸야 한다. claude-kit 에이전트 표준 형식(`dev-architect.md` 참조)에 따라 `<Role>`, `<Constraints>`, `<Output_Format>` 등의 하위 XML 태그를 사용한다.

### 관련 스킬 제안

| 스킬 경로 | 설명 |
| --- | --- |
| `copy-interaction-analysis/SKILL.md` | 인터랙션 상태 분석 방법론 |
