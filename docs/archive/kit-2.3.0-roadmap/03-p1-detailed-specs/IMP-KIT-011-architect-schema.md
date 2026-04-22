---
ID: IMP-KIT-011
제목: dev-architect ↔ doc-updater 스키마 거버넌스 표준화
우선순위: P1
영향 도메인: dev, core
RICE: R3 × I4 × C4 ÷ E2 = 24
공수: M (3~5일)
Phase: 2.2
원본 타임라인: #22 → #23 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-001 (2.2.0 완료 — 체이닝 + v1 스키마 초안)
이해관계자 승인일: 2026-04-21
구현 완료일: 2026-04-21 (Claude Code 대행, ajv 8.18.0 devDependency 추가)
상태: shipped
---

# IMP-KIT-011 — dev-architect ↔ doc-updater 스키마 거버넌스 표준화

## 1. 문제 정의

IMP-KIT-001에서 `edit-coordinates.schema.json` v1이 도입되었지만 **스키마 거버넌스(검증·버전·하위호환)가 미정**. 필드 누락·타입 불일치·신규 action 추가 시 양쪽 에이전트 해석 차이로 재위임 실패 재발 가능.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-011 라인 170~179](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- [IMP-KIT-001-dev-architect-chaining.md §2 공통 스키마](../../kit-2.2.0-roadmap/03-p0-detailed-specs/IMP-KIT-001-dev-architect-chaining.md) — 본 항목이 이어받는 v1

### 현재 상태 (IMP-KIT-001 완료 시점)

- `src/claude/dev/_schemas/edit-coordinates.schema.json` v1 존재 (9필드: schema_version, phase, agent, edits[], metadata)
- v1은 zod/ajv **검증 런타임 부재** — 양 에이전트가 프롬프트로만 스키마 참조
- 신규 action 타입 추가 절차 미문서화

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: ajv 런타임 검증 + 거버넌스 문서화** ⭐ | 스크립트 단에서 JSON Schema 검증, 실패 시 에이전트 재요청 | 자동 감지 | ajv 의존성 추가 |
| B: 에이전트 자체 검증 | 에이전트가 자체 프롬프트로 검증 | 의존성 제로 | LLM 검증은 비결정적 |
| C: 타입 생성 (zod → TS) | 스키마에서 TS 타입 자동 생성 | IDE 지원 | IDE 외 효과 적음 |

**선택: A** — v1의 "암묵적 해석"을 "명시적 런타임 검증"으로 승격. 장기 거버넌스의 기초.

### 거버넌스 원칙 (문서화 대상)

1. **SemVer 규칙**: `schema_version` 필드 ("1.0" → "1.1" minor, "2.0" major)
   - minor: 필드 추가 (하위호환)
   - major: 필드 제거/타입 변경 (하위호환 깨짐 — 마이그레이션 문서 필수)
2. **action enum 확장 절차**: 신규 action(`move`/`rename` 등) 추가 시 PR 체크리스트
3. **하위 호환**: 양 에이전트는 현재 major 버전 + 직전 major까지 해석 가능
4. **검증 실패 처리**: dev-doc-updater가 검증 실패 감지 시 dev-architect에 1회 재요청, 재실패 시 사용자에게 보고

### 아키텍처

```
dev-architect → [edit-coordinates JSON 출력]
                       ↓
            ajv 검증 (스크립트 단)
                       ↓
     ┌────────────────┴────────────────┐
     │                                 │
  [유효]                           [무효]
     ↓                                 ↓
dev-doc-updater 실행             dev-architect 재요청 (1회)
                                       ↓
                                  재실패 → 사용자 보고
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/dev/_schemas/edit-coordinates.governance.test.ts` (신규)

```typescript
import Ajv from 'ajv'
import schema from '../../../../src/claude/dev/_schemas/edit-coordinates.schema.json'

const ajv = new Ajv()
const validate = ajv.compile(schema)

describe('edit-coordinates — 거버넌스', () => {
  it('v1 유효 payload 통과', () => {
    const valid = { schema_version: '1.0', phase: 'A', agent: 'dev-architect', edits: [/* ... */], metadata: {/* ... */} }
    expect(validate(valid)).toBe(true)
  })

  it('필수 필드 누락 감지 (schema_version)', () => {
    const invalid = { phase: 'A', agent: 'dev-architect', edits: [], metadata: {} }
    expect(validate(invalid)).toBe(false)
  })

  it('action enum 범위 밖 거부', () => {
    const invalid = { /* action: 'unknown' */ }
    expect(validate(invalid)).toBe(false)
  })

  it('신규 minor 버전(1.1) — 기존 consumer 무시 필드 허용', () => {
    const v11 = { schema_version: '1.1', /* ... */, newOptionalField: 'x' }
    expect(validate(v11)).toBe(true)
  })

  it('major 버전 변경(2.0) — 별도 스키마로 라우팅', () => { /* version router 테스트 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `package.json` 의존성 추가: `ajv` (dev-deps)
2. `src/claude/dev/_schemas/edit-coordinates.schema.json` — `$id` v1 고정, `additionalProperties: true` (minor 확장 대비)
3. `scripts/validate-edit-coordinates.js` (신규) — 스탠드얼론 검증기
4. `src/claude/dev/agents/dev-doc-updater.md` — `<Input_Format>`에 "검증 실패 시 dev-architect에 재요청" 섹션 추가
5. `src/claude/dev/rules/edit-coordinates-governance.md` (신규) — 거버넌스 4원칙 문서화

### 3.3 IMPROVE — 리팩토링

- 스키마 버전 라우터 (`src/claude/dev/_schemas/_router.js`) — version별 스키마 선택
- 에이전트 프롬프트에서 거버넌스 문서를 경로로 참조 (복제 금지)

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/dev/_schemas/edit-coordinates.schema.json` | `additionalProperties` 정책, `$id` 고정 |
| `src/claude/dev/agents/dev-architect.md` | 거버넌스 규칙 참조 링크 |
| `src/claude/dev/agents/dev-doc-updater.md` | Input_Format에 검증 실패 처리 |
| `package.json` | `ajv` devDependency |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/dev/rules/edit-coordinates-governance.md` | 거버넌스 4원칙 SSOT |
| `src/claude/dev/_schemas/_router.js` | 버전 라우터 |
| `scripts/validate-edit-coordinates.js` | 스탠드얼론 검증기 |
| `tests/claude/dev/_schemas/edit-coordinates.governance.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/dev/_schemas/edit-coordinates.schema.json` | 동등 스키마 (v1 동일) |
| `src/codex/dev/rules/edit-coordinates-governance.md` | 동등 거버넌스 |
| `src/codex/dev/agents/dev-doc-updater.md` | 동등 검증 지침 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] 유효 payload 통과 (v1)
- [ ] 필수 필드 누락 시 검증 실패
- [ ] `action` enum 외 값 거부
- [ ] minor 버전 확장(1.0 → 1.1) 통과
- [ ] major 버전 변경 시 라우터가 별도 스키마 선택

### 5.2 회귀 시나리오

dash-preview-phase3 Phase C 재위임 복제:

- [ ] **재위임 시 수동 파싱 0** (원본 목표 — 회고 라인 179)
- [ ] ajv 검증 실패 시 재요청 1회 내 성공 (성공률 ≥ 95%)
- [ ] 검증 오버헤드 < 50ms / 호출

### 5.3 후방 호환

- [ ] IMP-KIT-001의 v1 payload는 변경 없이 통과
- [ ] 기존 `edit-coordinates.schema.json` 소비자(테스트 포함) 영향 없음
- [ ] Codex sibling과 schema checksum 동일

---

## 6. 롤백 시나리오

거버넌스 검증이 예상치 못한 호환성 문제 유발 시:

1. `scripts/validate-edit-coordinates.js` 호출을 선택적(opt-in)으로 전환 (env flag `STRICT_SCHEMA_VALIDATION=true`)
2. 에이전트 프롬프트의 "검증 실패 시 재요청" 지침 제거
3. 스키마 파일과 거버넌스 문서는 유지 (차기 재시도용)

---

## 7. 연관 백로그

- **IMP-KIT-001** (P0, 2.2.0 완료): 본 항목 선행 — v1 스키마 제공
- **IMP-KIT-014** (P1): stage-manifest 스키마 버전 관리 — 동일 거버넌스 원칙 적용
- **IMP-KIT-017** (P1): 재복제 금지 — 거버넌스 문서는 원본 회고 복제 아닌 신규 규약

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
