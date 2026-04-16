> [REVIEW 반영] P0: CommonJS 형식 요구사항 추가, 소스 경로 수정, 룰 배치 결정. P1: 훅 우선순위 규칙 추가, 충돌 해결 정책.

# Claude Hooks and Rules 도입 계획

- 문서 ID: CAI-07
- 작성일: 2026-04-15
- 문서 상태: 계획 초안 완료
- 선행 문서: [06_command-workflow-spec.md](./06_command-workflow-spec.md), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: Turner 홈페이지 정밀 카피 프로젝트에 필요한 Claude hook/rule 후보와 blocking/reminder 정책을 정의한다.

## 1. 문서 목적

이 문서는 실제 `.claude/hooks/` (소스: `src/claude/copy/hooks/`), `.claude/rules/` (소스: `src/claude/copy/rules/`), `.claude/settings.json`을 수정하기 전에 어떤 안전장치를 추가할지 계획한다. 핵심은 자동화가 프로젝트의 사용자 gate와 실행 단위 규칙을 망가뜨리지 않게 하면서, evidence 누락과 scope drift를 줄이는 것이다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | copy fidelity 작업의 scope, evidence, gate, doc drift를 guard |
| 주요 대상 | copy evidence reminder, copy scope guard, copy gate stop, copy doc drift check |
| 주요 산출물 | hook/rule 후보, blocking 정책, 적용 순서 |
| 금지 | 초기부터 모든 visual 작업을 hard blocking 처리 |

## 2. 현재 `.claude` 안전장치 요약

| 현재 파일 | 역할 | copy 프로젝트 관점 |
| --- | --- | --- |
| `.claude/hooks/dev-feature-scope-guard.js` (소스: `src/claude/dev/hooks/dev-feature-scope-guard.js`) | active feature binding 밖 code edit 차단 | 실행 단위 scope guard로 확장 가능 |
| `.claude/hooks/dev-tdd-guard.js` (소스: `src/claude/dev/hooks/dev-tdd-guard.js`) | 테스트 없는 code edit 차단 | visual polish에는 과도할 수 있음 |
| `.claude/hooks/edit-tracker.js` (소스: `src/claude/core/hooks/edit-tracker.js`) | edit 파일 추적 | 실행 단위 closeout에 유용 |
| `.claude/hooks/code-quality-reminder.js` (소스: `src/claude/core/hooks/code-quality-reminder.js`) | edit 후 품질 reminder | evidence reminder로 확장 가능 |
| `.claude/hooks/security-auto-trigger.js` (소스: `src/claude/core/hooks/security-auto-trigger.js`) | 보안 관련 변경 감지 | env/host map 변경 시 유지 |
| `.claude/hooks/session-wrap-suggest.js` (소스: `src/claude/core/hooks/session-wrap-suggest.js`) | 세션 종료 정리 제안 | Phase/R closeout과 연결 가능 |
| `.claude/hooks/plan-doc-guard.js` (소스: `src/claude/plan/hooks/plan-doc-guard.js`) | `.plans/` planning 문서 구조 검증과 planning 중 code edit 차단 의도 | plan workflow 도입 시 copy hook과 충돌 여부 검증 필요 |
| `.claude/rules/verification.md` (소스: `src/claude/core/rules/verification.md`) | 검증 원칙 | screenshot/state evidence 규칙 추가 후보 |
| `.claude/rules/interaction.md` (소스: `src/claude/core/rules/interaction.md`) | 사용자 상호작용 규칙 | 사용자 gate 규칙 강화 후보 |

현재 `.claude/rules/`에는 plan 전용 rule 파일이 확인되지 않는다. 따라서 copy 전용 rule을 추가할 때 “기존 plan rule과 통합한다”는 전제를 두지 않고, command/agent/skill/hook 중심으로 제공된 plan 기능과 충돌하지 않는지 별도로 확인한다.

## 3. 추가 Hook 후보

