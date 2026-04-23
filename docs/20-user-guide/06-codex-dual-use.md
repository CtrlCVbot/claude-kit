# Codex Dual Use

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../10-features/04-multi-target.md](../10-features/04-multi-target.md), [../archive/2026-04-17/codex-sync/sync-report-2026-04-15-final.md](../archive/2026-04-17/codex-sync/sync-report-2026-04-15-final.md)
> **Related**: [02-configuration.md](02-configuration.md)

Claude Code 와 Codex CLI 를 **동시에 사용** 하며 같은 자산을 공유하는 운영 가이드입니다. 개념 레벨 이해는 [../10-features/04-multi-target.md](../10-features/04-multi-target.md) 먼저 읽으세요.

## 1. 듀얼 활성

```json
// profile.json
{
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"]
}
```

저장 후:

```bash
pnpm install   # postinstall 재실행
```

## 2. 설치 결과 (듀얼)

| 산출물 | 용도 |
|--------|------|
| `.claude/` | Claude Code 런타임 |
| `.agents/skills/**` | Codex repo-local skills |
| `.codex/agents/*.toml` | Codex custom agents |
| `plugins/claude-kit/` | Codex plugin packaging output |
| `CLAUDE.md` | Claude 컨텍스트 |
| `AGENTS.md` | Codex 컨텍스트 |
| `.agents/plugins/marketplace.json` | Codex plugin 등록 |
| `plugins/claude-kit/hooks.json` | Codex 호환 훅 매니페스트 |

두 런타임은 **독립적** 으로 생성되며 서로 덮어쓰지 않습니다.

`AGENTS.md` 는 설치 프로젝트 기준 runtime guidance 입니다. `claude-kit` 저장소 내부 source 경로를 링크하지 않고, Codex 에서 바로 확인해야 하는 운영 기준만 inline 으로 담습니다.

## 3. Codex CLI 준비

### 3.1 설치

```bash
# Codex CLI (별도 패키지)
# 설치 방법은 Codex 공식 가이드 참조
```

### 3.2 collab 설정 (subagent 사용 시)

```toml
# ~/.codex/config.toml
collab = true
```

`collab = true` 가 있어야 Codex subagent 기능이 활성화됩니다. kit 의 에이전트를 Codex 에서 쓰려면 필수.

## 4. 환경별 커맨드 호출 차이

같은 기능을 두 환경에서 다르게 호출합니다.

| 동작 | Claude Code | Codex |
|------|-------------|-------|
| dev feature 시작 | `/dev-feature <prd>` | `/plugin:claude-kit:dev-feature <prd>` |
| 탐색 | `/dev-explore` | `/plugin:claude-kit:dev-explore` |
| 커밋 | `/dev-commit` | `/plugin:claude-kit:dev-commit` |

Codex 는 플러그인 네임스페이스 prefix 가 필요합니다. `AGENTS.md` 안에서는 편의상 슬래시 단축 형태를 쓸 수 있으나 실제 호출은 네임스페이스 포함.

## 5. 어느 쪽을 언제 쓰는가

| 상황 | 권장 |
|------|------|
| 시각적 IDE 통합, 긴 대화형 탐색 | Claude Code |
| 터미널 중심, 짧은 명령 체인 | Codex |
| 복잡한 기획·리뷰 (토큰 여유 필요) | Claude Code |
| 자동화된 스크립트·CI 연결 | Codex |
| MCP 서버 필요 | Claude Code only (Codex v1 미지원) |

## 6. 자산 동기화 유지

일상 개발 중 자산을 새로 추가·수정하면 Claude↔Codex 간 drift 가 발생할 수 있습니다.

### 6.1 자동 방어

- `/kit-create` 로 자산 생성 시 양 타깃 scaffolding 자동
- `pairing-registry.json` 에 entry 자동 추가
- CI 에서 `node scripts/audit-pairing.js` 정기 실행 권장

### 6.2 소비자 프로젝트에서의 동기화 확인

소비자 프로젝트에서는 `kit-sync` 를 runtime 기능처럼 실행하지 않습니다. 설치된 출력이 최신인지 확인하려면 패키지를 업데이트하거나 `postinstall` 을 다시 실행한 뒤, 생성 결과를 확인합니다.

```bash
pnpm update claude-kit
# 또는 필요 시
node node_modules/claude-kit/scripts/setup.js --dry-run
```

`kit-sync-agent` 와 `kit-*` maintenance toolchain 은 `claude-kit` 저장소 안에서 source parity 를 관리하는 용도입니다. Claude-only 자산 스캔, Codex 포팅 가능성 판정, `src/codex/` source 갱신, pairing-registry 갱신은 maintainers 작업으로 다룹니다.

### 6.3 감사

```bash
node scripts/audit-pairing.js    # pairing 일관성
node scripts/audit-drift.js      # 내용 drift
```

실패 시: registry 불일치. 수동 해결 또는 `/kit-audit` 로 자동 제안.

## 7. 훅 호환성

Codex 는 hook 매처 문법이 다릅니다. 일부는 `Full`, 일부는 `Partial`, 일부는 `Skip` 으로 분류됩니다.

확인:
```bash
node scripts/codex-hook-compat.js
```

출력 예:
- `output-secret-filter`: Full
- `dev-tdd-guard`: Partial (특정 매처만)
- `session-wrap-suggest`: Skip (Claude session state 의존)

skip 된 훅은 Codex 에서 대신 skill 이 역할을 수행합니다 (예: `session-wrap-suggest` 스킬).

## 8. 업그레이드

```bash
pnpm update claude-kit
```

- Claude 쪽: `.claude/settings.json` 커스텀 보존, kit 관리 키 갱신
- Codex plugin 쪽: `plugin.json`, `marketplace.json`, `hooks.json` **재생성** (사용자 커스텀 보존 없음)
- Codex direct-use 쪽: `.agents/skills/**`, `.codex/agents/*.toml` 은 managed marker/source hash 기준으로 갱신 또는 보존/conflict 처리

기존 `AGENTS.md` 는 보존됩니다. fresh install 로 생성되는 `AGENTS.md` 는 설치 프로젝트 기준 안내만 포함하고, 내부 source 링크나 maintainer sync metadata 를 포함하지 않아야 합니다.

## 9. 트러블슈팅

| 증상 | 확인 |
|------|------|
| Codex 에서 커맨드 안 보임 | `plugins/claude-kit/commands/` 디렉터리 + `marketplace.json` 등록 |
| 훅이 Claude 에서만 작동 | `codex-portability.json` 에서 `Skip` 여부 확인 |
| pairing drift 경고 | `/kit-audit` 후 제안된 조치 실행 |
| subagent 안 됨 | `~/.codex/config.toml` 의 `collab = true` 확인 |

자세한 증상별: [07-troubleshooting.md](07-troubleshooting.md).

## 다음 단계

- [../30-reference/07-pairing-registry.md](../30-reference/07-pairing-registry.md) — 현 pairing 상태
- [../10-features/04-multi-target.md](../10-features/04-multi-target.md) — 기능 레벨 세부
