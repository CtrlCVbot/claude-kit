# Implementation Roadmap

> 메타 툴링 시스템 구현 로드맵, 우선순위, 의존성

## 구현 원칙

1. **가치 우선**: 가장 자주 사용할 도구부터
2. **의존성 순서**: 하위 도구가 상위 도구보다 먼저
3. **점진적 배포**: 각 Phase가 독립적으로 사용 가능
4. **기존 패턴 준수**: `src/`의 실제 패턴에서 추출한 템플릿 사용

---

## Phase 0: src/ 마이그레이션 (Phase 1 선행 필수)

> `src/{domain}/` → `src/claude/{domain}/` + `src/codex/{domain}/` 구조 변경. Phase 1 템플릿이 올바른 경로로 시작하기 위해 선행 필수.

### 작업 목록

| # | 작업 | 설명 |
|---|------|------|
| 0-1 | `src/claude/` 생성 + 도메인 이동 | `git mv src/{core,dev,plan}` → `src/claude/{core,dev,plan}` |
| 0-2 | `src/codex/` 빈 구조 생성 | `src/codex/{core,dev,plan}` + `.gitkeep` |
| 0-3 | setup.js 상수 분리 | `SRC_DIR` → `SRC_BASE` + `SRC_CLAUDE` + `SRC_CODEX` + `TEMPLATES` (9줄) |
| 0-4 | `src/templates/` 유지 | 공유 인프라, 이동 없음 |
| 0-5 | 문서 경로 갱신 | docs/ 10개 파일 ~60개 경로 치환 |

> 상세: [07-phase0-migration-plan.md](07-phase0-migration-plan.md) 참조

### Phase 0 완료 기준

- [ ] `src/claude/{core,dev,plan}/` 에 기존 자산 존재
- [ ] `src/codex/{core,dev,plan}/` 빈 디렉토리 존재
- [ ] `src/templates/` 유지
- [ ] `scripts/setup.js` 정상 실행

---

## Phase 1: 스캐폴딩 (최우선)

> 새 컴포넌트 생성의 자동화. 가장 높은 빈도로 사용될 기능.

### 구현 순서

| # | 대상 | 파일 | 의존성 |
|---|------|------|--------|
| 1-1 | template-skill.md | `.claude/skills/kit-scaffolding/references/template-skill.md` | 없음 |
| 1-2 | template-agent.md | `.claude/skills/kit-scaffolding/references/template-agent.md` | 없음 |
| 1-3 | template-command-simple.md | `.claude/skills/kit-scaffolding/references/template-command-simple.md` | 없음 |
| 1-4 | template-command-complex.md | `.claude/skills/kit-scaffolding/references/template-command-complex.md` | 없음 |
| 1-5 | template-hook-pre.md | `.claude/skills/kit-scaffolding/references/template-hook-pre.md` | 없음 |
| 1-6 | template-hook-post.md | `.claude/skills/kit-scaffolding/references/template-hook-post.md` | 없음 |
| 1-7 | template-hook-stop.md | `.claude/skills/kit-scaffolding/references/template-hook-stop.md` | 없음 |
| 1-8 | template-rule.md | `.claude/skills/kit-scaffolding/references/template-rule.md` | 없음 |
| 1-9 | kit-scaffolding SKILL.md | `.claude/skills/kit-scaffolding/SKILL.md` | 1-1 ~ 1-8 |
| 1-10 | /kit-create 커맨드 | `.claude/commands/kit-create.md` | 1-9 |

### 검증 기준

- `/kit-create skill dev test-dummy` 실행 시:
  - `src/claude/dev/skills/dev-test-dummy/SKILL.md` 생성
  - frontmatter에 `name: dev-test-dummy` 포함
  - 기존 `dev-tdd-workflow` 스킬과 동일한 구조
- `/kit-create agent plan test-checker --readonly` 실행 시:
  - `src/claude/plan/agents/plan-test-checker.md` 생성
  - tools에 Write/Edit 미포함
  - Constraints에 읽기 전용 명시
