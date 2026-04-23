# Codex 동기화 리포트 (승인 대기)

> 생성: 2026-04-23 Thursday | 모드: `/kit-sync --resync` | 실행자: kit-sync-agent
>
> 본 리포트는 `Investigation_Protocol` Step 1~2 결과를 통합하고, Step 2.5 승인 게이트에 제출된다.
> 사용자가 **"승인"** 또는 **"수정했음"** 을 응답할 때까지 Step 3 이후는 실행되지 않는다.
> 상태: **승인 대기**

---

## 1. 분석 결과 요약 (kit-analyze 기준)

| 분류 | 건수 | 비고 |
|------|-----:|------|
| 전체 Claude 컴포넌트 | 141 | `src/claude/**/*.{js,md}` (_archive 제외) |
| paired | 92 | pairing-registry 에 짝 존재 |
| **unpaired / no-registry** | **49** | 본 리포트 처리 범위 |
| **drift (paired 이지만 내용 불일치)** | **6** | `--resync` 재변환 대상 |
| exception-registry active (skip 면제) | 6 | EX-009, EX-010~014 |

규모: unpaired 49 > 10 → **Step 2.5 승인 게이트 필수**.

---

## 2. 처리 전략 분류 (Phase 4 4-tier)

`codex-portability.json` SSOT 기준. 등록되지 않은 신규 컴포넌트는 **TBD** 로 표시.

### 2.1 전환 대상 합계

| Tier | 등록됨 | 신규 (TBD) | 소계 |
|------|------:|----------:|-----:|
| paired-direct | 0 | 7 | 7 |
| paired-fallback | 0 | 11 | 11 |
| paired-review | 16 | 8 | 24 |
| blocked | 0 | 0 | 0 |
| skip (면제) | 6 | 0 | 6 |
| **합계** | **22** | **26** | **48** |

> 참고: 49건 중 copy-implementer 1건은 copy 도메인 신규 에이전트로서 codex-portability 등록 필요.

---

## 3. 미페어링 자산 전체 목록 (49건)

### 3.1 copy 도메인 intentional (exception 면제, 자동 skip) — 5 hooks + 5 rules + 1 agent (copy-implementer 제외, 하기 별도)

| # | Identity | Type | Strategy | EvidenceLevel | Exception |
|---|----------|------|----------|---------------|-----------|
| 1 | copy-evidence-reminder | hook | paired-review | 추정 | EX-010 (active) |
| 2 | copy-doc-drift-check | hook | paired-review | 추정 | EX-011 (active) |
| 3 | copy-scope-guard | hook | paired-review | 추정 | EX-012 (active) |
| 4 | copy-variant-env-guard | hook | paired-review | 추정 | EX-013 (active) |
| 5 | copy-gate-stop | hook | paired-review | 추정 | EX-014 (active) |
| 6 | copy-fidelity-rule (copy-fidelity.md) | rule | paired-review | 추정 | — (paired-review) |
| 7 | copy-evidence-rule (copy-evidence.md) | rule | paired-review | 추정 | — (paired-review) |
| 8 | copy-gates-rule (copy-gates.md) | rule | paired-review | 추정 | — (paired-review) |
| 9 | copy-commands-rule (copy-commands.md) | rule | paired-review | 추정 | — (paired-review) |
| 10 | copy-variant-rule (copy-variant.md) | rule | paired-review | 추정 | — (paired-review) |

**처리 방침**: paired-review 전략은 Codex 런타임 검증 전 보류 상태. `/kit-sync` 자동 전환 **안 함** — exception 면제로 건너뛴 후 최종 보고에 기록.

### 3.2 copy 도메인 신규 자산 (codex-portability 미등록)

| # | Identity | Type | 제안 Strategy | 메모 |
|---|----------|------|--------------|------|
| 11 | copy-implementer | agent | paired-review (제안) | 신규 에이전트 — codex-portability 등록 + REVIEW NEEDED |

