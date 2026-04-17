# Claude Codex Diff Matrix

> 같은 기능 identity가 Claude와 Codex에서 어떻게 달라지는지 비교하는 문서

## 단계 위치

- 실행 단계: `3단계-c`
- 선행 조건: `10`, `11`
- 후속 문서: `13`

## 목적

Claude 자산과 Codex sibling이 왜 1:1 복사가 아니라 target-specific authoring이어야 하는지 설명한다.

## 비교 축

- 역할
- 트리거 방식
- 입력 방식
- 출력 방식
- tool 범위
- runtime surface
- 제한 사항

## 기본 원칙

- 같은 기능 이름이어도 형식은 달라질 수 있다.
- Claude source는 Claude runtime에 최적화되어 있고, Codex sibling은 Codex runtime에 최적화된다.
- 차이는 예외가 아니라 정상 설계 결과다.

## 활용 목적

- `11-codex-sibling-design-catalog.md`의 설계 근거
- `13-conversion-tooling-requirements.md`의 비교/검증 요구사항 근거

## 실행 체크리스트

1. 비교 대상은 같은 기능 identity를 가진 Claude/Codex 쌍으로 한정한다.
2. 형식 차이는 예외가 아니라 설계 결과로 설명한다.
3. 메타 툴이 비교해야 할 최소 비교 축을 이 문서에서 잠근다.

## 산출물

| 기능 identity | Claude surface | Codex surface | 핵심 차이 | 구현 영향 |
|------|----------------|--------------|----------|----------|

### 대표 pair 비교

