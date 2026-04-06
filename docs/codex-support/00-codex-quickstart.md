# Codex에서 claude-kit 사용하기

> **Document Status**: v1 Available. `profile.json`에 `targets: ["codex"]` 추가 후 `pnpm run setup`으로 설치.

---

## 한눈에 보기

claude-kit은 Claude와 Codex 모두를 지원하는 멀티타겟 AI 거버넌스 패키지다. 같은 소스에서 타겟별로 다른 출력이 생성된다.

| | Claude | Codex |
|---|---|---|
| **설치 단위** | `.claude/` 폴더 | `plugins/claude-kit/` 플러그인 |
| **컨텍스트 문서** | `CLAUDE.md` | `AGENTS.md` |
| **설정 파일** | `.claude/settings.json` | `.codex-plugin/plugin.json` |
| **Hook 형식** | `.claude/hooks/*.js` | `hooks.json` |
| **Skills** | `.claude/skills/` | `plugins/claude-kit/skills/` |
| **Commands** | `.claude/commands/` | `plugins/claude-kit/commands/` |
| **Agents** | `.claude/agents/` | `plugins/claude-kit/agents/` |

---

## 전제조건

1. **Codex CLI** 설치 완료
2. **`~/.codex/config.toml`** 설정 (subagent 사용 시 `collab = true`)
3. **`pnpm`** 설치 완료
4. 프로젝트에 `claude-kit` 패키지 추가 (`pnpm add -D claude-kit`)

---

## 설치 방법

### Step 1: profile.json에 targets 추가

```json
{
  "project": {
    "name": "my-project",
    "domain": "my-domain"
  },
  "domains": ["core", "dev"],
  "targets": ["codex"]
}
```

| targets 값 | 결과 |
|------------|------|
| `["claude"]` (기본값) | Claude 전용 설치 (기존 동작) |
| `["codex"]` | Codex 전용 설치 |
| `["claude", "codex"]` | 양쪽 동시 설치 |

> `targets`를 생략하면 기본값 `["claude"]`가 적용된다. 기존 사용자는 변경 없이 그대로 사용 가능.

### Step 2: 설치 실행

```bash
pnpm run setup
```

### Step 3: 설치 결과 확인

Codex 타겟 설치 시 아래 구조가 생성된다:

```
{project}/
├── AGENTS.md                           ← Codex 프로젝트 컨텍스트
├── .agents/
│   └── plugins/
│       └── marketplace.json            ← 플러그인 등록 정보
└── plugins/
    └── claude-kit/
        ├── .codex-plugin/
        │   └── plugin.json             ← 플러그인 manifest
        ├── agents/                     ← 에이전트 (12개)
        ├── commands/                   ← 커맨드 (30개)
        ├── skills/                     ← 스킬 (23개)
        ├── hooks.json                  ← 호환 가능한 훅만
        └── assets/                     ← 기타 자산
```

Claude + Codex 동시 설치 시, `.claude/`와 `plugins/claude-kit/`이 **독립적으로** 생성된다. 서로 덮어쓰지 않는다.

---

## 자산 지원 수준

| 자산 유형 | 지원 수준 | 설명 |
|---------|:--------:|------|
| Skills | **Full** | plugin 내부 `skills/`에 배치 |
| Commands | **Full** | plugin 내부 `commands/`에 배치 |
| Agents | **Full** | plugin 내부 `agents/`에 배치 |
| Hooks | **Partial** | Codex 호환 훅만. Claude 전용 env/세션 의존 훅은 제외 |
| Rules | **Partial** | 직접 배치 안 함. `AGENTS.md`에서 참조 |
| MCP | **Excluded** | v1 범위 제외 (인증/transport 설계 필요) |

### 제외된 자산은 어디서 확인?

`.claude-kit-meta.json`의 `skippedForCodex` 필드에 제외 사유와 함께 기록된다:

```json
{
  "skippedForCodex": [
    {
      "component": "output-secret-filter.js",
      "reason": "depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime"
    }
  ]
}
```

---

## v1 제한사항

| 제한 | 이유 |
|------|------|
| Hook 부분 지원 | Claude 전용 환경변수, 홈 디렉토리 런타임 의존 훅 제외 |
| MCP 미지원 | 인증, transport, app/plugin 연결 구조가 동반되어야 함 |
| 전역 설치 미지원 | `~/.codex`가 아닌 repo-local 플러그인만 (충돌 정책 미정) |
| Rules 간접 참조 | Codex plugin 1급 배치 단위로 미확인, `AGENTS.md`에 흡수 |
| 런타임 100% 동일성 없음 | 설치 가능성 우선, 동작 parity는 v2 |

---

## Claude vs Codex: 같은 소스, 다른 출력

```
src/core/hooks/edit-tracker.js
  ├── Claude: .claude/hooks/edit-tracker.js        (JS 파일 직접 배치)
  └── Codex: plugins/claude-kit/hooks.json 엔트리  (JSON 선언)

src/dev/agents/dev-architect.md
  ├── Claude: .claude/agents/dev-architect.md
  └── Codex: plugins/claude-kit/agents/dev-architect.md

src/templates/CLAUDE.md.template
  ├── Claude: CLAUDE.md
  └── Codex: AGENTS.md
```

설치기 내부에서 `source assets → normalization → target emitter` 3단계를 거친다. Claude emitter와 Codex emitter가 각각 플랫폼 네이티브 구조로 출력한다.

---

## 기존 Claude 사용자에 미치는 영향

**없음.** `targets`를 추가하지 않으면 기존 `["claude"]` 기본값이 적용되어 동작이 완전히 동일하다.

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [implementation-plan.md](./implementation-plan.md) | v1 구현 설계 명세 (822행) |
| [01-asset-mapping-reference.md](./01-asset-mapping-reference.md) | 자산별 변환 규칙 상세 |
| [guide/09-architecture.md](../guide/09-architecture.md) | claude-kit 컴포넌트 카탈로그 (인벤토리 SSOT) |
