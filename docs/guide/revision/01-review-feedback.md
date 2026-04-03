# claude-kit Guide 리뷰 피드백 (현재 guide 00~12 기준)

> 리뷰 대상
> - `guide/00-overview.md` ~ `guide/12-blueprint-fast-track.md`
> - 특히 `00`, `01`, `08`, `09`, `10`, `12`
>
> 근거 소스
> - 설치 자산 SSOT: [`../../../../.claude/commands/`](../../../../.claude/commands/), [`../../../../.claude/skills/`](../../../../.claude/skills/), [`../../../../.claude/agents/`](../../../../.claude/agents/)
> - authoring source 보조 근거: [`../../../src/plan/commands/`](../../../src/plan/commands/), [`../../../src/plan/skills/`](../../../src/plan/skills/), [`../../../src/dev/commands/`](../../../src/dev/commands/)
>
> 리뷰 목적
> - 최신 `guide` 개편 이후, 과거 revision 피드백 중 무엇이 이미 해결되었고 무엇이 아직 남아 있는지 다시 정리
> - 현재 `guide`의 주장과 실제 설치 자산/authoring source가 어디서 맞고 어디서 어긋나는지 근거 중심으로 정리
> - 다음 수정 라운드가 "이미 해결된 이슈 재지적"이 아니라 "남은 구조 불일치 정리"에 집중되도록 revision 기준점을 갱신

> 공통 기준
> - Inventory 실제 설치 자산: `12 agents / 30 commands / 24 skills`
> - `Phase B = Human Review`
> - `/dev-verify = DVC 6항목`
> - `P8 archive/improve = /plan-archive + /plan-improve`
> - `Blueprint Fast-Track = guide/12`

---

## 1. 총평

현재 guide 세트는 예전 revision이 지적하던 큰 공백들을 상당 부분 해소했다.

1. P8 아카이브/개선요청이 더 이상 누락된 lifecycle이 아니라, [`../00-overview.md`](../00-overview.md), [`../01-planning-pipeline.md`](../01-planning-pipeline.md), [`../11-archive-improve.md`](../11-archive-improve.md) 안에서 end-to-end 흐름으로 편입되었다.
2. 블루프린트 Fast-Track이 [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)로 독립 anchor를 갖게 되었고, [`../10-glossary.md`](../10-glossary.md)에도 핵심 용어가 전파되었다.
3. `reviewPassed`도 더 이상 guide-only 개념이 아니다. [`../06-dev-handoff.md`](../06-dev-handoff.md), [`../07-review-pcc.md`](../07-review-pcc.md), [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)뿐 아니라 실제 [`../../../../.claude/commands/plan-review.md`](../../../../.claude/commands/plan-review.md), [`../../../src/plan/commands/plan-review.md`](../../../src/plan/commands/plan-review.md)에도 PASS 시 `stage-manifest.json` 기록 규칙이 들어와 있다.

즉, 이번 revision의 초점은 더 이상 "새 구조를 추가하라"가 아니다. 이제 남은 문제는 다음 네 가지다.

- 상태 추적 파일 SSOT가 guide와 skill source 사이에서 갈라져 있다.
- `guide/09`가 여전히 가장 오래된 inventory/카탈로그를 끌고 있다.
- 여러 문서 하단의 링크와 문서 안내가 현행 `guide/*.md` 체계를 따라오지 못하고 있다.
- `Phase B`, `/dev-verify`, phase 표기처럼 용어가 완전히 통일되지는 않았다.

---

## 2. 이미 해결되었거나 크게 개선된 항목

### 2.1 P8 설명 부재 문제는 해소됐다

- [`../11-archive-improve.md`](../11-archive-improve.md)는 `/plan-archive`, `/plan-improve`, `ARCHIVE-{KEY}.md`, `improvements/`, IMP 상태 머신까지 비교적 완성도 높게 설명한다.
- [`../00-overview.md`](../00-overview.md), [`../01-planning-pipeline.md`](../01-planning-pipeline.md)도 P8을 전체 흐름 안에 편입했다.

이제 revision의 초점은 "P8을 추가하라"가 아니라, "P8이 들어간 뒤 남은 링크/카탈로그/상태 정합성을 정리하라"다.

### 2.2 Blueprint Fast-Track은 이제 독립 anchor 문서가 있다

- [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)는 `Entry Assessment`, imported IDEA, imported screening, `sourceRef`, `reviewPassed`, `entryPoint`까지 운영 규칙을 별도 문서로 정리한다.
- [`../10-glossary.md`](../10-glossary.md)는 `Entry Assessment`, `Fast-Track`, `Blueprint source spec`, imported IDEA 등 관련 용어를 glossary에 반영했다.

즉, 과거의 "블루프린트 진입 기준이 문서에 없다"는 피드백은 메인 이슈가 아니다. 남은 이슈는 이 새 규칙들이 실제 source/skill 설명과 어디서 충돌하는가다.

