# Target Architecture

- 문서 ID: CAI-02
- 목적: `copy` 도메인의 목표 source 구조, generated output, setup/template/registry 영향을 정의한다.
- 선행 문서: [01-scope-and-decisions.md](./01-scope-and-decisions.md)
- 후행 문서: [03-workflow-and-pipeline.md](./03-workflow-and-pipeline.md)

---

## 1. Source/Deploy 매핑

`copy` 도메인의 소스는 `src/claude/copy/` 하위에 위치하며, `pnpm claude-kit:setup` 실행 시 `.claude/*`로 배포된다.

### 1.1 Source 구조

```
src/claude/copy/
  agents/           --> .claude/agents/copy-*.md
  commands/          --> .claude/commands/copy-*.md
  hooks/             --> .claude/hooks/copy-*.js
    package.json         ({"type": "commonjs"})
  rules/             --> .claude/rules/copy-*.md
  skills/            --> .claude/skills/copy-*/SKILL.md
```

### 1.2 Source/Deploy 매핑 상세

| source 경로 | 목적 | generated output |
|------------|------|-----------------|
| `src/claude/copy/agents/` | copy-specific subagent prompts | `.claude/agents/copy-*.md` |
| `src/claude/copy/commands/` | `/copy-*` command definitions | `.claude/commands/copy-*.md` |
| `src/claude/copy/hooks/` | copy reminder/blocking hooks | `.claude/hooks/copy-*.js` |
| `src/claude/copy/rules/` | copy domain rules | `.claude/rules/copy-*.md` |
| `src/claude/copy/skills/` | reusable workflow guides | `.claude/skills/copy-*/SKILL.md` |

### 1.3 핵심 원칙

- `.claude/*` 경로는 사용자 프로젝트에 설치되는 **generated output**이다
- 소스 문서는 `.claude/*`를 직접 수정 대상으로 두지 않는다
- 개발자는 `src/claude/copy/*`를 수정하고, `pnpm claude-kit:setup`으로 재생성한다

### 1.4 Routing Metadata 경로

copy 도메인 도입 시 `.plans/` 구조에 routing metadata가 추가된다:

| 파일 | 경로 | 생성 주체 | 소비 주체 |
|------|------|---------|---------|
| Routing Metadata | `.plans/features/active/{slug}/00-context/07-routing-metadata.md` | `/plan-draft` | `/plan-bridge`, `/copy-*`, `/dev-*` |
| Evidence Manifest | `.plans/features/active/{slug}/evidence/manifest.json` | `/copy-reference-refresh` | `/copy-verify` |
| Stage Manifest (copy 확장) | `.plans/stage-manifest.json` 내 `copyStages` 블록 | copy 커맨드 | 진행 상태 추적 |

> Routing metadata는 `/plan-draft`가 생성하고, `/plan-bridge`가 bridge context에 포함하며, 이후 모든 copy/dev 커맨드가 Feature 유형과 시나리오를 이 파일에서 읽는다.

---

## 2. profile.json 통합

### 2.1 opt-in 활성화

`copy`는 `profile.json`의 `domains` 배열에 추가하여 활성화하는 opt-in 도메인이다.

| 설정 | domains 값 | 설명 |
|------|-----------|------|
| 기본값 (copy 미포함) | `["core", "dev"]` | copy 도메인 비활성 |
| copy만 추가 | `["core", "dev", "copy"]` | copy 활성, plan 미포함 |
| plan + copy 함께 | `["core", "dev", "plan", "copy"]` | 전체 파이프라인 활성 |

### 2.2 주의 사항

- `core`는 기반 도메인이므로 항상 포함되어야 한다
- `copy`는 `plan` 없이도 동작 가능하지만, 전체 파이프라인(plan > copy > dev)을 사용하려면 `plan`도 활성화 권장
- `profile.json` 템플릿의 기본값은 변경하지 않는다 (`["core", "dev"]` 유지)

---

## 3. setup.js 영향

`scripts/setup.js`는 active domains를 읽고 domain별 components를 target output으로 emit한다. `copy` 도메인 도입 시 아래 항목을 검토한다.

### 3.1 검토 항목

| 항목 | 필요 작업 |
|------|----------|
| domain discovery | `src/claude/copy/`가 기존 domain traversal 루프에 자연스럽게 포함되는지 확인 |
| active domains | `profile.json`의 `domains`에 `"copy"`가 있을 때만 emit |
| hooks config | `buildHooksConfig`에 copy hook 연결 정책 추가 여부 결정 |
| quickstart | active domains에 `copy`가 있을 때 안내 문구 포함 |

### 3.2 hooks 요구사항

- `src/claude/copy/hooks/package.json`에 `{"type": "commonjs"}` 설정 필수
- 기존 도메인(core/dev/plan) 배포에 영향이 없어야 한다 (회귀 확인)
- copy hook과 `plan-doc-guard.js`의 충돌 여부 사전 검증 필요 (동일 `PreToolUse` `Edit|Write` 이벤트에서 동시 발동 가능)

