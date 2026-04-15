# Sync Pipeline Design

## 1. 목적

`/kit-sync`, `/kit-analyze`, `/kit-convert`가 `skip` 중심이 아니라 `artifact-first` 변환을 수행하도록 파이프라인과 상태 모델을 재설계한다. 이때 direct 여부는 "동일한 이름의 기능이 있는가"가 아니라 "공식 문서상 허용 범위 안에 있는가"를 기준으로 판단한다.

이 문서는 구현 변경안 문서다. 아래 내용은 아직 live behavior를 설명하지 않으며, 문서 승인 후 반영 여부를 결정할 대상이다.

## 2. 파이프라인의 한계 (Phase 0 시점 진단)

> 본 표는 본 문서 작성(Phase 0) 시점의 진단이다. ✓로 표시한 항목은 후속 Phase에서 이미 해결됨.

| 한계 | 설명 | 해결 상태 |
|---|---|---|
| `rule = skip` 고정 | `conversion-rules.md`에서 `rule`이 구조적으로 no-op로 처리된다. | ✓ Phase 2 해결 (commit `9cdbbbc`, `3d64eb9`): `paired-fallback` / `status=resolved` 전환 + AGENTS.md.template inline merge |
| `hook` direct 판정이 과도하게 단순 | 공식 hook 존재 여부와 runtime parity 문제를 분리하지 못한다. | ✓ Phase 1 부분 해결 (commit `957fb8d`): `HOOK_PORTABILITY` 4-tier strategy 도입. 추가 분류 보강은 Phase 3 |
| evidence 기록 부재 | 왜 direct인지, 왜 fallback인지 공식 근거를 남기지 않는다. | ✓ Phase 1 해결 (commit `c794351`): exception-registry에 `evidenceLevel` / `officialSurface` / `docConstraints` 필드 도입 |
| stale registry | resolved 예외가 skip 기준에 남아 false skip을 만든다. | ✓ Phase 1 해결: skip-registry.md 서술형 view 강등, exception-registry SSOT 확정 |
| fallback artifact 부재 | 사람이 이어받을 최소 초안이 남지 않는다. | ✓ Phase 2 해결 (rule artifact). hook fallback artifact는 Phase 3 |

## 2.1 문서 기준 개선 포인트

- 현재 구현 설명과 목표 구현 설명을 같은 시제로 쓰지 않는다.
- resolver가 공식 근거를 기록해야 한다는 요구를 문서상 먼저 고정한다.
- fallback artifact를 "삭제 대신 남기는 기록"으로 설명한다.
- registry SSOT와 설명용 문서를 분리해서 표현한다.

## 3. 제안 파이프라인

```text
source inventory
  -> normalization
  -> official-surface check
  -> strategy resolution
  -> artifact generation
  -> registry sync
  -> validation/report
```

### 3.1 Source Inventory

- `src/claude/{domain}` authoring source 수집
- 기존 `src/codex/{domain}` sibling 상태 확인
- `exception-registry`, `pairing-registry` 로드

### 3.2 Normalization

각 항목에 아래 정보를 붙인다.

- `identity`
- `type`
- `domain`
- `runtimeDeps`
- `portability`
- `officialSurface`
- `officialBasis`
- `docConstraints`
- `evidenceLevel`
- `recommendedStrategy`

### 3.3 Official-Surface Check

resolver는 먼저 공식 surface 자체와 제약을 판정한다.

| 확인 항목 | 예시 |
|---|---|
| 기능 존재 여부 | Hooks, Rules, `AGENTS.md`, Skills |
| 의미 일치 여부 | guidance rule vs exec-policy rule 구분 |
| 범위 제약 | `Bash` only, Windows 제한, event 범위 |
| platform 제약 | 2026-04-15 기준 Hooks on Windows 제한 |

### 3.4 Strategy Resolution

기존 `auto/review/skip` 대신 아래 상태를 사용한다.

| 상태 | 의미 |
|---|---|
| `direct` | 공식 surface와 제약 범위 안에서 direct 변환 |
| `fallback` | repo-level artifact로 의미를 보존하는 변환 |
| `review-needed` | 초안은 생성하지만 runtime 검증 또는 수동 판단이 남은 변환 |
| `blocked` | 안전한 산출물 생성조차 어려운 예외 |

`direct`는 반드시 `officialSurface`와 `docConstraints`를 함께 통과해야 한다.

## 4. Evidence Level

resolver는 각 항목에 아래 `evidenceLevel`을 기록한다.

| 값 | 의미 |
|---|---|
| `공식 지원` | 공식 surface와 의미가 비교적 직접 맞는다. |
| `우회 가능` | 공식 surface는 있지만 1:1 매핑이 아니며 repo-level fallback이 더 적합하다. |
| `추정` | 공식 기능 조합으로 만들 수는 있어 보이지만 공식 recipe는 없다. |
| `검증 필요` | 공식 surface는 있으나 runtime 범위나 동작 재현 가능성을 추가 확인해야 한다. |

## 5. Artifact Generation

| 유형 | direct 조건 | fallback 조건 | review-needed 조건 |
|---|---|---|---|
| `skill` | 공식 surface와 현재 구조가 직접 맞음 | note 또는 invocation guidance 생성 | review stub |
| `agent` | 공식 subagent surface와 의미가 맞음 | 제한된 지침 보존 + fallback note | review marker |
| `command` | 공식 command surface와 구조가 맞음 | invocation note 확장 | review marker |
| `hook` | Hooks event, tool, platform 범위가 공식 제약 안에 있음 | skill, command, wrapper 생성 | review note |
| `rule` | 실제 의미가 exec-policy인 경우에만 Rules direct 검토 | `AGENTS.md` merge snippet, skill note | review note |