| 기능 identity | Claude surface | Codex surface | 핵심 차이 | 구현 영향 |
|------|----------------|--------------|----------|----------|
| `dev-architect` | `src/claude/dev/agents/dev-architect.md` -> `.claude/agents/*.md` | `src/codex/dev/agents/dev-architect.toml` -> `.codex/agents/*.toml` | Claude는 frontmatter + `Agent_Prompt` 중심이고, Codex는 TOML 기반 subagent config로 역할/설명을 선언한다. | same identity라도 파일 형식과 필드 구조가 달라 별도 authoring이 필요하다. |
| `dev-code-reviewer` | Claude subagent markdown | Codex custom subagent TOML | 리뷰 역할은 같지만 Codex는 subagent config와 explicit invocation 설명이 필요하다. | review agent는 direct copy가 아니라 Codex subagent schema로 재작성해야 한다. |
| `dev-database-reviewer` | write-capable specialist agent | Codex subagent TOML + `*.contract.json` | Codex에서는 bounded-write 정책과 deliverable을 config/지침이 아니라 별도 contract source까지 포함해 더 명확히 적어야 한다. | write-capable specialist는 subagent TOML만으로 끝나지 않고 write contract companion이 함께 필요하다. |
| `dev-doc-updater` | Claude agent markdown + docs write | Codex subagent TOML + `*.contract.json` + docs-oriented guidance | 문서 갱신 범위와 write target을 더 명확히 잠가야 한다. | Codex sibling은 범위 제한과 산출물 계약을 companion contract로 고정해야 한다. |
| `dev-verify-agent` | Claude agent markdown + Task tool 설명 | Codex subagent TOML | “fresh context verification worker”라는 identity는 같지만 runtime surface와 parent-child orchestration 설명이 달라진다. | verification workflow는 subagent config와 parent skill 양쪽이 함께 필요하다. |
| `plan-idea-collector` | Claude planning agent markdown | Codex subagent TOML + `*.contract.json` | 아이디어 수집 worker라는 역할은 같지만 Codex에서는 artifact path와 write contract를 별도 contract source로 명확히 적어야 한다. | planning authoring agents도 Codex-native subagent source와 contract pair가 필요하다. |
| `plan-prd-writer` | Claude PRD writer agent markdown | Codex subagent TOML + `*.contract.json` | PRD authoring 역할은 같지만, Codex는 subagent 설명과 출력 계약을 TOML과 contract로 분리한다. | 장문 authoring worker는 prompt 복사가 아니라 Codex schema + contract 재설계가 필요하다. |
| `plan-reviewer` | Claude read-only reviewer agent | Codex read-only subagent | read-only 원칙과 PASS/WARN/FAIL 산출물은 유지되지만 surface는 달라진다. | reviewer 계열은 Codex subagent-first 패턴의 대표 사례다. |
| `dev-feature` | `src/claude/dev/commands/dev-feature.md` -> `.claude/commands/*.md` | `src/codex/dev/skills/dev-feature/SKILL.md` | Claude command는 slash entry markdown이지만, Codex에서는 user-invoked skill entry로 바뀐다. | command 기능은 Codex command copy가 아니라 skill sibling으로 재표현한다. |
| `dev-handoff-verify` | Claude command + Task subagent orchestration | Codex skill + custom subagent orchestration | parent entry는 command에서 skill로, child worker는 Claude agent에서 Codex subagent로 변한다. | command/agent 동시 전환이 필요한 대표 패턴이다. |
| `plan-idea` | Claude command markdown | Codex skill | user entrypoint는 유지되지만 runtime surface는 skill로 바뀐다. | planning entry commands는 Codex skill family로 묶어 구현해야 한다. |
| `plan-prd` | Claude command markdown | Codex skill + `plan-prd-writer` subagent | 명령 본문 자체보다 workflow entry와 companion subagent 조합이 중요해진다. | Codex에서는 command와 writer worker를 분리된 source로 설계해야 한다. |
| `dev-security-pipeline` | Claude reusable skill | Codex reusable skill | 둘 다 skill이지만, Codex sibling은 Codex runtime 문맥과 companion subagent 연결을 기준으로 다듬어야 한다. | skill은 direct port가 가장 쉽지만 target-specific 문구 조정은 필요하다. |
| `plan-pipeline` | Claude planning orchestration skill | Codex planning orchestration skill | workflow guide 자산이라는 점은 같지만, Codex sibling은 Codex entry flow와 target surface 용어를 써야 한다. | reusable orchestration skill은 가장 안정적인 direct sibling 후보다. |
| `dev-tdd-guard` | `.claude/hooks/dev-tdd-guard.js` + `.claude/settings.json` | `src/codex/dev/hooks/dev-tdd-guard.js` + `src/codex/dev/hooks/dev-tdd-guard.hook.json` -> `.codex/hooks.json` | 실행 코드가 비슷해도 runtime registration surface가 다르다. | hook은 코드만이 아니라 config source까지 함께 설계해야 한다. |
| `output-secret-filter` | Claude PostToolUse hook | `src/codex/core/hooks/output-secret-filter.js` + `src/codex/core/hooks/output-secret-filter.hook.json` -> `.codex/hooks.json` | secret filtering 목적은 같지만 Codex matcher/config 기준에 맞춘 선언이 필요하다. | hook sibling은 JS + config pair로 다뤄야 한다. |
| `session-wrap-suggest` | Claude Stop hook | Codex에서는 explicit `session-wrap` skill로 대체 | 수동 종료 제안형 hook은 Codex에서 explicit skill UX가 더 안정적이다. | 일부 hook은 sibling을 만들지 않고 `skip` + 대체 skill로 설계해야 한다. |
| `coding-style` | Claude core rule markdown | `AGENTS.md` synthesis input | Claude에서는 rule asset 자체를 읽지만, Codex에서는 `AGENTS.md`에 핵심 규칙이 흡수된다. | instruction-rule은 file-to-file copy가 아니라 synthesis 대상이다. |
| `verification` | Claude core rule markdown | `AGENTS.md` synthesis input | evidence-based completion 규칙은 유지되지만 소비 surface가 다르다. | rule 계열은 shared-guidance + AGENTS synthesis 패턴을 따라야 한다. |

### 비교 원칙에서 고정할 것

- `agent` identity는 Codex에서 기본적으로 `subagent` sibling으로 비교한다.
- `command` identity는 Codex에서 `skill` sibling으로 비교한다.
- `skill` identity는 같은 `skill` family로 남더라도 target-specific 문맥 조정이 필요하다.
- write-capable `subagent` identity는 TOML만이 아니라 `*.contract.json`의 write boundary와 deliverable까지 비교 범위에 넣어야 한다.
- `hook` identity는 실행 코드와 별도로 `*.hook.json` source와 runtime config surface까지 비교해야 한다.
- `instruction-rule` identity는 개별 파일이 아니라 `AGENTS.md` synthesis 결과까지 비교 범위에 넣어야 한다.

## 완료 기준

- `13`에서 어떤 비교/검증 tooling이 필요한지 바로 도출된다.
- implementer가 direct copy 대신 sibling authoring이 필요한 이유를 문서만으로 이해할 수 있다.

## 다음 문서

- 메타 툴 요구사항: [13-conversion-tooling-requirements.md](./13-conversion-tooling-requirements.md)
