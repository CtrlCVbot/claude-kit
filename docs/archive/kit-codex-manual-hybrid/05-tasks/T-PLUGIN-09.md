# T-PLUGIN-09 — `schema-plugin-manifest.md` + `/kit-validate --target plugin-bundle`

**제안**: P-4
**우선순위**: P1
**선행**: T-PLUGIN-02
**후행**: T-PLUGIN-08

## 목적

`04-proposal.md §5` `plugin.json` 전용 스키마 검증.

## 수행 내용

1. 신규 스키마 파일: `src/claude/core/skills/kit-validation/references/schema-plugin-manifest.md`
   - 필드: `$schema`, `name`, `version`, `description`, `interface.category`, `entry.*`
   - 필수 필드와 선택 필드 명확히 구분
2. `/kit-validate` 커맨드에 `--target plugin-bundle` 추가
3. `kit-validation` 스킬에 분기 로직: target=plugin-bundle → `plugins/claude-kit/.codex-plugin/plugin.json` 검증
4. 회귀 테스트: plugin.json 필드 빠뜨린 케이스 FAIL 확인

## AC

- [ ] `schema-plugin-manifest.md` 파일 존재 (≥60줄)
- [ ] `/kit-validate --target plugin-bundle` 실행 가능
- [ ] 유효한 plugin.json → PASS
- [ ] `name` 누락 시 FAIL (에러 메시지 명확)
- [ ] SemVer 위반 시 FAIL

## 파일

- 신규: `src/claude/core/skills/kit-validation/references/schema-plugin-manifest.md`
- 수정: `src/claude/core/commands/kit-validate.md`
- 수정: `src/claude/core/skills/kit-validation/SKILL.md`

## 롤백

`--target plugin-bundle` 분기 제거. 기존 타겟(claude, codex) 영향 없음.
