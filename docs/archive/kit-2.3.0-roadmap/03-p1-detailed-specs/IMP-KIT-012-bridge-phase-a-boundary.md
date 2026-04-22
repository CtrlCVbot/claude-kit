---
ID: IMP-KIT-012
제목: plan-bridge ↔ dev-feature Phase A 작업 경계 명확화
우선순위: P1
영향 도메인: plan, dev
RICE: R3 × I3 × C3 ÷ E2 = 13.5
공수: M (3~5일)
Phase: 2.3
원본 타임라인: #19 ↔ #20 (dash-preview-phase3 회고)
선행 의존: IMP-KIT-003, IMP-KIT-004 (2.2.0 완료 — draft/bridge 에이전트 확립)
이해관계자 승인일: 2026-04-21
구현 완료일: 2026-04-21 (Claude Code 대행)
상태: shipped
---

# IMP-KIT-012 — plan-bridge ↔ dev-feature Phase A 작업 경계 명확화

## 1. 문제 정의

`/plan-bridge`와 `/dev-feature` Phase A가 **동일 구조 계약 5종**(feature-intent, stakeholder-matrix, dependency-graph, risk-register, acceptance-criteria)을 **부분적으로 이중 생성·보강**. bridge가 초안 일부만 생성하고 Phase A에서 다시 확장하는 패턴이 중복 수정과 drift를 유발.

### 근거 (원본 회고 인용, 본문 복제 금지)

