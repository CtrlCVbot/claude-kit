<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# copy-closeout — Codex Entry Flow

승인 + 잔여 리스크 기록.

## Overview

검증 완료 후 최종 승인을 처리하고, 잔여 리스크를 기록하여 copy 작업을 마감한다.

## Invocation

```
copy-closeout
```

## Preconditions

- `copy-verify` 실행이 완료되어 QA Result Report가 존재한다.
- Acceptance Readiness가 Ready 상태다 (Not Ready면 실행 거부).

## Workflow

1. QA Result Report에서 verification 결과를 확인한다.
2. 잔여 리스크를 식별하고 기록한다.
   - 수용된 P2 갭 (다음 스프린트 이관)
   - 알려진 제한 사항
   - 후속 개선 후보
3. `stage-manifest.json`에 closeout 상태를 기록한다.
   - `stage`: `closeout`
   - `closedAt`: 타임스탬프
   - `residualRisks`: 잔여 리스크 배열
4. 사용자에게 최종 승인을 요청한다.

## Output

- Closeout Memo (잔여 리스크 + 승인 기록)

## Rules

- Acceptance Readiness가 Not Ready이면 실행을 거부하고 `copy-verify`를 다시 안내한다.
- 사용자 승인 없이 closeout 상태를 기록하지 않는다.
- 잔여 리스크가 0건이어도 명시적으로 "잔여 리스크 없음"을 기록한다.
- closeout 이후에는 동일 slug에 대해 `copy-verify`를 다시 실행할 수 없다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-closeout.md
