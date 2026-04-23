# T-PLUGIN-04 — `/kit-deploy-codex` 커맨드 정의

**제안**: P-2
**우선순위**: P0
**선행**: T-PLUGIN-03
**후행**: T-PLUGIN-05, T-PLUGIN-08

## 목적

`04-proposal.md §3` guide 8단계 자동화를 위한 진입점 커맨드 정의.

## 수행 내용

1. `src/claude/core/commands/kit-deploy-codex.md` 신규 작성
2. 플래그 정의 (§3.2 참조):
   - `--dry-run`, `--version`, `--source`, `--rollback`, `--target-home`, `--force`, `--skip-backup`, `--skip-audit`
3. 동작: `scripts/deploy-codex-cache.js` Node 스크립트를 Bash로 invoke
4. 기본 source: `local-kit` (guide:7)
5. 실행 흐름을 `04-proposal.md §3.3` 9단계로 문서화

## AC

- [ ] 커맨드 파일 존재 (`src/claude/core/commands/kit-deploy-codex.md`)
- [ ] `/kit-deploy-codex --dry-run` 실행 시 계획 출력 (실제 변경 없음)
- [ ] 모든 플래그 문서화 + 예시 포함
- [ ] 커맨드 문서에 guide 원본 `file:line` 인용
- [ ] Agent가 호출 가능 (Task tool 목록에서 인식)

## 파일

- 신규: `src/claude/core/commands/kit-deploy-codex.md`

## 롤백

파일 삭제 단건
