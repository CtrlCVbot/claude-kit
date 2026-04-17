# Implementation Plan

- 문서 ID: CAI-05
- 목적: `copy` 도메인 도입을 A-1부터 A6까지 구현 가능한 실행 단위로 나눈다.
- 선행 문서: [01-scope-and-decisions.md](./01-scope-and-decisions.md), [04-component-specs.md](./04-component-specs.md)
- 근거: [archive/2026-04-16-original/08_adoption-roadmap.md](./archive/2026-04-16-original/08_adoption-roadmap.md) (CAI-08)
- 제외 범위: 이 문서는 계획이다. `src/claude/copy`, `scripts/setup.js`, registry 파일을 실제 수정하지 않는다.

## 1. 개요

copy 도메인은 CAI-08 adoption roadmap의 A-1부터 A6까지를 구현 범위로 한다. A7(hooks reminder)부터 A9(orchestrator)는 A1~A6 안정화 이후 별도 승인으로 진행한다.

각 단계마다 네 가지를 정의한다:
1. **산출물** -- 생성하거나 수정할 파일 목록
2. **검증** -- 해당 단계의 완료를 증명하는 명령과 기대 결과
3. **게이트** -- 다음 단계로 넘어가기 위한 조건
4. **롤백** -- 문제 발생 시 되돌리는 방법

| 원칙 | 설명 |
| --- | --- |
| A-1 first | source 디렉터리와 setup/registry 기반을 먼저 준비한다 |
| rules before agents | agents가 공통 기준을 참조할 수 있도록 rules를 먼저 둔다 |
| agents before commands | command는 agent contract가 안정화된 후 작성한다 |
| reminder before blocking | hooks는 reminder부터 도입하고 blocking은 별도 승인 후 적용한다 |
| verification after each phase | 각 단계마다 source, setup, generated output 검증을 기록한다 |

**실행 순서**: A-1 (인프라) → A0-a (기존 도메인 수정) → A0-b (plan 정렬) → A1 (rules) → A2~A6 (copy 컴포넌트)

## 2. 단계별 상세

### 2.1 A-1: copy 도메인 인프라 생성

| 항목 | 내용 |
| --- | --- |
| **목표** | `src/claude/copy/` 디렉토리 구조와 setup/registry 기반을 생성한다 |
| **위험도** | 낮음 |

**산출물**:
- `src/claude/copy/` 디렉토리 구조: `agents/`, `commands/`, `hooks/`, `rules/`, `skills/`
- `src/claude/copy/hooks/package.json` (`{"type": "commonjs"}`)
- `profile.json`에 `"copy"` 도메인 추가 (opt-in)
- `setup.js`에 copy 도메인 처리 로직 추가
- `CLAUDE.md.template`에 copy 도메인 섹션 추가
- `CLAUDE-KIT-QUICKSTART.md.template`에 copy 도메인 가이드 추가
- `exception-registry.json`에 copy 훅 Codex 호환성 예외 등록
- `pairing-registry.json`에 copy 컴포넌트 항목 추가 (status: unpaired)

**검증**:
```bash
pnpm claude-kit:setup && ls .claude/rules/
# 기대: copy 도메인 활성 시 copy-*.md가 배포 경로에 존재
```

**게이트**: setup.js가 copy 도메인을 올바르게 배포하고, 기존 도메인(core/dev/plan) 배포에 영향이 없어야 한다.

**롤백**: `src/claude/copy/` 디렉토리 제거 + profile.json/setup.js/template/registry 변경 revert.

---

### 2.2 A0-a: 기존 Plan/Dev 도메인 수정

