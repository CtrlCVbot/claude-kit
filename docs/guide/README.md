# claude-kit Guide

> Status: Active canonical guide package
> Support reference: [../30-reference/](../30-reference/)
> Historical baseline: [../archive/guide-package-baseline-20260424/README.md](../archive/guide-package-baseline-20260424/README.md)

`docs/guide/**`는 claude-kit 기본 가이드의 canonical package입니다. 이 패키지는 사용자 흐름과 maintainer 흐름을 섞지 않고, `shared / claude-code / codex / mapping / sync` 다섯 축으로 문서를 정리합니다.

## 읽는 순서

### 처음 보는 사용자

1. [shared/00-overview.md](shared/00-overview.md)
2. [shared/02-installation-and-configuration.md](shared/02-installation-and-configuration.md)
3. [shared/03-first-run-and-daily-workflow.md](shared/03-first-run-and-daily-workflow.md)

### Claude Code 중심 사용자

1. [claude-code/00-overview.md](claude-code/00-overview.md)
2. [claude-code/01-core-and-dev-domains.md](claude-code/01-core-and-dev-domains.md)
3. [claude-code/02-plan-pipeline.md](claude-code/02-plan-pipeline.md)

### Codex 병행 사용자

1. [codex/00-overview.md](codex/00-overview.md)
2. [codex/01-codex-dual-use.md](codex/01-codex-dual-use.md)
3. [mapping/01-claude-to-codex-surface-matrix.md](mapping/01-claude-to-codex-surface-matrix.md)

### maintainer

1. [sync/00-overview.md](sync/00-overview.md)
2. [sync/01-source-of-truth.md](sync/01-source-of-truth.md)
3. [sync/02-maintenance-workflow.md](sync/02-maintenance-workflow.md)
4. [sync/04-kit-maintenance-reference.md](sync/04-kit-maintenance-reference.md)

## guide 축

| 축 | 역할 | 대상 |
|---|---|---|
| [shared/](shared/00-overview.md) | 공통 개념, 설치, onboarding, troubleshooting | 모든 사용자 |
| [claude-code/](claude-code/00-overview.md) | Claude Code 중심 작업 흐름 | Claude Code 사용자, 작성자 |
| [codex/](codex/00-overview.md) | Codex runtime usage와 surface | Codex 사용자 |
| [mapping/](mapping/00-overview.md) | Claude/Codex 대응 관계와 parity 설명 | 두 환경을 함께 쓰는 사용자 |
| [sync/](sync/00-overview.md) | source of truth와 maintainer workflow | maintainer |

## support reference 원칙

- catalog성 정보는 [../30-reference/](../30-reference/)에 남겨 둡니다.
- guide 본문은 흐름과 의사결정을 설명하고, reference는 lookup을 담당합니다.
- historical 문서는 archive 아래에 보존하며 live source의 대체물로 취급하지 않습니다.
