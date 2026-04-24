# 08. Exception Handling

> **`src/exception-registry.json` 14개 항목의 Phase 2 재생성 처리 결과.** 각 exception 이 어떤 strategy 로 변환됐고 결과 artifact 가 어디에 있는지 정리.

## Exception 전체 현황

| Status × Strategy | 개수 | 목록 |
|-------------------|:---:|------|
| resolved / paired-fallback | 7 | EX-001, EX-003 ~ EX-008 |
| resolved / paired-direct | 1 | EX-002 |
| active / paired-direct | 1 | EX-009 |
| active / paired-review | 5 | EX-010 ~ EX-014 |
| **합계** | **14** | — |

**주의**: exception-registry 는 본 작업에서 **read-only** 로 처리했다. 값 변경 없음. Phase 2 재생성은 각 exception 의 strategy 에 따라 적절한 artifact 를 생성했을 뿐.

## EX-001: session-wrap-suggest (resolved / paired-fallback / skill)

| 항목 | 값 |
|------|---|
| component | session-wrap-suggest |
| rule | hook-fallback |
| fallbackTarget | skill |
| strategy | paired-fallback |
| status | resolved |

**배경**: Stop hook 은 Codex 공식 지원이지만 `~/.claude/.session-stats.json` 상태 파일 의존이 Codex runtime 에서 재현 불가.

**처리**: Codex hook 파일 생성 **안 함**. 대신 `src/claude/core/skills/session-wrap-suggest/SKILL.md` 가 fallback artifact 로 존재. Codex runtime 에서도 이 skill 을 읽어 동일 의도 재현 가능.

**검증**: fallback artifact 파일 존재 확인됨 (Phase 3 C7 감사 통과).

## EX-002: output-secret-filter (resolved / paired-direct)

| 항목 | 값 |
|------|---|
| component | output-secret-filter |
| rule | hook-direct |
| strategy | paired-direct |
| status | resolved |
| officialSurface | hooks |

**배경**: 도구 출력에서 시크릿 (API key, token, password) 마스킹. Codex Hooks 공식 기능 범위 안에서 구현 가능.

**처리**: `src/codex/core/hooks/output-secret-filter.js` 생성 (contentHash `055c1f12`). 내용은 Claude 원본과 동일 + Codex 등록 포맷 주석 + CODEX_SANDBOX 환경변수 조건 분기.

**주의**:
- Windows 에서는 현재 비활성화
- experimental on Codex — 실제 runtime 에서 PostToolUse 매칭 동작 확인 필요
- `CLAUDE_REMOTE_SESSION` 환경변수 설정 시에만 활성화 (opt-in)

## EX-003 ~ EX-008: Rule Fallbacks (resolved / paired-fallback / agents-guidance)

6개 core rules 가 `AGENTS.md.template` inline merge 전략:

| ID | component | rule |
|----|-----------|------|
| EX-003 | coding-style | rule-fallback |
| EX-004 | date-calculation | rule-fallback |
| EX-005 | golden-principles | rule-fallback |
| EX-006 | interaction | rule-fallback |
| EX-007 | security | rule-fallback |
| EX-008 | verification | rule-fallback |

**배경**: Codex Rules 는 exec / approval policy 형식이라 Claude 의 guidance-style rule 과 1:1 매핑 불가. 대안으로 `src/templates/AGENTS.md.template` 의 h3 섹션 (`### coding-style` 등) 로 merge 하여 의미 보존.

**처리**: Codex discrete 파일 **생성 안 함**. Claude source 만 존재.

**⚠️ 현재 상태 문제**:
- `src/templates/AGENTS.md.template` 은 **7라인 placeholder 뿐** (`{{PROJECT_NAME}}`, `{{KIT_MANAGED_SECTION}}` 등)
- 각 rule 에 대응하는 `### coding-style` 등 h3 섹션이 **실제로 존재하지 않음**
- Phase 3 C7 감사에서 WARN 6건으로 식별 (pre-existing)
- 별도 세션에서 AGENTS.md.template 에 섹션 추가 필요 ([10 Known Issues](10-known-issues.md))

## EX-009: security-no-hardcoded-secrets (active / paired-direct)

| 항목 | 값 |
|------|---|
| component | security-no-hardcoded-secrets |
| rule | rule-direct |
| strategy | paired-direct |
| status | **active** (미해결) |

**배경**: security.md 의 partial section — "No hardcoded secrets" 규칙을 Codex Rules exec-policy 로 전환 후보. pre-commit regex 자동 감지로 구현.

