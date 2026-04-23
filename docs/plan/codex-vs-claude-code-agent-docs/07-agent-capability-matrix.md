# Agent Capability Matrix

> **Status**: Draft (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **Related**: [02-codex-agent-features-for-beginners.md](02-codex-agent-features-for-beginners.md), [03-claude-code-agent-features-for-beginners.md](03-claude-code-agent-features-for-beginners.md)

이 문서는 빠르게 조회하는 참조표입니다. 설명보다 비교가 목적이므로, 세부 맥락은 앞 문서를 먼저 읽는 편이 좋습니다.

## 기능 매트릭스

| 항목 | Codex | Claude Code | 메모 |
|------|-------|-------------|------|
| 프로젝트 지침 파일 | `AGENTS.md` | `CLAUDE.md` | 이름과 로딩 규약이 다름 |
| 전역 지침 파일 | `~/.codex/AGENTS.md` | `~/.claude/CLAUDE.md` | 둘 다 사용자 범위 지침 지원 |
| 저장소 범위 지침 | 지원 | 지원 | 파일명은 다름 |
| 더 구체적인 하위 지침 | override 계층 설명 존재 | 디렉터리별 `CLAUDE.md` 로딩과 local 파일 설명 존재 | 동작 방식은 다름 |
| 재사용 워크플로 단위 | `skill` | `skill` | 공통 핵심 개념 |
| skill 파일 기본 진입점 | `SKILL.md` | `SKILL.md` | 공통 |
| skill 자동 로딩 | 지원 | 지원 | description 품질이 중요 |
| skill 직접 호출 | 가능 | 가능 | Claude Code는 `/skill-name` 감각이 더 노출됨 |
| supporting files가 있는 skill | 지원 | 지원 | 둘 다 progressive disclosure 지향 |
| custom subagent | 지원 | 지원 | 둘 다 역할 분리 가능 |
| subagent 자동 위임 | 공식 문서상 명시 요청 중심 | 공식 문서상 자동 위임 설명 강조 | 체감 차이 큼 |
| subagent 명시 호출 | 지원 | 지원 | Claude Code는 자연어, `@` mention, 세션 agent 설명이 더 다양 |
| 세션 전체를 특정 agent 성격으로 실행 | custom agent 구성으로 가능 | `--agent`/`agent` 설정 설명 | 표현 방식 차이 |
| plugin | 지원 | 지원 | 둘 다 배포/공유 단위 |
| plugin manifest | Codex plugin 구조 사용 | `.claude-plugin/plugin.json` | 형식 다름 |
| repo-local marketplace 개념 | 공식 문서에 설명 있음 | plugin manager/marketplace 흐름 강조 | 배포 UX 차이 |
| 행동 지침과 기술 설정 분리 | 있음, 다만 문서상 분리 체감은 Claude보다 약함 | `CLAUDE.md` vs `settings.json`가 분명함 | 초보자 체감상 큰 차이 |
| 권한 allow/deny 설정 | 도구/환경 설정 축으로 접근 | `settings.json`에서 직접 설명 | Claude Code가 더 전면적 |
| legacy command 호환 | 별도 skill 개념과 구분 | `.claude/commands/` 계속 동작, 하지만 skills로 통합 설명 | 현재 Claude 문서 변화 포인트 |
| command entrypoint | built-in slash command 중심 | built-in command + bundled skill + legacy command | 반복 절차는 Codex skill 후보 |
| project rules | `AGENTS.md`/skill로 대체, Codex `rules`는 명령 승인 정책 | `.claude/rules/*.md` | 직접 대응 아님 |
| path-specific rules | skill 또는 scoped docs로 설계 | `.claude/rules/` frontmatter `paths` | Codex `rules`와 목적 다름 |
| lifecycle hooks | experimental, feature flag 필요, Windows disabled | settings/plugin/skill/agent frontmatter hooks | 직접 parity 주의 |
| blocking guard | hook 실험 또는 명시 검증 command | hook exit code/prompt/agent hook | Codex에서는 fallback 검증 우선 |
| auto memory | Codex memories, off by default | auto memory, on by default 문서 설명 | 둘 다 규칙 SSOT로 쓰면 안 됨 |
| subagent memory | Codex memories 또는 skill reference로 보완 | subagent persistent memory 지원 | 직접 파일 구조는 다름 |
| `.claude/` 통합 구성 | 직접 동치 없음 | project-local 구성 루트 | Codex는 `.agents/`, `.codex/`, plugin 구조로 분산 |

## 이 저장소 연결 메모

| 저장소 파일 | 어떤 비교 축에 쓰기 좋은가 |
|------|---------------------------|
| [../../../.agents/skills/kit-codex-sync-guard/SKILL.md](../../../.agents/skills/kit-codex-sync-guard/SKILL.md) | Codex skill 예시 |
| [../../../.codex/agents/kit-codex-sync-reviewer.toml](../../../.codex/agents/kit-codex-sync-reviewer.toml) | Codex custom agent 예시 |
| [../../../.claude/agents/kit-sync-agent.md](../../../.claude/agents/kit-sync-agent.md) | Claude Code subagent 예시 |
| [../../../.claude/skills/dev-workflow/SKILL.md](../../../.claude/skills/dev-workflow/SKILL.md) | Claude Code skill 예시 |
| [../../../.claude/commands/dev-feature.md](../../../.claude/commands/dev-feature.md) | Claude Code legacy command 예시 |
| [../../../.claude/settings.json](../../../.claude/settings.json) | Claude Code settings 예시 |
| [../../../.claude/rules/verification.md](../../../.claude/rules/verification.md) | Claude Code rules 예시 |
| [../../../.claude/hooks/dev-tdd-guard.js](../../../.claude/hooks/dev-tdd-guard.js) | Claude Code blocking hook 예시 |
| [../../../.claude/agent-memory/kit-sync-agent/MEMORY.md](../../../.claude/agent-memory/kit-sync-agent/MEMORY.md) | repo-specific agent memory 예시 |

## 직접 대응 여부 요약

| Claude Code 중심 개념 | Codex 대응 판단 | 추천 대안 |
|------|------|------|
| `.claude/commands/` | 부분 대응 | `skill`, plugin command, explicit prompt |
| `.claude/rules/` | 직접 대응 아님 | `AGENTS.md`, `skill`, checked-in docs |
| Claude Code hooks | 부분 대응 | Codex hooks 실험 또는 explicit verification command |
| `agent-memory` | 부분 대응 | Codex memories, skill references, docs |
| `.claude/settings.json` | 부분 대응 | `~/.codex/config.toml`, Codex rules, hooks config |
| `.claude/` 구성 루트 | 직접 대응 아님 | `.agents/skills/`, `.codex/agents/`, plugin |

## 공식 문서

- OpenAI Codex: [Subagents](https://developers.openai.com/codex/subagents), [Agent Skills](https://developers.openai.com/codex/skills), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Build plugins](https://developers.openai.com/codex/plugins/build), [Rules](https://developers.openai.com/codex/rules), [Hooks](https://developers.openai.com/codex/hooks), [Memories](https://developers.openai.com/codex/memories)
- Claude Code: [Subagents](https://code.claude.com/docs/en/sub-agents), [Skills](https://code.claude.com/docs/en/skills), [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Plugins](https://code.claude.com/docs/en/plugins), [Commands](https://code.claude.com/docs/en/commands), [Hooks](https://code.claude.com/docs/en/hooks)
