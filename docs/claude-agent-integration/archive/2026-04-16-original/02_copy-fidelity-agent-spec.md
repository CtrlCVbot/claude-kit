> [REVIEW 반영] P0: claude-kit 형식 전환 (YAML 프론트매터 + Agent_Prompt), 네이밍 정규화 (copy-fidelity.md), 소스 경로 수정. P1: 스킬 컴포넌트 제안 추가.

# Copy Fidelity Agent 명세

- 문서 ID: CAI-02
- 작성일: 2026-04-15
- 문서 상태: 명세 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner Construction 홈페이지 정밀 카피 프로젝트에서 visual fidelity gap을 분석하는 Claude Agent의 역할, 입력, 출력, 판단 기준을 정의한다.

## 1. 문서 목적

`copy-fidelity-agent`는 원본 Turner 홈페이지와 현재 구현 사이의 시각적 차이를 구조화하는 agent다. 이 agent는 구현을 직접 하지 않는다. 구현 전에 어떤 차이를 어떤 우선순위로 닫아야 하는지, 그리고 어떤 증거로 검증할지를 작성한다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | 원본 대비 visual fidelity gap을 실행 가능한 작업 단위로 바꾸기 |
| 주요 대상 | typography, spacing, layout, card ratio, CTA, divider, color, responsive density |
| 주요 산출물 | visual gap board, section rhythm matrix, responsive density note |
| 금지 | screenshot 없이 추상적인 “비슷하게 조정” 제안 |
| plan 연결 | P0/P1 visual gap은 필요 시 `/plan-idea`와 `/plan-screen`으로 승격해 구현 전 우선순위를 잠근다. |
| 시나리오 조건 | 시나리오 C: 기획 시 갭 분석으로 동작 (PRD 전). 시나리오 A/B: QA 시점에서만 동작 (구현 후 비교). Dev Feature: 미사용 (CAI-06 §3.1 참조) |

## 2. 적용 범위

| 포함 범위 | 설명 |
| --- | --- |
| Hero first viewport | title anchor, underline, prompt, media overlay, hero bottom handoff |
| Header visual state | idle/sticky 상태의 height, border, contrast, logo/menu alignment |
| Section rhythm | News, Community, Culture, Commitments, Career, Footer의 top/bottom spacing |
| Card and CTA | card ratio, title wrap, CTA gap, arrow offset, divider treatment |
| Typography | section title, body, label, nav text, card title의 scale/line-height/weight |
| Responsive density | 1024 / 768 / 390 기준 줄바꿈, stack, padding, CTA width |

| 제외 범위 | 이유 |
| --- | --- |
| hover/open motion timing | CAI-03 interaction fidelity agent가 담당 |
| screenshot capture 실행 | CAI-04 reference baseline agent가 담당 |
| build/diff 실행 | CAI-05 QA review agent가 담당 |
| 실제 code edit | implementation 단계에서 별도 실행 단위로 처리 |

## 3. 입력 자료

| 입력 | 필수 여부 | 사용 방식 |
| --- | --- | --- |
| [03_design-spec.md](../../03_design-spec.md) | 필수 | 구현 기준과 design token 확인 |
| [10_phase2-detail-fidelity-plan.md](../../10_phase2-detail-fidelity-plan.md) | 필수 | 기존 visual gap 분류 확인 |
| [11_phase2-execution-breakdown.md](../../11_phase2-execution-breakdown.md) | 필수 | 실행 단위 구조와 gate 기준 확인 |
| [output/playwright/phase2/phase6/phase6-delta-log.md](../../output/playwright/phase2/phase6/phase6-delta-log.md) | 권장 | 남은 gap과 known limitation 확인 |
| R3 diff reports | 권장 | full-page/current/diff evidence 확인 |
| live/current crop screenshots | 필수 | visual 판단의 직접 근거 |

## 4. 출력 산출물

| 산출물 | 형식 | 설명 |
| --- | --- | --- |
| Visual gap board | Markdown table | section/state별 현재 상태, 원본 상태, 차이, 보강 방법, 검증 방법 |
| Section rhythm matrix | Markdown table | 섹션별 top/bottom padding, heading gap, grid gap, CTA gap |
| Responsive density note | Markdown table | viewport별 line-break, stack, density 차이 |
| Implementation handoff note | Markdown section | 구현 agent 또는 개발자가 바로 실행할 수 있는 target area |
| Residual risk note | Markdown section | 자동 판단으로 닫기 어려운 체감 차이 |

## 5. Gap Row Schema

visual gap은 반드시 아래 schema로 작성한다.

| 컬럼 | 설명 |
| --- | --- |
| Gap ID | `VF-SECTION-NN` 형식 |
| Area | Hero, Header, News, Community, Commitments, Footer 등 |
| Viewport | `1440`, `1280`, `1024`, `768`, `390`, 또는 `all` |
| Current State | 현재 구현의 관찰 내용 |
| Reference State | 원본 Turner의 관찰 내용 |
| Difference | 차이가 느껴지는 이유 |
| Proposed Adjustment | 실제 조정 후보 |
| Evidence | 사용한 screenshot/report 경로 |
| Verification | 조정 후 확인 방법 |
| Priority | `P0`, `P1`, `P2` |
| Gate | self-review 또는 user-review 필요 여부 |
| WBS_ID | WBS Story 계층 매핑 ID |

