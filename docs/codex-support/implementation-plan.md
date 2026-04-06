# Codex 설치 지원 v1 구현계획

> **Document Status**: Approved Design / Pre-Implementation. 구현 착수 전 설계 명세.
>
> 목적: `claude-kit`를 Claude 전용 설치기에서 Claude + Codex 멀티타깃 설치기로 확장하기 위한 v1 구현 명세를 고정한다.
>
> 이 문서는 아이디어 제안서가 아니라, 구현 전에 읽고 바로 작업에 들어갈 수 있는 설계 명세이자 근거 문서다.
>
> 관련 문서: [00-codex-quickstart.md](./00-codex-quickstart.md) (사용자 가이드), [01-asset-mapping-reference.md](./01-asset-mapping-reference.md) (자산 매핑 레퍼런스)

---

## 0. 설계 원칙과 판단 기준

Codex 지원 v1은 "Claude 구조를 최대한 그대로 복제"하는 프로젝트가 아니다. 반대로 "Codex가 원래 이해하는 설치 단위와 실행 방식 안에 `claude-kit`를 재배치"하는 프로젝트다. 아래 원칙은 이후 모든 세부 결정을 잠그는 상위 기준이다.

### 0.1 Codex native first

Codex 쪽 설계는 Claude 자산을 억지로 이식하는 방식이 아니라, Codex가 현재 이해하는 설치 단위와 관리 구조를 먼저 따른다.

**왜 필요한가**

- 현재 설치기 [`scripts/setup.js`](../../scripts/setup.js)는 `.claude/`, `CLAUDE.md`, `.claude/settings.json`을 중심으로 설계되어 있다.
- 반면 로컬 Codex 구조에서는 plugin manifest, `skills/`, `hooks.json`, `commands/`, `agents/`가 plugin 단위로 조직되어 있다. (이 구조는 현시점 Codex 공식 플러그인 스펙 기준이며, Codex 플랫폼 변경 시 재검토가 필요하다.)
- 두 플랫폼의 출력 구조와 런타임 계약이 다르므로, Claude 구조를 강제 복제하면 Codex에서는 "설치는 됐지만 반쯤만 맞는 상태"가 될 위험이 크다.

**이 원칙이 의미하는 것**

- Codex v1의 설치 단위는 plugin이다.
- Codex 쪽 컨텍스트 문서는 `AGENTS.md`를 기준으로 둔다.
- Codex emitter는 Claude emitter와 분리한다.

### 0.2 No Regression for Claude

Codex 지원 때문에 기존 Claude 사용자 경험이 깨지면 안 된다.

**왜 필요한가**

- 현재 패키지의 실사용 전제와 문서 흐름은 대부분 Claude 중심이다.
- v1의 목적은 Claude를 대체하는 것이 아니라 Codex를 추가로 지원하는 것이다.
- 기존 `.claude/` 구조를 깨면 사용자 입장에서는 "기능 추가"가 아니라 "기존 설치 회귀"로 인식된다.

**이 원칙이 의미하는 것**

- 기존 Claude 설치 흐름은 그대로 유지한다.
- `targets` 기본값은 계속 `["claude"]`다.
- Codex 지원은 Claude 경로를 재정의하는 방식이 아니라 Codex 출력기를 추가하는 방식으로 구현한다.

### 0.3 Portable before parity

완전한 동작 동일성보다, 안전하게 설치되고 유지보수 가능한 구조를 먼저 확보한다.

**왜 필요한가**

- 현재 소스에는 `.claude/...`, `~/.claude/...`, `CLAUDE_SESSION_ID`, `CLAUDE_REMOTE_SESSION` 같은 Claude 전용 의존이 섞여 있다.
- 이것까지 모두 맞추려 들면 설치기 확장이 아니라 런타임 포팅 프로젝트가 된다.
- v1에서 필요한 것은 "Codex에서도 설치해서 기본 자산을 쓸 수 있게 만드는 것"이지 "Claude와 100% 동일한 런타임 재현"이 아니다.

**이 원칙이 의미하는 것**

- `skills`, `commands`, `agents`는 우선 지원한다.
- `hooks`, `rules`, `mcp`는 보수적으로 부분 지원 또는 제외로 둔다.
- v1에서 지원하지 않는 영역은 후속 과제로 분리한다.

### 0.4 Explicit gaps over silent mismatch

이식하지 못한 자산은 숨기지 않고 skip과 이유를 남긴다.

**왜 필요한가**

- Codex에서 지원되지 않는 자산을 조용히 누락하면, 사용자는 "왜 이 기능만 다르게 동작하지?"를 추적할 수 없다.
- 설치 성공만 보고 넘어가면 나중에 문서와 실제 동작이 어긋난다.
- 특히 훅, 세션 런타임, 홈 디렉토리 의존 자산은 차이를 명시적으로 드러내야 후속 작업도 계획할 수 있다.

**이 원칙이 의미하는 것**

