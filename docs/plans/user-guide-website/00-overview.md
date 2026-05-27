# 사용자 가이드 웹사이트 파이프라인 재시작

## 목적

이 문서 패키지는 `docs/user-guide-html/**` 기반 사용자 가이드 웹사이트 작업을 `claude-kit` 파이프라인으로 실제 실행한 기록이다.

이번 작업의 핵심은 “구현 후 문서만 맞추기”가 아니라, 각 단계의 스킬 기준에 맞춰 `.plans` 산출물을 다시 만들고 그 과정을 증거로 남기는 것이다.

## 재시작 결정

이전 산출물은 유용한 초안이었지만, 일부 단계가 실제 스킬 출력 구조를 완전히 따르지 않았다. 특히 `/dev-feature` 단계에서 필요한 `dev-feature-plan` 구조가 부족했다.

그래서 기존 문서는 삭제하지 않고 archive로 보존한 뒤, 아래 순서로 활성 산출물을 다시 작성했다.

```text
P1 plan-idea
-> P2 plan-screen
-> P2.5 plan-epic
-> P3 plan-draft
-> P4 plan-prd
-> P5 plan-wireframe
-> P5.5 plan-design
-> P6 plan-stitch
-> P7 plan-bridge
-> D1 dev-feature
-> D2 dev-run / review
-> A1 archive readiness
```

## 핵심 원칙

| 원칙 | 설명 |
| --- | --- |
| `claude-kit` 우선 | 웹사이트는 부가 문서 surface이고, 핵심 기능은 `claude-kit` 자체다. |
| archive-first | 기존 산출물은 삭제하지 않고 archive에 보존한다. |
| evidence-first | 각 단계마다 프롬프트, 실행 내용, 산출물, 검증, 리뷰를 남긴다. |
| protected path 유지 | `src/claude`, `src/codex`, `src/templates`, `scripts/setup.js` 등 핵심 경로는 건드리지 않는다. |
| 구현은 증거로 취급 | 이미 구현된 Next.js 코드는 prototype/evidence로 보고, 새 `.plans` 기준에 다시 매핑한다. |

## 주요 입력

| 입력 | 역할 |
| --- | --- |
| `docs/user-guide-html/**` | HTML 가이드 원본 참고 자료 |
| `src/app/**` | 현재 Next.js route 구현 증거 |
| `src/components/docs/**` | 현재 문서 UI 컴포넌트 구현 증거 |
| `src/lib/docs/**` | 현재 문서 데이터 모델 구현 증거 |
| `.agents/skills/**/SKILL.md` | 실제 파이프라인 스킬 계약 |
| `_archive/**` | 이전 산출물 보존 영역 |

## 활성 산출물

| 산출물 | 설명 |
| --- | --- |
| `.plans/ideas/**` | P1/P2 아이디어와 스크리닝 산출물 |
| `.plans/epics/**` | P2.5 Epic과 child feature 구조 |
| `.plans/prd/**` | P4 승인 PRD |
| `.plans/wireframes/**` | P5 화면, 내비게이션, 컴포넌트 설계 |
| `.plans/stitch/**` | P6 요구사항-화면 매핑과 통합 검증 |
| `.plans/bridge/**` | P7 개발 handoff 문서 |
| `.plans/features/active/user-guide-website/**` | D1/D2 Feature Package와 검증 기록 |
| `docs/plans/user-guide-website/**` | 사람이 읽는 실행 계획, 로그, handoff 문서 |

## 읽는 순서

1. `06-pipeline-prompt-runbook.md`
2. `04-implementation-roadmap.md`
3. `execution-log.md`
4. `.plans/features/active/user-guide-website/02-package/00-overview.md`
5. `.plans/features/active/user-guide-website/02-package/08-dev-tasks.md`
6. `.plans/features/active/user-guide-website/03-dev-notes/dev-output-summary.md`
