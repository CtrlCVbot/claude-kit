# 2026-04-09 Conversion-First Full Reset

이 폴더는 `docs/codex-compatibility`의 이전 활성 `00~15` 문서를 보존한다.

## 아카이브 이유

- 기존 활성 문서 세트는 target-separated authoring, tooling, installer, create-time 흐름까지 한 세트에 담고 있었다.
- 현재 1차 목표는 새 기능 생성이 아니라, 이미 존재하는 `src/claude` 자산을 읽어 `src/codex`로 전환하는 conversion-first 기준을 문서화하는 것이다.
- 그래서 활성 문서 세트를 더 작고 선명한 conversion-only 구조로 다시 구성한다.

## 아카이브 범위

- `00-overview.md`
- `01-requirements-and-success-criteria.md`
- `02-current-state-gap-analysis.md`
- `03-source-layout-and-ownership.md`
- `04-asset-mapping-rules.md`
- `05-installer-and-output-model.md`
- `06-source-template-and-doc-improvements.md`
- `07-rollout-plan.md`
- `08-claude-feature-baseline.md`
- `09-guide-alignment-audit.md`
- `10-claude-to-codex-surface-mapping.md`
- `11-codex-sibling-design-catalog.md`
- `12-claude-codex-diff-matrix.md`
- `13-conversion-tooling-requirements.md`
- `14-conversion-workflow-and-roadmap.md`
- `15-pipeline-diagrams.md`

## 참고

- 현재 기준 문서는 상위 `docs/codex-compatibility/00~09`를 본다.
- 이 폴더의 문서는 과거 설계와 의사결정 히스토리를 확인할 때만 참조한다.