- `.claude-kit-meta.json`에 `skippedForCodex`를 기록한다.
- v1 범위 제외 자산은 문서와 메타데이터에서 모두 이유를 설명한다.

---

## 1. 목표와 비목표

## 1.1 목표

### 목표 1. `claude-kit`를 Claude + Codex 멀티타깃 설치기로 확장한다

**결정**

- 설치기를 Claude 전용에서 멀티타깃 설치기로 확장한다.

**채택 이유**

- 현재 설치기 [`scripts/setup.js`](../../scripts/setup.js)는 출력 루트, 템플릿, 설정 병합 구조가 모두 Claude 전용으로 고정돼 있다.
- 따라서 Codex 지원의 본질은 문서 몇 줄 추가가 아니라 "설치 타깃 추상화"다.

**v1에서 얻는 이점**

- 동일한 authoring source에서 Claude와 Codex를 함께 배포할 수 있다.
- 이후 다른 타깃이 추가되더라도 emitter 단위로 확장할 수 있다.

**지금 이렇게 하는 이유**

- 기존 구조를 유지한 채 Codex를 억지로 끼워 넣으면 경로 예외와 분기만 늘어난다.
- 설치기 수준에서 타깃을 분리하는 것이 가장 작은 비용으로 가장 큰 확장성을 얻는 방식이다.

### 목표 2. 기존 Claude 설치 흐름은 유지하고 Codex 타깃만 추가한다

**결정**

- Claude 설치 흐름을 바꾸지 않고 Codex만 추가한다.

**채택 이유**

- 기존 사용자 기대치와 현재 문서 흐름은 Claude 중심이다.
- v1에서 Claude를 재설계하면 Codex 지원 범위를 넘어 회귀 위험이 커진다.

**v1에서 얻는 이점**

- 기존 사용자는 설정 변경 없이 그대로 사용 가능하다.
- Codex 추가의 효과를 독립적으로 검증할 수 있다.

**대안과 비교**

- 대안은 Claude/Codex 공용 경로로 전면 재설계하는 것이지만, 그 경우 기존 `.claude` 생태계를 먼저 깨게 된다.
- 이번 문서에서는 그 대안을 채택하지 않는다.

### 목표 3. Codex v1은 repo-local plugin 설치를 기본안으로 채택한다

**결정**

- Codex 출력은 전역 `~/.codex`가 아니라 프로젝트 로컬 `plugins/claude-kit/` 구조를 기본으로 한다.

**채택 이유**

- 로컬 Codex 예제는 plugin manifest와 `skills`, `commands`, `agents`, `hooks.json`이 plugin 내부에 모여 있다.
- repo-local plugin은 버전 관리, 리뷰, 제거, 재현이 모두 쉽다.
- 전역 설치는 사용자 전체 환경을 건드리므로 리스크가 크다.

**v1에서 얻는 이점**

- 프로젝트별 AI 자산을 코드와 함께 관리할 수 있다.
- 설치 결과를 Git diff로 확인할 수 있다.
- 다른 프로젝트의 Codex 환경을 오염시키지 않는다.

**지금 전역 설치를 하지 않는 이유**

- 전역 설치는 운영 모델, 충돌 정책, 다중 프로젝트 공존 전략이 먼저 정해져야 한다.
- v1에서 이 문제까지 풀면 범위가 불필요하게 커진다.

### 목표 4. 설치기 구조를 `source assets -> normalization -> target emitter`로 재편한다

**결정**

- 설치기를 수집, 정규화, 출력의 3단 구조로 리팩터링한다.

**채택 이유**

- 현재 `setup.js`는 도메인 계산, 파일 복사, 템플릿 처리, 설정 병합이 하나의 흐름에 섞여 있다.
- Codex가 추가되면 경로와 파일 형식이 달라지므로, 출력기를 분리하지 않으면 분기만 늘어난다.

**v1에서 얻는 이점**

- Claude emitter와 Codex emitter를 독립적으로 검증할 수 있다.
- 향후 타깃 추가나 자산별 처리 규칙 추가가 쉬워진다.

**대안과 비교**

- 대안은 기존 함수 안에 `if codex` 분기를 누적하는 방식이지만, 유지보수가 빠르게 어려워진다.

## 1.2 비목표

### 비목표 1. Claude와 Codex의 완전 동일 런타임 재현

**결정**

- v1에서 Claude와 Codex의 동작을 1:1로 동일하게 맞추지 않는다.

**지금 하지 않는 이유**

- 현재 자산에는 Claude 세션 env, 홈 디렉토리 상태, `.claude` 전용 런타임 전제가 많다.
- 이것은 설치 문제보다 플랫폼 포팅 문제에 가깝다.

**지금 하면 위험한 점**

- 설치는 되지만 실제 동작은 더 불안정해질 수 있다.
- 문서상 "지원"과 실제 "부분 동작"이 섞여 신뢰도를 떨어뜨린다.

**v2 이후로 넘기는 이유**

- 먼저 설치 가능성과 자산 배치 모델을 안정화한 뒤에, 런타임 동등성은 후속 검토하는 편이 합리적이다.

