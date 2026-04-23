# T-PLUGIN-05 — `scripts/deploy-codex-cache.js` 본체 구현

**제안**: P-2
**우선순위**: P0
**선행**: T-PLUGIN-04, T-PLUGIN-06
**후행**: T-PLUGIN-07, T-PLUGIN-08

## 목적

`04-proposal.md §3.3` 9단계 스크립트 구현. 커맨드(`/kit-deploy-codex`)의 실제 실행 엔진.

## 수행 내용

1. `scripts/deploy-codex-cache.js` 신규 작성 (Node 18+, ESM 또는 CJS — 기존 `scripts/` 스타일 따름)
2. 단계:
   - (1) plugin.json 존재·SemVer 검증
   - (2) config.toml 로드 + 엔트리 유효성
   - (3) 백업: `~/.codex/tmp/plugin-cache-backups/YYYY-MM-DD_HHMMSS/`
   - (4) target 디렉터리 준비 (존재 시 `--force` 없으면 throw)
   - (5) `plugins/claude-kit/` → `~/.codex/plugins/cache/<source>/claude-kit/<version>/` 복사
   - (6) 복사본 plugin.json 검증
   - (7) config.toml 엔트리 보장 (`enabled=true`)
   - (8) `/kit-audit C12` 실행 (`--skip-audit` 없으면)
   - (9) 사용자 출력: 다음 행동(앱 재시작) 안내
3. 에러 처리: 각 단계 실패 시 이전 상태로 복원 (트랜잭션 개념)
4. TOML 파싱 의존성: 가능하면 lightweight library(예: `@iarna/toml`) 또는 자체 파서

## AC

- [ ] `node scripts/deploy-codex-cache.js --dry-run` 성공 (실제 변경 없음)
- [ ] 실제 실행 시 9단계 모두 완수
- [ ] 단계 실패 시 에러 메시지가 해당 단계 번호 포함
- [ ] `--dry-run` 시 계획(복사 소스, 대상, 백업 경로, config.toml 변경 사항) 출력
- [ ] `--skip-backup` 경고 메시지 출력
- [ ] 유닛 테스트 3건 이상 (경로 해석, toml 파싱, 버전 비교)

## 파일

- 신규: `scripts/deploy-codex-cache.js`
- 신규(선택): `scripts/deploy-codex-cache.test.js` (vitest 또는 node:test)

## 롤백

파일 삭제 단건. 커맨드는 스크립트 미존재 시 명시적 에러 출력.
