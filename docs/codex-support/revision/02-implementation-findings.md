# Codex Support Implementation Findings

> 기준 문서: [`implementation-plan.md`](../implementation-plan.md), [`00-codex-quickstart.md`](../00-codex-quickstart.md), [`01-asset-mapping-reference.md`](../01-asset-mapping-reference.md)

---

## Summary

현재 구현은 Codex 설치 골격 자체는 갖추었지만, 문서가 약속한 "Codex usable v1"을 완전히 충족하지는 못한다. 가장 큰 문제는 생성된 `hooks.json`이 실제로 존재하지 않는 스크립트를 가리킨다는 점과, `skills/commands/agents`가 Codex 경로로 복사되더라도 본문 내부는 여전히 `.claude`, `~/.claude`, `CLAUDE.md`를 광범위하게 참조한다는 점이다.

---

## Blocking

### 1. Codex hooks are generated, but the referenced runtime scripts are not installed

- 문서상 약속:
  - `hooks`는 Codex에서 `plugins/claude-kit/hooks.json`으로 부분 지원된다.
  - 필요 시 보조 스크립트를 함께 둔다.
- 현재 구현:
  - [`scripts/setup.js`](../../../scripts/setup.js)는 `hooks.json`에 `./scripts/dev-db-guard.js`, `./scripts/dev-tdd-guard.js`, `./scripts/edit-tracker.js` 같은 명령을 생성한다.
  - 하지만 Codex emitter는 `agents`, `commands`, `skills`만 복사하고 `scripts/` 디렉토리는 만들지 않는다.
  - smoke test에서도 `plugins/claude-kit/scripts/`가 생성되지 않았다.
- 근거 파일:
  - [`scripts/setup.js`](../../../scripts/setup.js)
  - [`scripts/codex-hook-compat.js`](../../../scripts/codex-hook-compat.js)
- 영향:
  - `hooks.json` 자체는 생성되지만, 실제 Codex 실행 시 hook command가 실패할 가능성이 높다.
  - 문서상 "부분 지원"이 사실상 "선언만 생성" 상태가 된다.
- 권장 조치:
  - Codex hook runtime에 필요한 스크립트를 plugin 내부 `scripts/`로 함께 설치하거나,
  - 실제로 실행 가능한 위치를 기준으로 `hooks.json` command를 다시 생성해야 한다.

### 2. `profile.json.targets` parsing is not robust on Windows BOM-encoded JSON

- 문서상 약속:
  - `profile.json.targets`로 `codex`, `claude`, `claude + codex`를 제어한다.
- 현재 구현:
  - [`scripts/setup.js`](../../../scripts/setup.js)는 `JSON.parse(fs.readFileSync(..., 'utf8'))`를 직접 사용한다.
  - Windows PowerShell 방식으로 BOM이 포함된 UTF-8 `profile.json`을 만들면 JSON parse가 실패하고, 설치기가 기본값 `["claude"]`로 되돌아간다.
  - 로컬 재현에서는 `{"targets":["codex"]}`를 넣었는데도 Claude만 설치되었다.
- 근거 파일:
  - [`scripts/setup.js`](../../../scripts/setup.js)
- 영향:
  - 사용자는 Codex 설치를 요청했지만 실제로는 Claude만 설치되는 오동작을 겪을 수 있다.
  - Windows 사용자 환경에서는 재현 가능성이 높다.
- 권장 조치:
  - JSON 읽기 전에 BOM 제거 유틸을 추가하거나,
  - `profile.json` 파싱을 BOM-safe 하게 바꿔야 한다.

---

## High

### 3. `skills`, `commands`, `agents` are copied to Codex, but many still contain Claude-only paths and context names

- 문서상 약속:
  - `skills`, `commands`, `agents`는 Codex에서 기본 지원 또는 full support로 설명된다.
- 현재 구현:
  - 설치기는 위 자산을 plugin으로 복사하지만, 본문 내부의 `.claude/`, `~/.claude/`, `CLAUDE.md` 참조는 거의 변환하지 않는다.
  - 예:
    - [`src/dev/commands/dev-handoff-verify.md`](../../../src/dev/commands/dev-handoff-verify.md)
    - [`src/dev/commands/dev-sync-docs.md`](../../../src/dev/commands/dev-sync-docs.md)
    - [`src/core/skills/continuous-learning/SKILL.md`](../../../src/core/skills/continuous-learning/SKILL.md)
    - [`src/core/skills/session-wrap/SKILL.md`](../../../src/core/skills/session-wrap/SKILL.md)