- [02-improvement-backlog.md §IMP-KIT-012 라인 183~194](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/02-improvement-backlog.md)
- [00-session-retrospective.md #19 ↔ #20](../../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/00-session-retrospective.md) — 중복 수정 사례

### 현재 상태 (2.2.0 완료 시점)

- `src/claude/plan/agents/plan-bridge-writer.md` (IMP-KIT-004 산출) — Standard Feature 전용, `00-context/` 생성
- `src/claude/dev/commands/dev-feature.md` — Phase A에서 동일 5종 재확인·확장
- 두 에이전트의 "책임 경계"가 명시된 규칙 문서 부재

---

## 2. 제안 해결안

### 선택지 트레이드오프

| 안 | 설명 | 장 | 단 |
|---|------|---|---|
| **A: 의도 분리 + Skill 경계 명시** ⭐ | Bridge는 "초안(의도 수준)"만, Phase A는 "상세(실행 수준)" 보강 전담 | 각 에이전트 전문성 활용, 회고 권장안 | 경계 문서 유지비 |
| B: Bridge 전체 완성 | Bridge가 5종 모두 완성, Phase A는 **리뷰만** | Phase A 간소화 | Bridge 비대화, 책임 과집중 |
| C: Phase A가 전부 전담 | Bridge 5종 산출 제거 | 단순화 | Bridge 산출 의미 축소, IMP-KIT-004 효과 일부 무효 |

**선택: A** — 회고 권장안, 각 에이전트 특화 유지 + 경계 명문화.

### 책임 매트릭스 (신규 규칙 문서에 기재)

| 구조 계약 | Bridge (초안) | Phase A (상세) |
|-----------|:-------------:|:--------------:|
| feature-intent.md | ✅ 의도·목적 | 🔧 수용 기준 상세화 |
| stakeholder-matrix.md | ✅ 주요 이해관계자 | 🔧 RACI 매트릭스 |
| dependency-graph.md | ✅ 고수준 의존 | 🔧 파일·모듈 단위 의존 |
| risk-register.md | ✅ 주요 리스크 3~5건 | 🔧 완화 액션 + 담당 |
| acceptance-criteria.md | ✅ 수용 기준 헤드라인 | 🔧 Given-When-Then 형식 |

**원칙**: Phase A는 Bridge 산출을 **수정하지 않고 덧붙임(append-only)**. 수정이 필요하면 Bridge 단계로 돌아가 재실행.

### 아키텍처

```
/plan-bridge {slug}
  └─ plan-bridge-writer (초안 5종, append-only 허용 마크)
       ↓
/dev-feature {slug} Phase A
  └─ dev-architect / dev-doc-updater (상세 5종)
       ├─ Bridge 산출 Read-only 참조
       └─ 각 파일 하단에 "## Phase A 상세" 섹션 append
```

---

## 3. 구현 단계 (TDD Red-Green-Improve)

### 3.1 RED — 실패 테스트

**파일**: `tests/claude/plan/boundary/bridge-vs-phase-a.test.ts` (신규)

```typescript
describe('bridge ↔ Phase A 경계', () => {
  it('Phase A가 Bridge 초안 섹션을 수정하지 않음', async () => {
    const bridgeOutput = await readFile('.plans/features/active/feat-x/00-context/feature-intent.md')
    await runDevFeaturePhaseA({ slug: 'feat-x' })
    const afterPhaseA = await readFile('.plans/features/active/feat-x/00-context/feature-intent.md')

    // Bridge 초안 섹션은 변경 없음
    const bridgeSection = extractSection(bridgeOutput, '## 의도')
    const afterSection = extractSection(afterPhaseA, '## 의도')
    expect(afterSection).toBe(bridgeSection)

    // Phase A 상세 섹션만 append
    expect(afterPhaseA).toMatch(/## Phase A 상세/)
  })

  it('Phase A가 Bridge 미산출 파일 편집 시 에러', async () => { /* 순서 위반 감지 */ })
  it('책임 매트릭스 위반 필드 편집 시 경고', async () => { /* 예: Phase A가 feature-intent 의도 섹션 수정 */ })
})
```

### 3.2 GREEN — 최소 구현

1. `src/claude/core/rules/phase-a-bridge-boundary.md` (신규) — 책임 매트릭스 SSOT
2. `src/claude/plan/agents/plan-bridge-writer.md` — 초안 마커(`<!-- bridge:section -->`) 주입
3. `src/claude/dev/commands/dev-feature.md` — Phase A 스텝에 "Bridge 섹션 수정 금지" 제약 + "Phase A 상세 append" 지시
4. `src/claude/dev/hooks/dev-feature-scope-guard.js` — append-only 마커 검증 확장

### 3.3 IMPROVE — 리팩토링

- 책임 매트릭스를 `src/claude/core/_constants/bridge-phase-a-matrix.json`으로 분리
- Bridge/Phase A 에이전트가 동일 JSON 참조

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/agents/plan-bridge-writer.md` | 초안 마커 주입 + 매트릭스 참조 |
| `src/claude/dev/commands/dev-feature.md` | Phase A append-only 제약 |
| `src/claude/dev/hooks/dev-feature-scope-guard.js` | 마커 검증 추가 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/core/rules/phase-a-bridge-boundary.md` | 경계 규칙 SSOT |
| `src/claude/core/_constants/bridge-phase-a-matrix.json` | 책임 매트릭스 JSON |
| `tests/claude/plan/boundary/bridge-vs-phase-a.test.ts` | 회귀 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-bridge-writer.md` | 동등 초안 마커 |
| `src/codex/dev/commands/dev-feature.md` | 동등 append-only 제약 |
| `src/codex/core/rules/phase-a-bridge-boundary.md` | 동등 규칙 |

---

## 5. 검증 기준

### 5.1 단위 테스트

- [ ] Phase A가 Bridge 섹션 수정 시도 → 가드 차단
- [ ] Phase A 상세 섹션 append는 정상 허용
- [ ] Bridge 미완료 상태 Phase A 호출 시 에러
- [ ] 책임 매트릭스의 모든 5종 파일에서 경계 검증

### 5.2 회귀 시나리오

dash-preview-phase3 Bridge → Phase A 이행 복제:

- [ ] **중복 섹션 수정 건수 0** (원본 대비 감소)
- [ ] Bridge 초안 해시가 Phase A 후에도 유지 (append 외 변경 없음)
- [ ] Phase A 실행 시간 증가 < 10% (오버헤드 허용 범위)

### 5.3 후방 호환

- [ ] 기존 Feature Package 구조 미변경
- [ ] Bridge 초안 마커 없는 레거시 파일은 경고만 (기존 동작 유지)
- [ ] IMP-KIT-004 (bridge-writer) 산출 형식 호환

---

## 6. 롤백 시나리오

경계 강제가 과도하게 Phase A를 제약할 경우:

1. `dev-feature-scope-guard.js`에서 마커 검증을 경고 수준으로 하향
2. 규칙 문서는 유지 (가이드라인으로만 활용)
3. 책임 매트릭스 JSON도 유지 (차기 강화 시 재사용)

---

## 7. 연관 백로그

- **IMP-KIT-003, 004** (P0, 2.2.0 완료): plan-draft-writer · bridge-writer 신설 — 본 항목 선행
- **IMP-KIT-013** (P1): Dev 착수 Gate Draft 조기 플래그 — 경계 명확화와 같은 "Draft 단계 강화" 테마
- **IMP-KIT-014** (P1): stage-manifest 스키마 버전 — Phase 전환 경계 관리 공통

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Session 1 Layer 1) | claude-kit roadmap author |
