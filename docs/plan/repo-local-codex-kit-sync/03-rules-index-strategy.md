# Rules source parity와 AGENTS template 전략

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23

rules의 목표는 `.claude/rules/*.md`를 runtime `AGENTS.md`에 직접 복사하는 것이 아닙니다. source 단계에서 `src/claude/**/rules/*.md`를 분석하고, Codex에서는 `src/templates/AGENTS.md.template`의 routing index와 하위 guidance docs로 의미를 보존하는 것입니다.

## 1. 현재 판단

Codex 공식 `rules`는 sandbox 밖 command approval policy를 제어하는 실험 기능입니다. Claude Code `.claude/rules/`나 `src/claude/**/rules/*.md`는 행동 지침과 path-scoped guidance에 가깝습니다.

공식 Codex rules는 Team Config 계층의 `rules/*.rules` 파일로 스캔됩니다. 예시는 `~/.codex/rules/default.rules`처럼 Codex home 아래에 두는 형태입니다. 따라서 v1 계획에서는 repo-local `.codex/rules`나 임의의 project-local `.rules` output을 자동 생성하지 않습니다. rules 전환은 기본적으로 `AGENTS.md` routing index와 checked-in guidance docs로 처리하고, command approval로 승격할 수 있는 항목만 "rules policy candidate"로 기록합니다.

따라서 전환 원칙은 다음입니다.

| Claude rule 성격 | Codex target |
|------|------|
| 일반 행동 지침 | `src/templates/AGENTS.md.template` index + guidance docs |
| 특정 workflow 지침 | 관련 `src/codex/**/skills/**/references` |
| command approval policy | Codex rules policy candidate, v1 runtime 생성 없음 |
| 보안 정책 중 자동 차단 가능 항목 | rules policy candidate 또는 hook/verification candidate |

## 2. source mapping

| Claude source | Codex source/fallback | Runtime output |
|------|------|------|
| `src/claude/core/rules/verification.md` | `src/templates/AGENTS.md.template` index + `docs/codex-guidance/rules/verification.md` | `AGENTS.md` |
| `src/claude/core/rules/security.md` | guidance + `security-no-hardcoded-secrets`는 rules policy candidate | `AGENTS.md`, policy candidate doc |
| `src/claude/core/rules/coding-style.md` | guidance doc + dev skill references | `AGENTS.md`, `.agents/skills/**` |
| `src/claude/core/rules/date-calculation.md` | guidance doc | `AGENTS.md` |
| `src/claude/core/rules/interaction.md` | guidance doc | `AGENTS.md` |
| 기타 domain rules | domain guidance 또는 skill references | `AGENTS.md` 또는 skill reference |

## 3. Codex `.rules` 생성 정책

v1에서는 Codex `.rules` 파일을 생성하지 않습니다. 이유는 `.rules`가 일반 지침 문서가 아니라 sandbox 밖 command approval policy이고, 실제 스캔 위치가 Codex Team Config 계층에 묶이기 때문입니다.

| 상태 | v1 동작 |
|------|--------|
| 일반 guidance | `src/templates/AGENTS.md.template` routing index + `docs/codex-guidance/rules/*.md` |
| command approval 후보 | `docs/codex-guidance/rules/policy-candidates/*.md` 같은 source doc에 후보로 기록 |
| 실제 `.rules` 생성 | 보류. Team Config 위치, opt-in 방식, overwrite 정책이 확정된 후 별도 phase에서 처리 |
| `kit-analyze` 표시 | `rules-policy-candidate`로 표시하되 `paired-direct`로 단정하지 않음 |
| `kit-sync` 수정 대상 | template/guidance/policy candidate source만 수정, generated `.rules` output은 수정하지 않음 |

후속 phase에서 실제 `.rules`를 지원하려면 output 위치, 사용자 승인 방식, 기존 user/admin rules와의 merge 정책, `prefix_rule()` inline test 검증을 별도 계약으로 추가해야 합니다.

## 4. `AGENTS.md.template` 목표 형식

`src/templates/AGENTS.md.template`는 현재 rules 일부를 medium merge한 본문을 포함합니다. 목표 상태는 본문을 줄이고 routing index를 강화하는 것입니다.

```markdown
## Codex rule index

- Completion or verification claim:
  read `docs/codex-guidance/rules/verification.md`.
- Security-sensitive edit:
  read `docs/codex-guidance/rules/security.md`.
- Source parity work inside the `claude-kit` repository:
  read `docs/codex-guidance/rules/source-parity.md`.
- Date/time/schedule work:
  read `docs/codex-guidance/rules/date-calculation.md`.
```

## 5. `kit-analyze` 책임

`kit-analyze`는 rules를 다음처럼 판정해야 합니다.

| 판정 | 의미 |
|------|------|
| `paired-fallback` | rule 본문은 Codex guidance/template로 의미 보존 |
| `rules-policy-candidate` | Codex rules로 policy화 가능하지만 v1에서는 실제 `.rules` 생성 보류 |
| `paired-review` | 사람 검토 필요 |
| `blocked` | Codex에서 의미 보존 불가 |
| `drift` | Claude rule 변경이 Codex template/docs에 반영되지 않음 |

## 6. `kit-sync` 책임

`kit-sync`는 rules에 대해 generated `AGENTS.md`를 직접 수정하지 않습니다. 대신 다음 source를 갱신합니다.

- `src/templates/AGENTS.md.template`
- `docs/codex-guidance/rules/*.md`
- 필요 시 rules policy candidate source doc
- `src/pairing-registry.json`
- `src/exception-registry.json`
- `src/claude/_meta/codex-portability.json`

## 7. 검증 기준

- Claude rule 하나마다 Codex fallback 또는 direct target이 있어야 합니다.
- `AGENTS.md` output이 아니라 template/source docs가 변경 대상이어야 합니다.
- `src/templates/AGENTS.md.template`와 `src/claude/core/rules/*.md` 사이 drift를 검출해야 합니다.
- Codex rules policy candidate와 guidance fallback을 혼동하지 않아야 합니다.
- v1에서 `.codex/rules`, `~/.codex/rules`, Team Config `rules/*.rules`를 자동 생성하지 않아야 합니다.
