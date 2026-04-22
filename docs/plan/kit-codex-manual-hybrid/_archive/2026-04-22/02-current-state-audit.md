# 02 Current State Audit

> 목적: 현재 `claude-kit`가 Codex를 어떻게 지원하고 있는지 로컬 구현 기준으로 정리한다.

## 1. 현재 구조의 핵심 특징

현재 `claude-kit`는 `문서 중심 참조 구조`라기보다 `Codex용 runtime 산출물 생성 구조`에 가깝다.

### 1.1 `scripts/setup.js` 중심 emitter

현재 setup 흐름은 Claude와 Codex를 별도 target처럼 다룬다.

- Codex 쪽 component는 `agents`, `commands`, `skills`를 중심으로 생성된다.
- plugin root, `plugin.json`, `marketplace.json`, `hooks.json`, `AGENTS.md`가 생성된다.
- hooks는 일반 복사보다 별도 compatibility 처리 흐름을 가진다.

관련 위치:

- [scripts/setup.js](../../../scripts/setup.js)
- [src/templates/AGENTS.md.template](../../../src/templates/AGENTS.md.template)

### 1.2 현재 산출물 관점

README와 feature 문서를 기준으로 보면 Codex 출력은 대략 아래 범주를 가진다.

- `plugins/claude-kit/`
- `.agents/plugins/marketplace.json`
- repo-level `AGENTS.md`
- `plugins/claude-kit/hooks.json`

즉, 현재 구조는 Codex가 읽을 문서를 설명하는 수준을 넘어, Codex runtime asset 자체를 별도 생성하는 편이다.

## 2. 현재 duplication 상태

검토 시점의 대략적인 파일 수는 아래와 같다.

| Directory | File count |
|---|---:|
| `src/claude` | 162 |
| `src/codex` | 143 |

이는 현재 구조가 thin wrapper가 아니라, 상당량의 Codex 전용 설명 자산과 runtime 대응 자산을 함께 유지하고 있음을 보여준다.

## 3. Duplication classification rubric

피드백 반영에 따라 `src/codex` duplication은 단순히 많다/적다가 아니라 A/B/C로 분류한다.

| Class | 의미 | 예시 | 처리 방향 |
|---|---|---|---|
| A | 단순 duplication | 표현만 복제된 문서 | shared manual로 이동 후 제거 후보 |
| B | 표현 차이는 있지만 의도는 동일 | Codex wording만 다른 라우팅 설명 | shared manual + alias/router로 통합 검토 |
| C | 실제 runtime 차이 | `.codex/agents/*.toml`, Codex-compatible hooks | Codex native surface로 유지 |

Phase 0에서 필요한 것은 파일별 최종 판정 완료가 아니라, 이 rubric 자체를 승인하는 것이다.

## 4. 현재 Codex 생성 방식의 구체적 특징

### 4.1 Agents / commands / skills 복제

`emitCodex()` 흐름은 `agents`, `commands`, `skills`를 plugin 쪽으로 생성하거나 복제하는 구조를 갖는다.

문제는 이 중 일부가 공식 Codex plugin surface와 직접 맞닿는 자산이 아니라는 점이다.

### 4.2 Hooks의 special handling

hooks는 일반 복사와 다르게 Codex compatibility 필터를 거쳐 별도 산출물로 정리된다.

이 부분은 `manual-only`가 성립하지 않는 대표 영역이다. hook은 문서만으로 대체 가능한 부분과 runtime enforcement가 필요한 부분을 분리해서 다뤄야 한다.

### 4.3 Rules와 `AGENTS.md` 흡수

Codex 쪽에서는 `.claude/rules/*.md`를 그대로 복제하기보다 `AGENTS.md`로 흡수하는 방향이 이미 일부 존재한다.

이 점은 목표 구조와 맞닿아 있다. 다만 현재는 그 위에 여전히 많은 Codex 전용 자산이 병렬로 존재한다.

## 5. 현재 구조의 장점

### 5.1 즉시성

- Claude 자산의 상당 부분을 Codex에서 빠르게 재사용할 수 있다.
- plugin 설치만으로 넓은 surface를 제공할 수 있다.

### 5.2 기존 UX 보존

- `/dev-*`, `/plan-*`, `/copy-*` 등 익숙한 naming을 비교적 직접적으로 유지할 수 있다.

### 5.3 Meta asset 관리 흔적

현재 구조에는 아래와 같은 paired/meta asset 관리 의도가 남아 있다.

- `pairing-registry`
- `exception-registry`
- `codex-portability`

이 자산들은 단순 제거 대상이 아니라, `shared manual` 체계에서 어떤 책임을 가져갈지 별도 판단이 필요하다.

## 6. 현재 구조의 문제

### 6.1 공식 surface와의 거리

plugin은 공식적으로 `skills/apps/MCP` 중심으로 설명되는데, 현재 구현은 `agents/commands`를 plugin runtime의 핵심처럼 다루고 있다.

### 6.2 유지보수 비용

- runtime 차이보다 설명 차이만 있는 파일도 별도 관리된다.
- 코드/문서 drift 가능성이 커진다.
- setup emitter 로직이 복잡해진다.

### 6.3 `.claude` 직접 참조 유혹

중복을 줄이려는 과정에서 `그냥 .claude를 그대로 읽자`는 방향으로 기울 수 있다. 하지만 그 접근은 공식 Codex discovery surface와 맞지 않고, 또 다른 결합 문제를 만든다.

## 7. Audit 결론

현재 구조는 “당장 동작하게 만드는 데는 성공했지만, 장기 구조로는 다시 정리해야 하는 상태”로 보는 것이 맞다.

Phase 1에서 필요한 최소 산출물은 아래와 같다.

- `src/codex` 자산의 A/B/C 분류표
- `pairing-registry`, `exception-registry`, `codex-portability`의 처리 방향
- shared-manual 이동 대상 목록
