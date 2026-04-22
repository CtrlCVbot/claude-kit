# kit-agent-improvements Decision Log

> **결론**: 패키지 기획·작성 과정에서 내린 결정과 **기각한 대안**을 기록한다. 향후 재검토 시 "왜 이렇게 설계했는가"를 추적할 수 있도록 근거·대안·파급효과를 병기한다.

**패키지**: `docs/archive/kit-agent-improvements-v2.3.1/`
**작성자**: Claude (메인테이너 역할)
**타깃 릴리스**: v2.3.1
**작성일**: 2026-04-22

---

## §1. 패키지 위치 결정

**결정**: `docs/archive/kit-agent-improvements-v2.3.1/` (claude-kit 리포 내부 `docs/plan/`)

**대안**:
- A. `.claude/docs/kit-improvements/20260422-agent-improvements/` — 기존 `kit-improvements/` 패키지 옆
- B. `docs/plan/kit-2.3.1-roadmap/` — 릴리스 번호 기반

**선택 근거**:
- 사용자 명시 경로 (`docs/plan/`) 준수
- 기존 `kit-2.3.0-roadmap/`, `kit-feedback-archiving/` 패키지와 동일 계층 → 로드맵 편입 시 전환 비용 최소화
- 릴리스 번호가 아닌 **주제명** 채택 (여러 릴리스에 걸쳐 지속 가능)

---

## §2. Track 구분

**결정**: 2 Track 설계
- Track 1 (4건): 기존 IMP-KIT-027~038 에이전트 관점 재해석
- Track 2 (5건): 카탈로그 관찰 기반 신규 제안

**대안**:
- A. Track 1만 (재해석 4건)
- B. Track 2만 (신규 5건)
- C. 단일 Track으로 혼합

**선택 근거**:
- Track 1은 **증거 기반** (dash-preview-phase3 커밋·파일·DVC 결과 인용)
- Track 2는 **현황 기반** (19개 에이전트 카탈로그 분석)
- 두 관점을 분리해 독자가 IMP의 **뿌리**를 이해할 수 있게 함 → 참조 패키지(`20260422-pipeline-kit-improvements`)의 축 분류 스타일 계승

---

## §3. "에이전트 신설 금지" 원칙 완화

**결정**: 원칙 유지하되 **IMP-AGENT-005(dev-implementer) + IMP-AGENT-006(copy-implementer)** 신설 허용

**원본 원칙 (20260422-pipeline-kit-improvements decision-log §5)**:
> 재사용 2회 이상 관찰 후 신설

**완화 근거**:
- dev-implementer: `/dev-run` TDD 루프가 TASK마다 구현 단계 반복 → 재사용 N회 이미 확보
- copy-implementer: 시나리오 A/B/C 모두에서 구현 단계 존재 → 재사용 N회 이미 확보
- 두 경우 모두 **기존 에이전트로 대체 불가** (verify/baseline 등은 특수 목적 전용)
- decision-log.md의 원칙은 **Over-engineering 방지**가 목적이지 **맹목적 금지**가 아님

**기각된 대안**:
- 메인 세션이 계속 직접 구현 유지 — 컨텍스트 포화 + 병렬화 불가

**후속 검증**: IMP-AGENT-009 텔레메트리로 005/006 호출 빈도 추적. 기대치 미달 시 v2.4.0에서 deprecated 검토.

---

## §4. IMP-KIT-028 + IMP-KIT-035 병합

**결정**: 두 IMP를 **IMP-AGENT-002(review-output-standardization)** 1건으로 병합

**근거**:
- 두 IMP 모두 `dev-code-reviewer` 출력 포맷을 건드림
- 별도 IMP로 두면 출력 계약 이중 정의 → 유지보수 비용 증가
- 병합 시 1개 스키마(`review-output.schema.json`)로 양측 요구사항 충족

**기각된 대안**:
- 분리 유지 — 계약 중복, 변경 시 양측 동기화 부담

---

## §5. IMP-KIT-036의 IMP-AGENT-004 통합

**결정**: IMP-KIT-036 (Spike 1일 예산 hard cap)을 IMP-AGENT-004 (Spike 워크플로우 에이전트 협력)에 **통합**