| Hook 후보 | 동작 | 기본 모드 | 적용 시점 | 목적 |
| --- | --- | --- | --- | --- |
| `copy-evidence-reminder.js` | visual/interaction 관련 파일 수정 후 evidence 갱신 알림 | reminder | PostToolUse Edit/Write | screenshot/state evidence 누락 방지 |
| `copy-scope-guard.js` | 현재 실행 단위 허용 경로 밖 수정 경고 | reminder -> later blocking | PreToolUse Edit/Write | 범위 밖 수정 감지 |
| `copy-gate-stop.js` | Phase/R closeout 이후 다음 단계 자동 진행 경고 | blocking 후보 | Stop 또는 command 종료 | 사용자 gate 유지 |
| `copy-doc-drift-check.js` | P3/P5/P6/P18/CAI와 실제 변경 drift 알림 | reminder | PostToolUse Edit/Write | 문서-구현 불일치 방지 |
| `copy-variant-env-guard.js` | `SITE_VARIANT`, host map 변경 시 QA 요구 | reminder | PostToolUse Edit/Write | variant 운영 regression 방지 |

## 4. 추가 Rule 후보

| Rule 후보 | 경로 | 목적 |
| --- | --- | --- |
| Copy fidelity rule | `.claude/rules/copy-fidelity.md` (소스: `src/claude/copy/rules/copy-fidelity.md`) | Turner 홈페이지 정밀 카피 판단 기준 |
| Copy evidence rule | `.claude/rules/copy-evidence.md` (소스: `src/claude/copy/rules/copy-evidence.md`) | screenshot/state evidence naming과 품질 기준 |
| Copy gate rule | `.claude/rules/copy-gates.md` (소스: `src/claude/copy/rules/copy-gates.md`) | 실행 단위, Phase, R 단계 승인 gate |
| Copy command rule | `.claude/rules/copy-commands.md` (소스: `src/claude/copy/rules/copy-commands.md`) | `/copy-*` command 사용 기준 |
| Copy variant rule | `.claude/rules/copy-variant.md` (소스: `src/claude/copy/rules/copy-variant.md`) | Turner/demo/host map 운영 기준 |

## 5. Blocking vs Reminder 정책

| 상황 | 초기 정책 | 이유 | 향후 전환 |
| --- | --- | --- | --- |
| visual 관련 파일 수정 후 evidence 없음 | reminder | 문서/스타일 작업 중 false positive 가능 | 반복 누락 시 blocking 검토 |
| 실행 단위 scope 밖 code edit | reminder | CAI 단계에서는 문서 작성 중심 | 실제 implementation-unit-agent 도입 후 blocking |
| Phase/R closeout 후 다음 단계 자동 진행 | blocking | 사용자 gate가 핵심 운영 원칙 | 계속 blocking 유지 |
| `.env.example` 또는 variant routing 변경 | reminder + QA 요구 | 운영 영향이 있으나 문서 수정도 가능 | production deploy 전 blocking 검토 |
| P3/P5/P6와 구현 drift 의심 | reminder | drift 판정이 맥락 의존적 | readiness 단계에서 check-only command로 보강 |
| `.plans/` 문서 구조 누락 | existing blocking intent | plan-doc-guard가 이미 연결됨 | 실제 정상 동작과 false positive를 CAI-09에서 검증 |
| planning 중 code edit 시도 | existing blocking intent | plan 단계에서는 구현을 막는 것이 원칙 | hook 구현상 실제 차단 범위는 별도 확인 |

## 6. Hook 상세 설계 초안

### 6.1 `copy-evidence-reminder.js`

| 항목 | 내용 |
| --- | --- |
| Trigger | `src/components`, `src/styles`, `src/content`, `public/media`, `public/brands` 변경 |
| Output | evidence refresh reminder |
| Message | 관련 CAI/P15 문서와 권장 capture command 안내 |
| Blocking | 초기에는 하지 않음 |
| Risk | 문서-only 변경에도 과도한 알림 가능 |

### 6.2 `copy-scope-guard.js`

| 항목 | 내용 |
| --- | --- |
| Trigger | Edit/Write 대상이 현재 실행 단위 scope 밖일 때 |
| Input | execution unit id, allowed path list |
| Output | scope warning 또는 block |
| Blocking | 초기에는 warning |
| Risk | scope 문서가 없으면 정상 작업도 막을 수 있음 |

