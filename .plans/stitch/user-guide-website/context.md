# Stitch Context: user-guide-website

## 통합 판단

현재 HTML guide와 Next.js prototype만으로 문서 사이트 구조를 판단하기에 충분하다. 이번 재시작에서는 Google Stitch를 생성 도구로 사용하지 않는다.

## Handoff 메모

| 항목 | 내용 |
| --- | --- |
| HTML reference | `docs/user-guide-html/**`을 source comparison material로 유지한다. |
| Next implementation | `src/app`, `src/components/docs`, `src/lib/docs`를 package task 기준으로 검증한다. |
| Runtime tabs | Codex가 Claude slash command를 직접 지원한다고 오해하게 만들지 않는다. |
| Pipeline examples | example page는 prompt runbook과 execution log에 연결한다. |
