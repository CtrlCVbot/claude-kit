# T-PLUGIN-01 — `plugins/claude-kit/` 디렉터리 스캐폴드

**제안**: P-1
**우선순위**: P0
**선행**: 없음
**후행**: T-PLUGIN-02, T-PLUGIN-03

## 목적

`04-proposal.md §2.2` 디렉터리 구조를 claude-kit 소스 트리에 도입. guide §핵심 경로(17-21)의 repo plugin root 전제 충족.

## 수행 내용

1. `plugins/claude-kit/` 생성
2. 하위 4개 디렉터리 생성: `.codex-plugin/`, `skills/` (.gitkeep), `commands/` (.gitkeep), `agents/` (.gitkeep)
3. `plugins/claude-kit/README.md` 작성 — "이 디렉터리의 목적 / 빌드 방법 / 배포 방법"
4. `.gitignore`에 `plugins/claude-kit/skills/**`, `commands/**`, `agents/**`, `hooks.json` 제외 규칙 추가 (빌드 산출물)
5. `.gitkeep`은 커밋

## AC

- [ ] `plugins/claude-kit/` 디렉터리 존재
- [ ] `.codex-plugin/` 존재 (빈 디렉터리 OK, T-PLUGIN-02에서 채움)
- [ ] README.md 100줄 이상
- [ ] `.gitignore` 규칙 반영
- [ ] `git status` 깨끗 (`.gitkeep` 파일만 추가된 상태)

## 파일

- 신규: `plugins/claude-kit/README.md`
- 신규: `plugins/claude-kit/.codex-plugin/` (비어있음)
- 신규: `plugins/claude-kit/{skills,commands,agents}/.gitkeep`
- 수정: `.gitignore`

## 롤백

`rm -rf plugins/` + `.gitignore` revert
