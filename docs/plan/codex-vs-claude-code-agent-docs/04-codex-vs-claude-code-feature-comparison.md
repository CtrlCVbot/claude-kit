# Codex vs Claude Code 기능 비교

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [02-codex-agent-features-for-beginners.md](02-codex-agent-features-for-beginners.md), [03-claude-code-agent-features-for-beginners.md](03-claude-code-agent-features-for-beginners.md)

이 문서의 핵심 원칙은 하나입니다. **비슷한 이름이 보여도 같은 기능이라고 단정하지 않는다.** `Codex`와 `Claude Code`는 공통적으로 `skill`, `subagent`, `plugin` 같은 개념을 다루지만, 로딩 방식, 설정 방식, 사용자 경험은 다를 수 있습니다.

## 핵심 비교표

| 비교 축 | Codex | Claude Code | 초보자 메모 |
|------|-------|-------------|-------------|
| 프로젝트 공통 지침 | `AGENTS.md` 중심 | `CLAUDE.md` 중심 | 둘 다 "프로젝트 기억" 계열이지만 파일 규약이 다름 |
| 반복 워크플로 | `skill` | `skill` | 두 플랫폼 모두 핵심 개념 |
| skill의 역할 | 필요한 시점에 로드되는 재사용 워크플로 | 필요한 시점에 로드되는 재사용 워크플로 | 여기만큼은 개념이 꽤 가깝다 |
| skill과 command 관계 | skill이 별도 개념으로 강조됨 | 기존 custom command가 skill로 통합 설명됨 | Claude Code 쪽은 최신 문서에서 skill 중심으로 이해하는 편이 정확 |
| 전문 역할 분리 | `subagent` / custom agent | `subagent` | 둘 다 가능하지만 호출 UX가 다름 |
| subagent 기본 감각 | 명시 요청 중심 | 자동 위임 + 명시 호출 모두 강조 | Claude Code가 자동 위임 설명을 더 적극적으로 함 |
| 설정/강제 계층 | 지침과 도구 설정을 별도로 이해해야 함 | `settings.json`과 `CLAUDE.md`의 역할 분리가 매우 뚜렷함 | Claude Code는 "가이드 vs 강제"가 더 눈에 잘 보임 |
| 공유/배포 단위 | `plugin` | `plugin` | 둘 다 설치 가능한 묶음이지만 구조와 manifest가 다름 |
| marketplace 연결 | repo/local/personal marketplace 개념이 보임 | plugin manager와 marketplace 흐름이 강함 | 둘 다 배포 가능하지만 경험이 다름 |
| command entrypoint | built-in slash command 중심, 반복 절차는 skill/plugin 후보 | built-in command + bundled skill + legacy `.claude/commands/` | Claude command를 Codex에 그대로 복사하지 않는다 |
| rules | 명령 승인/권한 제어용 experimental rules | `.claude/rules/`로 행동 지침을 모듈화 | 이름은 같아도 목적이 다르다 |
| hooks | experimental, feature flag 필요, Windows disabled | tool/subagent lifecycle에 깊게 연결 | 현재 이 저장소 환경에서는 Codex hooks를 direct parity로 보기 어렵다 |
| memory | Codex memories는 off by default인 local recall layer | `CLAUDE.md`, auto memory, subagent memory | 팀 규칙은 양쪽 모두 checked-in docs/지침 파일에 둔다 |

## 어디가 특히 비슷한가

### 1. 둘 다 `skill`을 반복 작업의 중심 단위로 본다

공식 문서 기준으로 두 플랫폼 모두 `skill`을 "필요할 때만 로드되는 재사용 가능한 작업 지식"으로 설명합니다. 그래서 초보자에게는 다음 원칙이 잘 통합니다.

- 규칙은 지침 파일에
- 절차는 skill에

### 2. 둘 다 `subagent`로 역할을 분리할 수 있다

둘 다 reviewer, specialist, planner 같은 역할을 따로 둘 수 있습니다. 다만 `Codex`는 병렬 실행과 명시 위임 쪽 인상이 강하고, `Claude Code`는 자동 위임과 `@` mention 같은 호출 UX가 더 드러납니다.

### 3. 둘 다 `plugin`으로 공유 가능한 묶음을 만든다

