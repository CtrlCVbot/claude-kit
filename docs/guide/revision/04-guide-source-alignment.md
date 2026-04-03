# Guide ↔ Source 정합성 매핑

> 목적
>
> - 현재 `guide`의 주장과 실제 설치 자산/authoring source 근거를 1:1로 대응시켜, 무엇이 이미 맞고 무엇이 아직 어긋나는지 빠르게 확인
> - 과거 revision 기준과 달라진 판정을 반영해, 현재 시점의 진짜 정합성 이슈만 남긴다

> 근거 우선순위
>
> 1. 설치 자산 SSOT: `[../../../../.claude/commands/](../../../../.claude/commands/)`, `[../../../../.claude/skills/](../../../../.claude/skills/)`, `[../../../../.claude/agents/](../../../../.claude/agents/)`
> 2. 보조 근거: `[../../../src/plan/commands/](../../../src/plan/commands/)`, `[../../../src/plan/skills/](../../../src/plan/skills/)`, `[../../../src/dev/commands/](../../../src/dev/commands/)`

> 공통 기준
>
> - Inventory = `12 agents / 30 commands / 24 skills`
> - `Phase B = Human Review`
> - `/dev-verify = DVC 6항목`
> - `P8 archive/improve = /plan-archive + /plan-improve`

---

## 1. 이번 라운드에서 바뀐 판정

과거 revision 기준과 비교해 가장 크게 달라진 것은 `reviewPassed`다.

- 이전에는 guide가 `reviewPassed`를 전제로 설명하지만 command source가 이를 영속화하지 않는다고 볼 여지가 있었다.
- 현재는 `[../../../../.claude/commands/plan-review.md](../../../../.claude/commands/plan-review.md)`와 `[../../../src/plan/commands/plan-review.md](../../../src/plan/commands/plan-review.md)` 모두 PASS 시 `stage-manifest.json`에 `reviewPassed: true`를 기록한다고 명시한다.

따라서 이번 라운드에서 `reviewPassed`는 더 이상 `충돌`이 아니라 `일치`로 본다.

---

## 2. 정합성 매핑 표


| 주제                            | Guide 근거                                                                                                                                                                                                                                                                           | Source 근거                                                                                                                                                                           | 상태     | 메모                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| P8 아카이브/개선요청 존재               | `[11-archive-improve.md](../11-archive-improve.md)`                                                                                                                                                                                                                                | `[plan-archive.md](../../../../.claude/commands/plan-archive.md)`, `[plan-improve.md](../../../../.claude/commands/plan-improve.md)`                                                | 일치     | P8 자체는 guide에 성공적으로 편입됨                                                                         |
| P1~P8 end-to-end 파이프라인        | `[01-planning-pipeline.md](../01-planning-pipeline.md)`                                                                                                                                                                                                                            | `[plan-archive-workflow/SKILL.md](../../../../.claude/skills/plan-archive-workflow/SKILL.md)`, `[plan-pipeline/SKILL.md](../../../../.claude/skills/plan-pipeline/SKILL.md)`        | 대체로 일치 | 파이프라인 구조는 맞지만 상태 파일 설명은 별도 충돌이 있음                                                               |
| Blueprint Fast-Track guide 존재 | `[12-blueprint-fast-track.md](../12-blueprint-fast-track.md)`, `[10-glossary.md](../10-glossary.md)`                                                                                                                                                                               | 기존 plan/review/bridge command 조합                                                                                                                                                    | 부분 일치  | guide 주도 운영 규칙으로는 정리되었고, 상태 파일명만 최종 SSOT와 맞추면 됨                                                 |
| `reviewPassed` 기록             | `[06-dev-handoff.md](../06-dev-handoff.md)`, `[07-review-pcc.md](../07-review-pcc.md)`, `[12-blueprint-fast-track.md](../12-blueprint-fast-track.md)`                                                                                                                              | `[plan-review.md](../../../../.claude/commands/plan-review.md)`, `[../../../src/plan/commands/plan-review.md](../../../src/plan/commands/plan-review.md)`                           | 일치     | PASS 시 `stage-manifest.json` 기록 규칙이 guide와 command 양쪽에 존재                                       |
| `/dev-verify` 의미              | `[00-overview.md](../00-overview.md)`, `[08-dev-workflow.md](../08-dev-workflow.md)`, `[10-glossary.md](../10-glossary.md)`                                                                                                                                                        | `[dev-verify.md](../../../../.claude/commands/dev-verify.md)`                                                                                                                       | 부분 충돌  | `guide/08`, `guide/10`은 맞지만 `guide/00`은 아직 9종 검증 표현이 남아 있음                                      |
| `Phase B` 명칭                  | `[08-dev-workflow.md](../08-dev-workflow.md)`, `[10-glossary.md](../10-glossary.md)`                                                                                                                                                                                               | 개발 workflow 구조 전반                                                                                                                                                                   | 부분 충돌  | 상단 흐름은 `Human Review`인데 일부 제목/표는 아직 예전 표현이 남아 있음                                                |
| 상태 추적 파일명                     | `[06-dev-handoff.md](../06-dev-handoff.md)`, `[09-architecture.md](../09-architecture.md)`, `[10-glossary.md](../10-glossary.md)`, `[12-blueprint-fast-track.md](../12-blueprint-fast-track.md)`                                                                                   | `[plan-pipeline/SKILL.md](../../../../.claude/skills/plan-pipeline/SKILL.md)`, `[../../../src/plan/skills/plan-pipeline/SKILL.md](../../../src/plan/skills/plan-pipeline/SKILL.md)` | 충돌     | guide는 `stage-manifest.json`, installed skill은 `.plans/pipeline-status.json`, src skill은 둘 다 혼재 |
| archived 상태 필드                | `[11-archive-improve.md](../11-archive-improve.md)`, `[10-glossary.md](../10-glossary.md)`                                                                                                                                                                                         | `[plan-pipeline/SKILL.md](../../../../.claude/skills/plan-pipeline/SKILL.md)`                                                                                                       | 부분 충돌  | guide는 개념 설명 위주, skill은 `currentStage`, `archivePath`, `improvements` 같은 필드 예시를 제공              |
| inventory 총계                  | `[09-architecture.md](../09-architecture.md)`                                                                                                                                                                                                                                      | `[.claude/agents/](../../../../.claude/agents/)`, `[.claude/commands/](../../../../.claude/commands/)`, `[.claude/skills/](../../../../.claude/skills/)`                            | 충돌     | 문서는 `13 / 28 / 23`, 실제 설치 자산은 `12 / 30 / 24`                                                    |
| plan command 총계               | `[09-architecture.md](../09-architecture.md)`                                                                                                                                                                                                                                      | `[.claude/commands/](../../../../.claude/commands/)`                                                                                                                                | 충돌     | plan command는 10개가 맞음                                                                           |
| plan skill 총계                 | `[09-architecture.md](../09-architecture.md)`                                                                                                                                                                                                                                      | `[.claude/skills/](../../../../.claude/skills/)`                                                                                                                                    | 충돌     | plan skill은 8개가 맞음                                                                              |
| 존재하지 않는 agent/skill           | `[09-architecture.md](../09-architecture.md)`                                                                                                                                                                                                                                      | `[.claude/agents/](../../../../.claude/agents/)`, `[.claude/skills/](../../../../.claude/skills/)`                                                                                  | 충돌     | `dev-frontend-reviewer`, `dev-tenant-isolation`는 현재 설치 자산에 없음                                   |
| Quickstart의 lifecycle 종료 지점   | `[00-overview.md](../00-overview.md)`                                                                                                                                                                                                                                              | `[plan-archive.md](../../../../.claude/commands/plan-archive.md)`, `[plan-improve.md](../../../../.claude/commands/plan-improve.md)`                                                | 부분 충돌  | 실제 기능은 P8까지 있는데 quickstart는 Step 5에서 끝남                                                         |
| 문서 안내/상세 링크                   | `[00-overview.md](../00-overview.md)`, `[01-planning-pipeline.md](../01-planning-pipeline.md)`, `[02-idea-management.md](../02-idea-management.md)`, `[05-design.md](../05-design.md)`, `[06-dev-handoff.md](../06-dev-handoff.md)`, `[09-architecture.md](../09-architecture.md)` | 현재 `guide` 실제 파일 목록                                                                                                                                                                 | 충돌     | `v6-claude/...`, `docs/02-plan-idea.md`류 링크가 현행 구조와 맞지 않음                                       |


