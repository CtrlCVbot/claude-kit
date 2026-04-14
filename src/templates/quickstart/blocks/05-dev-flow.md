## `dev` 압축 흐름

`dev`는 승인된 요구사항이나 PRD를 받아 구현, 검증, 커밋까지 이어지는 기본 개발 파이프라인이다.

{{DEV_STATUS_NOTE}}

| Phase | 진입점 | 역할 | 핵심 산출물 |
|-------|--------|------|-------------|
{{DEV_FLOW_ROWS}}

- `Lite / Standard` 판정:
  - 간단한 기능이면 Lite로 짧게 끝난다.
  - 상태머신, 외부 연동, API/DB 복잡도가 올라가면 Standard로 본다.
- `/dev-run`은 TASK를 순서대로 TDD 루프로 구현한다.
- `/dev-verify`는 구현이 문서와 맞는지 마지막으로 확인한다.

Quality Gate 요약:

| 게이트 | 의미 | 체크 포인트 |
|--------|------|-------------|
{{QUALITY_GATE_ROWS}}
