# Installation and Configuration

> Audience: 처음 설치하는 사용자
> Related: [03-first-run-and-daily-workflow.md](03-first-run-and-daily-workflow.md), [../../30-reference/06-settings.md](../../30-reference/06-settings.md), [../codex/01-codex-dual-use.md](../codex/01-codex-dual-use.md)

## 기본 설치

```bash
pnpm install
```

설치 후 `postinstall`이 target에 맞는 출력물을 생성합니다. 설치 결과는 선택한 `targets`와 `domains`에 따라 달라집니다.

## `profile.json`에서 먼저 결정할 것

| 항목 | 의미 |
|---|---|
| `domains` | 활성화할 기능 묶음 |
| `targets` | `claude`, `codex` 중 어떤 surface를 생성할지 |
| `project` | 프로젝트 이름과 메타데이터 |
| `stack` | 기술 스택 힌트 |

예시:

```json
{
  "domains": ["core", "dev", "plan"],
  "targets": ["claude", "codex"]
}
```

## 설치 결과를 확인하는 법

- Claude surface: `.claude/`, `CLAUDE.md`
- Codex plugin surface: `plugins/claude-kit/**`
- Codex direct-use surface: `.agents/skills/**`, `.codex/agents/*.toml`, `AGENTS.md`

자세한 schema는 [../../30-reference/06-settings.md](../../30-reference/06-settings.md)를 참고하세요.

## 업데이트

```bash
pnpm update claude-kit
```

설치 결과가 기대와 다르면 먼저 rebuild/postinstall 경로를 확인한 뒤, 문제가 지속되면 [04-troubleshooting.md](04-troubleshooting.md)를 봅니다.