# 현재 상태와 갭 분석

> 지금 저장소가 어떤 구조를 가지고 있고, 그 구조가 Codex 공식 가이드와 어디에서 어긋나는지 정리한 문서.

---

## 1. 현재 자산 구조

`src`는 아래 구조를 가진다.

- `core`: hooks, rules, skills
- `dev`: agents, commands, hooks, skills
- `plan`: agents, commands, hooks, skills
- `templates`: `AGENTS.md`, `plugin.json`, `marketplace-entry.json`, `profile.json` 등

즉 source authoring 모델은 분명히 Claude-first다.

- `agent`와 `command`는 Claude Code 스타일 markdown 자산이다.
- `skill`은 Codex skill과 유사한 디렉터리 구조를 일부 이미 갖고 있다.
- `src/core/rules/*.md`는 이름상 `rules`지만, 실제 내용은 coding style, verification, security 같은 작업 지침이다.
- 현재 저장소에는 Codex 공식 exec-policy 형식인 `.rules` 파일이 없다.
- `hook`은 Claude settings/hook 구조에 맞춰 설계된 항목이 섞여 있다.

이 저장소는 subagent 개념을 전혀 모르는 상태는 아니다. `README`에는 `~/.codex/config.toml`의 `collab = true`가 언급되고, 일부 source 문서에는 `subagent_type`이나 subagent workflow 표현이 이미 존재한다. 그러나 `docs/codex-compatibility/`는 이를 공식 Codex surface로 정리하지 못했다.

---

## 2. 현재 설치기의 Codex 처리

`scripts/setup.js`는 이미 `emitClaude()`와 `emitCodex()`를 분리해 가지고 있다. 그러나 Codex emitter의 핵심 가정은 여전히 path copy에 가깝다.

현재 Codex emitter의 특징:

- `agents`, `commands`, `skills`를 `plugins/claude-kit/`로 그대로 복사
- hooks는 `scripts/codex-hook-compat.js`의 filename 예외 리스트로만 필터링
- 호환 hook은 `plugins/claude-kit/hooks/`와 `plugins/claude-kit/hooks.json` 생성
- `AGENTS.md`, `plugin.json`, `marketplace.json` 생성
- `.codex/agents/*.toml`나 `.codex/config.toml [agents]`는 전혀 다루지 않음
- `.codex/rules/*.rules`나 `codex execpolicy check` 기반 검증은 전혀 다루지 않음

이 구조는 "Codex용 설치 결과가 있다"는 점에서는 진전이 있지만, "Codex 공식 surface에 맞는가" 기준으로 보면 아직 불안정하다.

---

## 3. 공식 Codex 기준과의 주요 갭

### 3.1 source authoring 갭

- `agent`와 `command` 본문은 Claude slash command, Claude agent frontmatter, `.claude/skills/...` 참조 같은 Claude 전용 문법에 강하게 묶여 있다.
- 어떤 자산이 Codex에서 직접 재사용 가능한지, 변환이 필요한지, Codex 전용 구현이 필요한지 source 단계에서 선언되지 않는다.
- `agent` 자산이 custom subagent 후보인지, skill 후보인지, skip 대상인지가 문서화되지 않는다.
- `src/core/rules/*.md`가 instruction rule인지, exec-policy rule인지 같은 용어 분리가 없다.
- 결과적으로 Codex 대응 판단이 source에 있지 않고 installer 내부 암묵 로직에 숨어 있다.

### 3.2 installer 갭

- `agents`, `commands`, `skills`를 모두 같은 방식으로 복사한다.
- Codex에서 직접 쓰기 어려운 `agent`와 `command`도 skill과 비슷하게 취급한다.
- hooks는 자산 선언이 아니라 filename 리스트 기반으로 호환 여부를 판단한다.
- `.codex/agents/*.toml`와 `[agents]` 설정을 전혀 다루지 않는다.
- `discover -> classify -> transform -> emit` 중 `classify`와 `transform` 단계가 약하다.
- instruction rule을 `AGENTS.md`로 보내는 흐름과, exec-policy rule을 `.codex/rules/*.rules`로 보내는 흐름이 구분되어 있지 않다.

### 3.3 rules 의미와 exec-policy 갭

- 현재 저장소에는 실제 `.rules` 자산이 없고 `prefix_rule`도 없다.
- 현재 문서의 유일한 `rule` 대응 제안은 `AGENTS.md` summary다.
- 공식 Codex `Rules`가 다루는 아래 요소가 빠져 있다.
  - `.codex/rules/*.rules`
  - `prefix_rule`
  - `decision = allow / prompt / forbidden`
  - 다중 규칙 충돌 시 most restrictive wins
  - shell wrapper와 compound command 분해 규칙
  - `codex execpolicy check`
  - `requirements.toml [rules]`
