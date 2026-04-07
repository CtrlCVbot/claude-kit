# claude-kit v2.1

AI 거버넌스 인프라 패키지. TDD 강제, Hexagonal Architecture, Rich Domain Model.
Claude + Codex 멀티타겟 지원.

## 설치

```bash
pnpm add -D github:CtrlCVbot/claude-kit
```

`postinstall`이 `profile.json`의 `targets`를 읽어 타겟별 설치 경로에 컴포넌트를 설치합니다. 기본값은 Claude(`.claude/`)이며, Codex를 선택하면 `plugins/claude-kit/` 플러그인 구조가 함께 생성됩니다.

## 도메인

| 도메인 | 설치 | 내용 | 수량 |
|--------|------|------|------|
| **core** | 항상 | hooks, rules, skills | ~13 |
| **dev** | 기본 | agents, commands, hooks, skills | ~42 |
| **plan** | opt-in | 기획 파이프라인 (agents, commands, hooks, skills) | ~22 |

## 설정

프로젝트 루트에 `profile.json`을 생성하여 도메인을 선택합니다:

```json
{
  "domains": ["core", "dev"]
}
```

기획 파이프라인을 포함하려면:

```json
{
  "domains": ["core", "dev", "plan"]
}
```

`profile.json`이 없으면 기본값 `["core", "dev"]`가 적용됩니다.

### 타겟 설정

설치 타겟까지 함께 지정하려면 `profile.json`에 `targets`를 추가합니다:

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
| `["claude", "codex"]` | 양쪽 동시 설치 |

`targets`를 생략하면 기본값 `["claude"]`가 적용되므로 기존 Claude 사용자는 설정을 바꾸지 않아도 됩니다.

## Codex 지원

Codex를 함께 사용하려면 Codex CLI가 준비되어 있어야 합니다. subagent 기능까지 사용할 경우 `~/.codex/config.toml`에 `collab = true`를 설정합니다.

Codex 전용 설치 예시:

```json
{
  "domains": ["core", "dev"],
  "targets": ["codex"]
}
```

양쪽 동시 설치:

```json
{
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"]
}
```

Codex 설치 시 아래 repo-local 플러그인 구조가 생성됩니다:

```text
{project}/
├── AGENTS.md
├── .agents/
│   └── plugins/
│       └── marketplace.json
└── plugins/
    └── claude-kit/
        ├── .codex-plugin/
        │   └── plugin.json
        ├── agents/
        ├── commands/
        ├── skills/
        ├── hooks/
        └── hooks.json
```

Claude + Codex 동시 설치 시 `.claude/`와 `plugins/claude-kit/`은 독립적으로 생성되며 서로 덮어쓰지 않습니다.

Codex v1 지원 범위는 다음과 같습니다:

- `skills`, `commands`, `agents`: Full (path copy). 출력 경로만 바뀌고 자산 본문 문자열은 수정하지 않습니다.
- `hooks`: Partial. Codex 호환 훅만 `hooks/`와 `hooks.json`으로 생성합니다.
- `rules`: Partial. 별도 디렉토리로 복사하지 않고 `AGENTS.md`에 핵심 규칙을 요약합니다.
- `mcp`: Excluded. 인증과 transport 설계가 필요해 v1 범위에서 제외합니다.

자산 매핑 규칙, skip 정책, `skippedForCodex`, emitter 구조는 [docs/guide/09-architecture.md](docs/guide/09-architecture.md)를 기준으로 봅니다.
Codex 호환 기능 설명과 도입 계획은 [docs/codex-compatibility/00-overview.md](docs/codex-compatibility/00-overview.md)를 진입점으로 하는 문서 세트에 정리했습니다.

## postinstall 동작

1. `profile.json`에서 도메인 + 타겟 설정 읽기
2. 타겟별 디렉토리에 컴포넌트 플래트닝 복사
   - Claude: `.claude/` | Codex: `plugins/claude-kit/`
3. `settings.json` 도메인 조건부 훅 등록 (Claude) / `hooks/` + `hooks.json` 생성 (Codex)
4. `.claude-kit-meta.json` 메타데이터 기록

## 업데이트

```bash
pnpm update claude-kit
```

`CLAUDE.md`, `AGENTS.md`, `profile.json`은 보존됩니다. `settings.json`은 Claude 타겟에서만 병합되며, Codex 쪽 `plugin.json`, `marketplace.json`, `hooks.json`은 최신 기준으로 다시 생성됩니다.

## License

MIT
