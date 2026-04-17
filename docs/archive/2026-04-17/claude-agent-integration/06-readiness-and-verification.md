# Readiness and Verification

- 문서 ID: CAI-06
- 목적: `copy` 도메인 구현 전후 검증 기준을 정의하고, 문서 패키지 관리 메모를 분리해 정리한다.
- 선행 문서: [05-implementation-plan.md](./05-implementation-plan.md)
- 근거: [archive/2026-04-16-original/09_readiness-checklist.md](./archive/2026-04-16-original/09_readiness-checklist.md) (CAI-09)

## 1. 구현 전 Readiness

### 1.1 문서 완전성

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | README.md가 핵심/보조 문서 구조와 읽기 순서를 제공한다 | 01~06 + 보조 문서 링크 존재 |
| [ ] | 01-scope-and-decisions.md가 범위와 설계 결정을 정의한다 | 시나리오 3분류, Feature 유형 2분류, WBS 4계층 |
| [ ] | 02-target-architecture.md가 source/deploy 구조를 정의한다 | `src/claude/copy/` 구조 + setup/registry 영향 |
| [ ] | 03-workflow-and-pipeline.md가 시나리오별 워크플로우를 정의한다 | 5개 경로(A/B Standard, A/B Lite, C Standard, C Lite, Dev) 커버 |
| [ ] | 04-component-specs.md가 에이전트/커맨드/훅/룰/스킬 contract를 정의한다 | 각 컴포넌트별 input/output/gate 명시 |
| [ ] | 05-implementation-plan.md가 A-1~A6 구현 계획을 정의한다 | 단계별 산출물, 검증, 게이트, 롤백 |
| [ ] | appendix/design-analysis.md가 CAI-10~13 분석 근거를 보존한다 | 원본 참조 경로 포함 |
| [ ] | appendix/legacy-turner-mapping.md가 Turner 사례를 격리한다 | 본문에서 참조하지 않는 레거시 내용 |

### 1.2 시나리오/Feature 유형 판정 준비

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 시나리오 A/B/C 의사결정 트리가 문서화되었다 | 판정 조건과 분기 경로 명시 |
| [ ] | Feature 유형(copy/dev) 라우팅이 문서화되었다 | 2가지 유형 + 판정 기준 명시 |
| [ ] | `/plan-draft` 출력에 시나리오 + Feature 유형 + Lite/Standard 판정이 포함된다 | 태깅 형식 정의 |
| [ ] | 시나리오 C의 2단계 PRD 흐름이 문서화되었다 | 범위 PRD -> 갭 분석 -> 상세 PRD |
| [ ] | Dev Feature skip-copy 경로가 문서화되었다 | `/dev-feature` -> `/dev-run` -> `/dev-verify` |
| [ ] | 병렬 실행 규칙이 문서화되었다 | Feature 병렬, Task 순차, Phase 합류 |

### 1.3 claude-kit 인프라 준비

| 체크 | 항목 | 완료 기준 | 검증 명령 |
| --- | --- | --- | --- |
| [ ] | `src/claude/copy/` 디렉토리 구조 존재 | `agents/`, `commands/`, `hooks/`, `rules/`, `skills/` 하위 디렉토리 | `ls src/claude/copy/` |
| [ ] | `src/claude/copy/hooks/package.json` 존재 | `{"type": "commonjs"}` 포함 | `cat src/claude/copy/hooks/package.json` |
| [ ] | `profile.json`에 `"copy"` 도메인 등록 | domains 배열에 `"copy"` 포함 | `grep '"copy"' profile.json` |
| [ ] | `setup.js`가 copy 도메인을 올바르게 처리 | `pnpm claude-kit:setup` 후 `.claude/` 확인 | `pnpm claude-kit:setup && ls .claude/rules/copy-*.md` |
| [ ] | `CLAUDE.md.template`에 copy 도메인 섹션 존재 | copy 도메인 설명 블록 포함 | `grep -i "copy" CLAUDE.md.template` |
| [ ] | `CLAUDE-KIT-QUICKSTART.md.template`에 copy 도메인 가이드 존재 | copy 도메인 가이드 블록 포함 | `grep -i "copy" CLAUDE-KIT-QUICKSTART.md.template` |
| [ ] | `pairing-registry.json`에 copy 컴포넌트 항목 추가 | copy 도메인 에이전트/훅 항목 존재 | `grep "copy-" src/pairing-registry.json` |
| [ ] | `exception-registry.json`에 copy 훅 예외 등록 | copy 훅 예외 항목 존재 | `grep "copy-" src/exception-registry.json` |

