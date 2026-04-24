# 02. Conversion Overview — Claude ↔ Codex 변환 매커니즘

> Claude 자산이 Codex 자산으로 **어떻게 변환되는가**를 설명. 이 문서 없이 도메인별 파일 목록을 보면 왜 어떤 파일은 그대로 복사되고 어떤 파일은 다르게 처리되는지 알기 어렵다.

## 왜 이 변환이 필요한가

claude-kit은 동일한 개발 경험을 **Claude Code(CLI)**와 **Codex** 두 런타임에서 제공한다. 하지만 두 런타임의 기능 표면이 완전히 같지 않다:

| 기능 | Claude Code | Codex |
|------|:---:|:---:|
| Markdown agent 정의 | ✅ | ✅ (format 다름) |
| Slash command (`.claude/commands/`) | ✅ | ✅ (일부 signature 차이) |
| Skill (directory-based) | ✅ | ✅ |
| Hook (PreToolUse/PostToolUse/Stop) | ✅ 안정 | ⚠️ experimental |
| Rule (markdown, auto-injection) | ✅ | ❌ (대신 AGENTS.md merge) |
| `~/.claude/` 상태 파일 의존 | ✅ | ❌ (재현 불가) |
| Windows hooks | ✅ | ❌ (현재 비활성) |

**비유**: 같은 소설을 한국어와 일본어로 동시에 출판하는 상황. 한국어 원본(Claude)을 일본어(Codex)로 번역할 때:
- 대부분 단어는 1:1로 번역 가능 (paired-direct)
- 일부 표현은 일본어에 없어서 다른 방식으로 풀어써야 함 (paired-fallback)
- 어떤 개념은 아예 존재하지 않아서 "역자 주"로 설명 (blocked)
- 어떤 건 번역했지만 검수자 확인이 필요함 (paired-review)

## Source of Truth (SSOT) 위치

| SSOT | 파일 | 역할 |
|------|-----|------|
| 자산 원본 | `src/claude/**` | 모든 Claude 자산의 원본. 여기서 Codex 파일 파생 |
| 전환 전략 매니페스트 | `src/claude/_meta/codex-portability.json` | 42개 자산의 4-tier strategy 분류 + 공식 문서 근거 |
| 변환 예외 승인 로그 | `src/exception-registry.json` | 14개 예외 항목 (EX-001 ~ EX-014) |
| Claude↔Codex 쌍 매핑 | `src/pairing-registry.json` | 125개 entries (114 paired + 6 skip + 5 unpaired) |
| 변환 스키마 | `.claude/skills/kit-validation/references/schema-codex-*.md` (5개) | Codex 자산별 스키마 검증 규칙 |
| 템플릿 | `.claude/skills/kit-scaffolding/references/template-codex-*.md` (4개) | 신규 자산 생성 시 템플릿 |

## 4-tier Strategy (codex-portability.json 의 분류)

**portability.json 총 42 entries** (2026-04-24 기준):

| Strategy | 개수 | 의미 | 변환 처리 |
|----------|:---:|------|----------|
| **paired-direct** | 9 | 공식 Codex 기능으로 1:1 매핑 가능 | 내용 그대로 복사 + `<!-- kit-convert generated: YYYY-MM-DD -->` marker |
| **paired-fallback** | 7 | 공식 지원 안 되지만 fallback artifact 사용 | `fallbackTarget` 에 따라 skill 생성 또는 `AGENTS.md` merge |
| **paired-review** | 26 | 생성은 하되 실제 Codex runtime 검증 필요 | 내용 복사 + `<!-- REVIEW NEEDED: paired-review strategy -->` marker |
| **blocked** | 0 | 변환 불가, 예외로만 처리 | 파일 생성 안 함 |

**추가 차원 (pairing-registry 기준)**:

| Status | 개수 | 의미 |
|:---:|:---:|------|
| paired | 114 | 정상 변환된 쌍 |
| codex-skip | 6 | 의도적으로 Codex 파일 생성 안 함 |
| unpaired | 5 | Claude 만 존재 (copy 도메인 rules 5개) |

## 파일 타입별 변환 규칙

### 1. Agent (`*.md` + tools/model frontmatter)

```
Claude:  src/claude/{domain}/agents/{name}.md
Codex:   src/codex/{domain}/agents/{name}.md
```

**변환 처리**:
- Markdown 본문 그대로 복사
- `tools:` 필드에 `Write|Edit|Bash` 가 포함되면 **write-capable agent**로 분류 → `<!-- REVIEW NEEDED: write-capable agent (tools: ...) -->` marker 삽입 (독자가 Codex 환경에서 의도된 권한인지 확인해야 함)
- `copy/agents/*` 4개는 `paired-review` strategy → 추가로 `<!-- REVIEW NEEDED: paired-review strategy (subagents) -->` marker

### 2. Command (`*.md` + Usage block)

```
Claude:  src/claude/{domain}/commands/{name}.md
Codex:   src/codex/{domain}/commands/{name}.md
```

**변환 처리**:
- Markdown 본문 그대로 복사 (Codex 가 동일 slash command 형식 지원)
- `copy/commands/*` 7개는 paired-review → marker 삽입
- `transitionState` (command-primary / dual-output / skill-primary / command-wrapper / deprecated-command) 로 command 진화 상태 추적 (pairing-registry 에 기록)

### 3. Skill (디렉토리 + `SKILL.md`)

