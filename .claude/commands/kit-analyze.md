---
allowed-tools: Read, Grep, Glob
description: Claude 자산의 Codex 전환 준비 상태를 분석합니다.
argument-hint: '[--domain <domain>] [--type <type>] [--verbose]'
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
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`, `rule`) | 전체 |
| `--verbose` | 컴포넌트별 상세 출력 | 꺼짐 |

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
   - `difficulty`: auto / review / skip

### Phase 3: 난이도 휴리스틱

5. 타입별 분류 규칙:
   - **agent**: YAML frontmatter `tools`에 `Write`/`Edit` 포함 → `review`, 아니면 `auto`
   - **command**: frontmatter 존재 + 3개 이상 Phase/Step → `review`, 아니면 `auto`
   - **skill**: 항상 `auto`
   - **hook**: `kit-converter/references/skip-registry.md`에 등록 → `skip`, 아니면 `auto`
   - **rule**: 항상 `skip` (claude-origin shared)

### Phase 4: 리포트 출력

6. 요약 + 상세 리포트를 출력한다:

```
[kit-analyze] Codex 전환 준비 분석

  === 요약 ===
  전체: N 컴포넌트
  auto-convert:        X (N%)
  convert-with-review: Y (N%)
  skip:                Z (N%)

  === 타입별 ===
  | 타입    | 전체 | Auto | Review | Skip |
  |---------|------|------|--------|------|
  | skill   | 25   | 25   | 0      | 0    |
  | agent   | 12   | 6    | 6      | 0    |
  | command | 31   | ~15  | ~16    | 0    |
  | hook    | 9    | 7    | 0      | 2    |
  | rule    | 6    | 0    | 0      | 6    |

  === 상세 (--verbose) ===
  | Identity            | Type    | Domain | Difficulty | Codex 존재 | 비고     |
  |---------------------|---------|--------|------------|-----------|---------|
  | dev-architect       | agent   | dev    | auto       | No        | RO      |
  | plan-prd-writer     | agent   | plan   | review     | No        | WR      |
  ...
```

## Rules

- 읽기 전용. 파일을 수정하지 않는다.
- `_archive/` 디렉토리는 스캔에서 제외한다.
- 이미 `paired`/`codex-skip` 상태인 자산은 "이미 처리됨"으로 표시한다.
