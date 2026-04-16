# Copy Execution Gates

> copy 도메인의 실행 단위(Execution Unit)는 6단계 생명주기를 따른다. 각 단계 사이에 게이트가 존재하며, 게이트 조건을 충족하지 못하면 다음 단계로 진입할 수 없다.

## Execution Unit 생명주기

```
Plan → Capture → Analyze → Implement → Verify → Close
```

| 단계 | 핵심 활동 | 산출물 |
|------|----------|--------|
| Plan | 작업 범위 정의, Task 분할 | Execution Unit 문서 |
| Capture | 레퍼런스/현재 상태 evidence 수집 | evidence 파일 + manifest |
| Analyze | 갭 분석, priority 배정 | gap board (P0/P1/P2 항목) |
| Implement | 코드 구현 | 소스 코드 변경 |
| Verify | fidelity 검증, evidence 재캡처 | 검증 보고서 |
| Close | 결과 확정, 문서 정리 | closeout 보고서 |

## Priority 게이트

P0 이슈는 Phase/Round 경계를 넘길 수 없다.

| 조건 | 허용 여부 |
|------|----------|
| P0 열림 + Phase 완료 시도 | 차단 |
| P0 열림 + Round 전환 시도 | 차단 |
| P1 열림 + Phase 완료 시도 | 경고 후 사용자 판단 |
| P2 열림 + Phase 완료 시도 | 허용 (백로그 등록) |

## Phase 게이트

Phase 경계에서는 사용자의 명시적 승인이 필수다.

```
Phase 완료 조건:
1. 해당 Phase의 모든 P0 이슈 종료
2. evidence manifest의 모든 항목이 valid 상태
3. 사용자가 Phase 완료를 명시적으로 승인

자동 Phase 전환 = 금지
```

사용자 승인 없이 다음 Phase로 자동 진입하는 것은 어떤 경우에도 허용하지 않는다.

## Round 게이트

Round 전환 시 evidence 갱신이 필수다.

- 이전 Round의 `current` evidence를 모두 `stale`로 전환
- 새로운 evidence 캡처 완료 후에만 Round 시작 가능
- evidence manifest에 `stale` 항목이 남아 있으면 Round 진입 차단

## Generated Output 게이트

`.claude/` 디렉터리 내 산출물은 커맨드가 자동 생성한다.

```
금지: .claude/ 내 generated 파일을 직접 편집
허용: 커맨드 재실행으로 재생성
```

직접 편집한 generated 파일은 다음 커맨드 실행 시 덮어쓰기된다. 수정이 필요하면 소스(룰, 스킬, 커맨드)를 변경한다.

## Commit 게이트

하나의 Task(`T-{AREA}-{NN}`)에 하나의 커밋을 원칙으로 한다.

| 규칙 | 설명 |
|------|------|
| 1 Task = 1 Commit | Task 범위를 넘는 변경을 하나의 커밋에 포함하지 않음 |
| 커밋 메시지 | `copy({area}): {설명}` 형식 |
| 미완료 Task | 커밋 금지 -- Verify 단계 통과 후에만 커밋 |

예시: `copy(hero): T-HERO-01 CTA 버튼 색상 보정`