**근거**:
- 원본 패키지에서 이미 IMP-KIT-036을 IMP-KIT-038의 child로 분류
- 본 패키지는 IMP-KIT-038 → IMP-AGENT-004로 승계하므로 036도 함께 흡수가 자연스러움
- **Budget 감시는 에이전트가 아닌 skill 체크리스트 + 사용자 책임**으로 귀속 (에이전트 신설 금지 원칙 준수)

**기각된 대안**:
- IMP-AGENT-005 등 별도 "budget-monitor" 에이전트 신설 — Over-engineering

---

## §6. 보류·제외 IMP 처리

**결정**:
- 보류 2건 (IMP-KIT-029, IMP-KIT-031): 본 패키지 포함하지 않음. 원본 패키지에서 그대로 구현
- 제외 5건 (IMP-KIT-032, 033, 034, 036, 037): 본 패키지 포함하지 않음

**근거**:
- IMP-KIT-029/031은 **훅·규칙 레벨**이라 에이전트 관점 재해석이 **억지스러움**
- IMP-KIT-032/033/034/037은 커맨드·스킬·템플릿 레벨로 에이전트와 무관
- IMP-KIT-036은 §5에 따라 IMP-AGENT-004에 통합됨

**기각된 대안**:
- 7건 전부 Track 1에 편입 — over-engineering, 에이전트 재해석 약한 IMP도 포함하면 SSOT 오염

---

## §7. v2.3.1 타깃 결정

**결정**: v2.3.1 (patch) 타깃

**대안**:
- A. v2.3.0 보강 — 이미 shipped된 로드맵과 충돌
- B. v2.4.0 (minor) — 본 패키지 규모가 그 정도는 아님
- C. 독립 스트림 — 로드맵 외부. 추적 어려움

**선택 근거**:
- 사용자 명시 결정 (v2.3.1)
- patch 수준이 적절 — Breaking Change 4건(BC-2.3.1-01~04)은 모두 **옵트인 방식**, 기존 동작 중단 없음
- v2.3.0과의 시간적 근접성 유지

**Breaking Change 허용 근거**:
- BC-2.3.1-01 (review-output 스키마): 기존 소비자 없음 (수동 읽기만)
- BC-2.3.1-02 (dev-implementer 신설): 기존 호출자 없음
- BC-2.3.1-03 (copy-implementer 신설): 기존 호출자 없음
- BC-2.3.1-04 (frontmatter 확장): 자동 마이그레이션 스크립트 + 훅 경고(v2.3.1) → 차단(v2.4.0) 2단계

---

## §8. IMP 작성 형식

**결정**: 참조 패키지(`20260422-pipeline-kit-improvements`) §5 작성 원칙 계승

**공통 섹션**:
1. 결론 (1줄)
2. 메타데이터 (축, 우선순위, 공수, BC, 릴리스)
3. 문제 (증거 기반)
4. 해결책
5. 관련 IMP와의 관계
6. 구현 범위 (파일 + 테스트)
7. ROI
8. 수락 기준
9. 변경 이력

**분량**: 150~400 단어 목표. 코드 예시는 diff·JSON 블록 형식.

**기각된 대안**:
- 자유 형식 — 일관성 부족, 리뷰 비용 증가

---

## §9. 문서 외부 SSOT 생성 여부

**결정**: 본 패키지는 **문서만** 생성. 실제 스키마·훅·에이전트 파일은 **구현 단계에서 별도 PR**

**근거**:
- "설계 없이 코딩 금지" 원칙 (golden-principles #9)
- 본 패키지는 **계획 단계** — 각 IMP 수락 기준에 따라 구현은 별건 PR로 진행
- 사용자 검토·승인 후 구현 착수

**예외 없음**. 본 디렉터리에는 마크다운 문서만 존재.

---

## §10. 네이밍 규칙

**결정**:
- IMP 번호: `IMP-AGENT-NNN` (기존 `IMP-KIT-NNN`과 구분)
- 파일명: `IMP-AGENT-NNN-{slug}.md`
- 스키마 버전: 기존 거버넌스(`edit-coordinates-governance.md`) SemVer 규칙 준수

**근거**:
- `IMP-KIT-*` 네임스페이스와의 충돌 방지
- 도메인 구분으로 검색·필터링 용이

---

## §11. 변경 이력

| 날짜 | 내용 | 작성자 |
|---|---|---|
| 2026-04-22 | 초안 — 11개 결정 기록 | Claude (메인테이너 역할) |
