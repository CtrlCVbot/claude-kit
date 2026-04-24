# Official Anthropic Benchmark

## 1. Claude Code model configuration 공식 기준

공식 문서: [Claude Code model configuration](https://code.claude.com/docs/en/model-config)

### 핵심 규칙

| 항목 | 공식 기준 |
|---|---|
| 기본 모델 설정 우선순위 | `/model` → `claude --model` → `ANTHROPIC_MODEL` → settings `model` |
| alias | `sonnet`, `opus`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan` |
| 제한 | `availableModels`로 허용 모델 집합을 제한 가능 |
| pinning | `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` |
| provider-specific capability 보정 | `_SUPPORTED_CAPABILITIES`, `_NAME`, `_DESCRIPTION` suffix 지원 |

### claude-kit와 비교할 때 중요한 의미

1. 공식 Claude Code는 모델을 settings/env 레벨에서도 강하게 제어할 수 있다.
2. alias pinning은 운영 안정성을 위해 중요한 기능이다.
3. `availableModels`는 단순 초기값이 아니라 조직 정책 수단이다.

## 2. Claude Code settings 공식 기준

공식 문서: [Claude Code settings](https://code.claude.com/docs/en/settings)

### Scope / precedence

| Scope | 위치 | 특징 |
|---|---|---|
| Managed | managed settings | 최상위, override 불가 |
| User | `~/.claude/settings.json` | 개인 전역 |
| Project | `.claude/settings.json` | 팀 공유 |
| Local | `.claude/settings.local.json` | 프로젝트 내 개인 override |

우선순위:

1. Managed
2. Command line
3. Local
4. Project
5. User

### claude-kit와 비교할 때 중요한 의미

1. `.claude/settings.json`는 공식적이고 강력한 모델 정책 표면이다.
2. `profile.json`은 공식 Claude Code 표면이 아니라 claude-kit 설치용 보조 abstraction이다.
3. 따라서 claude-kit가 settings의 모델 제어 기능을 얼마나 노출하느냐가 운영력 차이를 만든다.

## 3. Claude Code subagents 공식 기준

공식 문서: [Create custom subagents](https://code.claude.com/docs/en/sub-agents)

### 모델 관련 핵심 규칙

| 항목 | 공식 기준 |
|---|---|
| subagent `model` | alias / full model ID / `inherit` 가능 |
| 기본값 | omitted 시 `inherit` |
| resolution order | `CLAUDE_CODE_SUBAGENT_MODEL` → per-invocation `model` → subagent frontmatter `model` → main conversation model |
| 함께 조절 가능한 항목 | tools, permissionMode, skills, hooks, memory, effort, isolation, background |

### claude-kit와 비교할 때 중요한 의미

1. 현재 claude-kit의 Claude agent frontmatter `model: opus`는 공식 subagent 표면에 맞는 설정 방식이다.
2. 하지만 `inherit`, per-invocation override, `CLAUDE_CODE_SUBAGENT_MODEL`, `effort` 활용은 거의 패키징되지 않았다.
3. "모든 agent를 opus로 고정"은 공식 기능을 일부만 쓰는 셈이다.

## 4. Advisor tool 공식 기준

공식 문서: [Advisor tool](https://platform.claude.com/docs/ko/agents-and-tools/tool-use/advisor-tool)

### Advisor tool의 공식 정의

- 빠른 executor 모델과 더 높은 지능의 advisor 모델을 짝지어 생성 중간에 전략 지침을 제공하는 beta server tool
- 대부분의 턴이 기계적이지만 뛰어난 계획이 중요한 장기 agentic workload에 적합
- API-level 기능이며 `Claude Code subagent`와는 다른 표면

### 언제 적합한가

| 적합 | 이유 |
|---|---|
| Sonnet 기반 복잡 작업 | Opus advisor 추가로 품질 향상 가능 |
| Haiku 기반 장기 작업 | executor 업그레이드보다 낮은 비용으로 지능 보강 가능 |
| 장기 코딩/연구 파이프라인 | 대부분은 executor가 처리하고, 전략 지점만 advisor가 개입 |

### 언제 부적합한가

| 부적합 | 이유 |
|---|---|
| 단일 턴 Q&A | 계획 단계가 거의 없음 |
| 순수 모델 셀렉터 | 사용자가 이미 직접 비용/품질을 고르는 상황 |
| 모든 턴이 최상위 지능 필요 | advisor 분리 이점이 적음 |

### API 계약

| 항목 | 공식 기준 |
|---|---|
| beta header | `advisor-tool-2026-03-01` 필요 |
| tool type | `advisor_20260301` |
| advisor model | tool 정의의 `model`에 명시 |
| max uses | 요청 단위 제한 가능 |
| caching | advisor 자체 기록 캐싱 지원 |
| compatibility | advisor는 executor 이상 능력이 있어야 함 |

### 작동 방식

1. executor가 `server_tool_use`로 advisor 호출
2. 서버가 전체 history를 advisor에 전달
3. advisor의 조언이 `advisor_tool_result`로 executor에 반환
4. executor가 조언을 반영해 계속 생성

핵심 차이:
이 패턴은 "별도 worker를 spawn"하는 것이 아니라 "같은 요청 내부에서 전략 조언을 주고받는 model choreography"다.

## 5. 비공식 보조 참고의 위치

보조 참고: [How to Use Claude’s Advisor Strategy to Get Opus-Level Results at Sonnet Prices](https://chatgptguide.ai/claude-advisor-strategy/)

이 글은 다음 관점에서는 유용하다.

- advisor를 "routing logic 없는 self-escalation" 전략으로 해석
- executor/advisor 비용을 분리해 보려는 운영 관점 제시

하지만 다음은 공식 기준으로 삼지 않는다.

- 구체 비용 숫자
- 일반화된 절감률
- 모든 워크로드에 대한 보편적 결론

## 6. Benchmark로부터 도출되는 평가 프레임

이번 저장소를 평가할 때 공식 기준으로 봐야 할 질문은 아래 6개다.

1. 모델 기본값을 어디서 선언하는가
2. 모델 override를 어디서 허용하는가
3. alias pinning과 allowlist를 지원하는가
4. subagent별 model/effort/memory를 얼마나 보존하는가
5. target 간 모델 parity를 추적하는가
6. advisor-style orchestration을 지원할 설계 여지가 있는가

