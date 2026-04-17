# Phase 0: Target-Separated Source Migration 구현 계획

> `src/{domain}/` → `src/claude/{domain}/` + `src/codex/{domain}/` 마이그레이션 상세 계획

## Context

`docs/codex-compatibility/` 문서가 확정한 **target-separated authoring** 모델을 실제 소스에 반영한다. 현재 `src/{domain}/` 구조를 `src/claude/{domain}/` + `src/codex/{domain}/`으로 분리하여, 후속 Phase 1(메타 툴링)과 Phase 4(Codex 통합)의 구조적 기반을 마련한다.

**현재**: `src/core/`, `src/dev/`, `src/plan/`, `src/templates/`
**목표**: `src/claude/{core,dev,plan}/`, `src/codex/{core,dev,plan}/`, `src/templates/`

---

## Step 0: 사전 준비

현재 워킹 트리에 미커밋 변경이 있으므로 먼저 정리한다.

```bash
git add -A && git commit -m "chore: Phase 0 소스 마이그레이션 전 작업 스냅샷"
git checkout -b phase0/target-separated-source
```

---

## Step 1: 디렉토리 구조 변경 (Commit 1)

### 작업

```bash
# 1a. claude 타깃 디렉토리 생성 + 도메인 이동
mkdir -p src/claude
git mv src/core src/claude/core
git mv src/dev src/claude/dev
git mv src/plan src/claude/plan

# 1b. codex 타깃 빈 디렉토리 생성
mkdir -p src/codex/core src/codex/dev src/codex/plan
touch src/codex/core/.gitkeep src/codex/dev/.gitkeep src/codex/plan/.gitkeep

# 1c. src/templates/ 는 이동 없음 (공유 인프라)
```

### 결과 구조

```
src/
  claude/
    core/   (hooks/, rules/, skills/)
    dev/    (agents/, commands/, hooks/, skills/)
    plan/   (agents/, commands/, hooks/, skills/)
  codex/
    core/   (.gitkeep)
    dev/    (.gitkeep)
    plan/   (.gitkeep)
  templates/  (변경 없음)
```

### 커밋

```
git add -A
git commit -m "refactor: src/{domain}/ → src/claude/{domain}/ 타깃 분리 구조 마이그레이션"
```

---

## Step 2: scripts/setup.js 수정 (Commit 2)

**파일**: `scripts/setup.js`

### 핵심 변경: SRC_DIR → 4개 상수 분리

```javascript
// Before (line 30):
const SRC_DIR = path.resolve(__dirname, '..', 'src');

// After:
const SRC_BASE   = path.resolve(__dirname, '..', 'src');
const SRC_CLAUDE = path.join(SRC_BASE, 'claude');
const SRC_CODEX  = path.join(SRC_BASE, 'codex');
const TEMPLATES  = path.join(SRC_BASE, 'templates');
```

### 변경 내역 (9줄)

| 줄 | 함수 | 변경 |
|----|------|------|
| 6-7 | 헤더 주석 | + `v2.2: target-separated source` |
| 30 | 상수 | `SRC_DIR` → `SRC_BASE` + `SRC_CLAUDE` + `SRC_CODEX` + `TEMPLATES` |
| 244 | `collectDomainComponents` | `SRC_DIR` → `SRC_CLAUDE` |
| 282 | `emitClaude` | `SRC_DIR` → `SRC_CLAUDE` |
| 316 | `processClaudeTemplates` | `path.join(SRC_DIR, 'templates')` → `TEMPLATES` |
| 496 | `emitCodex` 템플릿 | `path.join(SRC_DIR, 'templates')` → `TEMPLATES` |
| 510 | `emitCodex` 도메인 루프 | `SRC_DIR` → `SRC_CLAUDE` |
| 540, 550 | `emitCodex` 훅 복사 | `SRC_DIR` → `SRC_CLAUDE` |
| 608 | `collectHookFiles` | `SRC_DIR` → `SRC_CLAUDE` |

### 설계 결정

- **Line 316/496 (최고 위험)**: 템플릿은 `src/templates/`에 남으므로 `TEMPLATES` 상수를 사용해야 함. `SRC_CLAUDE`를 사용하면 `src/claude/templates/`를 찾으려 해서 실패함.
- **Codex emitter (Line 510)**: Phase 0에서는 `SRC_CLAUDE`를 읽음 (`src/codex/`가 비어 있으므로). Phase 4에서 `SRC_CODEX`로 전환.
- **나머지 줄**: `SRC_DIR` → `SRC_CLAUDE` 단순 치환. 로직 변경 없음.

### 커밋

```
git add scripts/setup.js
git commit -m "refactor(setup): SRC_DIR를 SRC_CLAUDE + SRC_CODEX + TEMPLATES로 분리"
```

---

## Step 3: 문서 경로 업데이트 (Commit 3)

10개 파일, ~60개 경로를 `src/{domain}/` → `src/claude/{domain}/`으로 변경한다.

