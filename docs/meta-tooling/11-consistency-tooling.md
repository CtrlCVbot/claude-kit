# claude-kit 일관성 유지 메타 툴링

> Codex 전환 실행(/kit-sync), 교차 참조 검증(C8), 설계-구현 갭 탐지(C9), 예외 레지스트리

## 1. 개요

### 핵심 흐름

```
/kit-analyze → Codex에 빠진 에이전트 기능 파악 (읽기 전용)
     ↓
/kit-sync → 미전환 Claude 자산을 Codex로 일괄 전환 + 참조 정합성 유지
     ↓
/kit-audit C8 → 전환된 결과물의 참조가 유효한지 양방향 확인
     ↓
/kit-audit C9 → 설계 문서에 정의됐지만 구현에 빠진 항목 탐지
     ↓
exception-registry → 전환 불가 항목을 등록하여 반복 감지 방지
```

### 기존 도구와의 관계

| 도구 | 역할 | 관계 |
|------|------|------|
| `/kit-analyze` | 미전환 자산 파악 (읽기 전용) | kit-sync의 입력 |
| `/kit-sync` | 미전환 자산 일괄 전환 실행 | **신규** — analyze + convert + verify 통합 |
| `/kit-convert` | 단일/배치 변환 엔진 | kit-sync가 내부적으로 사용 (단독 실행도 가능) |
| `/kit-audit C8` | 교차 참조 무결성 검증 | **확장** — kit-sync 후 자동 실행 |
| `/kit-audit C9` | 설계-구현 갭 탐지 | **확장** — 미구현 항목 파악 |
| `exception-registry.json` | 전환 불가 항목 추적 | **신규** — 모든 도구가 참조 |

---

## 2. /kit-sync 커맨드 명세

**파일**: `.claude/commands/kit-sync.md`

### Frontmatter

```yaml
---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: 미전환 Claude 자산을 Codex로 일괄 전환하고 참조 정합성을 검증합니다.
argument-hint: '[--dry-run] [--apply] [--domain <domain>] [--type <type>] [--name <name>]'
---
```

### 파라미터

| 플래그 | 설명 | 기본값 |
|--------|------|--------|
| `--dry-run` | 전환 계획만 출력 | 기본값 |
| `--apply` | 실제 전환 실행 | Off |
| `--domain` | 도메인 필터 (`core`, `dev`, `plan`) | 전체 |
| `--type` | 타입 필터 (`skill`, `agent`, `command`, `hook`) | 전체 |
| `--name` | 단일 컴포넌트 | - |

### Workflow

#### Phase 1: 분석 (kit-analyze 로직 재사용)

1. `src/claude/` 전체를 스캔하여 컴포넌트 인벤토리를 구축한다.
2. `src/codex/` 스캔하여 이미 전환된 자산을 확인한다.
3. `src/pairing-registry.json` 로드하여 현재 페어링 상태를 확인한다.
4. `src/exception-registry.json` 로드하여 전환 제외 항목을 필터링한다.
5. 미전환 자산 목록을 생성한다:
   - `src/claude/`에 존재하지만 `src/codex/`에 대응 파일이 없는 자산
   - `pairing-registry`에 `paired`도 `codex-skip`도 아닌 자산
   - `exception-registry`에 등록되지 않은 자산

#### Phase 2: 분류

6. 각 미전환 자산의 변환 난이도를 분류한다:
   - **auto**: 스킬, 읽기 전용 에이전트, 호환 훅, 단순 커맨드
   - **review**: 쓰기 에이전트, 복합 커맨드
   - **skip**: 룰 (claude-origin shared), 비호환 훅

#### Phase 3: 계획 출력 (--dry-run)

7. `--dry-run`이면 전환 계획을 출력한다:

```
[kit-sync] Codex 전환 계획 (dry-run)

  미전환: 75개 (전체 89 - 8 skip - 6 exempt)

  전환 대상:
  | Identity            | Type    | Domain | Difficulty | Target Path                              |
  |---------------------|---------|--------|------------|------------------------------------------|
  | dev-architect       | agent   | dev    | auto       | src/codex/dev/agents/dev-architect.md    |
  | plan-prd-writer     | agent   | plan   | review     | src/codex/plan/agents/plan-prd-writer.md |
  | dev-feature         | command | dev    | review     | src/codex/dev/commands/dev-feature.md    |
  | dev-tdd-workflow    | skill   | dev    | auto       | src/codex/dev/skills/dev-tdd-workflow/   |
  ... (71개 더)

  건너뛰기:
  | Identity               | 사유                          |
  |------------------------|-------------------------------|
  | golden-principles      | claude-origin shared (rule)   |
  | session-wrap-suggest   | EX-001: Claude runtime 의존   |
  ... (12개 더)

  /kit-sync --apply 로 전환을 실행하세요.
```