### 6.3 `copy-gate-stop.js`

| 항목 | 내용 |
| --- | --- |
| Trigger | closeout 문서에 `승인 대기` 상태가 생긴 뒤 다음 Phase/R 작업 시도 |
| Output | 사용자 승인 필요 메시지 |
| Blocking | 가능 |
| Risk | 자동 판정이 어렵기 때문에 command workflow와 함께 사용 |

### 6.4 `copy-doc-drift-check.js`

| 항목 | 내용 |
| --- | --- |
| Trigger | 구현 파일 수정 후 |
| Check | P3/P5/P6/P18/CAI 문서의 관련 링크나 기준 존재 여부 |
| Output | doc sync reminder |
| Blocking | 하지 않음 |
| Risk | drift false positive |

### 6.5 `plan-doc-guard.js` 현황 검증

| 항목 | 내용 |
| --- | --- |
| 현재 위치 | `.claude/hooks/plan-doc-guard.js` (소스: `src/claude/plan/hooks/plan-doc-guard.js`) |
| settings 연결 | `PreToolUse`의 `Edit|Write` matcher에 연결 |
| 의도 | `.plans/` PRD/wireframe/overview 필수 섹션 검증, planning 중 code edit 차단 |
| CAI 관점 | plan 산출물 품질 guard로 유지하되, copy hook 후보와 중복 차단되지 않는지 확인 |
| 검증 필요 | `.plans/` 문서 작성, 일반 CAI 문서 작성, 코드 파일 편집 시나리오별 동작 확인 |
| 주의 | 본 문서 단계에서는 hook 수정이 아니라 현황 반영과 검증 항목 추가만 수행 |

## 7. Rule 상세 설계 초안

### 7.1 `copy-fidelity.md`

| 섹션 | 내용 |
| --- | --- |
| 목적 | Turner 원본 카피 품질 기준 |
| visual 기준 | layout/type/spacing/card/CTA/divider |
| interaction 기준 | hover/open/sticky/state/scroll rhythm |
| responsive 기준 | 1440/1280/1024/768/390 |
| 금지 | reference 없는 구현, 추상적 완료 판정 |

### 7.2 `copy-evidence.md`

| 섹션 | 내용 |
| --- | --- |
| evidence 유형 | full-page, crop, interactive, diff, report |
| naming | CAI-04 state naming 규칙 |
| 품질 기준 | 잘림, 로딩 미완료, wrong state, stale 표시 |
| 검증 | CAI-05 QA result schema |

### 7.3 `copy-gates.md`

| 섹션 | 내용 |
| --- | --- |
| 실행 단위 gate | 6단계 lifecycle |
| 소그룹/Phase gate | summary와 검증 필요 |
| 대그룹/R gate | `승인 대기` 후 중단 |
| commit gate | 실행 단위 1개 종료 후 commit |

## 8. 적용 순서

| 순서 | 항목 | 이유 | Gate |
| --- | --- | --- | --- |
| 1 | `copy-fidelity.md` rule | agent가 공통으로 참조할 기준 | self-review |
| 2 | `copy-evidence.md` rule | evidence naming/품질 기준 필요 | self-review |
| 3 | `copy-gates.md` rule | 사용자 gate 보존 | user-review |
| 4 | `copy-evidence-reminder.js` | 낮은 위험으로 evidence 누락 방지 | self-review |
| 5 | `copy-doc-drift-check.js` | 문서 drift 감지 | self-review |
| 6 | `copy-gate-stop.js` | gate 우회 방지 | user-review |
| 7 | `copy-scope-guard.js` | implementation 단계에서만 강화 | user-review |

## 9. `settings.json` 반영 원칙

