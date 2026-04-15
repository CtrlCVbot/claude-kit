# 메타 툴링 전체 구현 계획 (Phase 4b/4c)

> 15개 미구현 항목을 4개 Wave, 6커밋으로 구현하는 상세 계획
>
> **편집 메모 (2026-04-15)**: 본 문서의 "rule-skip" / "6 rule-skip" / "claude-origin shared" 표현은
> 작성 당시(Phase 0~3 시점) 기준이다. 2026-04-15 codex-sync Phase 2 (commit `9cdbbbc`, `3d64eb9`)
> 이후 6개 rule (EX-003~008)은 모두 `paired-fallback` / `status=resolved` 상태이며,
> `src/templates/AGENTS.md.template`의 `## 핵심 규칙` 섹션에 inline merge로 fallback artifact가
> 생성되었다. 자세한 내용은 `docs/codex-sync/04-rollout-validation-plan.md` §4.3과
> `docs/codex-sync/06-phase2-feedback-review.md` 참조.

## 1. Context

Phase 0-3 + Phase 4a가 완료되어 기본 메타 툴링과 Codex 듀얼 타깃 인프라가 갖춰졌다.

**구현 완료**:
- 커맨드 4개: kit-create, kit-validate, kit-list, kit-audit (C1-C7)
- 에이전트 1개: kit-maintainer
- 스킬 2개: kit-scaffolding (12 templates), kit-validation (9 schemas)
- 훅 1개: kit-naming-guard
- 데이터: pairing-registry.json (구조만, entries 비어 있음)

**미구현**: 변환 도구(10-conversion-tooling.md)와 일관성 도구(11-consistency-tooling.md)가 설계만 완료된 상태.

---

## 2. 4개 Wave 구성

### Wave 1: 변환 엔진 (Phase 4b) — 6 NEW

기존 Claude 자산을 Codex로 변환하는 도구. 의존성 없음.

| # | 파일 | 내용 | 명세 |
|---|------|------|------|
| 1 | `.claude/skills/kit-converter/SKILL.md` | 변환 엔진 (결정 매트릭스 + 템플릿 매핑 + 워크플로우) | 10-conversion §5 |
| 2 | `.claude/skills/kit-converter/references/conversion-rules.md` | 타입별 변환 규칙 (skill/agent/command/hook/rule) | 10-conversion §5 |
| 3 | `.claude/skills/kit-converter/references/agent-section-mapping.md` | XML 10섹션 → 헤딩 매핑 | 10-conversion §5 |
| 4 | `.claude/skills/kit-converter/references/skip-registry.md` | codex-skip 대상 8개 (2 hooks + 6 rules) | 10-conversion §5 |
| 5 | `.claude/commands/kit-analyze.md` | 전환 준비 분석 (read-only, auto/review/skip 분류) | 10-conversion §3 |
| 6 | `.claude/commands/kit-convert.md` | 배치 변환 실행 (--dry-run, --force, --name/--type/--domain/--all) | 10-conversion §4 |

**구현 시 참조할 기존 패턴**:
- SKILL.md: `.claude/skills/kit-scaffolding/SKILL.md` (frontmatter + 테이블 + 워크플로우)
- 커맨드: `.claude/commands/kit-create.md` (frontmatter + 파라미터 + Phase + Rules)

**커밋**:
```
feat(meta-tooling): Phase 4b 변환 엔진 — kit-converter + /kit-analyze + /kit-convert
```

**검증**:
- [ ] kit-converter/SKILL.md 존재 + frontmatter(`name`, `description`) 유효
- [ ] kit-converter/references/ 3파일 존재
- [ ] kit-analyze.md frontmatter: `allowed-tools: Read, Grep, Glob` (읽기 전용)
- [ ] kit-convert.md frontmatter: `allowed-tools: Read, Write, Glob, Grep, Bash(git:*)`
- [ ] conversion-rules.md: **5타입** 변환 규칙 포함 (skill, agent, command, hook, rule 각 1섹션)
- [ ] agent-section-mapping.md: **10행** XML→헤딩 매핑 (Role, Why_This_Matters, ..., Final_Checklist)
- [ ] skip-registry.md: **8개** 엔트리 (session-wrap-suggest, output-secret-filter + 6 rules)
- [ ] kit-analyze.md: Phase 4개 (Inventory, Analysis, Heuristic, Report)
- [ ] kit-convert.md: Phase 5개 (Scope, Preview, Execution, Registry, Report)

---