- `/kit-create rule test-principle` 실행 시:
  - `src/claude/core/rules/test-principle.md` 생성
  - frontmatter 없음, 도메인 접두사 없음

### Phase 1 완료 기준

- [ ] 8개 템플릿 모두 작성 (skill, agent, command x2, hook x3, rule)
- [ ] kit-scaffolding SKILL.md 작성
- [ ] /kit-create 커맨드 작성
- [ ] 5개 타입 각각 생성 테스트 통과
- [ ] 생성된 파일이 기존 패턴과 구조적으로 일치

---

## Phase 2: 가드레일

> 규약 위반을 실시간으로 차단하고, 기존 컴포넌트를 검증.

### 구현 순서

| # | 대상 | 파일 | 의존성 |
|---|------|------|--------|
| 2-1 | kit-naming-guard.js | `.claude/hooks/kit-naming-guard.js` | 없음 |
| 2-2 | hooks/package.json | `.claude/hooks/package.json` | 없음 |
| 2-3 | schema-skill.md | `.claude/skills/kit-validation/references/schema-skill.md` | 없음 |
| 2-4 | schema-agent.md | `.claude/skills/kit-validation/references/schema-agent.md` | 없음 |
| 2-5 | schema-command.md | `.claude/skills/kit-validation/references/schema-command.md` | 없음 |
| 2-6 | schema-hook.md | `.claude/skills/kit-validation/references/schema-hook.md` | 없음 |
| 2-7 | schema-rule.md | `.claude/skills/kit-validation/references/schema-rule.md` | 없음 |
| 2-8 | kit-validation SKILL.md | `.claude/skills/kit-validation/SKILL.md` | 2-3 ~ 2-7 |
| 2-9 | /kit-validate 커맨드 | `.claude/commands/kit-validate.md` | 2-8 |
| 2-10 | settings.json 훅 등록 | 프로젝트 설정 | 2-1 |

### 검증 기준

- 네이밍 가드:
  - `src/claude/dev/skills/cache-manager/SKILL.md` 생성 시도 → 차단 (도메인 접두사 누락)
  - `src/claude/core/rules/dev-test.md` 생성 시도 → 차단 (도메인 접두사 금지)
  - `src/claude/dev/agents/dev-test.md` 생성 시도 → 통과
- 검증 커맨드:
  - `/kit-validate dev-architect` → 기존 컴포넌트 PASS
  - `/kit-validate --type agent` → 12개 에이전트 전수 검증
  - FAIL 항목이 실제 위반을 정확히 포착

### Phase 2 완료 기준

- [ ] kit-naming-guard 훅 작동
- [ ] 5개 스키마 모두 작성
- [ ] kit-validation SKILL.md 작성
- [ ] /kit-validate 커맨드 작성
- [ ] settings.json에 훅 등록
- [ ] 기존 84개 컴포넌트 전수 검증 실행

---

## Phase 3: 발견/유지보수

> 컴포넌트 발견, 전수 감사, 벌크 유지보수 자동화.

### 구현 순서

| # | 대상 | 파일 | 의존성 |
|---|------|------|--------|
| 3-1 | /kit-list 커맨드 | `.claude/commands/kit-list.md` | 없음 |
| 3-2 | /kit-audit 커맨드 | `.claude/commands/kit-audit.md` | Phase 2 (kit-validation) |
| 3-3 | kit-maintainer 에이전트 | `.claude/agents/kit-maintainer.md` | Phase 2 (kit-validation) |

### 검증 기준

- `/kit-list` → 실제 컴포넌트 수와 일치
- `/kit-list --verbose` → 각 컴포넌트 설명 포함
- `/kit-audit` → 4개 필수 카테고리(C1-C4) + 2개 선택 카테고리(C5-C6) 감사
- `/kit-audit --fix` → 안전 항목 자동 수정
- kit-maintainer → 벌크 검증 + 문서 갱신 결과 리포트

### Phase 3 완료 기준