**처리 방침**: 신규 자산이라 전환 시 REVIEW NEEDED 마킹. 자동 전환 금지 (수동 검토 필요).

### 3.3 core 도메인 (등록되지 않음, 신규 자산)

#### Hooks (7건)

| # | Identity | 제안 Strategy | 제안 OfficialSurface | Matcher / 리스크 |
|---|----------|--------------|---------------------|------------------|
| 12 | agent-completion-cache-invalidate | paired-review | hooks (SubagentStop) | SubagentStop + session state — Codex 런타임 검증 필요 |
| 13 | agent-telemetry-emit | paired-review | hooks | ~/.claude/logs 경로 의존 — 검증 필요 |
| 14 | feedback-collector | paired-review | hooks | 세션 텔레메트리 수집 — 검증 필요 |
| 15 | feedback-subagent-collector | paired-review | hooks | Subagent lifecycle 의존 |
| 16 | no-duplication-guard | paired-direct (제안) | hooks.pre | PreToolUse Edit/Write — matcher 제한 주의 |
| 17 | post-edit-history | paired-review | hooks.post | stub 단계 — 검증 필요 |
| 18 | pre-tool-use-edit-reread | paired-direct (제안) | hooks.pre | Read 캐시 race — 검증 필요 |

#### Rules (11건)

| # | Identity | 제안 Strategy | 제안 OfficialSurface | 노트 |
|---|----------|--------------|---------------------|------|
| 19 | agent-file-ownership | paired-fallback | agents_md | guidance 성격 — AGENTS.md 머지 |
| 20 | checkpoint-policy | paired-fallback | agents_md | (Codex 측에는 core/rules/checkpoint-policy.md 존재 — pairing-registry 누락 확인 필요) |
| 21 | coding-style | EX-003 handled | agents_md | **이미 EX-003로 면제 처리됨** — pairing-registry 미등록 상태 교정 필요 |
| 22 | date-calculation | EX-004 handled | agents_md | **이미 EX-004로 면제 처리됨** — pairing-registry 미등록 상태 교정 필요 |
| 23 | dry-run-mode | paired-fallback | agents_md | 신규 룰 |
| 24 | golden-principles | EX-005 handled | agents_md | **EX-005 처리됨** — pairing-registry 미등록 교정 필요 |
| 25 | interaction | EX-006 handled | agents_md | **EX-006 처리됨** — pairing-registry 미등록 교정 필요 |
| 26 | security | EX-007 handled | agents_md | **EX-007 처리됨** — pairing-registry 미등록 교정 필요 |
| 27 | task-id-naming | paired-direct | rules / agents_md | (Codex 측 core/rules/task-id-naming.md 존재 — pairing 누락 교정) |
| 28 | verification | EX-008 handled | agents_md | **EX-008 처리됨** — pairing-registry 미등록 교정 필요 |
| 29 | writer-output-format | paired-fallback | agents_md | 신규 룰 |

> **중요 발견**: core rules 중 7건(coding-style, date-calculation, golden-principles, interaction, security, verification, checkpoint-policy, task-id-naming)은 이미 Codex 측 artifact 또는 EX-### 면제 처리됨에도 pairing-registry에 **항목 자체가 없음**. 이는 SSOT 누락으로 REVIEW NEEDED.

#### Skills (2건)

| # | Identity | 제안 Strategy | 제안 OfficialSurface | 노트 |
|---|----------|--------------|---------------------|------|
| 30 | agent-completion-cache-invalidate (skill) | paired-review | skills | hook 보조 skill — 의존성 있음 |
| 31 | session-wrap-suggest (skill) | EX-001 handled | skills | **EX-001 fallback artifact** — Codex 측 이미 존재. pairing-registry 미등록 교정 필요 |

#### Commands (1건)

| # | Identity | 제안 Strategy | 제안 OfficialSurface | 노트 |
|---|----------|--------------|---------------------|------|
| 32 | agent-report | paired-direct | cli | telemetry 조회 커맨드 — 직접 전환 가능 |

