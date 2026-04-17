# Adding a Component

> **Status**: Draft (P4, 2026-04-17)
> **Source**: [`/kit-create`](../../.claude/commands/kit-create.md), [`/kit-validate`](../../.claude/commands/kit-validate.md), `.claude/skills/kit-scaffolding/`
> **Related**: [03-domain-authoring.md](03-domain-authoring.md), [05-quality-gates.md](05-quality-gates.md)

새 **커맨드 / 에이전트 / 스킬 / 훅 / 규칙** 을 기존 도메인에 추가하는 절차입니다. 새 도메인 자체를 만드는 경우는 [03-domain-authoring.md](03-domain-authoring.md) 참조.

## 1. 전체 절차

```
1. /kit-create <type> <domain> <name>   ← scaffolding
2. 생성된 파일 편집                      ← 실제 내용 작성
3. /kit-validate                        ← 표준 준수 검증
4. pnpm install                         ← .claude/ 재생성
5. 실제 동작 확인                        ← Claude Code 세션에서 체험
6. pnpm check:docs                       ← reference drift 확인
7. (듀얼 타깃) /kit-sync                 ← Codex 포팅
8. node scripts/audit-pairing.js         ← pairing 검증
9. 커밋 + PR
```

## 2. `/kit-create` — 스캐폴딩

`kit-scaffolding` 스킬이 12개 표준 템플릿 (Claude 8 + Codex 4) 을 제공합니다.

```
/kit-create command dev my-new-command
/kit-create agent plan my-new-agent
/kit-create skill copy my-new-skill
/kit-create hook dev my-new-guard
/kit-create rule core my-new-rule
```

산출물:
- `src/claude/{domain}/{type}/{name}[.md|.js]`
- frontmatter + 표준 섹션 placeholder
- pairing-registry 에 entry 추가 (status: `claude-only` 로 시작)

### 템플릿 종류

| 타입 | Claude 템플릿 | Codex 템플릿 |
|------|--------------|--------------|
| command | simple / complex | command |
| agent | agent | agent |
| skill | skill | skill |
| hook | pre / post / stop | hook |
| rule | rule | — (AGENTS.md 흡수) |

자세한 템플릿: [`.claude/skills/kit-scaffolding/references/`](../../.claude/skills/kit-scaffolding/references/).

## 3. 내용 편집 규칙

### 3.1 공통

- 파일 크기 ≤ 800 lines
- 함수 ≤ 50 lines, 중첩 ≤ 4
- frontmatter 필수 필드 (type 별로 다름 — 스키마 참조)

### 3.2 Command

`.md` 상단:
```markdown
# /command-name

한 줄 설명 (description 자동 파싱됨).

> 참조: `.claude/skills/....`
```

자세한 규약: [`.claude/skills/kit-validation/references/schema-command.md`](../../.claude/skills/kit-validation/references/schema-command.md).

### 3.3 Agent

frontmatter:
```yaml
---
name: agent-name
description: 한 줄 설명 (description 필수)
tools: ["Read", "Grep", "Glob"]    # 필요한 도구만
model: opus | sonnet | haiku        # 선택
---
```

### 3.4 Skill

frontmatter:
```yaml
---
name: skill-name
description: 언제·왜 로드되는지 명시
---
```

### 3.5 Hook

```js
#!/usr/bin/env node
/**
 * Hook: {Title}
 * Event: {PreToolUse|PostToolUse|Stop} [(matcher)]
 * Action: {BLOCKING|REMINDER|LOG} (exit {0|2}) — 한 줄 설명
 */
'use strict';

let input = '';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  const payload = JSON.parse(input);
  // 로직
  process.exit(0);
});
```

**중요**: JSDoc 의 `Hook/Event/Action` 3-line 패턴은 `scripts/docs-generate.js` 가 파싱합니다. 정확한 형식 유지해야 `docs/30-reference/04-hooks.md` 가 비지 않음.

### 3.6 Rule

`.md` 상단:
```markdown
# Rule Title

> 한 줄 요약 (docs-generate.js 가 이 blockquote 를 추출).

## 절
...
```

## 4. `/kit-validate` — 표준 준수 검증

```
/kit-validate
```

`kit-validation` 스킬이 12개 스키마 (Claude 5 + Codex 4 + Registry 3) 로 검증합니다.

체크 항목:
- frontmatter 필수 필드
- 파일 크기·중첩 한계
- naming convention
- pairing-registry entry 존재

실패하면 수정 후 재실행.

## 5. 저장소 재설치로 즉시 체험

```bash
pnpm install
```

`.claude/` 가 갱신되면서 새 자산이 실제 로드됩니다. Claude Code 세션을 재시작해 동작 확인.

## 6. Reference 문서 자동 반영

새 자산이 추가되면 `docs/30-reference/*.md` 가 영향받습니다:

```bash
pnpm generate:docs      # reference 재생성
pnpm check:docs          # drift 0 확인
```

새 자산의 entry 가 `01-commands.md`, `02-agents.md` 등에 자동으로 등장해야 합니다.

## 7. 듀얼 타깃 포팅 (선택)

Codex 에도 필요한 자산이면:

```
/kit-sync
```

또는 수동으로 `src/codex/{domain}/...` 에 대응 파일 생성. `exception-registry.json` 에 skip 사유를 기록하면 의도적 미포팅으로 표시.

## 8. 감사

```bash
node scripts/audit-pairing.js
node scripts/audit-drift.js
```

drift 나 누락이 없으면 커밋.

## 9. 커밋 단위

| 규모 | 권장 커밋 |
|------|----------|
| 단일 자산 | 1 commit |
| 자산 + 관련 문서 | 1 commit (함께) |
| 자산 + reference drift 수정 | 2 commits (자산 / reference) |
| 여러 도메인 자산 | 도메인별로 쪼갬 |

## 10. PR 체크리스트

- [ ] `/kit-validate` 통과
- [ ] `pnpm check:docs` 통과
- [ ] `pnpm check:quickstart` 통과
- [ ] (듀얼 타깃) `audit-pairing.js` 통과
- [ ] 실제 Claude Code 세션에서 동작 확인
- [ ] 관련 문서 (features/reference) 갱신

자세한 게이트: [05-quality-gates.md](05-quality-gates.md).

## 다음 단계

- [03-domain-authoring.md](03-domain-authoring.md) — 새 도메인 자체 추가
- [04-release-checklist.md](04-release-checklist.md) — 릴리스 기준
