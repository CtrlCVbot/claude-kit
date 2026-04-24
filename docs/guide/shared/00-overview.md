# Shared Overview

> Audience: 모든 사용자
> Related: [01-core-concepts.md](01-core-concepts.md), [02-installation-and-configuration.md](02-installation-and-configuration.md), [../claude-code/00-overview.md](../claude-code/00-overview.md), [../codex/00-overview.md](../codex/00-overview.md)

claude-kit은 Claude Code와 Codex를 모두 염두에 두고 관리되는 작업 지원 패키지입니다. 핵심은 같은 목표를 위한 guide, command, agent, skill, rule을 유지하되, target별 runtime surface는 다르게 제공한다는 점입니다.

## 이 guide가 답하는 질문

- claude-kit이 무엇을 해 주는가
- 어떤 문서를 어디서부터 읽어야 하는가
- Claude Code와 Codex를 함께 쓸 때 무엇이 같고 무엇이 다른가

## 기본 이해

| 질문 | 요약 |
|---|---|
| 무엇을 제공하나 | domain별 command, agent, skill, hook, rule, documentation package |
| 무엇을 직접 수정하나 | source tree와 maintainer workflow |
| 무엇을 결과물로 받나 | `.claude/`, `plugins/claude-kit/`, `.agents/skills/`, `.codex/agents/`, `AGENTS.md` 등 target별 surface |
| 무엇을 먼저 읽나 | 공통 개념 -> 설치/설정 -> 내 target guide |

## 다음 읽기

1. 공통 개념: [01-core-concepts.md](01-core-concepts.md)
2. 설치와 설정: [02-installation-and-configuration.md](02-installation-and-configuration.md)
3. Claude Code 중심 사용: [../claude-code/00-overview.md](../claude-code/00-overview.md)
4. Codex 병행 사용: [../codex/00-overview.md](../codex/00-overview.md)