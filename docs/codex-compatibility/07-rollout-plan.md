# Rollout Plan

> `src/claude + src/codex` 기준으로 문서와 이후 구현 준비를 어떤 순서로 진행할지 정리한 문서.

---

## 1. 문서 작성 순서

이 문서 세트는 아래 순서로 재구성한다.

1. 기존 활성 문서를 archive로 이동
2. `00`~`02`에서 새 기준선과 갭 분석 고정
3. `03`~`05`에서 source layout, asset mapping, installer 모델 고정
4. `06`에서 source 작성 규칙과 pairing 방식 정리
5. `07`에서 마이그레이션 순서와 완료 조건 정리

이 순서를 지키는 이유는 비교 토론보다 먼저 ownership과 source 모델을 고정해야 하기 때문이다.

---

## 2. 후속 구현 준비 순서

문서가 완성된 뒤 실제 구현 준비는 아래 순서가 적절하다.

1. `src`의 현재 구조를 `src/claude` 기준으로 재매핑
2. `agent/command`부터 `src/codex` sibling 설계 시작
3. pairing 상태를 추적할 metadata 또는 registry 방식 결정
4. installer를 target별 source reader로 재설계
5. Codex output별 source 책임을 연결

초기 구현 우선순위는 `agent`, `command`를 먼저 잡고, 그다음 `hook`, `exec-policy`, selective `skill`로 확장하는 흐름이 적절하다.

---

## 3. migration 원칙

- 기존 단일 `src`는 곧바로 "공통 source"로 보지 않는다.
- 우선 현재 자산을 Claude-origin source로 해석한다.
- Codex 대응은 필요한 기능부터 `src/codex`에 별도 추가한다.
- guidance 자산은 당장 전부 복제하지 않고 shared/Claude-origin으로 유지한다.

즉 migration은 "모든 것을 한 번에 이중화"가 아니라, ownership을 먼저 바로잡고 에이전트 기능부터 분리하는 방식이다.

---

## 4. 완료 조건

이번 문서 재구성 단계의 완료 조건은 아래다.

- `docs/codex-compatibility/`에 새 8개 활성 문서가 존재한다.
- 이전 활성 문서는 `_archive/2026-04-07-target-separated-authoring/`로 보존된다.
- 문서 전체가 `src/claude + src/codex` 기준으로 일관된다.
- `agent/command`의 required Codex sibling 규칙이 분명하다.
- Codex installer가 Claude `agents/commands`를 직접 변환 대상으로 삼지 않는다는 점이 분명하다.

---

## 5. 다음 단계로 넘길 결정 사항

이 문서 세트가 완성되면 후속 설계자는 아래를 바로 이어받을 수 있어야 한다.

- `src/claude`와 `src/codex`의 실제 디렉터리 이동/생성 계획
- pairing metadata 또는 registry의 최소 형태
- Claude/Codex installer 분리 로직
- Codex output별 source 책임 연결
- shared guidance와 target-specific source 경계

즉 다음 단계는 다시 전략 토론이 아니라, 실제 구조 변경 설계와 구현 준비여야 한다.

