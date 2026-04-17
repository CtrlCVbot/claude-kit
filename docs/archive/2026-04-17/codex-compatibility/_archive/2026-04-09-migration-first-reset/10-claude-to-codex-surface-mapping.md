# Claude To Codex Surface Mapping

> Claude 기능을 Codex의 공식 surface로 매핑하는 기준 문서

## 단계 위치

- 실행 단계: `3단계-a`
- 선행 조건: `08`, `09`
- 후속 문서: `11`, `12`

## 목적

현재 Claude 기능을 Codex에서 무엇으로 대응할지, 기능 종류별 기본 규칙을 고정한다.

## Codex target surfaces

이 문서에서 Codex 대응 surface는 아래로 고정한다.

- `subagent`
- `skill`
- `hook`
- `AGENTS.md`
- `exec-policy rule`
- `skip`

## Claude source kinds

이 문서에서 Claude source kind는 아래로 고정한다.

- `agent`
- `command`
- `skill`
- `hook`
- `instruction-rule`

## 기본 매핑 규칙

| Claude source kind | 기본 Codex target |
|------|------|
| `agent` | `subagent` 우선 검토 |
| `command` | `skill` 또는 documented entry flow |
| `skill` | `skill` |
| `hook` | `hook` 가능 시 대응, 아니면 `skip` |
| `instruction-rule` | `AGENTS.md` |

## 추가 규칙

- Claude 자산을 Codex runtime path로 그대로 복사하는 것은 기본 전략이 아니다.
- `agent`는 Codex에서 `subagent`가 우선이나, 실제 역할상 `skill`이나 `AGENTS.md`가 더 적합하면 그쪽으로 보낸다.
- `hook`이 Codex `hook`으로 대응될 때는 실행 코드만이 아니라 `src/codex/*/hooks/{identity}.hook.json` config source도 함께 설계한다.
- write-capable `subagent`는 `src/codex/*/agents/{identity}.contract.json` companion contract를 통해 write boundary와 deliverable을 같이 정의한다.
- `command`는 Codex에서 slash command 복제가 아니라 skill 또는 entry flow로 재표현한다.
- 따라서 현재 설계에서는 `src/codex/*/commands`를 만들지 않고, Claude `command`의 Codex sibling은 `src/codex/*/skills/{identity}/SKILL.md`로 둔다.
- `instruction-rule`은 기본적으로 Codex `AGENTS.md` guidance로 간다.
- `exec-policy rule`은 필요할 때만 별도 Codex-native 자산으로 설계한다.

## 실행 체크리스트

1. `08`의 기능 카탈로그를 입력으로 사용한다.
2. 기능별로 Codex target surface를 하나로 우선 고정한다.
3. `skip` 판정은 이유 없이 남기지 않는다.
4. `agent`와 `command`는 direct copy 금지 원칙을 다시 확인한다.
5. `hook`은 runtime 제약과 platform 제약을 함께 기록한다.

## 산출물

이 문서는 이후 sibling 설계와 메타 툴 설계에서 공통 기준으로 사용한다.

구체적으로는 아래 표를 만든다.

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|

### 매핑 요약

| target surface | 개수 | 메모 |
|------|------|------|
| `subagent` | 12 | 현재 Claude `agent` 자산 전체 |
| `skill` | 56 | Claude `command` 31개 + Claude `skill` 25개 |
| `hook` | 8 | `session-wrap-suggest` 제외 |
| `AGENTS.md` | 6 | `src/claude/core/rules/*.md` 전체 |
| `exec-policy rule` | 0 | 현재 Claude source에는 직접 대응 자산 없음 |
| `skip` | 1 | `session-wrap-suggest` |

현재 Claude source 기준에서는 `exec-policy rule`로 직접 대응되는 자산이 없다. 이 surface는 향후 Codex-native source가 필요할 때만 별도 도입한다.

### agent -> Codex target

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|
| `dev-architect`, `dev-code-reviewer`, `dev-security-reviewer`, `plan-reviewer` | `agent` | `subagent` | `AGENTS.md` 참고 규칙 | read-heavy specialist 역할이며, 명시 트리거와 구조화된 분석/리뷰 산출물이 있다. |
| `dev-database-reviewer`, `dev-doc-updater`, `dev-verify-agent` | `agent` | `subagent` | `skill` entry flow | bounded-write 또는 structured verification 성격의 전문 워커이며, Codex custom subagent로 역할을 고정하기 좋다. |
| `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-stitch-integrator`, `plan-wireframe-designer` | `agent` | `subagent` | `skill` entry flow | planning 파이프라인에서 명확한 입력과 산출물을 갖는 artifact authoring worker들이다. |