### 3.4 dev 도메인

| # | Identity | Type | 제안 Strategy | 노트 |
|---|----------|------|--------------|------|
| 33 | dev-implementer | agent | paired-direct | Codex 측 미존재 — 신규 전환 대상 |
| 34 | edit-coordinates-governance | rule | paired-direct | Codex 측 `src/codex/dev/rules/edit-coordinates-governance.md` 존재 — pairing-registry 교정 필요 (실질 paired) |

### 3.5 plan 도메인

#### Agents (3건)

| # | Identity | 제안 Strategy | 노트 |
|---|----------|--------------|------|
| 35 | plan-bridge-writer | paired-direct | Codex 측 `src/codex/plan/agents/plan-bridge-writer.md` 존재 — pairing 교정 필요 (실질 paired) |
| 36 | plan-design-writer | paired-direct | Codex 측 존재 — pairing 교정 필요 |
| 37 | plan-draft-writer | paired-direct | Codex 측 존재 — pairing 교정 필요 |

#### Commands (3건)

| # | Identity | 제안 Strategy | 노트 |
|---|----------|--------------|------|
| 38 | plan-design | paired-direct | Codex 측 존재 — pairing 교정 필요 |
| 39 | plan-epic | paired-direct | Codex 측 미존재 — 신규 전환 대상 |
| 40 | plan-revise | paired-direct | Codex 측 미존재 — 신규 전환 대상 |

#### Hooks (4건)

| # | Identity | 제안 Strategy | 노트 |
|---|----------|--------------|------|
| 41 | plan-epic-integrity | paired-direct (제안) | PreToolUse Edit/Write matcher — Codex Bash-only 제약 고려 |
| 42 | plan-idea-move-guard | paired-direct | Codex 측 `src/codex/plan/hooks/plan-idea-move-guard.js` 존재 — pairing 교정 필요 |
| 43 | plan-review-trigger | paired-direct | Codex 측 존재 — pairing 교정 필요 |
| 44 | plan-state-sync | paired-review | IDEA 상태 동기 — 런타임 검증 필요 |

#### Rules (2건)

| # | Identity | 제안 Strategy | 노트 |
|---|----------|--------------|------|
| 45 | plan-epic-hierarchy | paired-fallback | agents_md guidance |
| 46 | rice-lane-weighted-adjustment | paired-fallback | agents_md guidance |

#### Skills (2건)

| # | Identity | 제안 Strategy | 노트 |
|---|----------|--------------|------|
| 47 | claude-design-workflow | paired-direct | Codex 측 `src/codex/plan/skills/claude-design-workflow/SKILL.md` 존재 — pairing 교정 필요 |
| 48 | plan-epic-workflow | paired-direct | Codex 측 미존재 — 신규 전환 대상 |

### 3.6 요약 재분류 (처리 우선순위)

- **A. exception-registry active (자동 skip, 자동 처리)** — 6건: EX-009, EX-010~014
  - EX-009 security-no-hardcoded-secrets
  - EX-010~014 copy hooks (copy-evidence-reminder, copy-doc-drift-check, copy-scope-guard, copy-variant-env-guard, copy-gate-stop)

- **B. 이미 Codex 측 artifact 존재 → pairing-registry 갱신만 필요 (자동 등록 가능)** — 약 13건
  - core rules (7건) + core skills (session-wrap-suggest) + dev rule (edit-coordinates-governance) + plan agents (3건) + plan commands (plan-design) + plan hooks (plan-idea-move-guard, plan-review-trigger) + plan skills (claude-design-workflow)
  - 이 자산들은 파일이 이미 양쪽 존재하므로 `--skip-conversion --register-only` 패턴으로 처리 가능.

