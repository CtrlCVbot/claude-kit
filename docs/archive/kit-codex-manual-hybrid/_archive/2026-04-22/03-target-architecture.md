# 03 Target Architecture

> 목적: 복제형 구조를 대체할 목표 구조를 정의한다.

## 1. 아키텍처 원칙

### 1.1 Manual-first

workflow 설명, 파이프라인 정의, 기능 선택 기준, 예외 규칙은 `shared manual`에 모은다.

### 1.2 Native-runtime-minimum

실행에 실제로 필요한 surface만 각 runtime에 남긴다.

- Claude: `.claude/`
- Codex: `AGENTS.md`, `skills`, `.codex/agents`, compatible hooks

### 1.3 No runtime dependency on `.claude`

Codex가 `.claude`를 공식 runtime source처럼 직접 읽어야만 동작하는 구조는 목표에서 제외한다.

## 2. Canonical path decision

`shared manual`의 canonical source path는 `src/shared/manuals/`로 정한다.

| Option | Decision | Reason |
|---|---|---|
| `src/shared/manuals/` | Chosen | generator 입력 소스와 runtime 산출물의 경계를 잡기 쉽다 |
| `docs/shared/` | Not chosen | 설명 문서에는 적합하지만 build/generator source로는 책임이 흐려진다 |
| separate package | Not chosen for now | 장기 옵션일 수 있으나 현재 단계에서는 복잡도를 먼저 높인다 |

## 3. 목표 구조

```text
src/
├─ shared/
│  ├─ manuals/
│  │  ├─ workflow-routing.md
│  │  ├─ plan-pipeline.md
│  │  ├─ dev-pipeline.md
│  │  ├─ copy-pipeline.md
│  │  ├─ hook-behavior.md
│  │  └─ runtime-differences.md
│  └─ manifests/
│     ├─ workflows.json
│     ├─ agents.json
│     └─ hooks.json
├─ claude/
└─ codex/
```

핵심은 설명의 원본이 `.claude` 밖의 공유 경로에 있어야 한다는 점이다.

## 4. Codex runtime surface

### 4.1 `AGENTS.md`

`AGENTS.md`는 Codex에서 운영 매뉴얼의 메인 진입점이 된다.

- workflow 선택 규칙
- 어떤 skill을 먼저 고려해야 하는지
- 어떤 문서를 먼저 읽어야 하는지
- Claude와 Codex의 차이
- hook 제약과 보장 범위

### 4.2 Skills

Codex plugin은 `skills` 중심으로 재구성한다.

- router skill
- workflow skill
- reference skill
- verification skill

각 skill은 필요한 경우 `shared manual`을 참조한다.

### 4.3 Custom agents

Codex custom agents는 `.codex/agents/*.toml`로 최소한만 둔다.

후보 예시:

- `reviewer`
- `planner`
- `explorer`
- `implementer`

각 agent는 장문의 pipeline 설명을 직접 들고 있기보다, `developer_instructions`에서 `shared manual`을 참조하는 얇은 진입점 역할을 맡는다.

### 4.4 Hooks

Codex hook은 보장 범위가 확실한 subset만 유지한다.

- shell/Bash 계열 guardrail
- lightweight reminder
- compatibility가 검증된 항목

문서 설명만으로 충분한 규칙은 hook이 아니라 `shared manual`과 `skills`로 옮긴다.

## 5. Claude runtime surface

Claude는 현재 구조를 유지하되, 설명 자산의 원본은 `shared manual`을 참조하도록 재정리한다.

- `.claude/hooks/*.js` 유지 가능
- `.claude/rules/*.md` 유지 가능
- Claude agent/command 문서 유지 가능
- 다만 장문의 파이프라인 설명은 shared source를 참조하도록 이동

## 6. Meta asset 처리 원칙

아래 자산은 “지금 당장 삭제”가 아니라 “책임 재정의” 대상으로 본다.

- `pairing-registry`
- `exception-registry`
- `codex-portability`

이 자산들은 다음 셋 중 하나로 귀속되어야 한다.

1. `shared manual`의 정책 문서
2. `shared manifests`의 구조 데이터
3. Codex/Claude 특정 runtime의 예외 목록

## 7. 무엇이 바뀌고 무엇이 남는가

| 항목 | 목표 상태 |
|---|---|
| Codex plugin 내부 `agents/commands` 복제 | 축소 또는 제거 대상 |
| Codex skill 배포 | 유지 및 강화 |
| `AGENTS.md` 기반 운영 매뉴얼 | 강화 |
| `.codex/agents/*.toml` | 도입 또는 강화 |
| Codex-compatible hooks | 제한적으로 유지 |
| `.claude` 직접 runtime 참조 | 금지 |

## 8. 최종 판단

목표 구조는 `한 파일을 모든 런타임이 그대로 실행`하는 구조가 아니다.

정확한 방향은 아래에 가깝다.

- 설명은 하나
- 실행 surface는 다르다
- generator는 shared source를 보고 각 runtime 산출물을 만든다

이 구조가 현재의 유지보수 비용을 낮추면서도 공식 Codex surface를 존중하는 가장 현실적인 방향이다.
