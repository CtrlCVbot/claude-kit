# T-PLUGIN-03 — `buildPluginBundle()` 빌드 스크립트

**제안**: P-1, P-5
**우선순위**: P0
**선행**: T-PLUGIN-02
**후행**: T-PLUGIN-04, T-PLUGIN-05

## 목적

`04-proposal.md §2.4` 빌드 로직 구현. `src/codex/` 자산을 `plugins/claude-kit/`에 복사·변환하여 배포 가능 상태 생성.

## 수행 내용

1. `scripts/setup.js`에 `buildPluginBundle(targetDir)` 함수 추가
2. 단계:
   - Clean `targetDir/{skills,commands,agents}/` (단 `.gitkeep` 보존)
   - `src/codex/*/skills/*` → `targetDir/skills/`
   - `src/codex/*/commands/*` → `targetDir/commands/`
   - `src/codex/*/agents/*` → `targetDir/agents/`
   - `targetDir/hooks.json` 생성 — `scripts/codex-hook-compat.js --output <target>/hooks.json` 호출
   - `targetDir/.codex-plugin/plugin.json`의 `version`을 `package.json`과 동기화
3. `package.json`에 스크립트 추가: `"build:plugin": "node scripts/setup.js --build-plugin"`
4. postinstall에서 `CLAUDE_KIT_BUILD_PLUGIN=1` 환경변수일 때만 자동 호출

## AC

- [ ] `pnpm run build:plugin` 성공
- [ ] `plugins/claude-kit/{skills,commands,agents}/` 채워짐
- [ ] `plugins/claude-kit/hooks.json` 생성됨
- [ ] 재실행 시 기존 내용 정리 후 재생성 (멱등)
- [ ] 다운스트림 postinstall 영향 없음 (기본 비활성 확인)

## 파일

- 수정: `scripts/setup.js`
- 수정: `scripts/codex-hook-compat.js` (출력 경로 파라미터화)
- 수정: `package.json` (scripts)

## 롤백

`buildPluginBundle()` 함수 제거 + `package.json` script 제거. opt-in이므로 기존 동작 무영향.