| 원칙 | 설명 |
| --- | --- |
| 최소 변경 | rule 파일만 추가하는 단계에서는 settings 변경을 피한다. |
| reminder 우선 | 새 hook은 초기에 reminder로 시작한다. |
| destructive deny 유지 | 기존 destructive git/FS deny 정책은 건드리지 않는다. |
| WebFetch deny 유지 | 현재 프로젝트는 local/reference 중심이므로 기존 deny를 유지한다. |
| hook 추가 전 문서 승인 | CAI-09 readiness 이후에만 settings hook 등록을 진행한다. |
| plan hook 보존 | 이미 연결된 `plan-doc-guard.js`는 임의로 제거하지 않고, copy hook 추가 전 충돌 검증을 먼저 수행한다. |
| `.plans/` gate | `.plans/` 산출물 생성 전에는 plan hook이 실제 운영 산출물을 다루지 않으므로, 첫 `/plan-*` 실행 전 사용자 승인을 받는다. |

## 10. claude-kit 훅 구현 형식

claude-kit 훅은 CommonJS `.js` 파일이며 아래 형식을 따른다. 참조: `src/claude/dev/hooks/dev-tdd-guard.js`, `src/claude/core/hooks/edit-tracker.js`.

### 필수 패턴

| 항목 | 요구사항 |
| --- | --- |
| 셔뱅 | `#!/usr/bin/env node` |
| 이벤트 타입 주석 | `@event PreToolUse\|PostToolUse\|hooks.stop` |
| exit 코드 | `0` = 허용/정보, `2` = 블로킹 |
| 모듈 형식 | CommonJS (`module.exports` 또는 exit 기반) |
| `package.json` | `src/claude/copy/hooks/package.json` — `{"type": "commonjs"}` |

### 소스/배포 경로

| 훅 | 소스 경로 | 배포 경로 |
| --- | --- | --- |
| `copy-evidence-reminder.js` | `src/claude/copy/hooks/copy-evidence-reminder.js` | `.claude/hooks/copy-evidence-reminder.js` |
| `copy-scope-guard.js` | `src/claude/copy/hooks/copy-scope-guard.js` | `.claude/hooks/copy-scope-guard.js` |
| `copy-gate-stop.js` | `src/claude/copy/hooks/copy-gate-stop.js` | `.claude/hooks/copy-gate-stop.js` |
| `copy-doc-drift-check.js` | `src/claude/copy/hooks/copy-doc-drift-check.js` | `.claude/hooks/copy-doc-drift-check.js` |
| `copy-variant-env-guard.js` | `src/claude/copy/hooks/copy-variant-env-guard.js` | `.claude/hooks/copy-variant-env-guard.js` |

## 11. 룰 배치 결정

### 선택: 옵션 B — `src/claude/copy/rules/copy-*.md` (copy 도메인 독립성 유지)

| 항목 | 내용 |
| --- | --- |
| 근거 | 롤백 용이성, 선택적 도입 가능, 도메인 격리 |
| 소스 경로 | `src/claude/copy/rules/copy-*.md` |
| 배포 경로 | `.claude/rules/copy-*.md` |
| 참고 | 기존 core 룰(`src/claude/core/rules/`)은 수정하지 않음 |

옵션 A(`src/claude/core/rules/copy-*.md`, core 도메인에 통합)도 검토되었으나, copy 도메인의 독립성이 롤백과 선택적 도입에 유리하여 옵션 B를 채택한다.

## 12. 훅 실행 우선순위

### PreToolUse Edit/Write 이벤트 순서

| 순서 | 훅 | 도메인 | 동작 |
| --- | --- | --- | --- |
| 1 | `plan-doc-guard.js` | 기존 plan | `.plans/` 보호, planning 중 code edit 차단 |
| 2 | `dev-tdd-guard.js` | 기존 dev | 테스트 파일 존재 확인 (블로킹) |
| 3 | `dev-feature-scope-guard.js` | 기존 dev | 패키지 범위 확인 |
| 4 | `copy-scope-guard.js` | 신규 copy | 실행 단위 범위 확인 |
| 5 | `copy-evidence-reminder.js` | 신규 copy | 증거 갱신 리마인더 |

### PostToolUse Edit/Write 이벤트 순서

| 순서 | 훅 | 도메인 | 동작 |
| --- | --- | --- | --- |
| 1 | `edit-tracker.js` | 기존 core | 파일 추적 |
| 2 | `code-quality-reminder.js` | 기존 core | 품질 리마인더 |
| 3 | `copy-doc-drift-check.js` | 신규 copy | 문서 드리프트 감지 |