#### Phase 4: 전환 실행 (--apply)

8. `--apply`이면 kit-converter 스킬의 변환 규칙을 적용한다 (10-conversion-tooling.md 섹션 4 참조):
   - **Skill**: 내용 복사 + "Codex 참고 사항" 섹션 추가
   - **Agent**: XML Agent_Prompt → 헤딩 기반 변환 (Role, Capabilities, Constraints, Output Format)
   - **Command**: 슬래시 커맨드 → Entry Flow 변환
   - **Hook**: JS 복사 + Codex 등록 주석 추가
   - **Rule**: skip 처리

#### Phase 5: 전환 후 검증

9. 전환된 각 파일에 대해 `/kit-validate --target codex` 로직을 실행한다.
10. 교차 참조 검증 (C8)을 자동 실행한다:
    - 생성된 Codex 파일의 "Claude sibling" 참조가 유효한지
    - Claude 원본의 참조 경로가 Codex에서도 유효한지

#### Phase 6: 레지스트리 갱신 + 리포트

11. 전환 성공 자산을 `pairing-registry.json`에 `paired`로 등록한다.
12. skip 자산을 `pairing-registry.json`에 `codex-skip`으로 등록한다.
13. 결과 리포트를 출력한다:

```
[kit-sync] 전환 완료

  전환: 45개 (auto: 33, review: 12)
  건너뛰기: 8개 (codex-skip)
  면제: 2개 (exception-registry)
  검증 PASS: 43개
  검증 WARN: 2개 (REVIEW NEEDED)

  교차 참조 (C8):
  [PASS] 전환된 파일의 Claude sibling 참조 유효
  [WARN] dev-observability → tenant-isolation 참조 대상 없음

  다음 단계:
  1. REVIEW NEEDED 파일 12개를 수동 검토하세요
  2. /kit-audit --category C8 으로 전체 교차 참조 확인
  3. /kit-audit --category C9 로 설계-구현 갭 확인
```

### Rules

- `--apply` 없으면 파일을 생성/수정하지 않는다.
- exception-registry에 등록된 항목은 변환하지 않고 `[EXEMPT]`로 표시한다.
- 이미 `src/codex/`에 존재하는 파일은 `--force` 없이 덮어쓰지 않는다.
- 전환 파일 상단에 `<!-- kit-sync generated: {날짜} -->` 추적 주석을 추가한다.
- review 난이도 파일에 `<!-- REVIEW NEEDED: {사유} -->` 마커를 추가한다.

---

## 3. kit-audit C8: 교차 참조 무결성

**추가 위치**: `.claude/commands/kit-audit.md` (C7 뒤에 추가)

### 정의

```
### C8: 교차 참조 무결성 (필수)
```

### 참조 패턴 파싱

3가지 패턴을 인식한다:

| 패턴 | 형식 | 예시 |
|------|------|------|
| A. 블록 인용 | `> 참조: \`{path}\`` | `> 참조: \`.claude/skills/dev-workflow/SKILL.md\`` |
| B. 목록 참조 | `- {label}: \`{path}\`` | `- 차단 훅: \`.claude/hooks/dev-tdd-guard.js\`` |
| C. 인라인 백틱 | 본문 내 `` \`.claude/{category}/{name}\` `` | `` \`.claude/skills/testing-backend/SKILL.md\` `` |

### 검증 항목

| 검증 | 수준 | 기준 |
|------|------|------|
| 참조 대상 존재 | FAIL | 경로가 어떤 소스 파일로도 해석 불가 |
| 도메인 접두사 누락 | FAIL | `skills/tdd-workflow` → 실제 `skills/dev-tdd-workflow` |
| Codex sibling 참조 유효 | WARN | "Claude sibling: ..." 경로가 실제 존재 |
| 단방향 참조 | WARN | A→B 참조 있지만 B→A 없음 |
| 고아 컴포넌트 | WARN | 어디서도 참조되지 않는 자산 |
| 런타임 경로 스타일 | INFO | `.claude/` 대신 `src/claude/` 사용 권장 |

### 경로 해석 알고리즘

```
참조 경로 P에 대해:
  1. P가 src/로 시작 → 파일시스템 직접 확인
  2. P가 .claude/로 시작:
     a. 컴포넌트 이름 N 추출
     b. 3개 도메인(core, dev, plan)에서 검색:
        - src/claude/{D}/{category}/{N} 존재?
        - src/claude/{D}/{category}/{D}-{N} 존재? (접두사 보정)
     c. 매치 1개 → PASS (접두사 보정 필요시 FAIL)
     d. 매치 0개 → FAIL (죽은 참조)
     e. 매치 2+개 → WARN (모호, 수동 확인)
