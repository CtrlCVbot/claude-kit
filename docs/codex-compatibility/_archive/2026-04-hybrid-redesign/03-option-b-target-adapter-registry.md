# Option B: Target Adapter Registry

> 설치기를 `discover -> normalize -> validate -> emit`으로 재구성하고, Claude/Codex를 같은 catalog를 읽는 타깃별 emitter로 분리하는 구조안.

---

## 1. 핵심 아이디어

installer의 중심을 "파일 복사 스크립트"에서 "catalog 기반 배포 엔진"으로 바꾼다.

```text
src + metadata
  -> discover
  -> normalized asset catalog
  -> validate
  -> emit(claude)
  -> emit(codex)
```

이 구조에서는 Claude와 Codex가 서로 다른 예외 규칙 묶음이 아니라, 같은 asset catalog를 다르게 출력하는 adapter가 된다.

---

## 2. Catalog 형태 제안

```json
{
  "id": "dev.hook.dev-tdd-guard",
  "kind": "hook",
  "domain": "dev",
  "sourcePath": "src/dev/hooks/dev-tdd-guard.js",
  "targets": ["claude", "codex"],
  "docs": {
    "summary": "Blocks implementation without tests."
  },
  "claude": {
    "emitMode": "copy",
    "dest": ".claude/hooks/dev-tdd-guard.js"
  },
  "codex": {
    "emitMode": "hook-json",
    "supportLevel": "full",
    "dest": "plugins/claude-kit/hooks/dev-tdd-guard.js",
    "hookPhase": "PreToolUse",
    "hookMatcher": "Edit|Write"
  }
}
```

normalize 단계에서 이 구조를 만든 뒤 emitter는 catalog를 순회만 하면 된다.

---

## 3. 타깃별 emitter 책임

### Claude emitter

- `.claude/{category}`로 자산 복사
- `CLAUDE.md` 생성
- `.claude/settings.json` 생성 및 병합
- hook 선언을 Claude hook config로 변환

### Codex emitter

- `plugins/claude-kit/{category}`로 자산 복사
- `AGENTS.md` 생성
- `plugin.json`, `marketplace.json`, `hooks.json` 생성
- rule을 `AGENTS.md` 요약으로 반영
- skipped asset와 reason을 compatibility report에 기록

---

## 4. validate 단계에서 할 일

| 검사 | 실패 조건 |
|------|-----------|
| metadata 존재 | installable asset인데 manifest 없음 |
| kind 일치 | 파일 위치와 `kind`가 맞지 않음 |
| hook 계약 완결성 | hook인데 `phase`나 `matcher` 없음 |
| rule 반영성 | rule인데 Codex 처리 방식이 선언되지 않음 |
| target 일관성 | `targets`에는 codex가 있는데 `codex.supportLevel` 없음 |
| generated artifact 중복 | 두 asset이 같은 dest를 주장함 |

이 검사가 있어야 emitter는 단순해지고, 문제는 emit 전에 잡힌다.

---

## 5. 장점

- 설명 가능성이 높다. "왜 이렇게 설치됐는지"를 catalog로 보여줄 수 있다.
- hook/rule/template도 같은 모델 안에서 다룰 수 있다.
- dual-target diff를 metadata 차이만으로 설명할 수 있다.
- future target이 추가돼도 emitter만 늘리면 된다.

---

## 6. 비용과 리스크

- setup.js 리팩터링 범위가 커진다.
- 기존 hardcoded 동작을 catalog로 옮길 때 회귀 테스트가 필요하다.
- rule/template 같은 간접 자산은 첫 설계를 잘못하면 오히려 더 복잡해질 수 있다.

---

## 7. 적합한 위치

Option B는 최종 구조에 가장 가깝다. 따라서 권장안에서는 본체 구조로 채택한다. 단, authoring 규율은 Option A로 보강하고, 회귀 방지는 Option C로 보완해야 한다.
