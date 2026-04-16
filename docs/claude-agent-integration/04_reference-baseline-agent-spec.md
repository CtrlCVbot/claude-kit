> [REVIEW 반영] P0: claude-kit 형식 전환, 네이밍 정규화 (copy-reference-baseline.md), 소스 경로 수정.

# Reference Baseline Agent 명세

- 문서 ID: CAI-04
- 작성일: 2026-04-15
- 문서 상태: 명세 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner 원본과 현재 구현을 같은 축으로 비교하기 위한 viewport, state, capture manifest, 파일명 규칙을 정의하는 Claude Agent 명세를 작성한다.

## 1. 문서 목적

`reference-baseline-agent`는 visual/interaction/QA agent의 입력 품질을 책임진다. 이 agent의 핵심은 캡처를 직접 “잘 찍는 것”이 아니라, 어떤 viewport와 어떤 상태를 어떤 이름으로 수집해야 이후 비교가 흔들리지 않는지 정의하고 누락을 점검하는 것이다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | live/current 기준선 비교 축 통일 |
| 주요 대상 | viewport, state list, filename, capture batch, evidence manifest |
| 주요 산출물 | baseline manifest, missing evidence report, capture readiness note |
| 금지 | 기준선 누락 상태에서 visual/interaction 완료 판정 |
| plan 연결 | capture 범위 확장이나 새 state 추가는 `/plan-idea`와 `/plan-screen`으로 필요성과 우선순위를 먼저 확인한다. |

## 2. 적용 범위

| 포함 범위 | 설명 |
| --- | --- |
| Viewport 기준 | `1440 / 1280 / 1024 / 768 / 390` 공식 기준 유지 |
| Full-page baseline | live/current full-page capture 세트 정의 |
| Header states | idle, hover, menu-open, sticky, search-open |
| Hero states | idle, chooser-open, scroll handoff |
| Commitments states | 대표 state `01`, `05`, `06` |
| Responsive states | 1024/768/390 density와 mobile menu state |
| Variant baseline | `turner`, `demo` 대표 baseline과 menu-open |
| Manifest | capture batch, source, viewport, state, file path, status |

| 제외 범위 | 이유 |
| --- | --- |
| 실제 Playwright script 구현 | R3 automation 또는 별도 구현 단위가 담당 |
| visual gap 판단 | CAI-02가 담당 |
| interaction gap 판단 | CAI-03이 담당 |
| pass/fail acceptance 판정 | CAI-05가 담당 |

## 3. 기준 문서와 입력 자료

| 입력 | 필수 여부 | 사용 방식 |
| --- | --- | --- |
| [02_reference-baseline.md](../../02_reference-baseline.md) | 필수 | 원본 기준선과 측정 기준 |
| [10_phase2-detail-fidelity-plan.md](../../10_phase2-detail-fidelity-plan.md) | 필수 | Phase 2에서 필요한 state 기준 |
| [11_phase2-execution-breakdown.md](../../11_phase2-execution-breakdown.md) | 필수 | Phase 0 reference refresh 기준 |
| [15_r3-qa-automation-execution-plan.md](../../15_r3-qa-automation-execution-plan.md) | 필수 | R3 baseline/diff output 구조 |
| R3 manifest/scripts | 권장 | 실제 자동화 naming과 호환성 확인 |
| [05_qa-acceptance.md](../../05_qa-acceptance.md) | 권장 | QA viewport와 acceptance 기준 확인 |

## 4. 출력 산출물

| 산출물 | 형식 | 설명 |
| --- | --- | --- |
| Baseline manifest | JSON 또는 Markdown table | source/variant/viewport/state/path/status 정의 |
| Capture batch note | Markdown | 특정 수집 라운드의 날짜, 기준 URL, local URL, scope |
| Missing evidence report | Markdown table | 필요한데 없는 capture 목록 |
| Pairing matrix | Markdown table | live/current가 1:1로 비교 가능한지 확인 |
| Readiness note | Markdown section | CAI-02/03/05가 사용할 수 있는 상태인지 판단 |

## 5. Manifest Schema

manifest는 최소 아래 필드를 가져야 한다.

| 필드 | 설명 | 예시 |
| --- | --- | --- |
| `capture_id` | 고유 ID | `turner-live-1440-fullpage` |
| `source` | `live`, `current`, `approved`, `demo` 등 | `live` |
| `variant` | `turner`, `demo`, 또는 `none` | `turner` |
| `viewport` | 공식 viewport | `1440` |
| `state` | fullpage, idle, hover-our-company, menu-open 등 | `hover-our-company` |
| `url` | 기준 URL 또는 local URL | `https://www.turnerconstruction.com/` |
| `file_path` | evidence 경로 | `output/playwright/.../header-hover.png` |
| `captured_at` | 기준 날짜/시간 | `2026-04-15` |
| `status` | `required`, `captured`, `missing`, `stale`, `deferred` | `captured` |
| `paired_with` | 비교 대상 capture_id | `turner-current-1440-hover-our-company` |
| `notes` | 품질/주의사항 | `live panel partially animated` |

