# Codex Dual Use

> **Status**: Draft (P5, 2026-04-24)
> **Source**: [../10-features/04-multi-target.md](../10-features/04-multi-target.md), [../../scripts/setup.js](../../scripts/setup.js)
> **Related**: [01-installation.md](01-installation.md), [02-configuration.md](02-configuration.md), [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md)

Claude와 Codex를 같은 프로젝트에서 함께 쓰는 방법을 설명합니다. 이 문서는 설치 프로젝트 사용자 기준의 가이드이며, `kit-sync` 같은 maintainer toolchain 운용법은 다루지 않습니다.

## 1. 활성화

`profile.json`에서 두 target을 함께 켭니다.

```json
{
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"]
}
```

설치 또는 갱신:

```bash
pnpm install
```

이미 설치된 프로젝트라면 패키지 갱신 후 `postinstall`이 다시 실행되도록 합니다.

## 2. 설치 결과

듀얼 타깃이 켜져 있으면 아래 산출물이 함께 정리됩니다.

| 산출물 | 용도 |
|---|---|
| `.claude/` | Claude runtime 자산 |
| `CLAUDE.md` | Claude용 런타임 컨텍스트 |
| `plugins/claude-kit/` | Codex plugin packaging output |
| `.agents/plugins/marketplace.json` | Codex plugin 등록 정보 |
| `.agents/skills/**` | Codex direct-use skill surface |
| `.codex/agents/*.toml` | Codex direct-use agent surface |
| `AGENTS.md` | Codex runtime guidance |

중요:

- command는 현재 plugin surface가 기본입니다.
- skill과 agent는 plugin output과 direct-use output이 함께 정리됩니다.
- `AGENTS.md`는 update 시 기존 사용자 본문을 보존하면서 managed section만 갱신됩니다.

## 3. Codex에서 무엇을 어떻게 쓰는가

| 분류 | 사용 방식 |
|---|---|
| command | `/plugin:claude-kit:...` 형태의 plugin namespace 사용 |
| skill | `.agents/skills/**`에 direct-use surface가 준비됨 |
| agent | `.codex/agents/*.toml`에 direct-use surface가 준비됨 |
| runtime guidance | `AGENTS.md`가 설치 프로젝트 기준 운영 지침을 제공 |

실무적으로는 아래처럼 이해하면 안전합니다.

1. command는 plugin command라고 생각한다.
2. skill과 agent는 direct-use surface도 함께 생성된다고 생각한다.
3. `AGENTS.md`는 설치 프로젝트 운영 지침이며, `claude-kit` 저장소의 source map이 아니다.

## 4. 하지 말아야 할 것

설치 프로젝트 사용자 기준으로는 아래 행동을 권장하지 않습니다.

- `plugins/claude-kit/**`를 source처럼 직접 수정
- `AGENTS.md`의 managed section을 source-of-truth처럼 취급
- `/kit-sync`, `/kit-convert`, `/kit-audit`를 소비자 runtime 기능처럼 이해

`kit-*` toolchain은 `claude-kit` 저장소 안에서 source parity를 유지하는 maintainer workflow입니다. 설치 프로젝트에서 결과가 오래돼 보이면 source를 손대는 대신 패키지를 갱신하거나 `setup.js`를 다시 실행하는 쪽이 맞습니다.

## 5. 업데이트

일반적인 갱신 순서는 아래와 같습니다.

```bash
pnpm update claude-kit
```

필요하면 설치 스크립트 결과를 미리 확인할 수 있습니다.

```bash
node node_modules/claude-kit/scripts/setup.js --dry-run
```

업데이트 시 기대 동작:

- `.claude/settings.json`은 merge 방식으로 갱신
- `plugins/claude-kit/`와 plugin metadata는 managed output으로 재생성
- `.agents/skills/**`, `.codex/agents/*.toml`은 managed marker/source hash 기준으로 갱신
- `AGENTS.md`는 managed section merge 방식으로 update

## 6. 점검과 트러블슈팅

가볍게 확인할 수 있는 항목:

- `plugins/claude-kit/commands/`가 존재하는지
- `.agents/plugins/marketplace.json`에 plugin 등록이 있는지
- `AGENTS.md`가 생성되었는지
- `.agents/skills/**`와 `.codex/agents/*.toml`이 함께 준비되었는지

문제가 있을 때는 아래를 먼저 확인합니다.

| 증상 | 먼저 볼 것 |
|---|---|
| Codex에서 command가 안 보임 | `plugins/claude-kit/commands/`, `.agents/plugins/marketplace.json` |
| AGENTS 내용이 기대와 다름 | 기존 `AGENTS.md`의 사용자 본문과 managed section merge 여부 |
| hook이 기대대로 안 보임 | `plugins/claude-kit/hooks.json`과 패키지 버전 |
| pair/drift 설명이 헷갈림 | [../10-features/04-multi-target.md](../10-features/04-multi-target.md) |

## 7. maintainer 문서가 필요한 경우

아래 질문이면 사용자 가이드가 아니라 maintainer 가이드를 보는 편이 맞습니다.

- 왜 어떤 hook은 `src/codex/**`를 보고 어떤 hook은 `src/claude/**` fallback을 쓰는가
- `pairing-registry-v2`의 `primaryCodex`, `transitionState`, `driftStatus`를 어떻게 해석하는가
- `kit-sync-agent`나 `kit-*` 명령이 실제로 무엇을 보장하는가
- reference의 `kit` domain을 사용자 문서와 어떻게 분리하는가

이 경우 [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md)를 먼저 읽으세요.

## 다음 단계

- [../10-features/04-multi-target.md](../10-features/04-multi-target.md) — 멀티타깃 구조 설명
- [07-troubleshooting.md](07-troubleshooting.md) — 일반 트러블슈팅
- [../40-contributing/06-codex-sync-maintenance.md](../40-contributing/06-codex-sync-maintenance.md) — maintainer용 codex sync 가이드