- 즉 현재 문서의 `rule` 논의는 사실상 instruction guidance 논의이며, 공식 exec-policy layer는 비어 있다.

### 3.4 template 갭

- `src/templates/plugin.json.template`는 `skills`와 `hooks`를 함께 manifest에 넣고 있다.
- 공식 Codex plugin 문서는 plugin root에 `skills/`, `.app.json`, `.mcp.json` 같은 bundled component를 두는 구조를 설명하지만, hook runtime config와 exec-policy rules, subagent config는 plugin surface가 아니라 별도 surface다.
- `src/templates/marketplace-entry.json.template`는 `name/path/enabled` 중심의 단순 포맷인데, 공식 repo marketplace 예시는 `plugins[]`, `source`, `policy`, `category` 구조를 사용한다.
- custom subagent용 TOML template이나 `.codex/config.toml [agents]` 안내 template이 없다.
- optional `default.rules` 예시/template도 없다.

### 3.5 user experience와 보안 갭

- `.claude` 결과물을 Codex가 직접 읽지 못한다는 사실이 source와 installer 설계에 충분히 반영되어 있지 않다.
- `plugins/claude-kit/commands`나 `plugins/claude-kit/agents`에 파일이 있다고 해서 Codex에서 바로 user-facing command 또는 agent UX가 생기지 않는다.
- Codex에서 가장 안정적인 직접 사용 단위는 skill인데, 현재 문서와 코드 모두 이를 중심 단위로 재정렬하지 못했다.
- subagents는 명시적 지시가 있을 때만 쓰는 workflow인데, 현재 문서에는 trigger와 suitability 기준이 없다.
- exec-policy rules는 보안/승인 정책 layer인데, 현재 문서에서는 instruction rules와 분리된 설계 대상으로 다뤄지지 않는다.

---

## 4. 자산 종류별 현재 상태 판단

| 자산 | 현재 상태 | 현재 문제 |
|------|------|------|
| `skill` | 비교적 양호 | plugin-bundled skill 또는 `.agents/skills` 기준으로 재정리 가능 |
| `instruction rule` | 부분 양호 | `src/core/rules/*.md`를 `AGENTS.md`로 보내는 규칙을 더 명시적으로 설명해야 함 |
| `exec-policy rule` | 부재 | `.codex/rules/*.rules`, `prefix_rule`, `execpolicy check` 흐름이 없음 |
| `hook` | 취약 | runtime 위치와 지원 범위가 공식 가이드와 어긋남 |
| `command` | 취약 | Claude command markdown을 그대로 복사해도 Codex UX가 생기지 않음 |
| `agent` | 취약 | Claude agent markdown을 그대로 복사해도 Codex native agent surface가 아님 |
| `template` | 혼재 | 일부는 유용하지만 plugin/marketplace/hook/subagent/rules 관련 template 재정의 필요 |

---

## 5. subagent 후보군 분석

현재 source 예시를 기준으로 보면 `agent` 자산은 일괄 대응 대상이 아니라 suitability가 갈린다.

### 강한 후보

- `dev-architect`
- `dev-code-reviewer`
- `dev-database-reviewer`
- `dev-security-reviewer`
- `plan-reviewer`

이 계열은 대체로 역할이 좁고, read-heavy 분석과 요약 deliverable에 가깝다. custom subagent로 옮길 잠재력이 높다.

### 조건부 후보

- `dev-doc-updater`
- `plan-prd-writer`
- `plan-wireframe-designer`

이 계열은 산출물 작성 비중이 높아 write 범위와 bounded-write 정책이 명확하지 않으면 병렬 subagent 기본안으로 두기 어렵다.

### 비우선 후보

- `dev-feature`
- `plan-idea`

이 계열은 user entrypoint나 orchestration command에 가깝다. Codex에서는 skill 또는 documented entrypoint로 두고, subagent는 내부 delegation 패턴으로만 쓰는 편이 자연스럽다.

---

## 6. 문서에서 반드시 고정해야 할 결론

- 현재 저장소는 Claude-first source model이다.
- `src/core/rules/*.md`는 이름과 달리 instruction rule 자산이다.
- Codex 대응을 위해 가장 먼저 필요한 것은 "source 자산 분류"다.
- `skill`은 재사용 가능성이 높지만, `command`와 `agent`는 그대로 복사하는 방식으로는 부족하다.
- `agent` 대응에는 skill, subagent, `AGENTS.md`, skip의 네 축이 모두 필요하다.
- hooks는 filename 예외 처리에서 자산 선언 기반 판단으로 넘어가야 한다.
- instruction rule은 `AGENTS.md`로 보내고, exec-policy rule은 별도 Codex-native asset로만 다뤄야 한다.
- plugin/marketplace/template도 공식 Codex 가이드 기준으로 다시 정렬해야 한다.
