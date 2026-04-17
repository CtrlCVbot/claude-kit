# Legacy Turner Mapping

- 문서 ID: CAI-APPENDIX-01
- 목적: 기존 Turner 홈페이지 정밀 카피 문서에서 보존 가치가 있는 사례를 `copy` 도메인 예시로만 남긴다.
- 기준: 본문 문서의 source of truth가 아니며, 구현 계획의 필수 입력도 아니다.

## 1. 격리 이유

기존 문서는 Turner 홈페이지, P18/P10/P11/R3/R5 같은 특정 프로젝트 문맥을 중심으로 작성되었다. 이 내용은 `copy` 도메인의 실제 사용 예시로는 가치가 있지만, `claude-kit` package-level 도메인 문서의 본문 기준으로 두면 다음 문제가 생긴다.

| 문제 | 영향 |
| --- | --- |
| 특정 프로젝트 링크가 현재 repo에 없음 | 문서 링크와 readiness 신뢰도 하락 |
| package 도메인과 고객 사례가 섞임 | 구현자가 source 파일과 사례 파일을 혼동 |
| Turner 기준이 일반 기준처럼 보임 | 다른 프로젝트에서 재사용 어려움 |

## 2. 보존할 개념

| legacy 개념 | copy 도메인으로 일반화한 이름 | 새 위치 |
| --- | --- | --- |
| visual fidelity gap | Visual Gap Row | [../03-workflow-contracts.md](../03-workflow-contracts.md) |
| interaction state gap | Interaction State Row | [../03-workflow-contracts.md](../03-workflow-contracts.md) |
| reference/current capture pair | Evidence Manifest + Pairing Matrix | [../03-workflow-contracts.md](../03-workflow-contracts.md) |
| QA result table | QA Result Schema | [../03-workflow-contracts.md](../03-workflow-contracts.md) |
| P0/P1 user-review | Copy Gate | [../03-workflow-contracts.md](../03-workflow-contracts.md) |
| A/B/C copy 시나리오 | copy/dev routing + reference-only mode | [../03-workflow-contracts.md](../03-workflow-contracts.md) |

## 3. 예시 적용 방식

Turner 같은 정밀 카피 프로젝트에서 `copy` 도메인을 사용할 때의 일반 흐름은 아래와 같다.

```text
plan: 개선 후보 선별과 범위 승인
  -> copy: reference/current evidence contract 작성
  -> copy: visual/interaction gap board 생성
  -> plan 또는 copy: 실행 단위 계획으로 전환
  -> dev: 구현
  -> copy: evidence와 readiness 검증
  -> user gate: 최종 체감 승인
```

이 흐름은 특정 사이트 이름이나 P문서 번호 없이도 유지되어야 한다.

## 4. 본문으로 되돌리지 않을 내용

| 내용 | 처리 |
| --- | --- |
| Turner 섹션명, 특정 header/menu/hero 사례 | command/agent sample output에서만 선택적으로 사용 |
| P18/P10/P11/R3/R5 문서 번호 | 현재 package 문서의 본문 링크로 사용하지 않음 |
| 특정 Playwright output 경로 | evidence schema 예시로만 사용 |
| 프로젝트 phase/round 이름 | generic phase/round gate로 일반화 |

## 5. 후속 사용 기준

| 상황 | 사용 방법 |
| --- | --- |
| agent prompt 예시가 필요할 때 | 고객명 제거 또는 `reference site`로 치환 |
| sample gap board가 필요할 때 | Visual Gap Row schema 검증용 fixture로 별도 작성 |
| QA evidence 예시가 필요할 때 | generated output이 아닌 fixture path로 분리 |
| 문서 링크가 필요할 때 | 본 appendix 또는 새 core 문서만 링크 |
