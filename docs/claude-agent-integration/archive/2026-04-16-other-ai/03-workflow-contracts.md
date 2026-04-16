# Workflow Contracts

- 문서 ID: CAI-03
- 목적: `plan`, `copy`, `dev` 도메인의 workflow 경계와 `/copy-*` command contract를 정의한다.
- 선행 문서: [01-scope-and-decisions.md](./01-scope-and-decisions.md), [02-target-architecture.md](./02-target-architecture.md)

## 1. Layer Boundary

| Layer | 주요 책임 | 입력 | 출력 | 금지 |
| --- | --- | --- | --- | --- |
| `plan` | idea, screening, PRD, wireframe, stitch, bridge | 사용자 요청, backlog, product context | approved plan, bridge context | screenshot evidence 품질 판정, 코드 구현 |
| `copy` | reference/current evidence contract, gap board, copy QA readiness | approved plan, reference/current evidence, changed files | gap board, QA result, readiness note | 사용자 gate 우회, 직접 구현 |
| `dev` | approved context 기반 구현, build/test/lint | plan bridge, execution unit, source files | code changes, test/build result | 원본 fidelity 최종 승인 |

## 2. 실행 단위 lifecycle

모든 `copy` workflow는 아래 6단계를 따른다.

| 단계 | 목적 | 완료 기준 |
| --- | --- | --- |
| 1. 계획 | 범위, 입력, 산출물, 검증 방법 정의 | 실행 단위 계획 존재 |
| 2. 계획 피드백 | 모호한 범위와 gate 점검 | high risk 처리 방침 기록 |
| 3. 실행 | 승인된 범위 내 문서/분석/구현 수행 | 변경 파일이 범위와 일치 |
| 4. 실행 피드백 | diff 또는 결과물 self-review | 자동 반영/보류 구분 |
| 5. 검증 | build, link, schema, evidence, setup 검증 | PASS/PARTIAL/FAIL 기록 |
| 6. 검증 피드백 | 실패 또는 누락 보완 | 잔여 리스크와 다음 액션 기록 |

## 3. Feature Routing

`copy` 도메인 v1은 Feature 유형을 두 가지로 단순화한다.

| 유형 | 정의 | 경로 |
| --- | --- | --- |
| Copy Feature | 기준 화면/상태와 현재 구현 사이의 시각/인터랙션 차이를 닫는 작업 | `plan -> copy -> dev -> copy verify` |
| Dev Feature | 기준 화면과 직접 대응하지 않는 기능, 인프라, 데이터, 성능 작업 | `plan -> dev -> dev verify` |

기존 문서의 Hybrid Feature는 독립 유형으로 두지 않는다. 필요한 경우 Copy Feature의 `reference-only` mode로 처리한다.

## 4. Command Flow

| Command | 목적 | 주요 입력 | 주요 출력 | Gate |
| --- | --- | --- | --- | --- |
| `/copy-reference-refresh` | reference/current capture 요구사항과 manifest 준비 | URL, viewport, state list, output root | baseline manifest, missing evidence report | capture scope 변경 시 user-review |
| `/copy-visual-review` | visual gap 분석 | paired evidence, target area | visual gap board | P0/P1 gap user-review |
| `/copy-interaction-review` | interaction/state gap 분석 | state evidence, trigger list | state map, transition gap board | P0 state user-review |
| `/copy-gap-board` | visual/interaction gap 통합 | visual gap, interaction gap, known issues | prioritized gap board | P0 실행 후보 user-review |
| `/copy-plan-unit` | gap을 실행 단위 계획으로 변환 | approved gap row, plan bridge | execution unit plan | 구현 전 계획 피드백 |
| `/copy-verify` | copy QA 검증 | changed files, evidence root, expected checks | QA result, readiness note | READY 계열만 closeout |
| `/copy-closeout` | 실행 단위 마감 | QA result, residual issues | closeout memo | phase/round 종료 시 승인 대기 |

## 5. Core Schemas

### 5.1 Visual Gap Row

| 필드 | 설명 |
| --- | --- |
| `gap_id` | `VF-{AREA}-{NN}` |
| `area` | Header, Hero, Section 등 |
| `viewport` | 공식 viewport 또는 `all` |
| `current_state` | 현재 구현 관찰 |
| `reference_state` | 기준 화면 관찰 |
| `difference` | 체감 차이의 원인 |
| `proposed_adjustment` | 구현 후보 |
| `evidence` | screenshot/report path |
| `verification` | 재확인 방법 |
| `priority` | `P0`, `P1`, `P2` |
| `gate` | `self-review`, `user-review` |

### 5.2 Interaction State Row

| 필드 | 설명 |
| --- | --- |
| `state_id` | `IF-{AREA}-{STATE}-{NN}` |
| `trigger` | hover, click, scroll, focus 등 |
| `entry_condition` | 상태 진입 조건 |
| `active_visual` | 활성 상태의 시각 요소 |
| `motion` | duration, easing, opacity, transform |
| `exit_condition` | 상태 종료 조건 |
| `reference_evidence` | 기준 상태 evidence |
| `current_evidence` | 현재 상태 evidence |
| `gap` | 차이 요약 |
| `verification` | 재확인 방법 |
| `gate` | review gate |

### 5.3 Evidence Manifest

| 필드 | 설명 |
| --- | --- |
| `capture_id` | 고유 ID |
| `source` | `reference`, `current`, `approved`, `demo` 등 |
| `viewport` | 비교 viewport |
| `state` | fullpage, hover, sticky 등 |
| `file_path` | evidence 경로 |
| `captured_at` | 수집 시점 |
| `status` | `required`, `captured`, `missing`, `stale`, `deferred` |
| `paired_with` | 비교 대상 capture ID |

### 5.4 QA Result

| 필드 | 설명 |
| --- | --- |
| `check_id` | `QA-BUILD-01`, `QA-EVIDENCE-01` 등 |
| `category` | build, variant, screenshot, interactive, document |
| `input` | 명령 또는 파일 |
| `expected` | 기대 결과 |
| `actual` | 실제 결과 |
| `status` | `PASS`, `PARTIAL`, `FAIL`, `SKIPPED` |
| `evidence` | 로그 또는 report path |
| `risk` | 남은 리스크 |
| `action` | `auto-fixed`, `queued`, `needs-verification`, `needs-user-input` |

## 6. Gate Contract

| Gate | 시점 | 기준 |
| --- | --- | --- |
| Plan Gate | `/plan-screen`, PRD, bridge 완료 시 | 사용자가 실제 구현 후보를 승인 |
| Evidence Gate | capture scope 또는 P0/P1 state 변경 시 | evidence 비용과 범위를 확인 |
| Copy Gate | P0/P1 gap이 실행 후보가 될 때 | 자동으로 우선순위를 확정하지 않음 |
| Dev Gate | `copy-plan-unit` 또는 `plan-bridge` 이후 | 구현 범위가 승인된 context와 일치 |
| Closeout Gate | phase/round 종료 시 | 승인 대기 상태로 멈춤 |
| Generated Output Gate | setup 후 `.claude` 또는 plugin output 갱신 시 | source와 output 매핑 검증 |

## 7. Workflow acceptance criteria

| 기준 | 완료 조건 |
| --- | --- |
| layer boundary | `plan`, `copy`, `dev` 책임이 중복 없이 설명됨 |
| command contract | `/copy-*` command별 input/output/gate가 존재 |
| schema | gap/state/manifest/QA result schema가 정의됨 |
| gate | P0/P1과 generated output gate가 명시됨 |
| legacy isolation | 특정 고객 사이트 이름 없이 package-level contract로 설명됨 |