### 비목표 2. 전역 `~/.codex` 설치 자동화

**결정**

- v1에서는 전역 Codex 홈을 수정하지 않는다.

**지금 하지 않는 이유**

- 전역 설치는 사용자의 다른 프로젝트와 기존 Codex 사용 방식을 함께 건드릴 수 있다.
- uninstall, 충돌, 우선순위, 버전 고정 정책이 필요하다.

**지금 하면 위험한 점**

- 한 프로젝트에서 설치한 자산이 다른 프로젝트의 Codex 동작에 영향을 줄 수 있다.
- 문제 발생 시 원인 추적이 어려워진다.

### 비목표 3. 모든 Claude 전용 hook과 세션 기능 이식

**결정**

- 훅과 세션성 기능은 v1에서 최소 이식만 한다.

**지금 하지 않는 이유**

- hook은 파일 복사 문제가 아니라 플랫폼 이벤트 모델과 런타임 계약 문제다.
- Claude 전용 env와 `~/.claude` 저장소를 쓰는 훅은 Codex에서 바로 대응되지 않는다.

**지금 하면 위험한 점**

- 설치 시점에는 성공해도 실제 사용 시 오동작하거나, 조용히 무시되는 훅이 생길 수 있다.

### 비목표 4. `mcp-servers.json`의 Codex 직접 이식

**결정**

- v1에서 MCP는 필수 범위에 넣지 않는다.

**지금 하지 않는 이유**

- MCP는 단순 파일 복사가 아니라 인증, transport, app/plugin 연결 구조가 함께 맞아야 한다.
- 로컬 Codex plugin 예제에서도 MCP는 plugin 단위 설정과 함께 다뤄진다.

**지금 하면 위험한 점**

- 형식만 맞춘 불완전한 MCP 구성이 생길 수 있다.
- 사용자가 "설치됐는데 왜 인증/연결이 안 되지?" 상태에 빠질 수 있다.

## 1.3 v1 성공 기준

- `targets=["codex"]`로 설치할 때 Codex plugin 구조가 정상 생성된다.
- `targets=["claude","codex"]`로 설치할 때 두 타깃이 동시에 생성되고 서로를 덮어쓰지 않는다.
- 기존 Claude 사용자는 설정 변경 없이 그대로 동작한다.
- Codex에서 지원하지 않는 자산은 설치 실패가 아니라 명시적 skip으로 기록된다.

---

## 2. 현재 구조 진단

## 2.1 설치 진입점

현재 설치 진입점은 [`scripts/setup.js`](../../scripts/setup.js)다.

이 스크립트는 현재 다음 전제를 고정하고 있다.

- 출력 루트는 `.claude/`
- 프로젝트 컨텍스트 문서는 `CLAUDE.md`
- 설정 파일은 `.claude/settings.json`
- 메타데이터는 `.claude-kit-meta.json`
- 설치 대상 컴포넌트는 `agents`, `commands`, `skills`, `hooks`, `rules`

이 말은 현재 설치기가 "Claude 자산을 `.claude/`로 플래트닝 복사하는 설치기"라는 뜻이다. Codex 지원은 이 흐름에 부수 옵션을 한 줄 더 붙이는 수준이 아니라, 출력 타깃 개념 자체를 추가하는 작업이다.

## 2.2 현재 문서와 템플릿의 Claude 전제

다음 파일들은 모두 Claude 중심 사용 흐름을 전제한다.

- [`README.md`](../../README.md)
- [`src/templates/CLAUDE.md.template`](../../src/templates/CLAUDE.md.template)
- [`src/templates/settings.json.template`](../../src/templates/settings.json.template)
- [`src/templates/profile.json.template`](../../src/templates/profile.json.template)

특히 [`src/templates/CLAUDE.md.template`](../../src/templates/CLAUDE.md.template)는 이름 자체뿐 아니라 본문에서도 `.claude/skills/`를 전제로 설명한다. 따라서 Codex 지원은 파일명만 `AGENTS.md`로 바꾸는 문제가 아니라, 컨텍스트 문서의 의미와 참조 방식도 다시 정렬해야 한다.

## 2.3 Codex 지원 관점에서 본 현재 제약

소스 전반에는 Claude 전용 참조가 다수 존재한다.

- `.claude/...` 상대 경로 참조
- `~/.claude/...` 홈 경로 참조
- `CLAUDE.md` 파일명 전제
- `CLAUDE_SESSION_ID`, `CLAUDE_REMOTE_SESSION` 같은 Claude 전용 환경변수
- Claude remote session 전용 보안/로그 처리

**왜 중요한가**

- 이 제약은 "경로 치환"으로는 해결되지 않는다.
- 설치 결과가 어디에 놓이는지뿐 아니라, 자산이 어떤 런타임을 가정하는지도 함께 분류해야 한다.

즉 Codex 지원은 "새 폴더에 복사"가 아니라 "타깃별 설치 출력 + 타깃별 자산 해석" 문제다.

