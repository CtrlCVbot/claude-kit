> [REVIEW 반영] P0: 소스 경로 수정. P1: claude-kit 인프라 준비 체크리스트 추가, 검증 명령 컬럼 추가.

# Claude Agent 구현 전 Readiness Checklist

- 문서 ID: CAI-09
- 작성일: 2026-04-15
- 문서 상태: 체크리스트 초안 완료
- 선행 문서: [01_package-map.md](./01_package-map.md), [02_copy-fidelity-agent-spec.md](./02_copy-fidelity-agent-spec.md), [03_interaction-fidelity-agent-spec.md](./03_interaction-fidelity-agent-spec.md), [04_reference-baseline-agent-spec.md](./04_reference-baseline-agent-spec.md), [05_qa-review-agent-spec.md](./05_qa-review-agent-spec.md), [06_command-workflow-spec.md](./06_command-workflow-spec.md), [07_hooks-and-rules-plan.md](./07_hooks-and-rules-plan.md), [08_adoption-roadmap.md](./08_adoption-roadmap.md), [10_plan-workflow-integration-plan.md](./10_plan-workflow-integration-plan.md)
- 관련 상위 문서: [18_claude-agent-integration-proposal.md](../../18_claude-agent-integration-proposal.md)
- 목적: 실제 `.claude` agent/command/hook/rule을 수정하기 전에 문서, 범위, gate, 검증 준비가 완료되었는지 판정한다.

## 1. 문서 목적

이 체크리스트는 “문서 패키지를 만들었다”와 “실제로 Claude Agent를 구현해도 된다”를 구분하기 위한 gate 문서다. Turner 홈페이지 정밀 카피 프로젝트는 원본 fidelity 판단이 중요하므로, agent 자동화를 성급하게 구현하면 오히려 잘못된 기준을 고착할 수 있다.

| 항목 | 기준 |
| --- | --- |
| 핵심 목표 | `.claude` (소스: `src/claude/copy/`) 수정 전 readiness 판정 |
| 주요 대상 | 문서 completeness, plan readiness, evidence readiness, gate, scope, rollback |
| 완료 상태 | `READY`, `READY_WITH_GAPS`, `NOT_READY`, `BLOCKED` |
| 금지 | readiness 없이 implementation/orchestrator agent 구현 |

## 2. Readiness 상태 정의

| 상태 | 의미 | 다음 액션 |
| --- | --- | --- |
| `READY` | 필수 문서, evidence 기준, gate, rollback이 모두 준비됨 | A1 rules 도입 착수 가능 |
| `READY_WITH_GAPS` | 일부 보류가 있지만 risk와 대응이 명확함 | 사용자 승인 후 제한 도입 가능 |
| `NOT_READY` | 핵심 문서 또는 검증 기준 누락 | CAI 문서 보강 |
| `BLOCKED` | 사용자 결정, 환경, 권한 등 외부 요인 필요 | 작업 중단 후 입력 요청 |

