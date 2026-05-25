---
name: kit-converter
description: |
  Codex 자산을 Codex 형식으로 전환하는 변환 엔진. /kit-convert 커맨드가 이 스킬을
  참조하여 타입별 변환 규칙과 템플릿 매핑을 적용한다.
---

# kit-converter

기존 `src/Codex/` 자산을 `src/codex/` 대응 자산으로 변환한다. authoring source 변환이며, runtime artifact(.toml, hooks.json) 생성은 setup/emitter 단계에서 처리한다. `kit-*` maintenance toolchain 자체는 product asset이 아니므로 `src/codex/kit/**`로 변환하지 않는다.

## 변환 결정 매트릭스

| Codex 타입 | Codex 결과 | Codex 경로 | 상태 |
|-------------|-----------|-----------|------|
| agent | heading-based .md | `src/codex/{domain}/agents/{identity}.md` | required sibling |
| command | target selection | `src/codex/{domain}/commands/{identity}.md` 또는 `src/codex/{domain}/skills/{identity}/SKILL.md` | transition-state 기반 |
| skill | portable .md | `src/codex/{domain}/skills/{identity}/SKILL.md` | optional sibling |
| hook | .js + 등록 주석 | `src/codex/{domain}/hooks/{identity}.js` | optional sibling |
| rule | N/A | None | paired-fallback (AGENTS.md.template inline merge — discrete sibling 없음, exception-registry status=resolved로 추적) |

## 템플릿 매핑

| 변환 타입 | 참조 템플릿 | 검증 스키마 |
|----------|-----------|-----------|
| agent | `template-codex-agent.md` | `schema-codex-agent.md` |
| command | `template-codex-command.md` | `schema-codex-command.md` |
| skill | `template-codex-skill.md` | `schema-codex-skill.md` |
| hook | `template-codex-hook.md` | `schema-codex-hook.md` |

## 난이도 분류

| 분류 | 기준 | 대상 |
|------|------|------|
| **auto** | 구조 변환만으로 충분 | 스킬 전체, 읽기 전용 에이전트, 호환 훅, 단순 커맨드 |
| **review** | 변환 후 수동 검토 필요 | 쓰기 에이전트(tools에 Write/Edit), 복합 커맨드 |
| **skip** | 변환 대상 아님 | 룰 전체, 비호환 훅 (skip-registry 참조) |

**에이전트 난이도 판별**: YAML frontmatter `tools` 배열에 `Write`/`Edit` 포함 → review, 아니면 auto.
**커맨드 난이도 판별**: frontmatter 존재 + 3개 이상 Phase/Step → review, 아니면 auto.

## 워크플로우

1. Codex 소스 파일 읽기
2. skip-registry 확인 → 등록된 identity면 건너뛰기
3. 타입 판별 + 난이도 분류
4. command는 먼저 `command-primary`, `dual-output`, `skill-primary`, `command-wrapper`, `deprecated-command` 중 target state를 판정한다.
5. 타입별 변환 규칙 적용 (`references/conversion-rules.md`)
6. Codex 경로에 파일 생성
7. pairing-registry.json 갱신
8. 결과 리포트

## command target selection

| 상태 | 처리 |
|------|------|
| `command-primary` | 기존 `src/codex/**/commands/*.md`를 유지한다. 기존 paired command의 기본값이다. |
| `dual-output` | 기존 command path를 보존하고 linked skill source를 추가한다. |
| `skill-primary` | review 승인 후 skill을 primary로 두고 command output 제거 또는 보존 정책을 명시한다. |
| `command-wrapper` | command는 얇은 wrapper로 유지하고 실제 workflow는 skill로 이동한다. |
| `deprecated-command` | 호환성 공지 또는 removal note가 있을 때만 사용한다. |

command를 skill로 전환할 때 기존 paired command를 즉시 missing/drift로 판정하면 안 된다. `pairing-registry-v2`의 `transitionState`, `primaryCodex`, `codexSkill`, `driftStatus`를 먼저 갱신한다.

## 참조

- 변환 규칙: `references/conversion-rules.md`
- XML 매핑: `references/agent-section-mapping.md`
- skip 대상: `references/skip-registry.md`
- 커맨드: `.Codex/commands/kit-convert.md`, `.Codex/commands/kit-analyze.md`
- 설계 문서: `docs/archive/2026-04-17/meta-tooling/10-conversion-tooling.md`
