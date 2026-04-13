# 2026-04-09 Migration-First Reset Archive

이 폴더는 `docs/codex-compatibility/08~15`의 이전 활성 문서를 보존한다.

## 아카이브 이유

- 기존 `08~15`는 `kit-create` 중심의 create-time sibling generation 흐름을 전제로 점점 구체화되었다.
- 현재 목표는 새 기능 생성이 아니라, 이미 존재하는 `src/claude` 자산을 읽어 `src/codex`로 전환하는 1차 migration pipeline을 설계하는 것이다.
- 그래서 활성 `08~15`를 migration-first 기준으로 전면 재작성하고, 이전 문서는 역사본으로만 남긴다.

## 아카이브 범위

- `08-claude-feature-baseline.md`
- `09-guide-alignment-audit.md`
- `10-claude-to-codex-surface-mapping.md`
- `11-codex-sibling-design-catalog.md`
- `12-claude-codex-diff-matrix.md`
- `13-conversion-tooling-requirements.md`
- `14-conversion-workflow-and-roadmap.md`
- `15-pipeline-diagrams.md`

## 읽는 방법

- 현재 기준 문서는 상위 `docs/codex-compatibility/08~15`를 본다.
- 이 폴더의 문서는 과거 설계 맥락과 의사결정 히스토리를 확인할 때만 참조한다.