## 6. State Naming 규칙

| 상태 | naming | 설명 |
| --- | --- | --- |
| Full-page | `fullpage` | header부터 footer까지 전체 |
| Header idle | `header-idle` | scrollY 0, menu closed |
| Header hover | `header-hover-{nav}` | 예: `header-hover-our-company` |
| Menu open | `menu-open` | global menu 또는 mobile menu open |
| Search open | `search-open` | search overlay open |
| Sticky | `sticky-y-{value}` | 예: `sticky-y-80` |
| Hero idle | `hero-idle` | first viewport initial |
| Chooser open | `chooser-open` | build chooser open |
| Commitments | `commitments-{index}` | 예: `commitments-01` |
| Responsive menu | `mobile-menu-open` | 390 기준 mobile navigation open |

파일명은 아래 패턴을 권장한다.

```text
{source}-{variant}-{viewport}-{state}.{ext}
```

예시:

```text
live-turner-1440-header-hover-our-company.png
current-turner-1440-header-hover-our-company.png
current-demo-390-mobile-menu-open.png
```

## 7. 필수 Capture Set

### 7.1 Turner 기본 세트

| Viewport | Required states |
| --- | --- |
| 1440 | `fullpage`, `header-idle`, `header-hover-our-company`, `menu-open`, `sticky-y-80`, `hero-idle`, `chooser-open`, `commitments-01`, `commitments-05`, `commitments-06` |
| 1280 | `fullpage`, `header-idle`, `hero-idle`, `sticky-y-80` |
| 1024 | `fullpage`, `header-idle`, `commitments-01` |
| 768 | `fullpage`, `header-idle`, `commitments-01` |
| 390 | `fullpage`, `mobile-menu-open`, `hero-idle`, `commitments-01` |

### 7.2 Demo variant 대표 세트

| Viewport | Required states |
| --- | --- |
| 1440 | `fullpage`, `header-idle`, `menu-open` |
| 390 | `fullpage`, `mobile-menu-open` |

Demo는 Turner 원본 fidelity 비교가 아니라 구조 안정성과 variant safety 검증을 목적으로 한다.

## 8. Pairing Matrix 기준

| Pairing | 완료 기준 |
| --- | --- |
| live vs current | 같은 viewport/state가 양쪽에 존재 |
| approved vs current | R3 diff에서 같은 viewport/state가 존재 |
| turner vs demo | 구조 확인용 대표 state가 존재 |
| desktop vs responsive | 같은 section이 viewport별로 추적 가능 |
| static vs interactive | fullpage와 state capture가 같은 batch 기준 |

pair가 없으면 visual/interaction agent는 `missing evidence`로 표시하고 구현 제안을 확정하지 않는다.

## 9. Agent Prompt 요구사항

| 요구사항 | 설명 |
| --- | --- |
| Manifest-first | capture를 평가하기 전에 manifest를 먼저 작성한다. |
| Pairing-required | 비교 가능한 live/current pair가 없으면 gap 확정 금지 |
| Stale detection | 기준 날짜가 오래되었거나 R 단계와 맞지 않으면 `stale` 표시 |
| Variant-aware | Turner fidelity와 demo safety를 구분한다. |
| No visual judgment | 시각 차이의 원인 판단은 CAI-02/03으로 넘긴다. |
| Missing report | 누락 상태는 숨기지 않고 별도 table로 남긴다. |

## 10. Command 연결

| Command 후보 | 역할 | 출력 |
| --- | --- | --- |
| `/copy-reference-refresh` | 필요한 capture set과 batch note 생성 | baseline manifest |
| `/copy-capture-manifest` | 기존 output을 scan해 manifest 작성 | manifest + missing report |
| `/copy-state-pairing` | live/current/approved/current pair 확인 | pairing matrix |
| `/copy-evidence-readiness` | CAI-02/03/05가 쓸 수 있는 evidence인지 판단 | readiness note |

command 상세는 `06_command-workflow-spec.md`에서 다룬다.

## 11. Plan Workflow 연결

reference baseline agent는 캡처 범위를 자동으로 늘리지 않는다. 캡처 수가 늘어나면 QA 비용과 artifact 관리 비용이 같이 증가하므로, 아래 조건에서는 plan workflow를 거친다.

