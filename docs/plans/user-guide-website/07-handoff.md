# Handoff: user-guide-website

## 현재 상태

사용자 가이드 웹사이트 작업은 `claude-kit` 파이프라인 기준으로 재시작되었고, archive readiness 단계까지 문서화되었다.

현재 Next.js 구현은 기능 패키지에 매핑된 구현 증거로 정리되어 있다.

## 바로 이어서 할 일

| 우선순위 | 작업 | 이유 |
| --- | --- | --- |
| 1 | 새 기능 패키지 기준으로 route별 세부 gap review 진행 | 구현이 새 package 요구사항을 충분히 만족하는지 확인 |
| 2 | 필요하면 docs site 코드 보정 커밋 분리 | 문서 재시작 커밋과 구현 수정 커밋을 분리 |
| 3 | 최종 archive 여부 결정 | 현재는 archive readiness이고 최종 archive는 승인 후 진행 |
| 4 | Vercel Preview 여부 결정 | production 배포 전 preview 검증 경로 확보 |

## 후속 반영 후보

| 대상 | 후속 작업 |
| --- | --- |
| `docs/guide/**` | 웹사이트 안내가 안정화된 뒤 관련 가이드 링크 반영 |
| `docs/meta-tooling/**` | 이번 파이프라인 실행을 meta-tooling 예시로 참조 |
| `README.md` | Preview 또는 배포 URL 확정 후 링크 추가 |
| Vercel | local build 통과 후 Preview 설정 검토 |
