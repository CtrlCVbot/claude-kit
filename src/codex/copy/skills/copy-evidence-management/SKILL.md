<!-- REVIEW NEEDED: paired-review strategy (skills) — Codex runtime 검증 전 -->
<!-- kit-convert generated: 2026-04-24 -->
---
name: copy-evidence-management
description: evidence 수집, manifest 관리, 페어링 검증 가이드
---

# Evidence Management

디자인 원본과 구현 스크린샷을 체계적으로 수집하고 관리하는 워크플로우이다.

## 네이밍 컨벤션

모든 evidence 파일은 다음 패턴을 따른다:

```
{source}-{variant}-{viewport}-{state}.{ext}
```

| 세그먼트 | 값 | 예시 |
|---|---|---|
| source | `design`, `live` | 원본 vs 구현 |
| variant | 컴포넌트/섹션 이름 | `hero`, `nav`, `card-list` |
| viewport | `desktop`, `tablet`, `mobile` | 반응형 브레이크포인트 |
| state | `default`, `hover`, `active`, `error` | 인터랙션 상태 |
| ext | `png`, `mp4`, `gif` | 파일 형식 |

예: `design-hero-desktop-default.png`, `live-nav-mobile-hover.png`

## Manifest 스키마

각 Feature의 evidence 디렉터리에 `manifest.json`을 생성한다.

- `featureSlug`: Feature 식별자
- `capturedAt`: 수집 시점 (ISO 8601)
- `pairs[]`: evidence 쌍 목록
  - `component`: 컴포넌트명
  - `viewport`: 뷰포트
  - `state`: 상태
  - `design`: 디자인 파일 경로
  - `live`: 구현 파일 경로
  - `status`: `paired` | `design-only` | `live-only`

## 페어링 규칙

- `live` evidence는 반드시 대응하는 `design` evidence가 존재해야 `paired` 상태가 된다
- `design-only`: 구현 미완. dev 도메인에 구현 요청 전달
- `live-only`: 디자인 부재. Reference Baseline으로 처리

## 누락/갈라짐 감지

Manifest 검증 시 다음을 자동 감지한다:

- **누락(missing)**: 한쪽만 존재하는 evidence (`design-only` 또는 `live-only`)
- **갈라짐(stale)**: `capturedAt`이 구현 최종 변경일보다 오래된 evidence

감지 결과는 gap 분석 입력으로 전달된다.

## 참조

- 파이프라인 전체 흐름: `copy-pipeline` 스킬
- Gap 분석 입력: `copy-gap-analysis` 스킬

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/copy/skills/copy-evidence-management/SKILL.md`
