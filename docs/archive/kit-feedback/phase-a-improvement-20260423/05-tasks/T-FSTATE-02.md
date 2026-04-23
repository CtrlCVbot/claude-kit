# T-FSTATE-02 — Feature/IDEA 상태 머신 SSOT 문서

**제안**: P-2 (FSTATE)
**원본 피드백**: I-14 (Medium → P1 승격), N-13
**우선순위**: 🟠 P1 High (T-FSTATE-01 선행)
**릴리스**: v2.4.1
**선행**: 없음
**후행**: T-FSTATE-01, T-PCC-01

## 목적

"상태" 라는 용어가 IDEA 레벨(4 종)과 Feature 레벨(4 종) 두 차원에 존재하지만 교차 관계 모호 → T-FSTATE-01 구현의 암묵적 규칙을 **문서화된 SSOT 로 승격**.

## 수행 내용

1. `src/claude/plan/rules/plan-epic-hierarchy.md` 에 새 섹션 추가:

   ```markdown
   ## 5. IDEA 상태 vs Feature 상태 (SSOT)

   "상태" 라는 용어가 두 차원에 존재. 혼동 방지를 위해 본 섹션을 SSOT 로 지정.

   ### 5-1. IDEA 상태 (IDEA frontmatter — SSOT)

   | 상태 | 의미 | Trigger |
   |:---:|---|---|
   | inbox | 등록만, 아직 평가 전 | `/plan-idea` (plan-idea-collector) |
   | screened | 스크리닝 완료, 사용자 판정 대기 | `/plan-screen` (plan-idea-screener) |
   | approved | 사용자 Go 승인, Feature 로 진행 | Critical checkpoint Y 입력 |
   | archived | 완료 후 아카이브 | `/plan-archive {slug}` |

   ### 5-2. Feature 상태 (Feature Package 레벨 — 파생, 자동 동기)

   | 상태 | 의미 | Trigger |
   |:---:|---|---|
   | pending | IDEA 등록 ~ 스크리닝 단계 | IDEA 상태 inbox/screened 시 |
   | approved | IDEA approved 와 1:1 동기 | IDEA approved 전이와 동기 (plan-state-sync.js) |
   | active | 구현 진행 중 (TASK 생성 후) | `/dev-feature {path}` 호출 |
   | archived | 구현 완료 + 아카이브 | IDEA archived 전이와 동기 |

   ### 5-3. 교차 관계 (상태 매핑)

   | IDEA 상태 | Feature 상태 |
   |-----------|------------|
   | inbox | pending |
   | screened | pending (변화 없음) |
   | approved | approved (1:1 동기) |
   | archived | archived |

   Feature `active` 상태는 IDEA `approved` 하위 단계 — IDEA 가 여러 Feature 로 분해되는 경우 없음 (1:1).

   ### 5-4. 상태 동기 주체 (SSOT)

   - **IDEA frontmatter** 가 SSOT
   - `plan-state-sync.js` hook 이 3 곳 자동 갱신:
     - backlog.md 행의 상태 컬럼
     - Epic `01-children-features.md` §1 F{N} **상태** 필드
     - Feature Package `08-epic-binding.md` §7 상태 동기 표
   - `/dev-feature` 호출 시 Feature 상태만 `approved → active` 전이 (IDEA 상태는 그대로 approved)
   ```

2. 상태 전이 다이어그램(텍스트) 추가:
   ```
   IDEA:     inbox → screened → approved → archived
              ↓         ↓          ↓         ↓
   Feature: pending → pending → approved → archived
                                   ↓
                                 active (/dev-feature 호출 시)
                                   ↓
                                 archived
   ```

3. `plan-epic-hierarchy.md` 기존 섹션과의 연결:
   - §4 "상태 머신" (Epic 상태) 는 유지 — Epic 상태 는 별도 차원
   - §5 (본 신규) 는 IDEA + Feature 2 종

4. 관련 에이전트·커맨드의 문서 갱신:
   - `plan-idea-collector.md`: "IDEA frontmatter SSOT 원칙" 명시
   - `plan-idea-screener.md`: inbox → screened 전이 Trigger
   - `plan-bridge-writer.md`: binding §7 표가 자동 갱신 대상임을 명시

## AC

- [ ] `plan-epic-hierarchy.md` §5 신규 섹션 존재 (≥50 줄)
- [ ] IDEA 상태 4 종 + Trigger 명시
- [ ] Feature 상태 4 종 + Trigger 명시
- [ ] 교차 관계 매핑 표 존재
- [ ] 상태 동기 주체 SSOT 명시 (plan-state-sync.js 참조)
- [ ] 상태 전이 다이어그램 존재
- [ ] 관련 에이전트 문서 3 개 갱신 (collector, screener, bridge-writer)

## 파일

- 수정: `src/claude/plan/rules/plan-epic-hierarchy.md` (§5 신규 섹션)
- 수정: `src/claude/plan/agents/plan-idea-collector.md`
- 수정: `src/claude/plan/agents/plan-idea-screener.md`
- 수정: `src/claude/plan/agents/plan-bridge-writer.md`

## 롤백

§5 섹션 제거 + 에이전트 참조 revert. 기존 암묵적 규칙으로 복귀.

## 보존 원칙

- **P-16 Epic 상태 머신 명확성**: Epic 상태와 분리하여 IDEA/Feature 상태 명확화 → P-16 가치 강화.
