# RICE Lane 가중 조정 규칙 (SSOT)

> **결론**: T-RICE-01. Raw RICE 공식 판정 대비 Lite/Standard Lane 승격 조건. `plan-idea-screener` 는 본 룰을 직접 참조하여 판정. 사용자 질문 "이 가중은 어디 근거?" 에 대한 답.

**관련 에이전트**: `src/claude/plan/agents/plan-idea-screener.md`
**관련 스킬**: `src/claude/plan/skills/plan-screening-workflow/SKILL.md`
**참조 CLAUDE.md**: `idea-screening framework: rice` 기본값 및 임계값 오버라이드
**스펙**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RICE-01.md`

---

## 1. 공식 Raw 임계값

| 판정 | Raw RICE |
|:---:|:---:|
| Go | ≥ 10.0 |
| Hold | 2.0 ~ 10.0 |
| Kill | < 2.0 |

공식: RICE = (Reach × Impact × Confidence) / Effort (Intercom 공식)

---

## 2. Lane 가중 조정 조건

### 2-1. Lite Lane 승격 (Raw Hold → Go)

Raw RICE 가 **Hold 범위(2.0~10.0)** 인 경우, 다음 **4 조건 모두** 충족 시 Go 승격:

- [ ] Lane = Lite (`triggers_matched = []`)
- [ ] Effort ≤ 2 인·일
- [ ] Confidence ≥ 80%
- [ ] 선행 의존성 해소 효과 존재 (Epic 의존성 매트릭스 `→` 관계)

### 2-2. Standard Lane 승격 (Raw Kill/Hold 하단 → Go)

Raw RICE < 2.0 이거나 **Hold 하단(2.0~5.0)** 인 경우, 다음 **4 조건 모두** 충족 시 Go 승격:

- [ ] Lane = Standard (6 트리거 중 3+ 매칭)
- [ ] Impact ≥ 3 (큼 이상)
- [ ] Epic 필수 지표 직접 대응 (Single-충족 Feature)
- [ ] 의존성 허브 역할 (다수 Feature 가 본 Feature 기반)

### 2-3. 승격 거부

위 조건 미충족 시 Raw 판정 유지 (Hold 또는 Kill).

---

## 3. 로그 요구 (필수)

`plan-idea-screener` 는 IDEA §8 Screening 섹션에 다음 필드 기록:

- **Raw RICE 점수** (4 축 상세)
- **공식 판정** (Go/Hold/Kill)
- **Lane 가중 조정 여부** + 충족 조건 체크리스트
- **최종 권장 판정**

### 3-1. 로그 예시 (Lite 승격 사례)

```markdown
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
  - [x] Effort ≤ 2 (2.15 근사치, 경계)
  - [x] Confidence ≥ 80% (85%)
  - [x] 선행 의존성 해소 효과 (F2 선행 필요)
- 조정 후 판정: Go (Lite Lane 승격)

### 최종 권장 판정: Go
```

### 3-2. 로그 예시 (Standard 승격 사례)

```markdown
## 8. Screening (2026-04-23, plan-idea-screener)

### Raw RICE
- Reach: 5 (큼)
- Impact: 3 (큼)
- Confidence: 80%
- Effort: 6.32 인·일
- Raw 점수: 1.89 (Kill 하단)

### Lane 가중 조정
- Lane: Standard (triggers_matched=[트리거 3 건])
- 조정 조건:
  - [x] Lane = Standard
  - [x] Impact ≥ 3
  - [x] Epic 지표 4 단독 충족 (`landing 전역 0 violations`)
  - [x] 의존성 허브 역할 (F2/F3/F4 가 본 Feature 기반)
- 조정 후 판정: Go (Standard Lane 승격)

### 최종 권장 판정: Go
```

---

## 4. CLAUDE.md 임계값 오버라이드

프로젝트별로 `CLAUDE.md` 에서 Raw 임계값을 오버라이드 가능 (기존 지원):

```markdown
## plan 도메인 기본 설정

- idea-screening framework: rice
- idea-screening thresholds:
  - RICE: Go ≥ 12.0, Hold 3.0 ~ 12.0, Kill < 3.0
```

본 룰의 **가중 조정 조건은 프로젝트별 조정 대상이 아님** (공통 SSOT). Raw 임계값만 조정 가능.

---

## 5. 5axis 프레임워크

`--framework=5axis` 지정 시 본 룰은 **적용 안 됨**. 5axis 는 별도 임계값(Go ≥ 70 / Hold 40~69 / Kill < 40) 사용. Lane 가중 조정은 RICE 전용.

---

## 6. 근거 (피드백 출처)

- 피드백: `docs/plan/kit-feedback/phase-a-dry-run-20260423/03-pain-points.md` N-05
- 개선 제안: `docs/plan/kit-feedback/phase-a-dry-run-20260423/04-improvement-proposals.md` I-05
- TASK: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-RICE-01.md`

본 룰 적용 전: Lane 가중 조정 규칙이 에이전트 내부 판단 → SSOT 부재 → 사용자 질문 반복.
본 룰 적용 후: 판정 투명성·재현성·일관성 확보.

---

## 7. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-RICE-01 SSOT 확립 (N-05 대응) | Claude (메인테이너 역할) |
