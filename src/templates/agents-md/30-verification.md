## 검증 기준 (요약)

이번 세션에서 실행한 명령과 출력 없이는 완료를 주장할 수 없습니다. 테스트·빌드·lint·타입 체크의 exit code 또는 출력이 증거입니다. `probably`, `seems`, `should work` 같은 추측 표현으로 완료를 주장하지 않습니다.

copy 도메인이 활성화된 경우 시나리오 A/B는 QA 시점에 `/copy-verify`를 실행하고 evidence manifest 존재를 확인합니다. 시나리오 C는 갭 분석 결과가 상세 PRD에 반영됐는지 확인하며, 필요하면 `copy-reference`와 evidence 기준을 함께 봅니다.

> Gate Function, Red-Green 루프, Agent Edit Race 상세는 `.claude/rules/verification.md` 참조.
