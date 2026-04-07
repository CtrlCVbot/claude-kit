---
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git:*)
description: claude-kit 전체 컴포넌트의 일관성을 전수 감사합니다.
argument-hint: '[--category <cat>] [--fix] [--verbose]'
---

# /kit-audit

전체 컴포넌트를 대상으로 구조, 네이밍, 필드, 교차 참조 등 6개 카테고리 감사를 수행한다.

> 참조: `.claude/skills/kit-validation/SKILL.md`

## Usage

```bash
/kit-audit                    # 전체 감사
/kit-audit --category <cat>   # 카테고리별 (C1~C6)
/kit-audit --fix              # 자동 수정 가능 항목 처리
/kit-audit --verbose          # 상세 출력
```

## 파라미터

| 인자 | 설명 | 기본값 |
|------|------|--------|
| `--category` | 감사 카테고리 필터 (`C1`~`C7`) | 전체 |
| `--fix` | 자동 수정 가능 항목 처리 | 꺼짐 |
| `--verbose` | 상세 출력 | 꺼짐 |

## 감사 카테고리

### C1: 구조 규약 (필수)

- 디렉토리 구조가 `src/claude/{domain}/{category}/` 패턴 준수
- 스킬은 디렉토리 기반 (`SKILL.md`), 나머지는 파일 기반
- 훅 디렉토리에 `package.json` 존재

### C2: 네이밍 규약 (필수)

- 모든 이름이 kebab-case (`/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`)
- 도메인 접두사 일관성 (`{domain}-*`)
- 룰은 도메인 접두사 없음
- 파일 확장자: skills/agents/commands는 `.md`, hooks는 `.js`

### C3: 필드 완전성 (필수)

- `/kit-validate`와 동일한 검증을 전수 적용
- 필수 필드 누락, 형식 오류 탐지
- 에이전트 Read-Only 일관성 검증

### C4: 교차 참조 (필수)

- 커맨드가 참조하는 스킬이 실제 존재하는지
- 스킬이 참조하는 훅이 실제 존재하는지
- 에이전트가 참조하는 도구가 유효 도구 목록에 포함되는지

### C5: setup.js 정합성 (선택)

- `scripts/setup.js`의 `buildHooksConfig()`에 모든 훅이 등록되어 있는지
- 새 컴포넌트가 복사 대상에 포함되는지

### C6: 문서 정확성 (선택)

- README.md의 컴포넌트 카운트가 실제와 일치하는지
- `docs/guide/09-architecture.md`의 컴포넌트 목록이 최신인지

### C7: 페어링 일관성 (필수)

- `src/pairing-registry.json` 존재 여부
- 레지스트리에 있는 자산이 파일시스템에 실제 존재하는지 (FAIL)
- 파일시스템의 agent/command가 레지스트리에 등록되어 있는지 (WARN)
- `codex-skip` 상태인데 reason이 비어있는 항목 (FAIL)
- `paired` 상태인데 한쪽 파일만 존재하는 항목 (FAIL)

## Workflow

### Phase 1: 인벤토리 구축

1. `src/claude/` 전체를 스캔하여 컴포넌트 인벤토리를 구축한다.
2. 각 컴포넌트의 타입, 도메인, 이름, 경로를 기록한다.

### Phase 2: 카테고리별 감사

3. 선택된 카테고리(기본: C1~C4 필수)에 대해 순서대로 검증한다.
4. 각 검증 항목을 PASS / WARN / FAIL로 분류한다.

### Phase 3: 자동 수정 (--fix)

5. `--fix` 옵션이 있으면 안전한 항목만 자동 수정한다:

| 항목 | 자동 수정 내용 |
|------|---------------|
| package.json 누락 | `{"type": "commonjs"}` 생성 |
| README 카운트 불일치 | 실제 카운트로 갱신 |
| frontmatter name 불일치 | 디렉토리/파일명과 동기화 |

6. 자동 수정 후 해당 항목을 재검증한다.

### Phase 4: 결과 출력

7. 카테고리별 결과를 출력한다:

```
[kit-audit] 전수 감사 결과

  C1: 구조 규약
    [PASS] 모든 컴포넌트가 올바른 디렉토리 구조

  C2: 네이밍 규약
    [PASS] 전체 kebab-case 준수

  C3: 필드 완전성
    [PASS] N/N 컴포넌트 필수 필드 충족

  C4: 교차 참조
    [PASS] 모든 참조가 유효

  총계: N 카테고리 / X PASS / Y WARN / Z FAIL
  자동 수정 가능: N건 (--fix로 실행)
```

## Rules

- C1~C4는 필수 감사 카테고리이다. 항상 실행된다.
- C5~C6는 `--category C5` 또는 `--category C6`으로 명시적 요청 시에만 실행된다.
- `--fix`는 안전한 항목만 수정한다. 판단이 필요한 항목은 보고만 한다.
- `_archive/` 디렉토리는 감사 대상에서 제외한다.
