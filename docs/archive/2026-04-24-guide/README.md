# claude-kit 문서 안내

> Status: Active bridge
> Canonical entry: [guide/README.md](guide/README.md)
> Archive bundles: [guide-package-baseline-20260424](archive/guide-package-baseline-20260424/README.md), [reference-package-baseline-20260424](archive/reference-package-baseline-20260424/README.md)
> Planning record: [plan/guide-restructure-20260424](plan/guide-restructure-20260424/README.md)

`docs/guide/**`가 이제 claude-kit 기본 가이드의 canonical entry입니다. 기존 `00-overview`, `10-features`, `20-user-guide`, `40-contributing` 문서는 baseline bundle로 archive되었고, 현재 위치는 새 guide로 연결하는 bridge 역할만 남깁니다.

## 빠른 진입

| 목적 | 읽기 시작 |
|---|---|
| 처음 이해하기 | [guide/shared/00-overview.md](guide/shared/00-overview.md) |
| 설치와 설정 | [guide/shared/02-installation-and-configuration.md](guide/shared/02-installation-and-configuration.md) |
| Claude Code 중심 사용 | [guide/claude-code/00-overview.md](guide/claude-code/00-overview.md) |
| Codex 병행 사용 | [guide/codex/00-overview.md](guide/codex/00-overview.md) |
| Claude/Codex 대응 관계 | [guide/mapping/00-overview.md](guide/mapping/00-overview.md) |
| maintainer용 sync 규칙 | [guide/sync/00-overview.md](guide/sync/00-overview.md) |
| lookup/reference | [30-reference/README.md](30-reference/README.md) |

## 기존 섹션

| 기존 경로 | 현재 역할 | 이동 위치 |
|---|---|---|
| [00-overview/](00-overview/README.md) | bridge | `guide/shared`, `guide/mapping`, `guide/sync` |
| [10-features/](10-features/README.md) | bridge | `guide/claude-code`, `guide/codex`, `guide/mapping` |
| [20-user-guide/](20-user-guide/README.md) | bridge | `guide/shared`, `guide/claude-code`, `guide/codex` |
| [30-reference/](30-reference/README.md) | active support reference | lookup 전용 유지 |
| [40-contributing/](40-contributing/README.md) | bridge | `guide/claude-code`, `guide/sync` |

## 참고

- baseline snapshot이 필요하면 [guide-package-baseline-20260424](archive/guide-package-baseline-20260424/README.md)부터 보세요.
- guide 재구성 의도와 매핑 기준은 [guide-restructure-20260424](plan/guide-restructure-20260424/README.md)에 정리되어 있습니다.