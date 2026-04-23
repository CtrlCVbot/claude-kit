# 01. Overview — Codex Plugin Source 배포 파이프라인

> **결론**: Codex 앱에서 repo-local marketplace와 personal marketplace가 **안정적으로 노출되지 않는다**는 `codex-plugin-source-guide.md`의 경험적 발견이, claude-kit의 전제를 뒤집었다. 이전 기획(`_archive/2026-04-22/kit-codex-manual-hybrid`)은 "Codex 공식 플러그인 surface에 소스 구조를 맞추자"였으나, 현실은 **공식 surface가 런타임에서 동작하지 않음**. 따라서 실운영 SSOT는 repo의 `plugins/claude-kit`이고 Codex 런타임 주입은 **수동 캐시 복사 기반**(`~/.codex/plugins/cache/local-kit/claude-kit/<version>`)이다. 본 패키지는 이 **캐시 기반 배포 파이프라인**을 claude-kit 자체 기능으로 내재화하는 계획을 제시한다.

**패키지 위치**: `docs/plan/kit-codex-manual-hybrid/` (루트 재사용, 기존은 `_archive/2026-04-22/`)
**생성일**: 2026-04-22
**입력**: `C:\Program Files (user)\build-frame\docs\claude-kit\codex-plugin-source-guide.md`
**아카이브**: `_archive/2026-04-22/` (이전 "manual-first hybrid" 기획 일체)

---

## 1. 패러다임 전환 요약

| 차원 | 이전 기획 (archived) | 새 기획 |
|------|---------------------|--------|
| 중심 질문 | Claude/Codex 자산 중복을 어떻게 줄일까? | Codex 런타임에 어떻게 실제로 배포할까? |
| SSOT 위치 | `src/shared/manuals/` (이상적) | `plugins/claude-kit/` (현실 운영) |
| 배포 경로 | `setup.js` 자동 emit | **수동 캐시 복사** 8단계 (guide §업데이트 절차) |
| 공식 surface 신뢰도 | 공식 문서대로 동작한다고 가정 | 공식 marketplace = **불안정**, 캐시 source만 실사용 가능 |
| 핵심 공백 | `kit-sync` 파이프라인 내 공유 매니페스트 인지 | **배포 파이프라인 자체의 부재** |
| Breaking Change | `src/codex/` A+B 제거 | 신규 `plugins/claude-kit/` 도입 + 배포 커맨드 |

**아카이브 문서(`_archive/2026-04-22/`)의 위상**: 소스 구조 재설계는 유효한 장기 방향이지만, **배포 파이프라인이 먼저 확립되지 않으면 무의미**하다. 본 패키지 완료 후 재검토하며, 일부 TASK(shared manifest, `.codex/agents/*.toml`)는 본 패키지에 통합되거나 후속 단계로 이관된다.

## 2. 배경 — guide 문서의 핵심 발견

`codex-plugin-source-guide.md`가 제시하는 사실:

1. **repo marketplace + personal marketplace 노출 실패** (guide:11, 82)
   - 공식 문서상 가능하나 현재 앱 환경에서 플러그인 리스트 노출이 재현되지 않음
2. **실사용 경로는 캐시 source만** (guide:12-13)
   - `~/.codex/config.toml`에 `[plugins."claude-kit@local-kit"]` 엔트리 활성화
   - `~/.codex/plugins/cache/local-kit/claude-kit/<version>` 디렉터리에 repo 내용 전체 복사
3. **업데이트는 수동 8단계** (guide:40-53)
   - 버전 확인 → 백업 → 새 버전 디렉터리 → 전체 복사 → config 확인 → 앱 재시작
4. **운영 원칙**: 덮어쓰기 지양, 새 버전 디렉터리 우선, 백업 필수 (guide:62-68)
5. **롤백 절차 정의됨** (guide:70-78)

## 3. 현재 claude-kit의 공백

### 3.1 플러그인 디렉터리 구조 부재

현재 `mologado/claude-kit`에는 `plugins/claude-kit/` 디렉터리가 **존재하지 않음** (확인: 2026-04-22).

guide가 전제하는 `plugins/claude-kit/.codex-plugin/plugin.json` + `skills/` + `commands/` + `agents/` + `hooks.json` 구조가 빠져 있다. 즉 **배포 가능한 플러그인 번들**이 현재 소스 트리에 없다.

### 3.2 배포 자동화 부재

- `/kit-sync`는 `src/claude` ↔ `src/codex` 변환까지만 수행
- `~/.codex/plugins/cache/local-kit/claude-kit/<version>` 경로로의 실제 배포 단계가 **커맨드/스크립트로 존재하지 않음**
- `scripts/setup.js`는 node_modules 설치 시 `.claude/` 배포만 처리

### 3.3 버전 관리 + 롤백 자동화 부재

guide의 "새 버전 디렉터리 + 백업 + 롤백" 원칙을 claude-kit 내부에서 강제할 메커니즘 없음.

### 3.4 검증 부재

- `config.toml`의 엔트리 존재·enabled 상태 자동 확인 없음
- 캐시 디렉터리의 `.codex-plugin/plugin.json` 버전 일치 확인 없음
- 배포 후 무결성 검증(`skills/`, `commands/`, `agents/`, `hooks.json` 존재) 없음

## 4. 목표

