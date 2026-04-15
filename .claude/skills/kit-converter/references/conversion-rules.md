# 타입별 변환 규칙

> Claude authoring source → Codex authoring source 변환 규칙

## Skill 변환 (auto)

```
1. src/claude/{domain}/skills/{identity}/SKILL.md 읽기
2. 내용 그대로 src/codex/{domain}/skills/{identity}/SKILL.md에 복사
3. "Codex 참고 사항" 섹션이 없으면 추가:
   ## Codex 참고 사항
   - 이 파일은 authoring source이다.
   - Claude sibling: src/claude/{domain}/skills/{identity}/SKILL.md
4. references/ 디렉토리가 있으면 함께 복사
5. pairing-registry에 paired 등록
```

## Agent 변환 (auto/review)

```
1. src/claude/{domain}/agents/{identity}.md 읽기
2. YAML frontmatter에서 name, description, tools 추출
3. <Agent_Prompt> XML에서 섹션별 내용 추출 (agent-section-mapping.md 참조):
   <Role>              → ## Role
   <Success_Criteria>  → ## Capabilities (병합)
   <Constraints>       → ## Constraints
   <Output_Format>     → ## Output Format
   <Failure_Modes_To_Avoid> → ## Failure Modes
   (나머지 XML 섹션은 관련 헤딩에 병합 또는 추가 섹션)
4. YAML frontmatter 제거 (name, tools, model, memory, color)
5. description → 제목 아래 배치
6. </Agent_Prompt> 뒤 비-XML 내용은 추가 섹션으로 보존
7. "Codex 참고 사항" 섹션 추가 (authoring source 명시)
8. tools에 Write/Edit 포함 시 파일 상단에 <!-- REVIEW NEEDED: write-capable agent --> 마커
9. src/codex/{domain}/agents/{identity}.md에 쓰기
10. pairing-registry에 paired 등록
```

## Command 변환 (auto/review)

```
1. src/claude/{domain}/commands/{identity}.md 읽기
2. Claude YAML frontmatter (allowed-tools, argument-hint) 제거
3. 제목 변환: # /{identity} → # {identity} — Codex Entry Flow
4. 섹션 매핑:
   첫 문단/설명     → ## Overview
   Usage/Preconditions → ## Invocation
   파라미터 테이블    → ## Parameters
   Phase/Workflow 섹션 → ## Workflow (번호 구조 유지)
   출력 포맷         → ## Output
   Rules 섹션        → 유지
5. 슬래시 커맨드 자기 참조 /{identity} → {identity} (본문 내)
6. "Codex 참고 사항" 섹션 추가
7. frontmatter + 3개 이상 Phase 시 <!-- REVIEW NEEDED: complex command --> 마커
8. src/codex/{domain}/commands/{identity}.md에 쓰기
9. pairing-registry에 paired 등록
```

## Hook 변환 (paired-direct / paired-fallback)

> Phase 3 (2026-04-15) 보강: 공식 surface와 platform 제약을 명시.

### Hook 분류 (codex-sync Phase 3)

| Hook | Event | Matcher | strategy | fallbackTarget | 비고 |
|------|-------|---------|----------|----------------|------|
| `output-secret-filter.js` | PostToolUse | (전체) | paired-direct | — | Codex sibling 별도 (`src/codex/core/hooks/`). EX-002 resolved. setup.js 복사 차단 (Phase 4 T18까지) |
| `session-wrap-suggest.js` | Stop | N/A | paired-fallback | skill | Stop event는 공식 지원이나 `~/.claude/.session-stats.json` + tmpdir 마커 의존. EX-001 resolved (skill artifact: `src/claude/core/skills/session-wrap-suggest/`) |
| `code-quality-reminder.js` | PostToolUse | Edit\|Write | paired-direct (informational) | — | Phase 4 codex-portability.json에서 정식 등록 예정 |
| `security-auto-trigger.js` | PostToolUse | Edit\|Write | paired-direct (informational) | — | 동일 |
| `edit-tracker.js` | PostToolUse | Edit\|Write | paired-direct (informational) | — | 동일 |
| `dev-db-guard.js` | PreToolUse | Bash | paired-direct | — | Bash 매처가 공식 범위라 가장 안전한 paired-direct |
| `dev-tdd-guard.js` | PreToolUse | Edit\|Write | paired-direct (informational) | — | Phase 4 codex-portability.json에서 정식 등록 예정 |
| `dev-feature-scope-guard.js` | PreToolUse | Edit\|Write | paired-direct (informational) | — | 동일 |
| `plan-doc-guard.js` | PreToolUse | Edit\|Write | paired-direct (informational) | — | 동일 |

