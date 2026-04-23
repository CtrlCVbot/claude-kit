# Codex 에이전트 기능 입문

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [01-agent-platform-overview.md](01-agent-platform-overview.md), [07-agent-capability-matrix.md](07-agent-capability-matrix.md)

`Codex`를 처음 볼 때는 "프로젝트 규칙을 읽고, 필요하면 skill을 불러오고, 복잡하면 subagent를 명시적으로 써서 역할을 나누고, 나중에 plugin으로 묶어 배포할 수 있는 도구"라고 이해하면 됩니다.

즉, `Codex`는 하나의 거대한 설정 파일만 있는 도구가 아니라, **규칙 문서 + 재사용 워크플로 + 역할 분리 + 배포 단위**가 나뉘어 있는 구조입니다.

## 1. `AGENTS.md`: 프로젝트 규칙을 알려주는 문서

`AGENTS.md`는 저장소 단위의 기본 작업 규칙을 Codex에게 알려주는 문서입니다. 공식 문서는 전역 `~/.codex/AGENTS.md`와 저장소 루트 `AGENTS.md`, 더 구체적인 하위 override 파일을 함께 설명합니다.

초보자 관점에서는 이렇게 이해하면 됩니다.

- "`AGENTS.md`는 프로젝트 운영 규칙"
- "테스트 명령, 리뷰 전 체크, 문서화 원칙 같은 넓은 약속을 적는 곳"
- "반복 절차 전체를 다 넣는 곳은 아님"

## 2. `skill`: 반복 가능한 워크플로

공식 문서에서 `skill`은 Codex에 새로운 작업 능력과 전문성을 주는 재사용 단위입니다. `SKILL.md`가 중심이며, 필요하면 스크립트와 참고 자료를 함께 둘 수 있습니다.

초보자용 해석:

- 자주 반복해서 설명하는 절차가 있으면 `skill`
- 긴 참고 문서를 항상 컨텍스트에 넣고 싶지 않으면 `skill`
- "언제 쓰는지"를 `description`에 구체적으로 적어 자동 선택되게 만들 수 있음

이 저장소의 실제 예시는 아래 파일입니다.

- [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)

이 예시는 Codex 관련 수정에서 먼저 "어디를 고쳐야 하는지", "무엇이 generated output인지", "어떤 검증을 해야 하는지"를 정리하게 만드는 project-specific guard skill입니다.

## 3. `subagent`: 전문 역할을 맡는 보조 에이전트

공식 문서 기준으로 Codex subagent는 복잡한 작업을 병렬로 나누거나, 특정 역할의 보조 에이전트를 두고 결과를 모을 때 사용합니다. 현재 문서 기준으로 Codex는 subagent를 **명시적으로 요청했을 때** 실행합니다.

초보자용 해석:

- "설명서를 읽는 skill"과 다르게, 실제로 역할을 나눠서 일시키는 구조
- 코드 탐색, 리뷰, 특정 범위 구현처럼 병렬화가 유리한 경우에 잘 맞음
- 무조건 켜지는 기능이 아니라, 필요할 때 꺼내 쓰는 고급 도구에 가까움

이 저장소의 예시는 아래 파일입니다.

- [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)

이 agent는 Codex sync 관련 작업을 읽기 전용으로 검토하도록 설계되어 있습니다.

## 4. `plugin`: skill과 agent를 배포하는 단위

공식 문서에서 `plugin`은 installable distribution unit입니다. 다시 말해 `skill`을 직접 설계하는 것과, 그것을 설치 가능한 형태로 다른 사람에게 배포하는 것은 다른 문제이며, 후자는 `plugin`이 담당합니다.

초보자용 해석:

- 혼자 또는 저장소 안에서 바로 쓸 때는 skill부터 시작
- 여러 프로젝트나 여러 사람에게 나눠 쓰고 싶어지면 plugin으로 포장
- "무엇을 하게 할지"와 "어떻게 배포할지"를 분리하면 구조가 덜 꼬임

현재 이 브랜치에는 Codex generated plugin 출력물이 항상 커밋돼 있지 않으므로, 이 문서에서는 plugin을 공식 개념 위주로 설명하고 저장소 예시는 skill과 custom agent 중심으로 듭니다.

## 5. 초보자 추천 학습 순서

1. 먼저 `AGENTS.md`가 무엇인지 이해한다.
2. 다음으로 반복 절차를 `skill`로 분리하는 감각을 익힌다.
3. 그 다음 복잡한 역할 분리에 `subagent`를 쓴다.
4. 마지막으로 공유가 필요해질 때 `plugin`을 본다.

이 순서가 좋은 이유는, 대부분의 초보자가 처음부터 plugin부터 보다가 구조를 너무 크게 이해하려 하기 때문입니다. 실제로는 `skill` 하나를 잘 만드는 것이 훨씬 먼저입니다.

## 6. 이 저장소에 연결해서 보면 좋은 포인트

- Codex skill 예시가 필요하면 [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md)부터 봅니다.
- Codex custom agent 예시가 필요하면 [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml)를 봅니다.
- Claude/Codex 운영 맥락까지 함께 보려면 [../../20-user-guide/06-codex-dual-use.md](../../20-user-guide/06-codex-dual-use.md)를 이어서 읽습니다.

## 7. 초보자가 자주 헷갈리는 점

- `AGENTS.md`는 skill 모음집이 아니다.
- `skill`은 plugin의 하위 개념이지 plugin과 같은 말이 아니다.
- `subagent`는 skill의 다른 이름이 아니다.
- "Codex용 파일"이라고 해서 항상 `src/codex/` 같은 경로만 보면 되는 것은 아니다.
  이 저장소처럼 실제 emitter와 문서 설명이 다를 수 있으므로, 저장소 로컬 예시는 항상 구현 기준으로 읽어야 한다.

## 공식 문서

- [Subagents](https://developers.openai.com/codex/subagents)
- [Agent Skills](https://developers.openai.com/codex/skills)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Build plugins](https://developers.openai.com/codex/plugins/build)
