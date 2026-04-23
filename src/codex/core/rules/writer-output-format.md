<!-- kit-convert generated: 2026-04-23 -->
<!-- Claude sibling: src/claude/core/rules/writer-output-format.md -->
# Writer Agent Output Format (SSOT)

> **결론**: writer 계 에이전트 공통 보고 형식 (T-BRDG-02, IMP-AGENT-012). reviewer 계(IMP-AGENT-002) 표준의 writer 버전. 필수 5 섹션 + 선택 섹션으로 구성하여 사용자 파싱 편의 향상과 핸드오프 일관성을 확보한다.

**적용 대상** (writer 계 8 에이전트):

- `plan-idea-collector`
- `plan-idea-screener`
- `plan-draft-writer`
- `plan-prd-writer`
- `plan-bridge-writer`
- `plan-wireframe-designer`
- `plan-stitch-integrator`
- `plan-design-writer`

**스펙**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-BRDG-02.md`
**관련**: `docs/plan/kit-feedback/phase-a-improvement-20260423/05-tasks/T-SHOW-02.md` (§2-1 Phase 진행률 블록)

---

## 1. 필수 섹션 5 종

에이전트 보고 마지막에 아래 5 개 섹션을 이 순서로 포함한다.

### 1-1. 생성 / 수정 파일

| 파일 | 상태 | 크기 | 주요 섹션 |
|------|:---:|-----:|----------|
| {절대 경로} | 신규/수정 | XX KB | §1, §2, §N |

- 절대 경로 또는 리포 상대 경로 (일관성만 유지)
- 상태: `신규` / `수정` / `삭제`
- 크기: KB (반올림, 5 KB 미만은 `<5 KB`)
- 주요 섹션: 영향받은 §N 목록 (최대 5 개, 초과 시 `외 N 개`)

### 1-2. 주요 결정 (해당 시)

- **결정 항목 1**: 선택값 + 근거 2~3 문장
- **결정 항목 2**: 선택값 + 근거 2~3 문장

결정이 없으면 "해당 없음" 으로 한 줄 표기 후 섹션 생략 가능.

### 1-3. 검증 결과 (해당 시)

- **자동 검증**: PASS/FAIL + 이유 (스키마 검증, 정규식, 테스트 등)
- **수동 검증 권장**: 항목 리스트 (사용자가 눈으로 확인해야 할 곳)

검증 대상이 없으면 생략 가능.

### 1-4. 다음 단계

- **직접 다음 커맨드**: `/plan-...` 또는 사용자 행동
- **선행 조건**: (있으면 명시)
- **병렬 가능 여부**: 독립 실행 가능한 커맨드 (있으면 명시)

### 1-5. Agent Edit Race 주의

- **수정 파일 목록** (메인이 이어서 Edit 할 대상):
  - `{절대 경로 1}` — {간단 요약}
  - `{절대 경로 2}` — {간단 요약}
- 참조: [`verification.md` — Agent Edit Race](verification.md#agent-edit-race-read-cache)

메인 세션이 Edit 전 Read 를 재호출해야 하는 파일만 나열한다 (read-only 에이전트는 본 섹션 생략).

---

## 2. 선택 섹션

### 2-1. Phase 진행률 표준 블록 (T-SHOW-02)

Epic 연결 Feature 작업 시 에이전트 보고 말미에 다음 블록을 포함한다:

```markdown
---

### Phase {PHASE} 진행률

[▓▓▓▓▓▓▓▓░] {CURRENT}/{TOTAL} (Step {CURRENT} {STEP_TITLE} 완료)

다음: Step {NEXT} {NEXT_STEP_TITLE}
```

- **ASCII bar**: 9 블록 기준 (`▓` = 완료, `░` = 대기). {TOTAL} 이 9 가 아닐 때는 비율 변환.
- **조건부 포함**: `routing-metadata.md` 의 `epic-binding.epic_id != null` 인 경우에만.
- **Step 매핑**: 현재 Step 은 호출 컨텍스트(커맨드명 + routing-metadata) 로 판정. 예: `/plan-prd` → Step 6.
- **/plan-epic show 와 일관**: T-SHOW-01 의 Phase 진행률 표시 ↔ 본 블록은 동일한 §4 Phase 로드맵 Step 정의를 참조.
- **Epic 미연결 작업**: 본 블록 생략.

예시:

```markdown
### Phase A 진행률

[▓▓▓▓▓▓▓▓░] 8/9 (Step 8 Epic advance 완료)

다음: Step 9 /dev-feature + /dev-run (병렬 구현)
```

### 2-2. 기술 정정 발견 (draft-writer 등)

- 요구사항 수집 중 기존 문서의 기술 정정 또는 버그 발견 시
- 포맷: "정정 항목 / 발견 위치 / 권장 조치" 3 필드

### 2-3. 가중 조정 근거 (idea-screener)

- RICE Lane 가중 조정(T-RICE-01) 시 조정 이유 + 4 조건 체크리스트 결과

### 2-4. 수정 요청 응답 패턴 (T-REVP-01)

- Checkpoint "수정" 선택 시 에이전트가 재호출 받는 형식 명시
- 참조: [`checkpoint-policy.md §8`](checkpoint-policy.md#8-수정-요청-표준-응답)

---

## 3. 형식 규칙

- 각 섹션 제목: `### 1-N. 섹션명` 형식 (필수), `### 2-N. 섹션명` (선택)
- 표 사용 권장 (파일 목록, 결정 사항, 검증 결과)
- 3 문장 이하 요약 권장 — 상세는 파일 내용으로 위임
- 절대 경로 우선 (사용자 파싱 편의). 경로가 길 때만 리포 상대 경로 허용.
- 한글 주 + 영문 기술 용어 유지 (예: `routing-metadata.md`, `SSOT`)

---

## 4. 호환성

- 기존 에이전트 출력 형식과 **100% 하위 호환** (추가 섹션만, 제거 없음)
- 사용자 관점: 파싱 편의 향상, 해석 시간 감소
- 도구 관점: 메인 세션이 Agent Edit Race 섹션을 소비하여 Read 재호출 대상 자동 판별 가능

---

## 5. 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-04-23 | 초안 — T-BRDG-02 (IMP-AGENT-012 표준화) Phase A 피드백 Step 5 | Claude (메인테이너 역할) |
| 2026-04-23 | §2-1 Phase 진행률 블록 표준 추가 — T-SHOW-02 | Claude (메인테이너 역할) |