**⚠️ 현재 상태 문제**:
- exception-registry: `strategy=paired-direct` + `status=active`
- pairing-registry: entry 존재하되 `status=codex-skip`
- **두 레지스트리의 의도 불일치** → Phase 3 C7 감사에서 FAIL 판정
- 설계 결정 필요: strategy 를 `paired-fallback` 으로 바꾸거나 pairing status 를 `paired` 로 올려 실제 codex 파일 생성

**현 시점 처리**: Codex 파일 **생성 안 함** (pairing status=codex-skip 우선)

## EX-010 ~ EX-014: Copy Hooks (active / paired-review)

5개 copy 도메인 hook 이 Codex runtime 검증 대기 상태:

| ID | component | rule | 설명 |
|----|-----------|------|------|
| EX-010 | copy-evidence-reminder | hook-review | evidence 상태 리마인더 |
| EX-011 | copy-doc-drift-check | hook-review | 문서 drift 검사 |
| EX-012 | copy-scope-guard | hook-review | copy 작업 범위 가드 |
| EX-013 | copy-variant-env-guard | hook-review | variant / host 환경변수 가드 |
| EX-014 | copy-gate-stop | hook-review | gate 정지 hook (Stop event 의존) |

**배경**: copy 도메인이 2026-04 최근 도입. Codex hooks 공식 API 가 experimental 이며, 복잡한 상태 의존 로직 (evidence manifest 파싱, variant 매핑 등) 을 Codex runtime 에서 어떻게 재현할지 미정.

**처리**: Codex 파일 **생성 안 함** (pairing status=codex-skip). 각 exception 은 `paired-review` strategy 로 표시하여 "향후 Codex runtime 검증 후 생성" 의도 보존.

**향후 경로** (12 Followups 참조):
- Codex runtime 에서 PreToolUse/PostToolUse/Stop 매칭 + Bash scope 동작 확인
- 검증 통과 시 exception `status: active → resolved` + pairing `status: codex-skip → paired`
- Codex 전용 hook 파일 생성 + REVIEW NEEDED marker 삽입

## Exception vs Pairing vs Portability 관계 정리

| 레지스트리 | 역할 | Phase 2 처리 |
|-----------|------|-------------|
| `src/exception-registry.json` (14 entries) | 변환 예외 승인 + 전략 SSOT | **read-only, 변경 없음** |
| `src/pairing-registry.json` (125 entries) | Claude ↔ Codex 쌍 매핑 + sync 메타데이터 | 114 paired 엔트리의 `lastSyncedAt` + `contentHash` 갱신 |
| `src/claude/_meta/codex-portability.json` (42 entries) | 전환 가능성 매트릭스 (4-tier strategy 분포) | **read-only, 변경 없음** |

## Phase 2 Exception 처리 결과 요약

| Exception | 결과 | Codex 파일 |
|-----------|:---:|:---:|
| EX-001 session-wrap-suggest | skill fallback 유지 | ❌ (Claude skill 만) |
| EX-002 output-secret-filter | paired-direct 변환 | ✅ `src/codex/core/hooks/output-secret-filter.js` |
| EX-003 coding-style | agents-guidance fallback | ❌ (AGENTS.md.template inline 대상, 미작성) |
| EX-004 date-calculation | 상동 | ❌ |
| EX-005 golden-principles | 상동 | ❌ |
| EX-006 interaction | 상동 | ❌ |
| EX-007 security | 상동 | ❌ |
| EX-008 verification | 상동 | ❌ |
| EX-009 security-no-hardcoded-secrets | codex-skip 유지 | ❌ |
| EX-010 copy-evidence-reminder | codex-skip 유지 | ❌ |
| EX-011 copy-doc-drift-check | 상동 | ❌ |
| EX-012 copy-scope-guard | 상동 | ❌ |
| EX-013 copy-variant-env-guard | 상동 | ❌ |
| EX-014 copy-gate-stop | 상동 | ❌ |

**총 14건 중 실제 Codex 파일 생성 = 1건 (EX-002)**. 나머지 13건은 fallback artifact 또는 skip.

## 참조

- [02 Conversion Overview](02-conversion-overview.md) — 4-tier strategy 설명
- [10 Known Issues](10-known-issues.md) — EX-009 설계 결정 + AGENTS.md.template 섹션 누락
- [12 Followups](12-followups.md) — Codex runtime 검증 + exception 상태 전환