---

## 3. Codex 목표 구조

## 3.1 설치 단위

Codex v1의 설치 단위는 repo-local plugin이다.

```text
{project}/
├─ AGENTS.md
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json
└─ plugins/
   └─ claude-kit/
      ├─ .codex-plugin/
      │  └─ plugin.json
      ├─ agents/
      ├─ commands/
      ├─ skills/
      ├─ hooks.json
      └─ assets/
```

### 왜 plugin 구조인가

- 로컬 Codex 예제에서 plugin manifest는 `.codex-plugin/plugin.json`에 있고, `skills/`, `hooks.json`, `commands/`, `agents/`가 plugin 내부에 함께 존재한다.
- 즉 plugin은 Codex에서 "설치 가능한 자산 묶음"이고, skills는 그 안의 한 구성요소다.
- `claude-kit`는 개별 skill 1개가 아니라 설치 가능한 자산 번들이므로 plugin 단위가 더 맞다.

### 왜 repo-local인가

- repo-local plugin은 프로젝트 단위 버전 관리가 가능하다.
- 설치 결과를 Git으로 추적할 수 있다.
- 다른 프로젝트나 사용자 전역 Codex 환경에 영향을 주지 않는다.

### 왜 전역 `~/.codex`가 아닌가

- 전역 설치는 운영 모델, 충돌 정책, 다중 프로젝트 공존 전략이 먼저 필요하다.
- 이번 v1의 목적은 운영 체계 설계가 아니라, Codex 설치 가능성을 안전하게 확보하는 것이다.

## 3.2 Codex plugin 구성 원칙

- plugin 이름은 `claude-kit`로 고정한다.
- 자산은 plugin 내부에서 `skills`, `commands`, `agents`, `hooks.json` 기준으로 배치한다.
- 프로젝트 컨텍스트 문서는 `AGENTS.md`를 기준으로 삼는다.
- plugin 설치 정보는 `.agents/plugins/marketplace.json`에 등록한다.
- plugin manifest는 `plugins/claude-kit/.codex-plugin/plugin.json`에 생성한다.

### 왜 `AGENTS.md`인가

- Codex 쪽 현재 관례와 더 자연스럽게 맞는다.
- `CLAUDE.md`를 그대로 유지하면 파일명이 플랫폼 이름을 끌고 다니게 되어 사용자 관점에서 혼란스럽다.
- Codex 지원의 목적은 Claude 문서를 억지로 재사용하는 것이 아니라, Codex에서 이해 가능한 프로젝트 컨텍스트 구조를 제공하는 것이다.

### 대안과 비교

- 대안은 Codex에서도 `CLAUDE.md`를 그대로 쓰는 방식이다.
- 이번 문서에서는 이 대안을 채택하지 않는다. 파일명과 의미가 플랫폼과 어긋나며, 장기적으로 Codex native 구조로 가는 데 방해가 되기 때문이다.

## 3.3 v1에서 생성할 관리 파일

### `AGENTS.md`

- `CLAUDE.md`와 유사한 역할의 Codex 프로젝트 컨텍스트 문서
- fresh install에서만 생성하고 기존 파일이 있으면 보존

### `plugins/claude-kit/.codex-plugin/plugin.json`

- plugin manifest
- plugin의 메타데이터와 자산 위치를 선언하는 진입점

### `.agents/plugins/marketplace.json`

- repo-local plugin 노출용 marketplace 파일
- 이미 존재하면 병합
- 같은 plugin entry가 있으면 중복 생성 금지

### `plugins/claude-kit/hooks.json`

- Codex 형식으로 옮길 수 있는 hook만 기록
- Claude 전용 hook은 제외하거나 skip 처리

### 왜 `marketplace.json`을 함께 관리하는가

- plugin 폴더만 생성하면 "파일은 있는데 Codex에서 노출되지 않는" 상태가 될 수 있다.
- plugin을 설치 가능한 자산으로 완결하려면 manifest와 함께 marketplace 등록 정보도 관리해야 한다.

---

## 4. 설치기 리팩터링 계획

## 4.1 목표 구조

`setup.js`는 v1에서 아래 3단 구조로 재편한다.

```text
source assets
-> normalization
-> target emitter
```

### source assets

- `src/{domain}/{category}` 기준 원본 자산 수집
- `templates/`
- `mcp-servers.json`

### normalization

- 활성 `domains` 계산
- 활성 `targets` 계산
- 컴포넌트 메타데이터 수집
- 자산별 변환 필요 여부 판정
- skip 사유 계산

### target emitter

- `claude emitter`
- `codex emitter`

### 왜 이 구조로 재편하는가

- 현재 `setup.js`는 도메인 계산과 Claude 출력이 강하게 결합돼 있다.
- Codex 추가 시 분기만 누적하면 유지보수가 어려워진다.
- 반대로 정규화 단계를 중간에 두면 공통 판단 로직을 재사용하고, 마지막 출력만 타깃별로 분리할 수 있다.

## 4.2 emitter 분리 원칙

