# Codex 동기화 갭 리포트 (post-sync, 2026-04-23)

> `/kit-sync --resync` 실행 후 남은 수동 검토 항목 + 처리 결과 요약.
> 입력: [sync-report-2026-04-23.md](./sync-report-2026-04-23.md) (승인된 계획)

---

## 1. 처리 결과 요약

| 구분 | 건수 |
|------|-----:|
| drift 재변환(--resync) | 6 |
| 분류 B (레지스트리 등록만) | 10 |
| 분류 C (실제 변환, 자동 가능) | 12 |
| 분류 A (exception skip 기록) | 6 |
| copy paired-review skip (분류 D) | 10 |
| REVIEW NEEDED (수동 검토 이월) | 8+ |
| **본 실행 자동 처리 합계** | **34** |

---

## 2. 남은 수동 검토 항목 (REVIEW NEEDED)

### R1. copy-implementer (copy 도메인 신규 agent)
- 상태: 자동 처리 제외
- 필요 조치: `codex-portability.json` 에 신규 엔트리 등록 (strategy: paired-review 제안) + Codex sibling 파일 생성 여부 결정
- 이유: copy 도메인 신규 자산, kit-portability 미등록

### R2. core rules 6건 (coding-style / date-calculation / golden-principles / interaction / security / verification)
- 상태: pairing-registry 엔트리 부재 (본 실행에서 추가하지 않음 — fallback artifact AGENTS.md.template 경로 확정 필요)
- 필요 조치: `paired-fallback` status 로 skip-via-exception 엔트리 6건 추가 (각 EX-003~008 연결)
- 또는: AGENTS.md.template inline merge 경로를 명시한 `fallbackArtifact` 필드를 pairing-registry 스키마에 도입
- 이유: SSOT 일관성 — 현재 codex-portability 에는 등록, pairing-registry 에는 누락

### R3. checkpoint-policy / task-id-naming (core rules)
- 상태: **본 실행에서 paired 등록 완료** (분류 B로 처리)
- 남은 조치: `codex-portability.json` 에 strategy (추정: paired-direct) 등록 필요
- 이유: portability SSOT 미등록 → kit-analyze 4-tier 표에서 "TBD" 로 표시

### R4. agent-completion-cache-invalidate (hook + skill 쌍)
- 상태: 자동 처리 제외
- 필요 조치: hook 의 SubagentStop matcher Codex 런타임 지원 검증 → 결정 후 paired-direct 또는 paired-review
- 동반: skill 파일 `src/claude/core/skills/agent-completion-cache-invalidate/SKILL.md` 동일 identity 로 존재 — **identity 충돌 가능성** 평가 후 이름 구분 (예: `-hook` / `-skill` suffix) 고려
- 이유: 이름 중복 + SubagentStop 사양 불명확

### R5. agent-telemetry-emit (hook)
- 상태: 자동 처리 제외
- 필요 조치: `~/.claude/logs/agent-telemetry.jsonl` 경로를 Codex 에서 어떻게 매핑할지 결정 (`~/.codex/logs/` 로 치환)
- 이유: 외부 경로 의존성. agent-telemetry.md 룰과 함께 Codex 전환 디자인 필요

### R6. plan-epic 세트 3건 (command + skill + hook)
- `plan-epic` command
- `plan-epic-workflow` skill
- `plan-epic-integrity` hook (Phase 2 disable 기본)
- 상태: 자동 처리 제외
- 필요 조치: v2.4.0 Opt-in 기능 세트. 내부 상호 참조 정합성 확인 후 일괄 변환
- 이유: Epic 계층 옵션 기능 — Codex 환경에서 `.plans/epics/` 경로 관례 검증 필요

### R7. plan-state-sync (hook, T-FSTATE-01)
- 상태: 자동 처리 제외
- 필요 조치: IDEA frontmatter 동기 로직이 Codex 런타임에서 재현 가능한지 평가
- 이유: PostToolUse Edit|Write matcher + lockfile + 순차 쓰기 — Codex 런타임 제약 확인 필요

