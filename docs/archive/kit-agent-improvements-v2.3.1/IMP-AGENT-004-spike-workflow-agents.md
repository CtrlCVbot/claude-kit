# IMP-AGENT-004 — Spike 워크플로우 에이전트 협력 계약

> **결론**: IMP-KIT-038(Spike 워크플로우 공식화, P0)과 IMP-KIT-036(1일 예산 hard cap)이 합의한 **"에이전트 신설 금지, 기존 조합 활용"** 원칙을 실제 운영 가능한 **협력 계약**으로 명시한다. plan-bridge-writer와 dev-architect의 역할 경계를 정의해 Spike skill 실행 시 암묵적 호출 관계를 해소한다.

**축**: Pipeline Completeness (파이프라인 공백)
**우선순위**: **P0**
**공수**: M
**Breaking Change**: no
**타깃 릴리스**: v2.3.1
**기반**: IMP-KIT-038 + IMP-KIT-036 (통합)
**관련 에이전트**: `plan-bridge-writer`, `dev-architect`

---

## 1. 문제 (증거 기반)

- IMP-KIT-038 decision-log §8-4 "에이전트 신설 금지" 원칙 채택:
  > 별도 `plan-spike-writer` 에이전트 신설은 Over-engineering으로 거부. 기존 `plan-bridge-writer` / `dev-architect` / 사용자 조합으로 충분
- 그러나 **어느 에이전트가 언제 무엇을 하는지 명시 없음** → 실제 skill 구현 시 호출 주체 모호
- IMP-KIT-036 "1일 예산 cap"을 **어느 에이전트가 감시**할지도 미정

## 2. 해결책

### 2.1 역할 분담 계약

| 단계 | 주체 | 산출물 | 권한 |
|---|---|---|---|
| 1. Spike 진입 판정 | plan-bridge-writer | `spike-plan.md` (skill 템플릿 소비) | Write |
| 2. Vertical slice 설계 | plan-bridge-writer | `spike-plan.md §2. 검증 대상` | Write |
| 3. 1일 Budget 감시 | (사용자 + skill 체크리스트) | spike-notes.md 타임스탬프 | — |
| 4. Day-End Go/No-Go 보조 | dev-architect | edit-coordinates로 결과 평가 | Read-only |
| 5. 비계획 이슈 TASK 승격 | plan-bridge-writer | spike-notes.md §2 + backlog 추가 | Write |
| 6. Spike 종료 브리지 | plan-bridge-writer | 기존 bridge 4종 문서 | Write |

**핵심 원칙**:
- **plan-bridge-writer가 Spike 전 구간 주관** (신설 없이 책임 확장)
- **dev-architect는 read-only 판정자** (기존 능력 범위 내)
- **Budget 감시는 에이전트가 아닌 skill 체크리스트** (사용자 주도)

### 2.2 skill 템플릿 연계

`plan-spike-workflow/SKILL.md` (IMP-KIT-038에서 신설)의 섹션과 에이전트 매핑:

```
## 1. Spike 진입 조건      → plan-bridge-writer 판정
## 2. Vertical Slice 범위   → plan-bridge-writer 작성
## 3. Budget (1일 hard cap) → 사용자 + skill 체크리스트
## 4. Day-End Review        → dev-architect (read-only)
## 5. Decision Forks        → plan-bridge-writer 문서화
## 6. 비계획 이슈            → plan-bridge-writer backlog 반영
## 7. 종료 브리지            → plan-bridge-writer bridge 4종
```

### 2.3 plan-bridge-writer 프롬프트 확장

추가 섹션:
```markdown
## Spike 모드 (선택적)

`plan-spike-workflow` skill 실행 시 본 에이전트가 전 단계 주관한다:

1. **진입 판정**: Feature Package의 routing metadata가 `spike: true` 또는 사용자가 `/plan-spike {slug}` 커맨드로 명시
2. **spike-plan.md 작성**: skill 템플릿에 제공된 섹션 순서 준수
3. **Day-End 직전**: dev-architect 호출 요청 (`subagent_type: dev-architect, prompt: "spike-plan.md §2 검증 결과를 평가"`)
4. **비계획 이슈**: `.plans/ideas/00-inbox/` 에 `SPIKE-{AREA}-NN` 형식 TASK로 자동 등록 (IMP-KIT-015 네이밍 준수)
5. **종료 브리지**: Spike 산출물을 기존 bridge 4종에 반영 (`§2 검증된 가정`, `§3 불확실성 잔존`)
```

### 2.4 dev-architect 프롬프트 확장 (경미)

추가 한 줄:
```markdown
## Spike Day-End 판정 (선택 호출)

plan-bridge-writer가 Day-End 시점에 본 에이전트를 호출하면, spike-plan.md §2 검증 대상을 read-only로 평가하고 `edit-coordinates` 없이 **텍스트 판정만** 반환 (Go / No-Go / Extend 1일).
```

---

## 3. IMP-KIT-038/036과의 관계

| 기존 IMP | 본 IMP 처리 |
|---|---|
| IMP-KIT-038 (P0) | skill + command 신설은 IMP-KIT-038이 담당. 본 IMP는 **에이전트 협력 계약 부분**만 재해석 |
| IMP-KIT-036 (P1) | Budget cap은 skill 체크리스트 + 사용자 책임으로 귀속. 에이전트는 감시하지 않음 (Over-engineering 방지) |

**parent-child 관계**:
- IMP-KIT-038 parent
- IMP-AGENT-004 child (에이전트 계약 부분)
- IMP-KIT-036 sibling (Budget 영역)

---

## 4. 구현 범위

**파일**:
- `src/claude/plan/agents/plan-bridge-writer.md` — `## Spike 모드` 섹션 추가
- `src/claude/dev/agents/dev-architect.md` — `## Spike Day-End 판정` 한 줄 추가
- `src/claude/plan/skills/plan-spike-workflow/SKILL.md` (IMP-KIT-038에서 신설) — 에이전트 호출 포인트 명시
- `.claude/rules/spike-workflow-agents.md` — 본 IMP의 계약 요약 SSOT

**테스트**:
- `/plan-spike {slug}` 실행 시 plan-bridge-writer가 모든 단계 주관 확인
- Day-End 시점에 dev-architect가 read-only로 호출되고 edit-coordinates 반환 없음
- 비계획 이슈가 `SPIKE-{AREA}-NN` 형식으로 backlog 등록
- 1일 초과 시 skill이 경고 (에이전트는 관여하지 않음)

---

## 5. ROI

- **정방향**: Spike 워크플로우 암묵적 호출 관계 해소 → 실제 실행 가능
- **측정**: Spike skill 첫 3회 실행에서 에이전트 호출 실패·혼선 0건
- **비용**: 2개 에이전트 프롬프트 섹션 각 1개. 신설 에이전트 0건

---

## 6. 수락 기준

- [ ] plan-bridge-writer `## Spike 모드` 섹션 추가
- [ ] dev-architect `## Spike Day-End 판정` 한 줄 추가
- [ ] `.claude/rules/spike-workflow-agents.md` SSOT 신설
- [ ] SPIKE-{AREA}-NN TASK ID 규칙이 IMP-KIT-015와 일치
- [ ] Budget 감시는 에이전트가 아닌 skill 체크리스트로 유지 (Over-engineering 방지 검증)

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-KIT-038 + 036 에이전트 계약 재해석 |
