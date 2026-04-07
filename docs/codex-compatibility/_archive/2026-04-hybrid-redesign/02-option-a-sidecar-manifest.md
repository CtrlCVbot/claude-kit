# Option A: Sidecar Manifest

> 각 자산 옆에 metadata 파일을 두어 Claude/Codex 처리 정책을 선언하는 최소 도입안.

---

## 1. 핵심 아이디어

모든 installable asset 옆에 sidecar metadata를 둔다.

- 파일 자산: `<name>.asset.json`
- skill 디렉터리: `asset.json`

예시:

```text
src/dev/commands/dev-feature.md
src/dev/commands/dev-feature.asset.json

src/dev/skills/dev-workflow/
  SKILL.md
  asset.json
```

설치기는 더 이상 “파일명만 보고” 판단하지 않고, sidecar manifest를 먼저 읽는다.

---

## 2. 제안 metadata 스키마

```json
{
  "kind": "hook",
  "domain": "dev",
  "targets": ["claude", "codex"],
  "codex": {
    "emitMode": "hook-json",
    "supportLevel": "full",
    "skipReason": ""
  },
  "hooks": {
    "phase": "PreToolUse",
    "matcher": "Edit|Write"
  },
  "docs": {
    "summary": "Blocks code edits when required planning artifacts are missing."
  }
}
```

고정 필드는 아래와 같다.

| 필드 | 의미 |
|------|------|
| `kind` | `agent`, `command`, `skill`, `hook`, `rule`, `template` |
| `domain` | `core`, `dev`, `plan` |
| `targets` | 지원 타깃 목록 |
| `codex.emitMode` | Codex에서 어떤 방식으로 내보낼지 |
| `codex.supportLevel` | `full`, `partial`, `none` |
| `codex.skipReason` | 미지원 또는 부분 지원 이유 |
| `hooks.phase` | hook 전용 phase |
| `hooks.matcher` | hook 전용 matcher |
| `docs.summary` | 사람이 읽는 짧은 설명 |

---

## 3. emitMode 제안

| kind | 대표 emitMode | 설명 |
|------|---------------|------|
| agent | `copy` | 파일을 타깃 경로로 그대로 복사 |
| command | `copy` | 파일을 타깃 경로로 그대로 복사 |
| skill | `copy-dir` | 디렉터리를 타깃 경로로 그대로 복사 |
| hook | `hook-json` | JS 파일 복사 + hooks.json 선언 생성 |
| rule | `agents-summary` | Codex용 `AGENTS.md` 요약 섹션에 반영 |
| template | `generate` | 타깃별 템플릿 생성 |

---

## 4. 장점

- 도입 비용이 가장 낮다.
- asset author가 책임을 바로 옆에서 진다.
- 새 자산 추가 시 “Codex는 어떻게 되지?”를 installer가 추론하지 않아도 된다.
- future migration에서 catalog 구조의 입력으로 그대로 사용할 수 있다.

---

## 5. 한계

- installer 내부 구조가 그대로면 로직 분산은 남는다.
- sidecar만 생기고 validate 단계가 약하면 누락을 늦게 발견할 수 있다.
- template/rule처럼 간접 반영 자산은 추가 규칙이 필요하다.

---

## 6. 언제 적합한가

다음 조건이면 Option A 단독 도입도 현실적이다.

- 우선 authoring discipline만 빠르게 만들고 싶다.
- setup.js 대규모 리팩터링은 다음 단계로 미루고 싶다.
- 새 자산의 Codex 처리 선언을 PR 단계부터 강제하고 싶다.

하지만 장기적으로는 Option B와 결합하는 것이 좋다.

---

## 7. 권장 사용법

- v1.1 단계에서 sidecar manifest를 먼저 도입한다.
- 기존 hardcoded 룰은 잠시 유지하되, 새 자산은 manifest 없이는 merge하지 않는다.
- 이후 installer는 manifest를 읽는 catalog 방식으로 천천히 리팩터링한다.
