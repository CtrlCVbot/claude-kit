<!-- kit-convert generated: 2026-04-24 -->
# 커밋 생성

현재 세션에서 변경한 파일을 분석하고 커밋을 생성합니다.

## 규칙
1. **Co-Authored-By 미포함** -- AI 작성 표시 절대 불포함
2. **Conventional Commits**: `<type>(<scope>): <제목>`
   - type: feat, fix, test, refactor, chore, docs
   - scope: 패키지명 또는 앱명
3. **본문 구조** (문제-원인-해결):
   - [문제] 현상/요구사항
   - [원인] 근본 원인
   - [해결] 선택한 방식 + 근거

## 절차
1. 빌드/테스트 검증 (packages/ 변경 시 전체, 단일 앱 시 해당 앱만)
2. `git status` + `git diff`로 변경 확인
3. 성격별 분리 커밋 (fix/feat/test/dev-refactor 혼재 시)
4. 커밋 메시지 생성 + 실행

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/commands/dev-commit.md`