### 대상 파일

| # | 파일 | 변경 수 |
|---|------|---------|
| 1 | `docs/guide/09-architecture.md` | ~8 |
| 2 | `docs/guide/10-glossary.md` | 1 |
| 3 | `docs/guide/03-screening.md` | 3 |
| 4 | `docs/agent-design/00-agent-architecture.md` | ~21 |
| 5 | `docs/codex-compatibility/00-overview.md` | 1 |
| 6 | `docs/codex-compatibility/02-current-state-gap-analysis.md` | ~4 |
| 7 | `docs/review/dev-architecture-gate/01-change-map.md` | ~9 |
| 8 | `docs/review/dev-architecture-gate/03-review-report.md` | ~4 |
| 9 | `docs/notion-intake-screening/04-implementation-sequence.md` | ~9 |
| 10 | `docs/meta-tooling/02-commands-spec.md` | 1 |

### 치환 패턴

```
src/core/  → src/claude/core/
src/dev/   → src/claude/dev/
src/plan/  → src/claude/plan/
```

### 변경하지 않는 파일

| 파일/디렉토리 | 이유 |
|---------------|------|
| `docs/codex-compatibility/_archive/**` | 아카이브, 역사적 기록 유지 |
| `docs/meta-tooling/01-scaffolding-templates.md` | 이미 `src/claude/` 경로 |
| `docs/meta-tooling/03-validation-schemas.md` | 이미 `src/claude/` 경로 |
| `docs/meta-tooling/04-agent-and-hook.md` | 이미 듀얼 경로 대응 |
| `docs/meta-tooling/05-implementation-roadmap.md` | 이미 Phase 0 설명 포함 |
| `src/templates/*.template` | src/ 경로 참조 없음 |
| `scripts/merge-settings.js` | 경로 무관 (순수 데이터 유틸리티) |
| `scripts/codex-hook-compat.js` | 경로 무관 (파일명 기반 필터링) |

### 09-architecture.md 상세 (가장 중요한 문서)

**Line 9** (도메인 분리 설명):
```
Before: 소스는 도메인별 디렉토리(`src/{domain}/`)로 분리되어 있지만
After:  소스는 타깃별·도메인별 디렉토리(`src/claude/{domain}/`)로 분리되어 있지만
```

**Lines 44-56** (플래트닝 예시):
```
Before:
  src/core/hooks/edit-tracker.js      -> .claude/hooks/edit-tracker.js
  src/dev/commands/dev-commit.md      -> .claude/commands/dev-commit.md

After:
  src/claude/core/hooks/edit-tracker.js   -> .claude/hooks/edit-tracker.js
  src/claude/dev/commands/dev-commit.md   -> .claude/commands/dev-commit.md
```

**Line 244** (3-stage Source 설명):
```
Before: `src/core/`, `src/dev/`, `src/plan/`와 `templates/` 수집
After:  `src/claude/{core,dev,plan}/`과 `src/templates/` 수집
```

### 커밋

```
git add docs/
git commit -m "docs: 타깃 분리 마이그레이션 후 src/ 경로를 src/claude/로 갱신"
```

---

## Step 4: 검증

| # | 검증 항목 | 방법 | 예상 결과 |
|---|----------|------|-----------|
| 4a | setup.js 스모크 테스트 | 임시 프로젝트에서 `npm install` | `.claude/` 전체 구조 생성 |
| 4b | **템플릿 해석** (최고 위험) | CLAUDE.md, settings.json 존재 확인 | 존재 |
| 4c | Codex 에미터 | `targets: ["claude", "codex"]` 설정 후 재설치 | `plugins/claude-kit/` 구조 생성 |
| 4d | 깨진 경로 스캔 | `grep -rn 'src/(core\|dev\|plan)/' docs/ --include='*.md'` 에서 `_archive/`, `src/claude/` 제외 | 0건 |
| 4e | 카운트 동일성 | 마이그레이션 전후 컴포넌트 수 비교 | 동일 |

---

## 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| **템플릿 경로 깨짐** | HIGH | Line 316/496이 `TEMPLATES`를 사용하는지 반드시 확인. 검증 4b로 포착 |
| `git mv` 히스토리 유실 | LOW | `git log --follow`로 추적 가능 |
| Codex emitter가 빈 src/codex/ 읽음 | MEDIUM | Phase 0에서는 의도적으로 `SRC_CLAUDE`를 사용. Phase 4에서 전환 |
| 아카이브 문서 실수 수정 | LOW | 명시적 제외 목록. 검증 4d에서 필터링 |

---

## 전체 수정 대상 요약

| 카테고리 | 파일 수 | 내용 |
|----------|---------|------|
| 코드 | 1 | `scripts/setup.js` (9줄 변경) |
| 디렉토리 | 7 | 이동 3건 + 생성 3건 + .gitkeep 3건 |
| 문서 | 10 | ~60개 경로 참조 치환 |
| **합계** | **18** | 3 커밋 |