## 3. 문서 Completeness Checklist

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | `README.md`가 하위 문서 상태판과 읽기 순서를 제공한다. | 모든 하위 문서 링크 존재 |
| [ ] | `01_package-map.md`가 P18/P0/P10/P11/P15/P17과의 관계를 정의한다. | SSOT와 추적성 규칙 존재 |
| [ ] | `02_copy-fidelity-agent-spec.md`가 visual gap schema를 정의한다. | Gap Row Schema 존재 |
| [ ] | `03_interaction-fidelity-agent-spec.md`가 state map schema를 정의한다. | State Map Schema 존재 |
| [ ] | `04_reference-baseline-agent-spec.md`가 manifest schema와 required capture set을 정의한다. | Manifest Schema 존재 |
| [ ] | `05_qa-review-agent-spec.md`가 QA result schema와 readiness 상태를 정의한다. | QA Result Schema 존재 |
| [ ] | `06_command-workflow-spec.md`가 `/copy-*` command lifecycle을 정의한다. | 6단계 lifecycle 연결 |
| [ ] | `07_hooks-and-rules-plan.md`가 blocking/reminder 정책을 구분한다. | hook/rule 후보와 적용 순서 존재 |
| [ ] | `08_adoption-roadmap.md`가 A0~A9 도입 순서와 gate를 정의한다. | gate와 rollback 기준 존재 |
| [ ] | `10_plan-workflow-integration-plan.md`가 plan 기능 반영 기준을 정의한다. | `/plan-*`, `.plans/`, plan gate, CAI 반영 계획 존재 |
| [ ] | `11_work-breakdown-structure.md`가 WBS 4계층과 시나리오 A/B/C를 정의한다. | Epic/Feature/Story/Task + 시나리오 판정 기준 존재 |
| [ ] | `12_pipeline-integration-diagram.md`가 시나리오별 파이프라인 다이어그램을 제공한다. | Mermaid 흐름도에 A/B, C, Dev 3분기 존재 |
| [ ] | `13_pipeline-order-analysis.md`가 시나리오별 순서와 Feature 유형 라우팅을 정의한다. | 시나리오별 권장 순서 + copy/dev 판정 기준 존재 |

## 4. Plan Domain Readiness Checklist

| 체크 | 항목 | 완료 기준 | 검증 명령 |
| --- | --- | --- | --- |
| [ ] | `CLAUDE-KIT-QUICKSTART.md`에서 `plan` 활성 상태를 확인한다. | active domains에 `plan` 포함 | `grep "plan" CLAUDE-KIT-QUICKSTART.md` |
| [ ] | `.claude/commands/plan-*.md` (소스: `src/claude/plan/commands/`) 목록을 확인한다. | `/plan-idea`부터 `/plan-improve`까지 역할이 CAI-10과 일치 | `ls src/claude/plan/commands/plan-*.md` |
| [ ] | `.claude/agents/plan-*.md` (소스: `src/claude/plan/agents/`) 목록을 확인한다. | idea/screen/prd/wireframe/stitch/review agent 존재 | `ls src/claude/plan/agents/plan-*.md` |
| [ ] | `.claude/skills/plan-*` (소스: `src/claude/plan/skills/`) 목록을 확인한다. | plan pipeline, screening, PRD, review, archive 관련 skill 존재 | `ls src/claude/plan/skills/` |
| [ ] | `.claude/hooks/plan-doc-guard.js` (소스: `src/claude/plan/hooks/plan-doc-guard.js`) syntax를 확인한다. | `node --check` 통과 | `node --check src/claude/plan/hooks/plan-doc-guard.js` |
| [ ] | `.claude/settings.json`의 plan hook 연결을 확인한다. | `PreToolUse`의 `Edit\|Write`에 plan hook 존재 | `grep "plan-doc-guard" .claude/settings.json` |
| [ ] | `.claude/rules/` (소스: `src/claude/core/rules/`)에 plan 전용 rule이 없음을 확인한다. | copy rule 추가 시 잘못된 전제 방지 | `ls src/claude/core/rules/ \| grep plan` |
| [ ] | `.plans/` 생성 여부를 확인한다. | 미생성이면 첫 `/plan-*` 실행 전 사용자 승인 필요 | `test -d .plans && echo EXISTS \|\| echo NOT_FOUND` |

#### `.plans/` 생성 게이트 (SSOT)

> 이 섹션이 `.plans/` 생성 조건의 **단일 진실 원천(SSOT)**이다. 다른 CAI 문서의 `.plans/` 언급은 이 섹션을 참조한다.

- **전제 조건**: Gate A-1 통과 (claude-kit 인프라 준비 완료)
- **승인 주체**: 사용자 (자동 생성 금지)
- **승인 시점**: 첫 `/plan-*` 커맨드 실행 전
- **승인 범위**: `.plans/` 디렉토리 구조 생성 + 첫 plan 커맨드 실행 허용
- **검증 명령**: `test -d .plans/ && echo EXISTS || echo NOT_FOUND`
- **롤백**: `rm -rf .plans/` (사용자 확인 후)
| [ ] | `/plan-*`, `/copy-*`, `/dev-*` 책임 경계를 확인한다. | CAI-06과 CAI-10의 경계가 충돌하지 않음 | CAI-06/CAI-10 문서 대조 |

