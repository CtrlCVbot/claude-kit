# T-PCC-01 — PCC 항목 확장 (Epic 계층 반영)

**제안**: P-6 (PCC)
**원본 피드백**: I-10 (Medium), N-14
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: T-FSTATE-01 (상태 SSOT 구현), T-FSTATE-02 (상태 머신 문서)
**후행**: 없음

## 목적

`plan-reviewer` PCC 5 종을 Epic 계층 특유 검증 3 종으로 확장. PCC-07(binding 양방향) + PCC-08(상태 SSOT) + PCC-09(의존성 매트릭스).

## 수행 내용

1. `src/claude/plan/agents/plan-reviewer.md` 프롬프트에 3 검증 항목 추가:

   ```markdown
   ### PCC-07: Epic Binding 양방향 무결성

   검증 항목:
   - Feature `08-epic-binding.md` §1 Epic ID / 경로 / 상태 라인
   - ↔ Epic `01-children-features.md` §1 F{N} 의 IDEA 필드
   - ↔ Epic `00-epic-brief.md` §3 자식 Feature 목록
   - 양쪽 모두에서 참조 존재 + 상태 일치
   - 불일치 시 FAIL + 권장 수정

   예시:
   - Feature binding §1: "Epic: EPIC-20260422-001, 상태: active"
   - Epic Children §1 F5: "IDEA: IDEA-20260423-001, 상태: approved"
   - 양쪽 일치 여부 확인

   ### PCC-08: Feature 상태 SSOT 동기

   검증 항목:
   - IDEA frontmatter `상태:` (SSOT)
   - ↔ backlog.md 행 상태 컬럼
   - ↔ Epic Children §1 F{N} **상태** 필드
   - ↔ binding §7 상태 동기 표의 현재 시점 row
   - 4 곳 일치 여부

   불일치 시:
   - FAIL + 어느 파일이 stale 인지 명시
   - `plan-state-sync.js` hook 실행 권장 (T-FSTATE-01)

   ### PCC-09: 의존성 매트릭스 현재성

   검증 항목:
   - Epic `01-children-features.md` §2 의존성 매트릭스에 명시된 관계 (`✓`, `→`, `X`, `△`)
   - ↔ §3/§4 Phase 실행 순서 정합
   - 예: F5 ↔ F2 `→` (F5 선행) 인데 두 Feature 가 같은 Phase A 에 배치되면 WARN

   불일치 시:
   - WARN (FAIL 아님) + 해소 권장 (Phase 재배치 또는 매트릭스 수정)
   ```

2. v2.5.0 에서는 **WARN 수준** 우선:
   - PCC-07: FAIL (무결성 기본)
   - PCC-08: WARN (hook 자동 해소 권장)
   - PCC-09: WARN (사용자 판단 존중)
   - v2.5.1 이후 FAIL 승격 고려

3. `src/claude/plan/skills/plan-review-criteria/SKILL.md` 수정:
   - PCC 8 종 총목록 (기존 5 + 신규 3)
   - Epic 계층 검증 섹션 신설

4. `src/claude/plan/hooks/plan-epic-integrity.js` 와의 일관성:
   - hook Phase 3 enable 시점에 PCC-07~09 로직과 동일 (중복 구현 방지)
   - hook 은 cross-reference 무결성만, PCC 는 전체 품질 (겹치는 항목 PCC-07)

## AC

- [ ] `plan-reviewer.md` 에 PCC-07~09 명시
- [ ] 각 PCC 에 검증 항목 + FAIL/WARN 레벨 명확
- [ ] `plan-review-criteria/SKILL.md` 에 PCC 8 종 목록
- [ ] 실제 PRD 검증 실행 시 8 종 모두 수행
- [ ] `plan-epic-integrity.js` 와 중복 로직 방지 확인
- [ ] v2.5.1 FAIL 승격 계획 문서화

## 파일

- 수정: `src/claude/plan/agents/plan-reviewer.md`
- 수정: `src/claude/plan/skills/plan-review-criteria/SKILL.md`
- (참조 동기) `src/claude/plan/hooks/plan-epic-integrity.js` — 로직 중복 확인

## 롤백

PCC-07~09 섹션 제거 → 기존 5 종 유지. PCC 확장 없이 복귀.

## 보존 원칙

- **P-06 plan-reviewer PCC 5 종 품질 보장**: 기존 5 종 유지 (확장만).
- **P-07 Read-only 에이전트 분리**: plan-reviewer 는 여전히 read-only (PCC 추가로 권한 변경 없음).
