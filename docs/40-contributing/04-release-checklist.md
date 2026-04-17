# Release Checklist

> **Status**: Draft (P4, 2026-04-17) — 뼈대. 관행 수집 후 확장 예정.
> **Source**: [../../package.json](../../package.json), 저장소 관행 (수집 중)
> **Related**: [05-quality-gates.md](05-quality-gates.md)

claude-kit 새 버전 릴리스 전에 확인할 체크리스트입니다.

## 1. 버전 결정

### 1.1 SemVer 기준

| 변경 종류 | 버전 증가 |
|----------|---------|
| 파괴적 변경 (도메인 제거, settings 스키마 변경) | MAJOR |
| 새 기능 (도메인 추가, 신규 커맨드/에이전트, 새 훅) | MINOR |
| 버그 수정, 문서, 리팩토링 | PATCH |

### 1.2 Pre-release

`2.2.0-rc.1` 같은 prerelease 는 실험적 변경에 사용. 일반 업데이트 경로 (`pnpm update claude-kit`) 에 자동으로 올라가지 않음.

## 2. 코드 게이트

전부 통과해야 릴리스 가능.

- [ ] `pnpm install` 정상 완료
- [ ] `pnpm check:docs` drift 0
- [ ] `node scripts/audit-pairing.js` 통과
- [ ] `node scripts/audit-drift.js` 통과
- [ ] `/kit-validate` 전체 자산 통과
- [ ] `/kit-audit` C7 cross-check 통과
- [ ] 샘플 프로젝트 설치 테스트 (새 환경에서 `pnpm add github:...` 실행)

## 3. 문서 게이트

- [ ] `package.json` 의 `version` 갱신
- [ ] `CHANGELOG.md` 에 새 버전 섹션 추가 (존재 시)
- [ ] `docs/README.md` 의 상태 표 갱신 (재구축 진행 중이라면)
- [ ] 파괴적 변경이 있으면 **업그레이드 가이드** 추가 (`docs/40-contributing/upgrade-guides/` 에)
- [ ] `docs/00-overview/04-decision-log.md` 에 주요 결정 반영

## 4. 듀얼 타깃 게이트

- [ ] Claude 타깃 자산이 Codex 에도 반영 (또는 `exception-registry` 에 skip 사유)
- [ ] `plugins/claude-kit/hooks.json` 에 Codex 호환 훅만 포함
- [ ] `AGENTS.md` 템플릿이 최신 도메인 반영

## 5. Pre-release 체크

릴리스 직전 한 번 더:

```bash
# 저장소 상태
git status              # clean?
git log --oneline -5    # 최근 커밋 확인

# 스크립트 게이트
pnpm install
pnpm check:docs
node scripts/audit-pairing.js
node scripts/audit-drift.js
```

## 6. 릴리스 실행

### 6.1 Git tag

```bash
git tag -a v2.2.0 -m "release v2.2.0: summary"
git push origin v2.2.0
```

### 6.2 GitHub Release

```bash
gh release create v2.2.0 --notes "$(cat CHANGELOG.md | head -50)"
```

또는 GitHub 웹 UI 에서 생성.

### 6.3 릴리스 노트

포함 사항:
- 주요 변경 (MAJOR/MINOR 분리)
- 파괴적 변경 + 마이그레이션
- 새 도메인/자산
- 버그 수정
- 기여자

## 7. 릴리스 후

- [ ] 샘플 프로젝트 업그레이드 테스트 (`pnpm update claude-kit`)
- [ ] Codex CLI 환경에서도 업데이트 동작 확인
- [ ] 이슈 트래커에서 관련 이슈 close
- [ ] `main` 브랜치의 `package.json` version 을 next dev 버전으로 올림 (선택)

## 8. 핫픽스 절차

배포된 버전에서 치명적 버그 발견 시:

1. `release/vX.Y.Z` 브랜치에서 직접 수정
2. 패치 번호 올림 (`vX.Y.Z+1`)
3. 핫픽스 커밋을 `main` 에도 cherry-pick
4. 릴리스 노트에 "Hotfix" 명시

## 9. 알려진 관행 (현행)

| 관행 | 상태 |
|------|------|
| Conventional Commits | 혼용 (영문 prefix + 한국어 서술) |
| `postinstall` 테스트 | 수동 |
| CI 자동 릴리스 | 미도입 |

관행은 시간에 따라 변합니다. 현행 관행은 최근 3-5개 커밋·PR 을 참조하는 것이 확실.

## 10. CHANGELOG 관행

현 시점 저장소에 공식 `CHANGELOG.md` 는 없습니다. 릴리스 이력은 git tag 와 GitHub Release 에 의존합니다. 채택 시 권장 형식 ([Keep a Changelog](https://keepachangelog.com/)):

```markdown
# Changelog

## [Unreleased]

### Added
- 새 기능

### Changed
- 기존 기능 변경

### Deprecated
- 향후 제거 예정

### Removed
- 이번 버전에서 제거됨

### Fixed
- 버그 수정

### Security
- 보안 이슈 수정

## [2.2.0] - 2026-04-XX

...
```

## 11. 릴리스 노트 템플릿

GitHub Release 본문:

```markdown
## Highlights
- (2~3 주요 변경 요약)

## Breaking Changes
- (있을 경우만)
- Migration: `docs/40-contributing/upgrade-guides/vX.Y.Z.md` 참조

## New
- (기능 추가)

## Improved
- (개선)

## Fixed
- (수정)

## Contributors
@user1, @user2, ...
```

## 12. 마이그레이션 가이드 작성 기준

파괴적 변경 (MAJOR) 시 `docs/40-contributing/upgrade-guides/vX.Y.Z.md` 신설. 포함 사항:

1. **무엇이 바뀌는가** — before/after 코드
2. **왜 바뀌는가** — 1–2문장 배경
3. **마이그레이션 단계** — 체크박스 목록
4. **자동화 가능한 부분** — sed/스크립트 예시
5. **롤백 절차** — 이전 버전으로 되돌리는 법

예: `.claude/settings.json` 구조 변경 시, 자동 마이그레이션 스크립트를 `scripts/migrate-vX.Y.js` 로 동봉.

## 13. 미도입 / 향후

- 자동 CI 파이프라인 (현재는 수동 체크)
- 자동 CHANGELOG 생성 (conventional commits 기반)
- Canary 릴리스 채널
- 설치 metric 수집
- `upgrade-guides/` 디렉터리 실제 도입

위 항목을 추가하고 싶다면 이슈 또는 PR 로 제안하세요.

## 다음 단계

- [05-quality-gates.md](05-quality-gates.md) — 게이트 세부 스크립트
- [03-domain-authoring.md](03-domain-authoring.md) — 도메인 추가 후 릴리스 연계
