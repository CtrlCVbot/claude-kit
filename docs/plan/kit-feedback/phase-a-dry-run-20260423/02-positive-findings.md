# 02. Positive Findings — 좋았던 점 (유지 대상)

> claude-kit v2.4.0 을 실제 사용하며 **유지·강화해야 할 특성** 18 건. 각 항목은 "관찰 → 증거 → 가치 → 이유" 구조.

---

## P-01. Epic Activation 기준 (3 중 하나 이상) 의 Over-engineering 가드 효과

- **관찰**: Epic 생성 전 `plan-epic-hierarchy.md` §2 의 3 활성 기준 (3+ Feature 같은 Theme / cross-cutting 요구 / 명시 순서·의존성) 중 하나 이상 충족 여부 검증
- **증거**: 본 세션에서 10 이슈 분석 후 "3+ Feature 동일 Theme" + "cross-cutting 접근성" + "Phase 의존성" 3 기준 모두 충족 확인 → Epic 생성 정당화
- **가치**: Feature 2 건 미만 Epic 생성 거부 규칙 + 독립 Feature 권장 플로우로 "만들고 나서 필요성 후회" 리스크 차단
- **이유**: 계층 구조의 함정 (과도한 조직화) 을 설계 단계에서 배제. Opt-in 원칙과 일관.

## P-02. 의존성 매트릭스 + Phase 기반 실행 순서

- **관찰**: `01-children-features.md` §2 의 의존성 매트릭스 (`✓`/`→`/`X`/`△`) + §3 Phase A/B/C 실행 순서가 Feature 간 충돌을 **설계 시점에 가시화**
- **증거**: F2 ↔ F5 `→` (F5 선행 후 F2) + F1 ↔ F5 `✓` (병렬) 결정이 Phase A F1+F5 병렬 + Phase B F2 투입 로드맵으로 자연스럽게 연결
- **가치**: 머지 충돌·리뷰 부담을 Phase 분리로 사전 예방. "언제 무엇을" 을 명확히 기록.
- **이유**: 다중 Feature 동시 진행 시 발생하는 혼돈을 정량화된 매트릭스로 해결.

## P-03. 3 중 판정 (Lane/시나리오/Feature 유형) 의 분기 명확성

- **관찰**: `plan-draft-writer` 가 IDEA + Screening 결과를 받아 Lane (Lite/Standard) + 시나리오 (A/B/C) + Feature 유형 (copy/dev/hybrid) 동시 판정
- **증거**: F5 → Lite/B/dev / F1 → Standard/A/dev. 각각 **PRD 필요 여부 자동 분기** (F5 생략, F1 필수).
- **가치**: 불필요한 PRD 작성 시간 (Lite 에 PRD 쓰는 낭비) 차단 + 시나리오별 후속 파이프라인 분기 자동화.
- **이유**: "모든 Feature 에 PRD 필수" 같은 획일적 규칙의 비효율 제거.

## P-04. Routing Metadata 의 후속 단계 자동화 기반

- **관찰**: `07-routing-metadata.md` JSON 형식 (copy-needed / reference-needed / hybrid / prd-required / epic-binding 등 12 필드) 로 각 Feature 의 파이프라인 경로를 기계 판독 가능한 형태로 기록
- **증거**: F5 `prd-required: false`, F1 `prd-required: true` 로 Step 6 진입 자동 판단
- **가치**: 향후 `/plan-bridge` 가 routing-metadata 읽어 자동 분기 가능 (hybrid dev Feature 는 `/copy-reference-refresh --reference-only` 안내 등)
- **이유**: IMP-AGENT-003 (archive guard) · IMP-AGENT-010 (binding 자동 갱신) · IMP-AGENT-011 (Epic 지표 인용) 체계와 연동.

## P-05. Bridge 5 파일 패키지 구조

- **관찰**: `00-context/{01-product-context, 02-scope-boundaries, 03-design-decisions, 04-implementation-hints, 08-epic-binding}.md` 5 파일로 구성된 Feature Package
- **증거**: 각 파일이 역할 분리 — Why (01), What (02), How-decided (03), How-to-implement (04), Epic-link (08)
- **가치**: dev-implementer 에이전트가 TASK 구현 시 필요한 정보를 파일별로 찾기 쉬움. 리뷰어도 섹션별 집중 가능.
- **이유**: 단일 큰 PRD 를 implementer 가 매번 전체 읽는 부담 제거.

## P-06. plan-reviewer PCC 5 종 검증의 품질 보장

