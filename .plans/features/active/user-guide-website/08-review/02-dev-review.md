# R1 `/dev-review`: User Guide Website Implementation Review

- **Feature**: `user-guide-website`
- **Status**: complete
- **Review type**: implementation and non-regression

## Review Summary

| 항목 | 판정 | 메모 |
| --- | --- | --- |
| Next.js route shell | PASS | 21개 route smoke 통과 |
| Existing test suite | PASS | `pnpm test`, 423 tests |
| Production build | PASS | `pnpm docs:build` |
| Protected path diff | PASS | core 기능 source 미변경 |
| Accessibility baseline | PASS | Runtime tab에 role/aria 적용 |
| Implementation documentation | PASS | source map, route/component/data inventory, verification runbook, commit handoff 추가 |
| Content parity | WARN | 상세 HTML 내용은 요약 반영 상태 |

## Findings

| 항목 | Severity | Confidence | Action | 메모 |
| --- | --- | --- | --- | --- |
| Next build lint 범위가 기존 Node hook 파일까지 확장됨 | high | confirmed | auto-fixed | `next.config.mjs`에서 build lint를 분리 |
| package publish 범위에 docs app이 포함될 수 있음 | medium | likely | queued | `files` 정책 후속 검토 필요 |
| command 상세의 표 정보가 기존 HTML보다 축약됨 | medium | confirmed | queued | content parity Feature로 보강 필요 |

## Non-regression Check

| 경로 | 변경 여부 |
| --- | --- |
| `src/claude/**` | 없음 |
| `src/codex/**` | 없음 |
| `src/templates/**` | 없음 |
| `scripts/setup.js` | 없음 |
| `.claude/**` | 없음 |
| `.agents/**` | 없음 |
| `.codex/**` | 없음 |

## 결론

구현은 1차 preview 가능한 상태다. `claude-kit` core 기능에는 영향이 없고, 다음 작업은 content parity와 Vercel Preview safety를 별도 Feature로 진행하는 것이 맞다.