| 항목 | 내용 |
|------|------|
| 목적 | 기존 plan/dev 컴포넌트에 시나리오/Feature 유형/WBS 인식을 추가한다 |
| 선행 조건 | A-1 완료 (copy 인프라 존재) |
| 작업 항목 | |
| | `/plan-draft`: 시나리오(A/B/C) + Feature 유형(copy/dev) + Lite/Standard 판정 로직 추가 |
| | `/plan-prd`: 2-pass PRD 모드 지원 (scope/detail) |
| | `/plan-bridge`: bridge context에 시나리오/유형 메타데이터 추가 |
| | `/plan-screen`: RICE 충실도 해석 + WBS 분류 추가 |
| | `/plan-review`: PCC에 copy 시나리오 C 정합성 검증 추가 |
| | `/dev-feature`: Feature 유형 체크 전제 조건 추가 |
| | `/dev-run`: Story ID 입력 수용 추가 |
| | `verification.md`: 시나리오별 검증 기준 참조 추가 |
| | Routing Metadata 파일 생성: `/plan-draft`가 `.plans/features/active/{slug}/00-context/07-routing-metadata.md` 생성 로직 추가 |
| | `/plan-bridge`가 routing metadata를 bridge context에 포함하도록 수정 |
| | Stage Manifest에 `copyStages` 블록 추가 (copy 커맨드가 갱신) |
| 검증 | 기존 plan/dev 워크플로우가 copy 미활성 상태에서 정상 동작하는지 회귀 확인 |
| 게이트 | 기존 도메인 회귀 테스트 통과 |
| 위험도 | **높음** — 기존 기능에 영향. 회귀 확인 필수 |
| 커밋 | `feat: plan/dev 도메인에 시나리오/WBS 인식 추가` |

---

### 2.3 A0-b: plan 워크플로우 정렬

| 항목 | 내용 |
| --- | --- |
| **목표** | 시나리오(A/B/C) + Feature 유형(copy/dev) + 규모(Lite/Standard) 분류가 확정되었음을 확인한다 |
| **위험도** | 낮음 |

**산출물**:
- 기존 문서 갱신 중심. 즉시 `.claude` 구현 수정 없음
- 시나리오/Feature유형 분류 체계가 본 문서 패키지(01~04)에 확정되었음을 확인

**검증**:
```bash
# 시나리오 의사결정 트리와 Feature 유형 라우팅이 문서에 존재하는지 확인
grep -l "시나리오" 01-scope-and-decisions.md 03-workflow-and-pipeline.md
# 기대: 두 파일 모두 매치
```

**게이트**: plan/copy/dev 책임 경계가 명확하고, `.plans/` 생성 정책이 정의되어 있어야 한다.

**롤백**: 문서 변경만이므로 해당 문서 파일 revert.

---

### 2.4 A1: copy 룰 작성

| 항목 | 내용 |
| --- | --- |
| **목표** | 모든 copy 에이전트가 참조할 공통 fidelity/evidence/gate 기준을 rules로 정의한다 |
| **위험도** | 낮음 |

**산출물** (5개 파일):
- `src/claude/copy/rules/copy-fidelity.md` -- visual/interaction 기준과 금지 사항
- `src/claude/copy/rules/copy-evidence.md` -- manifest, pairing, missing, stale 기준
- `src/claude/copy/rules/copy-gates.md` -- P0/P1, phase/round, generated output gate
- `src/claude/copy/rules/copy-commands.md` -- `/copy-*` command 사용 원칙
- `src/claude/copy/rules/copy-variant.md` -- variant/host map 검증 기준

| | `copy-evidence.md` 룰에 Evidence Manifest 저장 위치 명시: `.plans/features/active/{slug}/evidence/manifest.json` |

**검증**:
```bash
pnpm claude-kit:setup && ls .claude/rules/copy-*.md
# 기대: 5개 copy rules가 배포됨
```

**게이트**: 배포된 rules가 기존 core/dev/plan rules를 덮어쓰지 않아야 한다.

**롤백**: `src/claude/copy/rules/copy-*.md` 파일 제거 후 setup 재실행.

---

### 2.5 A2: copy 에이전트 작성

| 항목 | 내용 |
| --- | --- |
| **목표** | visual/interaction gap 분석, evidence 관리, QA review를 수행하는 에이전트를 정의한다 |
| **위험도** | 중간 |

