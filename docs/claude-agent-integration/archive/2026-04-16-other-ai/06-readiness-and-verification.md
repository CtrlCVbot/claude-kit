# Readiness and Verification

- 문서 ID: CAI-06
- 목적: `copy` 도메인 구현 전후 검증 기준과 피드백 반영 결과를 정의한다.
- 선행 문서: [05-implementation-plan.md](./05-implementation-plan.md)

## 1. Pre-Implementation Readiness

| 체크 | 기준 | 상태 |
| --- | --- | --- |
| 문서 기준 | 본문이 `claude-kit copy 도메인 도입` 기준으로 작성됨 | 완료 |
| legacy 격리 | Turner/P문서/R문서 내용이 appendix로 이동됨 | 완료 |
| source 전제 | `src/claude/copy`가 아직 없음을 명시 | 완료 |
| generated output | `.claude/*`는 직접 수정 대상이 아님을 명시 | 완료 |
| 구현 계획 | A-1부터 A6까지 단계화 | 완료 |
| 사용자 gate | 실제 source 구현 전 승인 필요 | 대기 |

## 2. 구현 후 검증 명령

| 검증 | 명령 또는 방법 | 기대 결과 |
| --- | --- | --- |
| git 범위 | `git status --short` | 실행 단위 외 변경 없음 |
| copy source 구조 | `Get-ChildItem src/claude/copy -Recurse` | 단계별 파일 존재 |
| hook syntax | `node --check src/claude/copy/hooks/*.js` | syntax 오류 없음 |
| quickstart | `pnpm check:quickstart` | generated quickstart와 template 일치 |
| setup | `pnpm claude-kit:setup` | active domains 기준 output 생성 |
| registry JSON | JSON parse 또는 node load check | malformed JSON 없음 |
| generated Claude output | `.claude/agents`, `.claude/commands`, `.claude/rules`, `.claude/skills` 확인 | `copy` 활성 시 output 존재 |
| Codex output | plugin output과 portability policy 확인 | hooks는 정책에 맞게 include/skip |

## 3. 문서 검증

| 검증 | 기준 | 결과 |
| --- | --- | --- |
| archive 보존 | 기존 15개 문서가 `archive/2026-04-16-original`에 존재 | 완료 |
| feedback 보존 | 피드백 문서가 `archive/2026-04-16-feedback`에 존재 | 완료 |
| 새 구조 | README + `01`~`06` + appendix 생성 | 완료 |
| 링크 범위 | 새 문서의 Markdown 링크는 존재하는 문서/파일만 대상으로 함 | 완료 |
| 본문 기준 | Turner/P문서/R문서 언급은 legacy 격리 안내와 appendix 사례로만 존재 | 완료 |

## 4. 피드백 반영 결과

| 피드백 | Severity | 반영 결과 | Action |
| --- | --- | --- | --- |
| 문서 목적 혼재 | high | `copy` 도메인 package-level 문서로 재작성하고 Turner 내용은 appendix로 격리 | auto-fixed |
| 실제 repo 구조와 문서 가정 불일치 | high | `src/claude/copy`가 없다는 현재 상태를 모든 핵심 문서에 반영 | auto-fixed |
| 링크 신뢰도 낮음 | high | 존재하지 않는 root P문서와 generated `.claude` Markdown 링크 제거 | auto-fixed |
| 완료/readiness 충돌 | high | 상태를 "문서 재작성 완료, 구현 미착수"로 정정 | auto-fixed |
| 의사결정 기록과 실행 계획 중복 | high | `01`은 결정, `05`는 구현 계획, `06`은 검증으로 분리 | auto-fixed |
| WBS/시나리오 분석 과다 | medium | workflow 핵심만 `03`에 남기고 legacy 사례는 appendix로 이동 | auto-fixed |
| self-review 체크 미완료 | medium | 새 문서에 완료 기준과 self-review 결과를 재작성 | auto-fixed |

## 5. 남은 리스크

| 리스크 | Severity | Impact / Reach / Recovery / Total / Confidence / Action | 대응 |
| --- | --- | --- | --- |
| `copy` opt-in 정책이 구현 중 바뀔 수 있음 | medium | `2 / 2 / 1 / 5 / likely / needs-user-input` | A-1 전 사용자 승인으로 확정 |
| Codex hook 호환성 판단이 부족할 수 있음 | medium | `2 / 2 / 1 / 5 / likely / needs-verification` | portability manifest와 `codex-hook-compat.js`로 검증 |
| setup 변경이 기존 domains에 회귀를 만들 수 있음 | high | `3 / 2 / 1 / 6 / likely / needs-verification` | `core`, `dev`, `plan` output 회귀 검증 필수 |
| generated output을 source처럼 수정할 위험 | medium | `2 / 2 / 1 / 5 / likely / queued` | README와 architecture에서 source-first 원칙 반복 |

## 6. Self-review

| 점검 항목 | 결과 |
| --- | --- |
| `claude-kit copy 도메인 도입` 기준으로 작성됨 | 완료 |
| 기존 문서가 archive로 보존됨 | 완료 |
| 피드백 문서가 보존됨 | 완료 |
| 새 문서 7개와 appendix가 생성됨 | 완료 |
| high 피드백이 모두 반영 또는 대응 기록됨 | 완료 |
| 구현 코드는 작성하지 않음 | 완료 |
| `.claude`, `src/claude/copy`, `scripts/setup.js`, registry는 수정하지 않음 | 완료 |

## 7. 최종 완료 기준

| 기준 | 완료 조건 |
| --- | --- |
| 문서 구조 | 권장 새 구조와 일치 |
| archive | 기존 15개 문서 보존 |
| feedback | CAI-14 피드백 보존 및 반영표 작성 |
| 검증 | 링크, 구조, Turner 격리, git 범위 확인 |
| 다음 단계 | A-1 구현 승인 여부만 남김 |
