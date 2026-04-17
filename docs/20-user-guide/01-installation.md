# Installation

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../README.md](../../README.md) §설치, §postinstall, §업데이트
> **Related**: [02-configuration.md](02-configuration.md), [03-first-run.md](03-first-run.md)

claude-kit 을 프로젝트에 설치하고, 설치 결과를 확인하고, 업데이트하는 전체 흐름입니다.

## 요구사항

| 항목 | 값 |
|------|-----|
| Node.js | `>=20.0.0` |
| 패키지 매니저 | pnpm 권장 (npm, yarn 도 가능) |
| 플랫폼 | macOS, Linux, Windows (Git Bash) |
| Codex 타깃 사용 시 추가 | Codex CLI 설치, subagent 기능 쓸 경우 `~/.codex/config.toml` 에 `collab = true` |

## 1. 기본 설치

프로젝트 루트에서:

```bash
pnpm add -D github:CtrlCVbot/claude-kit
```

이게 끝입니다. `postinstall` 이 자동으로 다음을 수행합니다.

1. `profile.json` 을 읽어 활성 `domains` 와 `targets` 를 확인 (없으면 기본값 `["core", "dev"]`, `["claude"]`)
2. 해당하는 자산을 타깃별 디렉터리로 복사
3. 컨텍스트 파일 (`CLAUDE.md` / `AGENTS.md`) 갱신
4. `CLAUDE-KIT-QUICKSTART.md` 루트 생성 — 설치 직후 바로 읽을 온보딩 문서
5. `.claude-kit-meta.json` 에 설치 메타데이터 기록

## 2. 설치 결과

| 산출물 | 경로 | 역할 |
|--------|------|------|
| Quick Start | `CLAUDE-KIT-QUICKSTART.md` | 설치 직후 첫 진입점 |
| Claude runtime | `.claude/` | 에이전트·커맨드·스킬·훅·규칙 |
| Codex runtime | `plugins/claude-kit/` | Codex 타깃 활성 시만 생성 |
| Codex registry | `.agents/plugins/marketplace.json` | Codex 플러그인 등록 |
| Claude context | `CLAUDE.md` | Claude 런타임 컨텍스트 |
| Codex context | `AGENTS.md` | Codex 런타임 컨텍스트 |
| 설치 메타 | `.claude-kit-meta.json` | 버전·활성 도메인·타깃 기록 |

Claude + Codex 동시 설치 시 `.claude/` 와 `plugins/claude-kit/` 은 **서로 독립적** 으로 생성되며 덮어쓰지 않습니다.

### Codex v1 지원 범위

| 자산 | Codex 지원 |
|------|----------|
| skills | Full (path copy) |
| commands | Full |
| agents | Full |
| hooks | Partial — Codex 호환 훅만 `hooks/` + `hooks.json` 생성 |
| rules | Partial — 별도 디렉터리 대신 `AGENTS.md` 에 흡수 |
| MCP | v1 제외 |

자세한 매핑 규칙: [Multi-Target](../10-features/04-multi-target.md) (P4 예정).

## 3. postinstall 동작 상세

`scripts/setup.js` 가 실행하는 단계:

```
1. profile.json → domains, targets 파싱
2. 타깃별 자산 복사
   ├── claude → .claude/
   └── codex  → plugins/claude-kit/
3. 타깃별 생성물 업데이트
   ├── claude → CLAUDE.md, .claude/settings.json
   └── codex  → AGENTS.md, plugin.json, marketplace.json, hooks.json
4. CLAUDE-KIT-QUICKSTART.md 생성/갱신
5. .claude-kit-meta.json 갱신
```

## 4. 설치 검증 체크리스트

설치 후 다음을 확인합니다.

- [ ] 루트에 `CLAUDE-KIT-QUICKSTART.md` 가 생겼는가
- [ ] `.claude/commands/` 에 `/dev-*`, `/plan-*` 등 슬래시 커맨드가 있는가 (활성 도메인에 따라)
- [ ] `.claude-kit-meta.json` 에 `version`, `domains`, `targets` 가 기록됐는가
- [ ] `.claude/settings.json` 의 `hooks` 가 활성 도메인에 맞게 구성됐는가
- [ ] (Codex 타깃 활성 시) `plugins/claude-kit/` 존재 + `AGENTS.md` 갱신됨

## 5. 업데이트

```bash
pnpm update claude-kit
```

업데이트 시에도 `postinstall` 이 다시 실행됩니다. 보존되는 것과 갱신되는 것:

| 보존 (사용자 영역) | 갱신 (kit 영역) |
|-------------------|----------------|
| `CLAUDE.md` 의 사용자 추가 섹션 | `CLAUDE.md` 의 `<!-- kit:managed --> ` 블록 |
| `profile.json` | 없음 (손대지 않음) |
| 기존 `AGENTS.md` | 없으면 템플릿으로 복구 |
| `.claude/settings.json` 의 사용자 커스텀 키 | kit 관리 키 병합 |
| `plugin.json`, `marketplace.json`, `hooks.json` (Codex) | **매번 재생성** |

공식 갱신 경로는 `pnpm update claude-kit` → `postinstall` → `scripts/setup.js`. `kit-sync` 는 이 저장소의 공식 로컬 npm script 가 아니므로 별도 wrapper 나 글로벌 alias 를 쓰는 경우에도 최종 기준은 `setup.js` 출력과 `.claude-kit-meta.json` 입니다.

## 6. 제거

```bash
pnpm remove claude-kit
```

주의: 위 명령은 패키지만 제거합니다. 다음은 수동으로 정리해야 합니다.
- `.claude/` 내용
- `plugins/claude-kit/`
- `CLAUDE.md`, `AGENTS.md` 의 `kit:managed` 블록
- `profile.json`, `.claude-kit-meta.json`, `CLAUDE-KIT-QUICKSTART.md`

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `postinstall` 실패: "Node version" | Node 20 미만 | Node 20+ 로 업그레이드 |
| `.claude/commands/` 가 비어 있음 | `profile.json` 의 `domains` 가 빈 배열 | `["core", "dev"]` 이상 명시 |
| Codex 훅이 작동 안 함 | Codex 호환 매처 한정 | [codex-portability](../../src/claude/_meta/codex-portability.json) 확인 |
| `kit-sync` 이 없다고 나옴 | 공식 npm script 아님 | `pnpm update claude-kit` 후 `setup.js` 출력 확인 |

더 많은 사례: [07-troubleshooting.md](07-troubleshooting.md) (P4 예정).

## 다음 단계

- [02-configuration.md](02-configuration.md) — `profile.json` 으로 도메인/타깃 조정
- [03-first-run.md](03-first-run.md) — 설치 직후 실행할 첫 커맨드들
- [04-daily-workflow.md](04-daily-workflow.md) — 일상 작업 흐름