```
Claude:  src/claude/{domain}/skills/{name}/SKILL.md (+ references/*)
Codex:   src/codex/{domain}/skills/{name}/SKILL.md (+ references/*)
```

**변환 처리**:
- 디렉토리 전체를 복사
- references 하위 파일도 복사 (`session-wrap/references/*.md` 등)
- `copy/skills/*` 5개는 paired-review → marker 삽입

### 4. Hook (`*.js` + frontmatter comment)

```
Claude:  src/claude/{domain}/hooks/{name}.js
Codex:   src/codex/{domain}/hooks/{name}.js
```

**변환 처리 (세 갈래)**:
- **paired-direct**: 내용 그대로 복사 + Codex 등록 포맷 주석 추가 (예: `output-secret-filter.js`)
- **paired-fallback (fallbackTarget=skill)**: Codex 용 hook 파일 생성하지 않음. 대신 `src/claude/{domain}/skills/{name}/SKILL.md` 가 fallback artifact. 예: `session-wrap-suggest` (EX-001)
- **codex-skip**: copy 도메인 5개 hooks (EX-010~014) 는 공식 surface 미완으로 생성 보류

### 5. Rule (`*.md`, Claude 고유)

```
Claude:  src/claude/{domain}/rules/{name}.md
Codex:   (파일 없음 — AGENTS.md 안에 섹션으로 merge)
```

**변환 처리 (세 갈래)**:
- **paired-direct (rule-direct)**: EX-009 `security-no-hardcoded-secrets` — 설계상 Codex rules로 가야 하지만 현재 codex-skip 상태 (본 리포트 [08 Exception Handling](08-exception-handling.md) 참조)
- **paired-fallback (fallbackTarget=agents-guidance)**: 6개 core rules (EX-003~008). `src/templates/AGENTS.md.template` 에 `### {name}` h3 섹션으로 inline merge (현재 artifact 비어 있음 — [10 Known Issues](10-known-issues.md))
- 기타: pairing-registry 에서 `unpaired` 상태 (copy rules 5개)

## 변환 엔진 — kit-converter

실제 변환을 수행하는 것은 **`kit-converter` skill** 이다:

```
위치: .claude/skills/kit-converter/SKILL.md
호출: kit-sync-agent 가 /kit-convert --all --force 에 해당하는 절차 실행
```

**kit-converter 의 5단계 변환 프로세스**:

1. **범위 결정** — `--all` 플래그 시 pairing-registry 의 paired entry 전체를 대상으로
2. **Difficulty 분류** — auto (자동) / review (수동 검토) / skip (건너뜀)
3. **타입별 변환 규칙 적용** — 위 "파일 타입별 변환 규칙" 섹션 로직
4. **pairing-registry 갱신** — `lastSyncedAt` + `contentHash` (SHA-256 앞 8자 hex)
5. **결과 리포트** — 성공 / 실패 / skip 분류 + REVIEW NEEDED 목록

## Fallback Artifact 매커니즘

Codex 가 특정 Claude 기능을 지원하지 않을 때, 그 **의도를 보존하는 대체 수단**이 fallback artifact:

| fallbackTarget | 보존 방식 |
|---|---|
| `skill` | Claude 쪽에 대응 skill 생성 (Codex 도 읽을 수 있는 형식). 예: `session-wrap-suggest` hook → `skills/session-wrap-suggest/SKILL.md` |
| `agents-guidance` | `src/templates/AGENTS.md.template` 에 `### {name}` h3 섹션으로 내용 merge. 프로젝트가 `codex init` 등을 할 때 AGENTS.md 에 해당 섹션 포함 |

**현재 상태 (2026-04-24)**:
- skill fallback 1건 (EX-001) → artifact 존재 확인됨
- agents-guidance fallback 6건 (EX-003~008) → AGENTS.md.template 이 실제로는 7라인 placeholder 뿐 → 섹션 미작성. [10 Known Issues](10-known-issues.md) 참조.

## Marker 시스템

재생성된 Codex 파일 상단에 삽입되는 HTML 주석 marker:

```markdown
<!-- REVIEW NEEDED: write-capable agent (tools: Read, Write, Edit, Bash, Grep, Glob) -->
<!-- REVIEW NEEDED: paired-review strategy (subagents) — Codex runtime 검증 전 -->
<!-- kit-convert generated: 2026-04-24 -->
```

| Marker | 의미 | 파일 수 |
|--------|------|:---:|
| `kit-convert generated: <date>` | 변환 타임스탬프 | 171 전체 |
| `REVIEW NEEDED: write-capable agent` | `Write|Edit` tools 보유 → Codex 에서 권한 재확인 필요 | 14 파일 (중복 1 포함) |
| `REVIEW NEEDED: paired-review strategy` | portability 에서 `paired-review` 분류 | 16 파일 (중복 1 포함) |

중복 1건 = `copy-reference-baseline` (write-capable + paired-review 모두 해당)

고유 파일 수: 29. 상세 [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) 참조.

## 관련 skill 참조 경로

| skill | 위치 | 역할 |
|------|------|------|
| kit-converter | `.claude/skills/kit-converter/SKILL.md` | 변환 엔진 |
| kit-validation | `.claude/skills/kit-validation/SKILL.md` | 검증 12 스키마 |
| kit-scaffolding | `.claude/skills/kit-scaffolding/SKILL.md` | 신규 컴포넌트 템플릿 |
| kit-sync-agent | `.claude/agents/kit-sync-agent.md` | 동기화 오케스트레이션 에이전트 |
