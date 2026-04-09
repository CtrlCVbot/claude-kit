# claude-kit 일관성 유지 메타 툴링

> Codex 전환 실행(/kit-sync), 교차 참조 검증(C8), 설계-구현 갭 탐지(C9), 예외 레지스트리

## 1. 개요

### 핵심 흐름

```
kit-sync-agent (자율 판단 에이전트)
  │
  ├─ Phase 1: 분석
  │   └─ /kit-analyze 로직으로 현재 상태 파악
  │
  ├─ Phase 2: 판단 + 실행
  │   ├─ "Codex 전환이 필요하다" → /kit-convert 호출
  │   ├─ "참조가 깨졌다"         → /kit-audit C8 --fix 실행
  │   ├─ "설계-구현 갭이 있다"    → 리포트 생성 + 제안
  │   └─ "전환 불가 항목이다"     → exception-registry 등록
  │
  └─ Phase 3: 검증 + 리포트
      └─ /kit-validate + /kit-audit C7/C8 로 결과 확인
```

### 아키텍처: 에이전트 + 커맨드 조합

| 구성 요소 | 유형 | 역할 |
|----------|------|------|
| **kit-sync-agent** | 에이전트 (신규) | 상위 판단자 — 무엇이 필요한지 분석하고 적절한 커맨드 조합 실행 |
| `/kit-sync` | 커맨드 (신규) | 에이전트의 진입점 — 사용자가 직접 호출할 수도 있음 |
| `/kit-analyze` | 커맨드 (기존 설계) | 미전환 자산 파악 (읽기 전용) |
| `/kit-convert` | 커맨드 (기존 설계) | 단일/배치 변환 엔진 |
| `/kit-audit C8` | 감사 카테고리 (확장) | 교차 참조 무결성 검증 + --fix |
| `/kit-audit C9` | 감사 카테고리 (확장) | 설계-구현 갭 탐지 |
| `exception-registry.json` | 데이터 파일 (신규) | 전환 불가/면제 항목 추적 |

**핵심 차별점**: kit-sync-agent는 커맨드를 직접 실행하는 게 아니라, 상황을 분석한 후 **어떤 커맨드가 필요한지 판단**하고 순서대로 조합한다. 사용자는 에이전트에게 "동기화해줘"라고만 하면 된다.

---

## 2. kit-sync-agent 에이전트 + /kit-sync 커맨드

### 2.1 kit-sync-agent (자율 판단 에이전트)

**파일**: `.claude/agents/kit-sync-agent.md`

```yaml
---
name: kit-sync-agent
description: Claude↔Codex 동기화 에이전트. 미전환 자산 분석 → 전환/수정 필요 여부 판단 → 적절한 커맨드 조합 실행.
tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
model: sonnet
memory: project
color: green
---
```

#### 역할

| 담당 | 비담당 |
|------|--------|
| 현재 상태 분석 (미전환, 깨진 참조, 갭) | 새 컴포넌트 설계 |
| 어떤 도구가 필요한지 **자율 판단** | 아키텍처 결정 |
| 기존 커맨드 조합 실행 | Codex runtime 설정 |
| exception-registry 자동 등록 | 수동 검토(REVIEW NEEDED) 대행 |

#### 판단 로직

```
1. /kit-analyze 로직 실행 → 현재 상태 파악

2. 결과에 따라 분기:

   IF 미전환 자산이 있다:
     → /kit-convert --domain {domain} 또는 --name {name} 실행
     → 전환 후 /kit-validate --target codex 실행

   IF 깨진 참조가 있다:
     → /kit-audit --category C8 --fix 실행
     → 수정 불가 항목은 exception-registry에 등록

   IF 설계-구현 갭이 있다:
     → /kit-audit --category C9 실행
     → 갭 리포트 생성 + 해결 제안

   IF 전환 불가 항목을 발견:
     → exception-registry.json에 자동 등록
     → 사유 기록 (Claude runtime 의존, 대응 포맷 없음 등)

3. 모든 작업 완료 후:
   → /kit-audit --category C7 (페어링 일관성) 실행
   → /kit-list --target both --pairing 실행
   → 최종 리포트 출력
```

#### 출력 포맷

```
[kit-sync-agent] 동기화 완료

  === 실행한 작업 ===
  1. Codex 전환: 45개 (/kit-convert --domain dev)
  2. 참조 수정: 6건 (/kit-audit C8 --fix)
  3. 예외 등록: 2건 (exception-registry)

  === 결과 ===
  pairing-registry: 75 paired + 8 codex-skip
  교차 참조 (C8): 6건 수정, 1건 수동 검토 필요
  설계-구현 갭 (C9): 3건 미구현 도구

  === 수동 검토 필요 ===
  - dev-observability → tenant-isolation 참조: 대상 스킬이 존재하지 않음
  - REVIEW NEEDED 파일 12개 (쓰기 에이전트, 복합 커맨드)

  === 미구현 (정보) ===
  - /kit-analyze, /kit-convert, kit-converter: 10-conversion-tooling.md에 설계됨
```

### 2.2 /kit-sync 커맨드 (진입점)

**파일**: `.claude/commands/kit-sync.md`

```yaml
---
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
description: kit-sync-agent를 호출하여 Claude↔Codex 동기화를 실행합니다.
argument-hint: '[--dry-run] [--domain <domain>] [--type <type>] [--name <name>]'
---
```

#### 동작

`/kit-sync`는 kit-sync-agent를 spawn하는 **얇은 진입점**이다.

```
/kit-sync                    → 에이전트가 전체 분석 + 자율 실행
/kit-sync --dry-run          → 에이전트가 분석만 (실행 안 함)
/kit-sync --domain dev       → dev 도메인만 대상
/kit-sync --name dev-architect → 단일 컴포넌트만 대상
```

사용자는 `/kit-sync`를 호출하기만 하면, 에이전트가 나머지를 판단하고 처리한다.

#### 에이전트 vs 커맨드 역할 분리

| /kit-sync (커맨드) | kit-sync-agent (에이전트) |
|-------------------|------------------------|
| 사용자 진입점 | 실제 실행 주체 |
| 인자 파싱 + 에이전트 spawn | 상태 분석 → 판단 → 커맨드 조합 |
| 단순, 변경 없음 | 자율적, 상황에 따라 다른 커맨드 호출 |

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
| 5 | kit-sync-agent 에이전트 | `.claude/agents/kit-sync-agent.md` | NEW |
| 6 | /kit-sync 커맨드 (진입점) | `.claude/commands/kit-sync.md` | NEW |
| 7 | kit-audit exception 통합 | kit-audit + maintainer + validation SKILL | MODIFY |
| 8 | 문서 갱신 | 00-overview, 02-commands-spec | MODIFY |

**총**: 신규 5파일 + 수정 5파일

```
.claude/
  agents/
    kit-sync-agent.md                  # 자율 판단 동기화 에이전트 (NEW)
  commands/
    kit-sync.md                        # 에이전트 진입점 커맨드 (NEW)
src/
  exception-registry.json              # 전환 불가/면제 항목 (NEW)
.claude/skills/kit-validation/references/
  schema-exception-registry.md         # 예외 레지스트리 스키마 (NEW)
```

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
