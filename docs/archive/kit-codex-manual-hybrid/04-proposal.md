# 04. Proposal — 개선 및 신규 제안

> **결론**: 문제(PB-1~9)에 대해 **수정(2건)**과 **신규(3건)**로 대응한다. 핵심은 ① `plugins/claude-kit/` 번들 구조 도입 ② `/kit-deploy-codex` 커맨드 + `scripts/deploy-codex-cache.js` 스크립트로 guide의 수동 8단계를 1커맨드로 ③ `/kit-audit C12`로 배포 무결성 검증 내재화. BC(Breaking Change)는 없으며(신규 기능만 추가), 기존 `/kit-sync`·`setup.js`는 opt-in 확장만 수행한다.

---

## 1. 제안 요약

| # | 제안 | 유형 | 대응 문제 | 우선순위 |
|---|-----|------|---------|--------|
| **P-1** | `plugins/claude-kit/` 번들 구조 도입 | 🆕 신규 | PB-3, PB-1 | P0 |
| **P-2** | `/kit-deploy-codex` + `scripts/deploy-codex-cache.js` | 🆕 신규 | PB-2, PB-4, PB-5, PB-7 | P0 |
| **P-3** | `/kit-audit C12 (plugin-deploy-integrity)` 카테고리 추가 | 🆕 신규 | PB-4, PB-5, PB-6 | P0 |
| **P-4** | `/kit-validate` + `schema-plugin-manifest.md` 확장 | 🔧 수정 | PB-3 보조 | P1 |
| **P-5** | `scripts/setup.js` + `scripts/codex-hook-compat.js` 확장 | 🔧 수정 | PB-2 보조, PB-9 미래 전환 | P1 |

---

## 2. P-1: `plugins/claude-kit/` 번들 구조

### 2.1 목표

guide §핵심 경로(17-21)에서 전제하는 **배포 가능한 플러그인 루트**를 claude-kit 소스 트리에 정식 도입.

### 2.2 구조

```
plugins/
└── claude-kit/
    ├── .codex-plugin/
    │   └── plugin.json         ← 소스 (커밋 대상)
    ├── skills/                 ← 빌드 산출물
    ├── commands/               ← 빌드 산출물
    ├── agents/                 ← 빌드 산출물
    ├── hooks.json              ← 빌드 산출물
    └── README.md               ← 소스 (커밋 대상)
```

### 2.3 `.codex-plugin/plugin.json` 스키마 (초안)

```json
{
  "$schema": "codex-plugin.v1",
  "name": "claude-kit",
  "version": "2.3.0",
  "description": "AI governance toolkit for Claude + Codex",
  "interface": {
    "category": "governance"
  },
  "entry": {
    "skills": "skills/",
    "commands": "commands/",
    "agents": "agents/",
    "hooks": "hooks.json"
  }
}
```

**참고**: `interface.category` 값은 Codex 공식 스냅샷 기준. 추가 필드가 필요하면 TASK T-PLUGIN-02에서 검증.

### 2.4 빌드 로직 (개요)

```
buildPluginBundle(targetDir = 'plugins/claude-kit'):
  1. Clean targetDir (except .codex-plugin/, README.md)
  2. Copy src/codex/*/skills/* → targetDir/skills/
  3. Copy src/codex/*/commands/* → targetDir/commands/
  4. Copy src/codex/*/agents/* → targetDir/agents/
  5. Generate targetDir/hooks.json (from codex-hook-compat.js)
  6. Update targetDir/.codex-plugin/plugin.json version from package.json
```

### 2.5 BC 영향

없음. 신규 디렉터리만 추가.

---

## 3. P-2: `/kit-deploy-codex` + `scripts/deploy-codex-cache.js`

### 3.1 목표

guide §업데이트 절차(40-53)의 8단계를 **1 커맨드**로 자동화.

### 3.2 커맨드 인터페이스

```
/kit-deploy-codex [flags]

Flags:
  --dry-run           # 실제 복사 없이 계획만 출력
  --version <ver>     # 특정 버전 강제 (기본: plugin.json의 version)
  --source <name>     # source namespace (기본: local-kit)
  --rollback          # 이전 버전으로 복원
  --target-home <dir> # ~/.codex 대신 다른 경로 지정 (CODEX_HOME과 동등)
  --force             # 같은 버전 디렉터리 덮어쓰기 (기본: 차단)
  --skip-backup       # 백업 생성 생략 (비권장)
  --skip-audit        # 배포 후 C12 감사 생략 (비권장)
```

### 3.3 스크립트 단계

```
deploy-codex-cache.js:
  1. [PRECHECK] plugin.json 존재 + SemVer 파싱
  2. [PRECHECK] config.toml 엔트리 유효성 확인
  3. [BACKUP]   기존 캐시를 ~/.codex/tmp/plugin-cache-backups/YYYY-MM-DD_HHMMSS/ 로 복사
  4. [PREPARE]  target = ~/.codex/plugins/cache/<source>/claude-kit/<version>/
               존재 시: --force 없으면 차단
  5. [COPY]     plugins/claude-kit/ → target/
  6. [VERIFY]   target/.codex-plugin/plugin.json version 검증
  7. [TOML]     config.toml에 [plugins."claude-kit@<source>"] enabled=true 보장
  8. [AUDIT]    /kit-audit C12 실행 (--skip-audit 없으면)
  9. [REPORT]   사용자 재시작 안내 + 다음 행동 링크
```

### 3.4 롤백 로직

```
--rollback:
  1. config.toml 엔트리 유효성 확인
  2. ~/.codex/plugins/cache/<source>/claude-kit/ 하위 버전 디렉터리 목록
  3. 현재 활성 버전 대비 **직전 버전** 식별 (SemVer 정렬)
  4. 현재 버전 디렉터리 이름 변경 (.rolled-back 접미사)
  5. AUDIT 실행
  6. 재시작 안내
```

