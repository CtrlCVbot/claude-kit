# Implementation Plan

- 문서 ID: CAI-05
- 목적: `copy` 도메인 도입을 구현 가능한 실행 단위로 나눈다.
- 선행 문서: [02-target-architecture.md](./02-target-architecture.md), [04-component-specs.md](./04-component-specs.md)
- 제외 범위: 이 문서는 계획이다. 이 단계에서 `src/claude/copy`, `scripts/setup.js`, registry 파일을 실제 수정하지 않는다.

## 1. 구현 전략

`copy` 도메인은 낮은 위험의 문서/rule부터 시작해 agents, commands, hooks 순으로 확장한다. generated output은 source 구현 후 setup 검증으로만 확인한다.

| 원칙 | 설명 |
| --- | --- |
| A-1 first | source 디렉터리와 setup/registry 기반을 먼저 준비한다. |
| rules before agents | agents가 공통 기준을 참조할 수 있도록 rules를 먼저 둔다. |
| agents before commands | command는 agent contract가 안정화된 후 작성한다. |
| reminder before blocking | hooks는 reminder부터 도입하고 blocking은 별도 승인 후 적용한다. |
| verification after each phase | 각 단계마다 source, setup, generated output 검증을 기록한다. |

## 2. 단계별 계획

| 단계 | 목표 | 주요 파일 | Acceptance criteria |
| --- | --- | --- | --- |
| A-1 | copy 도메인 인프라 준비 | `src/claude/copy/`, `src/claude/copy/hooks/package.json` | 하위 디렉터리와 CommonJS 설정 존재 |
| A0 | setup/template/registry 영향 반영 | `scripts/setup.js`, `src/templates/*`, registry JSON | `"copy"` domain opt-in 처리와 문서 안내 가능 |
| A1 | copy rules 작성 | `src/claude/copy/rules/copy-*.md` | rules가 core rules를 덮어쓰지 않음 |
| A2 | copy agents 작성 | `src/claude/copy/agents/copy-*.md` | frontmatter와 `<Agent_Prompt>` 구조 통과 |
| A3 | copy commands 작성 | `src/claude/copy/commands/copy-*.md` | command별 input/output/gate 명시 |
| A4 | reminder hooks 작성 | `src/claude/copy/hooks/copy-*.js` | `node --check` 통과, blocking 기본 비활성 |
| A5 | copy skills 작성 | `src/claude/copy/skills/*/SKILL.md` | command/agent workflow 재사용 가능 |
| A6 | generated output 검증 | `.claude/*`, plugin output, metadata | setup 후 source/deploy 매핑 일치 |

## 3. 권장 커밋 단위

| 단계 | 권장 커밋 |
| --- | --- |
| A-1 | `feat: claude-kit copy 도메인 인프라 추가` |
| A0 | `feat: setup copy 도메인 opt-in 처리 추가` |
| A1 | `docs: copy 도메인 rules 추가` |
| A2 | `feat: copy fidelity agents 추가` |
| A3 | `feat: copy command workflow 추가` |
| A4 | `feat: copy reminder hooks 추가` |
| A5 | `docs: copy workflow skills 추가` |
| A6 | `test: copy 도메인 setup 출력 검증` |

## 4. 상세 작업 항목

### 4.1 A-1 Infrastructure

| 작업 | 완료 기준 |
| --- | --- |
| `src/claude/copy` 생성 | `agents`, `commands`, `hooks`, `rules`, `skills` 하위 디렉터리 존재 |
| hooks package 생성 | `src/claude/copy/hooks/package.json`에 CommonJS 설정 |
| placeholder 금지 | 빈 placeholder 대신 각 단계에서 실제 필요한 파일만 추가 |

### 4.2 A0 Package Integration

| 작업 | 완료 기준 |
| --- | --- |
| domain opt-in 확인 | `profile.json`에 `"copy"`가 있을 때만 copy output 생성 |
| setup 변경 | 기존 `core`, `dev`, `plan` output에 회귀 없음 |
| quickstart 변경 | active domains에 `copy`가 있을 때만 copy 안내 표시 |
| registry 변경 | copy components의 pairing/exception/portability 상태 기록 |

### 4.3 A1 Rules

| 작업 | 완료 기준 |
| --- | --- |
| `copy-fidelity.md` | visual/interaction 기준과 금지 사항 포함 |
| `copy-evidence.md` | manifest, pairing, missing, stale 기준 포함 |
| `copy-gates.md` | P0/P1, phase/round, generated output gate 포함 |
| `copy-commands.md` | `/copy-*` command 사용 원칙 포함 |
| `copy-variant.md` | variant/host map 검증 기준 포함 |

### 4.4 A2 Agents

| 작업 | 완료 기준 |
| --- | --- |
| `copy-fidelity` | Visual Gap Row 출력 가능 |
| `copy-interaction-fidelity` | Interaction State Row 출력 가능 |
| `copy-reference-baseline` | Evidence Manifest와 Pairing Matrix 출력 가능 |
| `copy-qa-reviewer` | QA Result와 readiness 상태 출력 가능 |

### 4.5 A3 Commands

| 작업 | 완료 기준 |
| --- | --- |
| reference command | capture scope와 manifest contract 명시 |
| review commands | visual/interaction 분석 command 분리 |
| gap board command | priority/gate/verification 통합 |
| verify command | build/evidence/document 검증 profile 명시 |
| closeout command | approval pending과 residual risk 명시 |

### 4.6 A4 Hooks

| 작업 | 완료 기준 |
| --- | --- |
| reminder hooks | 정상 edit을 막지 않고 안내만 출력 |
| gate hook | blocking 후보로만 두고 기본 연결 전 별도 승인 |
| syntax check | 모든 hook이 `node --check` 통과 |
| settings | 기존 destructive deny와 plan/dev hooks를 보존 |

## 5. Rollback

| 변경 유형 | rollback 방식 |
| --- | --- |
| rules/agents/commands/skills | 해당 source 파일 제거 또는 후속 revert commit |
| hooks | settings 연결 제거 후 hook 파일 보존 또는 후속 제거 |
| setup/template | 직전 commit revert 또는 명시적 후속 수정 |
| registry | JSON entry rollback 후 load check |
| generated output | source rollback 후 setup 재실행 |

## 6. 구현 전 체크

| 체크 | 조건 |
| --- | --- |
| 사용자 승인 | A-1 실제 구현 전 첫 구현 범위 승인 |
| dirty files | unrelated dirty file 제외 전략 확인 |
| source target | `.claude/*` 직접 수정이 아니라 `src/claude/copy/*` 수정 |
| verification | [06-readiness-and-verification.md](./06-readiness-and-verification.md)의 pre-check 통과 |
