<!-- kit-convert generated: 2026-04-24 -->
# 빌드 오류 자동 수정

빌드 오류를 탐지하고 자동 수정합니다.

## 절차
1. `pnpm turbo run build` 실행
2. 에러 출력 파싱 (파일 경로, 라인, 에러 코드)
3. 에러 유형별 자동 수정:
   - 타입 에러: 타입 수정/추가
   - import 에러: 경로 수정/모듈 추가
   - 누락 export: export 추가
4. 수정 후 재빌드 → 통과 확인
5. 3회 반복 후에도 실패 시 수동 개입 요청

## 출력
BUILD FIX REPORT
- 발견 에러 수, 자동 수정 수, 잔여 에러 수
- 수정된 파일 목록

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/commands/dev-build-fix.md`