### 1.4 파이프라인 정합성

| 체크 | 항목 | 완료 기준 |
| --- | --- | --- |
| [ ] | 5개 워크플로우 경로가 모두 커버된다 | A/B Standard, A/B Lite, C Standard, C Lite, Dev |
| [ ] | 각 경로에 게이트가 정의되어 있다 | Phase/R 경계에서 사용자 승인 |
| [ ] | plan/copy/dev 책임 경계가 명확하다 | plan=선별/PRD/bridge, copy=evidence/gap, dev=구현 |
| [ ] | Phase 게이트에 P2 Feature 재평가가 포함된다 | 사용자가 P2 진행 여부 결정 |
| [ ] | Routing metadata 파일 경로(`07-routing-metadata.md`)가 정의되었다 | 01 §3.3, 02 §1.2 |
| [ ] | Architecture binding에 evidence 경로가 포함된다 | 04 §1.5.4 |
| [ ] | `plan-doc-guard.js`가 `.plans/*/evidence/` 경로를 허용한다 | 04 §4.5 |
| [ ] | Stage manifest에 `copyStages` 블록이 정의되었다 | 03 §7.3 |
| [ ] | PCC-06 (Gap Board ↔ Detail PRD)이 정의되었다 | 04 §4.6 |
| [ ] | Evidence manifest 저장 위치가 확정되었다 | 04 §2.3 |

## 2. 구현 후 검증

| 검증 항목 | 명령 | 기대 결과 |
|----------|------|----------|
| 디렉토리 구조 | `ls src/claude/copy/` | agents, commands, hooks, rules, skills |
| 훅 문법 | `node --check src/claude/copy/hooks/*.js` | exit 0 (syntax 오류 없음) |
| setup 배포 | `pnpm claude-kit:setup` | copy 컴포넌트가 `.claude/`에 배포 |
| 기존 회귀 (core) | `ls .claude/rules/coding-style.md` | core 룰 정상 존재 |
| 기존 회귀 (dev) | `ls .claude/hooks/dev-tdd-guard.js` | dev 훅 정상 존재 |
| 기존 회귀 (plan) | `ls .claude/hooks/plan-doc-guard.js` | plan 훅 정상 존재 |
| profile 인식 | `grep "copy" profile.json` | domains에 copy 존재 |
| registry JSON | `node -e "require('./src/pairing-registry.json')"` | JSON parse 성공 |
| generated output | `ls .claude/agents/copy-*.md .claude/commands/copy-*.md` | copy 활성 시 output 존재 |
| quickstart | `pnpm check:quickstart` | generated quickstart와 template 일치 |
| git 범위 | `git status --short` | 실행 단위 외 변경 없음 |
| Routing metadata | `cat .plans/features/active/*/00-context/07-routing-metadata.md` | Feature Type, Scenario, Scale 필드 존재 |
| Evidence manifest | `cat .plans/features/active/*/evidence/manifest.json` | JSON 형식, capture_id 필드 존재 |
| Stage manifest copy | `grep "copyStages" .plans/stage-manifest.json` | copyStages 블록 존재 |

## 3. 남은 리스크

