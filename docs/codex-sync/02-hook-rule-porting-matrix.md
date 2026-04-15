# Hook / Rule Porting Matrix

## 1. 목적

이 문서는 Claude의 `hook`, `rule`을 Codex 공식 surface 또는 repo 차원의 fallback artifact로 어떻게 치환할지 정의한다.

주의: 아래 표는 현재 converter가 이미 이렇게 동작한다는 뜻이 아니라, 문서 기준의 권장 매핑표다.

여기서 중요한 구분은 다음과 같다.

- 공식 기능 존재 여부
- 현재 항목이 그 공식 기능의 의미와 범위에 실제로 맞는지 여부
- direct가 아닐 때 repo 차원의 fallback으로 의미를 얼마나 보존할지 여부

## 2. 근거 문서

- [Hooks](https://developers.openai.com/codex/hooks)
- [Rules](https://developers.openai.com/codex/rules)
- [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Skills](https://developers.openai.com/codex/skills)
- [CLI features](https://developers.openai.com/codex/cli/features)

## 3. Hook 유형 분류

| 유형 | Claude 의도 | 권장 Codex surface | 분류 | 공식 근거 | 제약 | 기본 결과 |
|---|---|---|---|---|---|---|
| `guard-hook` | 위험 작업 전에 차단 또는 확인 | Hooks | `공식 지원` | Hooks | 공식 범위와 matcher가 맞아야 하며, 현재 hook surface 제약을 넘지 않아야 한다. | `paired-direct` 우선 |
| `reminder-hook` | 실행 전후 안내 또는 경고 | Hooks | `공식 지원` | Hooks | `PreToolUse` / `PostToolUse`는 현재 문서상 `Bash` 범위를 먼저 확인해야 한다. | `paired-direct` 또는 `paired-review` |
| `output-filter-hook` | prompt-side validation 또는 Bash output 후처리 | Hooks, wrapper | `검증 필요` | Hooks | 비-Bash 도구 결과까지 direct로 다룬다고 확대 해석하면 안 된다. | `paired-direct` 후보 또는 `paired-review` |
| `stop-event-hook` | 세션 종료 시점에 후속 제안 | Hooks | `공식 지원` | Hooks | `Stop` event는 공식 지원이지만, 추가 상태 의존이 있으면 direct 재현과 별개로 검증이 필요하다. | `paired-direct` 후보 또는 `paired-review` |
| `stateful-hook` | 세션/호출 수 등 외부 상태에 의존 | skill, command, wrapper | `검증 필요` | Hooks, Skills, CLI features | 공식 hook 존재와 별개로 상태 소스 재현 가능성을 따로 판단해야 한다. | `paired-fallback` 또는 `paired-review` |
| `env-bound-hook` | Claude 전용 env 또는 홈 디렉터리 상태에 의존 | wrapper, command | `추정` | CLI features | env adapter와 wrapper는 공식 기능 조합을 쓰는 repo-level 설계이지, 공식 migration recipe는 아니다. | `paired-fallback` 우선 |

## 4. Hook 변환 규칙

| 조건 | 1차 판단 | 2차 판단 | 3차 판단 |
|---|---|---|---|
| event, matcher, tool 범위가 공식 Hooks 제약 안에 있음 | `paired-direct` | 제약이 일부 불명확하면 `paired-review` | - |
| `Stop` event는 맞지만 Claude 상태 파일 의존이 남음 | `paired-review` | skill 또는 command fallback | `review-needed` note |
| prompt-side validation으로 분해 가능 | Hook direct 후보 | wrapper 보조 | `review-needed` note |
| 비-Bash 도구 결과까지 한 번에 후처리하려 함 | direct 금지 | Bash 범위로 축소한 fallback 또는 wrapper | `review-needed` note |
| Claude 전용 env, 홈 디렉터리 상태 의존 | direct 보류 | wrapper 또는 command fallback | `review-needed` note |

## 5. Hook 실제 매핑

| Identity | 분류 | 공식 surface | 권장 처리 | 제약 |
|---|---|---|---|---|
| `code-quality-reminder` | `공식 지원` | Hooks | hook direct 후보 유지 | `PostToolUse`의 현재 범위가 실제 동작과 맞는지 확인 필요 |
| `security-auto-trigger` | `공식 지원` | Hooks | hook direct 후보 유지 | event와 tool 범위가 공식 matcher 안에 있어야 한다 |
| `dev-db-guard` | `공식 지원` | Hooks | hook direct 후보 유지 | `Bash` 중심 matcher 제약 확인 |
| `dev-tdd-guard` | `공식 지원` | Hooks | hook direct 후보 유지 | `Bash` 중심 matcher 제약 확인 |
| `plan-doc-guard` | `공식 지원` | Hooks | hook direct 후보 유지 | platform 제약과 matcher 범위 확인 |
| `output-secret-filter` | `검증 필요` | Hooks | 현재 Codex port는 유지하되, prompt-side validation과 Bash output 범위로 설명을 좁힌다 | 비-Bash 도구 결과까지 포괄하는 필터처럼 문서화하지 않는다 |
| `session-wrap-suggest` | `검증 필요` | Hooks, Skills, commands | `Stop` hook candidate로 재평가하고, Claude 상태 의존이 남으면 skill/command fallback 또는 `paired-review` | `Stop` event 존재와 state parity는 별도 문제다 |

## 5.1 문서 우선 해석 규칙

- 이 표의 `권장 처리`는 구현 완료 상태가 아니라 문서상 추천 경로다.
- 실제 구현이 다를 경우, 차이를 `03-sync-pipeline-design.md`의 "현재 구현과 차이" 기준으로 다시 적어야 한다.
- direct 후보라고 적혀 있어도 platform 제약과 runtime 검증이 끝나기 전에는 fallback 가능성을 닫지 않는다.

## 6. Rule 유형 분류

| 유형 | Claude 의도 | 권장 Codex surface | 분류 | 공식 근거 | 제약 | 기본 결과 |
|---|---|---|---|---|---|---|
| `exec-policy-rule` | sandbox 밖 명령 실행 정책 | Rules | `공식 지원` | Rules | 실제 의미가 allow/prompt/forbidden류와 맞을 때만 direct 후보 | `paired-direct` 후보 |
| `guidance-rule` | 상위 행동 원칙, 문체, 협업 방식 | `AGENTS.md`, Skills | `우회 가능` | AGENTS.md, Skills | 공식 surface는 맞지만 1:1 rule 매핑은 아니다 | `paired-fallback` |
| `quality-rule` | 코드 품질 기준 | `AGENTS.md`, Skills | `우회 가능` | AGENTS.md, Skills | Codex `Rules`로 강제하기보다 guidance로 흡수하는 편이 자연스럽다 | `paired-fallback` |
| `verification-rule` | 완료 판단과 검증 기준 | `AGENTS.md`, commands, Skills | `우회 가능` | AGENTS.md, Skills, CLI features | 실행 강제력보다 절차 지침에 가깝다 | `paired-fallback` |
| `security-guidance-rule` | 보안 체크리스트, 주의사항 | `AGENTS.md`, Skills | `우회 가능` | AGENTS.md, Skills | exec-policy와 guidance를 섞지 않도록 분리해야 한다 | `paired-fallback` |

## 7. Rule 실제 매핑

| Rule | 분류 | 공식 surface | 권장 처리 | 제약 |
|---|---|---|---|---|
| `coding-style.md` | `우회 가능` | `AGENTS.md`, Skills | coding section + 관련 skill note | Codex `Rules` direct 대상이 아니다 |
| `date-calculation.md` | `우회 가능` | `AGENTS.md`, commands | tooling section + command invocation note | guidance 성격이므로 `Rules` direct 대상이 아니다 |
| `golden-principles.md` | `우회 가능` | `AGENTS.md` | principles section으로 흡수 | exec-policy와 섞지 않는다 |
| `interaction.md` | `우회 가능` | `AGENTS.md` | interaction section으로 흡수 | 협업/응답 스타일 지침이다 |
| `security.md` | `우회 가능` | `AGENTS.md`, Skills | security section + review note | 일부 정책성 문구는 추후 exec-policy 후보로 별도 분리 가능 |
| `verification.md` | `우회 가능` | `AGENTS.md`, commands, Skills | verification section + verification note | 완료 기준과 실행 정책을 구분한다 |

## 8. 대표 치환 예시

### 8.1 `session-wrap-suggest`

- 공식 사실: Codex Hooks에는 `Stop` event가 있다.
- 남는 문제: 원본은 `~/.claude/.session-stats.json` 같은 Claude 상태 소스에 의존한다.
- 권장 순서:
  - 1차: `Stop` hook direct 후보로 검토
  - 2차: 상태 의존이 남으면 skill 또는 command fallback
  - 3차: 여전히 자동 판단이 어려우면 `review-needed` note 생성

### 8.2 `output-secret-filter`

- 공식 사실: Hooks는 공식 기능이며 prompt 검증과 일부 tool 흐름 개입을 지원한다.
- 남는 문제: 현재 문서상 `PostToolUse`를 비-Bash 도구 결과 전체로 확장해서 말할 수 없다.
- 권장 처리:
  - prompt-side validation은 hook direct 후보로 유지
  - output post-processing은 Bash 범위로 좁혀 설명
  - 일반 tool-wide output filter처럼 단정한 문장은 제거

### 8.3 `verification.md`

- 공식 사실: `AGENTS.md`와 Skills는 공식 instruction surface다.
- 권장 처리:
  - 1차: `AGENTS.md` verification section으로 흡수
  - 2차: verification command 또는 skill note 연결
  - 3차: 추후 exec-policy와 구분이 필요한 항목만 별도 검토

## 9. Review-Needed 초안 형식

자동 변환이 애매한 항목은 아래 정보를 반드시 남긴다.

- source path
- intended behavior
- official surface candidate
- evidence level
- failed direct mapping reason
- recommended fallback target
- runtime verification questions

권장 파일 위치는 `src/codex/{domain}/review-needed/{identity}.md`다.

## 10. 금지 규칙

- `rule`을 아무 산출물 없이 skip하지 않는다.
- `Stop` event가 없다는 전제를 다시 쓰지 않는다.
- `output-secret-filter`를 비-Bash 도구 결과까지 direct filter처럼 문서화하지 않는다.
- guidance-style `rule`을 Codex `Rules`와 동일 의미로 서술하지 않는다.
