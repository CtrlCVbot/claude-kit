# claude-kit copy 도메인 문서 피드백 및 재구성 제안서

- 문서 ID: CAI-14
- 작성일: 2026-04-16
- 문서 상태: 피드백 제안서
- 기준 관점: `claude-kit` 패키지의 `copy` 도메인 도입 문서
- 대상 경로: `docs/claude-agent-integration/`
- 작업 범위: 기존 문서 분석과 재구성 제안
- 제외 범위: 기존 문서 수정, 아카이빙, 신규 구현 파일 작성, `.claude` 또는 `src/claude/copy` 생성

## 1. 목적

이 문서는 `docs/claude-agent-integration/` 하위 기존 문서 15개를 `claude-kit`의 `copy` 도메인 도입 문서라는 기준으로 재검토한 피드백 결과다.

현재 문서군은 Turner 홈페이지 정밀 카피 프로젝트의 도메인 사례와 `claude-kit` 패키지에 `copy` 도메인을 추가하기 위한 구현 계획이 섞여 있다. 따라서 이후 정리 작업에서는 Turner 특화 내용은 예시 또는 appendix로 격리하고, 본문은 `claude-kit` 저장소에 실제로 적용 가능한 도메인 도입 문서로 재작성하는 것이 권장된다.

## 2. 분석 범위

| 구분 | 대상 |
| --- | --- |
| 패키지 입구 | `README.md` |
| 분리/맵/통합 계획 | `00_docs-split-plan.md`, `01_package-map.md`, `10_plan-workflow-integration-plan.md` |
| Agent 명세 | `02_copy-fidelity-agent-spec.md`, `03_interaction-fidelity-agent-spec.md`, `04_reference-baseline-agent-spec.md`, `05_qa-review-agent-spec.md` |
| Workflow/Hook/Roadmap/Readiness | `06_command-workflow-spec.md`, `07_hooks-and-rules-plan.md`, `08_adoption-roadmap.md`, `09_readiness-checklist.md` |
| WBS/파이프라인 분석 | `11_work-breakdown-structure.md`, `12_pipeline-integration-diagram.md`, `13_pipeline-order-analysis.md` |

확인한 주요 사실은 다음과 같다.

| 항목 | 확인 결과 |
| --- | --- |
| 문서 수 | 15개 |
| 문서 규모 | 약 3,265 lines |
| 현재 repo 도메인 | `src/claude/_meta`, `src/claude/core`, `src/claude/dev`, `src/claude/plan` |
| `copy` 도메인 상태 | `src/claude/copy` 없음 |
| plan 소스 상태 | `src/claude/plan/commands/plan-*.md` 존재 |
| `.claude/commands` 상태 | 현재 workspace에는 `kit-*` command 중심으로 존재 |
| 깨진 상대 링크 | 71개 확인 |

## 3. 핵심 결론

| 판단 | 내용 |
| --- | --- |
| 기준 전환 필요 | 기존 문서는 Turner 프로젝트 적용 문서가 아니라 `claude-kit copy 도메인 도입 문서`로 재정렬해야 한다. |
| 기존 문서 직접 보수 비추천 | 문서 수가 많고 역할 중복이 커서 기존 파일을 조금씩 고치는 방식은 drift를 남길 가능성이 높다. |
| 전량 archive 권장 | 기존 15개 문서는 보존하고, 새 문서 구조를 처음부터 작성하는 것이 가장 안전하다. |
| 본문/사례 분리 필요 | `claude-kit` 도입 본문과 Turner 사례를 분리해야 다른 프로젝트에도 재사용 가능한 도메인 문서가 된다. |
| 구현 전제 재검증 필요 | `src/claude/copy`, registry, setup, template, generated `.claude` 출력의 실제 계약을 먼저 문서화해야 한다. |

## 4. 전체 구조 피드백

