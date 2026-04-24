# Codex 전환 비-direct 대상 view (서술형)

> **이 문서는 SSOT가 아니다.** Codex 전환 판단의 권위 있는 출처는:
>
> - **예외/승인 흐름 SSOT**: `src/exception-registry.json`
> - **전략/공식 근거 SSOT**: `src/claude/_meta/codex-portability.json` (Phase 4 도입 예정)
>
> 이 view는 kit-converter가 비-direct 항목을 한눈에 파악하기 위한 **보조 문서**다. 판단 기준이 상충하면 `exception-registry`가 우선한다.
>
> 근거: `docs/archive/2026-04-17/codex-sync/03-sync-pipeline-design.md` §7 (registry 역할 분리), `docs/archive/2026-04-17/codex-sync/04-rollout-validation-plan.md` §4.2 (Phase 1 완료 기준).

## Hook 비-direct (2개)

| Identity | 도메인 | strategy | status | officialSurface | fallbackTarget | 사유 |
|----------|--------|----------|--------|-----------------|----------------|------|
| output-secret-filter | core | paired-direct | resolved | hooks | — | Codex sibling 생성 완료 (`src/codex/core/hooks/output-secret-filter.js`). prompt-side validation + Bash-scoped post-processing 범위 명시. EX-002 resolved (Phase 1). |
| session-wrap-suggest | core | paired-fallback | resolved | hooks.stop | skill | `Stop` event 자체는 Codex 공식 지원이나 Claude `~/.claude/.session-stats.json` 상태 파일 + tmpdir 마커 의존을 Codex runtime에서 1:1 재현 불가. EX-001 resolved (Phase 3): skill artifact `src/claude/core/skills/session-wrap-suggest/SKILL.md` 생성. |

## Rule fallback (7개)

> Codex `Rules`는 exec/approval policy다. Claude의 guidance-style rule과 의미가 다르므로 1:1 매핑하지 않고 `AGENTS.md` managed block으로 흡수한다. 현재는 6개 core rule + EX-009 dedicated secret block까지 총 7개 fallback artifact를 사용한다.

| Identity | 도메인 | strategy | status | officialSurface | fallbackTarget | 사유 |
|----------|--------|----------|--------|-----------------|----------------|------|
| golden-principles | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/10-golden-principles.md`. EX-005 |
| verification | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/30-verification.md`. EX-008 |
| coding-style | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/40-coding-style.md`. EX-003 |
| security | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/50-security.md`. EX-007 |
| security-no-hardcoded-secrets | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/55-security-no-hardcoded-secrets.md`. EX-009 |
| interaction | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/60-interaction.md`. EX-006 |
| date-calculation | core | paired-fallback | resolved | agents_md | agents-guidance | `src/templates/agents-md/90-date-calculation.md`. EX-004 |

## 총계

- Hook 비-direct: 2개 (1 paired-direct + 1 paired-fallback)
- Rule fallback: 7개 (모두 paired-fallback)
- **합계: 9개**

## 참고

- 이 문서는 변환 규칙 참조용 (서술형 view).
- Phase 1 이후 SSOT = `src/exception-registry.json` + `src/claude/_meta/codex-portability.json` (Phase 4 도입 예정). `skip-registry.md`는 서술형 보조 문서로 강등됨.
- `scripts/codex-hook-compat.js`의 `HOOK_PORTABILITY` 결과와 일치해야 한다 (consistency 검증은 `/kit-audit C7`).
- 신규 항목 추가 시 먼저 `exception-registry.json`을 갱신하고, 그 후 이 view를 동기화한다.
