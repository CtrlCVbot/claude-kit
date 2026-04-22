# T-PLUGIN-06 — 크로스 플랫폼 경로 해석

**제안**: P-2
**우선순위**: P0
**선행**: 없음
**후행**: T-PLUGIN-05

## 목적

`03-feature-impact.md §5` 플랫폼별 경로 차이 해결. Windows/macOS/Linux + `CODEX_HOME` 환경변수 지원.

## 수행 내용

1. `scripts/codex-paths.js` 유틸 모듈 신규 작성:
   - `getCodexHome()` — `process.env.CODEX_HOME` > `os.homedir() + '/.codex'`
   - `getConfigTomlPath()` — `${codexHome}/config.toml`
   - `getCacheRoot(source = 'local-kit')` — `${codexHome}/plugins/cache/${source}`
   - `getPluginCacheDir(source, version)` — `${cacheRoot}/claude-kit/${version}`
   - `getBackupRoot()` — `${codexHome}/tmp/plugin-cache-backups`
2. Windows 경로 구분자 처리 (`path.sep`, `path.join` 강제)
3. 존재하지 않으면 생성, 권한 오류 시 명확한 에러 메시지
4. `scripts/deploy-codex-cache.js`에서 전용 import

## AC

- [ ] `scripts/codex-paths.js` 존재
- [ ] Windows에서 `%USERPROFILE%\.codex\...` 정상 해석
- [ ] macOS/Linux에서 `~/.codex/...` 정상 해석
- [ ] `CODEX_HOME=/tmp/test-codex` 환경변수로 override 동작
- [ ] 유닛 테스트 3건 (Windows/macOS/override)

## 파일

- 신규: `scripts/codex-paths.js`
- 신규(선택): `scripts/codex-paths.test.js`

## 롤백

파일 삭제 단건. 의존 스크립트에서 fallback 필요.