| 피드백 | 근거 | Severity | Impact / Reach / Recovery / Total / Confidence / Action |
| --- | --- | --- | --- |
| 문서 목적이 혼재됨 | Turner 프로젝트 특화 QA, P문서, R문서, `claude-kit` package architecture가 같은 본문에 공존한다. | high | `3 / 3 / 1 / 7 / confirmed / queued` |
| 실제 repo 구조와 문서 가정이 다름 | 문서는 `src/claude/copy`를 전제로 하지만 현재 repo에는 해당 도메인이 없다. | high | `3 / 3 / 1 / 7 / confirmed / queued` |
| 링크 신뢰도가 낮음 | root 프로젝트 문서와 generated `.claude` 링크 다수가 현재 workspace 기준 존재하지 않는다. | high | `3 / 3 / 1 / 7 / confirmed / queued` |
| 완료 상태와 readiness가 충돌함 | README는 전체 완료로 보이나, readiness checklist는 copy 인프라 미구현 상태를 전제로 한다. | high | `3 / 2 / 1 / 6 / confirmed / queued` |
| 의사결정 기록과 실행 계획이 분리되지 않음 | `00`, `01`, `10`, `11`, `12`, `13`이 비슷한 판단을 반복한다. | high | `2 / 2 / 1 / 5 / likely / queued` |
| WBS/시나리오 분석이 본문을 과도하게 지배함 | copy 도메인 구현자가 먼저 봐야 할 파일/contract/검증 순서가 뒤로 밀린다. | medium | `2 / 2 / 1 / 5 / likely / queued` |
| 일부 self-review가 실제 완료 상태와 맞지 않음 | `11`, `12`, `13`의 자기 검증 체크가 `[ ]`로 남아 있다. | medium | `1 / 2 / 1 / 4 / confirmed / queued` |

## 5. 문서별 피드백

| 문서 | 현재 역할 | 주요 피드백 | 권장 처리 |
| --- | --- | --- | --- |
| `README.md` | 문서 패키지 입구 | 상태판은 유용하지만 Turner 목적과 copy 도메인 도입 목적이 섞여 있다. | 새 README로 재작성 |
| `00_docs-split-plan.md` | 기존 문서 분리 계획 | 이미 실행된 계획 기록에 가깝고 현재 재구성 기준과 중복된다. | archive 후 결정 기록만 이관 |
| `01_package-map.md` | 문서 관계/SSOT | SSOT 개념은 유지하되, 존재하지 않는 root P문서 링크를 제거해야 한다. | 새 `01-scope-and-decisions.md`로 통합 |
| `02_copy-fidelity-agent-spec.md` | visual agent 명세 | Gap Row Schema와 prompt 제약은 유용하다. Turner 기준은 예시로 내려야 한다. | `04-component-specs.md`로 이관 |
| `03_interaction-fidelity-agent-spec.md` | interaction agent 명세 | State Map Schema와 evidence 제약은 유지 가치가 높다. | `04-component-specs.md`로 이관 |
| `04_reference-baseline-agent-spec.md` | reference/evidence 명세 | Manifest/Pairing 개념은 `copy` 도메인 공통 evidence contract로 승격 가능하다. | `03-workflow-contracts.md` 또는 `04-component-specs.md`로 이관 |
| `05_qa-review-agent-spec.md` | QA agent 명세 | QA Result Schema와 readiness 상태는 유지하되 build 명령은 package repo 기준으로 재검증해야 한다. | `06-readiness-and-verification.md`로 이관 |
| `06_command-workflow-spec.md` | command workflow | plan/copy/dev 경계와 command contract가 핵심 자산이다. | 새 workflow 문서의 중심으로 이관 |
| `07_hooks-and-rules-plan.md` | hooks/rules 계획 | CommonJS hook 요구사항과 reminder 우선 정책은 유지한다. | `04-component-specs.md`와 `05-implementation-plan.md`로 분리 |
| `08_adoption-roadmap.md` | 도입 로드맵 | A-1 인프라 준비 단계가 중요하다. 다만 실제 파일 목록과 검증을 더 구체화해야 한다. | `05-implementation-plan.md`로 이관 |
| `09_readiness-checklist.md` | 구현 전 체크리스트 | 가장 실행형에 가깝다. 다만 일부 표 구조와 경로가 현재 repo와 어긋난다. | `06-readiness-and-verification.md`로 재작성 |
| `10_plan-workflow-integration-plan.md` | plan 도메인 연결 분석 | plan/copy/dev 책임 경계는 유지하되, generated `.claude` 링크 의존을 줄여야 한다. | `03-workflow-contracts.md`로 통합 |
| `11_work-breakdown-structure.md` | WBS/시나리오 | 분석 근거로 유용하지만 본문 핵심 문서로 두기에는 과하다. | appendix 또는 workflow subsection |
| `12_pipeline-integration-diagram.md` | Mermaid 흐름도 | 시각화는 유용하지만 command 구현 계획과 분리되어 있다. | 새 workflow 문서에 1~2개 핵심 다이어그램만 이관 |
| `13_pipeline-order-analysis.md` | 순서/라우팅 분석 | Copy/Dev/Hybrid 유형 판단은 유지 가치가 높다. | 결정 기록 또는 appendix로 이관 |

