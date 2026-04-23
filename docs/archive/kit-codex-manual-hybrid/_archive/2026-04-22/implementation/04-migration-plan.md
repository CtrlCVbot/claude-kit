# 04. Migration Plan — BC·SemVer·롤백·단계

> **결론**: claude-kit을 **v2.3.x → v2.4.0** 구간에 걸쳐 단계적으로 전환한다. v2.3.x는 shared 자산 **opt-in**(있으면 사용, 없으면 현행 유지), v2.4.0은 shared 자산 **필수**. 레지스트리 스키마는 필드 추가만(2.3.x) → 제거(2.4.0+)의 2단 전략으로 BC 경계를 명확히 한다. 기획 Phase 0~6을 TASK T-HYBRID-01~15에 매핑하고, 각 단계의 롤백 절차를 명시한다.

---

## 1. SemVer 영향 요약

| 버전 | 주요 변경 | BC 플래그 |
|------|---------|---------|
| **v2.3.x (minor+patch)** | `src/shared/` 도입(opt-in), 레지스트리 필드 추가, `/kit-validate --target shared`, `/kit-audit C11` | ✅ backward-compat |
| **v2.4.0 (major)** | shared manifest 필수, 레지스트리 정책 필드 제거, `src/codex/` A+B 제거 | ❌ **BC-2.4.0-01 ~ 05** |
| **v2.5.0+ (minor)** | 추가 매뉴얼·워크플로우 확장 | ✅ backward-compat |

SemVer 규칙: `.claude/rules/edit-coordinates-governance.md` §1 준수.

## 2. Breaking Changes (v2.4.0 공지 목록)

| ID | 항목 | 영향 | 마이그레이션 |
|----|------|------|------------|
| **BC-2.4.0-01** | `src/shared/manifests/*.json` 필수화 | shared 미존재 시 build 실패 | v2.3.x에서 미리 scaffold 생성 (`/kit-create shared ...` 혹은 수동) |
| **BC-2.4.0-02** | `exception-registry.json`에서 `docConstraints`, `officialSurface` 필드 제거 | 다운스트림 파싱 실패 가능 | v2.3.x에서 deprecation 경고 → v2.4.0에서 제거 |
| **BC-2.4.0-03** | `src/codex/` A+B 클래스 파일 제거 (107개) | Codex 런타임 탐색 경로 변경 | alias/router가 100% 흡수 (AC-6) |
| **BC-2.4.0-04** | 레거시 `/dev-*`, `/plan-*`, `/copy-*` 진입점을 router 경유로 통일 | 내부 구현 차이(외부 UX 동일) | router 미구현 시 fallback 경고 |
| **BC-2.4.0-05** | `.codex/agents/*.toml` 포맷 공식화 | 기존 `src/codex/{D}/agents/*.md` 제거됨 | shared/manifests/agents.json → toml 자동 생성 |

## 3. 단계별 계획 (Phase 0~6 → TASK 매핑)

### Phase 0 — 설계 승인 (v2.3.x 진입 전)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-01 | shared SSOT 경로 확정서 (H1 해소) | 본 패키지 `02:H1` 상태를 🟢 완료로 전환 |
| T-HYBRID-02 | Codex 공식 링크 스냅샷 검증 기록 (H2 해소) | 6개 URL × 검증일 × excerpt |
| T-HYBRID-03 | A/B/C 정량화 테이블 attachment 확인 (H3 해소) | `06-src-codex-abc-classification.md` 링크 유효성 |

**완료 기준**: `01-overview §4 AC` 중 AC-1 초안, AC-2/3/4/5/6/7/8 계획서 존재.

**롤백**: 문서만 작성, 롤백 불필요.

### Phase 1 — Shared 매뉴얼/매니페스트 추출 (v2.3.x)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-04 | `src/shared/manuals/` 스캐폴드 + 6개 매뉴얼 초안 | 디렉터리 존재 + 파일 수 ≥6 |
| T-HYBRID-05 | `src/shared/manifests/{workflows,agents,hooks}.json` 초안 | schema-shared-manifest 통과 |
| T-HYBRID-14 | `schema-shared-manifest.md` 작성 | `/kit-validate --target shared` 실행 가능 |

**완료 기준**: `/kit-audit C11` PASS + `02-current-state-audit.md` §5 Phase 1 출력 완료.

**롤백**: `src/shared/` 디렉터리 삭제 + 레지스트리 신규 필드 NULL 상태 유지. opt-in이므로 파이프라인 영향 없음.

### Phase 2 — AGENTS.md 재구성 (v2.3.x)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-06 | `src/templates/AGENTS.md.template` shared 링크 포함 재구성 | h3 섹션 + shared 매뉴얼 링크 무결성 |

**완료 기준**: AGENTS.md 신규 세션에서 워크플로우 진입 경로 설명 가능 (05 검증 매트릭스 AGENTS.md routing 항목).

**롤백**: `git revert` 단일 PR.

