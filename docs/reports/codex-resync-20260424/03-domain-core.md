# 03. Domain: core (18 entries)

> **core 도메인은 claude-kit 모든 도메인에 걸쳐 사용되는 횡단 관심사(cross-cutting)를 담는다.** 훅, 규칙, 스킬, 핵심 커맨드가 중심.

## 요약

| 항목 | 값 |
|------|---|
| pairing entries | 18 (paired 17 + codex-skip 1) |
| codex 물리 파일 수 | 17 + 유틸리티 23 + `.gitkeep` 1 = **50 파일** |
| REVIEW NEEDED marker | **0 파일** (core 는 write-capable agent 없음) |
| 관련 exception | EX-002 (paired-direct), EX-009 (codex-skip FAIL) |

## 타입별 집계

| 타입 | paired | skip | 소계 |
|------|:---:|:---:|:---:|
| hook | 9 | 0 | 9 |
| rule | 5 | 1 | 6 |
| skill | 2 | 0 | 2 |
| command | 1 | 0 | 1 |
| **합계** | **17** | **1** | **18** |

## Hooks (9 paired)

| Identity | Status | ContentHash | 비고 |
|----------|:---:|---|------|
| [output-secret-filter](../../../src/codex/core/hooks/output-secret-filter.js) | ✓ | `055c1f12` | **EX-002** paired-direct. 도구 출력 시크릿 마스킹 |
| [edit-tracker](../../../src/codex/core/hooks/edit-tracker.js) | ✓ | `91cf0388` | Edit 이벤트 추적 (feedback 연계) |
| [feedback-collector](../../../src/codex/core/hooks/feedback-collector.js) | ✓ | `a44fb822` | 사용자 피드백 수집 |
| [feedback-subagent-collector](../../../src/codex/core/hooks/feedback-subagent-collector.js) | ✓ | `d521e610` | 서브에이전트 피드백 수집 |
| [code-quality-reminder](../../../src/codex/core/hooks/code-quality-reminder.js) | ✓ | `dad40436` | 코드 품질 알림 |
| [no-duplication-guard](../../../src/codex/core/hooks/no-duplication-guard.js) | ✓ | `3bf7d8e9` | 문서 중복 감지 가드 (IMP-KIT-017) |
| [post-edit-history](../../../src/codex/core/hooks/post-edit-history.js) | ✓ | `7c58212a` | 편집 이력 기록 (T-BKLG-01) |
| [pre-tool-use-edit-reread](../../../src/codex/core/hooks/pre-tool-use-edit-reread.js) | ✓ | `c4348d24` | Agent Edit Race 방지 경고 (T-RACE-02) |
| [security-auto-trigger](../../../src/codex/core/hooks/security-auto-trigger.js) | ✓ | `90de6e08` | 보안 리뷰 자동 트리거 |

## Rules (5 paired + 1 codex-skip)

| Identity | Status | ContentHash | 비고 |
|----------|:---:|---|------|
| [agent-file-ownership](../../../src/codex/core/rules/agent-file-ownership.md) | ✓ | `6a1d89ae` | 에이전트 파일 소유권 매트릭스 (T-RACE-01) |
| [checkpoint-policy](../../../src/codex/core/rules/checkpoint-policy.md) | ✓ | `d4964c6b` | Human Checkpoint 정책 (IMP-KIT-016) |
| [dry-run-mode](../../../src/codex/core/rules/dry-run-mode.md) | ✓ | `b17f0ec0` | Dry-Run 공통 규칙 (T-BKLG-02) |
| [task-id-naming](../../../src/codex/core/rules/task-id-naming.md) | ✓ | `4b138962` | Task ID 네이밍 표준 (IMP-KIT-015) |
| [writer-output-format](../../../src/codex/core/rules/writer-output-format.md) | ✓ | `f0be01bd` | writer 에이전트 출력 표준 (T-BRDG-02) |
| security-no-hardcoded-secrets | ⊘ skip | — | **EX-009** 시크릿 하드코딩 금지 — paired-direct 의도지만 codex 파일 생성 보류 ([10 Known Issues](10-known-issues.md) 참조) |