## 6. 유지/통합/보완/제거 대상

| 처리 | 대상 | 이유 |
| --- | --- | --- |
| 유지 | Gap Row Schema, State Map Schema, Manifest Schema, QA Result Schema | copy 도메인의 핵심 contract로 재사용 가능 |
| 유지 | plan/copy/dev 책임 경계 | 기존 `plan` 도메인과 신규 `copy` 도메인의 충돌을 줄이는 핵심 기준 |
| 유지 | 사용자 gate, evidence-first, reminder 우선 hook 정책 | 자동화 과잉 도입을 막는 운영 안전장치 |
| 통합 | `00`, `01`, `10`, `11`, `12`, `13`의 의사결정/흐름 분석 | 비슷한 내용을 반복하므로 결정 기록과 workflow 문서로 압축 |
| 보완 | `src/claude/copy` 도메인 인프라 준비 절차 | 현재 repo에는 copy 도메인이 없으므로 가장 먼저 구체화 필요 |
| 보완 | registry/update/setup/template 영향 | `claude-kit` 패키지 도입 문서라면 실제 packaging 경로가 핵심 |
| 제거 | 존재하지 않는 root P문서/R문서 링크 | 현재 repo 기준 깨진 링크이며 실행자를 혼란스럽게 함 |
| appendix화 | Turner 홈페이지 특화 용어/사례 | 도메인 예시로는 유용하지만 본문 기준이 되면 재사용성이 낮아짐 |

## 7. 권장 새 문서 구조

기존 15개 문서는 archive로 보존하고, 아래 구조로 새 문서를 처음부터 작성하는 것을 권장한다.

```text
docs/claude-agent-integration/
  README.md
  01-scope-and-decisions.md
  02-target-architecture.md
  03-workflow-contracts.md
  04-component-specs.md
  05-implementation-plan.md
  06-readiness-and-verification.md
  appendix/
    legacy-turner-mapping.md
```

| 새 문서 | 목적 | 포함 내용 |
| --- | --- | --- |
| `README.md` | copy 도메인 도입 문서의 입구 | 현재 상태, 읽기 순서, 구현 전제, archive 위치 |
| `01-scope-and-decisions.md` | 범위와 결정 기록 | copy 도메인 정의, Turner 사례 분리, plan/dev와의 경계 |
| `02-target-architecture.md` | 목표 아키텍처 | `src/claude/copy/{agents,commands,hooks,rules,skills}`, setup, registry, generated output |
| `03-workflow-contracts.md` | 운영 workflow contract | plan/copy/dev 책임 경계, Feature 유형, command lifecycle, gate |
| `04-component-specs.md` | 컴포넌트별 구현 명세 | agents, commands, hooks, rules, skills의 파일명, frontmatter, prompt/contract |
| `05-implementation-plan.md` | 단계별 구현 계획 | 작업 단위, 수정 파일, acceptance criteria, rollback, 커밋 단위 |
| `06-readiness-and-verification.md` | 구현 전/후 검증 기준 | 링크 검사, setup dry-run, `node --check`, generated `.claude` 검증, registry 검증 |
| `appendix/legacy-turner-mapping.md` | 기존 Turner 특화 내용 보존 | 기존 visual/interaction/evidence 사례, WBS 예시, 시나리오 예시 |

## 8. 새 문서별 상세 제안

### 8.1 `README.md`

| 섹션 | 내용 |
| --- | --- |
| 목적 | `claude-kit`에 copy 도메인을 도입하기 위한 문서 패키지라고 명확히 선언 |
| 상태판 | 현재는 제안/설계 단계이며 `src/claude/copy`는 아직 없다고 표시 |
| 읽기 순서 | scope → architecture → workflow → component specs → implementation → verification |
| archive 안내 | 기존 15개 문서 archive 위치 |
| 금지 | Turner 프로젝트 자체를 이 패키지의 주목적으로 설명하지 않기 |