### Wave 2: 예외 레지스트리 (Phase 4c 기반) — 2 NEW

감사 면제 인프라. 의존성 없음. Wave 1과 병렬 가능.

| # | 파일 | 내용 | 명세 |
|---|------|------|------|
| 7 | `src/exception-registry.json` | 초기 8개 엔트리 (skip-registry에서 마이그레이션) | 11-consistency §5 |
| 8 | `.claude/skills/kit-validation/references/schema-exception-registry.md` | 레지스트리 검증 스키마 | 11-consistency §5 |

**exception-registry.json 초기 엔트리** (작성 당시 Phase 0~3 시점 기준):

> 편집 메모 (codex-sync Phase 1~5, 2026-04-15): 아래 분류는 이 문서 작성 시점이며 현재는 모두 status=resolved로 전환됨. 최신 상태는 [`docs/codex-sync/sync-report-2026-04-15-final.md`](../codex-sync/sync-report-2026-04-15-final.md) §4 참조.

- EX-001: session-wrap-suggest — Phase 3 commit `ce8b6f1`에서 paired-fallback / status=resolved 전환 (skill artifact: `src/claude/core/skills/session-wrap-suggest/SKILL.md`)
- EX-002: output-secret-filter — Phase 1 commit `c794351`에서 paired-direct / status=resolved 전환. Phase 4 commit `3c36d2d` T18으로 setup.js가 src/codex/ 우선 사용
- EX-003~008: 6개 rules — Phase 2 commit `9cdbbbc`에서 paired-fallback / status=resolved 전환 (artifact: `src/templates/AGENTS.md.template` ## 핵심 규칙 섹션 inline merge)

**커밋**:
```
feat(meta-tooling): 예외 레지스트리 + 검증 스키마 — exception-registry.json + schema #10
```

**검증**:
- [ ] exception-registry.json: 유효 JSON, `$schema: "exception-registry-v1"`
- [ ] 8개 엔트리 (EX-001~EX-008), 각각 9개 필수 필드 (id, component, category, rule, detail, reason, approvedBy, approvedDate, status)
- [ ] 엔트리가 11-consistency-tooling.md §5 마이그레이션 테이블과 일치 (2 hook-skip + 6 rule-skip)
- [ ] schema-exception-registry.md: FAIL/WARN 검증 테이블, 필수 필드 검증 규칙 포함

---

### Wave 3: 일관성 도구 (Phase 4c) — 2 NEW + 3 MODIFY, 3커밋

Wave 1 + Wave 2에 의존. **3개 커밋으로 분리** (변경 범위별).

#### Wave 3a: C8/C9 감사 카테고리 추가

| # | 파일 | 유형 | 내용 |
|---|------|------|------|
| 11 | `.claude/commands/kit-audit.md` | MODIFY | C8 + C9 + --exceptions 추가 |
| 13 | `.claude/skills/kit-validation/SKILL.md` | MODIFY | 스키마 #10 추가 (9→10개) |

C8/C9 검증 항목, 경로 해석 알고리즘, --fix 규칙의 상세 정의는 **11-consistency-tooling.md §3-4**를 참조. 이 문서에서 반복하지 않는다.

**실행 순서**: #13(스키마 수) → #11(C8/C9 카테고리). 스키마가 먼저 존재해야 kit-audit이 참조 가능.

**커밋**:
```
feat(meta-tooling): kit-audit C8 교차 참조 + C9 갭 탐지 감사 추가
```

#### Wave 3b: kit-sync 에이전트 + 커맨드

| # | 파일 | 유형 | 내용 |
|---|------|------|------|
| 9 | `.claude/agents/kit-sync-agent.md` | NEW | 자율 판단 동기화 에이전트 |
| 10 | `.claude/commands/kit-sync.md` | NEW | 에이전트 진입점 |

에이전트/커맨드 상세는 **11-consistency-tooling.md §2**를 참조.

**실행 순서**: #9(에이전트) → #10(커맨드). 커맨드가 에이전트를 spawn하므로 에이전트가 먼저 존재해야 함.

**커밋**:
```
feat(meta-tooling): kit-sync 에이전트 + 커맨드 — Codex 동기화 진입점
```

#### Wave 3c: exception-registry 통합

| # | 파일 | 유형 | 내용 |
|---|------|------|------|
| 12 | `.claude/agents/kit-maintainer.md` | MODIFY | exception-registry 인식 + C8/C9 |

kit-maintainer 수정 상세는 **11-consistency-tooling.md §6**를 참조.

**커밋**:
```
feat(meta-tooling): kit-maintainer exception-registry 통합
```

**Wave 3 전체 검증**:
- [ ] kit-audit.md: `C1~C9` 범위, C8/C9 섹션, `--exceptions` 파라미터 각 2+회
- [ ] kit-validation SKILL.md: "10개 스키마" 표기
- [ ] kit-sync-agent.md: 6 YAML 필드 + Agent_Prompt XML 10섹션
- [ ] kit-sync.md: frontmatter + Workflow + 판단 휴리스틱 참조
- [ ] kit-maintainer.md: "exception-registry" 언급 + Investigation_Protocol에 C8/C9 포함

---

### Wave 4: 문서 갱신 — 2 MODIFY

Wave 1-3 전체에 의존.

| # | 파일 | 내용 | 수정 범위 |
|---|------|------|----------|
| 14 | `docs/meta-tooling/00-overview.md` | 도구 수 갱신, 구조 트리, 관계도 | kit-converter/analyze/convert/sync 추가 |
| 15 | `docs/meta-tooling/02-commands-spec.md` | /kit-analyze, /kit-convert, /kit-sync 명세 + C8/C9 | 섹션 5-7 추가 + §4 갱신 |

**커밋**:
```
docs(meta-tooling): 변환/일관성 도구 문서 반영 — 개요 + 커맨드 명세 갱신
```

**검증**:
- [ ] 00-overview.md: `.claude/` 내 커맨드 수(7), 에이전트 수(2), 스킬 수(3) 정확
- [ ] 00-overview.md: 구조 트리에 kit-converter, kit-analyze, kit-convert, kit-sync-agent, kit-sync 포함
- [ ] 02-commands-spec.md: /kit-analyze, /kit-convert, /kit-sync 각각 별도 섹션 (Usage + Parameters + Workflow)
- [ ] 02-commands-spec.md: kit-audit 섹션에 `C1~C9` 범위 + `--exceptions` 반영
- [ ] `grep -rn 'src/(core|dev|plan)/' docs/meta-tooling/ --include='*.md'` 에서 활성 문서 0건 (경로 일관성)

---

## 3. 의존성 그래프

```
Wave 1 (변환)              Wave 2 (예외)
#1-4 kit-converter skill    #7 exception-registry.json
#5 /kit-analyze             #8 schema-exception-registry
#6 /kit-convert
        \                    /
         \                  /
          ↓                ↓
         Wave 3 (일관성)
         #9  kit-sync-agent
         #10 /kit-sync
         #11 kit-audit C8/C9
         #12 kit-maintainer
         #13 kit-validation SKILL
                |
                ↓
         Wave 4 (문서)
         #14 00-overview
         #15 02-commands-spec
```

**병렬 가능**: Wave 1 ∥ Wave 2 (상호 의존 없음)
**순차 필수**: Wave 3 → Wave 4

---

## 4. 전체 매니페스트

| # | Wave | 파일 | 유형 |
|---|------|------|------|
| 1 | W1 | `.claude/skills/kit-converter/SKILL.md` | NEW |
| 2 | W1 | `.claude/skills/kit-converter/references/conversion-rules.md` | NEW |
| 3 | W1 | `.claude/skills/kit-converter/references/agent-section-mapping.md` | NEW |
| 4 | W1 | `.claude/skills/kit-converter/references/skip-registry.md` | NEW |
| 5 | W1 | `.claude/commands/kit-analyze.md` | NEW |
| 6 | W1 | `.claude/commands/kit-convert.md` | NEW |
| 7 | W2 | `src/exception-registry.json` | NEW |
| 8 | W2 | `.claude/skills/kit-validation/references/schema-exception-registry.md` | NEW |
| 9 | W3 | `.claude/agents/kit-sync-agent.md` | NEW |
| 10 | W3 | `.claude/commands/kit-sync.md` | NEW |
| 11 | W3 | `.claude/commands/kit-audit.md` | MODIFY |
| 12 | W3 | `.claude/agents/kit-maintainer.md` | MODIFY |
| 13 | W3 | `.claude/skills/kit-validation/SKILL.md` | MODIFY |
| 14 | W4 | `docs/meta-tooling/00-overview.md` | MODIFY |
| 15 | W4 | `docs/meta-tooling/02-commands-spec.md` | MODIFY |

**총**: 신규 10파일 + 수정 5파일 = 15작업, 6커밋 (W1×1 + W2×1 + W3×3 + W4×1)
