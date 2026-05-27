# PRD: user-guide-website

- **단계**: P4 `/plan-prd`
- **상태**: approved
- **입력 draft**: `.plans/features/active/user-guide-website/01-draft/01-feature-draft.md`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#5-p4-plan-prd`

## 1. 개요

`user-guide-website`는 `docs/user-guide-html/**`를 Next.js 문서 사이트로 전환하는 기능이다.

이 사이트는 `claude-kit` runtime 자산을 대체하지 않는다. 기존 기능을 더 쉽게 이해하게 만드는 사용자용 문서 surface다.

## 2. 문제 정의

기존 HTML 가이드는 유용하지만, 장기 운영 가능한 웹사이트 구조로 확장하기 어렵다. 또한 `claude-kit` 파이프라인이 아이디어부터 구현까지 어떻게 이어지는지 실제 예시가 충분히 드러나지 않았다.

이 PRD는 웹사이트 구현과 파이프라인 실행 기록을 같은 흐름에서 추적 가능하게 만드는 것을 목표로 한다.

## 3. 목표와 제외 범위

| 목표 | 제외 범위 |
| --- | --- |
| Next.js 문서 사이트 제공 | `claude-kit` 핵심 command 동작 변경 |
| HTML reference 보존 | installer 동작 변경 |
| planning pipeline command 상세 설명 | production 자동 배포 |
| 이번 작업을 pipeline example로 기록 | 기존 source guide 문서를 완전히 대체 |
| protected path 비회귀 검증 | Claude/Codex source 자산 수정 |

## 4. 사용자 스토리

| ID | Story |
| --- | --- |
| `US-UGW-001` | 신규 사용자는 단계별 문서 사이트를 통해 planning pipeline을 빠르게 이해하고 싶다. |
| `US-UGW-002` | maintainer는 route와 artifact mapping을 통해 콘텐츠 누락 여부를 확인하고 싶다. |
| `US-UGW-003` | Claude/Codex 병행 사용자는 runtime별 차이를 명확히 보고 싶다. |
| `US-UGW-004` | contributor는 이 웹사이트 구현 과정을 반복 가능한 pipeline 예시로 참고하고 싶다. |

## 5. 기능 요구사항

| REQ-ID | 우선순위 | 요구사항 | 수용 기준 |
| --- | --- | --- | --- |
| `REQ-UGW-001` | Must | home, navigation, 일관된 page layout을 가진 docs shell 제공 | `/`, `/planning` route가 공통 shell로 렌더링된다. |
| `REQ-UGW-002` | Must | planning guide를 route 기반 문서 페이지로 전환 | planning index, lifecycle, reference, command pages가 존재한다. |
| `REQ-UGW-003` | Must | Claude/Codex 차이를 탭 또는 matrix로 표시 | runtime tab이 명확하고 접근 가능하다. |
| `REQ-UGW-004` | Must | 이번 재시작 과정을 pipeline example page로 제공 | example page가 `.plans`와 `docs/plans` 증거를 참조한다. |
| `REQ-UGW-005` | Must | build와 protected path 검증 제공 | `pnpm docs:build` 통과와 protected path diff 기록이 있다. |
| `REQ-UGW-006` | Should | 후속 guide/meta-tooling 동기화 대상을 기록 | handoff 문서에 후속 파일과 이유가 있다. |

## 6. UX 요구사항

| UX ID | 요구사항 |
| --- | --- |
| `UX-UGW-001` | 첫 화면은 marketing landing page가 아니라 상세 문서처럼 보여야 한다. |
| `UX-UGW-002` | planning command 페이지는 긴 설명, 표, 경로, 산출물을 읽기 쉽게 보여야 한다. |
| `UX-UGW-003` | Claude/Codex 비교는 실제 탭 UI나 matrix로 제공한다. |
| `UX-UGW-004` | 모바일에서도 navigation과 tab 내용이 읽기 쉬워야 한다. |

## 7. 기술 고려사항

| 영역 | 결정 |
| --- | --- |
| Framework | `src/app` 기반 Next.js app router |
| Data model | `src/lib/docs`의 static TypeScript content |
| UI | `src/components/docs`의 재사용 컴포넌트 |
| Build | `pnpm docs:build` |
| 보호 경로 | 웹사이트 작업으로 runtime source를 수정하지 않는다. |

## 8. 마일스톤

| 마일스톤 | 설명 |
| --- | --- |
| M1 | pipeline docs와 `.plans` 산출물 재작성 |
| M2 | 현재 구현을 기능 패키지 기준으로 검증 |
| M3 | package/code mismatch가 있으면 후속 변경으로 수정 |
| M4 | build, route smoke, protected path check 수행 |
| M5 | archive readiness와 handoff 정리 |

## 9. 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| runtime source 회귀 | High | protected path diff check |
| pipeline artifact drift | High | 단계별 execution log |
| 콘텐츠 누락 | Medium | HTML inventory와 route mapping |
| build 실패 | Medium | `pnpm docs:build` gate |
| 배포 scope creep | Medium | Preview-first 유지 |

## 10. 성공 지표

| 지표 | 목표 |
| --- | --- |
| route coverage | Home, planning, command details, lifecycle, reference, examples |
| package completeness | `02-package/00~10` 존재 |
| verification | build와 docs check 기록 |
| review | high/critical open issue 없음 |
| traceability | `REQ -> TASK -> TC` mapping 존재 |
