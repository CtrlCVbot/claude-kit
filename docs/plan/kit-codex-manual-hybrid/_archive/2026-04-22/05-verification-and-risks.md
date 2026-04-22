# 05 Verification And Risks

> 목적: 전환 설계가 무엇으로 검증되는지와 어떤 리스크를 관리해야 하는지 정의한다.

## 1. 검증 질문

1. Codex 사용자가 `AGENTS.md`와 skill만으로 적절한 workflow에 진입할 수 있는가
2. Codex custom agent가 공식 `.codex/agents/*.toml` 구조에서 정상 discovery되는가
3. Codex hook 목록이 실제 보장 범위를 넘겨 과장되지 않는가
4. `src/codex` 정리 이후에도 필요한 workflow가 regression 없이 유지되는가
5. Claude와 Codex가 같은 `shared manual`을 참조해도 각 runtime 차이를 잃지 않는가

## 2. 검증 항목

| 항목 | 방법 | Sample size | Pass criteria |
|---|---|---:|---|
| `AGENTS.md` 라우팅 | 새 세션에서 instruction source 요약 요청 | 3개 workflow | 올바른 skill/manual 진입 경로를 설명 |
| skill 진입성 | Codex에서 관련 작업 프롬프트 입력 | 핵심 workflow 3종 | router 또는 workflow skill을 우선 사용 |
| custom agent discovery | `.codex/agents/*.toml` 배치 후 agent 호출 | 대표 agent 2종 | 정상 인식 및 실행 |
| hook 동작 | Bash guardrail 시나리오 실행 | 대표 시나리오 3건 | 문서화된 범위 안에서만 동작 |
| 문서 일관성 | shared manual, AGENTS, skills 교차 검토 | 핵심 문서 5개 | 모순 없음, 끊긴 링크 없음 |
| legacy UX 호환 | `/dev-*`, `/plan-*`, `/copy-*` 의도 입력 | 대표 intent 6건 | alias/router가 의도를 해석 |

## 3. 리스크 평가

| ID | Severity | 이유 | 대응 |
|---|---|---|---|
| R1 | high | plugin, agents, hooks 경계를 잘못 해석하면 전체 구조가 다시 흔들린다 | official snapshot 고정, 구현 전/배포 전 재검증 |
| R2 | high | 문서가 좋아져도 runtime enforcement가 필요한 부분은 사라지지 않는다 | `문서로 대체 가능`과 `runtime 유지 필요`를 분리 |
| R3 | medium | shared manual을 도입해도 legacy duplication이 남을 수 있다 | Phase 6 제거 기준과 추적 목록 유지 |
| R4 | medium | 일부 skill/agent가 `.claude`를 직접 참조하면 Codex-only 설치에서 깨질 수 있다 | direct reference grep과 lint 추가 |
| R5 | high | 기존 `/dev-*`, `/plan-*`, `/copy-*` 경험이 사라지면 사용자 혼란이 커진다 | alias/router를 완료 조건에 포함하고 샘플 intent로 검증 |

## 4. 피드백 반영 메모

이번 리스크 문서는 아래 피드백을 반영한다.

- official documentation snapshot을 검증 기준에 포함
- `src/codex` duplication을 A/B/C rubric으로 판단
- canonical path를 `src/shared/manuals/`로 고정
- meta asset 처리 방향을 별도 산출물로 분리
- UX degradation을 `medium`에서 `high`로 상향

## 5. Definition of Done

아래 조건이 만족되면 구현 준비가 된 것으로 본다.

- `manual-first hybrid` 결정이 문서 전반에 일관되게 반영됨
- official Codex documentation snapshot이 고정됨
- `src/shared/manuals/`가 canonical path로 승인됨
- `src/codex` A/B/C duplication rubric이 승인됨
- `AGENTS.md` 초안이 shared manual 기준으로 재구성됨
- `.codex/agents` 경로와 역할이 공식 surface 기준으로 정리됨
- plugin 축소 대상과 유지 대상을 파일/영역 단위로 분류함
- hook 유지/삭제/보류 기준이 정리됨
- legacy alias/router 전략이 검증 계획에 포함됨

## 6. 후속 구현 권장 작업

1. `src/shared/manuals/` 초기 뼈대 생성
2. `setup.js` 변경 설계 메모 작성
3. `AGENTS.md.template` 개편
4. Codex router skill 초안 작성
5. `.codex/agents` generator 초안 작성
6. direct `.claude` reference 탐지 규칙 추가

## 7. 의도적 비범위

이번 설계 패키지는 아래를 포함하지 않는다.

- 실제 `setup.js` 코드 변경
- `src/codex` 파일 즉시 제거
- plugin manifest 즉시 수정
- Codex runtime behavior의 전면적 대체 구현

즉, 이번 패키지는 구현 전 설계 합의를 위한 기준 문서다.
