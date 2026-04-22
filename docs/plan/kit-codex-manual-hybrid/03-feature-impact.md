# 03. Feature Impact — 현재 claude-kit 기능 영향

> **결론**: 새 문제(PB-1~9)는 claude-kit 기능군을 **"배포 이전"**과 **"배포 이후"**로 이분한다. 기존 `/kit-sync`·`/kit-convert`는 "배포 이전"(소스 변환)만 다루고, "배포 이후"(캐시 → 런타임) 단계가 공백이다. 본 문서는 11개 기능(커맨드 7 + 에이전트 2 + 스크립트 2)의 영향을 표로 정리하고, 신규 3개 컴포넌트(`plugins/claude-kit/`, `/kit-deploy-codex`, `scripts/deploy-codex-cache.js`)의 삽입 지점을 명시한다.

---

## 1. 기능군 영향 요약표

| 기능 | 현재 역할 | 새 문제와의 관계 | 변경 강도 |
|------|---------|----------------|---------|
| `/kit-sync` | `src/claude` ↔ `src/codex` 동기화 | **배포 이전 단계만** — 캐시 도달까지 확장 필요 | 🟡 MEDIUM (후속 단계 훅 추가) |
| `/kit-convert` | 타입별 변환 | 현상 유지 | 🟢 LOW |
| `/kit-analyze` | 4-tier 전략 분류 | 현상 유지 | 🟢 LOW |
| `/kit-validate` | 12 스키마 검증 | `schema-plugin-manifest.md` 신규 필요 | 🟡 MEDIUM |
| `/kit-audit` | C1~C10 카테고리 | **C12 (plugin-deploy-integrity) 신규** | 🔴 HIGH |
| `/kit-create` | 12 템플릿 스캐폴드 | `plugins/claude-kit/` 번들 스캐폴드 추가 가능 | 🟡 MEDIUM |
| `/kit-list` | 자산 인벤토리 | `--target plugin-bundle` 옵션 추가 | 🟢 LOW |
| `kit-sync-agent` | 6-phase 오케스트레이션 | **Phase 7(deploy) 신설** 제안 | 🔴 HIGH |
| `kit-maintainer` | 벌크 감사/수정 | plugin bundle 정합 수정 포함 | 🟡 MEDIUM |
| `scripts/setup.js` | node_modules 설치 시 `.claude/` 배포 | **plugin bundle 빌드 로직 추가** | 🔴 HIGH |
| `scripts/codex-hook-compat.js` | hooks.json 생성 | bundle 경로로 출력 방향 변경 | 🟡 MEDIUM |

범례: 🔴 HIGH (코드 전면 변경) / 🟡 MEDIUM (기능 확장) / 🟢 LOW (변경 없음 또는 옵션 추가)

## 2. 신규 컴포넌트 삽입 지점

### 2.1 `plugins/claude-kit/` (신규 디렉터리)

- **경로**: `plugins/claude-kit/`
- **빌드 산출물 여부**: 하이브리드 — `.codex-plugin/plugin.json`은 소스로 관리, `skills/`·`commands/`·`agents/`·`hooks.json`은 빌드 산출물
- **생성 시점**: `pnpm build` 또는 `pnpm run build:plugin` (신규)
- **.gitignore 정책**: `.codex-plugin/` 커밋, 빌드 산출물은 .gitignore 후보

### 2.2 `/kit-deploy-codex` (신규 커맨드)

- **경로**: `src/claude/core/commands/kit-deploy-codex.md`
- **진입점**: `kit-sync-agent` Phase 7 or 사용자 직접 호출
- **의존 스크립트**: `scripts/deploy-codex-cache.js`
- **플래그**: `--dry-run`, `--version <ver>`, `--rollback`, `--backup-only`, `--force`, `--target-home <path>`

### 2.3 `scripts/deploy-codex-cache.js` (신규 Node 스크립트)

- **경로**: `scripts/deploy-codex-cache.js`
- **런타임**: Node 18+
- **의존성**: 기존 `scripts/codex-hook-compat.js`와 공유 모듈(경로 해석, 파일 복사)
- **CLI 인터페이스**: `node scripts/deploy-codex-cache.js [flags]`

## 3. 기능별 상세 영향

### 3.1 `/kit-sync` 및 `kit-sync-agent`

- **Phase 7 (신규) — Deploy**: 캐시 복사 + 검증
- **Phase 7 실행 조건**: `--deploy` 플래그 또는 `kit-sync.config.json`에 `autoDeploy: true`
- **기본값**: 비활성 (opt-in) — 기존 사용자 영향 최소화

