---
name: kit-converter
description: |
  Claude 자산을 Codex 형식으로 전환하는 변환 엔진. /kit-convert 커맨드가 이 스킬을
  참조하여 타입별 변환 규칙과 템플릿 매핑을 적용한다.
---

# kit-converter

기존 `src/claude/` 자산을 `src/codex/` 대응 자산으로 변환한다. authoring source 변환이며, runtime artifact(.toml, hooks.json) 생성은 setup/emitter 단계에서 처리한다. `kit-*` maintenance toolchain 자체는 product asset이 아니므로 `src/codex/kit/**`로 변환하지 않는다.

## 변환 결정 매트릭스

| Claude 타입 | Codex 결과 | Codex 경로 | 상태 |
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

1. Claude 소스 파일 읽기
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

## Claude command -> Codex skill/subagent 원칙

Codex에는 built-in slash command와 앱/IDE command가 있지만, Claude Code의 `.claude/commands/*.md`와 같은 custom command authoring surface는 아니다.
따라서 Claude command를 Codex로 옮길 때 기본값은 `skill/subagent`이고, 기존 command path가 있으면 호환 wrapper 또는 packaging reference로만 다룬다.

1. `src/codex/{domain}/skills/{identity}-workflow/SKILL.md`를 만들고 실제 절차, guardrail, output format을 그 skill에 둔다.
2. 기존 `src/codex/{domain}/commands/{identity}.md`가 있으면 invocation, routing, 관련 skill 링크만 담는 얇은 wrapper로 줄인다.
3. 필요한 실행 역할은 새 subagent를 만들기보다 기존 `src/codex/{domain}/agents/*.md` 중 가장 좁은 역할을 먼저 재사용한다.
4. 새 subagent는 role이 독립적이고 재사용 가능하며 기존 agent로 안전하게 표현할 수 없을 때만 만든다.
5. `src/pairing-registry.json`에서 command entry는 `primaryCodex: "skill"`, `transitionState: "command-wrapper"`, `codexSkill: "src/codex/{domain}/skills/{identity}-workflow/SKILL.md"`로 기록한다.
6. Codex-only workflow skill은 `status: "codex-native-only"`, `primaryCodex: "skill"` entry를 별도로 둔다.
7. 사용자 문서에는 `plugins/claude-kit/commands/*.md`를 실행 본체처럼 쓰지 말고, plugin package artifact 또는 wrapper로 설명한다.

적용 예: `plan-revise`는 Claude에 command만 있지만 Codex에서는 `plan-revise-workflow` skill이 본체이고, command는 wrapper다.

## 참조

- 변환 규칙: `references/conversion-rules.md`
- XML 매핑: `references/agent-section-mapping.md`
- skip 대상: `references/skip-registry.md`
- 커맨드: `.claude/commands/kit-convert.md`, `.claude/commands/kit-analyze.md`
- 설계 문서: `docs/archive/2026-04-17/meta-tooling/10-conversion-tooling.md`
