# T-PLUGIN-07 — 백업 + 롤백 로직

**제안**: P-2
**우선순위**: P0
**선행**: T-PLUGIN-05, T-PLUGIN-06
**후행**: T-PLUGIN-08

## 목적

guide §운영 원칙(62-68) + §롤백 방법(70-78)을 코드로 강제. PB-4/PB-5 해결.

## 수행 내용

1. `scripts/deploy-codex-cache.js`에 `--rollback` 모드 추가 (`04-proposal.md §3.4`):
   - 현재 활성 버전 탐지 (캐시 디렉터리 중 latest 또는 config.toml 참조)
   - SemVer 정렬로 직전 버전 식별
   - 현재 버전 디렉터리를 `.rolled-back-YYYYMMDD-HHMMSS` 접미사로 이름 변경
   - audit 재실행
2. 백업 로직:
   - 기본 경로: `~/.codex/tmp/plugin-cache-backups/YYYY-MM-DD_HHMMSS/<source>/claude-kit/<version>/`
   - 보존 기간 기본 90일, `CODEX_BACKUP_RETENTION_DAYS` 환경변수
   - 기한 초과 자동 삭제 (deploy 실행 시 청소)
3. `scripts/codex-paths.js`에 백업 관련 유틸 추가: `getBackupTimestamp()`, `cleanOldBackups(days)`

## AC

- [ ] `--rollback` 플래그로 직전 버전 활성화 확인
- [ ] 롤백 후 `/kit-audit C12` PASS
- [ ] 백업이 타임스탬프 경로로 생성
- [ ] 90일 초과 백업 자동 정리 (테스트에서 검증)
- [ ] 현재 버전이 1개뿐일 때 `--rollback` 시 명확한 에러

## 파일

- 수정: `scripts/deploy-codex-cache.js`
- 수정: `scripts/codex-paths.js`

## 롤백

`--rollback` 모드만 비활성화 (feature flag)