### 8.2 `01-scope-and-decisions.md`

| 섹션 | 내용 |
| --- | --- |
| copy 도메인 정의 | 시각/인터랙션 충실도, evidence, QA workflow를 다루는 선택 도메인 |
| 비범위 | 특정 고객 사이트 구현, 실제 스크린샷 수집, 개별 앱 코드 수정 |
| 도메인 관계 | `core`, `dev`, `plan`, `copy`의 책임 경계 |
| 결정 기록 | Turner 사례는 appendix로 격리, 본문은 package-level contract로 유지 |
| Open questions | `copy`를 기본 domain으로 둘지 opt-in으로 둘지, Codex 출력 범위 |

### 8.3 `02-target-architecture.md`

| 섹션 | 내용 |
| --- | --- |
| 소스 구조 | `src/claude/copy/agents`, `commands`, `hooks`, `rules`, `skills` |
| 배포 구조 | `.claude/agents`, `.claude/commands`, `.claude/hooks`, `.claude/rules`, `.claude/skills` |
| package integration | `profile.json`, `scripts/setup.js`, template, quickstart, metadata |
| registry | `src/pairing-registry.json`, `src/exception-registry.json`, `src/claude/_meta/codex-portability.json` |
| compatibility | Claude target과 Codex target의 차이, hook 예외 정책 |

### 8.4 `03-workflow-contracts.md`

| 섹션 | 내용 |
| --- | --- |
| lifecycle | 계획 → 피드백 → 구현 → 피드백 → 검증 → 피드백 |
| layer boundary | plan은 선별/PRD/bridge, copy는 evidence/gap/QA, dev는 구현 |
| feature routing | copy/dev/hybrid 또는 copy/dev + 참조 모드 |
| command flow | `/copy-reference-refresh`, `/copy-visual-review`, `/copy-interaction-review`, `/copy-gap-board`, `/copy-verify`, `/copy-closeout` |
| gate | P0/P1, `.plans`, phase/closeout, generated output |

### 8.5 `04-component-specs.md`

| 컴포넌트 | 포함할 contract |
| --- | --- |
| agents | `copy-fidelity`, `copy-interaction-fidelity`, `copy-reference-baseline`, `copy-qa-reviewer` |
| commands | command별 input/output/gate/frontmatter |
| hooks | CommonJS, event, exit code, reminder/blocking 정책 |
| rules | `copy-fidelity`, `copy-evidence`, `copy-gates`, `copy-commands`, `copy-variant` |
| skills | copy workflow, evidence management, QA workflow |

### 8.6 `05-implementation-plan.md`

| 단계 | 목표 | 주요 파일 |
| --- | --- | --- |
| A-1 | copy 도메인 인프라 생성 | `src/claude/copy/`, setup/template/registry |
| A0 | plan/dev/copy 경계 문서화 | workflow contract |
| A1 | copy rules 추가 | `src/claude/copy/rules/copy-*.md` |
| A2 | copy agents 추가 | `src/claude/copy/agents/copy-*.md` |
| A3 | copy commands 추가 | `src/claude/copy/commands/copy-*.md` |
| A4 | reminder hooks 추가 | `src/claude/copy/hooks/copy-*.js` |
| A5 | skills/quickstart 갱신 | `src/claude/copy/skills`, template docs |
| A6 | setup/generated output 검증 | `.claude`, plugin output |

### 8.7 `06-readiness-and-verification.md`

| 검증 | 방법 | 완료 기준 |
| --- | --- | --- |
| 문서 링크 | 상대 링크 검사 | 깨진 링크 0개 |
| 소스 구조 | `Test-Path src/claude/copy` | 하위 디렉터리 존재 |
| hook syntax | `node --check src/claude/copy/hooks/*.js` | syntax 통과 |
| setup | `pnpm claude-kit:setup` | target별 output 생성 |
| quickstart | `pnpm check:quickstart` | template과 generated 문서 일치 |
| registry | registry JSON schema 또는 load check | copy 항목 누락 없음 |
| generated output | `.claude` 또는 Codex plugin output 확인 | source와 deploy 경로 매핑 일치 |

## 9. 이후 정리 작업 실행 계획

