# Meta Tooling System - 개요

> claude-kit 프로젝트 자체를 관리하기 위한 메타 툴 시스템 설계 문서

## 배경

claude-kit v2.1은 79개 컴포넌트를 3개 도메인(core/dev/plan), 5개 카테고리(skills, agents, commands, hooks, rules)로 관리한다. 컴포넌트가 늘어날수록 기존 패턴(YAML frontmatter, XML Agent_Prompt, 네이밍 규칙, 훅 등록 등)을 수동으로 맞추는 비용이 증가하고, 일관성 검증 수단이 없어 컨벤션 드리프트가 발생한다.

## 목표

`.claude/`에 `kit-*` 접두사의 메타 툴을 구축하여:

1. **생성 자동화** -- 새 컴포넌트를 표준 패턴으로 스캐폴딩
2. **규약 강제** -- 네이밍/구조 규칙을 훅으로 실시간 차단
3. **검증 체계** -- 기존 컴포넌트의 표준 준수 여부를 검증
4. **유지보수 지원** -- 벌크 검증, 문서 갱신, 정합성 감사

## 설계 원칙

| 원칙 | 설명 |
|------|------|
| **분리** | 메타 툴은 `.claude/`에 배치, `src/`는 배포 대상만 포함 |
| **무충돌** | `kit-` 접두사로 기존 컴포넌트와 네임스페이스 분리 |
| **패턴 추종** | 생성되는 컴포넌트는 `src/`의 실제 패턴을 정확히 따름 |
| **점진적** | Phase 0(마이그레이션) → 1(생성) → 2(가드레일) → 3(유지보수) → 4(Codex) |
| **듀얼 타깃** | Claude 우선, Codex는 target-separated authoring 모델에 따라 Phase 4에서 통합 |

## 소스 구조 (target-separated authoring)

```
src/
  claude/              ← Claude 타깃 정식 source
    core/
    dev/
    plan/
  codex/               ← Codex 타깃 정식 source (Phase 4)
    core/
    dev/
    plan/
  templates/           ← 공유 인프라
  pairing-registry.json ← 자산 페어링 상태 추적 (Phase 4)
```

> `docs/codex-compatibility/` 문서에 따라, Codex installer는 `src/codex/`만 읽고 `src/claude/`를 변환하지 않는다. agent/command는 "required codex sibling"으로, 양쪽에 모두 존재하거나 `codex-skip` 사유가 명시되어야 한다.

## 구축 대상 (8개 메타 툴)

```
.claude/
  commands/
    kit-create.md           # 통합 스캐폴딩 커맨드
    kit-validate.md         # 컴포넌트 검증 커맨드
    kit-list.md             # 컴포넌트 목록 조회
    kit-audit.md            # 전수 감사 커맨드
  skills/
    kit-scaffolding/        # 스캐폴딩 엔진 + 12개 템플릿
      SKILL.md
      references/
        template-skill.md
        template-agent.md
        template-command-simple.md
        template-command-complex.md
        template-hook-pre.md
        template-hook-post.md
        template-hook-stop.md
        template-rule.md
        template-codex-agent.md       # Phase 4
        template-codex-command.md     # Phase 4
        template-codex-hook.md        # Phase 4
        template-codex-skill.md       # Phase 4
    kit-validation/         # 검증 엔진 + 9개 스키마
      SKILL.md
      references/
        schema-skill.md
        schema-agent.md
        schema-command.md
        schema-hook.md
        schema-rule.md
        schema-codex-agent.md         # Phase 4
        schema-codex-command.md       # Phase 4
        schema-codex-hook.md          # Phase 4
        schema-codex-skill.md         # Phase 4
  agents/
    kit-maintainer.md       # 벌크 유지보수 에이전트
  hooks/
    kit-naming-guard.js     # 네이밍 규칙 강제 훅
    package.json
```

## 컴포넌트 관계도

```
사용자 입력
  │
  ▼
/kit-create <type> <domain> <name>
  │
  ├─ kit-scaffolding 스킬 로드
  │   └─ references/template-{type}.md 로드
  │       └─ 변수 치환 → src/claude/{domain}/{category}/ 에 파일 생성 (--target codex 시 src/codex/)
  │
  └─ kit-naming-guard 훅 (PreToolUse)
      └─ 네이밍 규칙 검증 → 위반 시 차단

/kit-validate [target]
  │
  └─ kit-validation 스킬 로드
      └─ references/schema-{type}.md 기준으로 검증
          └─ PASS/WARN/FAIL 리포트

/kit-audit
  │
  ├─ kit-validation 스킬 (전수 검증)
  ├─ setup.js 정합성 검사
  └─ 문서 정확성 검사

/kit-list
  │
  └─ src/claude/ + src/codex/ 스캔 → 도메인별/타입별/타깃별 그룹핑

kit-maintainer 에이전트
  │
  └─ 벌크 작업: 전수 검증 + 자동 수정 + 문서 갱신
```

## 현재 컴포넌트 현황

| 도메인 | Skills | Agents | Commands | Hooks | Rules | 합계 |
|--------|--------|--------|----------|-------|-------|------|
| core | 2 | 0 | 0 | 5 | 6 | 13 |
| dev | 15 | 6 | 22 | 3 | 0 | 46 |
| plan | 8 | 6 | 10 | 1 | 0 | 25 |
| **합계** | **25** | **12** | **32** | **9** | **6** | **84** |

## 관련 문서

| 문서 | 내용 |
|------|------|
| [01-scaffolding-templates.md](01-scaffolding-templates.md) | 12개 템플릿 상세 명세 (Claude 8 + Codex 4) |
| [02-commands-spec.md](02-commands-spec.md) | 4개 커맨드 명세 (듀얼 타깃 지원) |
| [03-validation-schemas.md](03-validation-schemas.md) | 9개 스키마 명세 (Claude 5 + Codex 4) |
| [04-agent-and-hook.md](04-agent-and-hook.md) | 에이전트 + 훅 명세 (듀얼 경로) |
| [05-implementation-roadmap.md](05-implementation-roadmap.md) | 구현 로드맵 (Phase 0-4, MVCI) |
| [07-phase0-migration-plan.md](07-phase0-migration-plan.md) | Phase 0 마이그레이션 상세 구현 계획 |
| [08-phase4-codex-implementation.md](08-phase4-codex-implementation.md) | Phase 4 Codex 통합 상세 구현 명세 (자기 완결형) |
| [10-conversion-tooling.md](10-conversion-tooling.md) | src/claude → src/codex 변환 메타 툴링 (/kit-analyze, /kit-convert) |
| [feedback-review.md](feedback-review.md) | 피드백 리뷰 + Codex 통합 반영 현황 |