**산출물** (4개 파일):
- `src/claude/copy/agents/copy-fidelity.md` -- Visual Gap Row 출력
- `src/claude/copy/agents/copy-interaction-fidelity.md` -- Interaction State Row 출력
- `src/claude/copy/agents/copy-reference-baseline.md` -- Evidence Manifest + Pairing Matrix 출력
- `src/claude/copy/agents/copy-qa-reviewer.md` -- QA Result + readiness 상태 출력

**검증**:
```bash
# frontmatter와 Agent_Prompt 구조 확인
head -20 src/claude/copy/agents/copy-fidelity.md
# 기대: frontmatter + <Agent_Prompt> 형식
```

**게이트**: sample input에 대한 schema 출력이 유효해야 한다. 시나리오별 활성화(C=기획시, A/B=QA시) 양쪽 경로 모두 테스트.

**롤백**: `src/claude/copy/agents/copy-*.md` 파일 제거 또는 archived 처리.

---

### 2.6 A3: copy 커맨드 작성

| 항목 | 내용 |
| --- | --- |
| **목표** | 에이전트를 반복 가능한 `/copy-*` 워크플로우로 묶는다 |
| **위험도** | 중간 |

**산출물** (7개 파일):
- `src/claude/copy/commands/copy-reference-refresh.md` -- capture scope + manifest contract
- `src/claude/copy/commands/copy-visual-review.md` -- visual 분석
- `src/claude/copy/commands/copy-interaction-review.md` -- interaction 분석
- `src/claude/copy/commands/copy-gap-board.md` -- priority/gate/verification 통합
- `src/claude/copy/commands/copy-plan-unit.md` -- 실행 단위 계획 전환
- `src/claude/copy/commands/copy-verify.md` -- build/evidence/document 검증
- `src/claude/copy/commands/copy-closeout.md` -- approval + residual risk

**검증**:
```bash
# command별 frontmatter 형식 확인
head -5 src/claude/copy/commands/copy-*.md
# 기대: 각 파일에 input/output/gate 명시
```

| | `/copy-verify`: 시나리오 A/B에서 자동으로 `/copy-visual-review` + `/copy-interaction-review` 체이닝 구현 |
| | `/copy-reference-refresh`: `--check-stale` 플래그 (향후 예약, 기본 구현에서는 미포함) |

**게이트**: command가 다음 Phase를 자동 진행하지 않아야 한다.

**롤백**: `src/claude/copy/commands/copy-*.md` 파일 제거.

---

### 2.7 A4: reminder 훅 작성

| 항목 | 내용 |
| --- | --- |
| **목표** | evidence 누락, scope drift, doc drift를 조기에 안내하는 훅을 작성한다 |
| **위험도** | 중간 |

**산출물** (5개 파일):
- `src/claude/copy/hooks/copy-evidence-reminder.js` -- evidence 누락 안내
- `src/claude/copy/hooks/copy-doc-drift-check.js` -- 문서 drift 감지
- `src/claude/copy/hooks/copy-scope-guard.js` -- scope drift 경고
- `src/claude/copy/hooks/copy-variant-env-guard.js` -- variant 검증 안내
- `src/claude/copy/hooks/copy-gate-stop.js` -- gate 위반 blocking 후보 (기본 비활성)

**검증**:
```bash
node --check src/claude/copy/hooks/copy-evidence-reminder.js
node --check src/claude/copy/hooks/copy-doc-drift-check.js
node --check src/claude/copy/hooks/copy-scope-guard.js
node --check src/claude/copy/hooks/copy-variant-env-guard.js
node --check src/claude/copy/hooks/copy-gate-stop.js
# 기대: 모든 파일 exit 0
```

| | `plan-doc-guard.js` 예외: `.plans/features/*/evidence/` 경로의 파일 생성을 허용하도록 확인 (이미 `.plans/` 내부이므로 기존 허용 범위일 가능성 높음 — 검증 필요) |

**게이트**: reminder만 출력하고 정상 edit을 막지 않아야 한다. blocking hook은 별도 승인 후 활성화.

