# Troubleshooting

> Audience: 설치/업데이트 문제를 겪는 사용자
> Related: [02-installation-and-configuration.md](02-installation-and-configuration.md), [../../30-reference/08-cli-scripts.md](../../30-reference/08-cli-scripts.md)

## 자주 보는 문제

### 설치는 됐는데 출력물이 안 생긴다

1. `pnpm install`이 실제로 실행되었는지 확인합니다.
2. 필요하면 `pnpm rebuild claude-kit`로 `postinstall`을 다시 실행합니다.
3. 그래도 안 되면 `node scripts/setup.js --dry-run`으로 예상 출력 경로를 점검합니다.

### `pnpm rebuild claude-kit`를 했는데 Codex 출력이 안 생긴다

이 경우는 설치 실패보다 `targets` 설정 문제일 가능성이 큽니다.

1. `profile.json`의 `targets` 배열을 확인합니다.
2. `codex`가 없으면 `emitCodex()`가 실행되지 않으므로 아래 출력은 갱신되지 않습니다.
   - `AGENTS.md`
   - `.agents/skills/**`
   - `.codex/agents/*.toml`
   - `plugins/claude-kit/**`
3. `targets`에 `"codex"`를 추가한 뒤 `pnpm rebuild claude-kit` 또는 `node scripts/setup.js --dry-run`으로 다시 확인합니다.
4. package repo 안에서 확인 중이라면 consumer fixture에 `targets:["codex"]`를 둔 임시 검증이 더 정확합니다.

### `postinstall`이 실패한다

- dependency 설치 상태를 다시 확인합니다.
- workspace 경로, 권한, Node/Pnpm 버전을 먼저 점검합니다.

### Windows 경로 이슈가 있다

- 공백/괄호가 포함된 경로에서 특정 호출이 불안정할 수 있습니다.
- rebuild 대신 direct setup 확인 경로를 먼저 시도합니다.

## escalation 기준

- 일반 사용자: 설치/업데이트 문제는 shared와 codex guide 범위에서 해결합니다.
- maintainer: source parity나 generated output 문제가 의심되면 [../sync/02-maintenance-workflow.md](../sync/02-maintenance-workflow.md)로 넘어갑니다.
