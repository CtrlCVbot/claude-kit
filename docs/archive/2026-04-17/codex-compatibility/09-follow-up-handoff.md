# Follow-Up Handoff

> conversion 기준 문서 세트가 끝난 뒤 이어질 후속 구현과 문서 반영을 정리하는 문서

## 후속 구현 주제

- conversion tooling 상세
- installer cutover
- validation / audit / registry 상세
- create-time 재사용

## 후속 문서 반영 대상

- `docs/guide/09-architecture.md`
- `docs/guide/10-glossary.md`
- `docs/guide/00-overview.md`
- `docs/meta-tooling/*`
- 필요 시 `README.md`

## handoff 메시지

- 이번 세트는 conversion 기준 문서다.
- 다음 세트는 tooling과 installer를 구현하기 위한 상세 문서여야 한다.
- create-time 정책은 conversion 규칙이 안정화된 뒤에만 재사용 대상으로 다룬다.

## 이 문서 세트의 종료 조건

- 기존 Claude 기능의 Codex 전환 기준이 문서로 잠겼다.
- `src/codex` 최소 출력 규격이 정의됐다.
- pilot 세트가 고정됐다.
- 후속 구현 주제가 분리됐다.