**paired-fallback rule 6건 (EX-003~008)**: `coding-style`, `date-calculation`, `golden-principles`, `interaction`, `security`, `verification` — pairing-registry 에 entry 없음 (AGENTS.md.template inline merge 대상이지만 현재 artifact 미작성, [10 Known Issues](10-known-issues.md) 참조).

## Skills (2 paired)

| Identity | Status | ContentHash | 비고 |
|----------|:---:|---|------|
| [continuous-learning](../../../src/codex/core/skills/continuous-learning/SKILL.md) | ✓ | `9ebfac49` | 세션 관찰 기반 instinct 학습 시스템 |
| [session-wrap](../../../src/codex/core/skills/session-wrap/SKILL.md) | ✓ | `b3668fb7` | 세션 종료 자동 정리 (+ `references/` 6개 프롬프트) |

**파생 artifact**: `session-wrap-suggest` (EX-001) — `src/claude/core/skills/session-wrap-suggest/SKILL.md` 가 paired-fallback 용 artifact. pairing-registry entry 없이 `src/claude/` 쪽에만 존재.

## Commands (1 paired)

| Identity | Status | ContentHash | 비고 |
|----------|:---:|---|------|
| [agent-report](../../../src/codex/core/commands/agent-report.md) | ✓ | `755c24c8` | 에이전트 텔레메트리 리포트 커맨드 (IMP-AGENT-009) |

## 유틸리티 / 상수 (pairing-registry 외)

core 도메인에는 직접 변환되진 않는 공유 리소스가 함께 복사된다:

| 경로 | 파일 수 | 설명 |
|------|:---:|------|
| `src/codex/core/_constants/` | 6 | bridge-phase-a-matrix.json, critical-checkpoints.json, dev-gate-items.json, duplication-threshold.json, task-id-patterns.json, agents-md-forbidden.json |
| `src/codex/core/_schemas/` | 5 | agent-frontmatter/agent-telemetry/feedback-entry/stage-manifest-router/stage-manifest.schema.json |
| `src/codex/core/_registry/` | 1 | stage-manifest-consumers.json |
| `src/codex/core/_utils/` | 2 | task-id.js, telemetry-rollup.js |
| `src/codex/core/archive/` | 3 | index-renderer.js, rollup-generator.js, stats-aggregator.js |
| `src/codex/core/checkpoint/` | 1 | auto-proceed.js |
| `src/codex/core/collectors/` | 4 | copy-collector.js, dev-collector.js, issue-detectors.js, plan-collector.js |
| `src/codex/core/hooks/package.json` | 1 | hooks 디렉토리 Node 모듈 마커 |

이들은 pairing-registry 에 entry 가 없지만 **hook / skill / rule 파일이 동작하기 위해 필수** 이며, `src/claude/core/` 의 동일 구조를 그대로 반영한다.

## 변환 시 주의사항

- **EX-002 output-secret-filter**: 유일한 `paired-direct + exception` 조합. Codex runtime 에서 `CODEX_SANDBOX` 환경변수 조건 분기가 필요하며, Windows 에서는 비활성화.
- **EX-009 security-no-hardcoded-secrets**: 현재 `codex-skip`. 설계 의도(`strategy=paired-direct` in exception-registry)와 실제 상태 사이 모순. Phase 3 C7 감사의 FAIL 1건 근거.
- **post-edit-history**: `CLAUDE_ENABLE_POST_EDIT_HISTORY=1` 환경변수로만 활성화되는 opt-in hook. Codex runtime 에서도 동일하게 동작하는지 별도 검증 필요.
- **pre-tool-use-edit-reread**: `agent-completion-cache-invalidate` 훅과 짝을 이루는 경고 시스템 (T-RACE-02). 두 훅이 **세트로** 함께 동작해야 의미가 있음.

## Claude 원본과의 비교

core 도메인은 모든 파일이 Claude 원본과 **1:1 대응**한다 (EX-002, EX-009 제외):

```
Claude:  src/claude/core/{type}/{name}{.md|.js}
Codex:   src/codex/core/{type}/{name}{.md|.js}
```

쌍 정보는 `src/pairing-registry.json` 의 `claude` / `codex` 필드에서 확인 가능.

## 참조

- [08 Exception Handling](08-exception-handling.md) — EX-002, EX-009 상세
- [10 Known Issues](10-known-issues.md) — security-no-hardcoded-secrets FAIL + paired-fallback rule artifact 미작성
