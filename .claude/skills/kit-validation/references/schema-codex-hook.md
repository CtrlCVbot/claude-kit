# schema-codex-hook

> Codex 훅 컴포넌트 검증 스키마 (authoring source 검증)

## 대상

`src/codex/{domain}/hooks/{full_name}.js`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/codex/{domain}/hooks/{full_name}.js` |
| 파일명 패턴 | FAIL | `{domain}-{name}.js` (kebab-case) |
| package.json | FAIL | 동일 디렉토리에 `{"type": "commonjs"}` |

## 코드 패턴 (Claude 훅과 동일)

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| shebang | FAIL | `#!/usr/bin/env node` |
| JSDoc | FAIL | Hook, Event, Action |
| stdin 파싱 | FAIL | `process.stdin` + `JSON.parse` |
| fail-open | FAIL | catch에서 `process.exit(0)` |

## Codex 전용 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| Stop 이벤트 주의 | WARN | `Event: Stop` 사용 시 Codex runtime 호환 확인 필요 |
| Codex 등록 주석 | WARN | `hooks.json` 또는 `type: "command"` 언급 |
| codex-hook-compat 호환 | WARN | `scripts/codex-hook-compat.js`의 isCodexCompatible() 통과 |

## Codex hooks 제약 사항

| 항목 | 상태 |
|------|------|
| hooks 전체 | experimental |
| Windows | 현재 비활성화 |
| PreToolUse/PostToolUse matcher | 현재 runtime에서 `Bash`만 실질 매칭 |
| Stop 이벤트 | 공식 지원되나 runtime 구현 상태 확인 필요 |
| 등록 위치 | `~/.codex/hooks.json` 또는 `<repo>/.codex/hooks.json` |
