<!-- kit-convert generated: 2026-04-17 -->
<!-- REVIEW NEEDED: complex command -->
# copy-reference-refresh — Codex Entry Flow

기준 캡처 + evidence manifest 생성/갱신.

## Overview

디자인 기준(reference baseline)을 캡처하고, evidence manifest를 생성하거나 갱신한다.

## Invocation

```
copy-reference-refresh --scope {sections} --viewport {viewports}
```

## Parameters

- `--scope`: 캡처 대상 섹션 (콤마 구분, 예: `header,hero,footer`)
- `--viewport`: 캡처 뷰포트 (콤마 구분, 예: `desktop,mobile`)

## Preconditions

- `.plans/features/active/{slug}/` 디렉터리가 존재한다.
- 디자인 소스(Figma export 등)에 접근 가능하다.

## Workflow

1. `--scope`와 `--viewport` 파라미터를 파싱하고 유효성을 확인한다.
2. `copy-reference-baseline` 에이전트를 스폰하여 기준 캡처를 실행한다.
3. `.plans/features/active/{slug}/evidence/manifest.json`을 생성하거나 갱신한다.
4. 누락된 evidence가 있으면 missing evidence report를 출력한다.
5. pairing matrix를 갱신하여 캡처 상태를 반영한다.

## Output

- `.plans/features/active/{slug}/evidence/manifest.json`
- missing evidence report (누락이 있는 경우)

## Rules

- manifest.json 변경 시 반드시 사용자 확인을 받는다.
- 기존 evidence를 덮어쓰기 전에 diff를 보여준다.
- scope/viewport 미지정 시 전체 범위로 실행하지 않고 사용자에게 묻는다.

## Codex 참고 사항
- 이 파일은 authoring source이다.
- Claude sibling: src/claude/copy/commands/copy-reference-refresh.md
