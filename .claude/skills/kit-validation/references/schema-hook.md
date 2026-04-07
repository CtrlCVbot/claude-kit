# schema-hook

> 훅 컴포넌트 검증 스키마

## 대상

`src/claude/{domain}/hooks/{full_name}.js`

## 파일 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/claude/{domain}/hooks/{full_name}.js` |
| 파일명 패턴 | FAIL | `{domain}-{name}.js` |
| kebab-case | FAIL | `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` |
| package.json | FAIL | 동일 디렉토리에 `{"type": "commonjs"}` |

## 필수 코드 패턴

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| shebang | FAIL | `#!/usr/bin/env node` (첫 줄) |
| JSDoc Hook | FAIL | `* Hook:` 패턴 |
| JSDoc Event | FAIL | `* Event:` + `PreToolUse` / `PostToolUse` / `Stop` |
| JSDoc Action | FAIL | `* Action:` 패턴 |
| stdin 파싱 | FAIL | `process.stdin` 사용 |
| JSON 파싱 | FAIL | `JSON.parse` 사용 |
| toolName 추출 | WARN | `tool_name` 참조 |
| filePath 추출 | WARN | `file_path` 또는 `tool_input` 참조 |

## 이벤트별 검증

### PreToolUse

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(2) 존재 | FAIL | 차단 경로에 `process.exit(2)` |
| stderr 메시지 | WARN | `process.stderr.write` 사용 |
| exit(0) 통과 | FAIL | 정상 통과 경로에 `process.exit(0)` |
| fail-open | FAIL | catch에서 `process.exit(0)` |

### PostToolUse

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(2) 미사용 | FAIL | `process.exit(2)` 없어야 함 |
| exit(0) 사용 | FAIL | `process.exit(0)` 존재 |
| fail-open | FAIL | catch에서 `process.exit(0)` |

### Stop

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| exit(2) 미사용 | FAIL | `process.exit(2)` 없어야 함 |
| exit(0) 사용 | FAIL | `process.exit(0)` 존재 |
| stdin 주의 | WARN | Stop 이벤트는 stdin 데이터가 제한적 |

## 면제 패턴 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| EXEMPT_PATTERNS 존재 | WARN | 면제 배열 정의 (PreToolUse) |
| 정규식 유효 | WARN | 각 패턴이 유효한 RegExp |
