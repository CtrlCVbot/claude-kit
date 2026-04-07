# Phase 4 Codex 구현 피드백 리뷰

> 대상 문서: `docs/meta-tooling/08-phase4-codex-implementation.md`  
> 리뷰 기준: `docs/meta-tooling` 전체 문서, 현재 `.claude` 구현 상태, 2026-04-07 기준 공식 Codex 가이드  
> 리뷰 목표: Phase 4 방향을 뒤집지 않고, 구현 전에 문서 기준을 더 안전하고 명확하게 다듬기

## 1. Executive Summary

Phase 4의 큰 방향은 좋습니다. 특히 `src/claude`와 `src/codex`를 분리한 뒤, Claude 메타 툴링이 Codex 대응 자산까지 같이 관리하게 하려는 구상은 지금 저장소가 채택한 target-separated authoring 방향과 잘 맞습니다.

다만 구현에 들어가기 전에 세 가지는 먼저 바로잡는 편이 좋습니다.

1. `src/codex` 자산이 **Codex-native authoring source**인지, 아니면 **실행 위치 그 자체**인지 문서에서 더 분명히 나뉘어야 합니다.
2. hook 관련 가정 중 일부가 현재 공식 Codex 가이드와 어긋납니다.
3. Phase 4 스펙이 실제 repo의 현재 상태를 전부 미구현처럼 다루는 부분이 있어, 이미 된 일과 남은 일을 분리해 적는 편이 구현 리스크를 줄입니다.

요약하면, **방향은 유지해도 되고, 문장과 계약을 먼저 다듬은 뒤 구현하는 것이 안전합니다.**

## 2. What Is Already Strong

### 2.1 Target-separated authoring 방향은 맞다

- Phase 0 문서에서 이미 `src/claude/{core,dev,plan}` + `src/codex/{core,dev,plan}` 구조를 도입했고, Phase 4는 그 위에서 Codex source를 실제로 채우는 단계로 읽힙니다.
- 이는 “Claude source를 installer가 똑똑하게 변환한다”보다 훨씬 명확하고 유지보수에 유리합니다.

### 2.2 pairing-registry 제안은 필요하다

- `src/pairing-registry.json`을 두어 Claude/Codex sibling 상태를 추적하려는 발상은 좋습니다.
- 특히 `agent`와 `command`를 “Codex sibling이 기본적으로 필요한 자산”으로 다루려면, 이 레지스트리는 생성/검증/audit 흐름을 묶는 중심점 역할을 할 수 있습니다.

### 2.3 naming guard는 이미 좋은 출발점이 있다

- `.claude/hooks/kit-naming-guard.js`는 이미 `src/(claude|codex)/...` 경로를 인식하고 있습니다.
- 그래서 T14를 “새 구현”이 아니라 “기존 코드 검증”으로 잡은 판단은 합리적입니다.

### 2.4 일부 meta tooling은 이미 dual-target 방향을 알고 있다

- `.claude/commands/kit-list.md`는 이미 `src/claude/`와 `src/codex/`를 함께 스캔하는 문장을 가지고 있습니다.
- `.claude/agents/kit-maintainer.md`도 `src/claude/ + src/codex/` 전체 스캔을 전제로 하고 있습니다.
- 즉 Phase 4는 완전한 greenfield가 아니라, 이미 시작된 dual-target awareness를 정식 계약으로 끌어올리는 단계에 가깝습니다.

## 3. Spec vs Current Repo Drift

Phase 4 문서는 “해야 할 일”을 잘 정리했지만, 실제 repo 상태와의 차이를 더 명확히 적어두면 구현자가 훨씬 덜 헷갈립니다.