### 충돌 해결 원칙

- 블로킹 훅(`exit 2`)이 리마인더 훅(`exit 0`)보다 먼저 실행한다.
- 같은 이벤트의 훅은 도메인 순서를 따른다: plan → dev → copy.
- `dev-tdd-guard.js`와 `copy-evidence-reminder.js`가 동일 파일 편집 이벤트에서 동시 발동될 수 있다. TDD guard는 코드 정합성, evidence reminder는 충실도 증거 갱신으로 역할이 분리되므로 양쪽 모두 실행한다.

## 13. 검증 계획

| 검증 항목 | 방법 | 통과 기준 |
| --- | --- | --- |
| hook 과잉 차단 여부 | sample edit scenario 검토 | 정상 문서 작업이 막히지 않음 |
| rule 중복 여부 | 기존 `.claude/rules`와 비교 | coding/security/verification과 중복 최소화 |
| 사용자 gate 보존 | closeout scenario 검토 | `승인 대기` 후 다음 단계 차단 또는 경고 |
| evidence reminder 유효성 | visual file edit scenario 검토 | 적절한 evidence 안내 출력 |
| settings 영향 | `.claude/settings.json` 변경 전 diff 검토 | 기존 deny 정책 유지 |
| plan-doc-guard syntax | `node --check .claude/hooks/plan-doc-guard.js` | syntax 오류 없음 |
| plan/copy hook 충돌 | `.plans/` 문서 작성과 copy evidence reminder scenario 비교 | 같은 edit에 과도한 blocking이 발생하지 않음 |

## 14. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| hook이 정상 작업을 과도하게 막음 | high | `3 / 2 / 1 / 6 / likely / queued` | reminder 우선, blocking은 gate-stop만 제한적으로 적용 |
| rule이 너무 많아 Claude context가 산만해짐 | medium | `2 / 2 / 1 / 5 / likely / queued` | copy rules를 3~5개로 제한하고 중복 제거 |
| 기존 TDD guard와 visual evidence guard 충돌 | medium | `2 / 2 / 1 / 5 / likely / queued` | TDD는 code correctness, evidence는 fidelity로 역할 분리 |
| settings 변경으로 기존 Claude Kit update와 충돌 | medium | `2 / 1 / 1 / 4 / likely / queued` | package-owned 파일과 custom 파일을 분리 |
| `plan-doc-guard.js`와 copy hook 후보가 중복 차단 | medium | `2 / 1 / 1 / 4 / tentative / queued` | CAI-09에서 sample scenario 검증 후 copy hook은 reminder 우선 도입 |

## 15. 완료 기준

| 기준 | 상태 |
| --- | --- |
| hook 후보와 기본 정책이 정의됨 | 완료 |
| rule 후보와 섹션 구조가 정의됨 | 완료 |
| blocking/reminder 기준이 분리됨 | 완료 |
| settings 반영 원칙이 정의됨 | 완료 |
| `plan-doc-guard.js` 현황과 검증 필요 항목이 반영됨 | 완료 |
| claude-kit CommonJS 훅 형식 요구사항이 정의됨 | 완료 |
| 룰 배치 결정 (옵션 B: copy 도메인 독립)이 확정됨 | 완료 |
| 훅 실행 우선순위와 충돌 해결 정책이 정의됨 | 완료 |
| 실제 hook/rule 파일 생성은 하지 않음 | 의도적 제외 |

## 16. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 기존 `.claude` 구조와 연결 | 완료 |
| 사용자 gate 유지 | 완료 |
| 초기 과잉 차단 방지 | reminder 우선으로 반영 |
| CAI-06 command workflow와 연결 | 완료 |
| CAI-10 plan workflow와 연결 | 완료 |
| claude-kit CommonJS 형식 요구사항 반영 | 완료 |
| 룰 배치 결정 (옵션 B) 반영 | 완료 |
| 훅 실행 우선순위 및 충돌 해결 정책 반영 | 완료 |
| 실제 구현 범위 초과 여부 | 초과 없음 |