> "informational"은 HOOK_PORTABILITY에 정식 등록되지 않았음을 뜻한다. setup.js의 기본 동작(default compatible:true)에 의존하며, Phase 4에서 codex-portability.json manifest에 정식 등록될 예정.

### 변환 절차

```
1. exception-registry 확인. strategy=paired-fallback이면 fallbackTarget으로 분기 (예: skill artifact)
2. HOOK_PORTABILITY 확인 (scripts/codex-hook-compat.js). compatible=false면 건너뛰기
3. 그 외에는 src/claude/{domain}/hooks/{identity}.js 읽기
4. JS 내용 그대로 복사
5. JSDoc에 Codex 등록 포맷 주석 추가 (없는 경우):
   * Codex 등록 포맷:
   *   .codex/hooks.json: { type: "command", command: "./hooks/{identity}.js" }
   *
   * Codex hooks 공식 제약 (2026-04 기준):
   *   - hooks는 experimental 기능
   *   - PreToolUse/PostToolUse matcher: 공식 문서상 Bash 범위가 핵심.
   *     Edit|Write 매처는 Codex runtime에서 동작하지만 공식 보장은 Bash가 우선.
   *   - Stop event: 공식 지원. 단, runtime 상태 파일 의존이 있는 hook은
   *     direct 재현 불가 → skill/command fallback 필요 (예: session-wrap-suggest)
   *   - Windows: 현재 비활성화. 크로스플랫폼 가정 금지.
6. 대상 hooks 디렉토리에 package.json 존재 확인, 없으면 생성
7. src/codex/{domain}/hooks/{identity}.js에 쓰기
8. pairing-registry에 paired 등록
```

### Platform 주의사항

- **Windows**: Codex hooks는 2026-04-15 기준 Windows 비활성화. 변환 대상 hook이 Windows에서 동작해야 한다면 docConstraints에 명시.
- **PostToolUse Edit|Write 매처**: Codex 실제 동작은 하지만 공식 문서가 보장하는 핵심 범위는 Bash. "informational" 분류 hook 7개는 Phase 4에서 codex-portability.json 등록 시 evidence level 재평가 예정.
- **Stop event 상태 의존**: 공식 지원이지만 runtime 상태 파일에 의존하는 hook은 fallbackTarget=skill로 의도 보존 (EX-001 패턴).

## Rule 처리 (paired-fallback / AGENTS.md merge)

> Codex `Rules`는 exec/approval policy다. Claude의 guidance-style rule은 Codex 공식 instruction surface인 `AGENTS.md`로 흡수한다 (codex-sync Phase 2).

```
1. discrete 변환 파일을 생성하지 않는다 — rule artifact는 src/templates/AGENTS.md.template의 ## 핵심 규칙 섹션 inline merge로 표현
2. 로그: [fallback] {identity}: paired-fallback / AGENTS.md merge (artifact: src/templates/AGENTS.md.template ### {identity})
3. pairing-registry에 entry 추가하지 않음 — rule은 discrete sibling 파일이 아니라 inline merge snippet이므로 pairing-registry 설계 모델과 맞지 않음. 추적은 src/exception-registry.json strategy=paired-fallback + status=resolved로 충분
4. status 전환: artifact가 AGENTS.md.template에 존재하면 exception-registry.status를 active → resolved로 전환
5. drift 감지: 향후 Phase 4 audit이 src/claude/core/rules/{name}.md와 AGENTS.md.template의 해당 h3 section 간 drift를 INFO로 보고
```

## 공통 규칙

- 변환 파일 상단에 `<!-- kit-convert generated: {ISO날짜} -->` 추적 주석
- review 난이도 파일에 `<!-- REVIEW NEEDED: {사유} -->` 마커
- 기존 Codex 파일 존재 시 --force 없이 덮어쓰지 않음
- 변환 후 git add 하지 않음 (사용자 커밋)
