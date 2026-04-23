# T-EPMV-03 — `/plan-epic advance` 게이트 자동 검증

**제안**: P-1 (EPMV)
**원본 피드백**: I-06 (Medium → P0 승격), N-07
**우선순위**: 🔴 P0 Critical (EPMV AREA 통합 실익)
**릴리스**: v2.4.1
**선행**: 없음
**후행**: T-EPMV-01

## 목적

Epic 상태 전이 게이트 조건을 `/plan-epic advance` 내부에서 자동 검증. 미충족 시 HARD FAIL + 구체 사유 + `--force` 옵션 안내. 게이트 미충족 전이 차단.

## 수행 내용

1. `plan-epic.md` advance 서브커맨드에 **게이트 검증 로직** 추가:

   | 전이 | 게이트 조건 |
   |------|-----------|
   | `draft → planning` | 자식 IDEA 최소 1 건 (frontmatter `Epic: EPIC-{ID}` 파일 수) + `00-epic-brief.md` + `01-children-features.md` 존재 |
   | `planning → active` | 자식 Feature approved 최소 1 건 (IDEA frontmatter `상태: approved`) |
   | `active → completed` | 자식 Feature 모두 completed (IDEA frontmatter `상태: archived` + Feature Package 존재) |
   | `completed → archived` | (수동, 정책상 별도 `/plan-archive` 경유) |

2. 검증 플로우:
   ```
   게이트 조건 체크
     ├─ PASS → 다음 단계 (T-EPMV-02 이동)
     └─ FAIL →
         ERROR: 게이트 미충족 — {구체 사유}
         SUGGEST: {권장 커맨드}
         USE --force TO OVERRIDE (Critical checkpoint 로그 기록)
   ```

3. `--force` 플래그 처리:
   - Critical checkpoint (`critical-checkpoints.json` 화이트리스트 해당) → `autoProceedOnPass` 무관 사용자 경고 표시
   - 사용자 명시 Y 시에만 진행
   - 로그: `~/.claude/logs/checkpoints.jsonl` 에 `{type: "critical-force", gate_condition: "..."}` 기록

4. 에러 메시지 예시:
   ```
   ERROR: 게이트 미충족 — planning → active 전이
   조건: 자식 Feature approved ≥ 1 (현재 0)
   SUGGEST: /plan-screen {idea-id} 진행 후 사용자 Go 승인
   USE --force TO OVERRIDE (경고 로그 기록)
   ```

## AC

- [ ] 각 전이별 게이트 조건 자동 검증 작동
- [ ] 미충족 시 HARD FAIL + 구체 사유 + 권장 커맨드 출력
- [ ] `--force` 플래그로 덮어쓰기 가능 (Critical checkpoint 경고 포함)
- [ ] `~/.claude/logs/checkpoints.jsonl` 에 force 사용 기록
- [ ] 게이트 PASS 시 정상 진행
- [ ] Activation 기준(plan-epic-hierarchy.md §2) 3 중 하나 이상 확인 로직 유지 (P-01 Positive Finding 보존)

## 파일

- 수정: `src/claude/plan/commands/plan-epic.md` (advance 게이트 섹션)
- 수정: `src/claude/plan/rules/plan-epic-hierarchy.md` (§4 상태 머신 게이트 조건 재확인)

## 롤백

게이트 검증 로직만 제거 → 기존 사용자 수동 판단으로 복귀. 파일 이동·링크 재작성(T-EPMV-01/02) 영향 없음.

## 검증 방법

```bash
# Case 1: 자식 IDEA 0 건 상태에서 draft→planning 시도
/plan-epic advance EPIC-TEST --to=planning
# → HARD FAIL: "자식 IDEA 0 건 (최소 1 필요)"

# Case 2: 자식 Feature approved 0 건에서 planning→active
/plan-epic advance EPIC-... --to=active
# → HARD FAIL: "자식 Feature approved 0 건 (최소 1 필요)"

# Case 3: --force 덮어쓰기
/plan-epic advance EPIC-... --to=active --force
# → Critical checkpoint 경고 → Y 입력 → 진행 + 로그 기록
```

## 보존 원칙

- **P-01 Epic Activation 기준**: 본 TASK 는 상태 전이 게이트 검증이지 Epic 생성 시 Activation 기준(3 중 하나 이상)과 **분리**. 두 검증 모두 유지.
- **P-16 Epic 상태 머신 명확성**: 게이트 조건을 **정량화 규칙**으로 자동 검증 → P-16 가치 강화.