| 리스크 | Severity | 대응 |
| --- | --- | --- |
| `copy` opt-in 정책이 구현 중 바뀔 수 있음 | Medium | A-1 전 사용자 승인으로 확정 |
| Codex hook 호환성 판단이 부족할 수 있음 | Medium | portability manifest와 `codex-hook-compat.js`로 검증 |
| setup 변경이 기존 domains에 회귀를 만들 수 있음 | High | `core`, `dev`, `plan` output 회귀 검증 필수 (SS2 명령 참조) |
| generated output을 source처럼 수정할 위험 | Medium | README와 architecture에서 source-first 원칙 반복 |
| plan-doc-guard.js와 copy hook이 동시 발동 충돌 | Medium | 동일 `PreToolUse` `Edit|Write` 이벤트에서의 충돌 여부 사전 검증 |

## 4. Readiness 판정 템플릿

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

상태 정의:
| 상태 | 의미 | 다음 액션 |
| --- | --- | --- |
| `READY` | 필수 문서, evidence 기준, gate, rollback이 모두 준비됨 | A-1 인프라 도입 착수 가능 |
| `READY_WITH_GAPS` | 일부 보류가 있지만 risk와 대응이 명확함 | 사용자 승인 후 제한 도입 가능 |
| `NOT_READY` | 핵심 문서 또는 검증 기준 누락 | 문서 보강 |
| `BLOCKED` | 사용자 결정, 환경, 권한 등 외부 요인 필요 | 작업 중단 후 입력 요청 |

## 5. 문서 패키지 관리 메모

아래 항목은 구현 readiness 자체보다, 현재 문서 패키지가 어떤 기준으로 정리되었는지 기록하는 관리 메모다.

| 피드백 (CAI-14) | 심각도 | 반영 상태 | 반영 위치 |
|----------------|--------|----------|----------|
| 문서 목적 혼재 (Turner 특화 vs package 도메인) | High | 해결 -- package 수준으로 전환 | 전체 문서 (01~06) |
| 실제 repo 구조와 문서 가정 불일치 | High | 해결 -- `src/claude/copy/` 미구현 상태 명시 | README, 02-target-architecture |
| 링크 신뢰도 낮음 (깨진 링크) | High | 해결 -- 존재하는 파일만 참조 | 전체 문서 |
| 완료/readiness 상태 충돌 | High | 해결 -- "문서 재작성 완료, 구현 미착수"로 정정 | README, 본 문서 |
| 의사결정 기록과 실행 계획 중복 | High | 해결 -- 01은 결정, 05는 구현 계획, 06은 검증으로 분리 | 01, 05, 06 |
| WBS/시나리오 분석 과다 | Medium | 해결 -- 핵심만 본문에 남기고 분석 과정은 appendix로 이동 | appendix/design-analysis.md |
| Turner 특화 사례 혼재 | Medium | 해결 -- appendix 격리 | appendix/legacy-turner-mapping.md |

## 6. 문서 범위 Self-review

| 점검 항목 | 결과 |
| --- | --- |
| `claude-kit copy 도메인 도입` 기준으로 작성됨 | 완료 |
| 기존 문서가 archive로 보존됨 | 완료 |
| 피드백 문서(CAI-14)가 보존됨 | 완료 |
| 핵심 문서 6개 + 보조 문서(07 + appendix 2개) 구조 | 완료 |
| high 피드백이 모두 반영 또는 대응 기록됨 | 완료 |
| 구현 코드는 작성하지 않음 | 완료 |
| `.claude`, `src/claude/copy`, `scripts/setup.js`, registry는 수정하지 않음 | 완료 |

## 7. 문서 패키지 완료 기준

| 기준 | 완료 조건 |
| --- | --- |
| 문서 구조 | README의 핵심/보조 문서 구분과 실제 파일 구성이 일치 |
| archive | 기존 원본 문서 + 다른 AI 재구성 + 피드백 문서 보존 |
| 검증 | SS1 readiness + SS2 검증 명령 + 피드백 반영표 |
| 다음 단계 | A-1 구현 승인 여부만 남김 |