| 상태 | 항목 | 현재 관찰 | 피드백 |
|------|------|-----------|--------|
| 이미 반영됨 | T14 naming guard | `.claude/hooks/kit-naming-guard.js`가 이미 `src/(claude|codex)/`를 지원 | T14는 “구현”이 아니라 “확인 완료”로 문구를 낮추는 편이 맞음 |
| 부분 반영됨 | T12 kit-list | 현재 문서는 `src/codex/` 스캔을 언급하지만 `--target`, `--pairing`은 아직 없음 | “부분 반영 상태”를 먼저 적고 남은 변경만 명시 권장 |
| 부분 반영됨 | T15 kit-maintainer | `src/claude/ + src/codex/` 스캔은 이미 반영, 하지만 Codex schema 분기와 C7 pairing 검증은 아직 없음 | 이 항목도 greenfield가 아니라 확장 작업으로 적는 편이 정확 |
| 미구현 | T1 pairing-registry | `src/pairing-registry.json` 없음 | 신규 구현 항목으로 유지 |
| 미구현 | T2-T9 Codex templates/schemas | `.claude/skills/kit-scaffolding`, `.claude/skills/kit-validation`은 아직 Claude 전용 템플릿/스키마만 가짐 | 신규 구현 항목으로 유지 |
| 미구현 | T10-T13, T16-T17 핵심 플래그/스키마 반영 | `/kit-create`, `/kit-validate`, `/kit-audit`, 두 SKILL 문서 모두 아직 Phase 4 플래그/자산 반영 전 | 신규 구현 항목으로 유지 |

추가로, `docs/meta-tooling/02-commands-spec.md`와 `docs/meta-tooling/05-implementation-roadmap.md`에는 이미 `--target`, pairing, C7 같은 개념이 들어가 있습니다. 그래서 `08-phase4-codex-implementation.md`는 구현 명세이긴 하지만, **기존 문서와의 중복 기준을 어느 문서가 최종 SSOT인지 한 줄로 선언하는 편이 좋습니다.**

## 4. Codex Official Alignment Review

이 섹션은 Phase 4 문서를 공식 Codex surface 기준으로 다시 읽으면서, 어디를 더 정확히 써야 하는지 정리한 것입니다.

### 4.1 Skills / Plugins

공식 문서 기준으로:

- skills는 **authoring format**입니다.
- plugins는 skills와 app integration을 묶는 **installable distribution unit**입니다.
- repo-local skill은 `.agents/skills`에서 직접 발견될 수 있습니다.

즉 Phase 4의 `src/codex/.../skills/.../SKILL.md`는 **Codex skill의 source authoring**으로 이해하면 방향이 맞습니다. 다만 문서에서 이것이 곧바로 Codex runtime discovery path라는 식으로 읽히지 않게 해야 합니다.

### 4.2 Subagents

공식 문서 기준으로 custom subagent의 runtime surface는 `.codex/agents/*.toml`이고, 핵심 필드는 `name`, `description`, `developer_instructions`입니다. 전역 설정은 `.codex/config.toml`의 `[agents]` 아래에서 `max_threads`, `max_depth` 등으로 관리됩니다.

그래서 현재 Phase 4의 `template-codex-agent.md`, `schema-codex-agent.md`는 다음 전제가 분명해야 합니다.

- `src/codex/{domain}/agents/{full_name}.md`는 **Codex subagent runtime file 자체가 아니라 authoring source**다.
- 실제 설치나 emitter 단계에서는 이것이 `.codex/agents/*.toml` 또는 그에 준하는 Codex runtime surface로 연결되어야 한다.

현재 문서의 “Codex subagent로 실행됩니다”라는 표현은 방향은 이해되지만, **중간 단계 없이 바로 실행되는 것처럼 읽힐 수 있어 보강이 필요**합니다.

### 4.3 Hooks

공식 hooks 문서는 현재 다음 사실을 분명히 말합니다.

- hooks는 experimental입니다.
- Windows에서는 hooks가 현재 비활성화되어 있습니다.
- Codex는 `~/.codex/hooks.json` 또는 `<repo>/.codex/hooks.json`을 봅니다.
- `Stop` 이벤트는 존재합니다.
- 다만 현재 runtime에서 `PreToolUse`와 `PostToolUse` matcher는 사실상 `Bash`만 의미 있게 매칭됩니다.

이 점에서 현재 Phase 4 문서의 hook 관련 서술은 수정이 필요합니다.