- **C. Codex 측 미존재 → 실제 변환 필요** — 약 24건
  - core hooks 7건, core rules 2건(dry-run-mode, writer-output-format), core skill 1건(agent-completion-cache-invalidate), core command 1건(agent-report)
  - dev agent 1건(dev-implementer)
  - plan commands 2건(plan-epic, plan-revise), plan hooks 2건(plan-epic-integrity, plan-state-sync), plan rules 2건, plan skill 1건(plan-epic-workflow)
  - copy agent 1건(copy-implementer)

- **D. copy 도메인 paired-review (intentional skip, skip 기록)** — 10건 (§3.1 전체)

---

## 4. 재변환 계획 (--resync drift 6건)

kit-analyze 가 감지한 content drift. Claude 쪽에 존재하는 도메인 키워드(`copy`, `scenario`, `시나리오`, `Feature 유형`, `/copy-`, `copy-reference`, `routing-metadata`, `갭 분석`)가 Codex 쪽에서 N회 → 0회 또는 수량 감소.

| # | Identity | Type | Domain | 누락 키워드 (예상) | 재변환 계획 |
|---|----------|------|--------|-------------------|------------|
| D1 | plan-prd-writer | agent | plan | copy/scenario 블록 차이 | `/kit-convert --name plan-prd-writer --force` |
| D2 | plan-stitch-integrator | agent | plan | routing-metadata 세부 | `/kit-convert --name plan-stitch-integrator --force` |
| D3 | plan-bridge | command | plan | copy/scenario 블록 | `/kit-convert --name plan-bridge --force` |
| D4 | plan-draft | command | plan | Feature 유형 판정 라인 | `/kit-convert --name plan-draft --force` |
| D5 | plan-prd | command | plan | 시나리오 C PCC | `/kit-convert --name plan-prd --force` |
| D6 | plan-review-criteria | skill | plan | copy 1 + PCC-06 블록 (confirmed: claude 3 / codex 0) | `/kit-convert --name plan-review-criteria --force` |

**재변환 프로토콜 (Investigation_Protocol Step 1.5 d~f)**:
1. 각 항목에 대해 `/kit-convert --name {identity} --force` 호출
2. pairing-registry 의 `lastSyncedAt` + `contentHash` 갱신
3. `git diff -- {codex_path}` 요약 출력
4. 재변환된 Codex 파일에 도메인 키워드 포함 여부 재검증

**승인 후 실행 순서 제안**:
1. Step A: drift 6건 `--force` 재변환 먼저 (이미 paired 상태 유지)
2. Step B: 위 §3.6-B (pairing-registry 갱신만 필요한 약 13건) 자동 등록
3. Step C: 위 §3.6-C (Codex 측 미존재) 실제 변환 — 단, 각 신규 자산은 REVIEW NEEDED 태깅
4. Step D: exception-registry 면제(§3.6-A) + copy paired-review(§3.6-D) skip 기록
5. Step E: `/kit-audit --category C7 --category C8` 최종 검증

---

## 5. 수동 검토 필요 (REVIEW NEEDED) 항목

자동 전환이 위험하거나 판단 근거가 부족한 항목. 리포트에 명시하고 사용자 승인 후에도 자동 처리 대상에서 제외 권장.

| # | Identity | 사유 |
|---|----------|------|
| R1 | copy-implementer | copy 도메인 신규 에이전트 — paired-review 분류 필요, codex-portability 신규 등록 필요 |
| R2 | core rules 7건 (coding-style, date-calculation, golden-principles, interaction, security, verification, security-no-hardcoded-secrets 제외한 전역 guidance) | 이미 EX-003~008 면제 처리되었으나 pairing-registry 에 `status: skip-via-exception` 또는 유사 항목 부재 — SSOT 일관성 위해 레지스트리 보정 필요 (지우거나 명시적 skip 엔트리 추가) |
| R3 | core rules 2건 (checkpoint-policy, task-id-naming) | Codex 측 파일은 존재하지만 codex-portability 에 미등록. strategy 확정 후 등록 필요 |
| R4 | agent-completion-cache-invalidate (hook) + agent-completion-cache-invalidate (skill) | hook+skill 쌍으로 존재 — 이름 중복 가능성. 자동 전환 시 identity 충돌 주의 |
| R5 | agent-telemetry-emit (hook) | ~/.claude/logs 경로 외부 상태 의존 — Codex에서 경로 재현 가능 여부 확인 필요 |
| R6 | plan-epic (command) + plan-epic-workflow (skill) + plan-epic-integrity (hook) | v2.4.0 Opt-in 기능 세트 — 일괄 전환 시 내부 상호 참조 정합성 확인 필요 |
| R7 | plan-state-sync (hook) | T-FSTATE-01 구현체 — Codex 런타임에서 frontmatter 동기 재현 가능 여부 평가 필요 |
| R8 | plan-revise (command) | T-REVP-01 최신 커맨드 — writer 에이전트 체이닝 전제 |

