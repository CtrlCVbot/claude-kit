# Evidence Management Standards

> 모든 fidelity 판정은 증거에 기반한다. 증거 없는 판정은 추측이며, 추측은 허용하지 않는다.

## Evidence 파일 네이밍 규칙

```
{source}-{variant}-{viewport}-{state}.{ext}
```

| 필드 | 값 | 설명 |
|------|---|------|
| source | `live` | 레퍼런스 사이트 캡처 |
| source | `current` | 현재 구현 캡처 |
| source | `approved` | 승인된 디자인 시안 |
| variant | 사이트 variant 식별자 | `SITE_VARIANT` 값 사용 |
| viewport | `1440`, `1280`, `1024`, `768`, `390` | 캡처 뷰포트 너비 |
| state | `default`, `hover`, `open`, `scrolled` 등 | 캡처 시점의 UI 상태 |
| ext | `png`, `jpg`, `webp` | 이미지 형식 |

예시: `live-kr-1440-default.png`, `current-kr-768-hover.png`

## 품질 기준

해상도 최소 2x (Retina). 파일명의 viewport/state와 실제 캡처가 일치해야 한다. 비교 대상 영역이 잘리면 무효.

## Evidence Manifest

위치: `.plans/features/active/{slug}/evidence/manifest.json`

### Manifest Schema

```json
{
  "mode": "full",
  "captures": [
    {
      "capture_id": "cap-001",
      "source": "live",
      "variant": "kr",
      "viewport": 1440,
      "state": "default",
      "file_path": "evidence/live-kr-1440-default.png",
      "captured_at": "2026-04-15T10:30:00+09:00",
      "status": "valid",
      "scenario": "C",
      "paired_with": "cap-002",
      "notes": ""
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| **mode** (최상위, IMP-KIT-006) | enum | `"full"` \| `"reference-only"`. 미기재 시 backward compat로 `"full"` 간주. reference-only 모드는 Hybrid dev Feature 전용. |
| capture_id | string | 고유 캡처 식별자 (`cap-NNN`) |
| source | enum | `live`, `current`, `approved` |
| variant | string | 사이트 variant 식별자 |
| viewport | number | 캡처 뷰포트 너비 (px) |
| state | string | 캡처 시점 UI 상태 |
| file_path | string | evidence 디렉터리 기준 상대 경로 |
| captured_at | ISO 8601 | 캡처 시각 |
| status | enum | `valid`, `stale`, `missing` |
| scenario | enum | `A`, `B`, `C` |
| paired_with | string | 비교 대상 capture_id (nullable) |
| notes | string | 부가 설명 |

### Mode별 구조 차이 (IMP-KIT-006)

- **`mode: "full"`**: 기본 모드. `captures[]`에 `live`와 `current` 양쪽 기록. `paired_with` 필드로 페어링. copy-visual-review/interaction-review/gap-board 진입 가능.
- **`mode: "reference-only"`**: Hybrid dev Feature 전용. `captures[]`에 `live`만 기록. `paired_with`는 항상 null. copy-visual-review/interaction-review/gap-board 진입 시 **Precondition 실패로 거부**.

## Pairing 규칙

`live` ↔ `current` 쌍을 동일 variant/viewport/state 기준으로 구성한다. `paired_with`가 null이면 비교 불가. 시나리오 A는 `live`만 존재하고, 시나리오 B/C는 양쪽 필수.

## Missing/Stale 판정 기준

- **missing**: manifest에 등록되었으나 파일 미존재
- **stale**: 캡처 후 구현 코드가 변경됨 (git diff 기준)
- **invalid**: 뷰포트/상태가 파일명과 불일치

Round 전환 시 모든 `current` evidence를 `stale`로 전환하고 재캡처를 요구한다.
