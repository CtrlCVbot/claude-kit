# `docs/guide` 재구성 계획

> Status: Approved and executed
> Created: 2026-04-24
> Scope: `docs/archive`, `docs/plan`을 제외한 active docs 재구성
> Mapping: [01-current-to-guide-mapping.md](01-current-to-guide-mapping.md)

## 요약

- 추천안 A를 채택해 `docs/guide/**`를 canonical guide package로 신설했다.
- 기존 `00-overview`, `10-features`, `20-user-guide`, `40-contributing`, `docs/README.md`는 baseline bundle로 archive했다.
- `30-reference/**`는 active support reference로 유지하고 baseline snapshot만 별도 archive했다.
- old sections는 section-level bridge로 전환했다.

## 새 구조

- `guide/shared`
- `guide/claude-code`
- `guide/codex`
- `guide/mapping`
- `guide/sync`

## 운영 원칙

- guide는 흐름과 역할을 설명한다.
- reference는 lookup을 담당한다.
- archive는 historical baseline을 보존한다.
- generated output은 source of truth가 아니다.