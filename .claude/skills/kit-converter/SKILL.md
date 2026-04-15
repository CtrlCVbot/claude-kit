---
name: kit-converter
description: |
  Claude 자산을 Codex 형식으로 전환하는 변환 엔진. /kit-convert 커맨드가 이 스킬을
  참조하여 타입별 변환 규칙과 템플릿 매핑을 적용한다.
---

# kit-converter

기존 `src/claude/` 자산을 `src/codex/` 대응 자산으로 변환한다. authoring source 변환이며, runtime artifact(.toml, hooks.json) 생성은 setup/emitter 단계에서 처리한다.

## 변환 결정 매트릭스

| Claude 타입 | Codex 결과 | Codex 경로 | 상태 |
|-------------|-----------|-----------|------|
| agent | heading-based .md | `src/codex/{domain}/agents/{identity}.md` | required sibling |
| command | Entry Flow .md | `src/codex/{domain}/commands/{identity}.md` | required sibling |
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
4. 타입별 변환 규칙 적용 (`references/conversion-rules.md`)
5. Codex 경로에 파일 생성
6. pairing-registry.json 갱신
7. 결과 리포트

## 참조

- 변환 규칙: `references/conversion-rules.md`
- XML 매핑: `references/agent-section-mapping.md`
- skip 대상: `references/skip-registry.md`
- 커맨드: `.claude/commands/kit-convert.md`, `.claude/commands/kit-analyze.md`
- 설계 문서: `docs/meta-tooling/10-conversion-tooling.md`