특히:

- `template-codex-hook.md`의 “Codex에서 Stop 이벤트가 지원되지 않는다”는 설명은 공식 문서와 어긋납니다.
- `schema-codex-hook.md`의 “Stop 이벤트 미사용” FAIL 규칙도 재검토가 필요합니다.
- 반대로 `Edit|Write` matcher를 Codex Pre/Post의 기본 예시처럼 두는 것도 현재 runtime 기준으로는 과장될 수 있습니다.

즉 hook 쪽은 **지원 안 됨**이 아니라, **지원은 되지만 현재 runtime 제약과 Windows 제한이 크다**로 문장을 교정하는 편이 정확합니다.

### 4.4 Rules vs AGENTS.md

Codex 공식 `Rules`는 `.codex/rules/*.rules`와 `requirements.toml [rules]`를 통한 exec-policy layer입니다. 반면 현재 `src/core/rules/*.md`는 작업 지침에 가까운 instruction asset입니다.

Phase 4 문서는 rule type을 여전히 Claude-origin shared로 두고 있어 방향은 괜찮습니다. 다만 다음 한 줄은 더 분명히 적는 편이 좋습니다.

- `src/core/rules/*.md`는 Codex `.rules`로 자동 변환하지 않는다.
- Codex에서는 기본적으로 `AGENTS.md` guidance로 소비한다.

이 문장이 있으면 이후에 `instruction rule`과 `exec-policy rule`이 다시 섞이는 일을 줄일 수 있습니다.

### 4.5 AGENTS.md

`AGENTS.md`는 Codex의 instruction surface입니다. 따라서 Phase 4에서 Codex 대응 자산을 설계할 때:

- 규칙/지침/운영 원칙은 `AGENTS.md`
- reusable workflow는 skill
- specialized delegated worker는 subagent
- escalation/approval policy는 `.rules`

처럼 역할을 나눠 적는 편이 전체 문서 정합성이 좋아집니다.

## 5. Phase 4 Findings

## Critical

### C1. Codex agent source와 subagent runtime 사이의 경계가 아직 흐리다

현재 spec은 `src/codex/.../agents/*.md`를 도입하면서 동시에 “Codex subagent로 실행”이라고 설명합니다. 하지만 공식 runtime surface는 `.codex/agents/*.toml`입니다.

이 상태로 구현이 시작되면 구현자가 아래 둘 중 하나를 임의로 결정하게 됩니다.

- `src/codex/.../agents/*.md`를 최종 runtime 파일로 취급
- 아니면 이를 TOML로 다시 컴파일하는 emitter를 추가

이 결정은 Phase 4 문서에서 먼저 잠가야 합니다. 제안은 단순합니다.

- Phase 4 문서에서 `src/codex/.../agents/*.md`를 **authoring source**라고 명시
- 설치/emit 단계에서 `.codex/agents/*.toml`로 연결된다고 적기

### C2. hook 관련 공식 가이드 정렬이 필요하다

현재 문서의 hook template/schema는 다음 두 부분에서 공식 docs와 충돌합니다.

- `Stop` 이벤트를 미지원으로 가정
- `Edit|Write` matcher를 Codex Pre/Post 기본 모델처럼 제시

공식 문서 기준으로는 `Stop`이 존재하고, 현재 runtime의 `PreToolUse` / `PostToolUse` matcher는 `Bash`만 실질적으로 동작합니다. 또한 Windows에서는 hooks가 현재 비활성화 상태입니다.

이 부분은 구현 전에 바로 수정하는 것이 좋습니다. hook template 하나가 잘못 깔리면 이후 validate, audit, installer 설명까지 전부 어긋납니다.

### C3. Phase 4 작업 목록이 현재 repo 상태를 충분히 반영하지 않는다

지금 문서는 일부 항목을 전부 신규 작업처럼 읽히게 하지만, 실제로는:

- T14는 사실상 완료 상태
- T12, T15는 부분 반영 상태
- `02-commands-spec`, `05-implementation-roadmap`에는 이미 일부 Phase 4 개념이 들어감

