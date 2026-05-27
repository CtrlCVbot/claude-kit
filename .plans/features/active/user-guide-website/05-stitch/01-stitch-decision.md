# P6 `/plan-stitch`: User Guide Website Stitch Decision

- **Feature**: `user-guide-website`
- **Status**: complete
- **Decision**: `skip-with-reason`

## 판단

Google Stitch는 이번 1차 구현에서 사용하지 않는다.

## 이유

| 기준 | 판단 |
| --- | --- |
| 기존 reference | `docs/user-guide-html`에 이미 충분한 visual reference가 있다. |
| 구현 목표 | 랜딩 페이지가 아니라 상세 문서 구조가 목표다. |
| 리스크 | 외부 디자인 산출물을 끼워 넣으면 content parity보다 visual polish로 흐를 수 있다. |
| 속도 | Next.js shell과 route 검증을 먼저 완료하는 것이 더 안전하다. |

## 대체 기준

- `docs/user-guide-html/styles.css`의 warm tone을 참고한다.
- `docs/user-guide-html/planning/*.html`의 상세 정보 구조를 content parity 기준으로 삼는다.
- `P5.5 plan-design`의 component pattern을 구현 기준으로 삼는다.

## 후속 조건

Stitch는 다음 조건 중 하나가 생기면 `review-only`로 재검토한다.

- 공식 public docs launch 전에 visual identity를 더 다듬어야 할 때
- marketing landing page가 별도 필요할 때
- 디자인 팀 또는 외부 reference와 비교 리뷰가 필요할 때