**롤백**: settings.json에서 hook 비활성화 (스크립트 파일은 유지).

---

### 2.8 A5: copy 스킬 작성

| 항목 | 내용 |
| --- | --- |
| **목표** | copy 워크플로우를 재사용 가능한 스킬로 정의한다 |
| **위험도** | 낮음 |

**산출물** (5개):
- `src/claude/copy/skills/copy-pipeline/SKILL.md` -- 전체 copy 파이프라인
- `src/claude/copy/skills/copy-evidence-management/SKILL.md` -- evidence 관리
- `src/claude/copy/skills/copy-gap-analysis/SKILL.md` -- gap 분석 워크플로우
- `src/claude/copy/skills/copy-qa-workflow/SKILL.md` -- QA 검증 워크플로우
- `src/claude/copy/skills/copy-closeout-workflow/SKILL.md` -- closeout 워크플로우

**검증**:
```bash
ls src/claude/copy/skills/*/SKILL.md
# 기대: 5개 SKILL.md 존재
```

**게이트**: SKILL.md frontmatter 형식이 기존 plan/dev 스킬과 동일해야 한다.

**롤백**: `src/claude/copy/skills/` 하위 디렉토리 제거.

---

### 2.9 A6: 생성 출력 검증

| 항목 | 내용 |
| --- | --- |
| **목표** | 전체 setup 회귀 테스트를 수행하여 copy 도메인 추가가 기존 도메인에 영향을 주지 않음을 확인한다 |
| **위험도** | 높음 |

**산출물**:
- 전체 setup 회귀 테스트 결과
- `.claude/` 배포 결과와 `src/claude/copy/` source 매핑 일치 확인

**검증**:
```bash
# 1. copy 도메인 배포 확인
pnpm claude-kit:setup && ls .claude/agents/copy-*.md .claude/commands/copy-*.md .claude/rules/copy-*.md
# 기대: 에이전트 4개, 커맨드 7개, 룰 5개 존재

# 2. 기존 도메인 회귀 확인
ls .claude/rules/coding-style.md .claude/rules/verification.md
# 기대: core 룰 정상 존재

# 3. hook syntax 전체 확인
node --check src/claude/copy/hooks/*.js
# 기대: exit 0
```

**게이트**: 기존 도메인(core/dev/plan) 배포가 정상이고, copy 컴포넌트가 모두 올바르게 배포되어야 한다.

**롤백**: copy 도메인을 profile.json에서 제거 후 setup 재실행.

## 3. 실행 단위 목록