이 차이를 먼저 문서에 표시해두면, 구현자가 이미 해둔 방향을 되돌리거나 중복 편집하는 일을 줄일 수 있습니다.

## Important

### I1. pairing-registry의 lifecycle 계약을 더 분명히 적어야 한다

레지스트리 구조는 잘 잡혔지만, 생성 이후 lifecycle이 아직 약합니다. 최소한 아래는 문서에 더 명시하는 편이 좋습니다.

- rename 시 entry 갱신 기준
- delete 시 entry 정리 기준
- `paired`, `codex-skip`, `codex-native-only`의 정확한 의미
- `reason`이 필수인 상태와 선택인 상태

지금처럼 구조만 있으면 `/kit-create`와 `/kit-audit`가 서로 다른 해석을 할 여지가 남습니다.

### I2. `/kit-create`의 fail/warn 정책을 더 명확히 적는 편이 좋다

현재 기본값 제안은 대체로 좋습니다.

- `agent`, `command` -> 기본 `both`
- `skill`, `hook` -> 기본 `claude`
- `rule` -> `claude`

다만 아래는 구현 전에 더 명확히 고정하는 것을 권장합니다.

- `agent`/`command`에서 `--target claude`만 주면 실패인지 경고인지
- `--skip-codex`와 `--target claude`의 차이
- `--target codex`로 agent/command만 만드는 경우의 허용 범위
- `rule --target codex` 거부 메시지

문서에서 이 표를 먼저 잠그면, create/validate/audit가 같은 정책을 따르기 쉬워집니다.

### I3. `/kit-validate`는 source validation 중심으로 경계를 고정하는 것이 좋다

현재 spec은 Codex schema를 추가하면서 source validation과 runtime validation이 살짝 섞여 보이는 문장이 있습니다.

권장 해석은 다음입니다.

- `/kit-validate --target codex`는 `src/codex`의 **authoring source**를 검증한다.
- `.codex/agents/*.toml`, `.codex/hooks.json` 같은 **runtime artifact 검증은 setup/emitter 검증 단계**에서 다룬다.

이렇게 분리하면 validate 스키마가 과도하게 runtime 세부사항에 묶이지 않습니다.

### I4. Phase 0 임시 구조에서 Phase 4 전환점이 더 분명하면 좋다

Phase 0 문서는 Codex emitter가 임시로 `src/claude`를 읽는다고 설명하고, Phase 4는 `src/codex`를 채우는 단계입니다.

Phase 4 문서에도 이 전환점을 한 줄로 다시 적는 편이 좋습니다.

- “Phase 0-3에서는 Codex install이 임시로 Claude source에 의존했다.”
- “Phase 4부터는 Codex install의 정식 source를 `src/codex`로 전환한다.”

이 문장 하나로 왜 pairing-registry와 Codex template/schema가 지금 필요한지 설명력이 크게 올라갑니다.

### I5. rule 처리 방식은 유지하되, 표현을 더 잠그는 편이 좋다

현재 spec은 `rule`을 Codex target에서 제외하고 있습니다. 이 판단은 좋습니다.

다만 문서에 다음을 더 분명히 적으면 좋습니다.

- `rule`은 Claude-origin shared guidance다.
- Codex 쪽에서는 기본적으로 `AGENTS.md` guidance로 소비한다.
- `.codex/rules/*.rules`는 Phase 4 기본 범위가 아니다.

이렇게 적어두면, 나중에 “왜 Codex rule template이 없지?”라는 질문에 문서 자체가 답할 수 있습니다.

## Nice to Have

### N1. 검증 커맨드를 Windows/PowerShell 친화적으로 다듬는 편이 좋다

현재 검증 예시는 `find`, `grep`, `cat | python3`처럼 Unix 스타일이 많습니다. 저장소와 문서 사용자 맥락을 보면 PowerShell 예시나 `node`/`python` 단일 명령 예시로 바꾸는 편이 실용적입니다.

### N2. pairing 상태 예시를 2~3개 더 주면 onboarding이 쉬워진다

