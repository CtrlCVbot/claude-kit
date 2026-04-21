---
ID: IMP-KIT-014
제목: stage-manifest.json 스키마 버전 관리
우선순위: P1
영향 도메인: core
RICE: R3 × I4 × C3 ÷ E3 = 12
공수: M (3~5일)
Phase: 2.3
원본 타임라인: (관찰) dash-preview-phase3 회고
선행 의존: 없음 (IMP-KIT-011 거버넌스 원칙과 병행 적용 권장)
이해관계자 승인일: 2026-04-21 (BC-2.3.0-02 승인 포함)
구현 완료일: 2026-04-21 (Claude Code 대행)
상태: shipped
---

# IMP-KIT-014 — stage-manifest.json 스키마 버전 관리

## 1. 문제 정의

`.plans/features/active/{slug}/stage-manifest.json`에 **phaseA/B/C 평면 필드**가 추가될 때 소비자(plan/dev/copy 도메인 스크립트·에이전트) 호환성 검증이 자동화되어 있지 않음. 필드 추가가 소리 없이 깨짐을 유발할 수 있음.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-014 라인 211~220](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)

### 현재 상태 (2.2.0 완료 시점)

- `stage-manifest.json`이 에이전트별로 생성·참조되지만 **공식 스키마 파일 부재**
- 소비자 일람 미문서화 — 어떤 에이전트/스크립트가 어떤 필드를 읽는지 암묵적

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: 공식 스키마 + 소비자 등록부 + 자동 검증 CI** ⭐ | `schema_version` 필드 + 소비자 registry + 스키마 변경 시 CI 검증 | 장기 안정성 | 초기 구축 공수 |
| B: 스키마만 추가 | `schema_version` 필드 + 스키마 파일 | 단순 | 소비자 추적 미흡 |
| C: 수동 문서만 | 변경 시 사람이 소비자 확인 | 공수 0 | 기존 문제 재발 |

**선택: A** — IMP-KIT-011과 동일한 거버넌스 원칙 적용, 장기 안정성.

### SemVer 원칙 (IMP-KIT-011 거버넌스 문서 상속)

- `schema_version: "1.0"` → 1.1 (minor: 필드 추가, 하위호환) / 2.0 (major: 필드 제거·타입 변경, 마이그레이션 문서 필수)

### 소비자 등록부 (신규 파일)

`src/claude/core/_registry/stage-manifest-consumers.json`:

```json
{
  "schema_version_required": ">=1.0",
  "consumers": [
    {
      "id": "dev-feature-phase-a",
      "type": "command",
      "path": "src/claude/dev/commands/dev-feature.md",
      "reads": ["phaseA.status", "phaseA.tasks[]"]
    },
    {
      "id": "plan-bridge-writer",
      "type": "agent",
      "path": "src/claude/plan/agents/plan-bridge-writer.md",
      "reads": ["phaseA.tasks[]", "routing-metadata"]
    }
  ]
}
```

### 아키텍처

```
stage-manifest.json 변경
  ↓
scripts/validate-stage-manifest-schema.js (CI)
  ├─ schema 유효성 (ajv)
  ├─ consumers registry의 read 경로 존재 여부
  └─ major 변경 감지 시 마이그레이션 문서 확인 강제
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/core/_schemas/stage-manifest.governance.test.ts` (신규)

```typescript
describe('stage-manifest — 스키마 거버넌스', () => {
  it('schema_version 1.0 유효 payload 통과', () => { /* ajv */ })
  it('schema_version 누락 시 거부', () => { /* ... */ })
  it('consumer의 read 경로가 스키마에 없으면 검증 실패', () => {
    // consumers.json의 "reads" 경로와 schema properties 교차 검증
  })
  it('major 버전 변경 시 마이그레이션 문서 부재 감지', () => { /* 파일 존재 확인 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/core/_schemas/stage-manifest.schema.json` (신규) — v1.0
2. `src/claude/core/_registry/stage-manifest-consumers.json` (신규) — 초기 소비자 5~7개 등록
3. `src/claude/core/rules/stage-manifest-governance.md` (신규, 또는 IMP-KIT-011 거버넌스 문서 확장) — SemVer + 마이그레이션 절차
4. `scripts/validate-stage-manifest-schema.js` (신규) — ajv + consumer 교차 검증
5. `package.json`의 `check:schemas` 스크립트에 검증 추가

### 3.3 IMPROVE — 리팩토링

- IMP-KIT-011의 `edit-coordinates` 거버넌스와 **공통 원칙 문서**(`src/claude/core/rules/schema-governance.md`)로 통합
- 개별 스키마는 공통 원칙 링크

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `check:schemas` 스크립트 확장 |
| 기존 `stage-manifest.json` 생성자(에이전트·커맨드) | `schema_version` 필드 주입 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/_schemas/stage-manifest.schema.json` | v1.0 스키마 SSOT |
| `src/claude/core/_registry/stage-manifest-consumers.json` | 소비자 등록부 |
| `src/claude/core/rules/stage-manifest-governance.md` | 거버넌스 |
| `scripts/validate-stage-manifest-schema.js` | 검증기 |
| `tests/claude/core/_schemas/stage-manifest.governance.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/core/_schemas/stage-manifest.schema.json` | 동등 스키마 |
| `src/codex/core/_registry/stage-manifest-consumers.json` | 동등 등록부 (Codex 소비자) |
| `src/codex/core/rules/stage-manifest-governance.md` | 동등 거버넌스 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] v1.0 유효 payload 통과
- [ ] `schema_version` 누락 거부
- [ ] 소비자 read 경로가 스키마에 부재 시 검증 실패
- [ ] minor 버전 확장 통과, major 변경 시 마이그레이션 강제

### 5.2 회귀 시나리오

스키마 확장 시나리오 1회 실행 (phaseA.tasks[].priority 필드 추가):

- [ ] **스키마 변경 후 소비자 실패 0** (원본 목표 — 회고 라인 220)
- [ ] 자동 검증 CI 통과
- [ ] 소비자 등록부 업데이트 누락 감지

### 5.3 후방 호환

- [ ] 기존 `stage-manifest.json` 파일은 `schema_version` 없어도 v0으로 간주 (마이그레이션 경고)
- [ ] 기존 에이전트·커맨드 동작 영향 없음 (점진 도입)

---

## 6. 롤백 시나리오

거버넌스 도입이 예상치 못한 CI 실패를 유발할 경우:

1. `scripts/validate-stage-manifest-schema.js` CI 스텝을 opt-in으로 전환
2. 스키마 파일 유지, 검증은 경고 수준
3. 소비자 등록부도 유지 (문서 참고용)

---

## 7. 연관 백로그

- **IMP-KIT-011** (P1): 거버넌스 원칙 공용 — 본 항목과 공통 문서로 통합 권장
- **IMP-KIT-017** (P1): 재복제 금지 — 거버넌스 문서 1건 공용, 복제 금지
- **IMP-KIT-024** (P2): 텔레메트리 — 소비자 등록부가 텔레메트리 데이터 소스 일부

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
