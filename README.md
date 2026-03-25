# claude-kit v2.0

AI 거버넌스 인프라 패키지. TDD 강제, Hexagonal Architecture, Rich Domain Model.

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

## postinstall 동작

1. `profile.json`에서 도메인 설정 읽기
2. `.claude/` 디렉토리에 컴포넌트 플래트닝 복사
3. `settings.json` 도메인 조건부 훅 등록
4. `.claude-kit-meta.json` 메타데이터 기록

## 업데이트

```bash
pnpm update claude-kit
```

`CLAUDE.md`, `profile.json`은 보존됩니다. `settings.json`은 병합됩니다.

## License

MIT
