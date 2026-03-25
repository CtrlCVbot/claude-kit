# /plan-review

기획 산출물 리뷰. 아이디어, PRD, Wireframe, Feature Package의 품질을 검증합니다.

## Usage

```
/plan-review {path}                         # 특정 산출물 리뷰
/plan-review {path} --type=prd              # PRD 전용 리뷰
/plan-review {path} --type=wireframe        # Wireframe 전용 리뷰
/plan-review --pcc {slug}                   # PCC 5종 일관성 검증
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
4. **판정**: PASS / WARN / FAIL
5. **리뷰 리포트 출력**: 요약, 발견 사항, 권고, Approve/Revise/Reject 판정

## Output

- 리뷰 리포트 콘솔 출력 (파일 미생성 — 읽기 전용 에이전트)
- 심각도별 이슈 목록과 개선 방향 제시
- FAIL 판정 시 수정 후 재리뷰 안내
