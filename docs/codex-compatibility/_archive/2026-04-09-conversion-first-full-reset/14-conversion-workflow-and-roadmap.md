# Conversion Workflow And Roadmap

> Claude 기존 자산을 Codex로 전환하는 실제 구현 순서를 정리하는 문서

## 단계 위치

- 실행 단계: `5단계`
- 선행 조건: `08`~`13`

## 목적

pilot migration부터 bulk migration, installer cutover, create-time reuse까지 구현 순서를 고정한다.

## 구현 파형

### Wave A: inventory 확정 + conversion preview

- `08` 인벤토리 잠금
- `kit-convert --preview` 흐름 설계
- `09-architecture`, `10-glossary` 수정 포인트 확정

완료 기준:

- 어떤 Claude identity가 무엇으로 변환되는지 preview로 볼 수 있다.

### Wave B: pilot 5개 변환

pilot 세트는 아래로 고정한다.

- `dev-architect`
- `plan-prd-writer`
- `dev-feature`
- `dev-tdd-guard`
- `session-wrap-suggest`

완료 기준:

- `src/codex`에 첫 sibling 세트가 생긴다.
- `paired`와 `codex-skip`가 실제 registry 엔트리로 기록된다.

### Wave C: validate / audit / parity 정렬

- `kit-validate`가 generated Codex sibling과 companion pair를 검증
- `kit-audit C7`가 required parity와 drift를 검증
- `kit-maintainer`가 repair proposal을 만들 수 있게 정리

완료 기준:

- pilot 세트가 validate/audit를 모두 통과한다.

### Wave D: bulk migration

- `dev`
- `plan`
- `core`

순으로 bulk conversion을 진행한다.

완료 기준:

- 기존 Claude 기능 전체가 `paired`, `codex-skip`, `shared-guidance` 중 하나로 정리된다.

### Wave E: installer cutover

- `scripts/setup.js`가 Codex install에서 `src/codex`를 읽도록 전환
- legacy `SRC_CLAUDE -> Codex path copy` 모델 제거 계획 착수

완료 기준:

- Codex installer가 더 이상 Claude source를 직접 Codex 입력으로 삼지 않는다.

### Wave F: `kit-create` 규칙 재사용

- migration 규칙을 `kit-create`에 재사용
- 새 기능 생성 시도 migration output spec과 같은 path/format 사용

완료 기준:

- create-time scaffolding이 migration 규칙과 어긋나지 않는다.

## 리뷰 게이트

| 시점 | 확인 질문 |
|------|-----------|
| Wave A 후 | `kit-convert` preview가 실제 mapping 규칙과 일치하는가 |
| Wave B 후 | pilot 5개가 서로 다른 패턴을 대표하는가 |
| Wave C 후 | validate와 audit 책임이 겹치지 않는가 |
| Wave D 후 | bulk migration 중 orphan/skip/drift가 누락되지 않는가 |
| Wave E 후 | installer가 `src/codex` 기준으로 동작하는가 |
| Wave F 후 | `kit-create`가 migration 규칙을 재사용하는가 |

## 후속 문서 반영 순서

1. `docs/guide/09-architecture.md`
2. `docs/guide/10-glossary.md`
3. `docs/meta-tooling/*`
4. 필요 시 `README.md`

## 완료 기준

- migration-first workflow가 구현 순서까지 고정된다.
- pilot -> bulk -> installer cutover -> create-time reuse 순서가 흔들리지 않는다.
- installer 전환보다 migration source 생성이 먼저라는 점이 문서에서 분명하다.
