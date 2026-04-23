# T-PLUGIN-08 — `/kit-audit C12 (plugin-deploy-integrity)` 카테고리 신규

**제안**: P-3
**우선순위**: P0
**선행**: T-PLUGIN-02, T-PLUGIN-05, T-PLUGIN-06
**후행**: T-PLUGIN-10

## 목적

`04-proposal.md §4` 배포 무결성 검증 카테고리. PB-4/PB-5/PB-6 자동화.

## 수행 내용

1. `src/claude/core/commands/kit-audit.md`에 C12 카테고리 추가
2. 검증 항목 구현 (§4.1 참조):
   - C12-1: plugin.json 존재 + SemVer
   - C12-2: config.toml 엔트리 `[plugins."claude-kit@<source>"] enabled=true`
   - C12-3: `~/.codex/plugins/cache/<source>/claude-kit/<version>/` 디렉터리 존재
   - C12-4: 캐시 plugin.json version == repo plugin.json version
   - C12-5: `skills/`, `commands/`, `agents/`, `hooks.json` 존재
   - C12-6: 백업 디렉터리 존재 (WARN)
   - C12-7: 사용 중단된 source (`turner-copy` 등) 잔존 감지 (WARN)
3. `--fix` 동작:
   - C12-6: 디렉터리 자동 생성
   - C12-7: 경고 출력 (삭제는 수동)
4. `src/claude/core/skills/kit-validation/SKILL.md`에 C12 참조 추가

## AC

- [ ] `/kit-audit --category C12` 실행 성공
- [ ] 모든 검증(C12-1~C12-7) 수행
- [ ] FAIL/WARN/PASS 출력 명확
- [ ] `--fix`로 C12-6 자동 수정 확인
- [ ] 검증 로그에 plugin version, config.toml source 등 컨텍스트 포함

## 파일

- 수정: `src/claude/core/commands/kit-audit.md`
- 수정: `src/claude/core/skills/kit-validation/SKILL.md`
- 신규(선택): `src/claude/core/skills/kit-validation/references/schema-plugin-deploy.md`

## 롤백

C12 검증 함수를 no-op로 대체 (카테고리는 유지, 검증 skip)