### `claude emitter`

- 현재 동작을 최대한 유지한다.
- 출력 위치는 `.claude/`
- 컨텍스트 문서는 `CLAUDE.md`
- 설정 파일은 `.claude/settings.json`

### `codex emitter`

- 신규 구현 대상
- 출력 위치는 `plugins/claude-kit/` + `.agents/plugins/marketplace.json`
- 컨텍스트 문서는 `AGENTS.md`
- Codex plugin manifest와 hook 설정을 생성한다.

### 왜 emitter를 분리하는가

- Claude와 Codex는 출력 폴더, 설정 파일, 컨텍스트 문서, 훅 형식이 모두 다르다.
- 같은 emitter 안에서 분기만 늘리면 파일 생성 규칙과 merge 규칙이 엉키기 쉽다.
- emitter 분리는 구현 난이도를 늘리는 대신, 회귀 위험과 복잡도를 크게 낮춘다.

## 4.3 `profile.json` 변경 계획

기존 `profile.json`의 `domains`는 유지하고 `targets`를 추가한다.

```json
{
  "domains": ["core", "dev"],
  "targets": ["claude"]
}
```

### 규칙

- `targets`가 없으면 기본값은 `["claude"]`
- 허용 값은 `claude`, `codex`
- `domains`와 `targets`는 독립 축으로 처리
- `core`는 현재처럼 항상 포함

### 왜 `domains`를 건드리지 않고 `targets`만 추가하는가

- `domains`는 어떤 자산군을 설치할지 결정하는 축이고, `targets`는 어디에 어떤 형식으로 출력할지 결정하는 축이다.
- 두 의미를 섞으면 사용자도 헷갈리고 구현도 복잡해진다.
- 그래서 인터페이스 확장은 최소한으로 하고, 의미는 분리한다.

## 4.4 `.claude-kit-meta.json` 확장 계획

기존 메타데이터에 아래 필드를 추가한다.

- `targets`
- `outputs`
- `skippedForCodex`

```json
{
  "version": "2.0.0",
  "domains": ["core", "dev"],
  "targets": ["claude", "codex"],
  "outputs": {
    "claude": {
      "root": ".claude",
      "generated": ["CLAUDE.md", ".claude/settings.json"]
    },
    "codex": {
      "root": "plugins/claude-kit",
      "generated": [
        "AGENTS.md",
        "plugins/claude-kit/.codex-plugin/plugin.json",
        ".agents/plugins/marketplace.json",
        "plugins/claude-kit/hooks.json"
      ]
    }
  },
  "skippedForCodex": [
    {
      "component": "output-secret-filter.js",
      "reason": "depends on CLAUDE_REMOTE_SESSION and ~/.claude runtime"
    }
  ]
}
```

### 왜 skip metadata가 필요한가

- v1은 모든 자산을 동일하게 이식하는 것이 목표가 아니다.
- 이때 무엇이 설치됐고 무엇이 제외됐는지 드러내지 않으면, 설치 성공만 보고 실제 차이를 파악하기 어렵다.
- 메타데이터는 향후 v2 범위 정의와 회귀 분석에도 도움이 된다.

---

## 5. 자산 매핑 규칙

## 5.1 컴포넌트별 처리 원칙

| 자산 유형 | Claude 출력 | Codex 출력 | 처리 방식 | 이유 |
|------|------|------|------|------|
| `skills` | `.claude/skills/` | `plugins/claude-kit/skills/` | 기본 지원 | 문서형 자산이며 plugin 내부 skill 구조와 잘 맞는다 |
| `commands` | `.claude/commands/` | `plugins/claude-kit/commands/` | 기본 지원 | Codex plugin 예제에도 command 자산이 존재하며 배치 의미가 분명하다 |
| `agents` | `.claude/agents/` | `plugins/claude-kit/agents/` | 기본 지원 | plugin 내부 agent 구조가 확인되며, authoring 자산으로 이식 가능성이 높다 |
| `hooks` | `.claude/hooks/` | `plugins/claude-kit/hooks.json` + 필요 시 보조 스크립트 | 부분 지원 | 가장 플랫폼 의존적이며 잘못 이식하면 설치는 되지만 실행 중 오동작 위험이 크다 |
| `rules` | `.claude/rules/` | 직접 배치 안 함, `AGENTS.md` 또는 plugin 문서에서 참조 | 부분 지원 | Codex plugin의 1급 배치 단위로 확인되지 않았고, 우선은 컨텍스트 문서에 흡수하는 편이 안전하다 |
| `templates` | `CLAUDE.md`, `.claude/settings.json`, `profile.json` | `AGENTS.md`, plugin manifest, marketplace | 타깃별 생성 | 플랫폼별 컨텍스트 문서와 설정 단위가 다르므로 공용 템플릿 복제로 해결되지 않는다 |
| `mcp` | `.claude/settings.json` 또는 별도 참조 | v1 필수 아님 | 제외 | 인증, transport, app 연결 설계가 동반되어 단순 복사 대상이 아니다 |