---

## 6. Exception-Registry 면제 현황 (처리 방침)

active 상태(총 6건)만 자동 skip 대상. resolved 는 보고에만 집계.

| ID | Component | Status | 본 sync 에서 처리 |
|----|-----------|--------|------------------|
| EX-001 | session-wrap-suggest | resolved | 이미 skill artifact 존재 — 변경 없음 |
| EX-002 | output-secret-filter | resolved | 이미 paired-direct — 변경 없음 |
| EX-003 ~ EX-008 | 6 core rules | resolved | AGENTS.md 머지 완료 — pairing-registry 레지스트리 교정만 REVIEW NEEDED (§5 R2) |
| EX-009 | security-no-hardcoded-secrets | **active** | skip (자동 건너뜀, 면제 기록) |
| EX-010 | copy-evidence-reminder | **active** | skip (§3.1 처리) |
| EX-011 | copy-doc-drift-check | **active** | skip |
| EX-012 | copy-scope-guard | **active** | skip |
| EX-013 | copy-variant-env-guard | **active** | skip |
| EX-014 | copy-gate-stop | **active** | skip |

---

## 7. 예상 처리 결과 요약

승인 후 전체 실행 시 예상 수치:

| 항목 | 건수 |
|------|------|
| drift 재변환 (--resync) | 6 |
| pairing-registry 신규 등록 (이미 Codex 측 존재) | ~13 |
| 실제 Codex 전환 (신규 변환) | ~24 |
| exception-registry 면제 skip | 6 (EX-009~014) |
| copy 도메인 paired-review skip | 10 |
| REVIEW NEEDED (수동 검토) | 최소 8 (R1~R8) |
| 총 처리 항목 | 49 unpaired + 6 drift = 55 |

최종 상태 목표: pairing-registry 일관성(C7 PASS) + 교차 참조 유효(C8 PASS) + exception active 면제 기록 + drift 0 건.

---

## 8. 승인 게이트

본 리포트는 아직 **실행 전** 상태입니다.

> **다음 단계 안내**: 사용자는 본 리포트(`docs/archive/2026-04-17/codex-sync/sync-report-2026-04-23.md`)를 검토한 후 아래 중 하나로 응답해주세요.
>
> - **"승인"** → Step 3 이후 자동 실행 (drift 6건 재변환 + 신규 전환 + exception skip + C7/C8 검증)
> - **"수정했음"** → 리포트 재로드 후 수정 반영하여 진행
> - **"거부"** → 실행 중단, 본 리포트에 "상태: 거부" 기록

**대기 중** — 본 에이전트 턴은 여기서 종료됩니다.

---

**상태: 승인 (2026-04-23)** — 사용자 승인. Investigation_Protocol Step 3~7 실행 개시.

---

## 9. 처리 제약 재확인

- `_archive/` 디렉토리는 전체 범위에서 제외됨
- paired 자산 덮어쓰기 금지 (단 drift 6건은 `--resync --force` 허용)
- `--auto-approve` 플래그 미사용 — 승인 게이트 필수
- exception-registry active 6건은 자동 skip
- 새 컴포넌트 설계 행위는 본 에이전트 범위 밖 (변환/등록만 수행)
