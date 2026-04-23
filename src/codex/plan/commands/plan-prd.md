<!-- kit-convert generated: 2026-04-23 -->
<!-- REVIEW NEEDED: complex command -->
# plan-prd — Codex Entry Flow

## Overview

PRD 상세 작성. First-Pass 문서를 기반으로 10개 섹션의 상세 PRD를 생성합니다. 시나리오 C(충실도 교정)에서는 2-pass 모드를 지원합니다.

## Invocation

```
plan-prd {slug}                    # First-Pass 기반 PRD 생성
plan-prd {slug} --revise           # 리뷰 피드백 반영 수정
plan-prd {slug} --scope            # 시나리오 C: 범위 PRD (1차 — 어디를 분석할지)
plan-prd {slug} --detail           # 시나리오 C: 상세 PRD (2차 — 갭 데이터 기반)
```

## Workflow

1. **입력 로드**: `.plans/features/drafts/{slug}/first-pass.md` 읽기
2. **에이전트 스폰**: `plan-prd-writer` 에이전트를 Task tool로 스폰
   - 10개 섹션 PRD 작성: Overview, Problem, Goals, User Stories, Requirements, UX, Tech, Milestones, Risks, Success Metrics
   - 요구사항 ID 자동 채번: REQ-{feature}-{seq}
   - 비기능 요구사항 체크리스트 적용
3. **자동 리뷰**: `plan-review` 자동 호출 → PRD 품질 검증
4. **PCC-03 검증**: 기획 범위가 PRD에 반영되었는지 확인
5. **Human Checkpoint**: 승인/수정/반려
   - 승인 → `.plans/prd/00-draft/` → `10-approved/`로 승격
   - 수정 → 피드백 반영 후 재리뷰
   - 반려 → 사유 기록

## Output

- `.plans/prd/00-draft/{slug}-prd.md`
- 승인 시: `.plans/prd/10-approved/{slug}-prd.md`
- 시나리오 C 범위 PRD: `.plans/prd/00-draft/{slug}-scope-prd.md`
- 시나리오 C 상세 PRD: `.plans/prd/00-draft/{slug}-detail-prd.md` (갭 데이터 기반)
- 다음 단계 안내:
  - 일반: `plan-wireframe {slug}`
  - 시나리오 C 범위 PRD 승인 후: `copy-reference-refresh` → 갭 분석 → `plan-prd {slug} --detail`

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-prd.md