### 왜 `skills`, `commands`, `agents`를 먼저 지원하는가

- 이 셋은 모두 authoring 자산으로 볼 수 있고, plugin 내부 구조와 비교적 자연스럽게 대응된다.
- 설치기의 1차 성공은 "자산을 안전하게 배치"하는 것이므로, 우선 이 셋을 기본 지원으로 삼는 것이 합리적이다.

### 왜 `hooks`, `rules`, `mcp`는 뒤로 미루는가

- 훅은 이벤트 모델과 런타임 의존성이 강하다.
- rules는 Codex plugin에서 어떤 배치 단위로 관리할지 아직 명확히 고정되지 않았다.
- MCP는 인증과 연결 모델까지 검토해야 한다.

즉 이 셋은 "복사 가능"보다 "정확하게 이식 가능한가"가 먼저 검증되어야 한다.

## 5.2 경로 변환 규칙

### `.claude/...` 참조

자산 본문에 `.claude/...` 참조가 있으면 아래 우선순위로 변환한다.

1. Codex plugin 내부 상대 경로로 치환
2. 프로젝트 루트 기준 `plugins/claude-kit/...`로 치환
3. v1에서 안전하게 치환할 수 없으면 skip 또는 수동 검토 대상으로 분류

### 왜 단순 문자열 치환으로 끝내지 않는가

- 같은 `.claude/...` 참조라도 문서 설명, 실행 경로, 런타임 저장 위치의 의미가 다를 수 있다.
- 안전하게 치환 가능한 참조와 의미 자체가 다른 참조를 분리해야 한다.

### `CLAUDE.md` 참조

Codex 타깃에서는 `CLAUDE.md`를 `AGENTS.md`로 치환한다.

치환 대상 예시는 아래와 같다.

- 문서 안내
- 프로젝트 컨텍스트 참조
- 파일 탐색 패턴
- 허용 예외 목록

### 왜 `CLAUDE.md`를 유지하지 않는가

- Codex 사용자 입장에서 플랫폼명이 들어간 파일명을 계속 쓰는 것은 불필요한 혼란이다.
- Codex native 구조를 따르려면 문서명도 Codex 관례에 맞추는 편이 자연스럽다.

### `~/.claude/...` 참조

`~/.claude/...` 참조는 v1에서 자동 이식하지 않는다.

처리 원칙은 아래와 같다.

- Codex에서 직접 대응 경로가 없으면 skip
- 홈 디렉토리 기반 런타임 저장은 v1 범위 제외
- 필요 시 문서에 "Codex 미지원"으로 명시

### 왜 홈 디렉토리 기반 자산을 제외하는가

- repo-local 설치의 장점은 프로젝트 단위 관리인데, 홈 경로 자산은 이를 다시 전역 상태로 되돌린다.
- Codex에서도 대응 홈 구조가 있더라도 의미와 충돌 정책이 정해지지 않은 상태에서는 보수적으로 제외하는 편이 맞다.

## 5.3 hook 변환 규칙

Codex v1에서는 hook을 전부 복사하지 않는다.

| hook 유형 | v1 처리 | 이유 |
|------|------|------|
| Codex `hooks.json` 형식으로 옮길 수 있는 단순 hook | 지원 | 구조 대응이 명확하고 런타임 위험이 상대적으로 낮다 |
| Claude 전용 환경변수에 의존하는 hook | 제외 | Codex에서 동일 env 계약이 보장되지 않는다 |
| `~/.claude` 런타임 저장에 의존하는 hook | 제외 | repo-local 모델과 충돌하고 전역 상태를 새로 도입하게 된다 |
| remote session 전용 hook | 제외 | Claude 전용 실행 맥락에 결합되어 있어 동등 이식이 어렵다 |

### v1에서 우선 검토할 hook

- `edit-tracker.js`
- `code-quality-reminder.js`
- `security-auto-trigger.js`

### v1에서 제외할 가능성이 높은 hook

- `output-secret-filter.js`
- `session-wrap-suggest.js`

### 왜 hook은 최소 이식인가

- 훅은 가장 플랫폼 의존적이다.
- 잘못 이식하면 "없어서 불편"이 아니라 "있는데 오동작" 상태가 된다.
- 그래서 v1에서는 설치 성공률과 안정성을 우선하고, 훅 parity는 후속 과제로 분리한다.

---

## 6. v1 지원 범위와 제외 범위

## 6.1 지원 범위

v1에서 지원하는 항목은 아래와 같다.

- Codex target 선택 및 설치
- repo-local plugin 구조 생성
- plugin manifest 생성
- marketplace 등록 또는 병합
- `AGENTS.md` 생성
- 기본 `skills`, `commands`, `agents` 배치
- Codex로 이식 가능한 최소 hook 연결
- Codex 제외 자산 목록 메타데이터 기록