### 2.3 `reviewPassed`는 이제 guide와 command가 같은 방향을 본다

- Guide 측 근거:
  - [`../06-dev-handoff.md`](../06-dev-handoff.md)
  - [`../07-review-pcc.md`](../07-review-pcc.md)
  - [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)
- Source / installed 측 근거:
  - [`../../../../.claude/commands/plan-review.md`](../../../../.claude/commands/plan-review.md)
  - [`../../../src/plan/commands/plan-review.md`](../../../src/plan/commands/plan-review.md)

PASS 시 `stage-manifest.json`에 `reviewPassed: true`를 기록한다는 규칙은 이제 guide와 command 양쪽에 모두 존재한다. 따라서 이 항목은 더 이상 revision의 P0 blocker가 아니다.

### 2.4 `/dev-verify = DVC 6항목`은 기준점이 생겼다

- [`../10-glossary.md`](../10-glossary.md)는 `/dev-verify`를 `DVC 6항목`으로 설명한다.
- [`../08-dev-workflow.md`](../08-dev-workflow.md)도 DVC 6개 항목 표를 제공한다.
- 실제 command인 [`../../../../.claude/commands/dev-verify.md`](../../../../.claude/commands/dev-verify.md), [`../../../src/dev/commands/dev-verify.md`](../../../src/dev/commands/dev-verify.md) 역시 DVC-01~06을 명시한다.

다만 이 기준이 guide 전체에 완전히 전파된 것은 아니다. `guide/00` 같은 상위 문서에는 여전히 예전 표현이 남아 있다.

---

## 3. 우선순위 높은 남은 피드백

### P0-1. 상태 추적 파일 SSOT가 여전히 갈라져 있다

**왜 중요한가**

상태 파일명이 흔들리면 P3 이후 상태 추적, archived 전환, Fast-Track 메타데이터, improvement lineage 설명이 서로 다른 파일을 가리키게 된다.

**근거**

- Guide 측 근거:
  - [`../06-dev-handoff.md`](../06-dev-handoff.md), [`../09-architecture.md`](../09-architecture.md), [`../10-glossary.md`](../10-glossary.md), [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)는 `stage-manifest.json`을 기준처럼 설명한다.
- Source / installed 측 근거:
  - 설치 자산인 [`../../../../.claude/skills/plan-pipeline/SKILL.md`](../../../../.claude/skills/plan-pipeline/SKILL.md)는 상태 파일을 `.plans/pipeline-status.json`으로 설명한다.
  - authoring source인 [`../../../src/plan/skills/plan-pipeline/SKILL.md`](../../../src/plan/skills/plan-pipeline/SKILL.md)는 문서 중간은 `.plans/stage-manifest.json`, 하단 요약은 `.plans/pipeline-status.json`으로 적어 한 문서 안에서도 충돌한다.

**문제**

- guide: `stage-manifest.json`
- installed skill: `.plans/pipeline-status.json`
- source skill: `stage-manifest.json`과 `pipeline-status.json` 혼재

즉, SSOT가 3방향으로 갈라져 있다.

**권장 수정**

- revision 기준으로 가장 먼저 "어느 파일명을 SSOT로 고정할지"를 결정해야 한다.
- 그 다음 guide와 source/installed skill을 같은 이름으로 맞춰야 한다.

### P1-1. `guide/09`는 여전히 가장 stale한 문서다

**왜 중요한가**

아키텍처 문서는 inventory, 카탈로그, 상태 구조를 동시에 보여주는 문서다. 여기 숫자와 목록이 틀리면 사용자가 시스템 전체를 잘못 이해하게 된다.

**근거**

- Guide 측 근거:
  - [`../09-architecture.md`](../09-architecture.md)는 `Agents 13 / Commands 28 / Skills 23`으로 집계한다.
  - `dev-frontend-reviewer`, `dev-tenant-isolation` 같은 현재 설치 자산에 없는 항목이 남아 있다.
  - 하단 reference는 아직 `docs/v6-claude/...` 경로와 예전 개수를 유지한다.
- Source / installed 측 근거:
  - 실제 설치 자산 집계는 `12 agents / 30 commands / 24 skills`다.

**권장 수정**

- 이번 라운드의 최우선 guide 수정 대상은 여전히 [`../09-architecture.md`](../09-architecture.md)다.

### P1-2. overview/pipeline/navigation 링크가 아직 현행 guide 체계와 맞지 않는다

**근거**

- [`../00-overview.md`](../00-overview.md): `문서 안내`가 전부 `v6-claude/...` 링크를 가리킨다.
- [`../01-planning-pipeline.md`](../01-planning-pipeline.md): `docs/02-plan-idea.md`류 옛 링크를 사용한다.
- [`../02-idea-management.md`](../02-idea-management.md): 하단 related links가 `./v6-claude/...`
- [`../05-design.md`](../05-design.md): 하단 related links가 `./v6-claude/...`
- [`../06-dev-handoff.md`](../06-dev-handoff.md): 하단 related links 일부가 `v6-claude/...`

