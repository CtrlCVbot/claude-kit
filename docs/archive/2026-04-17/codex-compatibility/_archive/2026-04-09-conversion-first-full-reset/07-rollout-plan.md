# Rollout Plan

> `src/claude + src/codex` 기준을 유지하되, 1차 목표를 기존 Claude 자산의 Codex 전환으로 재정렬한 뒤 문서와 구현 준비를 어떤 순서로 진행할지 정리한 문서.

---

## 1. 문서 재정렬 순서

이 문서 세트는 아래 순서로 재구성한다.

1. 기존 활성 `08~15`를 archive로 이동
2. `00`~`07`은 유지하고, `08~15`를 migration-first 기준으로 전면 재작성
3. `08`~`12`에서 migration 입력, guide 영향, conversion 규칙, Codex output spec 고정
4. `13`~`15`에서 conversion tooling, 구현 로드맵, 파이프라인 다이어그램 고정
5. 이후 실제 구현과 guide/meta-tooling 반영 순서를 잇는다

이 순서를 지키는 이유는 create-time 생성 규칙보다 먼저 existing-source migration 기준을 고정해야 하기 때문이다.

---

## 2. 후속 구현 준비 순서

문서가 완성된 뒤 실제 구현 준비는 아래 순서가 적절하다.

1. 기존 `src/claude` 전체 기능 inventory 확정
2. Claude -> Codex conversion rule 확정
3. pilot 5개를 먼저 `src/codex`로 변환
4. validate / audit / registry 기준 정렬
5. bulk migration 후 installer를 `src/codex` 기준으로 전환
6. 마지막에 `kit-create`가 migration 규칙을 재사용하도록 연결

초기 구현 우선순위는 `agent`, `command`, `hook` pilot을 먼저 잡고, 그다음 bulk migration과 installer cutover로 확장하는 흐름이 적절하다.

---

## 3. migration 원칙

- 기존 단일 `src`는 곧바로 "공통 source"로 보지 않는다.
- 우선 현재 자산을 Claude-origin source로 해석한다.
- 1차 목표는 기존 Claude 자산을 읽어 `src/codex` conversion output을 만드는 것이다.
- Codex 대응은 `kit-create`보다 `kit-convert` 기준으로 먼저 설계한다.
- guidance 자산은 당장 전부 복제하지 않고 shared/Claude-origin으로 유지한다.

즉 migration은 "모든 것을 한 번에 이중화"가 아니라, 기존 Claude 자산을 점진적으로 Codex source로 전환하고 마지막에 installer를 전환하는 방식이다.

---

## 4. 완료 조건

이번 문서 재구성 단계의 완료 조건은 아래다.

- `docs/codex-compatibility/08~15`가 migration-first 기준으로 다시 작성된다.
- 이전 활성 `08~15`는 `_archive/2026-04-09-migration-first-reset/`에 보존된다.
- 문서 전체가 create-time보다 existing-source migration을 우선 목표로 설명한다.
- `kit-convert`, `kit-validate`, `kit-audit C7`, `kit-maintainer`의 책임이 분명하다.
- installer cutover는 bulk migration 이후 단계라는 점이 분명하다.

---

## 5. 다음 단계로 넘길 결정 사항

이 문서 세트가 완성되면 후속 설계자는 아래를 바로 이어받을 수 있어야 한다.

- 기존 `src/claude`를 어떤 순서로 `src/codex`로 전환할지
- pilot 변환 세트와 bulk migration 기준
- migration status registry의 최소 형태
- validate / audit / maintainer 역할 분리
- installer cutover 시점과 guide/meta-tooling 반영 시점

즉 다음 단계는 create-time 전략 토론이 아니라, 실제 conversion tooling과 migration pilot 구현 준비여야 한다.
