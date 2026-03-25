# Feature Standard 워크플로우

PRD 승인본을 입력받아 Feature Overview → Promote → Human Review → Feature Package를 자동 실행합니다.

> 참조: `.claude/skills/dev-feature-plan/SKILL.md`

## 입력
- PRD 승인본 경로 (필수): 인자 또는 대화에서 지정
- PRD 위치: `.plans/prd/10-approved/`

## 워크플로우 (3 Phase)

### Phase A: 자동 실행 (Overview + Promote + Consistency Check)
1. PRD 읽기 + Lite/Standard 판정 (`guide/dev-feature-guide/dev-feature-package-lint.md`)
2. Feature Slug + Key 결정 (`guide/dev-feature-guide/id-conventions.md`)
3. Feature Overview 생성 — Section 1~5, 10 초안 (`guide/dev-feature-guide/dev-feature-overview-template.md`)
3.5. PRD↔Overview Consistency Check — 5개 검증 병렬 (`guide/dev-feature-guide/cross-phase-consistency-check.md`)
4. Promote 산출물 생성 (00-context/)
5. Overview Section 6~7 채움 (Consistency Check + 결정 양식)
5.5. Phase A Integrity Report — Overview Section 6에 통합

### Phase B: Human Review
6. Feature Overview 제시 — Section 2(PRD 분석) 요약 + Section 6(검증) + Section 7(조정) 전문
7. 사용자 피드백 대기 (승인/수정 요청/거부)
   - **Section 7의 미결정 항목이 남아있으면 Phase C 진행 불가**

### Phase C: 자동 실행 (Feature Package)
8. Feature Package 생성 — 01-requirements ~ 10-release-checklist
   - `guide/dev-feature-guide/dev-feature-package.md` 기준
8.5. Overview↔Package Consistency Check — 6개 검증 병렬 (`guide/dev-feature-guide/cross-phase-consistency-check.md`)
8.6. Overview 갱신 — Section 1(REQ/TASK/TC 수), 6.2(DPC), 8~9 채움
9. AI 자가 린트 (`guide/dev-feature-guide/dev-feature-package-lint.md`)
10. 결과 요약 + 다음 단계 안내
   - 일관성 검증 결과 (PDC/AIR/DPC) 포함
   - 00-overview.md로 전체 구조 확인 후 개발 착수 권장

## 규칙
- Phase A~B: 코드/테스트/설정 변경 금지 (문서만)
- Phase B 승인 전 Phase C 진행 금지
- Lite 판정 시: Feature Plan Lite 1파일만 생성 후 종료
- SSOT: 요구사항 정의는 `01-requirements.md`에만
- 역전파: Feature Package 변경 시 `guide/dev-feature-guide/back-propagation-check.md` 참조
