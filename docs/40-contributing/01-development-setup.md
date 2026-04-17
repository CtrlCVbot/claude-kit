# Development Setup

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [../../package.json](../../package.json), [../../README.md](../../README.md)
> **Related**: [02-adding-a-component.md](02-adding-a-component.md)

claude-kit 저장소를 클론해 **기여자 환경** 을 세팅하는 가이드입니다. 단순 사용자는 [사용자 설치 가이드](../20-user-guide/01-installation.md) 를 보세요.

## 1. 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | `>=20.0.0` |
| 패키지 매니저 | pnpm (권장) |
| Git | 2.30+ |
| GitHub CLI (`gh`) | PR 생성·리뷰용 (선택) |
| Codex CLI | Codex 자산 테스트 시 (선택) |

## 2. 클론 & 의존성

```bash
git clone https://github.com/CtrlCVbot/claude-kit.git
cd claude-kit
pnpm install
```

`pnpm install` 은 단순히 `scripts/setup.js` 를 `postinstall` 로 실행합니다. 저장소 자체에도 `.claude/` 가 생성되어 개발 중 동작을 바로 체험할 수 있습니다.

## 3. 저장소 구조 요약

```
src/
  ├── claude/{core,dev,plan,copy}/    ← Claude 타깃 자산 SSOT
  ├── codex/{core,dev,plan}/          ← Codex 타깃 자산 SSOT
  ├── templates/                      ← 양 타깃 공용 템플릿
  ├── pairing-registry.json           ← Claude↔Codex 매핑
  └── exception-registry.json         ← skip 사유
scripts/                              ← 빌드·검증 Node 유틸
docs/                                 ← 문서 패키지 (재구축 중)
```

자세한 레이아웃: [../00-overview/03-architecture-at-a-glance.md](../00-overview/03-architecture-at-a-glance.md).

## 4. npm scripts

| Script | 용도 |
|--------|------|
| `pnpm install` (= `postinstall`) | `setup.js` 실행, `.claude/` 재생성 |
| `pnpm generate:quickstart` | `docs/guide/13-quick-start.md` 재생성 |
| `pnpm check:quickstart` | drift 검증 (CI 용) |
| `pnpm generate:docs` | `docs/30-reference/*.md` 6개 자동 생성 |
| `pnpm check:docs` | reference drift 검증 |

기타 수동 호출 유틸: `scripts/audit-*.js`, `scripts/codex-hook-compat.js`, `scripts/generate-sync-report.js` 등. 전체 목록: [../30-reference/08-cli-scripts.md](../30-reference/08-cli-scripts.md).

## 5. 저장소 자체 `profile.json`

claude-kit 저장소 루트의 `profile.json` 은 **개발 중 claude-kit 을 체험하는 용도** 입니다.

```json
{
  "domains": ["core", "dev", "plan", "copy"],
  "targets": ["claude"]
}
```

현재 활성 도메인이 바뀌면 저장소 내 `.claude/` 도 함께 갱신됩니다 (`pnpm install` 로 재실행).

## 6. 작업 브랜치 컨벤션

| 범주 | 브랜치명 |
|------|---------|
| 기능 | `feat/<scope>-<short-desc>` |
| 수정 | `fix/<scope>-<short-desc>` |
| 문서 | `docs/<scope>` |
| 리팩토링 | `refactor/<scope>` |

scope 예시: `core`, `dev`, `plan`, `copy`, `kit` (kit-* 자산), `scripts`, `docs`.

## 7. 커밋 스타일

저장소 기본은 Conventional Commits (`feat:`, `fix:`, `docs:` 등). 로컬 관행에 따라 한국어 서술형 커밋을 쓰는 사용자도 있으니 PR 가이드라인을 확인하세요.

## 8. 로컬 개발 루프

1. 브랜치 생성
2. `src/claude/{domain}/...` SSOT 수정
3. `pnpm install` 로 `.claude/` 재생성 (변경 반영)
4. Claude Code 세션에서 실제 커맨드/훅 동작 확인
5. 필요 시 `pnpm generate:docs` + `pnpm check:docs` 로 reference drift 검증
6. `pnpm check:quickstart` 로 quickstart drift 검증
7. `node scripts/audit-pairing.js` 로 pairing 일관성 확인 (듀얼 타깃일 때)
8. 커밋 + PR

## 9. IDE 통합

| IDE | 권장 |
|-----|------|
| VS Code | Claude Code 확장 (세션 안에서 `.claude/` 자동 로드) |
| JetBrains | Claude Code 플러그인 |
| 터미널 | Claude Code CLI (`claude code`) |

저장소 자체에 **`.vscode/` 설정은 최소로** 유지합니다. 개인 환경은 `.vscode/settings.json` 을 gitignore 하거나 user-level 설정으로.

## 10. 문제 발생 시

설치 실패·훅 미작동 등: [../20-user-guide/07-troubleshooting.md](../20-user-guide/07-troubleshooting.md) 참조. 저장소 자체의 추가 이슈는 GitHub Issues.

## 다음 단계

- [02-adding-a-component.md](02-adding-a-component.md) — 새 커맨드/에이전트/스킬/훅 추가
- [03-domain-authoring.md](03-domain-authoring.md) — 새 도메인 추가
- [05-quality-gates.md](05-quality-gates.md) — 기여 전 CI 게이트
