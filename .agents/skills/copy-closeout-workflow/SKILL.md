<!-- kit:managed source=src/codex/copy/skills/copy-closeout-workflow/SKILL.md hash=3c21339fdcf9030147b6586df40231ed4beb861527c8b68a6eaf79004b24ff70 -->
<!-- kit-convert generated: 2026-04-24 -->
---
name: copy-closeout-workflow
description: copy Feature closeout 프로세스 가이드
---

# Copy Feature Closeout

QA 검증을 통과한 Feature의 copy 충실도 작업을 완료 처리하는 프로세스이다.

## Closeout 프로세스

### 1. QA 결과 확인

- QA 결과 스키마의 `accepted: true` 확인
- P0/P1 잔여 이슈 0건 확인
- WARN 항목 목록 최종 검토

### 2. 잔여 리스크 기록

수용된 WARN 항목과 P2 이슈를 잔여 리스크로 기록한다.

- 각 리스크에 대한 수용 사유 명시
- 영향 범위와 발생 확률 기록
- 향후 개선 일정 (있을 경우) 명시

### 3. Stage Manifest 갱신

Feature의 stage manifest를 `closeout` 상태로 갱신한다.

- `stage`: `closeout`
- `closedAt`: 완료 시점 (ISO 8601)
- `qaResult`: QA 결과 요약 (PASS/WARN/FAIL 카운트)
- `residualRisks[]`: 잔여 리스크 목록
- `approver`: 승인자

### 4. Phase Gate 준비

plan 도메인의 phase gate에 제출할 산출물을 정리한다.

- Evidence 디렉터리 최종 상태 확인
- Gap Board 최종 스냅샷
- QA 결과 보고서
- 잔여 리스크 문서

### 5. 아카이브

완료된 Feature의 copy 산출물을 아카이브 경로로 이동한다.

- 원본 evidence, manifest, gap board, QA 결과를 번들링
- `.plans/archive/{slug}/copy/` 경로에 저장
- 원본 작업 디렉터리 정리

## 참조

- QA 검증 입력: `copy-qa-workflow` 스킬
- 파이프라인 전체 흐름: `copy-pipeline` 스킬
- plan 도메인 아카이브: `/plan-archive` 커맨드

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/copy/skills/copy-closeout-workflow/SKILL.md`
