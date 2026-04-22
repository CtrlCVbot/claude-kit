# 01. Overview — kit-codex-manual-hybrid 구현 패키지

> **결론**: `docs/plan/kit-codex-manual-hybrid/`의 기획(00~06, FEEDBACK)을 claude-kit 현행 구현에 적용하기 위한 **구현 계획 패키지**. 현재의 "duplication-heavy" 구조(`src/claude` + `src/codex` 병렬 복제)를 `shared-manual-first hybrid`로 전환하며, 이 과정에서 `kit-sync` 파이프라인 전반의 재설계가 필수적이다.

**패키지 위치**: `docs/plan/kit-codex-manual-hybrid/implementation/`
**생성일**: 2026-04-21
**상위 기획**: `../README.md`, `../00-executive-summary.md` 외

---

## 1. 배경

- 현행 claude-kit은 `src/claude/` 162 파일 / `src/codex/` 149 파일로 **중복 자산을 병렬 유지**한다.
- Codex 공식 surface(plugins = skill/app/MCP, AGENTS.md, `.codex/agents/*.toml`, hooks)와 현행 구현 간 차이가 누적되어 유지 비용과 드리프트 위험이 증가.
- `src/codex` ABC 분류 결과 **A(2.0%) + B(69.8%) = 71.8%가 제거/공유 전환 가능** (06-src-codex-abc-classification.md:32-50).
- 기획(00~06) 자체는 **아키텍처 원칙** 중심이며 `kit-sync`/`kit-convert`/`kit-analyze`/`kit-validate` 커맨드 파이프라인에 대한 **명시적 변경 계획이 누락**되어 있다 → 본 패키지가 그 빈틈을 메운다.

## 2. 목표

1. 기획 Phase 0의 **3대 H-Gap**(SSOT 경로 확정 / 공식 링크 스냅샷 / A/B/C 정량화) 해소 상태를 반영한 실행 계획 수립.
2. 현행 `kit-sync` 파이프라인을 **shared-aware**로 재설계 — `src/shared/manuals/` + `src/shared/manifests/`를 1차 입력으로 인식.
3. Breaking Change(BC) 범위·SemVer 영향·롤백 절차 명문화.
4. Phase 1~6에 **각 Phase별 실행 TASK (T-HYBRID-NN)** 매핑.

## 3. 범위

### In-Scope

- `scripts/setup.js` 재구성 (shared manifest 기반 emitter)
- `src/claude/core/commands/kit-*.md` 커맨드 업데이트 (shared SSOT 인지)
- `src/claude/core/agents/kit-sync-agent.md`, `kit-maintainer.md` 동작 변경
- `src/claude/core/skills/kit-converter/`, `kit-scaffolding/`, `kit-validation/` 규칙 확장
- 3개 registry(`pairing-registry.json`, `exception-registry.json`, `codex-portability.json`) 스키마 확장 / 축소 결정
- `.codex/agents/*.toml` 도입 및 레거시 alias/router 100% 유지
- 훅 A/B/C 분류에 따른 정리 (keep/delete/hold)

### Out-of-Scope

- 업스트림 Codex 공식 API 변경 추적 (snapshot 2026-04-21 기준 고정, 재검증은 별도 트리거)
- 다운스트림 프로젝트(mologado 등)의 호환성 테스트 — 본 패키지는 claude-kit 내부 변경만 다룸 (검증 트리거는 포함)
- 신규 도메인 추가 (core/dev/plan/copy 외)

## 4. 수용 기준 (Acceptance Criteria)

기획 `05-verification-and-risks.md:13-21`의 검증 매트릭스를 채택하고, 구현 관점에서 다음을 추가:

| ID | 기준 | 증거 |
|----|------|------|
| AC-1 | `src/shared/manuals/` 경로 확정 + 최소 6개 매뉴얼 초안 존재 | 파일 목록 + README 링크 |
| AC-2 | `src/codex/` A+B 클래스 파일 제거, C만 잔존 (목표 ≤50 파일) | `/kit-list --target codex` 출력 |
| AC-3 | `kit-sync` 파이프라인이 shared manifest를 1차 입력으로 처리 | `kit-sync-agent.md` diff + `/kit-sync --dry-run` 출력 |
| AC-4 | AGENTS.md 템플릿이 shared 매뉴얼을 참조 링크로 포함 | `src/templates/AGENTS.md.template` diff |
| AC-5 | `.codex/agents/*.toml` ≥2개 실제 배포 + Codex 런타임 검색 확인 | Codex 실행 로그 |
| AC-6 | 레거시 `/dev-*`, `/plan-*`, `/copy-*` 6개 intent → alias/router 100% 해석 | 테스트 케이스 + 로그 |
| AC-7 | `kit-validate` 신규 스키마(`schema-shared-manifest.md`) 통과 | `/kit-validate --target shared` PASS |
| AC-8 | Phase 6 완료 시 `kit-audit C7+C8+C10` 전부 PASS (regression 0건) | 감사 로그 |

## 5. 리스크 (상위 5개)

| ID | 심각도 | 설명 | 완화 |
|----|--------|------|------|
| R-IMP-1 | HIGH | `kit-sync` 파이프라인 재설계 중 기존 다운스트림(`mologado` 등) 3개 registry 구조 의존성 파손 | 스키마 backward-compat 유지(추가만, 제거 지연), 마이그레이션 가이드 배포 |
| R-IMP-2 | HIGH | shared SSOT 추출 과정에서 Claude 런타임 동작 회귀 (매뉴얼화 누락) | Phase 1 완료 후 `/kit-audit C10` 드리프트 검증을 차단 게이트로 지정 |
| R-IMP-3 | MEDIUM | `.codex/agents/*.toml` 공식 surface가 Windows에서 제한적으로 동작 | 한 파일부터 점진 배포, 실패 시 alias/router 경유 fallback 유지 |
| R-IMP-4 | MEDIUM | `setup.js` 재구성 중 hook `compatible=true` 가정 오류 | Phase 4 `codex-portability.json` 명시 등록 우선, hook 전환은 그 이후 |
| R-IMP-5 | HIGH | 레거시 커맨드(`/dev-*`, `/plan-*`, `/copy-*`) UX 손실 — FEEDBACK M1 | Phase 3 완료 기준에 alias 100% 포함, 사용자 intent 6개 전수 테스트 |

## 6. 패키지 구조

| # | 파일 | 역할 |
|---|------|------|
| 01 | `01-overview.md` | **본 문서** — 진입점 |
| 02 | `02-gap-analysis.md` | 기획 ↔ 현행 차이 분석 |
| 03 | `03-kit-sync-impact.md` | `kit-sync` 파이프라인 영향 (핵심 산출물) |
| 04 | `04-migration-plan.md` | BC·SemVer·롤백·단계 |
| 05 | `05-tasks/T-HYBRID-NN.md` | 원자 실행 단위 |

## 7. 참조

- 상위 기획: `docs/plan/kit-codex-manual-hybrid/00-executive-summary.md`
- 현행 구조 감사: `docs/plan/kit-codex-manual-hybrid/02-current-state-audit.md`
- Phase 단계: `docs/plan/kit-codex-manual-hybrid/04-migration-plan.md`
- 리스크: `docs/plan/kit-codex-manual-hybrid/05-verification-and-risks.md`
- 피드백: `docs/plan/kit-codex-manual-hybrid/FEEDBACK-2026-04-21.md`
- TASK ID 규칙: `.claude/rules/task-id-naming.md`
