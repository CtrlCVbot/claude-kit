# Terminology Normalization

## 목적

이번 분석에서 가장 먼저 정리해야 하는 문제는 `Advisor tool`, `Claude Code subagent`, `Codex agent`, `settings model`, `frontmatter model`이 서로 다른 레이어의 개념이라는 점이다. 용어를 섞으면 문제 진단이 흐려진다.

## 정규화 테이블

| 용어 | 공식/저장소 기준 의미 | 이 패키지에서의 사용 규칙 |
|---|---|---|
| `Advisor tool` | Anthropic Claude API의 beta server tool. 빠른 `executor`가 더 강한 `advisor`에게 전략 조언을 받는 패턴. | API-level 기능으로만 사용한다. `subagent`와 동의어로 쓰지 않는다. |
| `executor model` | 최상위 `model` 필드로 요청을 실제 수행하는 모델 | Advisor 문맥에서만 사용 |
| `advisor model` | `tools[].model`에 지정된 상위 전략 모델 | Advisor 문맥에서만 사용 |
| `Claude Code subagent` | `.claude/agents/*.md` 또는 user/project scope에 정의되는 Claude Code용 작업 단위 | Claude Code 문맥에서만 사용 |
| `Codex agent` | `.codex/agents/*.toml` 또는 `src/codex/**/agents/*.md`에서 유도되는 Codex용 에이전트 자산 | Codex 문맥에서만 사용 |
| `frontmatter model` | agent markdown frontmatter의 `model:` 값 | source-asset 레벨 모델 설정 |
| `settings model` | `.claude/settings.json`의 `model` 필드 | Claude Code 프로젝트/로컬/유저 설정 레벨 모델 설정 |
| `session model` | `/model`, `claude --model`, `ANTHROPIC_MODEL` 등으로 현재 세션에 적용된 모델 | runtime 레벨 모델 설정 |
| `model alias` | `sonnet`, `opus`, `haiku`, `opusplan` 같은 Claude Code 별칭 | Claude Code 공식 alias 의미로만 사용 |
| `pinning` | `ANTHROPIC_DEFAULT_OPUS_MODEL` 등으로 alias가 가리키는 실제 모델 버전을 고정 | provider별 버전 관리 의미로 사용 |
| `source asset` | `src/claude/**`, `src/codex/**`, `src/templates/**`처럼 authoring의 SSOT가 되는 파일 | generated output과 구분 |
| `emitter` | `scripts/setup.js`가 source asset을 runtime output으로 배포하는 단계 | 런타임 생성 로직 의미 |
| `generated runtime` | `.claude/settings.json`, `AGENTS.md`, `plugins/claude-kit/**`, `.codex/agents/*.toml` 등 배포 산출물 | 기본적으로 직접 수정 대상 아님 |
| `pairing` | Claude/Codex 자산이 대응 관계를 갖는지 추적하는 메타데이터 | 존재 parity 중심, 의미 parity와 구분 |
| `drift` | 두 타깃 간 의미 또는 구현이 어긋나는 상태 | 단순 파일 존재 차이보다 넓은 의미 |

## 혼동이 잦은 포인트

### 1. `Advisor tool` vs `subagent`

| 항목 | Advisor tool | Claude Code subagent |
|---|---|---|
| 실행 위치 | Anthropic API 내부 | Claude Code 런타임 내부 |
| 호출 방식 | executor가 tool처럼 필요 시 호출 | Claude가 description 기반으로 위임 |
| 컨텍스트 | 같은 `/v1/messages` 요청의 전체 기록 | 별도 context window |
| 권한/도구 | advisor는 별도 도구 없이 조언만 반환 | tools, permissions, hooks, memory 설정 가능 |
| 산출물 | 전략 텍스트 조언 | 독립 작업 결과 |

규칙: 이번 패키지에서는 "전략 조언 계층"을 말할 때도 공식 기능이면 `Advisor tool`, 개념 차용이면 `advisor-style pattern`이라고 구분한다.

### 2. `profile.json` vs `.claude/settings.json`

`profile.json`은 "무엇을 설치할 것인가"를 결정한다.  
`.claude/settings.json`은 "설치된 결과를 런타임에서 어떻게 사용할 것인가"를 결정한다.

따라서 `profile.json`은 직접 모델명을 거의 들고 있지 않지만, 어떤 model-bearing agent가 런타임에 존재할지를 바꾸므로 간접 모델 구성 지점이다.

### 3. `paired` vs `same behavior`

`src/pairing-registry.json`의 `paired`는 Claude와 Codex에 대응 자산이 있다는 뜻이지, 두 자산이 모델/effort/permission까지 완전히 같은 의미를 가진다는 보장은 아니다.

## 이 패키지의 분석 단위

이번 분석은 모델 구성을 4개 레이어로 나눈다.

1. Source asset layer  
`src/claude/**/agents/*.md`, `src/codex/**/agents/*.md`, `src/templates/**`

2. Emitter layer  
`scripts/setup.js`, `scripts/merge-settings.js`

3. Runtime configuration layer  
`.claude/settings.json`, `.claude/settings.local.json`, env, `.codex/agents/*.toml`

4. Strategy/orchestration layer  
Anthropic `Advisor tool`, executor/advisor pairing, domain별 정책

## 보조 참고 문서의 취급 원칙

외부 글 [chatgptguide.ai의 advisor strategy 글](https://chatgptguide.ai/claude-advisor-strategy/)은 운영 해석과 비용 감각을 얻는 데는 도움이 되지만, 공식 동작 규칙의 출처는 아니다. 이번 패키지에서는 다음 규칙을 적용한다.

1. API 계약, 모델 호환성, 헤더, 응답 구조는 반드시 Anthropic 공식 문서를 따른다.
2. 외부 글의 비용/효율 수치는 "보조 해석"으로만 취급한다.
3. 공식 문서와 충돌하거나 저장소 구조와 맞지 않으면 버린다.

