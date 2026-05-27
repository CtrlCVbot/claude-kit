# Error Handling: user-guide-website

| 오류/실패 | 처리 |
| --- | --- |
| planning page slug 누락 | Next.js `notFound()`로 처리 |
| example slug 누락 | not-found 상태 렌더링 |
| 깨진 내부 링크 | route/link verification에서 기록 |
| build 실패 | 완료 중단 후 `03-dev-notes/dev-output-summary.md`에 실패 기록 |
| protected path diff 발생 | high severity review issue로 처리 |
| runtime 설명 불일치 | release 전 문서 내용 수정 |