**문제**

핵심 본문은 최신 구조를 설명하는데, 문서 하단 안내 링크는 여전히 과거 문서 배치를 전제로 한다. 사용자는 "본문은 맞는데 링크를 누르면 다른 시대 문서로 간다"는 경험을 하게 된다.

### P1-3. `Phase B`와 검증 용어는 많이 좋아졌지만 아직 완전히 통일되지는 않았다

**근거**

- [`../08-dev-workflow.md`](../08-dev-workflow.md)는 상단 흐름은 `Human Review`인데, 섹션 제목은 여전히 `## Phase B: 코드 리뷰`다.
- [`../10-glossary.md`](../10-glossary.md)의 phase 정의 표는 `B | Blueprint | Human Review`로 적혀 있어 단계 이름과 설명이 어긋나게 읽힐 여지가 있다.
- [`../00-overview.md`](../00-overview.md)는 Phase E 행을 여전히 `테스트 + 빌드 + 9종 일관성 검증`으로 요약한다.

**권장 수정**

- `Phase B = Human Review`
- `/dev-verify = DVC 6항목`
- `총 9종 검증 = 파이프라인 전체 관점`

이 세 문장을 guide 전체에서 같은 레벨로 유지해야 한다.

### P1-4. `guide/00`과 `guide/01`은 구조는 좋아졌지만 lifecycle 마감 지점 설명이 덜 닫혔다

**근거**

- [`../00-overview.md`](../00-overview.md)의 퀵스타트는 여전히 Step 5에서 끝난다.
- 실제 guide 세트와 설치 자산은 P8(`/plan-archive`, `/plan-improve`)까지 포함한다.
- [`../01-planning-pipeline.md`](../01-planning-pipeline.md)는 P8을 설명하지만, 상세 문서 링크는 아직 옛 경로를 유지한다.

**권장 수정**

- `guide/00`에는 Step 6 아카이브, Step 7 개선요청 재진입을 짧게라도 넣는 편이 좋다.
- `guide/01`은 현재 `guide/*.md` 문서 구조에 맞는 안내 표로 갈아타야 한다.

### P2-1. `guide/12`는 잘 들어왔고, 남은 리스크는 state-file alignment다

[`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)는 현재 guide 세트에서 가장 전략적으로 중요한 신규 문서다. 본문 개편보다 중요한 것은 이 문서를 `stage-manifest vs pipeline-status` 결정 이후 최종 용어에 맞춰 동기화하는 일이다.

즉, 이 문서의 문제는 구조 부족이 아니라, 상위 SSOT 미정으로 인한 용어 동기화 리스크다.

---

## 4. 우선 수정 대상

1. [`../09-architecture.md`](../09-architecture.md)
   - stale inventory, stale component catalog, stale reference가 한 문서에 겹쳐 있다.
2. [`../00-overview.md`](../00-overview.md)
   - quickstart 종료 지점, 검증 문구, 문서 안내가 아직 예전 결을 남긴다.
3. [`../01-planning-pipeline.md`](../01-planning-pipeline.md)
   - P8 구조는 반영됐지만 상세 문서 링크가 현행 guide 체계를 따라오지 못한다.
4. [`../08-dev-workflow.md`](../08-dev-workflow.md), [`../10-glossary.md`](../10-glossary.md)
   - `Phase B`, `/dev-verify`, phase 표기 통일이 남아 있다.
5. [`../02-idea-management.md`](../02-idea-management.md), [`../05-design.md`](../05-design.md), [`../06-dev-handoff.md`](../06-dev-handoff.md)
   - 본문보다 related links/하단 링크의 stale 경로 정리가 우선이다.
6. [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md)
   - 본문 개편보다 state-file SSOT 확정 이후 용어 동기화 관점의 점검이 필요하다.

보완의 anchor 문서는 아래 네 개로 보는 편이 좋다.

- [`../11-archive-improve.md`](../11-archive-improve.md): P8 anchor
- [`../12-blueprint-fast-track.md`](../12-blueprint-fast-track.md): Fast-Track anchor
- [`../10-glossary.md`](../10-glossary.md): 용어 anchor
- [`../07-review-pcc.md`](../07-review-pcc.md): review gate anchor

---

## 5. 한 줄 결론

현재 `guide`는 P8, Fast-Track, `reviewPassed`까지 설명할 수 있을 만큼 성숙해졌다. 이제 revision의 핵심은 "새 구조를 추가하라"가 아니라, 남아 있는 **state file SSOT 충돌, stale inventory, legacy 링크, 용어 통일 미완료**를 정리하는 것이다.