### 3.2 `/kit-validate`

- `schema-plugin-manifest.md` 신규 스키마 (필드: `name`, `version`, `interface.category`, `description`, `entry` 등)
- `--target plugin-bundle` 옵션 추가
- `plugins/claude-kit/.codex-plugin/plugin.json` 전용 검증

### 3.3 `/kit-audit` C12 (plugin-deploy-integrity)

신규 카테고리 검증 항목:

| 검증 | 설명 |
|------|------|
| C12-1 | `plugins/claude-kit/.codex-plugin/plugin.json` 존재 + SemVer 유효 |
| C12-2 | `~/.codex/config.toml`에 `[plugins."claude-kit@<source>"]` 엔트리 존재 + `enabled=true` |
| C12-3 | `~/.codex/plugins/cache/<source>/claude-kit/<version>/` 디렉터리 존재 |
| C12-4 | 캐시의 `plugin.json` 버전 = repo의 `plugin.json` 버전 |
| C12-5 | 캐시 하위에 `skills/`, `commands/`, `agents/`, `hooks.json` 모두 존재 |
| C12-6 | 백업 디렉터리(`~/.codex/tmp/plugin-cache-backups/`) 존재 (경고 수준) |

**자동 수정**: C12-2 오타 제안, C12-6 디렉터리 생성 (나머지는 수동 판단).

### 3.4 `scripts/setup.js`

- `buildPluginBundle()` 함수 신규 — `src/` → `plugins/claude-kit/` 복사 + 변환
- 실행 시점: `pnpm install` postinstall에서 선택적(`CLAUDE_KIT_BUILD_PLUGIN=1`)
- 기본값: 비활성 (기존 다운스트림 영향 최소화)

### 3.5 `scripts/codex-hook-compat.js`

- 기존: `src/codex/.../hooks.json` 생성
- 확장: `plugins/claude-kit/hooks.json`도 동일 로직으로 생성 (출력 경로 파라미터화)

## 4. 의존성 방향 변화

### 현재

```
src/claude/  →  scripts/setup.js  →  .claude/  (Claude 런타임)
src/claude/  →  /kit-sync         →  src/codex/  (소스만, 런타임 도달 안함)
```

### 제안

```
src/claude/  →  scripts/setup.js          →  .claude/
src/claude/  →  /kit-sync                 →  src/codex/
src/{claude,codex}/  →  pnpm build:plugin  →  plugins/claude-kit/
plugins/claude-kit/  →  /kit-deploy-codex  →  ~/.codex/plugins/cache/local-kit/claude-kit/<ver>
~/.codex/config.toml  ←  검증  ←  /kit-audit C12
```

## 5. 플랫폼별 경로 해석

| 플랫폼 | config.toml 경로 | cache 루트 |
|--------|----------------|-----------|
| Windows | `%USERPROFILE%\.codex\config.toml` | `%USERPROFILE%\.codex\plugins\cache\` |
| macOS | `~/.codex/config.toml` | `~/.codex/plugins/cache/` |
| Linux | `~/.codex/config.toml` | `~/.codex/plugins/cache/` |
| 오버라이드 | `CODEX_HOME` 환경변수 | `$CODEX_HOME/plugins/cache/` |

Node.js 구현: `os.homedir()` 기반, `process.env.CODEX_HOME` 우선 적용.

## 6. 아카이브 문서와의 관계

| 아카이브 컴포넌트 | 본 패키지 반영 여부 |
|-----------------|------------------|
| `src/shared/manuals/` | 보류 — 배포 파이프라인 확립 후 재검토 |
| `.codex/agents/*.toml` | 보류 — 본 패키지 `plugins/claude-kit/agents/`가 우선 |
| 5-tier 전략 (`shared-direct`) | 제외 — 현행 4-tier 유지 |
| kit-sync Phase 1.5 | 제외 — Phase 7(deploy) 신설이 우선 |
| `/kit-audit C11` (shared-integrity) | 제외 — `C12` (plugin-deploy-integrity) 우선 |
| ABC 분류 (149 파일) | 참조만 — 본 패키지와 직접 무관 |

## 7. 연결 문서

- 문제 분해 → `02-problem-analysis.md`
- 구체 제안 → `04-proposal.md`
- 실행 TASK → `05-tasks/T-PLUGIN-NN.md`
