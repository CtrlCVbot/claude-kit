# Fetch/Normalize Review Checklist

리뷰어는 아래 질문에 모두 답할 수 있어야 한다.

## Structure

- `00-index.md` 하나로 남은 문서 읽는 순서가 명확한가?
- `05-fetch-normalize.md`에서 새 canonical 패키지로 자연스럽게 이동되는가?
- stage 문서와 asset 문서가 섞이지 않았는가?

## Stage Spec

- `01-stage-spec.md`에 F0-F5가 모두 있는가?
- 입력 계약, 출력 계약, dedupe 정책, hydrate 정책, 오류 정책이 모두 있는가?
- `Fetch/Normalize`가 분류나 screening 책임을 침범하지 않는가?

## Asset Separation

- `plan-intake-workflow` 문서가 체크리스트와 exit condition에 집중하는가?
- `plan-intake-reader` 문서가 orchestration owner로 충분히 명확한가?
- 4개 sub-agent의 책임이 겹치지 않는가?
- hook 문서가 preflight guard로만 머무르는가?
- rule 문서가 invariant만 잠그고 implementation detail을 강요하지 않는가?

## Templates And Contracts

- template 문서를 보고 `.plans/intake/*` 산출물 구조를 바로 만들 수 있는가?
- `propertyId` 우선, `sourceRowId` strict dedupe, row folder 우선 원칙이 모든 문서에 일관되게 반영됐는가?
- `/plan-intake-sync`와 stage 간 입출력 연결이 남는 결정 없이 설명되는가?

## Scope Discipline

- 이 패키지가 문서 전용 작업으로 유지되는가?
- `src/`, `scripts/`, registry, setup 구현 내용이 들어오지 않았는가?
- `Classify/Route`, `Cluster/Review`, `Screening/Sync` 상세 설계가 섞이지 않았는가?