- [ ] /kit-list 커맨드 작성 + 카운트 정확
- [ ] /kit-audit 커맨드 작성 + 4개 필수 카테고리 감사 (C5/C6는 선택적)
- [ ] kit-maintainer 에이전트 작성 + 벌크 처리 동작

---

## 전체 파일 목록 (22개)

### Phase 1 (10개)

```
.claude/skills/kit-scaffolding/SKILL.md
.claude/skills/kit-scaffolding/references/template-skill.md
.claude/skills/kit-scaffolding/references/template-agent.md
.claude/skills/kit-scaffolding/references/template-command-simple.md
.claude/skills/kit-scaffolding/references/template-command-complex.md
.claude/skills/kit-scaffolding/references/template-hook-pre.md
.claude/skills/kit-scaffolding/references/template-hook-post.md
.claude/skills/kit-scaffolding/references/template-hook-stop.md
.claude/skills/kit-scaffolding/references/template-rule.md
.claude/commands/kit-create.md
```

### Phase 2 (10개)

```
.claude/hooks/kit-naming-guard.js
.claude/hooks/package.json
.claude/skills/kit-validation/SKILL.md
.claude/skills/kit-validation/references/schema-skill.md
.claude/skills/kit-validation/references/schema-agent.md
.claude/skills/kit-validation/references/schema-command.md
.claude/skills/kit-validation/references/schema-hook.md
.claude/skills/kit-validation/references/schema-rule.md
.claude/commands/kit-validate.md
(settings.json 수정)
```

### Phase 3 (3개)

```
.claude/commands/kit-list.md
.claude/commands/kit-audit.md
.claude/agents/kit-maintainer.md
```

---

## 의존성 그래프

```
Phase 0          Phase 1              Phase 2              Phase 3          Phase 4
────────────     ──────────────────   ──────────────────   ─────────────   ────────────────
src/ 마이그레이션  templates (8개)      schemas (5개)                        Codex templates (4)
    │               │                    │                                     │
    ▼               ▼                    ▼                                     ▼
src/claude/      kit-scaffolding      kit-validation ──► /kit-audit       Codex schemas (4)
src/codex/          │                    │                   │                 │
    │               ▼                    ▼                   ▼                 ▼
    └──────────► /kit-create         /kit-validate       kit-maintainer   --target both
                                         │                                --skip-codex
                                     kit-naming-guard ─► /kit-list        pairing-registry
                                         │               (독립)           kit-audit C7
                                     settings.json
```

---

## 핵심 참조 파일 (구현 시 반드시 참조)

> 아래 경로는 Phase 0 완료 후 기준이다. Phase 0 전에는 `src/claude/` 대신 `src/`를 사용한다.

| 참조 파일 | 용도 | 관련 Phase |
|-----------|------|-----------|
| `src/claude/dev/skills/dev-tdd-workflow/SKILL.md` | 스킬 정규 패턴 | 1 |
| `src/claude/dev/agents/dev-architect.md` | 에이전트 정규 패턴 (10개 XML) | 1 |
| `src/claude/dev/commands/dev-run.md` | 간단 커맨드 패턴 | 1 |
| `src/claude/dev/commands/dev-explore.md` | 복합 커맨드 패턴 | 1 |
| `src/claude/dev/hooks/dev-tdd-guard.js` | PreToolUse 훅 패턴 | 1, 2 |
| `src/claude/core/hooks/edit-tracker.js` | PostToolUse 훅 패턴 | 1 |
| `src/claude/core/rules/golden-principles.md` | 룰 패턴 | 1 |
| `scripts/setup.js` | SRC_DIR, substituteVars(), buildHooksConfig() | 0, 1, 2 |
| `scripts/codex-hook-compat.js` | Codex 훅 필터링 | 4 |
| `src/claude/core/skills/session-wrap/references/` | references/ 구조 패턴 | 1, 2 |
| `docs/codex-compatibility/04-asset-mapping-rules.md` | 페어링 규칙 | 4 |

---