### R8. plan-revise (command, T-REVP-01)
- 상태: 자동 처리 제외
- 필요 조치: writer 에이전트 재호출 프로토콜(checkpoint-policy §8) 와 연계된 커맨드. writer 계 8 에이전트의 Codex 쪽 구현이 전제
- 이유: v2.5.0 최신 커맨드, Codex 환경에서 대화형 재호출 지원 여부 검증

---

## 3. copy 도메인 paired-review (D, 처리하지 않음)

exception-registry active 6건(EX-010~014 hooks) + pairing-registry unpaired 상태 유지 5건(copy rules):

| Identity | Type | Exception | 비고 |
|----------|------|-----------|------|
| copy-evidence-reminder | hook | EX-010 | skip-via-exception (본 실행에서 상태 전환) |
| copy-doc-drift-check | hook | EX-011 | skip-via-exception |
| copy-scope-guard | hook | EX-012 | skip-via-exception |
| copy-variant-env-guard | hook | EX-013 | skip-via-exception |
| copy-gate-stop | hook | EX-014 | skip-via-exception |
| copy-fidelity-rule | rule | — | unpaired 상태 유지 (copy-portability paired-review 전략) |
| copy-evidence-rule | rule | — | unpaired 유지 |
| copy-gates-rule | rule | — | unpaired 유지 |
| copy-commands-rule | rule | — | unpaired 유지 |
| copy-variant-rule | rule | — | unpaired 유지 |

copy 5 rules 는 exception-id 연결 없이 codex-portability `paired-review` 전략만으로 상태 보류. 필요 시 별도 exception 추가.

---

## 4. 교차 참조 후속 과제 (C8 --fix 범위 제한)

본 실행은 pairing-registry / codex-portability / exception-registry 간 레지스트리-레벨 교차 참조만 검증하여 dead ref 0 달성. **파일 레벨 교차 참조(Codex md/js 파일 내 `/plan-xxx` 슬래시 프리픽스)** 는 미처리 — 신규 복사된 Codex 파일은 Claude 원본의 슬래시 프리픽스를 그대로 유지.

향후 권장:
- 신규 변환된 12건의 md/js 파일에 대해 `kit-convert --force` 정식 실행하여 Codex 규약(`plan-xxx` / `dev-xxx` / `copy-xxx` / `kit-xxx` 프리픽스 제거) 일관화
- 단, 참조 해석에는 영향 없으므로 우선순위는 낮음

---

## 5. codex-portability 신규 등록 필요 (후속 세션)

본 실행에서 pairing-registry 에는 추가했으나 codex-portability.json 에 strategy/evidenceLevel/officialSurface 가 아직 명시되지 않은 항목:

| Identity | 제안 Strategy | 제안 OfficialSurface |
|----------|--------------|---------------------|
| no-duplication-guard | paired-direct | hooks.pre |
| pre-tool-use-edit-reread | paired-direct | hooks.pre |
| post-edit-history | paired-review | hooks.post |
| feedback-collector | paired-review | hooks |
| feedback-subagent-collector | paired-review | hooks |
| dry-run-mode | paired-fallback | agents_md |
| writer-output-format | paired-fallback | agents_md |
| agent-file-ownership | paired-fallback | agents_md |
| agent-report | paired-direct | cli |
| plan-epic-hierarchy | paired-fallback | agents_md |
| rice-lane-weighted-adjustment | paired-fallback | agents_md |
| dev-implementer | paired-direct | subagents |
| checkpoint-policy | paired-direct | rules / agents_md |
| task-id-naming | paired-direct | rules / agents_md |
| plan-bridge-writer | paired-direct | subagents |
| plan-design-writer | paired-direct | subagents |
| plan-draft-writer | paired-direct | subagents |
| plan-design | paired-direct | cli |
| edit-coordinates-governance | paired-direct | agents_md |
| plan-idea-move-guard | paired-direct | hooks.pre |
| plan-review-trigger | paired-direct | hooks |
| claude-design-workflow | paired-direct | skills |

---

## 6. 변경 이력

| 일시 | 내용 |
|------|------|
| 2026-04-23 14:50 | 초안 — /kit-sync --resync 실행 후 갭 식별. REVIEW NEEDED 8 그룹 + copy paired-review 10 건 + codex-portability 후속 등록 22 건. |
