# Review findings resolution

> **Status**: Draft plan (`docs/plan`, 2026-04-23)
> **공식 문서 기준 확인일**: 2026-04-23
> **범위**: review findings 반영 계획 문서. 실제 source, emitter, registry, generated output은 변경하지 않는다.

이 문서는 `repo-local-codex-kit-sync` 문서 패키지에 들어온 Finding 1~9를 어떻게 반영할지 추적합니다. 핵심 원칙은 두 가지입니다.

- `src/codex/kit/**`와 `src/claude/kit/**`는 만들지 않는다.
- `kit-sync`는 `claude-kit` 저장소 유지보수 파이프라인이며, 설치된 소비자 프로젝트 안에서 실행하는 기능이 아니다.

## 1. 이번 문서화 변경 범위

| 구분 | 파일 | 처리 |
|------|------|------|
| 새 문서 | `docs/plan/repo-local-codex-kit-sync/10-review-findings-resolution.md` | Finding 1~9의 결정, 후속 구현 파일, 검증 기준을 기록 |
| 기존 문서 | `docs/plan/repo-local-codex-kit-sync/README.md` | 읽는 순서에 이 문서를 추가 |

이번 문서화에서는 아래 파일을 직접 수정하지 않습니다. 이 파일들은 후속 구현 단계의 영향 대상입니다.

| 파일 또는 경로 | 후속 구현에서의 역할 |
|------|------|
| `scripts/setup.js` | Codex direct-use output emitter, source priority, managed marker, dry-run preview 구현 |
| `src/pairing-registry.json` | `pairing-registry-v2` migration 적용 대상 |
| `.claude/skills/kit-converter/SKILL.md` | command-only 변환 계약을 command/skill target selection으로 조정 |
| `.claude/commands/kit-convert.md` | command 전환 상태와 `dual-output` 흐름 반영 |
| `.claude/commands/kit-create.md` | 새 component 생성 시 command/skill target 정책 반영 |
| `.claude/commands/kit-validate.md` | v2 registry field와 Codex source validation 반영 |
| `.claude/skills/kit-validation/references/schema-pairing-registry.md` | `pairing-registry-v2` schema 문서화 및 검증 기준 반영 |
| `src/claude/_meta/codex-portability.json` | hook `metadata-drift` 해소 대상 |
| `src/templates/AGENTS.md.template` | rules guidance index와 fallback routing 반영 대상 |
| `src/codex/kit/**` | 생성 금지. 후속 구현에서도 만들지 않음 |

## 2. Finding별 resolution