## 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 템플릿 드리프트 | 실제 패턴과 템플릿 괴리 | `/kit-audit`에 템플릿-현실 비교 항목 포함 |
| 훅 미등록 | 새 훅이 배포에 누락 | `/kit-create hook` 완료 시 등록 안내 + `/kit-audit C5` 교차 검증 |
| 한국어/영어 혼용 | 일관성 저하 | 템플릿 구조는 영어, description은 사용자 입력(한국어 허용) |
| 규칙 변경 시 스키마 미갱신 | 검증 오탐/누락 | 스키마 변경을 CHANGELOG에 기록하는 규칙 |

---

## 구현 시작 체크리스트

- [ ] `.claude/skills/kit-scaffolding/references/` 디렉토리 생성
- [ ] `.claude/skills/kit-validation/references/` 디렉토리 생성
- [ ] `.claude/commands/` 디렉토리 확인
- [ ] `.claude/agents/` 디렉토리 확인
- [ ] `.claude/hooks/` 디렉토리 생성
- [ ] 참조 원본 파일 최신 내용 확인
- [ ] Phase 0부터 순서대로 구현 시작

---

## Phase 4: Codex 통합 (Phase 3 완료 후)

> `src/codex/`에 Codex-native 자산 생성을 지원하는 듀얼 타깃 기능.

### 구현 순서

| # | 대상 | 파일 | 의존성 |
|---|------|------|--------|
| 4a-1 | template-codex-agent.md | `.claude/skills/kit-scaffolding/references/` | Phase 0 |
| 4a-2 | template-codex-command.md | 〃 | Phase 0 |
| 4a-3 | template-codex-hook.md | 〃 | Phase 0 |
| 4a-4 | template-codex-skill.md | 〃 | Phase 0 |
| 4b-1 | /kit-create --target 로직 | `.claude/commands/kit-create.md` 수정 | Phase 1 + 4a |
| 4b-2 | /kit-create --skip-codex 로직 | 〃 | 4b-1 |
| 4c-1 | pairing-registry.json 스키마 | `src/pairing-registry.json` | Phase 0 |
| 4c-2 | /kit-create 레지스트리 갱신 | 수정 | 4b-1 + 4c-1 |
| 4c-3 | schema-codex-agent.md | `.claude/skills/kit-validation/references/` | 4a-1 |
| 4c-4 | schema-codex-command.md | 〃 | 4a-2 |
| 4c-5 | schema-codex-hook.md | 〃 | 4a-3 |
| 4c-6 | schema-codex-skill.md | 〃 | 4a-4 |
| 4d-1 | kit-validate --target 확장 | 수정 | Phase 2 + 4c |
| 4d-2 | kit-audit C7 페어링 일관성 | 수정 | Phase 3 + 4c-1 |
| 4d-3 | kit-list --target/--pairing | 수정 | Phase 3 |
| 4d-4 | kit-naming-guard 듀얼 경로 | 수정 | Phase 2 |
| 4d-5 | kit-maintainer 듀얼 스캔 | 수정 | Phase 3 |

### Phase 4 완료 기준

- [ ] Codex 템플릿 4종 작성
- [ ] /kit-create --target both로 agent/command 생성 가능
- [ ] pairing-registry.json 자동 갱신
- [ ] Codex 스키마 4종 작성
- [ ] kit-audit C7 페어링 검증 작동
- [ ] kit-naming-guard가 src/codex/ 경로 인식

### MVCI (Minimum Viable Codex Integration)

전체 Phase 4를 한 번에 구현하지 않을 경우 최소 5개 항목:

| # | 항목 | 이유 |
|---|------|------|
| 1 | Phase 0 (src/ 마이그레이션) | 구조적 기반 |
| 2 | template-codex-agent.md | 가장 divergent한 포맷 |
| 3 | /kit-create --target + --skip-codex | 듀얼 타깃 진입점 |
| 4 | kit-naming-guard 듀얼 경로 | false positive 방지 |
| 5 | pairing-registry.json 스키마 | 추적 기반 |
