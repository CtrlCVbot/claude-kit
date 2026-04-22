# T-HYBRID-10 — .codex/agents/*.toml 도입

**Phase**: 4 (커스텀 에이전트 채택)
**우선순위**: P1
**선행**: T-HYBRID-05, T-HYBRID-09
**후행**: T-HYBRID-12

## 목적

기획 `03-target-architecture.md:54-99` Codex 공식 custom agents surface(`.codex/agents/*.toml`) 채택. 최소 2개 에이전트로 검증.

## 수행 내용

1. `src/shared/manifests/agents.json` 기반으로 `.codex/agents/*.toml` 자동 생성 로직
2. 초기 대상 2개: `reviewer`, `planner` (또는 palette 판단)
3. TOML 포맷 정의:
   ```toml
   name = "reviewer"
   description = "Code review agent"
   system_prompt = "..."
   tools = ["read", "grep"]
   ```
4. Codex 런타임에서 실제 discovery + 실행 확인

## AC

- [ ] `.codex/agents/reviewer.toml`, `planner.toml` 존재
- [ ] AGENTS.md routing 표에서 참조
- [ ] Codex 런타임 실행 로그로 동작 확인 (AC-5)
- [ ] `agents.json` → toml 생성기 `scripts/` 하위에 추가

## 파일

- 신규: `.codex/agents/reviewer.toml`
- 신규: `.codex/agents/planner.toml`
- 신규: `scripts/generate-codex-toml.js` (가칭)

## 롤백

`.codex/agents/` 디렉터리 삭제 → 기존 `src/codex/{D}/agents/*.md` 유지 상태로 복원.
