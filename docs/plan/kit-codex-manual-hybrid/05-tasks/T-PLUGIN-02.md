# T-PLUGIN-02 — `.codex-plugin/plugin.json` 초기 파일

**제안**: P-1
**우선순위**: P0
**선행**: T-PLUGIN-01
**후행**: T-PLUGIN-03, T-PLUGIN-09

## 목적

`04-proposal.md §2.3` 스키마대로 초기 plugin.json 작성. guide §업데이트 절차 step 1(42-44)의 확인 항목 보장.

## 수행 내용

1. `package.json`에서 `name`, `version`, `description` 참조
2. `plugins/claude-kit/.codex-plugin/plugin.json` 작성:
   ```json
   {
     "$schema": "codex-plugin.v1",
     "name": "claude-kit",
     "version": "<from package.json>",
     "description": "AI governance toolkit for Claude + Codex",
     "interface": { "category": "governance" },
     "entry": {
       "skills": "skills/",
       "commands": "commands/",
       "agents": "agents/",
       "hooks": "hooks.json"
     }
   }
   ```
3. Codex 공식 스키마 필드 추가 필요 여부 조사 (기존 `build-frame/plugins/claude-kit/.codex-plugin/plugin.json` 샘플 대조, 있는 경우)
4. 조사 결과를 `02-problem-analysis.md §5` 모호성 테이블 업데이트

## AC

- [ ] `plugins/claude-kit/.codex-plugin/plugin.json` 존재
- [ ] `jq` 파싱 성공
- [ ] `version` 필드가 `package.json` `version`과 일치
- [ ] 공식 스키마 필드 조사 결과 문서화

## 파일

- 신규: `plugins/claude-kit/.codex-plugin/plugin.json`
- 수정: `docs/plan/kit-codex-manual-hybrid/02-problem-analysis.md` (§5 업데이트)

## 롤백

파일 삭제 단건
