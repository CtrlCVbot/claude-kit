# T-PLUGIN-10 — `docs/codex-deployment.md` 사용자 문서

**제안**: P-2, P-3
**우선순위**: P1
**선행**: T-PLUGIN-04, T-PLUGIN-05, T-PLUGIN-07, T-PLUGIN-08
**후행**: 없음 (릴리스 준비)

## 목적

다운스트림 프로젝트(build-frame, mologado 등)가 참조할 **공식 배포 가이드** 작성. guide 문서 내용을 claude-kit 기능 기반으로 재작성.

## 수행 내용

1. `docs/codex-deployment.md` 신규 작성:
   - 섹션 1: 개요 + 캐시 기반 운영 원칙
   - 섹션 2: 최초 배포 (`/kit-deploy-codex` 사용법)
   - 섹션 3: 업데이트 (새 버전 배포)
   - 섹션 4: 롤백 (`--rollback` 사용법)
   - 섹션 5: 검증 (`/kit-audit C12`)
   - 섹션 6: 크로스 플랫폼 주의사항 (Windows/macOS/Linux + `CODEX_HOME`)
   - 섹션 7: 트러블슈팅 (자주 발생하는 오류 + 대응)
   - 섹션 8: FAQ (marketplace 모드 언제 복귀하나? `turner-copy` 어떻게 처리하나? 등)
2. 원본 guide(`build-frame/docs/claude-kit/codex-plugin-source-guide.md`)를 **Upstream 참조**로 인용
3. `CLAUDE.md` + `README.md`에 링크 추가

## AC

- [ ] `docs/codex-deployment.md` 존재 (≥200줄)
- [ ] 8개 섹션 모두 작성
- [ ] guide 원본을 `file:line` 인용으로 참조
- [ ] Windows/macOS/Linux 경로 예시 각 1건 포함
- [ ] CLAUDE.md + README.md에 링크

## 파일

- 신규: `docs/codex-deployment.md`
- 수정: `CLAUDE.md`
- 수정: `README.md`

## 롤백

문서 삭제 + 링크 revert
