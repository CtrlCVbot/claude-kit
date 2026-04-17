# Settings

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../src/templates/settings.json.template](../../src/templates/settings.json.template), [../../scripts/setup.js](../../scripts/setup.js), [../../scripts/merge-settings.js](../../scripts/merge-settings.js)
> **Related**: [../20-user-guide/02-configuration.md](../20-user-guide/02-configuration.md)

`.claude/settings.json` 은 **Claude Code 가 런타임에 읽는 설정** 입니다. claude-kit 은 `profile.json` 을 근거로 이 파일을 **동적 생성·병합** 합니다. 이 문서는 스키마와 생성 메커니즘을 설명합니다.

## 1. 파일 위치

| 파일 | 역할 | Git |
|------|------|-----|
| `.claude/settings.json` | kit 관리 설정 (프로젝트 공유) | tracked |
| `.claude/settings.local.json` | 사용자 전용 설정 (개인) | **gitignore 권장** |

두 파일은 Claude Code 에 의해 자동 병합됩니다. 같은 키가 있으면 `settings.local.json` 이 우선.

## 2. 스키마 개요

```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Write", "Glob", "Grep", "Bash"],
    "deny": ["WebFetch", "WebFetch(*)"]
  },
  "hooks": {
    "PreToolUse": [ /* 도메인 조건부 동적 생성 */ ],
    "PostToolUse": [ /* ... */ ],
    "Stop": [ /* ... */ ]
  },
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 2.1 permissions

| 키 | 타입 | 역할 |
|----|------|------|
| `allow` | string[] | 허용 도구 목록 |
| `deny` | string[] | 차단 도구 목록 (glob 지원) |
| `ask` | string[] | 매번 확인 대화 띄우는 도구 |

기본 `deny` 에 `WebFetch*` 가 들어 있는 이유: 프로젝트 규칙 상 WebFetch 는 세션 hang 리스크로 금지, Jina/Fetch MCP 로 대체 ([interaction.md](../../.claude/rules/interaction.md) 참조).

### 2.2 hooks

`setup.js` 의 `buildHooksConfig(activeDomains)` 가 활성 도메인에 맞춰 동적 생성합니다.

**도메인별 훅 예시**:

| 도메인 | 등록되는 훅 | 이벤트 |
|--------|------------|-------|
| `core` | `output-secret-filter`, `code-quality-reminder`, `session-wrap-suggest`, `security-auto-trigger`, `edit-tracker` | PostToolUse, Stop 등 |
| `dev` | `dev-tdd-guard`, `dev-db-guard`, `dev-feature-scope-guard` | PreToolUse |
| `plan` | `plan-doc-guard` | PreToolUse |
| `copy` | `copy-evidence-reminder`, `copy-scope-guard`, `copy-doc-drift-check`, `copy-variant-env-guard`, `copy-gate-stop` | PreToolUse / PostToolUse / Stop |

훅 실체는 `.claude/hooks/*.js`, 전체 목록은 [04-hooks.md](04-hooks.md) 자동 생성.

### 2.3 env

환경 변수. Claude Code 세션 전역.

| 변수 | 기본 | 역할 |
|------|------|------|
| `ENABLE_TOOL_SEARCH` | `auto:5` | 도구 수 5 초과 시 ToolSearch 로 지연 로딩 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1` | Agent Teams 기능 활성 |

추가 환경 변수는 copy 도메인 등에서 쓸 수 있습니다 (`SITE_VARIANT`, `SITE_VARIANT_HOST_MAP` 등 — [copy-variant 룰](../../src/claude/copy/rules/copy-variant.md) 참조).

## 3. 동적 생성 메커니즘

`setup.js` 내부 흐름:

```
profile.json (domains, targets)
  ↓
buildSettingsTemplate({ activeDomains })
  ├── permissions: 기본값 + 도메인별 추가
  ├── hooks: buildHooksConfig(activeDomains) 호출
  └── env: 공통 + 도메인별
  ↓
기존 .claude/settings.json 과 병합 (merge-settings.js)
  ├── 관리 키 (kit-managed): 덮어쓰기
  └── 사용자 커스텀 키: 보존
  ↓
.claude/settings.json 저장
```

### 3.1 kit-managed vs 사용자 커스텀

`merge-settings.js` 는 다음 원칙으로 병합합니다.

- **kit 관리 키** (permissions 기본 세트, kit 훅 엔트리, 표준 env): 최신 상태로 덮어씀
- **사용자 커스텀 키** (추가 권한, 추가 env, 새 훅 등): 보존

완전한 격리가 필요하다면 `.claude/settings.local.json` 사용.

## 4. 로컬 오버라이드 (`.claude/settings.local.json`)

개인별 설정. 예:

```json
{
  "permissions": {
    "allow": ["Bash(kubectl:*)"]
  },
  "env": {
    "DEBUG": "true"
  }
}
```

**권장 정책**:
- Git 에 커밋하지 않음 (`.gitignore` 에 추가)
- 팀 공유 설정은 `settings.json` 에, 개인 설정만 `settings.local.json` 에

## 5. 수정 가이드

| 하고 싶은 것 | 방법 |
|-------------|------|
| 새 도메인 훅 추가 | `profile.json` 의 `domains` 확장 → `pnpm install` |
| 권한 하나 추가 | `.claude/settings.local.json` 에 `permissions.allow` 추가 |
| 기본 훅 비활성 | **직접 수정 금지** — `profile.json` 에서 해당 도메인 제거 |
| 환경 변수 추가 | `.claude/settings.local.json` 의 `env` |
| kit 관리 키 덮어쓰기 | 지원 안 함 (재설치 시 복구됨) |

## 6. 검증

`.claude/settings.json` 유효성은 Claude Code 기동 시 자동 파싱 검증됩니다. 수동 검증:

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json'))" && echo OK
```

## 7. 참고

- 전체 설치 스크립트: [../../scripts/setup.js](../../scripts/setup.js)
- 병합 로직: [../../scripts/merge-settings.js](../../scripts/merge-settings.js)
- 템플릿 (참조용, 실제 생성은 동적): [../../src/templates/settings.json.template](../../src/templates/settings.json.template)