## 6. Portability Manifest 제안

권장 파일:

`src/claude/_meta/codex-portability.json`

이유는 다음과 같다.

- hook/rule별 공식 surface와 fallback 전략을 선언형으로 관리할 수 있다.
- runtime parity와 artifact parity를 한 레코드 안에서 분리해 적을 수 있다.
- stale skip 기준을 문서와 코드에서 동시에 줄일 수 있다.

예시 구조:

```json
{
  "entries": [
    {
      "identity": "session-wrap-suggest",
      "type": "hook",
      "domain": "core",
      "officialSurface": "hooks.stop",
      "officialBasis": [
        "https://developers.openai.com/codex/hooks"
      ],
      "docConstraints": [
        "Stop event is officially documented",
        "Claude session state parity is not documented"
      ],
      "evidenceLevel": "검증 필요",
      "codexStrategy": "fallback",
      "fallbackTarget": "skill",
      "runtimeDeps": [
        "~/.claude/.session-stats.json"
      ],
      "confidence": "likely"
    },
    {
      "identity": "verification",
      "type": "rule",
      "domain": "core",
      "officialSurface": "agents_md",
      "officialBasis": [
        "https://developers.openai.com/codex/guides/agents-md",
        "https://developers.openai.com/codex/skills"
      ],
      "docConstraints": [
        "Guidance-style rules are not the same as Codex exec Rules"
      ],
      "evidenceLevel": "우회 가능",
      "codexStrategy": "fallback",
      "fallbackTarget": "agents-guidance",
      "confidence": "confirmed"
    }
  ]
}
```

## 7. Registry Sync

registry 역할은 아래처럼 분리한다.

| 파일 | 역할 |
|---|---|
| `src/exception-registry.json` | 예외 확인과 상태 설명 |
| `src/pairing-registry.json` | 실제 결과 상태 기록 |
| `skip-registry.md` | 사람이 읽는 설명 문서 또는 generated view |

판단 SSOT는 `exception-registry`와 strategy resolver여야 하며, `skip-registry.md`는 결과 설명용으로만 쓴다.

### 7.1 Vocabulary Mapping (exception-registry ↔ pairing-registry)

두 registry는 서로 다른 vocabulary를 쓴다. C7 audit이 cross-check를 하려면 다음 mapping이 SSOT 역할을 해야 한다.

| exception `strategy` | exception `status` | pairing `status` | 의미 | 정상 transition |
|---|---|---|---|---|
| `paired-direct` | `resolved` | `paired` | Codex sibling 존재 + 검증 완료 | 정상 종착점 |
| `paired-direct` | `active` | `paired` | sibling 존재하지만 검증 미완료 | resolved로 전환 예정 |
| `paired-fallback` | `active` | (entry 없음) | fallback artifact 생성 전 (Phase 2~3 진행 중) | artifact 생성 후 entry 추가 |
| `paired-fallback` | `resolved` | `paired` | fallback artifact 생성 + 검증 완료 | 정상 종착점 |
| `paired-review` | `active` | (entry 없음) 또는 `paired` | 사람 검토 대기 | review 통과 후 resolved |
| `blocked` | `active` | `codex-skip` | 진짜 skip (artifact 생성 불가) | 영속 상태 |

**모순 패턴 (C7 FAIL/WARN 후보)**:

| 모순 패턴 | 수준 | 의미 |
|---|---|---|
| `paired-direct` + pairing entry 없음 | FAIL | sibling 파일은 있는데 pairing-registry 미등록 |
| `paired-direct` + pairing `status=codex-skip` | FAIL | strategy와 pairing 모순 |
| `blocked` + pairing `status=paired` | FAIL | exception은 blocked인데 sibling 존재 |
| `paired-fallback` + pairing `status=paired` + artifact 미존재 | WARN | fallback artifact 생성 누락 |

이 표는 Phase 4 `/kit-analyze` 4-tier 출력과 C7 audit 확장의 SSOT다.

## 8. Validation / Report

`/kit-analyze`와 `/kit-sync`는 아래 값을 함께 보여줘야 한다.

- `paired-direct`
- `paired-fallback`
- `paired-review`
- `blocked`
- `evidenceLevel`
- `officialSurface`

이렇게 해야 "왜 direct가 아닌가"와 "왜 그래도 skip하지 않는가"가 함께 설명된다.

## 9. 정합성 규칙

### 9.1 `output-secret-filter`

현재 확인된 대표 사례는 `output-secret-filter`다.

- `src/codex/core/hooks/output-secret-filter.js`는 이미 존재한다.
- `exception-registry`에서는 resolved다.
- 따라서 문제는 "Codex 포트가 있나"가 아니라 "그 포트를 공식 hook 범위 안에서 어떻게 설명할 것인가"다.

resolver는 이 항목에 최소한 아래를 기록해야 한다.

- `officialSurface = hooks`
- `evidenceLevel = 검증 필요`
- `docConstraints = prompt-side validation and Bash-scoped post-processing only`

### 9.2 `session-wrap-suggest`

이 항목은 "Stop hook 없음"이 아니라, "Stop hook은 공식 지원이지만 Claude 상태 의존 parity는 미검증"으로 기록해야 한다.

## 10. 권장 구현 순서

아래 순서는 문서 승인 이후 구현 반영 후보 순서다.

1. stale registry 정리
2. evidenceLevel 도입
3. `rule` fallback artifact 생성 도입
4. `hook` fallback artifact 생성 도입
5. portability manifest 도입
6. 보고서 형식 갱신
