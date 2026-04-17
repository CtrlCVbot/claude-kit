# Conversion Goals And Success Criteria

> conversion-only 문서 세트의 목표와 완료 기준을 정리하는 문서

## 목표

1차 목표는 기존 `src/claude` 기능을 분석해 Codex 대응 규칙을 고정하는 것이다.

이 목표는 아래를 포함한다.

- Claude source kind 분류
- Codex target surface 결정
- `src/codex` 출력 규격 정의
- 자동 변환과 수동 보정 경계 정의
- pilot 대상 선정

## 후속 목표

이번 세트가 직접 다루지 않는 후속 목표는 아래다.

- `kit-convert` 상세 CLI 설계
- `kit-validate`, `kit-audit`, `kit-maintainer` 책임 상세화
- installer를 `src/codex` 기준으로 전환
- `docs/guide`, `docs/meta-tooling`, `README` 반영

## 성공 기준

- 모든 기존 Claude 기능이 전환 입력으로 목록화된다.
- 모든 Claude kind가 Codex target 하나로 귀결된다.
- `src/codex`에 생성될 최소 path/format 규격이 정의된다.
- `auto-convert`, `convert-with-review`, `codex-skip` 기준이 분명하다.
- pilot migration에 바로 쓸 대표 세트가 선정된다.

## 비범위

- create-time scaffolding 정책
- runtime 설치 경로 상세
- plugin/marketplace 상세 구조
- 운영 자동화나 배포 계획
