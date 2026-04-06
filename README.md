# claude-kit v2.1

AI 거버넌스 인프라 패키지. TDD 강제, Hexagonal Architecture, Rich Domain Model.
Claude + Codex 멀티타겟 지원.

## 설치

```bash
pnpm add -D github:CtrlCVbot/claude-kit
```

`postinstall`이 자동으로 `.claude/` 디렉토리에 컴포넌트를 설치합니다.

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

## Codex 지원

Codex에서 사용하려면 `profile.json`에 `targets`를 추가합니다:

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

Codex 설치 시 `plugins/claude-kit/` 플러그인 구조가 생성됩니다. 상세: [docs/codex-support/00-codex-quickstart.md](docs/codex-support/00-codex-quickstart.md)

## postinstall 동작

1. `profile.json`에서 도메인 + 타겟 설정 읽기
2. 타겟별 디렉토리에 컴포넌트 플래트닝 복사
   - Claude: `.claude/` | Codex: `plugins/claude-kit/`
3. `settings.json` 도메인 조건부 훅 등록 (Claude) / `hooks.json` 생성 (Codex)
4. `.claude-kit-meta.json` 메타데이터 기록

## 업데이트

```bash
pnpm update claude-kit
```

`CLAUDE.md`, `AGENTS.md`, `profile.json`은 보존됩니다. `settings.json`은 병합됩니다.

## License

MIT
