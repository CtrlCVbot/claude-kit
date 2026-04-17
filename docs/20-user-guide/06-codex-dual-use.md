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
| `plugins/claude-kit/` | Codex 런타임 (repo-local plugin) |
| `CLAUDE.md` | Claude 컨텍스트 |
| `AGENTS.md` | Codex 컨텍스트 |
| `.agents/plugins/marketplace.json` | Codex plugin 등록 |
| `plugins/claude-kit/hooks.json` | Codex 호환 훅 매니페스트 |

두 런타임은 **독립적** 으로 생성되며 서로 덮어쓰지 않습니다.

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

### 6.2 수동 동기화

```
/kit-sync
```

`kit-sync-agent` 서브에이전트가:
1. Claude-only 자산 스캔
2. Codex 포팅 가능성 판정 (exception-registry 참조)
3. `src/codex/` 에 대응 자산 생성
4. pairing-registry 갱신

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
- Codex 쪽: `plugin.json`, `marketplace.json`, `hooks.json` **재생성** (사용자 커스텀 보존 없음)

Codex 쪽의 커스텀은 `AGENTS.md` 내 `<!-- kit:managed -->` 블록 바깥 영역에만 두세요.

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