예를 들어:

- `paired`: `dev-architect`
- `codex-skip`: Claude 전용 command
- `codex-native-only`: Codex 전용 subagent helper

같이 실제 예시를 짧게 넣으면 registry가 훨씬 쉽게 이해됩니다.

### N3. task별 상태 표시를 문서 안에 직접 넣으면 좋다

예: `new`, `partial`, `verify-only` 같은 표기를 T 항목 앞에 붙이면 구현자가 문서를 훨씬 빠르게 읽을 수 있습니다.

## 6. Recommended Adjustments

Phase 4 문서를 더 안전하게 만들기 위한 추천 수정안은 아래 정도로 충분해 보입니다.

1. `08-phase4-codex-implementation.md` 상단에 `현재 repo 반영 상태` 표를 추가한다.
2. `template-codex-agent.md`, `schema-codex-agent.md` 설명에 “authoring source, not runtime file”을 명시한다.
3. hook 문장을 공식 docs 기준으로 교정한다.
   - `Stop` 미지원 문구 제거
   - `hooks.json` 위치를 `.codex/hooks.json` 기준으로 정리
   - Windows hooks 비활성화와 `Bash` matcher 현실을 주석으로 명시
4. `/kit-create`의 target 정책을 fail/warn 매트릭스로 고정한다.
5. `/kit-validate`의 책임을 source validation으로 한정하는 문장을 넣는다.
6. `rule`은 `AGENTS.md` guidance track이고 `.rules` track이 아니라는 점을 다시 적는다.
7. 검증 커맨드는 PowerShell 친화적으로 다시 쓰거나, 플랫폼 중립 스크립트 기준으로 정리한다.

위 수정들은 새 설계를 추가하는 것이 아니라, **이미 선택한 Phase 4 설계를 구현 친화적으로 잠그는 작업**입니다.

## 7. Suggested Next Order

Phase 4 구현 전에 문서 기준부터 잠근다면 아래 순서를 권장합니다.

1. `08-phase4-codex-implementation.md`에 상태 분류를 추가한다.
   - 이미 반영됨
   - 부분 반영됨
   - 미구현
2. Codex agent/hook/rule 관련 표현을 공식 surface 기준으로 교정한다.
3. `/kit-create`의 target 정책과 pairing-registry lifecycle 계약을 먼저 잠근다.
4. 그다음 Codex templates/schemas를 만든다.
5. 이후 `/kit-create`, `/kit-validate`, `/kit-list`, `/kit-audit`, `kit-maintainer` 순으로 확장한다.
6. 마지막에 SKILL 문서와 검증 예시를 업데이트한다.

이 순서로 가면, 먼저 기준을 고치고 그 기준으로 파일을 추가하는 흐름이 되어 재작업 위험이 낮습니다.

## 8. Reference Notes

### 로컬 문서 / 구현 상태

- `docs/meta-tooling/08-phase4-codex-implementation.md`
- `docs/meta-tooling/00-overview.md`
- `docs/meta-tooling/02-commands-spec.md`
- `docs/meta-tooling/04-agent-and-hook.md`
- `docs/meta-tooling/05-implementation-roadmap.md`
- `docs/meta-tooling/07-phase0-migration-plan.md`
- `.claude/commands/kit-create.md`
- `.claude/commands/kit-list.md`
- `.claude/commands/kit-validate.md`
- `.claude/commands/kit-audit.md`
- `.claude/agents/kit-maintainer.md`
- `.claude/hooks/kit-naming-guard.js`
- `.claude/skills/kit-scaffolding/SKILL.md`
- `.claude/skills/kit-validation/SKILL.md`

### 공식 Codex 가이드

- [Codex Skills](https://developers.openai.com/codex/skills)
- [Codex Plugins](https://developers.openai.com/codex/plugins)
- [Codex Hooks](https://developers.openai.com/codex/hooks)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex Rules](https://developers.openai.com/codex/rules)
- [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)
- [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md)
- [CLI slash commands](https://developers.openai.com/codex/cli/slash-commands)
