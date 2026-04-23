# Codex Manual-Hybrid Runtime Design Package

> 상태: draft
> 작성일: 2026-04-21
> 범위: `claude-kit`의 Codex 지원 구조를 `복제 중심`에서 `shared manual + native runtime 최소 유지` 구조로 전환하기 위한 설계 패키지

## 결론

이 패키지의 결론은 명확하다.

- Codex plugin 안에 Claude 자산 전체를 계속 복제하는 현재 구조는 유지보수 비용이 높다.
- 그렇다고 plugin 안에 매뉴얼만 넣고 Codex가 `.claude/` 자산을 그대로 runtime source처럼 읽게 만드는 구조도 공식 Codex surface와 맞지 않는다.
- 따라서 추천안은 `manual-first hybrid`다.

## 문서 맵

```text
kit-codex-manual-hybrid/
├─ README.md
├─ 00-executive-summary.md
├─ 01-official-surface-and-constraints.md
├─ 02-current-state-audit.md
├─ 03-target-architecture.md
├─ 04-migration-plan.md
└─ 05-verification-and-risks.md
```

## 권장 읽기 순서

1. [00-executive-summary.md](./00-executive-summary.md)
2. [01-official-surface-and-constraints.md](./01-official-surface-and-constraints.md)
3. [02-current-state-audit.md](./02-current-state-audit.md)
4. [03-target-architecture.md](./03-target-architecture.md)
5. [04-migration-plan.md](./04-migration-plan.md)
6. [05-verification-and-risks.md](./05-verification-and-risks.md)

## Terminology And Phase 0 Decisions

### Canonical terminology

- Canonical term: `shared manual`
- Allowed aliases: `공유 SSOT`, `공통 매뉴얼`, `공유 매뉴얼`
- 이 패키지는 `shared manual`을 기본 용어로 사용하고, alias는 legacy 표현 비교가 필요할 때만 사용한다.

### Phase 0 decisions captured in this package

- Reject `manual-only` as the target architecture.
- Adopt `manual-first hybrid` as the target architecture.
- Fix the canonical shared-manual source path to `src/shared/manuals/`.
- Treat Codex custom agents as `.codex/agents/*.toml`, not as direct runtime reuse of `.claude/agents/*.md`.
- Reframe the Codex plugin around `skills` plus optional compatibility assets instead of duplicating the whole Claude runtime surface.
- Preserve legacy `/dev-*`, `/plan-*`, `/copy-*` user language through routing and alias handling during migration.

## 의사결정자용 요약

- 승인할 구조 결정
  - `manual-only` 폐기
  - `manual-first hybrid` 채택
  - `src/shared/manuals/`를 canonical path로 고정
- 구현 전 선행 과제
  - official Codex documentation snapshot 고정
  - `src/codex` duplication A/B/C rubric 정의
  - legacy 명령어/용어 alias 전략 정의
- 성공 조건
  - Codex가 `.claude`에 runtime dependency 없이 동작
  - Codex plugin이 `skills` 중심 구조로 축소
  - 기존 사용자 언어가 router/alias를 통해 이해 가능

## 관련 문서

- [docs/10-features/04-multi-target.md](../../10-features/04-multi-target.md)
- [docs/20-user-guide/06-codex-dual-use.md](../../20-user-guide/06-codex-dual-use.md)
- [docs/30-reference/02-agents.md](../../30-reference/02-agents.md)
- [docs/30-reference/03-skills.md](../../30-reference/03-skills.md)
- [docs/30-reference/04-hooks.md](../../30-reference/04-hooks.md)
- [docs/30-reference/07-pairing-registry.md](../../30-reference/07-pairing-registry.md)

## Additional Artifact

- [06-src-codex-abc-classification.md](./06-src-codex-abc-classification.md)
- [artifacts/src-codex-abc-classification.csv](./artifacts/src-codex-abc-classification.csv)