| Finding | Decision | 문서 반영 위치 | 후속 구현 파일 | 생성 파일 | 검증 |
|------|------|------|------|------|------|
| 1. paired command와 skill 전환 충돌 | 기존 `command, paired` 38개는 기본 `command-primary`로 보존하고, skill 전환은 `dual-output`부터 시작한다. | `05-commands-to-skills-strategy.md`, `08-source-parity-contract.md` | `src/pairing-registry.json`, `.claude/skills/kit-converter/SKILL.md`, `.claude/commands/kit-convert.md` | 승인된 workflow에 한해 `src/codex/<domain>/skills/<name>/SKILL.md` 후보 | 기존 `src/codex/**/commands/*.md`가 missing/drift로 오판되지 않아야 함 |
| 2. kit domain source 위치 미결정 | `kit`은 domain이 아니다. `.claude/commands/kit-*`, `.claude/agents/kit-sync-agent.md`, `.claude/skills/kit-*`는 maintenance toolchain으로 둔다. | `01-current-claude-assets-audit.md`, `02-codex-target-architecture.md`, `05-commands-to-skills-strategy.md`, `08-source-parity-contract.md` | 없음. 단, toolchain alignment 문서는 후속 수정 | 없음. `src/codex/kit/**` 생성 금지 | `src/codex/kit/**` 생성 후보가 report나 roadmap에 없어야 함 |
| 3. Codex agent TOML schema 부족 | custom agent TOML 필수 필드는 `name`, `description`, `developer_instructions`로 고정한다. optional field는 source metadata 또는 parent/default inherit로 둔다. | `09-installation-output-contract.md` | `scripts/setup.js`, Codex agent source converter | `.codex/agents/*.toml` | 필수 필드 누락 시 fail, `name` field를 source of truth로 사용 |
| 4. direct-use output 보존/merge 정책 누락 | `.agents/skills/**`, `.codex/agents/**`는 managed marker와 source hash가 일치할 때만 갱신한다. 그 외는 conflict report 후 보존한다. | `02-codex-target-architecture.md`, `09-installation-output-contract.md` | `scripts/setup.js`, `.claude-kit-meta.json` writer | `.agents/skills/**`, `.codex/agents/*.toml`, conflict report | marker 없음 또는 hash 불일치 파일을 덮어쓰지 않아야 함 |
| 5. hook source와 portability metadata drift | Codex hook source가 존재하지만 `codexSource`가 `null`이면 `metadata-drift`로 판정한다. source 재생성보다 metadata 갱신을 우선한다. | `04-hooks-migration-strategy.md`, `08-source-parity-contract.md` | `src/claude/_meta/codex-portability.json`, `scripts/codex-hook-compat.js` | 없음 | `node scripts/codex-hook-compat.js`와 source existence check가 일관되어야 함 |
| 6. 새 kit domain이 emitter/bootstrap command에서 비활성 | `kit` domain을 추가하지 않는다. 따라서 activeDomains, profile, emitter에 `kit`을 넣는 해결책은 채택하지 않는다. | `README.md`, `02-codex-target-architecture.md`, `08-source-parity-contract.md` | 없음 | 없음. `src/codex/kit/**` 생성 금지 | profile domain enum과 문서에 `kit` domain이 없어야 함 |
| 7. kit-converter 계약과 command-to-skill 전략 충돌 | maintenance toolchain alignment가 끝나기 전에는 `kit-sync-agent`가 product source를 생성하지 않는다. 기존 command-only converter는 target selection 계약으로 먼저 갱신한다. | `05-commands-to-skills-strategy.md`, `06-kit-sync-agent-redesign.md`, `07-implementation-roadmap.md` | `.claude/skills/kit-converter/SKILL.md`, `.claude/commands/kit-convert.md`, `.claude/commands/kit-create.md`, `.claude/commands/kit-validate.md` | 없음 | alignment 전에는 analyze/report만 허용하고 source 생성은 보류해야 함 |
| 8. registry/status schema migration 미완성 | persistent `status`와 analyze/report `driftStatus`를 분리한다. `pairing-registry-v2`는 v1 relationship field를 유지하고 transition metadata만 추가한다. | `08-source-parity-contract.md`, `07-implementation-roadmap.md` | `src/pairing-registry.json`, `.claude/skills/kit-validation/references/schema-pairing-registry.md`, audit/report scripts | 없음 | unknown field로 validation이 실패하지 않도록 schema와 audit을 먼저 갱신 |
| 9. Codex `.rules` 경로와 생성 정책 혼동 | v1에서는 `.rules` 자동 생성을 보류한다. 일반 guidance는 `AGENTS.md.template`와 checked-in guidance docs로 보존한다. | `03-rules-index-strategy.md` | `src/templates/AGENTS.md.template`, future guidance docs | 없음. `.codex/rules`, `~/.codex/rules`, Team Config `rules/*.rules` 자동 생성 금지 | `.rules` output이 dry-run 또는 install output에 포함되지 않아야 함 |

## 3. 후속 구현 영향 파일 요약

| 구현 묶음 | 파일 후보 | 관련 Finding |
|------|------|------|
| command 전환 상태와 registry v2 | `src/pairing-registry.json`, `.claude/skills/kit-validation/references/schema-pairing-registry.md` | 1, 8 |
| maintenance toolchain alignment | `.claude/skills/kit-converter/SKILL.md`, `.claude/commands/kit-convert.md`, `.claude/commands/kit-create.md`, `.claude/commands/kit-validate.md` | 1, 7 |
| Codex direct-use install output | `scripts/setup.js`, `.claude-kit-meta.json` writer | 3, 4 |
| hook metadata drift | `src/claude/_meta/codex-portability.json`, `scripts/codex-hook-compat.js` | 5 |
| rules fallback-first routing | `src/templates/AGENTS.md.template`, future `docs/codex-guidance/rules/*.md` | 9 |

## 4. 구현 전 acceptance criteria

- Finding 1~9가 `kit-analyze` report에서 대응 가능한 상태명이나 결정으로 표현되어야 합니다.
- `src/codex/kit/**` 또는 `src/claude/kit/**` 생성 후보가 나오면 실패입니다.
- `.claude/commands/kit-*`와 `kit-sync-agent`는 소비자 프로젝트 설치 output에 포함되면 실패입니다.
- 기존 paired command 38개는 migration 직후에도 `command-primary`로 유지되어야 합니다.
- `metadata-drift`는 source regeneration을 트리거하지 않고 metadata 갱신 후보로만 표시되어야 합니다.
- `.rules` 자동 생성은 v1 범위에서 금지되어야 합니다.

## 5. 검증 명령 후보

- 문서 링크 검증: `docs/plan/repo-local-codex-kit-sync/*.md`의 로컬 링크 존재 확인
- stale path 검색: `src/codex/kit/**`, `src/claude/kit/**`가 생성 지시 문맥으로 남아 있지 않은지 확인
- hook 검증: `node scripts/codex-hook-compat.js`
- install preview: `node scripts/setup.js --dry-run`
- JS 변경이 포함되는 후속 구현: `pnpm test`