| 순서 | 작업 | 산출물 | 검증 |
| --- | --- | --- | --- |
| 1 | archive 위치 확정 | `docs/claude-agent-integration/archive/2026-04-16-original/` | 기존 파일 보존 여부 |
| 2 | 기존 15개 문서 archive 이동 | archive 하위 원본 문서 | 파일 수 15개 확인 |
| 3 | 새 문서 skeleton 작성 | `README.md`, `01`~`06`, `appendix` | 링크 검사 |
| 4 | 핵심 contract 이관 | schema, lifecycle, gate, component table | 중복 점검 |
| 5 | Turner 내용 appendix화 | `appendix/legacy-turner-mapping.md` | 본문에서 Turner 의존 제거 |
| 6 | repo 구조 기준 보정 | architecture/implementation/verification 문서 | 현재 파일 구조 대조 |
| 7 | self-review | 피드백 반영 표 | high 이상 미해결 여부 |
| 8 | 최종 검증 | 링크, markdown, setup 관련 명령 | 검증 결과 기록 |

## 10. 검증 방법 제안

정리 작업 완료 후 최소 아래 검증을 수행한다.

| 검증 항목 | 권장 명령 또는 방법 | 기대 결과 |
| --- | --- | --- |
| git 범위 확인 | `git status --short` | archive/new docs 외 변경 없음 |
| 링크 검사 | PowerShell 또는 markdown link checker | 상대 링크 누락 없음 |
| copy 소스 구조 확인 | `Get-ChildItem src/claude/copy -Recurse` | 단계에 맞는 파일 존재 |
| hook syntax | `node --check src/claude/copy/hooks/*.js` | 오류 없음 |
| quickstart 일관성 | `pnpm check:quickstart` | 통과 |
| setup 검증 | `pnpm claude-kit:setup` | `.claude` target 출력 정상 |
| registry load | JSON parse check | malformed JSON 없음 |

## 11. 남은 리스크와 확인 필요 항목

| 항목 | 내용 | Severity | Action |
| --- | --- | --- | --- |
| `copy` 도메인 opt-in 여부 | `profile.json` 기본 domain에 포함할지, opt-in으로만 둘지 결정 필요 | medium | needs-user-input |
| Codex target 지원 범위 | agents/commands/rules/skills는 direct 가능성이 높지만 hooks는 예외 정책 필요 | medium | needs-verification |
| Turner 예시 보존 수준 | appendix에 얼마나 남길지 결정 필요 | low | needs-user-input |
| `.claude` generated output 링크 | source 문서에서 generated output을 직접 링크할지, 생성 후 검증 항목으로만 둘지 결정 필요 | medium | queued |
| 기존 modified 문서 처리 | 현재 기존 15개 문서가 modified 상태이므로 archive 전 변경 의도 확인 필요 | medium | needs-verification |

## 12. 다음 작업 acceptance criteria

다음 정리 작업은 아래 조건을 만족하면 완료로 본다.

| 기준 | 완료 조건 |
| --- | --- |
| 기존 문서 보존 | 기존 15개 문서가 archive 하위에 보존됨 |
| 새 문서 구조 | README + 01~06 + appendix 구조가 생성됨 |
| 기준 전환 | 본문이 `claude-kit copy 도메인 도입` 기준으로 작성됨 |
| Turner 격리 | Turner/P문서/R문서 특화 내용은 appendix 또는 예시로만 존재 |
| 구현 가능성 | 각 구현 단계의 대상 파일과 검증 방법이 명확함 |
| 링크 품질 | 깨진 상대 링크가 없음 |
| 피드백 반영 | high 이상 피드백은 자동 반영되었거나 보류 사유가 기록됨 |

## 13. self-review 결과

| 점검 항목 | 결과 |
| --- | --- |
| 기준 관점이 `claude-kit copy 도메인 도입`으로 명시됨 | 완료 |
| 기존 문서 수정 없이 피드백 파일만 작성하는 범위 유지 | 완료 |
| 문서별 피드백 포함 | 완료 |
| 유지/통합/보완/제거 대상 포함 | 완료 |
| 권장 새 문서 구조 포함 | 완료 |
| 단계별 정리 작업 계획 포함 | 완료 |
| 검증 방법과 리스크 포함 | 완료 |
| high 이상 리스크의 Action 분류 포함 | 완료 |
