# Codex Dual Use

> Audience: Codex를 함께 쓰는 사용자
> Related: [02-runtime-surfaces.md](02-runtime-surfaces.md), [../mapping/01-claude-to-codex-surface-matrix.md](../mapping/01-claude-to-codex-surface-matrix.md), [../sync/02-maintenance-workflow.md](../sync/02-maintenance-workflow.md)

Codex dual-use는 같은 프로젝트에서 Claude와 Codex를 함께 쓰되, Codex에는 Codex용 runtime surface가 생성되도록 유지하는 방식입니다.

## 설치 결과에서 봐야 할 것

| 출력물 | 의미 |
|---|---|
| `plugins/claude-kit/**` | Codex plugin packaging output |
| `.agents/skills/**` | Codex direct-use skill surface |
| `.codex/agents/*.toml` | Codex direct-use agent surface |
| `AGENTS.md` | Codex runtime guidance |

> 참고: 이 출력들은 `profile.json`의 `targets`에 `codex`가 있을 때만 생성/갱신됩니다. `pnpm rebuild claude-kit` 후에도 보이지 않으면 먼저 target 설정을 확인합니다.

## 하지 말아야 할 것

- `plugins/claude-kit/**`를 source처럼 직접 수정하기
- `AGENTS.md` managed section을 primary SSOT처럼 다루기
- maintainer 전용 `kit-*` toolchain을 일반 runtime usage와 혼동하기

## 다음 읽기

- runtime surface 세부: [02-runtime-surfaces.md](02-runtime-surfaces.md)
- 대응 관계: [../mapping/01-claude-to-codex-surface-matrix.md](../mapping/01-claude-to-codex-surface-matrix.md)
- maintainer 관점 경계: [../sync/03-generated-output-boundaries.md](../sync/03-generated-output-boundaries.md)