> 각 Gap Row(VF-*)는 WBS의 Story 계층(`S-{AREA}-{NN}`)에 1:1 매핑된다 (CAI-11 §2 참조).

예시 형식은 아래와 같다.

| Gap ID | Area | Viewport | Current State | Reference State | Difference | Proposed Adjustment | Evidence | Verification | Priority | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VF-HERO-01` | Hero | `390` | CTA가 일반 버튼처럼 보임 | 원본은 dark callout box 인상이 강함 | mobile first viewport의 무게감이 약함 | CTA surface, padding, contrast 조정 | `r2-a-01-measurement-note.md` | 390 crop 비교 | P0 | user-review |

## 6. 분석 절차

| 단계 | 작업 | 완료 기준 |
| --- | --- | --- |
| 0. 시나리오 체크 | 현재 Feature의 시나리오를 확인한다. 시나리오 C → 기획 시 갭 분석 수행 (진행). 시나리오 A/B → QA 시점으로 연기 (현재 단계에서는 실행하지 않음). Dev Feature → 이 에이전트 미사용 (건너뜀) | 시나리오가 확인되고 진행 여부가 결정됨 |
| 1. 범위 고정 | 분석할 section, viewport, evidence 목록 확정 | 입력 evidence가 명시됨 |
| 2. 현재 상태 관찰 | current screenshot에서 layout/type/spacing 관찰 | current state가 구체적으로 기록됨 |
| 3. 원본 상태 관찰 | live/reference screenshot에서 대응 상태 관찰 | reference state가 구체적으로 기록됨 |
| 4. 차이 분류 | typography, spacing, rhythm, card, CTA, responsive 중 하나로 분류 | Difference가 원인 중심으로 작성됨 |
| 5. 보강 후보 작성 | style/token/layout 조정 후보 작성 | 추상 표현 없이 조정 축이 명시됨 |
| 6. 검증 방법 연결 | crop/full-page/state 비교 방법 연결 | Verification이 evidence 기반 |
| 7. 우선순위 지정 | 체감 영향과 수정 리스크 기준으로 P0~P2 지정 | P0는 사용자 gate 필요 |

## 7. 우선순위 기준

| 우선순위 | 기준 | 예시 |
| --- | --- | --- |
| P0 | 첫 인상 또는 원본 카피 체감을 크게 바꾸는 차이 | hero anchor, mobile CTA, header visual density |
| P1 | 섹션별 완성도를 낮추는 반복 차이 | card gap, CTA 거리, section padding |
| P2 | 특정 viewport나 세부 상태에서만 보이는 차이 | label baseline, divider opacity, minor line-break |

## 8. Agent Prompt 요구사항

실제 `.claude/agents/copy-fidelity.md` (소스: `src/claude/copy/agents/copy-fidelity.md`)를 만들 때 prompt에는 아래 제약이 들어가야 한다.

| 요구사항 | 설명 |
| --- | --- |
| Read-first | 관련 문서와 evidence를 읽기 전 판단 금지 |
| No implementation | agent는 분석과 계획만 수행, 코드 수정 금지 |
| Evidence-required | 모든 gap row에는 screenshot/report path 필요 |
| No vague language | “적절히”, “자연스럽게”, “유사하게” 최소화 |
| Fidelity-first | 디자인 시스템 일반화보다 원본 체감 일치를 우선 |
| Gate-aware | P0 gap은 사용자 확인 대상으로 표시 |

## 9. Command 연결

| Command 후보 | 역할 | 출력 |
| --- | --- | --- |
| `/copy-visual-review` | 특정 section 또는 viewport visual gap 분석 | visual gap board |
| `/copy-gap-board` | 여러 section gap을 backlog형 table로 통합 | prioritized gap board |
| `/copy-section-rhythm` | full-page section rhythm만 분석 | rhythm matrix |
| `/copy-responsive-density` | 1024/768/390 density와 line-break 분석 | responsive density note |

command 상세는 `06_command-workflow-spec.md`에서 다룬다.

> `/copy-visual-review` 사용 시점: 시나리오 C = 기획 시 (갭 분석), 시나리오 A/B = QA 시점 (구현 후 비교) (CAI-06 §5.1 참조)

## 10. Plan Workflow 연결

visual gap은 copy agent가 자체적으로 구현 우선순위를 확정하지 않는다. 원본 체감에 큰 영향을 주거나 여러 section/viewport에 걸친 gap은 `plan` workflow로 승격해 선별과 사용자 gate를 거친다.

| 상황 | plan 연결 | 이유 |
| --- | --- | --- |
| P0 visual gap 발견 | `/plan-idea`로 fidelity improvement idea 등록 | gap을 단발 수정이 아니라 보강 후보로 추적 |
| 여러 viewport에 걸친 반복 gap | `/plan-screen`으로 Reach/Impact/Effort 판정 | 체감 영향과 구현 비용을 함께 판단 |
| section rhythm 전반 재조정 | `/plan-draft` 또는 `/plan-prd` 대상 | 단일 CSS 보정보다 범위가 커질 수 있음 |
| visual 구조와 responsive 구조가 함께 바뀜 | `/plan-wireframe` 선택 검토 | 줄바꿈, 정보 밀도, 레이아웃 재배열 기준 필요 |
| 승인된 visual 보강을 구현으로 넘김 | `/plan-bridge` 또는 `/copy-plan-unit` 입력 사용 | 계획/구현/검증 context drift 감소 |
| Feature 유형 체크 | copy Feature만 이 에이전트를 활성화한다. Dev Feature는 건너뛴다 (CAI-06 §3.2) |

`/plan-screen`의 RICE는 일반 사업 기능 기준이 아니라, CAI-10의 보정 기준에 따라 `영향 viewport/state 수`, `원본 대비 체감 차이 감소`, `evidence 신뢰도`, `구현 및 QA 비용`으로 해석한다.

## 11. 검증 기준

| 검증 항목 | 방법 | 통과 기준 |
| --- | --- | --- |
| 입력 근거 | gap row의 Evidence 확인 | 모든 P0/P1 gap에 evidence 존재 |
| schema 준수 | Gap Row Schema 대조 | 필수 컬럼 누락 없음 |
| 기존 문서 연결 | P10/P11/P15와 대조 | 기존 known gap과 충돌 없음 |
| 실행 가능성 | Proposed Adjustment 검토 | 구현자가 target area를 이해 가능 |
| gate 보존 | P0 gap 확인 | user-review 표시 존재 |

## 12. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| screenshot만 보고 motion gap까지 visual 문제로 오분류 | medium | `2 / 2 / 1 / 5 / likely / queued` | motion/hover는 CAI-03으로 넘긴다. |
| evidence 없는 주관적 판단 | high | `3 / 2 / 1 / 6 / likely / queued` | Evidence 필드를 필수로 둔다. |
| 공통 token 일반화가 원본 fidelity를 낮춤 | medium | `2 / 2 / 1 / 5 / likely / queued` | section override 허용 원칙을 명시한다. |
| P18/P10과 중복되는 장황한 설명 | low | `1 / 1 / 1 / 3 / likely / queued` | P18은 요약, CAI-02는 schema와 판단 기준만 담당한다. |
| copy agent가 plan screening 없이 P0 우선순위를 확정 | high | `3 / 2 / 1 / 6 / likely / queued` | P0/P1 visual gap은 `/plan-screen` 또는 사용자 gate 대상으로 표시한다. |

## 13. 완료 기준

| 기준 | 상태 |
| --- | --- |
| visual fidelity agent의 목적과 비목적이 구분됨 | 완료 |
| 입력/출력/evidence 기준이 정의됨 | 완료 |
| gap row schema가 정의됨 | 완료 |
| command와 QA 문서 연결 지점이 있음 | 완료 |
| 실제 agent 구현은 아직 하지 않음 | 의도적 제외 |
| plan workflow 승격 기준이 있음 | 완료 |

## 14. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 홈페이지 정밀 카피 목적 반영 | 완료 |
| 추상 표현 최소화 | 완료 |
| P10/P11/R3와의 연결 | 완료 |
| 사용자 gate 유지 | P0 gap user-review로 반영 |
| plan workflow 연결 | P0/P1 gap 승격 기준으로 반영 |
| 실제 구현 범위 초과 여부 | 초과 없음 |

## 15. claude-kit 형식 전환 가이드

### claude-kit 구현 정보

| 항목 | 값 |
| --- | --- |
| 파일명 | `copy-fidelity.md` (claude-kit 컨벤션: `{domain}-{role}.md`) |
| 소스 경로 | `src/claude/copy/agents/copy-fidelity.md` |
| 배포 경로 | `.claude/agents/copy-fidelity.md` |

### YAML 프론트매터 템플릿

실제 에이전트 파일 작성 시 아래 YAML 프론트매터를 파일 최상단에 배치한다.

```yaml
---
name: copy-fidelity
description: Turner 원본 대비 시각적 충실도 갭을 분석하는 에이전트. 레이아웃, 타이포그래피, 간격, 카드, CTA, 구분선을 검사한다.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### Agent_Prompt 래핑

실제 `src/claude/copy/agents/copy-fidelity.md` 파일을 생성할 때, 본 명세의 "## 역할" 이하 핵심 프롬프트 내용은 `<Agent_Prompt>` XML 블록으로 감싸야 한다. claude-kit 에이전트 표준 형식(`dev-architect.md` 참조)에 따라 `<Role>`, `<Constraints>`, `<Output_Format>` 등의 하위 XML 태그를 사용한다.

### 관련 스킬 제안

| 스킬 경로 | 설명 |
| --- | --- |
| `copy-fidelity-workflow/SKILL.md` | 시각적 충실도 분석 워크플로우 가이드 |
| `copy-gap-analysis/SKILL.md` | 갭 분석 방법론 및 우선순위 판정 기준 |