혼자 쓰는 project-local 설정과, 다른 사람도 설치해 쓰는 배포 단위를 분리한다는 점은 공통입니다.

## 어디가 특히 다른가

### 1. 프로젝트 지침 파일의 이름과 철학이 다르다

- `Codex`는 `AGENTS.md`를 넓은 프로젝트 규칙 파일로 설명합니다.
- `Claude Code`는 `CLAUDE.md`를 기억과 작업 규칙 문서로 설명하고, `settings.json`을 별도 강제 설정층으로 분리합니다.

즉, "둘 다 프로젝트 지침"이라고 말하는 것은 가능하지만, **동일 파일 규약**이라고 말하면 틀립니다.

### 2. Claude Code는 `settings.json`이 더 전면에 있다

초보자 입장에서 가장 큰 차이는 이 부분입니다. `Claude Code` 공식 문서는 "행동 지침은 `CLAUDE.md`, 실제 강제 설정은 `settings.json`"이라고 매우 분명하게 나눕니다. 반면 `Codex` 쪽은 현재 문서상 `AGENTS.md`, skills, plugins, config 축으로 설명되는 비중이 더 큽니다.

### 3. Claude Code는 legacy command를 skill과 연결해서 설명한다

현재 공식 문서 기준으로 Claude Code는 custom commands가 skills로 통합되었다고 설명합니다. 그래서 `.claude/commands/`가 보여도 최신 설명은 "skill 관점"으로 이해하는 편이 맞습니다.

### 4. `rules`와 `hooks`는 이름만 보고 대응시키면 안 된다

Claude Code의 `.claude/rules/`는 프로젝트 지침을 모듈화하고 path별로 조건부 로딩하는 역할입니다. 반면 Codex `rules`는 sandbox 밖 command 실행 승인 정책에 가깝습니다. Claude Code hooks는 tool lifecycle에서 blocking guard까지 담당할 수 있지만, Codex hooks는 공식 문서상 experimental이고 feature flag와 플랫폼 제약을 확인해야 합니다.

자세한 대응표는 [08-claude-only-concepts-and-codex-alternatives.md](08-claude-only-concepts-and-codex-alternatives.md)를 참조합니다.

## 이 저장소에 연결했을 때의 차이

| 저장소 예시 | Codex 쪽 읽는 법 | Claude Code 쪽 읽는 법 |
|------|------------------|------------------------|
| [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md) | repo-local skill 예시 | 직접 대응 파일은 아니지만 "절차를 skill로 분리"한다는 점은 비교 가능 |
| [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml) | custom subagent 예시 | [.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)와 역할 분리 개념 비교 가능 |
| [../../../.claude/settings.json](../../../.claude/settings.json) | 직접 동치 개념 아님 | Claude Code의 강제 설정층 예시 |
| [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md) | Codex skill과 1:1 대응으로 보면 안 됨 | legacy command가 skill 개념으로 흡수된 예시로 읽는 편이 맞음 |
| [../../../.claude/rules/verification.md](../../../.claude/rules/verification.md) | Codex `rules`가 아니라 `AGENTS.md`/skill 대안으로 봐야 함 | `.claude/rules/` 예시 |
| [../../../.claude/hooks/dev-tdd-guard.js](../../../.claude/hooks/dev-tdd-guard.js) | Codex에서는 explicit verification command 또는 experimental hook 후보 | Claude Code blocking hook 예시 |
| [../../../.claude/agent-memory/kit-sync-agent/MEMORY.md](../../../.claude/agent-memory/kit-sync-agent/MEMORY.md) | Codex memories 또는 skill reference 후보 | repo-specific agent memory 예시 |

## 초보자용 결론

- `AGENTS.md`와 `CLAUDE.md`는 비슷한 문제를 풀지만 같은 규약은 아니다.
- `skill`은 두 플랫폼에서 공통 핵심 개념이다.
- `subagent`는 둘 다 지원하지만 기본 사용 감각이 조금 다르다.
- `plugin`은 둘 다 배포 단위지만 설치 경험과 파일 구조가 다르다.
- `commands`, `rules`, `hooks`, `agent-memory`는 직접 대응보다 대안 설계 관점으로 봐야 한다.

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins), [Commands](https://code.claude.com/docs/en/commands), [Hooks](https://code.claude.com/docs/en/hooks)