- 근거 파일:
  - [`01-asset-mapping-reference.md`](../01-asset-mapping-reference.md)
  - [`scripts/setup.js`](../../../scripts/setup.js)
- 영향:
  - 설치는 성공해도 실제 사용 단계에서 Claude 전용 경로를 따라가거나 잘못된 컨텍스트 문서를 찾게 된다.
  - 문서의 "full/basic support" 설명은 현재 구현보다 낙관적이다.
- 권장 조치:
  - 자산 분류를 `partial`로 낮추거나,
  - `.claude/...`, `~/.claude/...`, `CLAUDE.md`를 Codex 대응 경로로 치환하는 normalization 단계를 추가해야 한다.

### 4. Rules are documented as indirectly supported, but Codex output does not surface them

- 문서상 약속:
  - rules는 Codex에서 직접 배치하지 않더라도 `AGENTS.md` 또는 plugin 문서로 흡수/참조된다.
- 현재 구현:
  - [`src/templates/AGENTS.md.template`](../../../src/templates/AGENTS.md.template)는 원칙과 skill 위치만 설명하고 rules 파일이나 rule 성격을 전혀 드러내지 않는다.
  - Codex plugin에도 rules를 대체하는 문서 surface가 없다.
- 근거 파일:
  - [`implementation-plan.md`](../implementation-plan.md)
  - [`01-asset-mapping-reference.md`](../01-asset-mapping-reference.md)
  - [`src/templates/AGENTS.md.template`](../../../src/templates/AGENTS.md.template)
- 영향:
  - Claude의 핵심 governance rules가 Codex 컨텍스트에서 거의 사라진다.
  - `rules = partial`이 아니라 실제로는 `rules = undocumented / effectively missing`에 가깝다.
- 권장 조치:
  - 핵심 rules를 `AGENTS.md`에 요약 흡수하거나,
  - Codex용 별도 rule surface를 만들어야 한다.

---

## Medium

### 5. Codex-only metadata reports zero hooks even when `hooks.json` contains generated hook entries

- 문서상 약속:
  - `.claude-kit-meta.json`은 `targets`, `outputs`, `skippedForCodex`와 함께 Codex 결과를 기록한다.
- 현재 구현:
  - Codex-only 설치에서 `plugins/claude-kit/hooks.json`에는 5개 hook entry가 생성되지만,
  - metadata `components.hooks`는 `0`으로 기록된다.
  - `byDomain`에도 Codex hook 수가 반영되지 않는다.
- 근거 파일:
  - [`scripts/setup.js`](../../../scripts/setup.js)
- 영향:
  - 문서와 메타데이터가 어긋나고, 설치 결과를 메타데이터로 신뢰하기 어려워진다.
  - 이후 diff/review/reporting 자동화에 오차가 생긴다.
- 권장 조치:
  - Codex-only 경로에서 `components.hooks`와 `byDomain` hook 수를 별도로 채워야 한다.

---

## Low

### 6. Quickstart tree mentions plugin `assets/`, but current emitter does not create it

- 문서상 약속:
  - [`00-codex-quickstart.md`](../00-codex-quickstart.md)의 예시 트리에 `assets/`가 포함되어 있다.
- 현재 구현:
  - Codex emitter는 `agents`, `commands`, `skills`, `.codex-plugin`, `hooks.json`만 생성한다.
- 근거 파일:
  - [`00-codex-quickstart.md`](../00-codex-quickstart.md)
  - [`scripts/setup.js`](../../../scripts/setup.js)
- 영향:
  - 즉시 기능 오류는 아니지만, 사용자 기대와 설치 결과가 미묘하게 어긋난다.
- 권장 조치:
  - quickstart 예시 트리에서 `assets/`를 제거하거나,
  - 실제로 사용할 자산 폴더를 emitter에 추가해야 한다.

---

## Positive checks

다음 항목은 이번 리뷰 범위에서 문제 없이 확인됐다.

- `targets=["claude"]` 기본값 유지
- `targets=["claude","codex"]` 동시 설치 시 경로 충돌 없음
- 기존 `CLAUDE.md`, `AGENTS.md` 보존
- `.agents/plugins/marketplace.json` 병합 및 `claude-kit` 엔트리 dedupe
- `skippedForCodex`에 제외 훅 사유 기록