### Phase 3 — Codex 플러그인 축소 + router (v2.3.x → 2.4.0 준비)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-07 | `kit-sync-agent` 7-phase로 재설계 (Phase 1.5 신설) | 회귀 시나리오 RT-1/RT-2 PASS |
| T-HYBRID-08 | `/kit-convert` shared-first 전환 | RT-3 PASS |
| T-HYBRID-13 | 레거시 alias/router 100% 커버리지 | 6개 intent 전수 테스트 |

**완료 기준**: `02-gap-analysis §7.3` alias 100% + shared-direct 전략 유효.

**롤백**: router layer 비활성 플래그 (`KIT_ROUTER_ENABLED=false`) 도입 → 기존 경로 복원.

### Phase 4 — `.codex/agents/*.toml` 도입 (v2.3.x)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-09 | `/kit-analyze` 5-tier 분류 | shared-direct 엔트리 정상 출력 |
| T-HYBRID-10 | `.codex/agents/reviewer.toml`, `planner.toml` 배포 | Codex 런타임 탐색 성공 (AC-5) |

**완료 기준**: 2개 이상 agent가 `.codex/agents/*.toml`로 실제 동작.

**롤백**: `.codex/agents/` 디렉터리 삭제 + `src/codex/{D}/agents/*.md` 유지 (A+B 삭제 이전 상태).

### Phase 5 — 훅 정리 (v2.3.x)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-11 | `codex-portability.json`에 `hookPolicy` + `windowsSupport` 추가 | 17개 훅 전수 매핑 |

**완료 기준**: 모든 훅이 `keep|delete|hold` 중 하나 (hold=0). `codex-hook-compat.js` 최신화.

**롤백**: `hookPolicy` 필드만 제거 (코드 동작에는 영향 없음 — emitter가 기본값 `hold`로 간주).

### Phase 6 — 중복 제거 (v2.4.0 major release)

| TASK | 산출물 | 검증 |
|------|-------|------|
| T-HYBRID-12 | `src/codex/` A+B 파일 107개 제거 | `/kit-list --target codex` ≤ 50 파일 (C만 잔존) |
| T-HYBRID-15 | `scripts/setup.js` shared-first emitter로 재구성 | `/kit-audit C11` PASS + 빌드 성공 |

**완료 기준**: AC-2 + AC-8 달성. `docs/plan/kit-codex-manual-hybrid/04-migration-plan.md:103` Phase 6 완료 기준 충족.

**롤백**: 단일 PR revert 가능하도록 A+B 제거는 1개 PR로 몰아서 진행. 제거 전 `_archive/` 스냅샷 디렉터리 생성.

## 4. 다운스트림 마이그레이션 가이드 (mologado 등)

### 4.1 v2.3.x 업그레이드 (자동)

- `pnpm update claude-kit` → postinstall 훅이 레지스트리 필드 자동 추가
- 기존 `/kit-sync`, `/kit-convert` 사용 방식 변경 없음
- 추가 명령: `/kit-validate --target shared` (opt-in)

### 4.2 v2.4.0 업그레이드 (수동 확인 필요)

1. **사전 준비**: v2.3.x 최신에서 `/kit-audit C11`이 PASS임을 확인
2. **shared manifest 존재 확인**: `src/shared/manifests/*.json` 3개 파일 필수
3. **레거시 필드 의존성 제거**: 커스텀 스크립트에서 `exception-registry.json`의 `docConstraints` 읽는 코드 제거
4. **router 설정**: `CLAUDE.md`에 router 주소 (default: 내장)
5. **업그레이드 실행**: `pnpm update claude-kit@^2.4.0` + `/kit-audit C1~C11` 전수 확인

### 4.3 rollback 가이드

- v2.4.0 → v2.3.x: postinstall이 shared manifest 제거를 막지 않음. 레지스트리 필드 복원은 수동 (필드만 남고 값은 기존값)

## 5. 배포 계획

| 버전 | 예상 일정 | 주요 산출물 |
|------|---------|-----------|
| v2.3.1 | 2026-05 초 | Phase 0~1 (shared scaffold + manifest draft + schema + /kit-validate --target shared) |
| v2.3.2 | 2026-05 중 | Phase 2~3 (AGENTS.md 재구성, kit-sync 7-phase, kit-convert shared-first) |
| v2.3.3 | 2026-06 초 | Phase 4~5 (.codex/agents/*.toml, 훅 정리) |
| v2.4.0 | 2026-06 중 | Phase 6 (A+B 제거, setup.js 재구성) |

*일정은 권장치이며, 게이트 통과 여부에 따라 조정.*

## 6. 게이트 (각 버전별 배포 차단 조건)

| 버전 | 차단 조건 |
|------|---------|
| v2.3.1 | AC-1 + AC-7 미달 |
| v2.3.2 | AC-3 + AC-6 미달, 회귀 RT-1~RT-4 FAIL |
| v2.3.3 | `codex-portability.json`의 `hookPolicy=hold` 잔존 |
| v2.4.0 | AC-2 + AC-5 + AC-8 미달, 다운스트림 `mologado` smoke test FAIL |

## 7. 연결 문서

- 패키지 개요 → `01-overview.md`
- 구조 Gap → `02-gap-analysis.md`
- 파이프라인 영향 → `03-kit-sync-impact.md`
- TASK 상세 → `05-tasks/T-HYBRID-NN.md`
