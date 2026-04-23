# T-BRDG-01 — Bridge 5 파일 경량화

**제안**: P-5 (BRDG)
**원본 피드백**: I-11 (Medium), N-06
**우선순위**: 🟡 P2 Medium
**릴리스**: v2.5.0
**선행**: 없음
**후행**: T-PCC-01 (부분 연동)

## 목적

`00-context/` 5 파일(+ `08-epic-binding.md`)의 정보 중복(golden #13 위반)을 제거. IDEA/Draft/PRD 원문 인용 대신 "링크 + 1~2 문장 요약" 원칙. Feature Package 총 라인 수 40~50% 감소.

**BC 참고**: v2.5.0 minor 가능성 — archived Feature Package 는 강제 마이그레이션 **없음**.

## 수행 내용

1. `src/claude/plan/agents/plan-bridge-writer.md` 프롬프트 수정:

   ```markdown
   ## 5 파일 작성 원칙 (경량화)

   각 파일은 다음 원칙을 따른다:

   ### 원칙 1. 원문 전문 인용 금지
   IDEA/Draft/PRD 에 이미 존재하는 내용은 **인용하지 않음**. 링크 + 1~2 문장 요약으로 대체.

   ### 원칙 2. 링크 형식
   `[IDEA §1 참조](../../../../ideas/00-inbox/IDEA-....md#1-...)` 형식으로 근거 파일·섹션 직접 링크.

   ### 원칙 3. 각 파일 고유 정보만
   - `01-product-context.md`: Why (목적) + Epic 연결 요약 + 성공 지표 승계 (각 1~2 문장)
   - `02-scope-boundaries.md`: What (범위) + 제외 항목 + 기술 정정 SSOT 지정
   - `03-design-decisions.md`: How-decided (결정 결과) + 결정 로그 링크
   - `04-implementation-hints.md`: How-to-implement (TASK 힌트) + PR 분할 예상
   - `08-epic-binding.md`: Epic 메타 + Epic 지표 ↔ PRD REQ/NFR/SM 매핑 표 + §7 상태 동기 표 (자동 갱신)
   ```

2. 각 파일 템플릿 재설계:

   ```markdown
   # 01-product-context.md (경량화 후)

   ## 1. 목적
   [IDEA §1 요약 인용](path). **한 줄**: ...

   ## 2. Epic 연결
   Epic §2 지표 N 단독 충족 — 상세: [08-epic-binding.md §3-2](./08-epic-binding.md#3-2).

   ## 3. 성공 지표
   PRD §10 SM-1 ~ SM-N 승계 — 상세: [PRD §10](path).

   ---
   ```

3. 예상 라인 수 목표:
   - 현행 F1 기준: `01-product-context.md` ~150 줄 → 목표 ~50 줄
   - `02-scope-boundaries.md` ~200 줄 → 목표 ~80 줄 (기술 정정 SSOT 포함)
   - `03-design-decisions.md` ~120 줄 → 목표 ~40 줄
   - `04-implementation-hints.md` ~180 줄 → 목표 ~100 줄 (TASK 힌트 상세는 유지)
   - `08-epic-binding.md` ~150 줄 → 목표 ~80 줄 (매핑 표 중심)
   - **합계**: ~800 줄 → ~350 줄 (55% 감소)

4. Feature Package 기존 archive 처리:
   - 강제 마이그레이션 **없음**
   - 새 Feature Package 만 경량화 적용
   - `.plans/archive/` 내 기존 Feature Package 는 원본 보존

5. dev-implementer 규약 확인:
   - v2.5.0 출시 전 dev-implementer 계약 합의 — 경량화된 Feature Package 참조 가능 여부
   - 불가 시 v2.5.1 로 연기 고려

## AC

- [ ] `plan-bridge-writer.md` 에 "5 파일 작성 원칙 (경량화)" 섹션 존재
- [ ] 각 파일 재설계 템플릿 포함
- [ ] 신규 Feature Package 총 라인 수 **목표 40% 이상 감소** (F1 재실행 기준)
- [ ] 기존 archived Feature Package 는 원본 유지 (강제 마이그레이션 없음)
- [ ] dev-implementer 규약 확인 섹션 추가
- [ ] golden #13 (Document Non-Duplication) 준수 체크리스트 에이전트 프롬프트에 포함

## 파일

- 수정: `src/claude/plan/agents/plan-bridge-writer.md`
- 수정: `src/claude/plan/skills/plan-epic-workflow/templates/epic-binding.md` (경량화 버전)

## 리스크

- **R6**: 경량화 후 dev-implementer 참조 실패 → **완화**: v2.5.0 전 합의 + 필요 시 v2.5.1 로 연기 + archived 원본 유지

## 롤백

`plan-bridge-writer.md` revert → 기존 5 파일 인용 방식으로 복귀. 경량화된 새 Feature Package 는 재작성 필요.

## 검증 방법

```bash
# F1 Feature Package 재생성 (경량화 적용)
/plan-bridge f1-landing-light-theme-v2

# 라인 수 비교
wc -l .plans/features/active/f1-landing-light-theme-v2/00-context/*.md
# 기대: 합계 ≤ 480 줄 (기존 800 대비 40% 감소)

# 링크 기반 정보 접근성 확인
grep -c "\[.*§.*\]" .plans/features/active/f1-landing-light-theme-v2/00-context/01-product-context.md
# 기대: ≥ 3 개 (링크 패턴 존재)
```

## 보존 원칙

- **P-05 Bridge 5 파일 패키지 구조**: 5 파일 구조 유지, 내용만 경량화.
- **P-18 Cross-reference 링크 밀도**: 링크 사용 증가로 오히려 강화.
- **Golden #13 Document Non-Duplication**: 본 TASK 의 핵심 준수 원칙.
