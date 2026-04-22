# 02. Gap Analysis — 기획 ↔ 현행 비교

> **결론**: 기획(00~06)이 요구하는 **shared-manual-first hybrid** 구조 대비 현행 claude-kit은 **중복 자산 병렬 유지 + registry 기반 동기화** 방식으로 구현되어 있다. Phase 0 H-Gap 3건은 초안 문서화 수준, M-Gap 4건은 미해결 상태다. 가장 큰 구조적 차이는 `src/shared/` 부재와 `kit-sync` 파이프라인이 "공유 매뉴얼" 개념을 인식하지 못하는 점이다.

**비교 기준일**: 2026-04-21
**입력**: 기획 00~06 + FEEDBACK / 현행 구현 탐색 결과

---

## 1. 구조 비교 개요

| 영역 | 기획 요구 | 현행 구현 | 판정 |
|------|----------|----------|------|
| SSOT 위치 | `src/shared/manuals/` (canonical) | **존재하지 않음** | 🆕 **신규** |
| 공유 매니페스트 | `src/shared/manifests/{workflows,agents,hooks}.json` | **존재하지 않음** (registry는 별도 개념) | 🆕 **신규** |
| Claude 런타임 surface | `.claude/` 유지 | 현행 유지 | ✅ **유지** |
| Codex 런타임 surface | `AGENTS.md` + skills + `.codex/agents/*.toml` + 호환 훅 | `src/codex/{domain}/{category}/` 풀 복제 (149 파일) | 🔁 **대폭 축소** |
| Codex 플러그인 어셋 | 최소화 (공식 surface만) | agents/commands/skills 전범위 복제 | 🗑️ **제거(A+B)** |
| Rules | AGENTS.md 병합(fallback) | AGENTS.md.template h3 병합 완료 (Phase 2, EX-003~008) | ✅ **기존 fallback 유지** |
| Hooks | 공식 보장 범위 내 최소 | 8 direct + 1 skill fallback + 7 informational | 🔁 **정리(keep/delete/hold)** |
| 레거시 UX | alias/router 100% 유지 | 커맨드 원형 복제로 UX 유지 | 🔁 **라우터로 전환** |
| kit-sync 파이프라인 | (기획 미언급) | `/kit-sync` → 6-phase agent 오케스트레이션 | ⚠️ **기획 누락 → 본 패키지에서 설계** |

범례: 🆕 신규 / 🔁 변경 / ✅ 유지 / 🗑️ 제거 / ⚠️ 설계 공백

## 2. Phase 0 Gap 상태 (FEEDBACK 기준)

### H-Gap (High)

| ID | 항목 | 상태 | 설명 |
|----|------|------|------|
| **H1** | shared SSOT 경로 확정 | 🟡 초안 | `03-target-architecture.md:22-30`에서 `src/shared/manuals/` 선정 근거 제시, "example" 꼬리표 제거는 본 패키지에서 확정 |
| **H2** | Codex 공식 링크 검증 기록 | 🟡 초안 | `01-official-surface-and-constraints.md:7` 스냅샷 날짜(2026-04-21) 명시, 검증 증거(excerpt)는 본 패키지 TASK로 |
| **H3** | A/B/C 정량화 | 🟢 완료 | `06-src-codex-abc-classification.md:32-50` 149 파일 3/104/42 분류 완료 |

### M-Gap (Medium)

| ID | 항목 | 상태 | 설명 |
|----|------|------|------|
| **M1** | R5 레거시 UX 심각도 상향 | 🔴 미조정 | `05:33`에서 R5 = MEDIUM으로 표기. 본 패키지에서 HIGH로 상향 (01-overview §5 반영) |
| **M2** | pairing/exception registry 미래 | 🔴 미정의 | 기획 03/04에 언급 없음 → 본 패키지 `03-kit-sync-impact.md`에서 정의 |
| **M3** | 용어 혼용 | 🔴 미정리 | `manual-first hybrid` / `공유 매뉴얼` / `shared SSOT` 혼용 — 본 패키지 용어 통일 |
| **M4** | 검증 정량화 | 🟡 초안 | `05-verification-and-risks.md:13-21` 샘플 수치 일부 포함, 측정자·기한 누락 |

## 3. 자산 타입별 Gap

### 3.1 Agent 자산

| 항목 | 기획 | 현행 |
|------|------|------|
| Codex 공식 surface | `.codex/agents/*.toml` | `src/codex/{D}/agents/*.md` (XML→heading 변환) |
| 변환 주체 | (미정의) | `kit-converter` 스킬 + `agent-section-mapping.md` |
| REVIEW NEEDED | (미정의) | Write/Edit 도구 보유 시 자동 마커 |
| **Gap** | `.toml` 포맷으로 재설계 필요, 변환 규칙 업데이트 | — |

### 3.2 Command 자산

| 항목 | 기획 | 현행 |
|------|------|------|
| Codex surface | 공식 등가물 없음 → alias/router | `src/codex/{D}/commands/*.md` Entry Flow 변환 |
| 레거시 UX | `/dev-*`, `/plan-*`, `/copy-*` 100% 유지 | 현행도 유지(명칭 보존), but "Entry Flow" 형식 |
| **Gap** | alias/router 공식 레이어 도입, Entry Flow 문서는 shared 매뉴얼로 이관 가능 | — |

