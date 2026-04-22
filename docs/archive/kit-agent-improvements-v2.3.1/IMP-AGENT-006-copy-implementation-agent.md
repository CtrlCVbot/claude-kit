# IMP-AGENT-006 — copy-implementer 에이전트 신설

> **결론**: copy 도메인의 **4개 에이전트 중 3개가 read-only**인 비대칭 구조를 해소한다. 갭 분석(copy-fidelity, copy-interaction-fidelity) 결과를 소비해 실제 코드 수정을 수행할 `copy-implementer`를 신설한다.

**축**: Pipeline Completeness
**우선순위**: P1
**공수**: L
**Breaking Change**: **yes** (BC-2.3.1-03, 신규 에이전트)
**타깃 릴리스**: v2.3.1
**근거**: `analysis/agent-catalog-snapshot.md` 공백 #2
**관련 에이전트**: `copy-implementer` (신설), `copy-fidelity`, `copy-interaction-fidelity`, `copy-qa-reviewer`

---

## 1. 문제 (카탈로그 기반)

copy 도메인 4개 에이전트 분포:

| 에이전트 | tools | write? | 역할 |
|---|---|:---:|---|
| copy-reference-baseline | Read, Glob, Grep, Bash, Write | yes | evidence/ 파일 생성 (**한정**) |
| copy-fidelity | Read, Glob, Grep, Bash | **no** | Visual gap 분석 |
| copy-interaction-fidelity | Read, Glob, Grep, Bash | **no** | Interaction gap 분석 |
| copy-qa-reviewer | Read, Glob, Grep, Bash | **no** | QA 게이트 |

**결과**:
- 갭 분석 결과(VF-*, IF-* ID)를 소비해 **실제 코드를 수정할 에이전트 부재**
- 시나리오 C(Fidelity Correction)에서 `/copy-plan-unit` 이후 구현은 **메인 세션이 직접 담당** → dev 도메인과 동일한 비대칭

## 2. 에이전트 명세

### 2.1 frontmatter

```yaml
name: copy-implementer
description: copy-fidelity 및 copy-interaction-fidelity 갭 분석 결과를 소비해 Execution Unit 범위 내 코드 수정을 수행하는 구현 에이전트.
tools: [Read, Grep, Glob, Write, Edit, Bash]
model: opus
memory: project
color: orange
```

### 2.2 핵심 역할

```markdown
## Responsibilities

1. **Gap 소비**: `gap-board.md` 또는 copy-fidelity 출력을 읽어 P0/P1 항목 목록 파악
2. **Execution Unit 참조**: `/copy-plan-unit` 산출 문서의 Implement 단계 범위만 수정
3. **시각 보정 구현**: VF-* 항목에 대한 CSS/레이아웃/색상 수정
4. **인터랙션 보정 구현**: IF-* 항목에 대한 동작 수정 (hover/sticky/scroll/menu)
5. **variant 준수**: `SITE_VARIANT` 환경변수 기반 적용 범위 확인 (copy-variant.md 룰 준수)
6. **완료 보고**: 수정 파일 목록 + 잔존 항목 + evidence 재캡처 필요 여부 반환

## Constraints

- **Execution Unit 범위 초과 금지** — /copy-plan-unit 산출 문서의 Implement 섹션 외 파일 수정 금지
- **evidence/ 수정 금지** — copy-reference-baseline 전용 영역
- **gap 신규 생성 금지** — 분석은 copy-fidelity/interaction-fidelity 담당
- **QA 판정 금지** — copy-qa-reviewer가 최종 검증
- **variant 오작동 방지** — SITE_VARIANT 미설정 시 즉시 실패 (copy-variant.md 룰 준수)
```

### 2.3 체인 관계

```
copy-reference-baseline (evidence)
         ↓
copy-fidelity / copy-interaction-fidelity (갭)
         ↓
/copy-gap-board (P0/P1 정리)
         ↓
/copy-plan-unit (Execution Unit)
         ↓
copy-implementer (구현)  ← 신설
         ↓
copy-qa-reviewer (검증)
```

---

## 3. 시나리오별 호출

| 시나리오 | 호출 여부 | 비고 |
|---|:---:|---|
| A (Greenfield) | ✅ | copy-fidelity 분석 없이 바로 호출 가능 (승인된 디자인 기반) |
| B (Partial) | ✅ | 갭 분석 결과 소비 |
| C (Fidelity Correction) | ✅ | 주 사용 시나리오 |

**`/copy-plan-unit` 승인 후에만 호출**. 사전에 Execution Unit 범위 확정 필수.

---

## 4. dev-implementer(IMP-AGENT-005)와의 관계

| 축 | dev-implementer | copy-implementer |
|---|---|---|
| 도메인 | dev | copy |
| 가드 | dev-tdd-guard, dev-feature-scope-guard | copy-variant 룰, /copy-plan-unit 범위 |
| 입력 | TASK (T-AREA-NN) | Gap (VF-*, IF-*) + Execution Unit |
| 출력 | 테스트 + 구현 코드 | CSS/JSX 수정 + 재캡처 요청 |
| 공통 | TDD | — |

**공통 프레임**: IMP-AGENT-007(cross-domain handoff)에서 양 구현 에이전트 호출 패턴을 일관화.

---

## 5. Hybrid Feature 처리

copy-commands.md 룰에 따르면 Hybrid Feature는 reference-only 모드만 사용. copy-implementer는 **copy Feature 또는 시나리오 C 전용**:

```markdown
## Skip 조건

- Feature 타입이 `dev` — 본 에이전트 호출 금지, dev-implementer 사용
- Feature 타입이 `hybrid` + reference-only 모드 — 본 에이전트 호출 금지
```

---

## 6. 구현 범위

**신규 파일**:
- `src/claude/copy/agents/copy-implementer.md`
- `.claude/rules/copy-implementation-agent.md` — 체인·시나리오 매핑 SSOT

**수정 파일**:
- `src/claude/copy/commands/copy-plan-unit.md` — 완료 후 copy-implementer 호출 안내 추가
- `.claude/rules/copy-commands.md` — 시나리오별 순서에 copy-implementer 삽입
- `.claude/rules/verification.md` — write-capable 목록에 추가

**테스트**:
- Execution Unit 범위 초과 시 에이전트가 거부
- SITE_VARIANT 미설정 시 즉시 실패
- Hybrid Feature에서 호출 시도 시 거부

---

## 7. ROI

- **정방향**: copy 도메인 end-to-end 파이프라인 완성 (분석→계획→구현→QA)
- **측정**: 시나리오 C Fidelity Correction 평균 처리 시간 단축 (메인 세션 개입 최소화)
- **비용**: 에이전트 신설 1건 + 룰 1건 + 커맨드 수정 2건

---

## 8. 수락 기준

- [ ] copy-implementer.md 작성 (200~400 단어)
- [ ] Execution Unit 범위 초과 가드 명시
- [ ] SITE_VARIANT 필수 검증
- [ ] Hybrid Feature skip 조건 명시
- [ ] `/copy-plan-unit` 다음 단계로 연결
- [ ] verification.md write-capable 목록 업데이트

---

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — 카탈로그 공백 #2 해소 |