---

## 4. Registry 영향

### 4.1 exception-registry.json

copy 훅의 Codex 호환성 예외를 등록한다.

| 항목 | 등록 내용 |
|------|----------|
| copy hooks | Codex target에서의 hook event model 차이로 인한 예외 또는 검증 필요 항목 |

### 4.2 pairing-registry.json

copy 컴포넌트의 Claude-Codex pairing 상태를 등록한다.

| component | 초기 status | 이유 |
|-----------|-----------|------|
| agents | `unpaired` | 초기 구현은 Claude target만. Codex pairing은 Phase 2+ |
| commands | `unpaired` | 동일 |
| hooks | `unpaired` | hook event model 검증 필요 |
| rules | `unpaired` | text rule이므로 pairing 가능성 높지만 초기에는 미등록 |
| skills | `unpaired` | skill 문서는 path copy 가능성이 높지만 초기에는 미등록 |

### 4.3 codex-portability.json

copy component별 전환 전략을 결정한다 (Phase 2+).

| component | Codex 전략 | 이유 |
|-----------|-----------|------|
| agents | `paired-review` | prompt는 이식 가능하지만 output quality 검증 필요 |
| commands | `paired-review` | command semantics는 이식 가능하지만 Codex UI/CLI 차이 확인 필요 |
| rules | `paired-direct` | text rule은 AGENTS 또는 plugin docs로 흡수 가능 |
| skills | `paired-direct` | skill 문서는 path copy 가능성이 높음 |
| hooks | `paired-review` 또는 `blocked` | hook event model과 Windows 동작 검증 필요 |

---

## 5. Template 영향

### 5.1 변경 대상 템플릿

| 템플릿 | 반영 방향 |
|--------|----------|
| `CLAUDE.md.template` | copy 도메인 활성 시 copy 도메인 섹션 추가 (커맨드 목록, 에이전트, 게이트 안내) |
| `CLAUDE-KIT-QUICKSTART.md.template` | copy 도메인 사용 시 quick start 가이드 섹션 추가 |
| `settings.json.template` | copy 훅 등록 (`PreToolUse` 이벤트에 copy hook 연결) |

### 5.2 변경하지 않는 템플릿

| 템플릿 | 이유 |
|--------|------|
| `profile.json.template` | 기본값은 `["core", "dev"]` 유지. 예시 주석으로 copy opt-in 안내만 추가 가능 |

---

## 6. 기존 도메인과의 관계

### 6.1 의존성 구조

```
core (기반) <-- copy (선택) --> dev (구현)
                  ^
                plan (기획)
```

### 6.2 관계 상세

| 관계 | 설명 |
|------|------|
| copy -> core | copy는 core의 공통 rules, hooks, skills에 의존한다 |
| copy -> plan | copy는 plan의 출력(PRD, bridge context)을 입력으로 사용한다 |
| copy -> dev | copy의 출력(gap board, plan unit)이 dev의 입력이 된다 |
| plan -> copy | plan은 copy를 직접 의존하지 않지만, 시나리오 C에서는 copy의 갭 데이터가 상세 PRD의 입력 |
| dev -> copy | dev는 copy를 직접 의존하지 않지만, copy QA가 dev 구현의 검증 수단 |

### 6.3 격리 원칙

- copy 도메인 추가가 기존 core/dev/plan 도메인의 배포에 **영향을 주지 않아야 한다**
- `profile.json`에 `"copy"`가 없으면 setup 시 copy 관련 output이 전혀 생성되지 않아야 한다
- 기존 도메인의 hooks, rules, commands와 이름 충돌이 없어야 한다 (copy 컴포넌트는 모두 `copy-` 접두사)

---

## 7. Architecture Acceptance Criteria

| 기준 | 완료 조건 |
|------|----------|
| source 구조 | `src/claude/copy/{agents,commands,hooks,rules,skills}` 디렉토리 존재 |
| hooks package | `src/claude/copy/hooks/package.json`에 `{"type": "commonjs"}` 설정 존재 |
| opt-in | `profile.json`에 `"copy"`가 있을 때만 copy output 생성 확인 |
| 회귀 없음 | copy 도메인 추가 후 기존 core/dev/plan setup이 동일하게 동작 확인 |
| no broken links | 문서가 존재하지 않는 generated output을 링크하지 않음 |
| registry | copy component가 pairing-registry, exception-registry, codex-portability에 반영됨 |
| template | CLAUDE.md, QUICKSTART, settings.json 템플릿에 copy 섹션 반영됨 |
| naming | 모든 copy 컴포넌트가 `copy-` 접두사 사용 (기존 도메인과 충돌 없음) |
