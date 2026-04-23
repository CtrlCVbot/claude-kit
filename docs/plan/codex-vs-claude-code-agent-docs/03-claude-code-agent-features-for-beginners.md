# Claude Code 에이전트 기능 입문

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [01-agent-platform-overview.md](01-agent-platform-overview.md), [07-agent-capability-matrix.md](07-agent-capability-matrix.md)

`Claude Code`를 처음 볼 때는 "프로젝트 기억은 `CLAUDE.md`, 반복 가능한 작업은 `skill`, 전문 역할 분리는 `subagent`, 강한 설정은 `settings.json`, 공유는 `plugin`"이라고 이해하면 가장 덜 헷갈립니다.

특히 현재 공식 문서 기준에서는 예전의 custom command 개념이 `skill` 설명과 더 가깝게 합쳐져 있으므로, 초보자는 `skill`을 Claude Code의 핵심 확장 단위로 먼저 이해하는 편이 좋습니다.

## 1. `CLAUDE.md`: 프로젝트 기억과 작업 규칙

`CLAUDE.md`는 Claude Code가 세션 시작 시 읽는 프로젝트 지침 문서입니다. 빌드 명령, 테스트 규칙, 코딩 스타일, 아키텍처 요약처럼 매번 다시 설명하고 싶지 않은 정보를 적어 둡니다.

초보자용 해석:

- "`CLAUDE.md`는 이 프로젝트에서 Claude가 기억해야 할 기본 배경지식"
- "사람 팀원에게 README 대신 건네는 운영 메모에 가까움"
- "기술적 강제 설정 파일은 아님"

공식 문서는 `CLAUDE.md`와 auto memory를 구분하고, `AGENTS.md`를 직접 읽는 대신 `CLAUDE.md`에서 import하는 패턴도 설명합니다.

## 2. `skill`: 반복 가능한 작업 단위

현재 공식 문서 기준으로 Claude Code의 `skill`은 재사용 가능한 작업 단위이며, 직접 `/skill-name`으로 호출할 수도 있고 Claude가 관련 상황에서 자동으로 불러올 수도 있습니다. 문서에는 기존 `.claude/commands/` 파일도 계속 동작하지만, **custom commands have been merged into skills**라고 설명합니다.

초보자용 해석:

- 예전식 "custom command"도 지금은 skill 관점으로 이해하는 것이 더 정확함
- 절차, 체크리스트, 배경 지식을 프로젝트에 넣고 싶을 때 skill이 적합함
- `disable-model-invocation: true` 같은 설정으로 자동 호출 여부를 제어할 수 있음

이 저장소의 예시는 아래 파일들입니다.

- project skill 예시: [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md)
- legacy command 예시: [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md)

초보자에게는 이 둘을 "둘 다 재사용 가능한 작업 entrypoint이지만, 최신 공식 설명은 skill 중심"이라고 이해시키는 편이 좋습니다.

## 3. `subagent`: 역할 분리와 별도 맥락

Claude Code의 subagent는 특정 역할용으로 구성된 보조 에이전트입니다. 공식 문서 기준으로 Claude는 task description과 subagent의 `description`을 보고 자동 위임할 수 있고, 사용자가 직접 이름으로 요청하거나 `@` mention으로 보장 호출할 수도 있습니다. `--agent` 설정으로 세션 전체를 특정 agent 성격으로 실행하는 방식도 설명됩니다.

초보자용 해석:

- reviewer, planner, sync specialist처럼 역할을 분리할 때 사용
- 자동 위임도 가능하지만, 필요하면 사용자가 확실히 지정할 수 있음
- "큰 작업을 잘게 나눠 맡기는 구조"라는 점에서 skill과 다름

이 저장소의 예시는 아래 파일입니다.

- [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)

## 4. `settings.json`: 행동 지침과 별개인 기술 설정

Claude Code는 `CLAUDE.md`와 별개로 `settings.json`을 통해 권한, 환경 변수, 허용/차단 도구, 일부 실행 동작을 설정합니다. 공식 문서는 settings는 **enforced by the client**, `CLAUDE.md`는 behavior guidance라고 구분합니다.

초보자용 해석:

- `CLAUDE.md`는 "이렇게 일해줘"
- `settings.json`은 "이건 허용/금지야"
- 둘은 같은 설정층이 아니다

이 저장소의 예시는 아래 파일입니다.

- [../../../.claude/settings.json](../../../.claude/settings.json)

## 5. `plugin`: 공유 가능한 묶음

Claude Code의 plugin은 skills, agents, hooks, MCP 서버 같은 요소를 묶어서 공유하는 self-contained directory입니다. 공식 문서는 먼저 `.claude/`에서 standalone으로 빠르게 실험하고, 나중에 공유가 필요하면 plugin으로 전환하라고 권장합니다.

초보자용 해석:

- 프로젝트 안에서만 쓸 때는 `.claude/`로 시작
- 팀과 공유하거나 여러 프로젝트에 재사용하려면 plugin 고려
- plugin 안에 skill과 agent가 같이 들어갈 수 있음

## 6. 초보자 추천 학습 순서

1. 먼저 `CLAUDE.md`와 `settings.json` 차이를 익힌다.
2. 다음으로 project skill을 만든다.
3. 그 다음 역할 분리가 필요할 때 subagent를 만든다.
4. 여러 프로젝트 공유가 필요해질 때 plugin으로 승격한다.

## 7. 이 저장소에 연결해서 보면 좋은 포인트

- project subagent 예시: [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md)
- project skill 예시: [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md)
- settings 예시: [../../../.claude/settings.json](../../../.claude/settings.json)
- legacy command 예시: [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md)

## 8. 초보자가 자주 헷갈리는 점

- `CLAUDE.md`는 `settings.json`의 다른 이름이 아니다.
- `.claude/commands/`가 남아 있어도 최신 개념 설명은 skill 중심이다.
- `AGENTS.md`를 Claude Code가 기본 규약으로 읽는 것은 아니다.
  공식 문서는 필요하면 `CLAUDE.md`에서 `@AGENTS.md`로 import하라고 설명한다.
- subagent는 단순 명령 별칭이 아니라, 별도 역할과 맥락을 가진 보조 에이전트다.

## 공식 문서

- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Skills](https://code.claude.com/docs/en/skills)
- [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Settings](https://code.claude.com/docs/en/settings)
- [Plugins](https://code.claude.com/docs/en/plugins)
