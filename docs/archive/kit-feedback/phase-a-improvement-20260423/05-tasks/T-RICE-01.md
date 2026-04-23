# T-RICE-01 — `rice-lane-weighted-adjustment.md` 룰 신설

**제안**: P-4 (RICE)
**원본 피드백**: I-05 (High), N-05
**우선순위**: 🟠 P1 High
**릴리스**: v2.4.1
**선행**: 없음
**후행**: 없음

## 목적

RICE Lane 가중 조정 규칙을 SSOT 문서로 확립. `plan-idea-screener` 가 룰을 직접 참조하여 판정 투명성·재현성·일관성 확보.

## 수행 내용

1. `src/claude/plan/rules/rice-lane-weighted-adjustment.md` 신규 룰 작성:

   ```markdown
   # RICE Lane 가중 조정 규칙 (SSOT)

   > **결론**: Raw RICE 공식 판정 대비 Lite/Standard Lane 승격 조건. plan-idea-screener 는 본 룰을 직접 참조하여 판정. 사용자 질문 "이 가중은 어디 근거?" 에 대한 답.

   **관련 스킬**: plan-screening-workflow
   **참조 CLAUDE.md**: `idea-screening framework: rice` 기본값 및 임계값 오버라이드

   ---

   ## 1. 공식 Raw 임계값

   | 판정 | Raw RICE |
   |:---:|:---:|
   | Go | ≥ 10.0 |
   | Hold | 2.0 ~ 10.0 |
   | Kill | < 2.0 |

   ## 2. Lane 가중 조정 조건

   ### 2-1. Lite Lane 승격 (Raw Hold → Go)
   Raw RICE 가 Hold 범위(2.0~10.0) 인 경우, 다음 **3 조건 모두** 충족 시 Go 승격:
   - Lane = Lite (`triggers_matched = []`)
   - Effort ≤ 2 인·일
   - Confidence ≥ 80%
   - 선행 의존성 해소 효과 존재 (Epic 의존성 매트릭스 `→` 관계)

   ### 2-2. Standard Lane 승격 (Raw Kill/Hold 하단 → Go)
   Raw RICE < 2.0 이거나 Hold 하단(2.0~5.0) 인 경우, 다음 **4 조건 모두** 충족 시 Go 승격:
   - Lane = Standard (6 트리거 중 3+ 매칭)
   - Impact ≥ 3 (큼 이상)
   - Epic 필수 지표 직접 대응 (Single-충족 Feature)
   - 의존성 허브 역할 (다수 Feature 가 본 Feature 기반)

   ### 2-3. 승격 거부
   위 조건 미충족 시 Raw 판정 유지 (Hold 또는 Kill).

   ## 3. 로그 요구 (필수)

   plan-idea-screener 는 IDEA §8 Screening 섹션에 다음 필드 기록:

   - **Raw RICE 점수** (4 축 상세)
   - **공식 판정** (Go/Hold/Kill)
   - **Lane 가중 조정 여부** + 충족 조건 체크리스트
   - **최종 권장 판정**

   예시:
   ```
   ## 8. Screening (2026-04-23, plan-idea-screener)

   ### Raw RICE
   - Reach: 3 (중)
   - Impact: 2 (중)
   - Confidence: 85%
   - Effort: 2.15 인·일
   - Raw 점수: 2.37 (Hold)

   ### Lane 가중 조정
   - Lane: Lite (triggers_matched=[])
   - 조정 조건:
     - [x] Lane = Lite
     - [x] Effort ≤ 2 (2.15 는 근사치, 경계)
     - [x] Confidence ≥ 80% (85%)
     - [x] 선행 의존성 해소 효과 (F2 선행 필요)
   - 조정 후 판정: Go (Lite Lane 승격)

   ### 최종 권장 판정: Go
   ```

   ## 4. CLAUDE.md 임계값 오버라이드

   프로젝트별로 `CLAUDE.md` 에서 임계값을 오버라이드 가능 (기존 지원):

   ```markdown
   - idea-screening thresholds:
     - RICE: Go ≥ 12.0, Hold 3.0 ~ 12.0, Kill < 3.0
   ```

   본 룰의 가중 조정 조건은 프로젝트별 조정 대상이 **아님** (공통 SSOT).

   ## 5. 5axis 프레임워크

   `--framework=5axis` 지정 시 본 룰은 적용 **안 됨**. 5axis 는 별도 임계값(Go ≥ 70 / Hold 40~69 / Kill < 40) 사용. Lane 가중 조정은 RICE 전용.

   ## 6. 변경 이력

   | 날짜 | 내용 |
   |------|------|
   | 2026-04-23 | 초안 — T-RICE-01 (N-05 SSOT 확립) |
   ```

2. `src/claude/plan/agents/plan-idea-screener.md` 프롬프트 수정:
   - RICE 평가 섹션에 본 룰 참조 링크 추가
   - 로그 요구 4 항목을 출력 템플릿으로 명시
   - Lane 가중 조정 조건 체크리스트 포함

3. `src/claude/plan/skills/plan-screening-workflow/SKILL.md` 수정:
   - §가중 조정 섹션에 본 룰 링크
   - 기존 내부 룰 암묵 서술 제거 (SSOT 참조로 대체)

## AC

- [ ] `rice-lane-weighted-adjustment.md` 존재 (≥80 줄)
- [ ] 공식 Raw 임계값 + Lite/Standard 승격 조건 + 로그 요구 명시
- [ ] `plan-idea-screener.md` 에 룰 참조 링크 + 로그 템플릿 추가
- [ ] `plan-screening-workflow/SKILL.md` 에 룰 참조 추가
- [ ] 실제 screening 실행 시 출력에 Lane 가중 조정 체크리스트 포함
- [ ] CLAUDE.md 임계값 오버라이드 지원 유지

## 파일

- 신규: `src/claude/plan/rules/rice-lane-weighted-adjustment.md`
- 수정: `src/claude/plan/agents/plan-idea-screener.md`
- 수정: `src/claude/plan/skills/plan-screening-workflow/SKILL.md`

## 롤백

룰 파일 삭제 + 에이전트·스킬 참조 revert → 기존 에이전트 내부 룰로 복귀.

## 검증 방법

Dry-Run 세션에서 관찰된 F5, F1 케이스를 재현:

```bash
# F5: Raw 5.95, Lite Lane → Go 판정
/plan-screen IDEA-20260423-001 --framework=rice

# 출력에 다음 포함 확인:
# - Raw 점수: 5.95 (Hold)
# - Lane 가중 조정: Lite Lane 승격 조건 4 중 4 충족
# - 최종 판정: Go

# F1: Raw 1.89, Standard Lane → Go 판정
/plan-screen IDEA-20260423-002 --framework=rice

# 출력에 다음 포함 확인:
# - Raw 점수: 1.89 (Kill 하단)
# - Lane 가중 조정: Standard Lane 승격 조건 4 중 4 충족
# - 최종 판정: Go
```

## 보존 원칙

- **P-09 Epic 성공 지표 정량성**: "Epic 필수 지표 직접 대응" 조건이 정량 지표를 요구 → 강화.
- **P-02 의존성 매트릭스**: "의존성 허브 역할" 조건이 매트릭스 참조 → 강화.