### 3.3 Skill 자산

| 항목 | 기획 | 현행 |
|------|------|------|
| Codex surface | skills/ 중심 (공식) | `src/codex/{D}/skills/{N}/SKILL.md` |
| 구조 | 공식 skill 포맷 | Codex 참고 사항 섹션 추가 |
| **Gap** | 이미 공식 surface에 부합, B 클래스 다수(표현 차이)는 shared로 링크 전환 | — |

### 3.4 Hook 자산

| 항목 | 기획 | 현행 |
|------|------|------|
| 정책 | 공식 보장 범위 내 최소 | exception-registry로 개별 strategy 관리 |
| 분류 | keep/delete/hold | paired-direct(8) + paired-fallback(1) + informational(7) |
| **Gap** | 공식 보장 범위 밖 훅 재분류 필요 (특히 informational 7개) | Phase 4 `codex-portability.json` 미완성 |

### 3.5 Rule 자산

| 항목 | 기획 | 현행 |
|------|------|------|
| Codex fallback | AGENTS.md 병합 | `AGENTS.md.template ### {N}` h3 병합 완료 |
| 아티팩트 무결성 | (미정의) | `/kit-audit C6` h3 존재 확인 |
| **Gap** | 기획과 현행이 **이미 일치**, shared 매뉴얼로 승격할지 여부 결정 필요 | — |

## 4. 레지스트리 Gap

| 레지스트리 | 기획 | 현행 | 결정 |
|-----------|------|------|------|
| `pairing-registry.json` | (미언급) | identity↔sibling 매핑 + status + hash | **유지** — shared 모드에서도 sibling 추적 필요 |
| `exception-registry.json` | "shared 매뉴얼 정책 문서"로 이관 제안(03:109-121) | 4-tier strategy SSOT | **부분 이관** — 정책은 매뉴얼, 인스턴스 데이터는 registry |
| `codex-portability.json` | (미언급) | Phase 4 component-level manifest | **유지 + 확장** — hook keep/delete/hold 필드 추가 |

## 5. 파이프라인/자동화 Gap

| 컴포넌트 | 기획 요구 | 현행 | Gap 유형 |
|---------|---------|------|---------|
| `/kit-sync` | (미언급) | 6-phase agent | ⚠️ 설계 공백 → 본 패키지 `03` |
| `/kit-convert` | (미언급) | 타입별 변환 규칙 | ⚠️ shared 인지 확장 필요 |
| `/kit-analyze` | (미언급) | 4-tier 전략 + 드리프트 | ⚠️ shared vs native 분류 추가 필요 |
| `/kit-validate` | (미언급) | 12 스키마 | ⚠️ `schema-shared-manifest.md` 신규 필요 |
| `scripts/setup.js` | 재구성(04:153) | Phase 4 컴포넌트 기반 emitter | 🔁 shared manifest 우선 |
| 훅 | 최소 보장 | 17개(guard + informational) | 🔁 정리 |

## 6. 정량 Gap 지표 (ABC 기반)

| 클래스 | 파일 수 | 총 149 중 | Gap 처리 방향 |
|--------|-------|----------|--------------|
| A (완전 중복) | 3 | 2.0% | shared로 이동 즉시 제거 (Phase 6) |
| B (표현 차이) | 104 | 69.8% | shared 매뉴얼 + alias/router, native 제거 (Phase 3+6) |
| C (런타임 차이) | 42 | 28.2% | native 유지, codex-portability.json 등록 확정 (Phase 4+5) |

Phase 6 완료 시 목표: `src/codex/` 42 파일(C만) ± α. **현재 대비 약 72% 자산 감축**.

## 7. 핵심 Gap 요약 (결론)

1. **구조 공백**: `src/shared/` 전체가 신규. Phase 1에서 스캐폴드 + 6개 매뉴얼 초안 + 3개 매니페스트 작성이 최우선.
2. **파이프라인 설계 공백**: 기획이 `kit-sync`를 언급하지 않아 본 패키지 `03-kit-sync-impact.md`에서 설계 보완. **AC-3** 달성의 핵심.
3. **alias/router UX 레이어**: 현재 명칭 보존 복제로 해결 중이나, shared 전환 시 router layer 공식화 필요. FEEDBACK M1 대응.
4. **훅 정책 재정렬**: informational 7개의 keep/delete/hold 결정이 Phase 5 선결 과제. `codex-portability.json` 필드 확장.
5. **레지스트리 역할 분리**: 정책 → shared 매뉴얼 / 인스턴스 데이터 → registry 3종 유지. 스키마 breaking change는 2.4.0+로 유예.

## 8. 연결 문서

- 파이프라인 영향 상세 → `03-kit-sync-impact.md`
- 전환 단계·BC → `04-migration-plan.md`
- 실행 TASK → `05-tasks/T-HYBRID-NN.md`