### 4.1 시나리오/Feature 유형 판정 준비 체크리스트

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 시나리오 A/B/C 의사결정 트리가 CAI-06 §3.1에 문서화되었다 | 판정 조건과 분기 경로 명시 |
| [ ] | Feature 유형(copy/dev) 라우팅이 CAI-06 §3.2에 문서화되었다 | 2가지 유형 + 판정 기준 명시 |
| [ ] | `/plan-draft` 출력에 시나리오 + Feature 유형 + Lite/Standard 판정이 포함된다 | CAI-10 §8.1 태깅 형식 참조 |
| [ ] | 시나리오 C의 2단계 PRD 흐름이 CAI-06 §7.3 + CAI-10 §8.2에 문서화되었다 | 범위 PRD → 갭 분석 → 상세 PRD |
| [ ] | Dev Feature skip-copy 경로가 CAI-06 §7.5에 문서화되었다 | /dev-feature → /dev-run → /dev-verify |
| [ ] | 병렬 실행 규칙이 CAI-06 §7.7에 문서화되었다 | Feature병렬, Task순차, Phase합류 |

## 5. claude-kit 인프라 준비 체크리스트

| 체크 | 항목 | 완료 기준 | 검증 명령 |
| --- | --- | --- | --- |
| [ ] | `src/claude/copy/` 디렉토리 구조 존재 | `agents/`, `commands/`, `hooks/`, `rules/`, `skills/` 하위 디렉토리 존재 | `ls src/claude/copy/` |
| [ ] | `src/claude/copy/hooks/package.json` 존재 | `{"type": "commonjs"}` 포함 | `cat src/claude/copy/hooks/package.json` |
| [ ] | `profile.json`에 `"copy"` 도메인 등록 | domains 배열에 `"copy"` 포함 | `grep '"copy"' profile.json` |
| [ ] | `setup.js`가 copy 도메인을 올바르게 처리 | `pnpm claude-kit:setup` 후 `.claude/` 확인 | `pnpm claude-kit:setup && ls .claude/rules/copy-*.md` |
| [ ] | `CLAUDE.md.template`에 copy 도메인 섹션 존재 | copy 도메인 설명 블록 포함 | `grep -i "copy" CLAUDE.md.template` |
| [ ] | `CLAUDE-KIT-QUICKSTART.md.template`에 copy 도메인 가이드 존재 | copy 도메인 가이드 블록 포함 | `grep -i "copy" CLAUDE-KIT-QUICKSTART.md.template` |
| [ ] | `pairing-registry.json`에 copy 컴포넌트 항목 추가 | copy 도메인 에이전트/훅 항목 존재 | `grep "copy-" src/pairing-registry.json` |
| [ ] | `exception-registry.json`에 copy 훅 예외 등록 | copy 훅 예외 항목 존재 | `grep "copy-" src/exception-registry.json` |

## 6. Fidelity Readiness Checklist

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | visual fidelity 판단 기준이 P3/P10과 충돌하지 않는다. | CAI-02와 P3/P10 대조 완료 |
| [ ] | interaction fidelity 판단 기준이 P10/P11과 연결된다. | CAI-03과 Phase 1/4 기준 대조 완료 |
| [ ] | reference manifest 기준이 P2/P15와 연결된다. | CAI-04와 R3 naming 기준 대조 완료 |
| [ ] | QA evidence 기준이 P5/P15/R5와 연결된다. | CAI-05와 R3/R5 검증 항목 대조 완료 |
| [ ] | P0/P1 priority gap은 사용자 확인 대상이다. | user-review gate 표시 |
| [ ] | visual/interaction 에이전트에 시나리오별 활성화 규칙이 명시되었다. | C=기획시, A/B=QA시. CAI-02 §1, CAI-03 §1 참조 |
| [ ] | reference baseline 에이전트에 시나리오별 캡처 범위가 명시되었다. | A/B=원본만, C=원본+현재. CAI-04 §1 참조 |

