<!-- kit-convert generated: 2026-04-17 -->
# plan-review — Codex Entry Flow

## Overview

기획 산출물 리뷰. 아이디어, PRD, Wireframe, Feature Package의 품질을 검증합니다.

## Invocation

```
plan-review {path}                         # 특정 산출물 리뷰
plan-review {path} --type=prd              # PRD 전용 리뷰
plan-review {path} --type=wireframe        # Wireframe 전용 리뷰
plan-review --pcc {slug}                   # PCC 5종 일관성 검증
```

## Workflow

1. **대상 식별**: 리뷰 대상 문서의 유형과 경로 확인
2. **에이전트 스폰**: `plan-reviewer` 에이전트를 Task tool로 스폰 (READ-ONLY)
   - 산출물별 체크리스트 적용
   - 4축 평가: 완전성, 일관성, 실현가능성, 사용자 중심성
   - 이슈 severity 분류: CRITICAL / HIGH / MEDIUM / LOW
3. **PCC 검증** (--pcc 옵션 시):
   - PCC-01: Idea ↔ Screen
   - PCC-02: Screen ↔ Feature
   - PCC-03: Feature ↔ PRD
   - PCC-04: PRD ↔ Wireframe
   - PCC-05: Wireframe ↔ Stitch
   - PCC-06: Gap Board ↔ Detail PRD (copy 도메인 활성 + 시나리오 C에서만 적용)
4. **판정**: PASS / WARN / FAIL
5. **리뷰 리포트 출력**: 요약, 발견 사항, 권고, Approve/Revise/Reject 판정

## reviewPassed 상태 기록

PASS 판정 시, `.plans/stage-manifest.json`에 해당 단계의 reviewPassed 상태를 기록한다:

```json
{
  "{slug}": {
    "stages": {
      "P4": {
        "status": "done",
        "reviewPassed": true,
        "reviewedAt": "{YYYY-MM-DD}"
      }
    }
  }
}
```

이 상태는 `plan-bridge` pre-check와 `dev-feature` Phase A에서 참조된다.
- `reviewPassed: true` → 정상 진행
- `reviewPassed: false` 또는 미기록 → Bridge 실행 차단, `plan-review` 먼저 통과 필요

## Output

- 리뷰 리포트 콘솔 출력
- **PASS 시**: stage-manifest.json에 `reviewPassed: true` 기록
- 심각도별 이슈 목록과 개선 방향 제시
- FAIL 판정 시 수정 후 재리뷰 안내

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/plan/commands/plan-review.md