```

### --fix 자동 수정

| 이슈 | 수정 |
|------|------|
| 도메인 접두사 누락 | `{name}` → `{domain}-{name}` 자동 추가 |
| 경로 도메인 불일치 | 올바른 도메인으로 변경 |
| 죽은 참조 | 참조 줄 제거 + `<!-- removed: {원본} -->` 주석 |

### 이미 발견된 깨진 참조 (7건)

| 파일 | 참조 경로 | 실제 경로 | 이슈 |
|------|----------|----------|------|
| dev-tdd-workflow/SKILL.md | `.claude/skills/testing-backend/SKILL.md` | `dev-testing-backend` | 접두사 누락 |
| dev-tdd-workflow/SKILL.md | `.claude/skills/testing-frontend/SKILL.md` | `dev-testing-frontend` | 접두사 누락 |
| dev-refactor.md | `.claude/skills/refactoring/SKILL.md` | `dev-refactoring` | 접두사 누락 |
| dev-review.md | `.claude/skills/layered-architecture/SKILL.md` | `dev-layered-architecture` | 접두사 누락 |
| dev-review.md | `.claude/skills/frontend-patterns/SKILL.md` | `dev-frontend-patterns` | 접두사 누락 |
| dev-test-verify.md | `.claude/skills/tdd-workflow/SKILL.md` | `dev-tdd-workflow` | 접두사 누락 |
| dev-observability/SKILL.md | `.claude/skills/tenant-isolation/SKILL.md` | (존재하지 않음) | 죽은 참조 |

---

## 4. kit-audit C9: 설계-구현 갭

**추가 위치**: `.claude/commands/kit-audit.md` (C8 뒤에 추가)

### 정의

```
### C9: 설계-구현 갭 (선택)
```

### 검증 규칙

| ID | 비교 대상 | 검증 |
|----|----------|------|
| G1 | pairing-registry vs 파일시스템 | agent/command 중 미등록 항목 = 미전환 |
| G2 | src/claude/ vs src/codex/ | required sibling 중 대응 파일 없는 항목 |
| G3 | docs/meta-tooling/ vs .claude/ | 명세에 정의된 도구가 실제 존재하는지 |
| G4 | Codex 스키마 vs 전환 결과 | 전환된 파일이 스키마 준수하는지 |
| G5 | docs 카운트 vs 실제 카운트 | 컴포넌트 수 불일치 |

### 출력 예시

```
[kit-audit] C9: 설계-구현 갭

  미전환 (Spec-only):
  [WARN] dev-architect: agent, src/codex/ 대응 파일 없음 → /kit-sync --apply --name dev-architect
  [WARN] plan-prd-writer: agent, src/codex/ 대응 파일 없음

  미구현 도구:
  [WARN] /kit-analyze → .claude/commands/kit-analyze.md 없음 (10-conversion-tooling.md)
  [WARN] /kit-convert → .claude/commands/kit-convert.md 없음 (10-conversion-tooling.md)
  [WARN] kit-converter → .claude/skills/kit-converter/ 없음 (10-conversion-tooling.md)

  카운트 불일치:
  [WARN] docs/meta-tooling/00-overview.md: 컴포넌트 84 → 실제 89
