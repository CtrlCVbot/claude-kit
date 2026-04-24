# 10. Known Issues (pre-existing)

> **Phase 3 검증에서 발견된 12건의 이슈는 모두 2026-04-24 이전부터 존재했다.** backup 브랜치와의 비교로 Phase 2 재생성이 새로 만든 문제가 **아님을 확인**. 이 문서는 이 이슈들의 실체와 해결 방향을 제안한다.

## 요약

| 분류 | 개수 | 심각도 | 해결 난이도 |
|------|:---:|:---:|:---:|
| C7 FAIL (strategy/status 모순) | 1 | 중 | 중 (설계 결정 필요) |
| C7 WARN (fallback artifact 누락) | 6 | 낮음 | 낮음 (단순 추가 작업) |
| C8 dead references (접두사 누락) | 5 | 낮음 | 낮음 (Claude source 수정) |
| **합계** | **12** | — | — |

**Phase 2 regression: 0건** (backup 브랜치와 비교 검증 완료).

## Issue 1: EX-009 Strategy/Status 모순 (C7 FAIL)

### 현상

```
exception-registry: EX-009 { strategy: "paired-direct", status: "active" }
pairing-registry:   security-no-hardcoded-secrets { status: "codex-skip" }
```

두 레지스트리의 의도가 서로 다르다:
- **Exception**: "이것은 Codex rules 로 1:1 변환할 계획이다 (paired-direct)"
- **Pairing**: "실제로는 아직 Codex 파일을 만들지 않았다 (codex-skip)"

### 언제부터 있었나

backup 브랜치 (2026-04-24 이전) 에서도 동일 상태 확인됨. **Phase 2 재생성이 만든 문제가 아님**.

### 왜 남아 있나 (추정)

2026-04-09 경 EX-009 승인 당시:
- 설계자 의도는 paired-direct (security.md 의 `## Mandatory Security Checks` 중 "No hardcoded secrets" 항목을 Codex exec-policy 로 전환)
- 실제 구현 (Codex rules 파일 생성) 은 보류
- 구현 보류 상태를 pairing `codex-skip` 으로 표시했지만, exception strategy 는 paired-direct 로 남음

### 해결 방향 (3 옵션)

| 옵션 | 행동 | 장단점 |
|------|------|--------|
| A. 변환 실행 | 실제 `src/codex/core/rules/security-no-hardcoded-secrets.md` 생성 + pairing `paired` | paired-direct 의도 달성. 단 Codex rules 형식 검증 먼저 필요 |
| B. 전략 변경 | exception strategy 를 `paired-fallback (fallbackTarget=agents-guidance)` 으로 수정 | AGENTS.md 에 섹션 추가로 목적 달성. 단 exception-registry 수정 필요 |
| C. 명시적 유보 | exception status 를 `active` 로 유지 + rule 을 `rule-review` 등으로 격상 | 현 상태 유지, 미래 결정 대기 |

**권장**: 옵션 A 또는 B. 옵션 C 는 모순을 유지하는 임시방편.

## Issue 2-7: AGENTS.md.template Fallback Artifact 누락 (C7 WARN 6건)

### 현상

6개 core rules 가 `paired-fallback (fallbackTarget=agents-guidance)` strategy 로 승인됨:

| ID | rule | 기대 섹션 |
|----|------|----------|
| EX-003 | coding-style | `### coding-style` |
| EX-004 | date-calculation | `### date-calculation` |
| EX-005 | golden-principles | `### golden-principles` |
| EX-006 | interaction | `### interaction` |
| EX-007 | security | `### security` |
| EX-008 | verification | `### verification` |

그러나 `src/templates/AGENTS.md.template` 실제 내용:

```markdown
# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

<!-- kit:managed:start -->
{{KIT_MANAGED_SECTION}}
<!-- kit:managed:end -->
```

**7라인 placeholder 뿐** — 6개 rule 중 어느 것도 `### {name}` 형식 섹션으로 merge 되어 있지 않다.

### 언제부터 있었나

backup 브랜치와 diff 결과 **완전 동일** (0 bytes 차이). 2026-04-24 이전부터 존재한 이슈.

### 왜 남아 있나 (추정)

- 2026-04-09 EX-003~008 승인 시점에 rule-fallback 전략은 정의했으나, **실제 AGENTS.md.template 에 섹션을 추가하는 작업이 누락**
- kit-converter 가 이 fallback artifact 생성 로직을 **아직 구현하지 않았을** 가능성
- Phase 2 kit-sync-agent 도 AGENTS.md.template 은 touch 하지 않음 (Phase 2 보고의 "pre-existing 섹션 존재" 언급은 부정확)

### 해결 방향

`src/templates/AGENTS.md.template` 에 6개 h3 섹션 추가. 각 섹션은 해당 Claude rule 파일 내용을 요약·압축한 형태:

```markdown
### coding-style
(src/claude/core/rules/coding-style.md 요약)

### date-calculation
(src/claude/core/rules/date-calculation.md 요약)

... 등 6개 ...
```

**제약**:
- AGENTS.md 는 Codex runtime 이 자동 주입. 너무 길면 컨텍스트 낭비
- 각 섹션은 핵심 원칙만 압축. Claude rule 전문을 복사하지 않음
- kit-converter 에 "rule-fallback 자동 merge" 로직 추가하거나, 수동 작성