---

## 3. 확인된 source truth

### 설치 자산 기준

- Agents: 12
- Commands: 30
- Skills: 24

### Plan 도메인 실제 자산

**Commands (10)**

- `/plan-archive`
- `/plan-bridge`
- `/plan-draft`
- `/plan-idea`
- `/plan-improve`
- `/plan-prd`
- `/plan-review`
- `/plan-screen`
- `/plan-stitch`
- `/plan-wireframe`

**Skills (8)**

- `plan-archive-workflow`
- `plan-idea-management`
- `plan-pipeline`
- `plan-prd-authoring`
- `plan-review-criteria`
- `plan-screening-workflow`
- `plan-stitch-workflow`
- `plan-wireframe-design`

### 상태 추적 관련 source truth

- `plan-review` command
  - 설치 자산과 authoring source 모두 PASS 시 `stage-manifest.json`에 `reviewPassed: true` 기록을 명시한다.
- `plan-pipeline` skill
  - 설치 자산은 `.plans/pipeline-status.json`을 상태 파일로 설명한다.
  - authoring source는 본문 중간에 `.plans/stage-manifest.json`, 하단 요약에 `.plans/pipeline-status.json`을 함께 적고 있어 내부적으로도 충돌한다.

---

## 4. 리뷰 작성 시 사용할 판정 규칙

- `일치`
  - guide 설명과 설치 자산 설명이 같은 방향을 가리킨다.
- `부분 충돌`
  - 개념은 맞지만 범위, 용어, 상위/하위 설명 수준이 다르다.
- `충돌`
  - 파일명, 집계, 존재 여부, 상태 모델처럼 바로 오해를 만드는 차이가 있다.

---

## 5. 이번 revision의 결론

- `guide/11`, `guide/12`, `guide/10`은 각각 P8, Fast-Track, 용어 anchor로 유지할 가치가 크다.
- `reviewPassed`는 이제 guide/source 정합성 이슈가 아니라, 이미 닫힌 항목으로 봐도 된다.
- 실제 수정 우선순위는 `상태 파일 SSOT` → `guide/09` → `guide/00` → `guide/01` → 용어/링크 sweep 순서가 적절하다.
- 가장 위험한 불일치는 상태 파일명 충돌과 stale inventory다.