| 실행 단위 | 단계 | 산출물 | 대상 컴포넌트 | 커밋 메시지 |
|----------|------|--------|-------------|-----------|
| ADOPT-A-1-01 | A-1 | `src/claude/copy/` 구조 + profile + setup + templates | | `feat: claude-kit copy 도메인 인프라` |
| ADOPT-A-1-02 | A-1 | exception-registry + pairing-registry | | `chore: copy 도메인 Codex 레지스트리` |
| ADOPT-A0a-01 | A0-a | plan 커맨드 시나리오/WBS 수정 | `/plan-draft`, `/plan-prd`, `/plan-bridge`, `/plan-screen`, `/plan-review` | `feat: plan 커맨드 시나리오/WBS 인식` |
| ADOPT-A0a-02 | A0-a | dev 커맨드 Feature 유형 인식 수정 | `/dev-feature`, `/dev-run` | `feat: dev 커맨드 Feature 유형 인식` |
| ADOPT-A0a-03 | A0-a | core 룰 시나리오 참조 추가 | `verification.md`, `interaction.md` | `docs: core 룰 시나리오 참조 추가` |
| ADOPT-A0a-04 | A0-a | routing metadata 생성 로직 추가 | `/plan-draft`, bridge context template | `feat: routing metadata 파일 생성` |
| ADOPT-A0a-05 | A0-a | stage manifest copy 확장 | stage-manifest.json schema | `feat: stage manifest copyStages 블록` |
| ADOPT-A0b-01 | A0-b | 시나리오/Feature유형 분류 확인, plan 경계 문서화 | | `docs: CAI plan workflow 반영` |
| ADOPT-A1-01 | A1 | copy rules 5개 | | `docs: copy fidelity/evidence/gates/commands/variant rules` |
| ADOPT-A2-01 | A2 | copy-fidelity + copy-interaction-fidelity agents | | `feat: visual/interaction fidelity agents` |
| ADOPT-A2-02 | A2 | copy-reference-baseline + copy-qa-reviewer agents | | `feat: reference baseline/QA review agents` |
| ADOPT-A3-01 | A3 | copy-reference-refresh + copy-visual-review + copy-interaction-review commands | | `feat: copy 분석 commands` |
| ADOPT-A3-02 | A3 | copy-gap-board + copy-plan-unit + copy-verify + copy-closeout commands | | `feat: copy 실행/검증 commands` |
| ADOPT-A4-01 | A4 | reminder hooks 4개 | | `feat: copy reminder hooks` |
| ADOPT-A4-02 | A4 | gate-stop hook (기본 비활성) | | `feat: copy gate-stop hook (비활성)` |
| ADOPT-A5-01 | A5 | copy skills 5개 | | `docs: copy workflow skills` |
| ADOPT-A6-01 | A6 | 전체 setup 회귀 테스트 | | `test: copy 도메인 setup 출력 검증` |

## 4. 게이트 정책

| Gate | 시점 | 확인 항목 | 다음 단계 조건 | 검증 방법 |
| --- | --- | --- | --- | --- |
| Gate A-1 | A-1 완료 후 | copy 인프라가 정상 배포 | A0-a 진입 승인 | |
| Gate A0-a | A0-a 완료 후 | 기존 plan/dev 워크플로우가 copy 미활성 상태에서 정상 동작하는지 | A0-b 진입 승인 | 기존 도메인 회귀 테스트 실행 |
| Gate 0 | A0-b 완료 후 | plan/copy/dev 경계와 시나리오/Feature유형 분류 확정 | A1 rules 도입 승인 | |
| Gate B | A1 완료 후 | rules가 기존 규칙과 충돌하지 않음 | agent 도입 승인 | |
| Gate C | A2 완료 후 | agent sample output이 fidelity 판단에 유용함 | command 도입 승인 | |
| Gate D | A3 완료 후 | command가 gate를 우회하지 않음 | hook 도입 승인 | |
| Gate E | A4/A5 완료 후 | hook이 정상 edit을 막지 않음 | A6 회귀 테스트 승인 | |
| Gate F | A6 완료 후 | 전체 회귀 테스트 통과 | 운영 전환 승인 | |

## 5. 롤백 기준

| 변경 유형 | 롤백 방식 |
| --- | --- |
| 룰 파일 | 해당 `src/claude/copy/rules/` 파일 revert 또는 제거 |
| 에이전트 파일 | `src/claude/copy/agents/` 파일 archived 처리 또는 제거 |
| 커맨드 파일 | `src/claude/copy/commands/` 파일 제거 |
| 훅 스크립트 | settings.json에서 hook 연결 제거 (스크립트 파일 유지) |
| setup/template/registry | 직전 commit revert 또는 명시적 후속 수정 |
| generated output | source 롤백 후 `pnpm claude-kit:setup` 재실행 |

destructive command를 사용하지 않고, git revert 또는 후속 수정 커밋으로 되돌리는 것을 원칙으로 한다.

## 6. 구현 전 체크

| 체크 | 조건 |
| --- | --- |
| 사용자 승인 | A-1 실제 구현 전 첫 구현 범위 승인 |
| dirty files | unrelated dirty file 제외 전략 확인 |
| source target | `.claude/*` 직접 수정이 아니라 `src/claude/copy/*` 수정 |
| verification | [06-readiness-and-verification.md](./06-readiness-and-verification.md)의 pre-check 통과 |