## 7. Implementation Scope Checklist

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 첫 구현 범위가 A-1 인프라 준비 또는 A0 plan alignment 또는 A1 copy rules로 제한된다. | 인프라 준비이면 `src/claude/copy/` 구조만, 문서 반영이면 CAI 문서만, 구현이면 `src/claude/copy/rules/copy-*.md`만 대상 |
| [ ] | agent 구현은 visual -> interaction -> reference -> QA 순서로 진행한다. | CAI-08 순서 유지 |
| [ ] | command 구현은 agent spec 이후로 미룬다. | CAI-06 선행 조건 충족 |
| [ ] | hook blocking은 초기 도입하지 않는다. | reminder 우선 |
| [ ] | orchestrator agent는 후순위로 유지한다. | A9 before gate 필요 |
| [ ] | `.plans/` 생성은 별도 승인 후 진행한다. | plan 산출물 root가 무단 생성되지 않음 |
| [ ] | Feature 유형(copy/dev)이 결정된 후에만 해당 파이프라인에 진입한다. | copy와 dev 경로를 동시에 타지 않음 |

## 8. Git / Commit Checklist

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 로컬 Git 계정이 `CtrlCVbot <ctrlcvmail@gmail.com>`이다. | `git config user.name/email` 확인 |
| [ ] | unrelated dirty files를 stage하지 않는다. | `git status --short` 확인 |
| [ ] | 실행 단위 1개 종료 후 commit한다. | commit message가 실행 단위와 일치 |
| [ ] | commit message는 Conventional prefix + 한글이다. | 예: `docs: copy fidelity rules 추가` |
| [ ] | destructive git command를 사용하지 않는다. | reset/checkout/clean 금지 |

## 9. Verification Checklist

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 문서 링크가 모두 존재한다. | relative link `Test-Path` 통과 |
| [ ] | 미정 표현이 남아 있지 않다. | 검색 결과 없음 |
| [ ] | CAI 문서와 P18이 서로 충돌하지 않는다. | P18은 요약, CAI는 상세 기준 |
| [ ] | CAI-10과 CAI-06/08/09가 서로 충돌하지 않는다. | plan은 pre-stage, copy는 evidence/gap, dev는 구현 |
| [ ] | 실제 `.claude` (소스: `src/claude/copy/`) 구현 전 변경 파일 목록이 명확하다. | target file list 존재 |
| [ ] | rollback 방법이 문서화되어 있다. | CAI-08 rollback 기준 참조 |
| [ ] | CAI-06 §7 워크플로우 조합이 5개 경로(A/B Standard, A/B Lite, C Standard, C Lite, Dev)를 모두 커버한다. | 누락 경로 없음 |
| [ ] | Phase 게이트에 P2 Feature 재평가 단계가 포함되었다. | 사용자가 P2 진행 여부 결정 |

## 10. User Gate Checklist

| 체크 | Gate | 확인 질문 |
| --- | --- | --- |
| [ ] | Gate A-1 | claude-kit copy 도메인 인프라 준비를 승인하는가? |
| [ ] | Gate A | CAI 문서 패키지를 실제 `.claude` (소스: `src/claude/copy/`) 구현 기준으로 승인하는가? |
| [ ] | Gate A0 | `.plans/` 생성 또는 첫 `/plan-*` 실행을 승인하는가? |
| [ ] | Gate B | 첫 구현 범위를 copy rules로 제한해도 되는가? |
| [ ] | Gate C | visual/interaction agent를 구현하되 code edit 권한 없이 분석 전용으로 시작해도 되는가? |
| [ ] | Gate D | hook은 reminder 우선으로 도입해도 되는가? |
| [ ] | Gate E | orchestrator와 implementation agent는 후순위로 유지해도 되는가? |