```

---

## 5. 예외 레지스트리

**파일**: `src/exception-registry.json`

### 스키마

```json
{
  "$schema": "exception-registry-v1",
  "description": "전환 불가/감사 면제 항목. kit-audit, kit-sync, kit-analyze가 참조.",
  "entries": [
    {
      "id": "EX-001",
      "component": "session-wrap-suggest",
      "category": "codex-conversion",
      "rule": "hook-skip",
      "detail": "Claude Stop 이벤트 + CLAUDE_REMOTE_SESSION 환경변수 의존",
      "reason": "Codex에서 재현 불가능한 Claude runtime 기능 의존",
      "approvedBy": "maintainer",
      "approvedDate": "2026-04-09",
      "expiresDate": null,
      "status": "active"
    }
  ]
}
```

### 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | O | `EX-{NNN}` 자동 증가 |
| `component` | string | O | 컴포넌트 identity |
| `category` | string | O | 감사 카테고리 또는 `codex-conversion` |
| `rule` | string | O | 해당 카테고리 내 규칙 |
| `detail` | string | O | 구체적 위반 내용 |
| `reason` | string | O | 면제 사유 |
| `approvedBy` | string | O | 승인자 |
| `approvedDate` | string | O | ISO 날짜 |
| `expiresDate` | string\|null | - | 만료일 (null=무기한) |
| `status` | enum | O | `active`, `expired`, `revoked` |

### Lifecycle

| 이벤트 | 동작 |
|--------|------|
| 등록 | `/kit-sync`가 skip 항목 발견 시 자동 등록, 또는 수동 편집 |
| 매칭 | kit-audit 실행 시 FAIL/WARN → component+category+rule 일치하면 `[EXEMPT]` |
| 만료 | `expiresDate` 경과 시 자동으로 `status: expired`, 다시 감지됨 |
| 조회 | `/kit-audit --exceptions` |
| 해제 | 수동으로 `status: revoked` 변경 |

### skip-registry와의 관계

| 파일 | 용도 | 범위 |
|------|------|------|
| `kit-converter/references/skip-registry.md` | 변환 규칙 참조 (문서) | codex-conversion만 |
| `src/exception-registry.json` | 런타임 감사 면제 (데이터) | C1-C9 전체 |

exception-registry가 skip-registry의 **상위 호환**. 변환 skip 뿐 아니라 모든 감사 카테고리의 면제를 관리한다.

---

## 6. 기존 도구 수정 사항

### kit-audit.md 수정

| 수정 | 내용 |
|------|------|
| 파라미터 | `--category C1~C9` (기존 C1~C7), `--exceptions`, `--no-exceptions` 추가 |
| C8 추가 | 교차 참조 무결성 (필수, C1-C4/C7과 함께 기본 실행) |
| C9 추가 | 설계-구현 갭 (선택, C5/C6과 동일) |
| Phase 2 | exception-registry 로드 → FAIL/WARN 판정 전 면제 확인 |
| 출력 | `[EXEMPT]` 상태 추가 |

### kit-maintainer.md 수정

| 수정 | 내용 |
|------|------|
| Role | kit-sync --apply 위임 실행 추가 |
| Investigation_Protocol | C8/C9 포함, exception-registry 인식 |
| Constraints | exception active 항목은 수정 안 함 |

### kit-validation SKILL.md 수정

| 수정 | 내용 |
|------|------|
| 스키마 목록 | #10: schema-exception-registry.md 추가 |

---

## 7. 구현 순서

| Step | 작업 | 파일 | 유형 |
|------|------|------|------|
| 1 | exception-registry.json | `src/exception-registry.json` | NEW |
| 2 | schema-exception-registry.md | `.claude/skills/kit-validation/references/` | NEW |
| 3 | C8 교차 참조 무결성 | `.claude/commands/kit-audit.md` | MODIFY |
| 4 | C9 설계-구현 갭 | `.claude/commands/kit-audit.md` | MODIFY |
| 5 | /kit-sync 커맨드 | `.claude/commands/kit-sync.md` | NEW |
| 6 | kit-audit exception 통합 | kit-audit + maintainer + validation SKILL | MODIFY |
| 7 | 문서 갱신 | 00-overview, 02-commands-spec | MODIFY |

**총**: 신규 4파일 + 수정 5파일

---

## 8. 검증 계획

| # | 시나리오 | 기대 결과 |
|---|---------|-----------|
| 1 | `/kit-sync --dry-run` | 미전환 75개+ 자산 목록 + 난이도 분류 |
| 2 | `/kit-sync --apply --name dev-architect` | `src/codex/dev/agents/dev-architect.md` 생성 + registry paired |
| 3 | `/kit-sync --apply --domain dev` | dev 도메인 45개 일괄 전환 |
| 4 | `/kit-audit --category C8` | 7건 깨진 참조 탐지 (접두사 누락 6 + 죽은 참조 1) |
| 5 | `/kit-audit --category C8 --fix` | 6건 접두사 자동 수정, 1건 죽은 참조 제거 |
| 6 | `/kit-audit --category C9` | 미구현 도구 3건 + 카운트 불일치 감지 |
| 7 | `/kit-audit --exceptions` | EX-001 (session-wrap-suggest) 표시 |
| 8 | exception 등록 후 `/kit-sync --dry-run` | 해당 항목 `[EXEMPT]`로 분류, 전환 대상에서 제외 |