- **관찰**: PRD 작성 직후 `plan-reviewer` 가 PCC-01 Epic binding / PCC-02 Draft↔PRD / PCC-03 요구사항 테스트 가능성 / PCC-04 User Story / PCC-05 SM 정량성 검증
- **증거**: 본 세션에서 F1 PRD 5/5 PASS 달성 + Low 2 이슈 발견 (모두 Non-Blocking). 거짓 통과 없이 실제 결함 가시화.
- **가치**: "PRD 작성 즉시 통과 선언" 을 방지. Iron Law (증거 기반 완료) 과 정합.
- **이유**: SDD Review Enforcement (golden #11) 를 PRD 품질에 자동 적용.

## P-07. Read-only 에이전트 분리 (plan-reviewer)

- **관찰**: `plan-reviewer` 는 Read/Grep/Glob 만 보유 (Write/Edit 없음) → 검증 결과만 보고
- **증거**: PCC 실행 시 메인 세션의 PRD·Draft·IDEA·Epic 캐시 invalidation 없음. 후속 Edit 즉시 가능.
- **가치**: 에이전트 edit race (verification.md Agent Edit Race 섹션) 회피
- **이유**: 권한 최소화 원칙 (도구 능력 기반 분류)

## P-08. Epic Checkpoint 정책의 Critical vs Non-critical 구분

- **관찰**: `checkpoint-policy.md` 에서 7 종 checkpoint 타입 정의 + Critical 화이트리스트 (destructive / external-api-call / breaking-change / initial-approval-gate) 4 건 명시
- **증거**: Step 4 Screening (`initial-approval-gate`, Critical) 은 `autoProceedOnPass` 무관 항상 정지. Step 5 Draft (`scope-confirmation`, non-critical) 는 PASS 시 자동 통과 가능.
- **가치**: 사용자 승인 필요 판단을 자동화 + 선택적 자동 진행으로 반복 작업 경감
- **이유**: "모든 checkpoint 에 Y 입력 요구" 의 피로 vs "자동 진행으로 중요 결정 누락" 간 균형.

## P-09. Epic Brief 의 성공 지표 5 건 정량성

- **관찰**: `00-epic-brief.md` §2 지표 5 건 모두 정량 측정 가능 형태 (`axe-core 0 violations`, `DELIVERY_MOCK ↔ UI 1:1 일치`, `편차 ≤ 2 px` 등)
- **증거**: F1 PRD Success Metrics 가 지표 4 를 직접 상속 + F1 SM-1 으로 `landing 전역 0 violations` 매핑
- **가치**: Epic → PRD → 구현 검증의 지표 계승 체인 작동
- **이유**: IMP-AGENT-011 (PRD 에 Epic 지표 인용) 이 자연스러움.

## P-10. IDEA 파일의 생애주기 일관성

- **관찰**: IDEA 파일 하나가 inbox → screened → approved 전이하며 §8 Screening · §9 Draft · §9-5 PRD · §10 Bridge 엔트리를 누적 추가
- **증거**: IDEA-20260423-001 이 등록 → screening → draft → bridge 까지 단일 파일에 **전체 이력 보존**
- **가치**: 하나의 Feature 여정을 단일 소스에서 파악 가능 (git log 없이도)
- **이유**: "과거 결정 추적성" 을 파일 하나로 제공.

## P-11. backlog.md 의 중앙 인덱스 역할

- **관찰**: `.plans/ideas/backlog.md` 가 모든 IDEA 의 상태·카테고리·Epic 연결을 단일 테이블로 집약
- **증거**: 본 세션에서 F5/F1 2 건이 `inbox → screened → approved` 전이하며 backlog 에서 상태 변화 한눈에 확인
- **가치**: `ls .plans/ideas/00-inbox/` 같은 원시 디렉터리 탐색 없이 상태 파악 가능
- **이유**: 디렉터리 기반 SSOT (00-inbox / 10-screening / 20-approved 경로) 의 한계를 테이블로 보완.

## P-12. Feature Slug 네이밍 일관성

- **관찰**: slug 패턴 `f{N}-{kebab-case-short}` (f5-ui-residue-cleanup, f1-landing-light-theme)
- **증거**: drafts / features/active / backlog / Epic children / 08-epic-binding 모두 동일 slug 참조
- **가치**: 파일 탐색 시 자동완성 쉬움 + grep 검색 편리
- **이유**: 자연스러운 컨벤션 정착.

## P-13. TeamCreate 구상 (Step 9 로드맵)

- **관찰**: Epic `01-children-features.md` §4 Step 9 에서 "TeamCreate team_name + dev-implementer × 2" 구조 미리 명시
- **증거**: 08-epic-binding.md §5 에 팀 소속 + 커맨드 예시 기록. F5/F1 Feature Package 각각 독립 경로 확보되어 병렬 진행 가능.
- **가치**: Phase A 구현 단계의 동시성 구조를 기획 단계에서 확정
- **이유**: 다자 dev-implementer 조합의 hub-and-spoke 패턴 (agents-v2.md) 실현 준비.

## P-14. IMP-AGENT-010: plan-idea-collector 의 Epic 자동 바인딩

- **관찰**: `/plan-idea --epic=EPIC-...` 실행 시 `plan-idea-collector` 가 IDEA 파일 + backlog.md + Epic `01-children-features.md` F{N} 섹션 IDEA 필드 동시 갱신
- **증거**: F5/F1 등록 시 Epic Children §1 의 `**IDEA**: 미등록` → `**IDEA**: [IDEA-...]` 자동 교체 확인
- **가치**: 수동 cross-reference 부담 제거 + binding 일관성 보장
- **이유**: Feature 추가 시 Epic 파일 갱신을 사람이 잊는 실수 차단.

## P-15. Tailwind 4 같은 기술 정정 조기 발견

- **관찰**: F1 Draft 작성 시 `plan-draft-writer` 가 `tailwind.config.ts` 미존재 발견 → §5.1 기술 정정 섹션 명시 → PRD 에 자동 전파
- **증거**: PRD §7.1 "Tailwind 4 아키텍처 정정 (중요)" 경고 blockquote + PCC-02 에서 정정 반영 확인
- **가치**: 실제 구현 전에 잘못된 전제 (IDEA 의 `tailwind.config.ts` 표현) 정정 → Step 9 에서 시간 낭비 차단
- **이유**: 에이전트가 프로젝트 파일 실제 확인하며 IDEA 가정 검증. 증거 기반 (golden #10) 작동.

## P-16. Epic 상태 머신의 명확성

- **관찰**: `draft → planning → active → completed → archived` 5 상태 + 각 전이 게이트 조건 명시 (plan-epic-hierarchy.md §4)
- **증거**: Step 3 (draft → planning) 게이트: `00-epic-brief.md` + `01-children-features.md` + 자식 IDEA 최소 1 건. Step 8 (planning → active) 게이트: 자식 Feature approved 최소 1 건. 본 세션에서 모두 준수.
- **가치**: "Epic 을 언제 advance 할지" 판단을 규칙으로 정량화
- **이유**: 주관적 "이 정도면 planning 이다" 판단 배제.

## P-17. Phase 별 세션 분리 권장

- **관찰**: `01-children-features.md` §4 "Phase 전환 규칙" 에서 "Phase A 완료 후 세션 종료, Phase B 는 별도 세션" 명시
- **증거**: 사용자 "페이즈 단위로 세션 끊기" 결정이 context 50% 규칙 (golden-principles #8) 과 일관
- **가치**: 대화 컨텍스트 윈도우 관리 + 각 Phase 실행 집중
- **이유**: 장기 작업을 단위로 쪼개 품질 유지.

## P-18. 문서 간 cross-reference 밀도 (링크 기반 네비게이션)

- **관찰**: 모든 생성 문서가 Epic ↔ IDEA ↔ Draft ↔ PRD ↔ Feature Package 를 상호 링크
- **증거**: F1 08-epic-binding.md §3-2 에서 Epic 지표 4 → PRD REQ/NFR/SM 매핑 테이블 존재. PRD §10 도 역방향으로 Epic 지표 인용.
- **가치**: 특정 결정의 근거·결과를 한 파일에서 다른 파일로 추적 가능
- **이유**: SSOT 아닌 경우에도 "인용 + 링크" 로 일관성 유지.

---

## 요약 — 무엇을 유지해야 하나

1. **계층 규율**: Epic Activation 기준 (P-01), 상태 머신 (P-16), Phase 세션 분리 (P-17)
2. **자동화 기반**: Routing metadata (P-04), IMP-AGENT-010 Epic 자동 바인딩 (P-14), Checkpoint 정책 (P-08)
3. **의존성 가시화**: 의존성 매트릭스 (P-02), 3 중 판정 (P-03), Feature Package 5 파일 (P-05)
4. **품질 보장**: plan-reviewer PCC (P-06), Read-only 분리 (P-07), 기술 정정 조기 발견 (P-15)
5. **추적성**: IDEA 생애주기 (P-10), backlog 인덱스 (P-11), cross-reference (P-18), slug 일관성 (P-12)
6. **정량성**: Epic 성공 지표 (P-09), PRD SM 정량 (P-06 로 검증)

위 특성들은 다음 버전 (v2.4.1, v2.5.0) 설계 시 **의도적으로 보존** 해야 한다.

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-23 | 초안 — Phase A Step 1~8 경험 기준 긍정 발견 18 건 |