### 3.5 BC 영향

없음.

---

## 4. P-3: `/kit-audit C12 (plugin-deploy-integrity)`

### 4.1 검증 항목

| 검증 ID | 대상 | 방법 | 실패 수준 |
|--------|------|------|---------|
| C12-1 | `plugins/claude-kit/.codex-plugin/plugin.json` 존재 + SemVer | 파일 + 정규식 | FAIL |
| C12-2 | `config.toml` 엔트리 `[plugins."claude-kit@<source>"] enabled=true` | toml 파싱 | FAIL |
| C12-3 | `~/.codex/plugins/cache/<source>/claude-kit/<version>/` 존재 | fs.stat | FAIL |
| C12-4 | 캐시 plugin.json version === repo plugin.json version | JSON 비교 | FAIL |
| C12-5 | 캐시 하위 `skills/`, `commands/`, `agents/`, `hooks.json` 존재 | fs.stat | WARN or FAIL |
| C12-6 | 백업 디렉터리 존재 | fs.stat | WARN |
| C12-7 | 사용 중단된 source (`turner-copy` 등) 잔존 감지 | config.toml 스캔 | WARN |

### 4.2 자동 수정 (--fix)

- C12-6 디렉터리 자동 생성
- C12-7 사용 중단 source 경고 출력 (삭제는 수동)
- 나머지는 **자동 수정 비대상** (휴먼 판단 필요)

### 4.3 BC 영향

없음. 신규 카테고리.

---

## 5. P-4: `/kit-validate` + `schema-plugin-manifest.md` 확장

### 5.1 신규 스키마

- 파일: `src/claude/core/skills/kit-validation/references/schema-plugin-manifest.md`
- 대상: `plugins/claude-kit/.codex-plugin/plugin.json`

### 5.2 검증 항목

- `$schema` 필드 존재 (optional)
- `name` === `claude-kit`
- `version` SemVer 유효
- `interface.category` 공식 enum 내
- `entry.skills`, `entry.commands`, `entry.agents`, `entry.hooks` 경로 유효

### 5.3 커맨드 확장

- `/kit-validate --target plugin-bundle`

### 5.4 BC 영향

없음.

---

## 6. P-5: `scripts/setup.js` + `scripts/codex-hook-compat.js` 확장

### 6.1 `scripts/setup.js`

- `buildPluginBundle()` 함수 신규
- postinstall에서 `CLAUDE_KIT_BUILD_PLUGIN=1` 환경변수 시 호출
- 기본값은 비활성 (다운스트림 영향 없음)

### 6.2 `scripts/codex-hook-compat.js`

- 현재 `src/codex/...hooks.json` 경로로 출력
- 파라미터화: `--output <path>` 지원 → `plugins/claude-kit/hooks.json`에도 출력 가능

### 6.3 BC 영향

없음. 기존 동작은 기본값으로 유지, 신규는 opt-in.

---

## 7. 수정 vs 신규 판단 근거

| 제안 | 왜 신규/수정인가 |
|------|-----------------|
| P-1 (번들 구조) | 기존 `src/codex/`는 "Codex용 소스"이지 "배포 번들"이 아님. 의미가 다르므로 **신규 디렉터리 권장** (기존 src/codex/ 구조 유지) |
| P-2 (deploy 커맨드) | `/kit-sync`는 소스 변환이 목적. 배포는 의미·타이밍·실패 모드 모두 별개 → **독립 커맨드** |
| P-3 (C12 감사) | `/kit-audit`는 카테고리 확장형 설계 — 기존 C1~C11 기반, C12 자연스러운 확장 |
| P-4 (스키마) | `/kit-validate`는 스키마 기반 검증 — 신규 스키마 추가 = 기존 확장 패턴 |
| P-5 (setup.js) | `setup.js`는 이미 postinstall 분기 구조. 신규 함수 추가가 최소 침습 |

---

## 8. 리스크 및 완화

| ID | 리스크 | 완화 |
|----|-------|------|
| R-P1 | `.codex-plugin/plugin.json` 스키마가 향후 변경 | TASK T-PLUGIN-02에서 공식 snapshot + 재검증 주기 지정 |
| R-P2 | Windows UAC로 인해 `~/.codex/` 쓰기 실패 | 에러 메시지에 수동 디렉터리 생성 안내 + `--target-home` 옵션 |
| R-P3 | config.toml 직접 편집 시 사용자 커스텀 엔트리 손실 | toml 파서로 기존 엔트리 보존 + 추가만 수행, 백업 기본값 ON |
| R-P4 | `buildPluginBundle()` 빌드 시간 증가 | 기본 비활성(opt-in), CI에서만 ON |
| R-P5 | 레거시 `turner-copy` 잔존 사이트 오인식 | C12-7에서 경고 출력, 삭제는 수동 |

## 9. 다음 단계

- 원자 실행 단위 → `05-tasks/T-PLUGIN-NN.md`
- 각 제안은 1~3개의 TASK로 분할
- TASK 완료 시 `01-overview.md` AC-1~AC-8 대응

## 10. Breaking Change 결론

**없음**. 본 패키지의 모든 변경은:
- 신규 디렉터리/파일 추가
- 기존 커맨드의 `--flag` 신규 추가 (기본 동작 불변)
- `/kit-audit` 카테고리 신규 추가 (기존 카테고리 영향 없음)
- postinstall 신규 로직은 환경변수 opt-in

따라서 SemVer는 **minor release**(`v2.3.1` 또는 `v2.4.0`)로 충분.
