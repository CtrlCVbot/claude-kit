# IMP-AGENT-007 — cross-domain 핸드오프 표준화

> **결론**: `plan-bridge-writer` → `dev-implementer`/`copy-implementer` 간 **핸드오프 문서화 부재**를 해소한다. 현재 bridge-writer는 routing metadata를 생성하지만 소비 측 에이전트가 어떤 필드를 소비하는지 명시되지 않아 **묵시적 해석**에 의존한다. 이를 스키마 계약으로 승격한다.

**축**: Process Gaps
**우선순위**: P1
**공수**: M
**Breaking Change**: no (필드 추가, 하위호환)
**타깃 릴리스**: v2.3.1
**근거**: `analysis/agent-catalog-snapshot.md` 공백 #3
**관련 에이전트**: `plan-bridge-writer`, `dev-implementer` (IMP-AGENT-005), `copy-implementer` (IMP-AGENT-006)

---

## 1. 문제 (카탈로그 기반)

현재 에이전트 체인:
```
... → plan-bridge-writer → [???] → dev-feature 또는 copy-reference-refresh
```

**관찰 사실**:
- plan-bridge-writer는 bridge 4종 문서 생성 (overview, package, context, verification)
- routing metadata 포함 (`feature_type`, `scenario`, `owner_domain`)
- 그러나 dev/copy 구현 에이전트가 **어떤 경로로 정보 소비하는지 명시 없음**
- 결과: 메인 세션이 bridge 문서를 읽고 수동 파싱 → 표준화 기회 상실

## 2. 해결책

### 2.1 Handoff Contract 스키마

`src/claude/plan/_schemas/handoff-contract.schema.json` 신설:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["feature_slug", "feature_type", "scenario", "owner_domain", "next_step"],
  "properties": {
    "feature_slug": "string",
    "feature_type": { "enum": ["dev", "copy", "hybrid"] },
    "scenario": { "enum": ["A", "B", "C", "N/A"] },
    "owner_domain": { "enum": ["dev", "copy", "mixed"] },
    "task_ids": ["string"],
    "req_ids": ["string"],
    "next_step": {
      "type": "object",
      "required": ["command", "agent"],
      "properties": {
        "command": "string",
        "agent": "string",
        "inputs": "object"
      }
    },
    "constraints": {
      "type": "object",
      "properties": {
        "file_scope": ["string"],
        "forbidden_paths": ["string"],
        "dependencies": ["string"]
      }
    }
  }
}
```

### 2.2 소비 규칙

| 소비 에이전트 | 소비 필드 | 용도 |
|---|---|---|
| dev-implementer | task_ids, constraints.file_scope | TASK 범위 확인 |
| copy-implementer | scenario, constraints.file_scope | 시나리오별 동작 분기 |
| `/dev-run` 커맨드 | next_step.command + agent | 자동 디스패치 |
| `/copy-*` 커맨드 | next_step.command + agent | 자동 디스패치 |

### 2.3 plan-bridge-writer 출력 확장

기존 bridge 4종 문서 끝에 **handoff-contract.json** 파일 추가:

```
.plans/features/active/{slug}/bridge/
├── feature-overview.md
├── feature-package.md
├── feature-context.md
├── verification.md
└── handoff-contract.json   ← 신규
```

bridge-writer 프롬프트 확장:
```markdown
## Handoff Contract 생성 (필수)

bridge 4종 문서 완료 후 `handoff-contract.json`을 생성한다:
- 스키마: `src/claude/plan/_schemas/handoff-contract.schema.json` v1
- 내용: bridge 문서에서 추출한 routing metadata 구조화
- validation: ajv로 검증 (실패 시 1회 재작성)
```

---

## 3. 현재 상태 → 목표 상태

### 현재 (v2.3.0)
```
plan-bridge-writer → bridge 4종 문서
                          ↓ (사람이 읽고 해석)
                    메인 세션
                          ↓ (수동 파싱)
                    /dev-run 또는 /copy-reference-refresh
```

### 목표 (v2.3.1)
```
plan-bridge-writer → bridge 4종 + handoff-contract.json
                                         ↓ (스키마 validation)
                                   메인 세션
                                         ↓ (자동 디스패치)
                           dev-implementer 또는 copy-implementer
```

---

## 4. IMP-AGENT-005/006과의 관계

- IMP-AGENT-005 (dev-implementer): 본 IMP의 `task_ids`, `file_scope` 소비자
- IMP-AGENT-006 (copy-implementer): 본 IMP의 `scenario`, `file_scope` 소비자
- **의존 관계**: IMP-AGENT-007은 005/006의 **입력 계약 역할**. 우선 순위는 동등하되 구현 순서는 007 → 005/006 권장

---

## 5. 구현 범위

**신규 파일**:
- `src/claude/plan/_schemas/handoff-contract.schema.json` v1
- `.claude/rules/cross-domain-handoff.md` — 핸드오프 절차 SSOT

**수정 파일**:
- `src/claude/plan/agents/plan-bridge-writer.md` — `## Handoff Contract 생성` 섹션 추가
- `src/claude/dev/commands/dev-run.md` — handoff-contract.json 자동 로드
- `src/claude/copy/commands/copy-reference-refresh.md` — 동일
- `src/claude/plan/skills/plan-bridge-writing/SKILL.md` — 스키마 연계 업데이트

**테스트**:
- bridge-writer가 모든 Feature에서 handoff-contract.json 생성 확인
- validation 실패 케이스 재작성 루프 동작
- `/dev-run`이 handoff-contract.json 로드 후 dev-implementer 호출
- 시나리오 C에서 `/copy-reference-refresh` → copy-implementer 체인 동작

---

## 6. ROI

- **정방향**: 묵시적 해석 → 명시적 계약. 핸드오프 오류 감소
- **측정**: IMP-AGENT-009 텔레메트리로 handoff-contract validation 실패율 추적
- **비용**: 스키마 1건 + 에이전트 프롬프트 + 커맨드 2개 수정

---

## 7. 수락 기준

- [ ] handoff-contract.schema.json v1 ajv validation 통과
- [ ] plan-bridge-writer가 모든 Feature에서 계약 생성
- [ ] dev-implementer/copy-implementer가 필드 소비
- [ ] `/dev-run`, `/copy-reference-refresh` 자동 디스패치 동작
- [ ] Hybrid Feature도 `owner_domain: mixed`로 계약 생성

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 카탈로그 공백 #3 해소 |