> **team-orchestration 연결**: Team Orchestration 문서(`docs/team-orchestration/`)는 claude-kit 자산(12 agents / 30 commands / 23 skills)을 전제한다. Codex 타겟 시 Full 지원 자산(skills, commands, agents)은 동일하게 사용 가능하지만, Partial/Excluded 자산(hooks, rules, mcp)의 차이는 팀 오케스트레이션 운영 시 고려해야 한다.

### 왜 이것들은 지금 해야 하는가

- 이것들이 있어야 비로소 "Codex 지원"이라고 부를 수 있다.
- plugin, manifest, marketplace, 기본 자산 배치가 빠지면 Codex 설치는 형식만 있고 실제 사용 가능한 상태가 되지 않는다.

## 6.2 부분 지원

아래 항목은 v1에서 부분 지원으로 본다.

- hook
- rule 자산 연결
- 문서 내부 경로 치환
- 자산 본문 중 Claude 전용 표현의 자동 변환

### 왜 부분 지원인가

- 이 영역들은 설치 자체보다 런타임 의미 차이가 더 중요하다.
- 완전 지원을 선언하기에는 불확실성이 있고, 완전 제외하기에는 가치가 있다.
- 따라서 "안전한 범위만 지원"하는 중간지점이 v1에 가장 적합하다.

## 6.3 제외 범위

아래 항목은 v1에서 명시적으로 제외한다.

- `~/.claude` 홈 디렉토리 의존
- `CLAUDE_SESSION_ID`
- `CLAUDE_REMOTE_SESSION`
- Claude remote session 전용 동작
- Anthropic 전용 MCP 또는 설정 흐름
- Codex 전역 홈 설치 자동화
- Claude와 Codex 간 동일한 settings semantics 보장

### 왜 지금 하면 위험한가

- 이 항목들은 설치 모델만으로 해결되지 않고 플랫폼 런타임 계약을 다시 정의해야 한다.
- 잘못 포함하면 "지원한다고 문서에 써놨는데 실제로는 부분 동작"인 상태가 생긴다.
- v1은 지원 범위를 넓히는 것보다, 지원한다고 적은 범위를 확실하게 지키는 편이 더 중요하다.

---

## 7. 검증 계획

## 7.1 검증 시나리오

### 시나리오 A: `claude only`

- `targets=["claude"]` (또는 targets 필드 생략)
- 기존 설치 결과가 유지되는지 확인

```bash
# 실행
echo '{"domains":["core","dev"]}' > profile.json && pnpm run setup

# 기대 결과
# - .claude/ 폴더 정상 생성
# - CLAUDE.md 생성
# - plugins/ 폴더 미생성
# - .claude-kit-meta.json에 targets: ["claude"]
```

### 시나리오 B: `codex only`

- `targets=["codex"]`
- Codex plugin 구조가 완전 생성되는지 확인

```bash
# 실행
echo '{"domains":["core","dev"],"targets":["codex"]}' > profile.json && pnpm run setup

# 기대 결과
# - plugins/claude-kit/ 폴더 생성
# - plugins/claude-kit/.codex-plugin/plugin.json 생성
# - AGENTS.md 생성
# - .agents/plugins/marketplace.json 생성 또는 병합
# - .claude/ 폴더 미생성
# - .claude-kit-meta.json에 skippedForCodex 기록
```

### 시나리오 C: `claude + codex`

- `targets=["claude","codex"]`
- `.claude/`와 Codex plugin이 동시에 생성되고 서로 덮어쓰지 않는지 확인

```bash
# 실행
echo '{"domains":["core","dev"],"targets":["claude","codex"]}' > profile.json && pnpm run setup

# 기대 결과
# - .claude/ 폴더 정상 생성
# - plugins/claude-kit/ 폴더 정상 생성
# - CLAUDE.md + AGENTS.md 각각 생성
# - 두 타겟의 자산이 서로 덮어쓰지 않음
```

### 시나리오 D: `update install`

- 기존 `CLAUDE.md`, `AGENTS.md`, marketplace 파일이 있을 때 병합/보존 규칙이 유지되는지 확인

```bash
# 실행 (이미 설치된 프로젝트에서 재설치)
pnpm run setup

# 기대 결과
# - 기존 CLAUDE.md, AGENTS.md 보존 (덮어쓰기 안 함)
# - marketplace.json 기존 엔트리 유지 + claude-kit 엔트리 병합
# - 중복 plugin 엔트리 생성 안 함
```

## 7.2 검증 항목

| 검증 항목 | 확인 내용 |
|------|------|
| 생성 파일 트리 | 예상된 출력 경로가 모두 생성되는지 |
| 기존 파일 보존 | `CLAUDE.md`, `AGENTS.md`가 불필요하게 덮어써지지 않는지 |
| marketplace 중복 방지 | 같은 plugin entry가 중복 생성되지 않는지 |
| hook 경로 유효성 | Codex hook 설정이 실제 파일 경로를 가리키는지 |
| skip 기록 | 제외된 자산이 메타데이터에 기록되는지 |
| Claude 회귀 없음 | 기존 `.claude` 설치 흐름이 깨지지 않는지 |

