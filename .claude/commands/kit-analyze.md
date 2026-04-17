---
allowed-tools: Read, Grep, Glob
description: Claude 자산의 Codex 전환 준비 상태를 분석합니다.
argument-hint: '[--domain <domain>] [--type <type>] [--verbose] [--include-paired]'
---

# /kit-analyze

`src/claude/` 자산을 스캔하여 Codex 전환 준비 상태(auto/review/skip)를 분석한다.

> 참조: `.claude/skills/kit-converter/SKILL.md`

## Usage

```bash
/kit-analyze                    # 전체 분석
/kit-analyze --domain dev       # dev 도메인만
/kit-analyze --type agent       # 에이전트만
/kit-analyze --verbose          # 컴포넌트별 상세
/kit-analyze --include-paired --verbose  # paired 자산 drift 상세
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`, `rule`) | 전체 |
| `--verbose` | 컴포넌트별 상세 출력 | 꺼짐 |
| `--include-paired` | paired 자산의 content drift 상세 출력 | 꺼짐 |

## Workflow

### Phase 1: 인벤토리 구축

1. `src/claude/{core,dev,plan}/`을 스캔하여 전체 컴포넌트를 수집한다.
2. `src/codex/{core,dev,plan}/`을 스캔하여 이미 전환된 자산을 확인한다.
3. `src/pairing-registry.json`을 로드하여 기존 페어링 상태를 확인한다.

### Phase 2: 컴포넌트별 분석

4. 각 Claude 컴포넌트에 대해 다음을 결정한다:
   - `identity`: full_name (예: `dev-architect`)
   - `type`: skill / agent / command / hook / rule
   - `domain`: core / dev / plan
   - `codexMapping`: 대응 Codex 타입
   - `strategy`: paired-direct / paired-fallback / paired-review / blocked (codex-sync Phase 4 4-tier)
   - `evidenceLevel`: 공식 지원 / 우회 가능 / 추정 / 검증 필요 (`src/claude/_meta/codex-portability.json` 참조)
   - `difficulty`: auto / review / skip (legacy 호환, 4-tier에 매핑)

### Phase 2.5: paired 자산 drift 검사

4-1. `--include-paired` 또는 기본 실행 시, `status: paired` 자산에 대해 content drift를 검사한다:
   - Claude source와 Codex source를 읽어 도메인 키워드(`copy`, `scenario`, `Feature 유형`, `시나리오`, `/copy-`, `copy-reference`, `routing-metadata`, `갭 분석`) 비대칭을 확인
   - Claude에 N>0 출현하는 키워드가 Codex에 0회 → `content-drift`
   - git log 날짜 차이 > 7일 (기존 C10 기준) → `time-drift`
   - 그 외 → `synced`
   - 결과를 `driftStatus` 필드로 기록 (기본 실행에서는 요약 카운트만 출력, `--include-paired --verbose`에서 상세)

### Phase 3: 난이도 휴리스틱 (4-tier 매핑 포함)

5. 타입별 분류 규칙:
   - **agent**: YAML frontmatter `tools`에 `Write`/`Edit` 포함 → `paired-direct (review)`, 아니면 `paired-direct (auto)`
   - **command**: frontmatter 존재 + 3개 이상 Phase/Step → `paired-direct (review)`, 아니면 `paired-direct (auto)`
   - **skill**: 항상 `paired-direct (auto)`
   - **hook**: `src/claude/_meta/codex-portability.json` 또는 `scripts/codex-hook-compat.js HOOK_PORTABILITY` 조회. 등록되지 않은 경우 default `paired-direct (auto)`
   - **rule**: 항상 `paired-fallback` (artifact: `src/templates/AGENTS.md.template` inline merge, EX-003~008)

### Phase 4: 리포트 출력 (4-tier)

6. 요약 + 상세 리포트를 출력한다:

```
[kit-analyze] Codex 전환 준비 분석

  === 요약 ===
  전체: N 컴포넌트
  paired-direct:    X (N%) — auto + review
  paired-fallback:  Y (N%) — artifact 생성 후 resolved
  paired-review:    Z (N%) — 사람 검토 필요
  blocked:          W (N%) — artifact 생성 불가 (현재 0건)

  === 타입별 (4-tier) ===
  | 타입    | 전체 | paired-direct | paired-fallback | paired-review | blocked |
  |---------|------|---------------|-----------------|---------------|---------|
  | skill   | 25   | 25            | 0               | 0             | 0       |
  | agent   | 12   | 12 (6 review) | 0               | 0             | 0       |
  | command | 31   | 31 (~16 review) | 0             | 0             | 0       |
  | hook    | 9    | 8             | 1 (skill artifact) | 0          | 0       |
  | rule    | 6    | 0             | 6 (AGENTS.md merge) | 0         | 0       |

  === Evidence 분포 ===
  | evidenceLevel | 개수 |
  |---------------|------|
  | 공식 지원      | X   |
  | 우회 가능      | Y   |
  | 추정          | Z   |
  | 검증 필요      | W   |

  === 상세 (--verbose, 4-tier) ===
  | Identity         | Type   | Domain | Strategy        | Evidence    | OfficialSurface | Fallback Target | 비고 |
  |------------------|--------|--------|-----------------|-------------|-----------------|-----------------|------|
  | dev-architect    | agent  | dev    | paired-direct   | 공식 지원    | subagents       | —               | RO   |
  | plan-prd-writer  | agent  | plan   | paired-direct   | 공식 지원    | subagents       | —               | WR (review) |
  | output-secret-filter | hook | core | paired-direct   | 검증 필요    | hooks           | —               | EX-002 |
  | session-wrap-suggest | hook | core | paired-fallback | 검증 필요    | hooks.stop      | skill           | EX-001, artifact 생성됨 |
  | coding-style     | rule   | core   | paired-fallback | 우회 가능    | agents_md       | agents-guidance | EX-003, AGENTS.md merge |
  ...
```

  === 드리프트 감지 (paired 자산) ===
  content-drift: X개 — Claude에 Codex에 없는 도메인 참조 발견
  time-drift:    Y개 — 7일+ 수정 시간 차이
  synced:        Z개

  === 드리프트 상세 (--verbose --include-paired) ===
  | Identity      | Type    | DriftType     | Missing in Codex            |
  |---------------|---------|---------------|-----------------------------|
  | plan-draft    | command | content-drift | copy, scenario, Feature유형  |
  | dev-feature   | command | content-drift | copy, routing-metadata       |
  ...
```

> Note (codex-sync Phase 4): 4-tier 컬럼이 정식 출력 형식이다. legacy `auto/review/skip` 컬럼은 `paired-direct (auto)`, `paired-direct (review)`, `paired-fallback`/`blocked`로 매핑하여 호환성 유지.

## Rules

- 읽기 전용. 파일을 수정하지 않는다.
- `_archive/` 디렉토리는 스캔에서 제외한다.
- 이미 `paired`/`codex-skip` 상태인 자산은 "이미 처리됨"으로 표시하되, drift 요약은 항상 출력한다.
- `--include-paired --verbose` 시 drift 상세 테이블(Identity, DriftType, Missing in Codex)을 출력한다.
- drift 감지 시 해결 방법 안내: `/kit-sync --resync --name {identity}`
