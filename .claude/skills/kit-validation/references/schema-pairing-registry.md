# schema-pairing-registry

> pairing-registry (`src/pairing-registry.json`) 검증 스키마 (codex-sync cross-phase review CC5)

## 대상

`src/pairing-registry.json`

## 구조 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| 파일 존재 | FAIL | `src/pairing-registry.json` |
| JSON 유효 | FAIL | `JSON.parse` 성공 |
| `$schema` 필드 | FAIL | `"pairing-registry-v1"` |
| `description` 필드 | WARN | 비어있지 않은 문자열 |
| `entries` 배열 | FAIL | 배열 타입 (비어있어도 OK) |

## Entry 필드 검증

| 필드 | 수준 | 기준 |
|------|------|------|
| `identity` | FAIL | 존재 + 비어있지 않음 |
| `type` | FAIL | enum: `skill` / `agent` / `command` / `hook` / `rule` |
| `domain` | FAIL | enum: `core` / `dev` / `plan` |
| `status` | FAIL | enum: `paired` / `codex-skip` / `codex-native-only` / `unpaired` |
| `reason` | WARN | status=codex-skip/codex-native-only일 때 비어있지 않음 |
| `claude` | WARN | null 또는 존재하는 파일 경로 string |
| `codex` | WARN | null 또는 존재하는 파일 경로 string |
| `createdAt` | WARN | ISO 8601 타임스탬프 |
| `lastSyncedAt` | INFO | ISO 8601 타임스탬프 또는 null (kit-convert가 변환/재변환 시 기록) |
| `contentHash` | INFO | Claude source SHA-256 앞 8자 hex 또는 null (kit-convert가 변환 시 기록) |

## 무결성 검증

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| identity 중복 없음 | FAIL | `identity` 값이 유일 |
| `status=paired` + `claude` 파일 존재 | FAIL | 파일이 실제 존재 |
| `status=paired` + `codex` 파일 존재 | FAIL | 파일이 실제 존재 |
| `status=codex-skip` + `reason` 필수 | FAIL | reason이 null이 아니고 비어있지 않음 |
| `status=codex-native-only` + `claude=null` | FAIL | Codex 전용이므로 Claude source는 null이어야 함 |
| `status=codex-native-only` + `codex` 파일 존재 | FAIL | 파일이 실제 존재 |

## 조건부 무결성 검증 (codex-sync cross-check)

> codex-sync Phase 4 (03-sync-pipeline-design.md §7.1 vocabulary mapping)과 cross-check.

| 검증 항목 | 수준 | 기준 |
|-----------|------|------|
| `status=paired` ↔ exception-registry `strategy=paired-direct` + `status=resolved` | WARN | 두 registry entry가 모순 없음 |
| `status=codex-skip` ↔ exception-registry `strategy=blocked` | WARN | 의미 일치 |
| rule type entry 없음 | INFO | rule은 pairing-registry에 등록하지 않음 (codex-sync Phase 2 결정, merge snippet이므로) |
| paired-fallback entry 없음 | INFO | fallback artifact는 pairing-registry에 등록하지 않음 (exception-registry + fallbackTarget만으로 추적) |

## S4 silent failure 감지 (CC3 참조)

다음은 JSON.parse만으로 감지 불가한 enum/value 오류 예시:

- `type: "paired"` — 잘못된 type enum (paired는 status 값이지 type이 아님) → FAIL
- `status: "active"` — 잘못된 status enum (active는 exception-registry status) → FAIL
- `status: "paired"` + `claude: null` + `codex: null` — paired인데 양쪽 모두 null → FAIL
- `identity: "EX-007"` — exception-registry ID를 identity로 사용 (identity는 component 이름) → FAIL

즉시 실행 가능한 검증 명령:

```bash
node -e "
  const d = JSON.parse(require('fs').readFileSync('src/pairing-registry.json','utf8'));
  const fs = require('fs');
  const validTypes = ['skill','agent','command','hook','rule'];
  const validStatus = ['paired','codex-skip','codex-native-only','unpaired'];
  let fail = 0;
  for (const e of d.entries) {
    if (!validTypes.includes(e.type)) { console.log('FAIL type:', e.identity, e.type); fail++; }
    if (!validStatus.includes(e.status)) { console.log('FAIL status:', e.identity, e.status); fail++; }
    if (e.status==='paired') {
      if (!e.claude || !fs.existsSync(e.claude)) { console.log('FAIL paired claude missing:', e.identity); fail++; }
      if (!e.codex || !fs.existsSync(e.codex)) { console.log('FAIL paired codex missing:', e.identity); fail++; }
    }
    if (e.status==='codex-skip' && !e.reason) { console.log('FAIL codex-skip no reason:', e.identity); fail++; }
  }
  console.log(fail===0 ? 'PASS: pairing-registry valid' : 'FAIL: ' + fail + ' violations');
"
```