## 7.3 문서 리뷰 기준

이번 문서 보강의 리뷰 기준은 기능 구현이 아니라 결정 완결성이다.

- 문서만 읽고도 왜 plugin 구조인지 이해할 수 있어야 한다.
- 문서만 읽고도 왜 hooks/session runtime을 그대로 이식하지 않는지 이해할 수 있어야 한다.
- `목표`, `비목표`, `Locked Decisions`, `지원/제외 범위`가 서로 모순되지 않아야 한다.
- 각 결정은 저장소 근거나 로컬 Codex 구조 근거와 연결되어야 한다.
- v1과 후속 과제의 경계가 분명해야 한다.

## 7.4 자체 점검 관점

- Claude 사용자 관점: 왜 기존 흐름이 깨지지 않는가
- Codex 사용자 관점: 왜 plugin으로 설치되는가
- 구현자 관점: 어디까지 만들고 무엇은 아직 안 만드는가

---

## 8. 구현 순서

1. 이 문서를 승인한다.
2. `setup.js`를 멀티타깃 설치 구조로 리팩터링한다.
3. Codex용 템플릿과 manifest 생성 로직을 추가한다.
4. Codex emitter를 구현한다.
5. 스모크 검증을 수행한다.
6. 구현 완료 후 `README.md`와 `docs/guide` 설치 설명을 갱신한다.

## 8.1 세부 작업 순서

### Step 1. 데이터 모델 확장

- `profile.json`의 `targets` 처리 추가
- `.claude-kit-meta.json` 확장

### Step 2. 설치기 구조 분리

- 도메인 해석 로직 유지
- 타깃 해석 로직 추가
- emitter 인터페이스 도입

### Step 3. Codex 출력기 구현

- plugin root 생성
- plugin manifest 생성
- marketplace 생성 또는 병합
- `AGENTS.md` 생성
- 자산 복사 및 필요한 경로 치환

### Step 4. hook과 skip 처리

- Codex 호환 hook만 출력
- 제외 항목은 skip 목록에 기록

### Step 5. 검증 및 문서 업데이트

- 4개 시나리오 테스트
- 구현 후 README/guide 업데이트

---

## 9. 후속 문서 반영 범위

이 문서 단계에서는 구현 명세만 작성한다.

아래 문서는 구현 완료 후에만 반영한다.

- [`README.md`](../../README.md)
- `docs/guide`의 설치 관련 문서
- 필요 시 `docs/guide/09-architecture.md`

### 왜 구현 전에 가이드를 바꾸지 않는가

- 구현 전에 문서를 먼저 바꾸면 실제 소스와 문서가 어긋난다.
- 특히 설치 경로, manifest, marketplace, hook 지원 여부는 구현 결과를 보고 고정해야 한다.
- 따라서 v1에서는 먼저 명세를 잠그고, 실제 emitter와 출력 구조가 확정된 뒤 가이드를 업데이트한다.

---

## 10. Locked Decisions

- Codex v1 기본 설치 위치는 전역 `~/.codex`가 아니라 프로젝트 로컬 plugin 구조다.
- 기존 Claude 사용자는 설정 변경 없이 그대로 동작해야 한다.
- `profile.json`의 새 인터페이스는 `domains` 유지 + `targets` 추가로 끝낸다.
- `.claude-kit-meta.json`에는 `targets`, 생성 결과, Codex 제외 자산 목록을 추가한다.
- `mcp-servers.json`의 Codex 직접 이식은 v1 필수 범위에서 제외한다.
- Codex 컨텍스트 문서는 `AGENTS.md`를 기준으로 한다.
- hook은 최소 이식 원칙을 따른다.

---

## 11. 결정별 후속 과제

- `hooks parity`
  - v2에서 Codex 이벤트 모델과 런타임 계약 검토 후 확장
- `global codex install`
  - 운영 모델, 충돌 정책, uninstall 전략 검토 후 재논의
- `mcp migration`
  - plugin/app/auth 설계가 확정된 뒤 별도 작업으로 진행
- `rules packaging`
  - Codex에서 rules를 어떤 단위로 배치하고 참조할지 후속 결정 필요

---

## 12. References

### 저장소 내부 근거

- [`scripts/setup.js`](../../scripts/setup.js)
- [`README.md`](../../README.md)
- [`src/templates/CLAUDE.md.template`](../../src/templates/CLAUDE.md.template)
- [`src/templates/settings.json.template`](../../src/templates/settings.json.template)
- [`src/templates/profile.json.template`](../../src/templates/profile.json.template)

### 로컬 Codex 참조 근거

- `C:/Users/user/.codex/skills/.system/plugin-creator/references/plugin-json-spec.md`
- `C:/Users/user/.codex/.tmp/plugins/plugins/figma/.codex-plugin/plugin.json`
- `C:/Users/user/.codex/.tmp/plugins/plugins/figma/hooks.json`

### 외부 참고

- [Using Codex with your ChatGPT plan - Plugins](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan.pdf)