## 11. 첫 구현 라운드 Readiness

첫 구현 라운드는 아래 조건을 만족할 때만 시작한다.

| 조건 | 필요 여부 | 상태 |
| --- | --- | --- |
| CAI-01~10 작성 완료 | 필수 | 작성 후 확인 |
| README 최종화 | 필수 | 작성 후 확인 |
| 사용자 Gate A 승인 | 필수 | 대기 |
| 첫 구현 범위 A0 또는 A1 확정 | 필수 | 대기 |
| unrelated dirty files 제외 전략 | 필수 | 필요 |

권장 첫 구현 단위는 아래와 같다.

| 실행 단위 | 목적 | 예상 파일 |
| --- | --- | --- |
| ADOPT-A-1-01 | claude-kit copy 도메인 인프라 준비 | `src/claude/copy/` 구조, `profile.json`, `setup.js`, 템플릿 |
| ADOPT-A0-01 | plan workflow alignment 문서 반영 | `docs/claude-agent-integration/*.md` |
| ADOPT-A1-01 | copy fidelity/evidence/gate rules 추가 | `src/claude/copy/rules/copy-fidelity.md`, `src/claude/copy/rules/copy-evidence.md`, `src/claude/copy/rules/copy-gates.md` |

## 12. Readiness 판정 템플릿

```markdown
## Claude Agent Implementation Readiness

- 판정일:
- 판정자:
- 상태: READY / READY_WITH_GAPS / NOT_READY / BLOCKED
- 승인된 첫 구현 범위:
- plan domain 상태:
- `.plans/` 생성 승인:
- 제외 범위:
- 필수 검증:
- 남은 gap:
- 사용자 gate:
```

## 13. 리스크와 대응

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| readiness 없이 agent 구현 착수 | high | `3 / 2 / 1 / 6 / likely / queued` | CAI-09 통과 전 구현 금지 |
| 사용자 gate 없이 hooks blocking 도입 | high | `3 / 2 / 1 / 6 / likely / queued` | blocking hook은 별도 승인 |
| unrelated dirty files와 agent 구현 변경이 섞임 | medium | `2 / 2 / 1 / 5 / confirmed / queued` | stage path를 명시하고 status 확인 |
| 문서 패키지 작성만으로 실제 개선이 지연 | medium | `2 / 2 / 1 / 5 / likely / queued` | CAI-08 첫 구현 라운드로 연결 |
| `.plans/`가 승인 없이 생성됨 | high | `3 / 2 / 1 / 6 / likely / queued` | Gate A0와 Plan Domain Readiness 통과 전 plan command 실행 금지 |
| plan workflow가 copy workflow를 대체하는 것으로 오해 | high | `3 / 2 / 1 / 6 / likely / queued` | CAI-06 경계 기준을 유지하고 plan은 pre-stage로 제한 |

## 14. 완료 기준

| 기준 | 상태 |
| --- | --- |
| readiness 상태 정의 | 완료 |
| 문서 completeness checklist | 완료 |
| plan domain readiness checklist | 완료 |
| claude-kit 인프라 준비 checklist | 완료 |
| fidelity/scope/git/verification/user gate checklist | 완료 |
| 첫 구현 라운드 조건 정의 | 완료 |
| 실제 `.claude` 구현은 하지 않음 | 의도적 제외 |

## 15. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| CAI-01~10과 연결 | 완료 |
| 사용자 gate 체크 포함 | 완료 |
| plan domain readiness 포함 | 완료 |
| claude-kit 인프라 준비 체크리스트 포함 | 완료 |
| 검증 명령 컬럼 추가 | 완료 |
| 소스 경로 parenthetical 반영 | 완료 |
| Git/범위 안전 기준 포함 | 완료 |
| 첫 구현 라운드 조건 포함 | 완료 |
| 실제 구현 범위 초과 여부 | 초과 없음 |
