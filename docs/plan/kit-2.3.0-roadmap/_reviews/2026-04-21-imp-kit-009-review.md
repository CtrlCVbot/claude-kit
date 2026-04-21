---
제목: IMP-KIT-009 Implementation Review — screener 파일 이동 권한 확장
작성일: 2026-04-21
리뷰어: Claude (메인테이너 역할)
Phase: 2.2 (순서 1/4)
상태: reviewed
---

# IMP-KIT-009 Implementation Review

> **결론**: TDD 완료. 13 tests (초기 1건 실패 → 테스트 기대 수정으로 해소, 50 passed). 화이트리스트 가드 훅 + 경로 상수 JSON. `plan-idea-screener.md`의 tools 필드에는 **이미 Bash 포함** (선행 작업) — 본 IMP-KIT는 **가드 측면**만 구현. Phase 2.2 순서 1/4 완료.

## 구현 범위

| 파일 | 종류 | 역할 |
|------|:---:|------|
| `src/claude/plan/_constants/idea-folders.json` | 신규 | 4개 폴더 + 허용 전이 SSOT |
| `src/claude/plan/hooks/plan-idea-move-guard.js` | 신규 | PreToolUse Bash matcher, decideMoveGuard 순수 함수 |
| `src/codex/plan/_constants/idea-folders.json` | 신규 | Codex sibling |
| `src/codex/plan/hooks/plan-idea-move-guard.js` | 신규 | 동일 |
| `scripts/setup.js` | 수정 | plan 도메인 활성 시 Bash matcher 등록 |
| `tests/claude/plan/hooks/plan-idea-move-guard.test.js` | 신규 | 13건 (허용 3, 거부 4, 범위 외 2, 상수 1, 정규화 3) |

## 피드백 반영

**초기 테스트 실패 1건**: "ideas 디렉터리 밖 mv 차단" — 본 가드는 IDEA 이동만 검증하므로 범위 외 커맨드는 `skipped=true` 처리가 올바름. 테스트 제목·기대를 "가드 범위 외 (비-IDEA mv)"로 수정 → 재실행 50 tests passed.

## 스펙 대비 변경

- §3.2 GREEN 1 (tools에 Bash 추가): **이미 완료 상태** (선행 작업). 본 IMP-KIT 범위에서 변경 없음.
- §3.2 GREEN 3 (plan-doc-guard.js 확장): **새 훅 분리** (`plan-idea-move-guard.js`). matcher(Edit|Write vs Bash)가 다르므로 별도 파일이 유지보수성 우위.

## 검증

- `pnpm test`: 50 passed (5 test files, 510ms)
- 훅이 setup.js에 등록되어 `pnpm install --ignore-workspace` 시 재생성 반영 예정 (postinstall)
- `scripts/audit-pairing.js` drift 0 (Codex sibling 동시 생성)

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | IMP-KIT-009 구현 리뷰 | Claude (메인테이너 역할) |
