<!-- kit-convert generated: 2026-04-16 -->
# dev-continue — Codex Entry Flow

## Overview

이전 세션에서 진행 중이던 작업을 재개합니다.

## Workflow

1. 진행 중 작업 탐색: `.plans/features/` 또는 `git status`
2. 작업 문서 읽기 -- 전체 계획, 완료/미완료 태스크 파악
3. 현재 상태 확인 -- 마지막 완료 태스크, 다음 태스크
4. TDD 방식으로 미완료 태스크부터 재개

## Output

WORK RESUME: Feature명, 완료 N/M, 다음 태스크

## 주의

- 여러 작업 진행 중이면 사용자에게 선택 확인
- 컨텍스트 문서 반드시 확인 후 시작

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/dev/commands/dev-continue.md
