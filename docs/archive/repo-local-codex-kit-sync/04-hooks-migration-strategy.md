# Hooks source parity와 portability 전략

> **Status**: Archived draft plan (`docs/archive`, moved from `docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

hooks는 `src/claude/**/hooks/*.js`와 `src/codex/**/hooks/*.js`의 direct parity 여부를 판단해야 합니다. 단, Codex hooks는 공식 문서상 experimental이고 Windows support가 disabled이므로, direct parity와 runtime activation은 분리해서 판단합니다.

## 1. 판단 기준

hook 판단은 다음 네 파일/영역을 기준으로 합니다.

- `src/claude/**/hooks/*.js`
- `src/codex/**/hooks/*.js`
- `src/claude/_meta/codex-portability.json`
- `scripts/codex-hook-compat.js`

runtime `.claude/hooks/*.js`와 `plugins/claude-kit/hooks.json`은 검증 대상이지 source-of-truth가 아닙니다.

## 2. hook strategy vocabulary

| Strategy | 의미 | kit-sync 동작 |
|------|------|------|
| `paired-direct` | Codex hook source로 직접 대응 가능 | `src/codex/**/hooks/*.js` 생성/갱신 |
| `paired-fallback` | 직접 runtime parity는 어렵지만 intent 보존 가능 | skill/reference/docs fallback 생성 |
| `paired-review` | 공식/환경/동작 검증 필요 | 보고서에 review 항목으로 남김 |
| `blocked` | Codex에서 의미 보존 불가 | exception 등록, 사용자 판단 |

## 3. 현재 주요 hook 판단

| Hook | Claude source | Codex source 상태 | 전략 |
|------|------|------|------|
| `output-secret-filter.js` | `src/claude/core/hooks` | `src/codex/core/hooks` 있음 | `paired-direct`, runtime 검증 필요 |
| `dev-db-guard.js` | `src/claude/dev/hooks` | `src/codex/dev/hooks` 있음 | `paired-direct`, Bash matcher 중심 |
| `dev-tdd-guard.js` | `src/claude/dev/hooks` | `src/codex/dev/hooks` 있음 | `paired-direct`, Edit/Write matcher 검증 필요 |
| `dev-feature-scope-guard.js` | `src/claude/dev/hooks` | `src/codex/dev/hooks` 있음 | `paired-direct`, Edit/Write matcher 검증 필요 |
| `plan-doc-guard.js` | `src/claude/plan/hooks` | `src/codex/plan/hooks` 있음 | `paired-direct`, runtime install integrity 확인 필요 |
| `session-wrap-suggest.js` | `src/claude/core/hooks` | direct source 없음 | `paired-fallback`, skill fallback |
| copy hooks | `src/claude/copy/hooks` | direct source 없음 | `paired-review` |
| feedback hooks | `src/claude/core/hooks` | 일부 `src/codex/core/hooks` 있음 | `paired-review` 또는 direct 검증 필요 |

Audit note: 현재 `src/codex/core/hooks/code-quality-reminder.js`, `security-auto-trigger.js`, `edit-tracker.js`는 존재하지만 `src/claude/_meta/codex-portability.json`에는 `codexSource: null`로 남아 있는 항목이 있습니다. 이는 source parity 문제가 아니라 metadata drift일 수 있으므로 별도 상태로 판정해야 합니다.

## 4. `kit-analyze` 책임

`kit-analyze`는 hook에 대해 다음을 보고해야 합니다.

- Claude hook source 존재 여부
- Codex hook source 존재 여부
- portability manifest entry 존재 여부
- `scripts/codex-hook-compat.js` compatibility 결과
- generated hook output 영향 여부
- Windows/experimental 제약
- fallback target
- `metadata-drift`: Codex source 존재 여부와 portability manifest의 `codexSource` 불일치

출력은 source 기준이어야 하며, generated `plugins/claude-kit/hooks.json`만 보고 판단하면 안 됩니다.

## 5. `kit-sync` 책임

`kit-sync`는 hook에 대해 다음만 수행합니다.

| 조건 | 동작 |
|------|------|
| `paired-direct`이고 Codex source 없음 | `src/codex/**/hooks/*.js` 생성 후보 |
| `paired-direct`이고 drift 있음 | `src/codex/**/hooks/*.js` 갱신 후보 |
| `paired-fallback` | fallback skill/reference/docs 생성 또는 갱신 |
| `paired-review` | review report 생성, 자동 변환 보류 |
| `blocked` | exception registry 갱신 후보 |
| `metadata-drift` | `src/claude/_meta/codex-portability.json`의 `codexSource`, strategy, evidenceLevel 갱신 후보 |

`kit-sync`는 hook source가 이미 있는데 manifest가 뒤처진 경우 source를 다시 생성하지 않습니다. 먼저 portability metadata를 갱신하고, `scripts/codex-hook-compat.js`와 registry cross-check를 실행해야 합니다.

## 6. 설치 output과 hook activation

설치 단계에서는 source parity와 runtime activation을 분리합니다.

- source parity: `src/codex/**/hooks/*.js`와 portability metadata가 맞는가
- plugin output: `plugins/claude-kit/hooks.json`에 포함되는가
- direct-use output: `.codex/hooks.json`을 만들 것인가
- fallback output: skill/reference/docs로 안내할 것인가

v1은 `.codex/hooks.json` 자동 생성보다 fallback-first를 권장합니다. Codex hooks가 experimental이고 Windows disabled이기 때문입니다.

## 7. 검증 명령

- `node scripts/codex-hook-compat.js`
- `node scripts/setup.js --dry-run`
- hook reference integrity check: settings/output이 참조하는 hook 파일 존재 확인
- 필요 시 `pnpm test`
