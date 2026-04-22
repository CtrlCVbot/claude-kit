## copy 도메인

- **Evidence Reminder**: `copy-evidence-reminder.js`가 시각/인터랙션 파일 수정 시 evidence 갱신을 안내한다.
- **Scope Guard**: `copy-scope-guard.js`가 실행 단위 범위 밖 편집을 경고한다.
- **Doc Drift Check**: `copy-doc-drift-check.js`가 문서-구현 drift를 감지한다.
- **Variant Guard**: `copy-variant-env-guard.js`가 variant/host map 변경 시 QA를 안내한다.
- **Gate Stop**: `copy-gate-stop.js`가 Phase/R 종료 후 자동 진행을 차단한다 (기본 비활성).
- **시나리오 분류**: A(백지), B(부분), C(충실도 교정). `/plan-draft`에서 판정.
- **주요 커맨드**
  - `/copy-reference-refresh` — 기준 캡처 + manifest 생성/갱신
  - `/copy-visual-review` — visual 갭 분석
  - `/copy-interaction-review` — interaction 갭 분석
  - `/copy-gap-board` — 갭 우선순위 통합
  - `/copy-plan-unit` — 갭→실행 단위 전환
  - `/copy-verify` — build/evidence/document 검증
  - `/copy-closeout` — 승인 + 잔여 리스크 기록
- **주요 서브에이전트**: `copy-fidelity`, `copy-interaction-fidelity`, `copy-reference-baseline`, `copy-qa-reviewer`, `copy-implementer` (IMP-AGENT-006, `/copy-plan-unit` 승인 후 VF/IF gap 소비 + Execution Unit 범위 구현)
