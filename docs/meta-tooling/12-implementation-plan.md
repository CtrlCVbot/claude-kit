# 메타 툴링 전체 구현 계획 (Phase 4b/4c)

> 15개 미구현 항목을 4개 Wave로 구현하는 상세 계획

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
- [ ] kit-converter/SKILL.md 존재 + frontmatter 유효
- [ ] kit-converter/references/ 3파일 존재
- [ ] kit-analyze.md frontmatter: `allowed-tools: Read, Grep, Glob` (읽기 전용)
- [ ] kit-convert.md frontmatter: `allowed-tools: Read, Write, Glob, Grep, Bash(git:*)`
- [ ] conversion-rules.md: 5타입 변환 규칙 포함
- [ ] agent-section-mapping.md: 10개 XML 섹션 매핑
- [ ] skip-registry.md: 8개 엔트리

---

### Wave 2: 예외 레지스트리 (Phase 4c 기반) — 2 NEW

감사 면제 인프라. 의존성 없음. Wave 1과 병렬 가능.

| # | 파일 | 내용 | 명세 |
|---|------|------|------|
| 7 | `src/exception-registry.json` | 초기 8개 엔트리 (skip-registry에서 마이그레이션) | 11-consistency §5 |
| 8 | `.claude/skills/kit-validation/references/schema-exception-registry.md` | 레지스트리 검증 스키마 | 11-consistency §5 |

**exception-registry.json 초기 엔트리**:
- EX-001: session-wrap-suggest (hook-skip, Claude runtime 의존)
- EX-002: output-secret-filter (hook-skip, CLAUDE_REMOTE_SESSION 의존)
- EX-003~008: 6개 rules (rule-skip, claude-origin shared guidance)

**커밋**:
```
feat(meta-tooling): 예외 레지스트리 + 검증 스키마 — exception-registry.json + schema #10
```

**검증**:
- [ ] exception-registry.json: 유효 JSON, `$schema: "exception-registry-v1"`
- [ ] 8개 엔트리 (EX-001~EX-008), 각각 9개 필수 필드
- [ ] schema-exception-registry.md: FAIL/WARN 검증 테이블

---

### Wave 3: 일관성 도구 (Phase 4c) — 2 NEW + 3 MODIFY

C8/C9 감사 + kit-sync 에이전트 + 예외 통합. Wave 1 + Wave 2에 의존.

| # | 파일 | 유형 | 내용 | 명세 |
|---|------|------|------|------|
| 9 | `.claude/agents/kit-sync-agent.md` | NEW | 자율 판단 동기화 에이전트 (분석→판단→실행→검증) | 11-consistency §2 |
| 10 | `.claude/commands/kit-sync.md` | NEW | 에이전트 진입점 (--dry-run, --domain, --type, --name) | 11-consistency §2 |
| 11 | `.claude/commands/kit-audit.md` | MODIFY | C8 교차 참조 + C9 갭 탐지 + --exceptions + --no-exceptions | 11-consistency §3-4 |
| 12 | `.claude/agents/kit-maintainer.md` | MODIFY | exception-registry 인식 + C8/C9 Investigation_Protocol | 11-consistency §6 |
| 13 | `.claude/skills/kit-validation/SKILL.md` | MODIFY | 스키마 #10 추가 (9→10개) | 11-consistency §6 |

**kit-audit.md 수정 상세**:
- `--category` 범위: `C1~C7` → `C1~C9`
- C8 (교차 참조 무결성, 필수): 3가지 참조 패턴 + 경로 해석 + --fix
- C9 (설계-구현 갭, 선택): G1~G5 규칙
- `--exceptions`, `--no-exceptions` 파라미터
- 출력에 `[EXEMPT]` 상태 추가

**kit-sync-agent.md 핵심 구조**:
- YAML: name, description, tools(6개), model(sonnet), memory(project), color(green)
- Agent_Prompt XML 10섹션
- 판단 휴리스틱: 0개→skip, 1개→--name, 2-10개→--domain, 10+→사용자 승인
- 실패 처리: 멱등성 보장, 부분 실패 시 성공분 등록 + 실패분 리포트

**커밋**:
```
feat(meta-tooling): Phase 4c 일관성 도구 — C8/C9 + kit-sync 에이전트 + 예외 통합
```

**검증**:
- [ ] kit-sync-agent.md: 6 YAML 필드 + Agent_Prompt XML 10섹션
- [ ] kit-sync.md: frontmatter + Workflow
- [ ] kit-audit.md: C8, C9, --exceptions 언급 각 2+회
- [ ] kit-maintainer.md: "exception-registry" 언급
- [ ] kit-validation SKILL.md: "10개 스키마" 표기

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
- [ ] 00-overview.md: 도구 수가 실제 .claude/ 파일 수와 일치
- [ ] 02-commands-spec.md: /kit-analyze, /kit-convert, /kit-sync 섹션 존재
- [ ] 02-commands-spec.md: kit-audit C8/C9 + --exceptions 반영
- [ ] 깨진 경로 스캔 0건

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

**총**: 신규 10파일 + 수정 5파일 = 15작업, 4커밋
