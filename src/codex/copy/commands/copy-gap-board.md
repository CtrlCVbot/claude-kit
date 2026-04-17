<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# copy-gap-board — Codex Entry Flow

갭 우선순위 통합 보드.

## Overview

visual 갭과 interaction 갭을 통합하여 우선순위 기반 실행 후보 테이블을 생성한다.

## Invocation

```
copy-gap-board
```

## Preconditions

- Visual Gap Board가 존재한다 (`copy-visual-review` 완료).
- Interaction Gap Board가 존재한다 (`copy-interaction-review` 완료).

## Workflow

1. Visual Gap Board(VF-*)와 Interaction Gap Board(IF-*)를 로드한다.
2. 두 보드의 Gap Row를 우선순위 기준으로 통합 정렬한다.
3. 실행 후보 테이블을 생성한다 (Gap ID, 유형, 섹션, 심각도, 추정 공수).
4. P0/P1/P2로 최종 분류한다.
   - **P0**: 레이아웃 깨짐, 기능 차단 — 즉시 수정
   - **P1**: 시각/인터랙션 불일치 — 릴리스 전 수정
   - **P2**: 미세 조정 — 다음 스프린트 후보

## Output

- Prioritized Gap Board (통합 Gap Row 목록)
- Execution Candidate Table (실행 후보 테이블)

## Rules

- 한쪽 보드만 존재해도 실행 가능하지만, 누락된 보드를 경고한다.
- 동일 섹션의 VF/IF 갭은 그룹으로 묶어 표시한다.
- 우선순위 변경 시 사유를 기록한다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-gap-board.md
