# Codex Plugin Source 배포 파이프라인

> **패키지 목적**: `codex-plugin-source-guide.md`(build-frame)가 발견한 **Codex 플러그인 런타임 배포 경로 문제**를 claude-kit 자체 기능으로 내재화한다. guide의 수동 8단계를 `/kit-deploy-codex` 1커맨드로 축약하고, `/kit-audit C12`로 배포 무결성을 검증한다.

**패키지 생성일**: 2026-04-22
**상위 입력**: `C:\Program Files (user)\build-frame\docs\claude-kit\codex-plugin-source-guide.md`

---

## 읽는 순서

| # | 파일 | 내용 |
|---|------|------|
| 01 | [`01-overview.md`](01-overview.md) | 패러다임 전환 + 수용 기준 + 리스크 |
| 02 | [`02-problem-analysis.md`](02-problem-analysis.md) | guide 문제점 P0/P1/P2 분해 |
| 03 | [`03-feature-impact.md`](03-feature-impact.md) | 11개 기능 영향 + 신규 3 컴포넌트 삽입 지점 |
| 04 | [`04-proposal.md`](04-proposal.md) | 5건 제안(신규 3 + 수정 2), BC 없음 |
| 05 | [`05-tasks/`](05-tasks/) | T-PLUGIN-01 ~ T-PLUGIN-10 원자 TASK |

## 핵심 요약

### 새 문제 (guide 제기)

1. Codex 앱에서 repo marketplace + personal marketplace 플러그인 리스트 노출 실패
2. 실사용 경로 = 수동 캐시 복사 8단계
3. claude-kit 내부에 `plugins/claude-kit/` 번들 구조 **부재**

### 제안

1. `plugins/claude-kit/` 번들 + `.codex-plugin/plugin.json`
2. `/kit-deploy-codex` 커맨드 + `scripts/deploy-codex-cache.js`
3. `/kit-audit C12 (plugin-deploy-integrity)` 신규 카테고리
4. `schema-plugin-manifest.md` + `/kit-validate --target plugin-bundle`
5. 크로스 플랫폼 경로 유틸 + 백업/롤백 자동화

### 수용 기준

[`01-overview.md §6`](01-overview.md) AC-1 ~ AC-8 — 배포 1커맨드 + 버전 디렉터리 + 백업 + 롤백 + 감사 + 크로스 플랫폼.

### Breaking Change

**없음**. 모든 변경은 신규 추가 또는 opt-in 확장 → minor release(`v2.3.1` 또는 `v2.4.0`)로 충분.

---

## 아카이브

이전 기획 `kit-codex-manual-hybrid` (manual-first hybrid, 소스 구조 재설계)는 **`_archive/2026-04-22/`**에 보존.

| 아카이브 파일 | 본 패키지 반영 여부 |
|-----------|------------------|
| `src/shared/manuals/` 제안 | 보류 — 배포 파이프라인 확립 후 재검토 |
| `.codex/agents/*.toml` | 보류 — `plugins/claude-kit/agents/`가 우선 |
| 5-tier 전략(shared-direct) | 제외 — 현행 4-tier 유지 |
| ABC 분류(149 파일) | 참조만 |
| kit-sync Phase 1.5 | 제외 — Phase 7(deploy) 우선 |

상세는 [`01-overview.md §1`](01-overview.md) "패러다임 전환 요약" 참조.

## 참조

- guide 원본: `C:\Program Files (user)\build-frame\docs\claude-kit\codex-plugin-source-guide.md`
- TASK ID 규칙: `.claude/rules/task-id-naming.md` (AREA=PLUGIN)
- 관련 핵심 원칙: `.claude/rules/golden-principles.md` #5(작은 파일), #9(HARD-GATE), #10(증거 기반)
