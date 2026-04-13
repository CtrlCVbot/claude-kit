# claude-kit v2.1

AI 거버넌스 인프라 패키지. TDD 강제, Hexagonal Architecture, Rich Domain Model.
Claude + Codex 멀티타겟 지원.

## 설치

```bash
pnpm add -D github:CtrlCVbot/claude-kit
```

`postinstall`이 `profile.json`을 읽어 활성 `domains`와 `targets`에 맞는 컴포넌트를 설치한다. 기본값은 `domains: ["core", "dev"]`, `targets: ["claude"]`다.

설치가 끝나면 프로젝트 루트에 `CLAUDE-KIT-QUICKSTART.md`가 생성된다. 이 문서는 설치 직후 사용자가 바로 열어볼 온보딩 진입 문서이며, 상세 사용 가이드는 `docs/guide/*`를 기준으로 본다.

## 도메인 선택

| 도메인 | 기본값 | 언제 쓰는가 | 내용 |
|--------|--------|-------------|------|
| `core` | 항상 포함 | 공통 가드레일이 필요할 때 | hooks, rules, skills |
| `dev` | 기본 포함 | 요구사항이 이미 있고 바로 구현할 때 | agents, commands, hooks, skills |
| `plan` | opt-in | 아이디어에서 PRD/브리지까지 기획 흐름이 필요할 때 | agents, commands, hooks, skills |

기본 설정:

```json
{
  "domains": ["core", "dev"]
}
```

기획 파이프라인까지 포함:

```json
{
  "domains": ["core", "dev", "plan"]
}
```

`profile.json`이 없으면 기본값 `["core", "dev"]`가 적용된다.

## 타겟 선택

설치 타겟까지 함께 지정하려면 `profile.json`에 `targets`를 추가한다.

```json
{
  "domains": ["core", "dev"],
  "targets": ["claude"]
}
```

| `targets` 값 | 결과 |
|-------------|------|
| `["claude"]` 또는 생략 | Claude 전용 설치 (기본 동작) |
| `["codex"]` | Codex 전용 설치 |
| `["claude", "codex"]` | Claude + Codex 동시 설치 |

Codex를 함께 사용할 경우 Codex CLI가 준비되어 있어야 한다. subagent 기능까지 쓸 경우 `~/.codex/config.toml`에 `collab = true`를 설정한다.

## 설치 결과

| 산출물 | 경로 | 설명 |
|--------|------|------|
| Quick Start | `CLAUDE-KIT-QUICKSTART.md` | 설치 직후 열어볼 루트 온보딩 문서 |
| Claude runtime | `.claude/` | Claude 전용 agents, commands, skills, hooks, rules |
| Codex runtime | `plugins/claude-kit/` | Codex repo-local plugin 구조 |
| Codex registry | `.agents/plugins/marketplace.json` | Codex plugin 등록 정보 |
| Claude context | `CLAUDE.md` | Claude용 런타임 컨텍스트 |
| Codex context | `AGENTS.md` | Codex용 런타임 컨텍스트 |

Claude + Codex 동시 설치 시 `.claude/`와 `plugins/claude-kit/`은 서로 독립적으로 생성되며 덮어쓰지 않는다.

Codex v1 지원 범위는 다음과 같다.

- `skills`, `commands`, `agents`: Full (path copy)
- `hooks`: Partial. Codex 호환 훅만 `hooks/`와 `hooks.json`으로 생성
- `rules`: Partial. 별도 디렉토리 복사 대신 `AGENTS.md`에 핵심 규칙 흡수
- `mcp`: Excluded. 인증 및 transport 설계가 필요해 v1 범위에서 제외

자산 매핑 규칙과 skip 정책은 [docs/guide/09-architecture.md](docs/guide/09-architecture.md)를 기준으로 본다.

## postinstall 동작

1. `profile.json`에서 활성 `domains`와 `targets`를 읽는다.
2. 타겟별 디렉토리에 컴포넌트를 복사한다.
   - Claude: `.claude/`
   - Codex: `plugins/claude-kit/`
3. 타겟별 생성물을 갱신한다.
   - Claude: `CLAUDE.md`, `.claude/settings.json`
   - Codex: `AGENTS.md`, `plugin.json`, `marketplace.json`, `hooks.json`
4. 루트 Quick Start 문서 `CLAUDE-KIT-QUICKSTART.md`를 생성 또는 갱신한다.
5. `.claude-kit-meta.json`에 설치 메타데이터를 기록한다.

## 업데이트

```bash
pnpm update claude-kit
```

`CLAUDE.md`, `AGENTS.md`, `profile.json`은 기존 정책대로 보존된다. `settings.json`은 Claude 타겟에서 병합되며, Codex 쪽 `plugin.json`, `marketplace.json`, `hooks.json`은 최신 기준으로 다시 생성된다. `CLAUDE-KIT-QUICKSTART.md`는 설치 상태와 맞도록 업데이트 시 재생성된다.

## 다음 문서

- [docs/guide/13-quick-start.md](docs/guide/13-quick-start.md): 설치 후 바로 쓰는 Quick Start SSOT
- [docs/guide/00-overview.md](docs/guide/00-overview.md): 문서 세트 진입점과 읽기 순서
- [docs/guide/09-architecture.md](docs/guide/09-architecture.md): 출력 구조, 타겟 차이, emitter 계약
- [docs/codex-compatibility/00-overview.md](docs/codex-compatibility/00-overview.md): Codex 호환 문서 세트 진입점

## License

MIT
