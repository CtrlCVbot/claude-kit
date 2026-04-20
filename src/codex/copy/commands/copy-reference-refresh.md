<!-- kit-convert generated: 2026-04-20 -->
<!-- REVIEW NEEDED: complex command -->
# copy-reference-refresh — Codex Entry Flow

기준 캡처 + evidence manifest 생성/갱신. Hybrid dev Feature는 `--reference-only` 모드로 경량 실행 (IMP-KIT-006).

## Overview

디자인 기준(reference baseline)을 캡처하고, evidence manifest를 생성하거나 갱신한다.

## Invocation

```
copy-reference-refresh --scope {sections} --viewport {viewports}
copy-reference-refresh --scope {sections} --viewport {viewports} --reference-only
```

## Parameters

- `--scope`: 캡처 대상 섹션 (콤마 구분, 예: `header,hero,footer`)
- `--viewport`: 캡처 뷰포트 (콤마 구분, 예: `desktop,mobile`)
- `--reference-only` (IMP-KIT-006): **Hybrid 모드** — dev Feature에서 시각적 참조로만 사용할 evidence 캡처. 갭 분석/visual-review/interaction-review 등 copy 파이프라인 후속 단계를 건너뛴다.
- `--full` (IMP-KIT-006 후속): **자동 감지 override**. routing-metadata의 `hybrid: true`로 자동 reference-only 모드가 적용되는 상황에서 사용자가 일반 모드(current 캡처 포함 full 분석)로 강제 실행하고자 할 때 사용. `--reference-only`와 동시 지정 시 `--reference-only` 우선.

## Hybrid Feature 처리 (요약)

dev Feature에서 레퍼런스 캡처가 필요한 경우 reference-only 모드로 경량 실행한다.

**진입 조건** (둘 중 하나):
1. 자동 감지: routing-metadata.md의 `hybrid: true` 기록
2. 명시적 플래그: `--reference-only`

**수행 작업**: evidence 캡처 + manifest(`mode: "reference-only"`) 생성만.

**건너뛰는 단계**: `copy-gap-board`, `copy-visual-review`, `copy-interaction-review`, `copy-plan-unit`, `copy-verify`, `copy-closeout`.

**사용처**: dev 구현 시 시각적 참조로만. copy 파이프라인 풀 진입하지 않음.

**전환 규칙**:
- reference-only → full: 갭 분석 요청 시 경고 + 일반 모드 재실행 권장 (또는 `--full` override)
- hybrid=false + `--reference-only`: 사용자 의도 재확인

## Preconditions

- `.plans/features/active/{slug}/` 디렉터리가 존재한다.
- 디자인 소스(Figma export 등)에 접근 가능하다.
- **`--reference-only` 모드**: routing-metadata의 `hybrid: true`이거나 사용자가 명시적으로 플래그를 지정한 경우에만 유효.

## Workflow

1. `--scope`와 `--viewport` 파라미터를 파싱하고 유효성을 확인한다.
2. **`--reference-only` 플래그 또는 routing-metadata의 `hybrid: true` 감지 시** 경량 모드로 진입:
   - 갭 분석, visual/interaction review 생략
   - evidence 캡처 완료 후 dev 파이프라인으로 즉시 반환
3. `copy-reference-baseline` 에이전트를 스폰하여 기준 캡처를 실행한다 (모드 인자 전달).
4. `.plans/features/active/{slug}/evidence/manifest.json`을 생성하거나 갱신한다.
   - 일반 모드: `mode: "full"` 기록
   - reference-only 모드: `mode: "reference-only"` 기록
5. 누락된 evidence가 있으면 missing evidence report를 출력한다.
6. pairing matrix를 갱신하여 캡처 상태를 반영한다.

## Mode 요약

| 모드 | 트리거 | 수행 범위 | 다음 단계 |
|------|--------|----------|-----------|
| Full (기본) | copy Feature (시나리오 A/B/C) | evidence 캡처 + manifest | `copy-visual-review` / `copy-interaction-review` / `copy-gap-board` |
| reference-only | `--reference-only` 플래그 또는 `hybrid: true` | evidence 캡처 + manifest만 | 없음 (dev 파이프라인으로 반환) |

## Output

- `.plans/features/active/{slug}/evidence/manifest.json` (`mode` 필드 포함)
- missing evidence report (누락이 있는 경우)

## Rules

- manifest.json 변경 시 반드시 사용자 확인을 받는다.
- 기존 evidence를 덮어쓰기 전에 diff를 보여준다.
- scope/viewport 미지정 시 전체 범위로 실행하지 않고 사용자에게 묻는다.
- `--reference-only` 모드에서 사용자가 갭 분석을 추가 요청하면: 모드 전환 경고 + 일반 모드 재실행 권장.
- Hybrid 자동 감지 (routing-metadata `hybrid: true`)와 `--reference-only` 플래그는 동등하게 reference-only 모드로 진입.

## 연계

- `plan-draft-writer` (IMP-KIT-003): Hybrid 자동 감지 → routing-metadata에 `hybrid: true` 기록
- `plan-bridge-writer` (IMP-KIT-004): Hybrid dev Feature 경로 분기에서 `--reference-only` 안내
- `src/claude/copy/rules/copy-commands.md` — "Hybrid Feature 처리" 섹션 참조

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-reference-refresh.md
