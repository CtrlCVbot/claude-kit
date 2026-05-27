# A1 `/plan-archive` Readiness: User Guide Website

- **Feature**: `user-guide-website`
- **Status**: not archived
- **Reason**: 1차 구현은 완료됐지만 content parity와 Vercel Preview safety가 후속 작업으로 남아 있다.

## Archive 대상 산출물

| 구분 | 경로 | 상태 |
| --- | --- | --- |
| Idea | `.plans/ideas/20-approved/IDEA-20260527-001.md` | ready |
| Screening | `.plans/ideas/10-screening/SCREENING-20260527-001.md` | ready |
| Epic | `.plans/epics/20-active/EPIC-20260527-001/` | active |
| Feature run | `.plans/features/active/user-guide-website/` | ready after follow-up |
| Execution log | `docs/plans/user-guide-website/execution-log.md` | ready |
| Implementation | `src/app`, `src/components/docs`, `src/lib/docs` | first-pass complete |
| Implementation docs | `.plans/features/active/user-guide-website/07-dev/03-implementation-source-map.md` ~ `06-commit-history-and-handoff.md` | ready |

## Archive 보류 이유

| 이유 | 설명 |
| --- | --- |
| Content parity | 기존 HTML 상세 표와 failure modes가 아직 요약형으로만 반영됐다. |
| Preview safety | Vercel Preview 실행/증거가 아직 없다. |
| Guide sync | `docs/guide`, `docs/meta-tooling`, README 반영 여부가 아직 확정되지 않았다. |

## Archive 전 필요 작업

1. command 상세 페이지의 content parity 보강
2. Vercel Preview 또는 local preview evidence 정리
3. guide/meta-tooling/README 반영 여부 결정
4. Epic children feature 상태 갱신
5. `/plan-archive EPIC-20260527-001` 실행

## 현재 결론

Archive는 아직 실행하지 않는다. 대신 이번 문서는 archive 준비 상태와 보류 이유를 명확히 남기는 A1 checkpoint로 둔다.
