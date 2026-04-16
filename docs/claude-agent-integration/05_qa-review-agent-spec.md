> [REVIEW 반영] P0: claude-kit 형식 전환, 네이밍 정규화 (copy-qa-reviewer.md), 소스 경로 수정. P1: dev-verify-agent 책임 경계 명시.

# QA Review Agent 명세

- 문서 ID: CAI-05
- 작성일: 2026-04-15
- 문서 상태: 명세 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md), [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md), [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md), [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner 홈페이지 카피 품질을 검증하기 위한 Claude QA review agent의 입력, 검증 순서, evidence 판정 기준, acceptance 출력 형식을 정의한다.

## 1. 문서 목적

`qa-review-agent`는 구현자가 만든 결과를 새로운 관점에서 검증한다. 이 agent는 원본 fidelity를 최종 승인하지 않는다. 대신 build/variant guard, screenshot diff, interactive state evidence, 문서 추적성이 모두 준비되었는지 확인하고, 사용자 gate로 넘길 수 있는 검증 결과를 만든다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | 검증 없는 완료 처리 방지 |
| 주요 대상 | build, lint, variant guard, screenshot diff, interactive evidence, acceptance memo |
| 주요 산출물 | QA result report, missing evidence report, acceptance readiness note |
| 금지 | evidence 없이 “통과로 보임” 판정 |
| plan 연결 | 큰 보강 항목은 QA readiness 전에 `/plan-review` 결과와 plan gate 통과 여부를 확인한다. |

## 2. 적용 범위

| 포함 범위 | 설명 |
| --- | --- |
| Build 검증 | default build, demo build, host map build |
| Guard 검증 | invalid `SITE_VARIANT`, invalid `SITE_VARIANT_HOST_MAP` fail-fast |
| Screenshot evidence | baseline/current/diff/report 존재 확인 |
| Interactive evidence | hover/open/sticky/chooser/commitments/menu-open evidence 확인 |
| 문서 추적성 | P5/P15/R3/R5와 새 CAI 문서 간 연결 확인 |
| Acceptance readiness | 사용자 gate로 넘길 수 있는지 판단 |

| 제외 범위 | 이유 |
| --- | --- |
| 실제 원본 체감 최종 승인 | 사용자 gate가 담당 |
| visual gap 원인 분석 | CAI-02가 담당 |
| interaction gap 원인 분석 | CAI-03이 담당 |
| capture manifest 설계 | CAI-04가 담당 |
| CI 연결 구현 | 후속 구현 라운드에서 처리 |

## 3. 입력 자료

| 입력 | 필수 여부 | 사용 방식 |
| --- | --- | --- |
| [05_qa-acceptance.md](../../05_qa-acceptance.md) | 필수 | 최종 QA와 acceptance 기준 |
| [15_r3-qa-automation-execution-plan.md](../../15_r3-qa-automation-execution-plan.md) | 필수 | R3 automation 구조 |
| [17_r5-production-transition-execution-plan.md](../../17_r5-production-transition-execution-plan.md) | 필수 | build/variant guard와 운영 전환 검증 |
| [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md) | 필수 | evidence manifest와 state coverage 기준 |
| R3 runbook/reports | 권장 | 실제 재실행 명령과 artifact 구조 |
| R5 reports | 권장 | preview smoke와 ops readiness 기준 |

## 4. 검증 파이프라인

| 순서 | 검증 | 명령 또는 방법 | 실패 시 처리 |
| --- | --- | --- | --- |
| 1 | 작업 범위 확인 | `git status --short`, staged/unstaged 확인 | 범위 밖 파일은 제외 또는 보고 |
| 2 | default build | `npm run build` | 실패 원인 분류 |
| 3 | demo build | `cmd /c "set SITE_VARIANT=demo&& npm run build"` | variant 관련 실패 분류 |
| 4 | host map build | `cmd /c "set SITE_VARIANT_HOST_MAP=turner.local:turner,northstar.local:demo&& npm run build"` | host routing 실패 분류 |
| 5 | invalid variant guard | `cmd /c "set SITE_VARIANT=invalid&& npm run build"` 실패 기대 | 성공하면 guard regression |
| 6 | screenshot artifact 확인 | R3 baseline/current/diff/report 경로 확인 | missing evidence report |
| 7 | interactive evidence 확인 | hover/open/sticky/chooser/commitments/menu-open 확인 | missing state report |
| 8 | 문서 추적성 확인 | P5/P15/R5/CAI 문서 링크 확인 | drift note |
| 9 | acceptance readiness 작성 | pass/partial/fail 분류 | 사용자 gate로 전달 |

lint 명령은 프로젝트 스크립트 상태에 따라 선택적으로 포함한다. 문서 전용 변경이면 build 대신 링크/문서 검증 중심으로 처리할 수 있다.

## 5. QA Result Schema

QA 결과는 아래 schema로 작성한다.

| 컬럼 | 설명 |
| --- | --- |
| Check ID | `QA-BUILD-01`, `QA-EVIDENCE-01` 등 |
| Category | build, variant, screenshot, interactive, document, acceptance |
| Input | 사용한 명령 또는 파일 |
| Expected | 기대 결과 |
| Actual | 실제 결과 |
| Status | `PASS`, `PARTIAL`, `FAIL`, `SKIPPED` |
| Evidence | 로그, screenshot, report path |
| Risk | 남은 리스크 |
| Action | `auto-fixed`, `queued`, `needs-verification`, `needs-user-input` |

## 6. Evidence 판정 기준

| Evidence 유형 | PASS | PARTIAL | FAIL |
| --- | --- | --- | --- |
| Full-page baseline | 공식 viewport가 모두 존재 | 일부 viewport 누락, missing report 존재 | 핵심 viewport 없음 |
| Screenshot diff | baseline/current/diff/report가 생성됨 | diff만 일부 누락 | report 구조 없음 |
| Interactive state | P0/P1 state evidence 존재 | 보조 state 일부 누락 | header/menu/sticky 핵심 state 없음 |
| Variant guard | valid build 통과, invalid fail-fast | valid는 통과하나 guard 문서 누락 | invalid가 통과하거나 valid가 실패 |
| Document trace | 링크와 역할이 일치 | 링크는 있으나 status 갱신 필요 | 링크 깨짐 또는 문서 충돌 |

## 7. Acceptance Readiness

| 상태 | 의미 | 다음 액션 |
| --- | --- | --- |
| `READY_FOR_USER_GATE` | 필수 build/evidence/document 검증이 통과 | 사용자 확인 요청 |
| `READY_WITH_LOGGED_GAPS` | 핵심은 통과했지만 known gap이 명시됨 | 사용자 확인 + gap 승인 |
| `NEEDS_REPAIR` | 검증 실패가 있어 완료 판정 불가 | 수정 실행 단위로 되돌림 |
| `BLOCKED` | 외부 정보, 권한, 배포 환경 등으로 판단 불가 | 사용자 입력 또는 환경 준비 필요 |

## 8. Agent Prompt 요구사항

| 요구사항 | 설명 |
| --- | --- |
| Fresh-context | 구현 맥락을 그대로 믿지 않고 문서와 artifact를 다시 확인한다. |
| Evidence-first | 모든 PASS에는 명령 결과 또는 파일 경로가 있어야 한다. |
| Fail-fast guard | invalid variant가 실패해야 정상임을 명확히 판단한다. |
| No final fidelity approval | 최종 원본 체감 승인은 사용자 gate로 넘긴다. |
| Missing visibility | 누락 evidence는 숨기지 않고 별도 표로 기록한다. |
| Scope-safe | unrelated dirty files는 stage/commit 대상에서 제외한다. |

## 9. Command 연결

| Command 후보 | 역할 | 출력 |
| --- | --- | --- |
| `/copy-verify` | build, variant guard, evidence, document trace 통합 검증 | QA result report |
| `/copy-evidence-check` | screenshot/interactive artifact 존재 확인 | missing evidence report |
| `/copy-acceptance-readiness` | 사용자 gate로 넘길 readiness 판정 | readiness note |
| `/copy-variant-guard-check` | `SITE_VARIANT`, host map fail-fast 검증 | variant guard report |

`/dev-handoff-verify`와 병행할 경우, 기존 build/lint/test 검증은 dev command가 담당하고 copy-specific evidence 검증은 `/copy-verify`가 담당한다.

## 10. Plan Review 연결

QA review agent는 plan 산출물의 품질을 대신 작성하지 않는다. 다만 Standard 규모 보강이나 header/menu/sticky 같은 P0 interaction 보강에서는 QA readiness 전에 `/plan-review` 또는 동등한 self-review 결과를 확인한다.

| 상황 | 확인할 plan 결과 | QA에서 보는 기준 |
| --- | --- | --- |
| `/plan-prd`를 거친 보강 | PRD 승인 또는 revise 상태 | QA 대상 범위와 acceptance가 명확한지 |
| `/plan-wireframe` 사용 | wireframe/screens/components 산출물 | state 구조가 evidence 요구사항과 연결되는지 |
| `/plan-stitch` 사용 | mapping/context/validation | reference evidence와 구현 context가 분리되지 않았는지 |
| `/plan-bridge` 이후 구현 | bridge context | dev/copy 실행 단위 입력이 승인된 plan과 일치하는지 |
| `/plan-archive` 또는 `/plan-improve` | archive/improvement 기록 | release closeout과 후속 gap routing이 연결되는지 |

PCC는 기획 산출물의 일관성 검토이고, CAI-05는 구현/증거/문서 추적성 검증이다. 두 검증은 중복이 아니라 `plan readiness -> copy QA readiness -> user gate` 순서로 연결한다.

## 11. 문서 추적성 검증

| 출발 | 도착 | 확인 |
| --- | --- | --- |
| P5 QA 기준 | CAI-05 | acceptance 용어와 viewport가 충돌하지 않음 |
| P15 R3 자동화 | CAI-05 | R3 scripts/reports와 evidence 기준이 연결됨 |
| P17 R5 운영 전환 | CAI-05 | build/variant guard 검증이 유지됨 |
| CAI-04 manifest | CAI-05 | required state와 evidence 판정 기준이 일치 |
| CAI-08 roadmap | CAI-05 | QA 통과 후 사용자 gate가 유지됨 |
| CAI-10 plan integration | CAI-05 | plan readiness와 QA readiness가 구분됨 |

## 12. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| QA agent가 evidence 존재만 보고 품질을 승인 | high | `3 / 2 / 1 / 6 / likely / queued` | 최종 fidelity 승인은 user gate로 분리한다. |
| invalid variant guard를 실패로 오판 | medium | `2 / 2 / 1 / 5 / likely / queued` | invalid build는 실패가 기대 결과임을 schema에 명시한다. |
| 문서 전용 변경에 build를 과도하게 요구 | low | `1 / 1 / 1 / 3 / likely / queued` | 변경 유형별 검증 profile을 둔다. |
| unrelated dirty files를 검증/커밋 범위에 포함 | medium | `2 / 2 / 1 / 5 / confirmed / queued` | git status scope review를 첫 단계로 둔다. |
| PCC와 QA readiness를 같은 검증으로 오해 | medium | `2 / 2 / 1 / 5 / likely / queued` | `/plan-review`는 기획 일관성, `/copy-verify`는 evidence/acceptance readiness로 분리한다. |

## 13. 완료 기준

| 기준 | 상태 |
| --- | --- |
| QA review agent의 검증 범위가 정의됨 | 완료 |
| build/variant/evidence/document 검증 순서가 있음 | 완료 |
| QA Result Schema가 정의됨 | 완료 |
| acceptance readiness 상태가 정의됨 | 완료 |
| plan review와 QA readiness의 책임 경계가 정의됨 | 완료 |
| 실제 CI 또는 command 구현은 하지 않음 | 의도적 제외 |

## 14. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| P5/P15/P17과 연결 | 완료 |
| R3/R5 검증 흐름 반영 | 완료 |
| evidence 없는 완료 금지 반영 | 완료 |
| 사용자 gate 유지 | 완료 |
| plan workflow 연결 | `/plan-review`와 QA readiness 경계로 반영 |
| 실제 구현 범위 초과 여부 | 초과 없음 |

## 15. claude-kit 형식 전환 가이드

### claude-kit 구현 정보

| 항목 | 값 |
| --- | --- |
| 파일명 | `copy-qa-reviewer.md` (claude-kit 컨벤션: `{domain}-{role}.md`) |
| 소스 경로 | `src/claude/copy/agents/copy-qa-reviewer.md` |
| 배포 경로 | `.claude/agents/copy-qa-reviewer.md` |

### YAML 프론트매터 템플릿

실제 에이전트 파일 작성 시 아래 YAML 프론트매터를 파일 최상단에 배치한다.

```yaml
---
name: copy-qa-reviewer
description: 빌드, 배리언트 가드, 스크린샷 diff, 인터랙티브 증거를 검증하는 QA 리뷰 에이전트.
tools: ["Read", "Glob", "Grep", "Bash"]
model: sonnet
---
```

### Agent_Prompt 래핑

실제 `src/claude/copy/agents/copy-qa-reviewer.md` 파일을 생성할 때, 본 명세의 핵심 프롬프트 내용은 `<Agent_Prompt>` XML 블록으로 감싸야 한다. claude-kit 에이전트 표준 형식(`dev-architect.md` 참조)에 따라 `<Role>`, `<Constraints>`, `<Output_Format>` 등의 하위 XML 태그를 사용한다.

### 기존 에이전트와의 책임 경계

| 에이전트 | 소스 경로 | 책임 |
| --- | --- | --- |
| `dev-verify-agent.md` | `src/claude/dev/agents/` | 일반 빌드/테스트/린터 검증 |
| `copy-qa-reviewer.md` | `src/claude/copy/agents/` | Turner 충실도 특화 검증 (배리언트 가드, 스크린샷 diff, 인터랙티브 증거) |

분리 기준: `dev-verify-agent`는 코드 정확성(빌드 성공, 테스트 통과, 린터 클린)을 검증하고, `copy-qa-reviewer`는 시각적/인터랙션 충실도(배리언트 가드 fail-fast, 스크린샷 diff 존재, 인터랙티브 상태 증거)를 검증한다. 두 검증은 중복이 아니라 `dev-verify -> copy-qa-review -> user gate` 순서로 연결된다.

### 관련 스킬 제안

| 스킬 경로 | 설명 |
|-----------|------|
| `copy-qa-workflow/SKILL.md` | QA 검증 파이프라인 실행 워크플로우 (9단계 검증 순서, 증거 판정 기준) |
| `copy-variant-testing/SKILL.md` | 배리언트 가드 테스트 방법론 (valid/invalid 빌드, host map 검증) |
