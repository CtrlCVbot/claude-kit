# Configuration

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../src/templates/profile.json.template](../../src/templates/profile.json.template), [../../README.md](../../README.md) §도메인·타깃
> **Related**: [01-installation.md](01-installation.md), [../30-reference/06-settings.md](../30-reference/06-settings.md)

설치 후 프로젝트에 맞게 도메인·타깃·스택을 조정하는 방법입니다. 거의 모든 설정은 프로젝트 루트의 **`profile.json`** 한 파일에서 이루어집니다.

## 1. profile.json 전체 구조

```json
{
  "project": {
    "name": "my-app",
    "description": "짧은 프로젝트 설명",
    "type": "monorepo"
  },
  "domains": ["core", "dev"],
  "targets": ["claude"],
  "monorepo": {
    "packageManager": "pnpm",
    "framework": "turborepo"
  },
  "stack": {
    "language": "typescript",
    "testRunner": "vitest",
    "architecture": "hexagonal"
  }
}
```

각 블록은 다음 절에서 상세히 설명합니다. 블록이 빠지면 기본값이 적용됩니다.

## 2. domains — 활성 도메인 선택

**어떤 기능 묶음을 이 프로젝트에 설치할지** 결정합니다.

| 값 | 기본 포함 | 설치되는 것 |
|----|---------|------------|
| `core` | ✅ 항상 | 공통 훅·규칙·스킬 (session-wrap 등) |
| `dev` | ✅ 기본 | TDD 가드, 아키텍처 에이전트, 구현 파이프라인 |
| `plan` | ⬜ opt-in | 아이디어→PRD→브리지 파이프라인 |
| `copy` | ⬜ opt-in | 레퍼런스 대비 UI 충실도 관리 |

### 예시 프로필

**단순 프로젝트** (기획 도메인 불필요):
```json
{ "domains": ["core", "dev"] }
```

**기획까지 활용**:
```json
{ "domains": ["core", "dev", "plan"] }
```

**UI 충실도가 중요한 마케팅 사이트**:
```json
{ "domains": ["core", "dev", "plan", "copy"] }
```

`profile.json` 자체가 없으면 `["core", "dev"]` 가 적용됩니다.

## 3. targets — 설치 타깃 선택

**어떤 AI 에이전트 플랫폼에 설치할지** 결정합니다.

| targets 값 | 결과 |
|-----------|------|
| `["claude"]` 또는 생략 | Claude 전용 (기본) |
| `["codex"]` | Codex 전용 |
| `["claude", "codex"]` | 양쪽 동시 설치 |

Codex 를 포함할 경우 Codex CLI 설치가 필요합니다. subagent 까지 쓰려면 `~/.codex/config.toml` 에 `collab = true` 를 추가합니다.

## 4. project — 프로젝트 메타

| 필드 | 용도 |
|------|------|
| `name` | `CLAUDE.md`, `AGENTS.md` 의 h1 제목으로 삽입 |
| `description` | 동일 파일의 부제로 삽입 |
| `type` | `monorepo`, `app`, `library` — 후속 템플릿 분기에 사용 |

이 필드들은 템플릿 변수 (`{{PROJECT_NAME}}` 등) 로 치환됩니다.

## 5. monorepo — 모노레포 설정

`project.type` 이 `monorepo` 일 때만 의미가 있습니다.

| 필드 | 예시 값 |
|------|--------|
| `packageManager` | `pnpm`, `npm`, `yarn` |
| `framework` | `turborepo`, `nx`, `lerna` |

Quick Start 문서 생성 시 패키지 매니저별 명령어 예시가 분기됩니다.

## 6. stack — 기술 스택

| 필드 | 기본값 | 영향 |
|------|-------|------|
| `language` | `typescript` | TDD 가드의 면제 패턴 선택 |
| `testRunner` | `vitest` | 테스트 파일 탐지 규칙 |
| `architecture` | `hexagonal` | `dev-architect` 에이전트의 레이어 검증 기준 |

현 시점 주요 지원:
- language: `typescript`, `java`, `python`
- testRunner: `vitest`, `jest`, `junit`, `pytest`
- architecture: `hexagonal`, `clean`, `service-module`, `minimal-layered`

## 7. 변경 후 재설치

`profile.json` 을 수정했다면 반드시 다음을 실행하여 자산을 재배포합니다.

```bash
pnpm install   # 또는 pnpm claude-kit:setup
```

`postinstall` 이 다시 돌면서 도메인 변경에 맞춰 `.claude/` 구성이 갱신됩니다.

⚠️ **주의**: 도메인을 **제거** 하는 경우 해당 도메인의 `.claude/` 파일이 자동 삭제되지 않을 수 있습니다. 수동 정리가 필요합니다 — 남은 파일: `.claude/commands/dev-*`, `.claude/hooks/dev-*` 등.

## 8. settings.json 과의 관계

`profile.json` 은 **설치 시점** 설정입니다. 런타임에 Claude Code 가 읽는 설정은 `.claude/settings.json` 이며, 이는 `setup.js` 가 profile 기반으로 **동적 생성** 합니다.

- `profile.json` → 무엇을 설치할까 (domains, targets)
- `.claude/settings.json` → 설치 결과를 어떻게 런타임에 연결할까 (hooks, permissions, env)

직접 `.claude/settings.json` 을 편집하면 다음 재설치에서 일부 키가 덮어쓰기될 수 있습니다. 커스터마이즈는 `.claude/settings.local.json` (사용자 전용) 을 권장합니다. 자세한 스키마: [../30-reference/06-settings.md](../30-reference/06-settings.md).

## 9. 최소 프로필 vs 전체 프로필

**최소** (모든 기본값 수용):
```json
{}
```

**전체** (모든 필드 명시):
```json
{
  "project": { "name": "my-app", "description": "...", "type": "monorepo" },
  "domains": ["core", "dev", "plan", "copy"],
  "targets": ["claude", "codex"],
  "monorepo": { "packageManager": "pnpm", "framework": "turborepo" },
  "stack": { "language": "typescript", "testRunner": "vitest", "architecture": "hexagonal" }
}
```

둘 다 유효합니다. 선택은 프로젝트 복잡도에 맞추세요.

## 다음 단계

- [03-first-run.md](03-first-run.md) — 설치 후 첫 커맨드 실행
- [../30-reference/06-settings.md](../30-reference/06-settings.md) — `.claude/settings.json` 스키마
- [../10-features/](../10-features/) — 각 도메인의 기능 상세
