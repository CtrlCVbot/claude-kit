# Conversion Rules And Manual Review

> 무엇을 자동으로 만들 수 있고, 무엇은 사람이 반드시 봐야 하는지 정리하는 문서

## conversion decision

| 결정 | 의미 |
|------|------|
| `auto-convert` | 기본 규칙만으로 Codex 초안 생성 가능 |
| `convert-with-review` | 초안은 만들 수 있으나 수동 보정 필수 |
| `skip` | Codex 대응을 명시적으로 생략 |

## auto-convert 후보

- 구조가 단순한 `skill`
- read-only 성격의 `agent`
- 명확한 event와 matcher를 가진 `hook`
- 짧고 목적이 선명한 `command`

## convert-with-review 후보

- write-heavy `agent`
- ambiguous `hook`
- long-form `command`
- runtime-dependent feature

대표 예시:

- `plan-prd-writer`
- `dev-doc-updater`
- `plan-wireframe-designer`
- `dev-feature`

## skip 기준

- Claude runtime 의존성이 강한 기능
- Codex 공식 surface에 자연스럽게 매핑되지 않는 기능
- 대체 Codex 기능이 더 적절한 기능

대표 예시:

- `session-wrap-suggest`
- `output-secret-filter`

## 수동 리뷰에서 볼 것

- write target이 제한되어 있는가
- deliverable shape가 명확한가
- skill wording이 Codex UX에 맞는가
- hook config가 Codex runtime 제약에 맞는가
- skip reason이 분명한가
