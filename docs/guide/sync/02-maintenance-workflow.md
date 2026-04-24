# Maintenance Workflow

> Audience: maintainer
> Related: [01-source-of-truth.md](01-source-of-truth.md), [03-generated-output-boundaries.md](03-generated-output-boundaries.md), [../../30-reference/08-cli-scripts.md](../../30-reference/08-cli-scripts.md)

## 권장 순서

1. live source와 registry를 먼저 확인합니다.
2. 필요한 source를 수정합니다.
3. generated output을 재생성합니다.
4. docs, pairing, drift, compatibility 검증을 돌립니다.
5. runtime surface와 guide 설명이 서로 모순되지 않는지 점검합니다.

## 기본 gate

| gate | 목적 |
|---|---|
| `node scripts/docs-generate.js --check` | generated reference drift 점검 |
| pairing audit | Claude/Codex 대응 상태 점검 |
| artifact drift audit | emitted output drift 점검 |
| `node scripts/codex-hook-compat.js` | hook portability 검증 |
| `node scripts/setup.js --dry-run` | expected output routing 점검 |

## audience 경계

- maintainer-only toolchain은 일반 사용자 guide에 섞지 않습니다.
- `kit-*` 흐름과 runtime usage를 같은 문맥에서 설명하지 않습니다.