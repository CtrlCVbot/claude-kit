# T-SHOW-01 — `/plan-epic show` 집약 출력 개선

**제안**: P-8 (SHOW)
**원본 피드백**: I-13 (Medium), N-12
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: T-FSTATE-01 (실시간 상태 조회)
**후행**: T-SHOW-02

## 목적

`/plan-epic show EPIC-...` 를 실사용 가능한 집약 출력으로 개선. Phase 진행률 + 자식 Feature 상태 + 다음 Checkpoint 한 커맨드로 파악. Dry-Run 세션에서 0 회 사용 → 매번 사용 전환 목표.

## 수행 내용

1. `src/claude/plan/commands/plan-epic.md` 의 `show` 서브커맨드 출력 확장:

   ```bash
   $ /plan-epic show EPIC-20260422-001

   # Epic: dash-preview Phase 4 — Phase 3 피드백 반영
   - ID: EPIC-20260422-001
   - 상태: active
   - 기간: 2026-04-23 ~ 2026-05-20 (M-Epic-1: 05-06 / M-Epic-2: 05-14 / M-Epic-3: 05-20)
   - Phase 진행률: A (기획 완료, 8/9) / B (대기) / C (대기)

   ## 자식 Feature (5)

   | ID | 제목 | Phase | Lane | 상태 | TASK 진행 |
   |----|------|:---:|:---:|:---:|:---:|
   | F1 | 라이트 모드 (landing 전역) | A | Standard | approved | 0/8 |
   | F5 | UI 잔재 정리 | A | Lite | approved | 0/4 |
   | F2 | Mock 재설계 | B | Standard | pending | — |
   | F3 | 옵션↔요금 | C | Lite | pending | — |
   | F4 | 레이아웃+HitArea | B | Standard | pending | — |

   ## 다음 Checkpoint

   - Phase A Step 9 `/dev-feature` 진입 (사용자 지시 대기)

   ## 주요 링크

   - Epic Brief: .plans/epics/20-active/EPIC-20260422-001/00-epic-brief.md
   - Children Features: .plans/epics/20-active/EPIC-20260422-001/01-children-features.md
   - Active Features: .plans/features/active/{f1,f5}-.../
   ```

2. 집약 로직 구현:
   - Epic 상태: `.plans/epics/index.md` 해당 행에서 조회
   - Phase 진행률: `01-children-features.md` §4 Step 카운트 + 현재 위치 감지
   - Feature 상태: IDEA frontmatter `상태:` 조회 (plan-state-sync.js 의 SSOT 사용)
   - TASK 진행: `.plans/features/active/{slug}/dev-tasks.md` 진행률 집계 (T-FSTATE-01 확장)
   - 다음 Checkpoint: §4 로드맵에서 현재 완료 Step 다음 Step 추출

3. `--verbose` 플래그:
   - 기본: 위 집약 출력
   - verbose: Epic Brief §2 성공 지표 + 의존성 매트릭스 요약 추가

4. `/plan-epic list --status=active` 확장:
   - 현재 진행 중 Epic 일괄 조회
   - 각 Epic 의 Phase 진행률 요약 포함

5. `src/claude/plan/skills/plan-epic-workflow/SKILL.md` 수정:
   - "Epic 정보 빠르게 확인하려면 `show` 권장" 명시
   - 예시 출력 추가

## AC

- [ ] `/plan-epic show EPIC-...` 실행 시 Phase 진행률 + 자식 Feature 표 + 다음 Checkpoint 출력
- [ ] 자식 Feature 표 6 컬럼 (ID/제목/Phase/Lane/상태/TASK 진행)
- [ ] 상태는 IDEA frontmatter (SSOT) 기반 조회
- [ ] `--verbose` 플래그로 성공 지표 + 의존성 매트릭스 추가
- [ ] `/plan-epic list --status=active` 일괄 조회 작동
- [ ] `plan-epic-workflow/SKILL.md` 사용 권장 섹션 추가

## 파일

- 수정: `src/claude/plan/commands/plan-epic.md` (show/list 섹션 확장)
- 수정: `src/claude/plan/skills/plan-epic-workflow/SKILL.md`
- (참조) `src/claude/plan/hooks/plan-state-sync.js` (상태 SSOT 조회)

## 롤백

show/list 출력 로직 기본값(단순 파일 나열)으로 복귀. 집약 섹션 제거.

## 검증 방법

```bash
# Phase A 기획 완료 상태에서
/plan-epic show EPIC-20260422-001

# 출력 확인:
# - Phase 진행률 표시
# - 5 Feature 표 상태 컬럼 정확 (F1/F5 approved, F2/F3/F4 pending)
# - 다음 Checkpoint: Phase A Step 9

# 일괄 조회
/plan-epic list --status=active
# → 현재 active Epic 만 나열, 각 Phase 진행률 포함
```

## 보존 원칙

- **P-10 IDEA 생애주기 일관성**: IDEA frontmatter 를 Single Source of Truth 로 활용.
- **P-11 backlog.md 인덱스 역할**: show 가 backlog 의 Epic 관점 요약 제공.
