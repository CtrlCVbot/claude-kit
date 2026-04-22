# Spike 워크플로우 에이전트 협력 계약

> **결론**: IMP-AGENT-004. `/plan-spike {slug}` 커맨드 또는 routing-metadata의 `spike: true` 감지 시 **plan-bridge-writer(주관) + dev-architect(read-only 판정자)** 조합으로 Spike 워크플로우를 운영한다. 신설 에이전트 없이 기존 2개 에이전트의 역할 확장으로 구현한다 (decision-log §5 "Over-engineering 방지" 준수).

**스펙**: `docs/plan/kit-agent-improvements/IMP-AGENT-004-spike-workflow-agents.md`
**상위 IMP**: IMP-KIT-038 (Spike 워크플로우 skill + command)
**통합 IMP**: IMP-KIT-036 (1일 예산 hard cap — skill 레벨 귀속)
**TASK ID 규칙**: IMP-KIT-015 (`SPIKE-{AREA}-NN` 형식)

---

## 1. 역할 분담

| 단계 | 주체 | 산출물 | 권한 |
|------|------|--------|------|
| 1. 진입 판정 | **plan-bridge-writer** | `spike-plan.md` (skill 템플릿 소비) | Write |
| 2. Vertical slice 설계 | **plan-bridge-writer** | `spike-plan.md §2 검증 대상` | Write |
| 3. Budget 감시 | **(사용자 + skill 체크리스트)** | spike-notes.md 타임스탬프 | 에이전트 비개입 |
| 4. Day-End Go/No-Go 보조 | **dev-architect** | 텍스트 판정 (edit-coordinates 없음) | Read-only |
| 5. 비계획 이슈 TASK 승격 | **plan-bridge-writer** | `.plans/ideas/00-inbox/SPIKE-{AREA}-NN.md` + backlog 갱신 | Write |
| 6. Spike 종료 브리지 | **plan-bridge-writer** | 기존 bridge 4종 문서 (§2 §3 추가) | Write |

---

## 2. 핵심 원칙

### 2.1 에이전트 신설 금지
별도 `plan-spike-writer` 등 신설 에이전트를 만들지 않는다. 이유:
- IMP-KIT-038 decision-log §8-4 "에이전트 신설 금지 원칙"
- 기존 plan-bridge-writer + dev-architect 조합으로 모든 단계 커버 가능
- Over-engineering 방지

### 2.2 Budget 감시는 에이전트가 아닌 skill 책임
- 1일 hard cap(IMP-KIT-036)은 **skill 체크리스트**와 **사용자 판단**의 영역
- plan-bridge-writer는 Budget을 추적·경고하지 않는다
- `plan-spike-workflow/SKILL.md` 의 `## Budget` 섹션에 타임스탬프 기록 책임이 있다

### 2.3 dev-architect는 read-only
- Day-End 판정 시 `edit-coordinates` JSON을 **생성하지 않는다**
- Read/Grep/Glob/Bash(git log)만 사용
- 텍스트 판정 1개(Go / No-Go / Extend 1일)만 반환

### 2.4 Extend 1일 루프 방지
- dev-architect는 `Extend 1일`을 **2회 연속 판정하지 않는다**
- 두 번째 Day-End에도 Inconclusive면 **No-Go로 강제**
- 무한 Spike 방지

---

## 3. 호출 플로우

```
사용자 /plan-spike {slug}  (또는 routing-metadata: spike=true)
       ↓
메인 세션 → plan-bridge-writer (Spike 모드)
              ├─ spike-plan.md 작성
              ├─ Vertical slice 정의
              └─ "Day-End에 dev-architect 호출 필요" 보고
       ↓
[사용자 1일 작업 — Budget 감시는 skill + 사용자]
       ↓
메인 세션 → dev-architect (Spike_Day_End_Mode)
              └─ 텍스트 판정 반환 (Go / No-Go / Extend 1일)
       ↓
메인 세션 → plan-bridge-writer (종료 브리지)
              ├─ bridge 4종 문서 §2 §3 갱신
              └─ 비계획 이슈 backlog 반영
```

**주의**: 메인 세션이 두 에이전트를 **직접 호출**한다. 에이전트 간 직접 호출은 없다. plan-bridge-writer는 "dev-architect 호출이 필요하다"고 **메시지만** 출력한다.

---

## 4. TASK ID 규칙

비계획 이슈는 `IMP-KIT-015` TASK ID 표준 준수:

- 형식: `SPIKE-{AREA}-NN` (예: `SPIKE-PERF-01`, `SPIKE-AUTH-03`)
- AREA: 영문 대문자 2~6자
- NN: 2~3자리 숫자
- 파일 위치: `.plans/ideas/00-inbox/{SPIKE-ID}.md`

plan-bridge-writer가 자동 채번. 중복 ID 감지 시 NN+1로 증분.

---

## 5. Lite Feature 거부

Spike 모드는 **Standard Feature 전용**:
- Lite Feature에서 Spike 진입 시 plan-bridge-writer가 거부
- 거부 메시지: "Spike 모드는 Standard Feature 전용. Lite는 `/plan-draft` 직후 바로 구현."
- 이유: Lite는 Spike 없이 직접 구현이 시간·리소스 측면에서 유리

---

## 6. 구현 의존성

본 룰은 아래 IMP 구현에 의존:

| IMP | 상태 | 제공 |
|-----|------|------|
| IMP-KIT-038 | 미구현 | `plan-spike-workflow` skill + `/plan-spike` 커맨드 + 템플릿 |
| IMP-AGENT-004 (본 룰) | 문서화 완료 | 에이전트 프롬프트 확장 (plan-bridge-writer Spike 모드 + dev-architect Spike_Day_End_Mode) |
| IMP-KIT-015 | shipped (v2.3.0) | TASK ID 형식 `SPIKE-*` |
| IMP-KIT-036 | 미구현 | Budget cap — skill `## Budget` 섹션 |

IMP-KIT-038 구현 시 본 룰을 skill 내부에서 참조한다. skill 미구현 상태에서도 에이전트 프롬프트는 본 룰을 따라 동작 준비 완료.

---

## 7. 검증 기준

- [ ] plan-bridge-writer의 `Spike 모드 (선택적)` 섹션 존재 (Investigation_Protocol 9번)
- [ ] dev-architect의 `<Spike_Day_End_Mode>` 섹션 존재
- [ ] 두 에이전트 모두 Budget 감시 책임 없음 (Over-engineering 방지)
- [ ] `SPIKE-{AREA}-NN` TASK ID 규칙 일치 (IMP-KIT-015)
- [ ] `Extend 1일` 2회 연속 차단 로직 명시

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-22 | 초안 — IMP-AGENT-004 구현 SSOT | Claude (메인테이너 역할) |