### 참고

- EX-009 를 옵션 B 로 해결하면 `### security-no-hardcoded-secrets` 섹션도 함께 추가 (총 7개)

## Issue 8-12: Dead References in dev commands (C8 FAIL 5건)

### 현상

`src/codex/dev/commands/*.md` 의 `> 참조:` 블록이 존재하지 않는 skill 경로를 가리킴:

| File | Broken reference | 실제 경로 |
|------|------------------|----------|
| dev-refactor.md | `.claude/skills/refactoring/SKILL.md` | `.claude/skills/dev-refactoring/SKILL.md` |
| dev-review.md | `.claude/skills/layered-architecture/SKILL.md` | `.claude/skills/dev-layered-architecture/SKILL.md` |
| dev-review.md | `.claude/skills/frontend-patterns/SKILL.md` | `.claude/skills/dev-frontend-patterns/SKILL.md` |
| dev-test-verify.md | `.claude/skills/tdd-workflow/SKILL.md` | `.claude/skills/dev-tdd-workflow/SKILL.md` |
| dev-verify-fe.md | `.claude/skills/testing-frontend/SKILL.md` | `.claude/skills/dev-testing-frontend/SKILL.md` |

**공통 원인**: `dev-` 도메인 접두사 누락.

### 언제부터 있었나

Phase 3 감사에서 backup 브랜치와 동일 참조 라인 확인됨. `[SAME]` 판정 = Claude 원본에서부터 잘못 적힌 것을 Codex 로 그대로 복사.

### 해결 방향 (단순 텍스트 치환)

**Claude source 측 수정**:

```bash
cd src/claude/dev/commands/
sed -i 's|.claude/skills/refactoring/|.claude/skills/dev-refactoring/|g' dev-refactor.md
sed -i 's|.claude/skills/layered-architecture/|.claude/skills/dev-layered-architecture/|g' dev-review.md
sed -i 's|.claude/skills/frontend-patterns/|.claude/skills/dev-frontend-patterns/|g' dev-review.md
sed -i 's|.claude/skills/tdd-workflow/|.claude/skills/dev-tdd-workflow/|g' dev-test-verify.md
sed -i 's|.claude/skills/testing-frontend/|.claude/skills/dev-testing-frontend/|g' dev-verify-fe.md
```

(실제 실행은 각 파일을 Read 한 후 Edit tool 로 안전하게)

**그 후**: `/kit-sync --resync --domain dev --type command` 으로 codex 쪽도 반영

### 심각도

**낮음**. dead reference 는 문서 링크만 깨뜨리지 실제 기능 동작에는 영향 없음. `> 참조:` 블록은 개발자 가이드용 메타데이터.

## 기타 관찰 사항 (비이슈)

### 0바이트 파일 4개

```
src/codex/copy/.gitkeep
src/codex/core/.gitkeep
src/codex/dev/.gitkeep
src/codex/plan/.gitkeep
```

**의도된 empty** (`.gitkeep` 은 git 이 빈 디렉토리를 추적하지 않기 때문에 사용하는 관례). 이슈 아님.

### frontmatter 없는 111 Codex 파일

기본 Markdown 파일들 대부분. Claude 원본이 HTML 주석 기반 metadata 를 쓰고 Codex 도 이를 유지. **의도된 설계**.

### AGENTS.md.template 자체의 최소주의

7라인 placeholder 구조는 **scaffolding 시점에 확장되는 설계**. 단 현재 어디에서도 6 rule 의 inline merge 가 수행되지 않고 있어 [Issue 2-7] 을 형성.

## 본 작업의 판정

| 질문 | 답변 |
|------|------|
| Phase 2 재생성이 새로운 문제를 만들었는가? | **아니오** (Phase 3 C7 + C8 + C3-lite 모두 regression 0건) |
| 기존 이슈 12건을 Phase 2 가 해결했는가? | **아니오** (exception-registry / Claude source 수정이 별도로 필요) |
| Phase 2 작업 품질은 어떤가? | **양호** (기존 health 유지 + baseline 리셋 목표 달성) |

**정리**: 본 codex 재정리 작업은 **기존 상태를 유지하면서 sync baseline 을 리셋**하는 것이 목표였고 달성됨. 기존 이슈 12건은 본 작업 scope 밖이며 별도 세션에서 해결 권장.

## 후속 작업 체크리스트

각 이슈 해결 작업의 예상 소요:

- [ ] **Issue 1 (EX-009 모순 해결)**: 설계 결정 회의 + 옵션 A 실행 시 추가 세션 (중간 규모)
- [ ] **Issue 2-7 (AGENTS.md.template 섹션 추가)**: 6개 rule 요약 작성 + kit-converter 자동화 (소규모 × 6 = 중간 규모)
- [ ] **Issue 8-12 (dev commands dead ref 수정)**: 5개 파일 Edit + `/kit-sync --resync` (소규모)

상세한 후속 작업은 [12 Followups](12-followups.md) 참조.

## 참조

- [01 Process Timeline](01-process-timeline.md) — Phase 3 감사 실행 내역
- [08 Exception Handling](08-exception-handling.md) — EX-009 배경 상세
- [12 Followups](12-followups.md) — 후속 작업 세부 설계
