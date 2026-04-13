# Conversion Overview

> 기존 Claude 자산을 Codex 자산으로 전환하는 기준만 설명하는 문서 세트의 진입점

## 목적

이 문서 세트는 `src/claude`에 이미 있는 기능을 읽어 `src/codex` authoring source로 전환하는 기준을 고정한다.

이번 세트의 중심은 아래 세 가지다.

- 무엇이 전환 입력인가
- 무엇으로 전환되는가
- 어디까지 자동으로 만들 수 있고 어디부터 사람이 봐야 하는가

## 기준선

- 입력은 `src/claude/{core,dev,plan}` 전체다.
- 출력은 `src/codex/{core,dev,plan}`의 conversion-generated authoring source다.
- `src/codex`는 runtime artifact가 아니라 수동 보정 가능한 authoring source다.
- `kit-create` 재설계, installer cutover, meta-tooling 상세 스펙은 이번 세트의 직접 범위가 아니다.

## 핵심 용어

| 용어 | 의미 |
|------|------|
| `Claude source` | 기존 `src/claude` 자산 |
| `Codex target` | Codex 공식 surface 기준 대응 형태 |
| `conversion output` | `src/codex`에 생성되는 sibling source |
| `auto-convert` | 기본 규칙만으로 초안 생성 가능 |
| `convert-with-review` | 초안 생성은 가능하지만 수동 보정 필요 |
| `codex-skip` | Codex 대응을 명시적으로 생략 |

## 읽는 순서

1. [01-conversion-goals-and-success-criteria.md](./01-conversion-goals-and-success-criteria.md)
2. [02-claude-source-baseline.md](./02-claude-source-baseline.md)
3. [03-guide-impact-audit.md](./03-guide-impact-audit.md)
4. [04-claude-to-codex-mapping.md](./04-claude-to-codex-mapping.md)
5. [05-codex-output-spec.md](./05-codex-output-spec.md)
6. [06-conversion-rules-and-manual-review.md](./06-conversion-rules-and-manual-review.md)
7. [07-pilot-migration-candidates.md](./07-pilot-migration-candidates.md)
8. [08-conversion-diagrams.md](./08-conversion-diagrams.md)
9. [09-follow-up-handoff.md](./09-follow-up-handoff.md)

## 금지할 전제

- 새 기능 생성 시 Claude/Codex 동시 생성이 1차 목표라고 쓰지 않는다.
- installer가 Claude 자산을 직접 해석해 Codex 기능을 만든다고 쓰지 않는다.
- `src/codex`가 이미 채워져 있다는 전제로 설명하지 않는다.