1. **배포 가능한 플러그인 번들 구조 확립** — `plugins/claude-kit/.codex-plugin/plugin.json` + 자산 번들
2. **배포 자동화 커맨드 제공** — `/kit-deploy-codex` 또는 `scripts/deploy-codex-cache.js`로 수동 8단계를 1-커맨드로
3. **버전 + 백업 + 롤백 내재화** — guide §운영 원칙을 코드로
4. **검증 카테고리 신설** — `/kit-audit C12 (plugin-deploy-integrity)`
5. **문서화** — 다운스트림 프로젝트(build-frame, mologado 등)가 참조할 배포 가이드

## 5. 범위

### In-Scope

- `plugins/claude-kit/` 디렉터리 + `.codex-plugin/plugin.json` 스캐폴드
- 플러그인 번들 빌드 스크립트 (`src/` → `plugins/claude-kit/`)
- 신규 커맨드 `/kit-deploy-codex` + Node 스크립트 `scripts/deploy-codex-cache.js`
- 캐시 관리 유틸 (백업, 버전 디렉터리, 롤백)
- `/kit-audit C12` 신규 카테고리
- 플랫폼별 경로 해석 (Windows, macOS, Linux)
- 문서: `docs/codex-deployment.md`

### Out-of-Scope

- Codex 앱의 marketplace discovery 문제 자체 해결(업스트림 이슈, claude-kit 범위 밖)
- 기존 `src/claude` ↔ `src/codex` 변환 로직(현행 유지)
- 아카이브된 "manual-first hybrid" 소스 구조 재설계(본 패키지 완료 후 재검토)

## 6. 수용 기준 (Acceptance Criteria)

| ID | 기준 | 증거 |
|----|------|------|
| AC-1 | `plugins/claude-kit/.codex-plugin/plugin.json` 존재 + SemVer 버전 명시 | 파일 존재 + jq 파싱 성공 |
| AC-2 | `plugins/claude-kit/{skills,commands,agents}/` + `hooks.json` 생성 가능 | 빌드 스크립트 성공 |
| AC-3 | `/kit-deploy-codex` 커맨드로 guide 8단계가 1커맨드에 완료 | 드라이런 + 실제 실행 로그 |
| AC-4 | 버전 디렉터리 추가 방식(덮어쓰기 금지) 동작 | 기존 버전 보존 확인 |
| AC-5 | 백업 자동 생성 (`~/.codex/tmp/plugin-cache-backups/`) | 백업 파일 타임스탬프 |
| AC-6 | `/kit-deploy-codex --rollback` 동작 — guide §롤백 방법 자동화 | 롤백 후 이전 버전 활성 확인 |
| AC-7 | `/kit-audit C12` PASS — config.toml 엔트리 + 캐시 무결성 + 버전 매칭 | 감사 로그 |
| AC-8 | Windows + macOS + Linux 경로 모두 해석 | 플랫폼별 테스트 통과 |

## 7. 상위 리스크

| ID | 심각도 | 설명 | 완화 |
|----|--------|------|------|
| R-SRC-1 | HIGH | Codex 앱이 향후 marketplace discovery 안정화 → 캐시 기반 접근이 구식화 | guide §참고 이슈:84 재검토 트리거; 캐시 모드를 "현재 권장"으로 유지하되 분기 가능 구조 |
| R-SRC-2 | HIGH | 플러그인 번들 구조가 Codex 공식 스펙과 불일치 → 앱이 로드 실패 | `.codex-plugin/plugin.json` 스키마는 Codex 공식 문서 snapshot 기반, 변경 시 재검증 |
| R-SRC-3 | MEDIUM | `~/.codex/` 경로가 플랫폼·사용자별로 상이 → 배포 스크립트 실패 | `os.homedir()` + 환경변수 `CODEX_HOME` 오버라이드 지원 |
| R-SRC-4 | MEDIUM | 캐시 덮어쓰기로 기존 버전 손실 | 새 버전 디렉터리 생성 + 백업 필수 (guide §67-68), 스크립트가 덮어쓰기 차단 |
| R-SRC-5 | LOW | 아카이브된 `kit-codex-manual-hybrid` 의존 외부 참조 깨짐 | `_archive/` 유지 + 리다이렉트 안내 섹션 본 README |

## 8. 패키지 구조

| # | 파일 | 역할 |
|---|------|------|
| 01 | `01-overview.md` | **본 문서** — 진입점, 패러다임 전환 요약 |
| 02 | `02-problem-analysis.md` | guide 문서 문제점 분석 (P0/P1/P2) |
| 03 | `03-feature-impact.md` | 현재 claude-kit 기능 영향 분석 |
| 04 | `04-proposal.md` | 개선/신규 제안 (수정 vs 신규) + 근거·리스크 |
| 05 | `05-tasks/T-PLUGIN-NN.md` | 원자 실행 TASK |

## 9. 참조

- 입력 문서: `C:\Program Files (user)\build-frame\docs\claude-kit\codex-plugin-source-guide.md`
- 아카이브: `_archive/2026-04-22/` (이전 "manual-first hybrid" 기획)
- TASK ID 규칙: `.claude/rules/task-id-naming.md` (dev 도메인 `T-{AREA}-{NN}` 패턴 차용, AREA=PLUGIN)
- 관련 훅: `src/claude/core/hooks/` (배포 시 버전 검증 대상)