### command -> Codex target

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|
| `plan-idea`, `plan-screen`, `plan-draft`, `plan-prd`, `plan-review`, `plan-wireframe`, `plan-stitch`, `plan-bridge` | `command` | `skill` | companion `subagent` | 사용자 진입점 성격의 planning workflow이므로 Codex에서도 명시 호출 skill로 두는 편이 자연스럽다. |
| `plan-archive`, `plan-improve` | `command` | `skill` | `AGENTS.md` 운영 지침 | archive/improve는 후속 운영 명령이므로 Codex에서도 skill entry flow로 유지한다. |
| `dev-architecture`, `dev-feature`, `dev-plan`, `dev-run`, `dev-verify`, `dev-review`, `dev-security-review`, `dev-handoff-verify` | `command` | `skill` | companion `subagent` | 구조 결정, 구현, 리뷰, 검증 같은 상위 사용자 entry flow이므로 Codex skill이 적합하다. |
| `dev-build-fix`, `dev-checkpoint`, `dev-commit`, `dev-commit-push-pr`, `dev-continue`, `dev-explore`, `dev-learn`, `dev-refactor`, `dev-sync-docs`, `dev-sync`, `dev-test-verify`, `dev-verify-all`, `dev-verify-fe` | `command` | `skill` | built-in flow와 병행 가능 | utility/ops 성격이 강하지만 여전히 user-invoked workflow이므로 direct command copy 대신 skill로 재표현한다. |

### skill -> Codex target

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|
| `continuous-learning`, `session-wrap` | `skill` | `skill` | `AGENTS.md` 운영 메모 | 이미 workflow/guidance 단위로 작성된 자산이며, Codex에서도 skill surface가 가장 직접적이다. |
| `dev-architecture-decision`, `dev-domain-modeling`, `dev-feature-module`, `dev-feature-plan`, `dev-frontend-patterns`, `dev-layered-architecture`, `dev-observability`, `dev-refactoring`, `dev-security-pipeline`, `dev-tdd-workflow`, `dev-testing-backend`, `dev-testing-e2e`, `dev-testing-frontend`, `dev-verification-engine`, `dev-workflow` | `skill` | `skill` | companion `subagent` | dev skill은 command/agent를 지탱하는 reusable workflow와 guidance 묶음이므로 Codex skill sibling이 기본이다. |
| `plan-archive-workflow`, `plan-idea-management`, `plan-pipeline`, `plan-prd-authoring`, `plan-review-criteria`, `plan-screening-workflow`, `plan-stitch-workflow`, `plan-wireframe-design` | `skill` | `skill` | companion `subagent` | plan skill은 planning pipeline의 reusable procedure와 기준 문서 역할을 하므로 Codex skill로 직접 대응한다. |

### hook -> Codex target

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|
| `code-quality-reminder`, `edit-tracker`, `output-secret-filter`, `security-auto-trigger`, `dev-db-guard`, `dev-feature-scope-guard`, `dev-tdd-guard`, `plan-doc-guard` | `hook` | `hook` | `skip` | event/matcher 기반 guard 또는 reminder 성격이며, Codex에서는 `.codex/hooks.json`을 통한 runtime hook으로 대응한다. |
| `session-wrap-suggest` | `hook` | `skip` | `skill` (`session-wrap`) | 종료 시점 제안형 hook은 explicit skill 호출로 대체하는 편이 안정적이며, stop-event parity를 기본 가정하지 않는다. |

### instruction-rule -> Codex target

| Claude 기능 identity | source kind | 기본 Codex target | 보조 후보 | 근거 |
|------|------|------------------|----------|------|
| `coding-style`, `date-calculation`, `golden-principles`, `interaction`, `security`, `verification` | `instruction-rule` | `AGENTS.md` | future `exec-policy rule` | 현재 `src/claude/core/rules/*.md`는 실행 승인 정책이 아니라 공통 작업 지침이므로 Codex에서는 `AGENTS.md` guidance로 소비한다. |

## 완료 기준

- 모든 Claude 기능이 `subagent`, `skill`, `hook`, `AGENTS.md`, `exec-policy rule`, `skip` 중 하나로 귀결된다.
- `skip` 또는 `AGENTS.md` 판정도 이유가 기록된다.
- `11`에서 sibling 필요 여부를 결정할 수 있을 정도로 target surface가 충분히 좁혀진다.

## 다음 문서

- sibling 설계: [11-codex-sibling-design-catalog.md](./11-codex-sibling-design-catalog.md)
