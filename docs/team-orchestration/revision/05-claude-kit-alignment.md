# Team Orchestration ↔ claude-kit 정합성 메모

> 목적
> - Team Orchestration revision이 기존 claude-kit guide/commands/blueprint-fast-track 계약과 어디서 맞물려야 하는지 고정한다.
> - 이 문서는 원문 재작성의 바깥 경계 조건을 잠그는 alignment 문서다.

---

## 1. 상위 SSOT

이번 revision이 의존하는 상위 SSOT는 아래다.

| 항목 | 상위 SSOT |
|------|-----------|
| Blueprint intake 규칙 | `docs/guide/12-blueprint-fast-track.md` |
| PRD 10섹션 / Lite-Standard | `docs/guide/04-feature-planning.md` |
| Bridge / execution handoff | `docs/guide/06-dev-handoff.md` |
| Phase B / Phase E 의미 | `docs/guide/08-dev-workflow.md` |
| 용어 정의 | `docs/guide/10-glossary.md` |
| 최근 개선 방향 | `.plans/blueprints/ds-customizer/08-pipeline-entry-strategy-final.md`, `.plans/blueprints/ds-customizer/10-claude-kit-improvement-synthesis.md` |

---

## 2. Team Orchestration이 따라야 할 계약

### 2.1 입력 계약

Team Orchestration은 아래 계약을 깨지 않는다.

- `Blueprint = source spec`
- `Approved PRD = execution SSOT`
- `Bridge output path == /dev-feature input path`
- `Entry Assessment -> Fast-Track Intake -> Normalization` 이후에만 orchestration이 개입

즉, 오케스트레이터는 planning pipeline의 상위 대체물이 아니라, **정규화 후 실행 조율기**다.

### 2.2 상태 계약

현재 팀 오케스트레이션 revision은 아래 상태 축을 따른다.

- planning / Fast-Track / reviewPassed와 충돌하지 않도록 `stage-manifest.json` 확장
- Team Lead single-writer
- Feature Agent는 상태 메시지 보고만 수행

`orchestration-state.json`은 이 계약과 충돌하므로 새 SSOT로 채택하지 않는다.

### 2.3 개발 단계 계약

- `Phase B = Human Review`
- `Phase E = /dev-verify (DVC 6항목)`

따라서 team-orchestration 문서에서 `코드 리뷰`, `9종 검증` 같은 표현이 개발 단계 의미를 대체하면 안 된다.

---

## 3. Team Orchestration이 직접 하지 않는 일

아래는 오케스트레이터가 직접 수행하지 않는 계층이다.

| 계층 | 이유 |
|------|------|
| Entry Assessment | 블루프린트 진입점 판단은 planning/guide 계층의 책임 |
| Fast-Track Intake | imported IDEA/screening, `/plan-draft` 정규화는 planning 계층 책임 |
| PRD 정규화 | execution SSOT 복원까지는 오케스트레이션 전 단계 |
| raw blueprint intake | 상위 source spec을 직접 실행 입력으로 쓰면 계약 위반 |

오케스트레이터는 위 과정의 **결과물**을 받아 feature 실행 순서와 gate를 관리한다.

---

## 4. 현재 repo truth와의 정렬

### 4.1 actual asset truth

현재 저장소 기준:

- agents 12
- commands 30
- skills 24

따라서 revision 문서도 이 숫자를 기준으로 써야 한다.

### 4.2 현재 없는 자산

현재 repo에 아래 오케스트레이션 전용 runtime asset은 없다.

- `team-lead`
- `team-orchestrate`
- orchestration runtime
- dependency-graph runtime parser

따라서 이들은 구현 계획이나 proposal backlog로만 기술해야 하며, 현재 자산처럼 서술하면 안 된다.

---

## 5. Team Orchestration 개념 -> claude-kit SSOT 매핑

| Team Orchestration 개념 | claude-kit SSOT | 정렬 원칙 |
|-------------------------|----------------|-----------|
| feature registry 입력 | Fast-Track + planning normalization 결과 | raw blueprint 대체 금지 |
| entryPoint | `Entry Assessment` 결과 | `P1`, `P3-fast-track`, `P4-normalized`만 허용 |
| executionPath | approved PRD / bridge path | `.plans/prd/10-approved/...` 기준 |
| review gate | `plan-review`, `reviewPassed` | review 미통과 상태 진행 완화 금지 |
| Human Review | `dev-feature` / `08-dev-workflow.md` | Phase B 명칭 고정 |
| DVC verification | `dev-verify` | DVC 6항목 의미 고정 |
| orchestration state | `stage-manifest` 확장 | Team Lead single-writer |

---

## 6. 원문 재작성 시 필수 반영 사항

- `.plans/ds-customizer/...` 예시는 `.plans/blueprints/ds-customizer/...`로 갱신
- `03-dag-engine.md` 링크 제거
- `dev-frontend-reviewer` 전제 제거
- `13 agents`, `23+ skills`, `commands 28`, `skills 23` 제거
- `orchestration-state.json` SSOT 서술 제거
- raw blueprint direct input 금지 문장을 최소 한 번 이상 명시

---

## 7. 권장 반영 순서

1. revision 문서에서 canonical 구조와 상위 계약을 먼저 고정
2. 원문 `team-orchestration/00~07`을 새 구조에 맞춰 rewrite/split/merge
3. 그 다음에만 runtime proposal backlog를 정리
4. pilot으로 ds-customizer를 연결

---

## 8. 결론

Team Orchestration은 claude-kit를 대체하는 별도 파이프라인이 아니다. 최근 guide와 Fast-Track 개선안 위에 올라가는 **조율 계층**이다. 따라서 revision은 오케스트레이션의 독립성을 강조하기보다, 상위 planning/execution 계약을 침범하지 않는 구조를 명확히 고정해야 한다.