| 상황 | plan 연결 | 이유 |
| --- | --- | --- |
| 새 interactive state 추가 | `/plan-idea` | 왜 필요한 state인지 추적 |
| viewport 추가 또는 공식 viewport 변경 | `/plan-screen` | 기존 P2/P5 기준과 충돌 가능 |
| live 기준선 재수집 범위 확대 | `/plan-draft` | capture batch, stale 처리, QA 비용 정리 |
| menu/scroll/animation 중간 상태 수집 | `/plan-prd` 또는 `/plan-wireframe` | state sequence와 evidence naming 기준 필요 |
| 승인된 capture 확장을 구현/수집으로 넘김 | `/plan-bridge` 또는 `/copy-reference-refresh` | capture manifest와 실행 단위 연결 |

`.plans/`가 아직 없으면 plan command를 즉시 실행하지 않고, CAI-09의 plan readiness와 사용자 gate를 먼저 확인한다.

## 12. 검증 기준

| 검증 항목 | 방법 | 통과 기준 |
| --- | --- | --- |
| viewport coverage | manifest에서 공식 viewport 확인 | Turner fullpage 5종 존재 |
| state coverage | required states 대조 | P0 state 누락 없음 또는 missing report 존재 |
| pairing coverage | `paired_with` 확인 | P0 gap 분석 대상은 pair 존재 |
| stale 여부 | captured_at과 기준 라운드 확인 | stale capture는 명시 표시 |
| variant 분리 | turner/demo 목적 대조 | demo를 Turner fidelity 기준으로 오판하지 않음 |

## 13. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| live 사이트 변화로 기준선이 흔들림 | medium | `2 / 2 / 1 / 5 / confirmed / queued` | capture batch date와 stale 표시를 필수화한다. |
| pair가 없는 상태를 비교 대상으로 삼음 | high | `3 / 2 / 1 / 6 / likely / queued` | pairing matrix 없이는 P0 gap 확정 금지 |
| demo variant를 원본 fidelity 기준으로 평가 | medium | `2 / 2 / 1 / 5 / likely / queued` | demo 목적을 structure safety로 분리 |
| 파일명 규칙이 R3와 어긋남 | medium | `2 / 1 / 1 / 4 / likely / queued` | R3 manifest와 naming 호환성 검토 |
| capture 범위가 gate 없이 계속 늘어남 | high | `3 / 2 / 1 / 6 / likely / queued` | 새 viewport/state는 `/plan-screen` 또는 사용자 gate 후 추가한다. |

## 14. 완료 기준

| 기준 | 상태 |
| --- | --- |
| viewport/state/capture manifest 기준이 정의됨 | 완료 |
| Turner와 demo의 capture 목적이 구분됨 | 완료 |
| pair/missing/stale 판단 기준이 있음 | 완료 |
| command 연결 후보가 정의됨 | 완료 |
| plan workflow를 통한 capture 확장 gate가 정의됨 | 완료 |
| 실제 capture script 구현은 하지 않음 | 의도적 제외 |

## 15. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| P2/P10/P11/P15와 연결 | 완료 |
| CAI-02/03/05의 입력 역할 명확화 | 완료 |
| viewport 기준 일관성 | 완료 |
| state naming 규칙 정의 | 완료 |
| plan workflow 연결 | capture 범위 확장 gate로 반영 |
| 실제 구현 범위 초과 여부 | 초과 없음 |

## 16. claude-kit 형식 전환 가이드

### claude-kit 구현 정보

| 항목 | 값 |
| --- | --- |
| 파일명 | `copy-reference-baseline.md` (claude-kit 컨벤션: `{domain}-{role}.md`) |
| 소스 경로 | `src/claude/copy/agents/copy-reference-baseline.md` |
| 배포 경로 | `.claude/agents/copy-reference-baseline.md` |

### YAML 프론트매터 템플릿

실제 에이전트 파일 작성 시 아래 YAML 프론트매터를 파일 최상단에 배치한다.

```yaml
---
name: copy-reference-baseline
description: 캡처 매니페스트, 뷰포트 표준, 상태 네이밍을 정의하는 레퍼런스 베이스라인 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### Agent_Prompt 래핑

실제 `src/claude/copy/agents/copy-reference-baseline.md` 파일을 생성할 때, 본 명세의 핵심 프롬프트 내용은 `<Agent_Prompt>` XML 블록으로 감싸야 한다. claude-kit 에이전트 표준 형식(`dev-architect.md` 참조)에 따라 `<Role>`, `<Constraints>`, `<Output_Format>` 등의 하위 XML 태그를 사용한다.

### 관련 스킬 제안

| 스킬 경로 | 설명 |
| --- | --- |
| `copy-evidence-management/SKILL.md` | 증거 수집/관리 패턴 |
