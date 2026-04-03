# claude-kit Guide 수정 체크리스트

> 목적
> - 최신 `guide` 개편 이후 revision 대상을 다시 좁혀, 실제로 남아 있는 수정 항목만 추적
> - "이미 해결된 문제 재오픈"을 막고, 현재 guide/source 불일치만 체크리스트로 관리

> 공통 기준
> - Inventory = `12 agents / 30 commands / 24 skills`
> - `Phase B = Human Review`
> - `/dev-verify = DVC 6항목`
> - `총 9종 검증`은 파이프라인 전체 설명에서만 사용
> - `P8 archive/improve = /plan-archive + /plan-improve`
> - `reviewPassed`는 guide와 `plan-review` command에 이미 반영되어 있으므로 이번 라운드의 미해결 항목으로 다시 열지 않는다

---

## 1. 이번 라운드에서 다시 열지 않을 항목

- [x] P8 archive/improve 설명 부재
- [x] Blueprint Fast-Track 문서 부재
- [x] `Entry Assessment` 용어 부재
- [x] `reviewPassed` guide-only 문제
- [x] `/dev-verify`가 DVC 6항목이라는 기준 자체의 부재

이번 revision은 위 항목을 다시 문제 삼지 않고, "남은 stale 정리"에 집중한다.

---

## 2. 가장 먼저 해결할 공통 블로커

- [ ] 상태 추적 파일 SSOT를 고정한다.
  - `stage-manifest.json` 유지인지
  - `.plans/pipeline-status.json` 전환인지
  - 또는 명시적 마이그레이션 규칙을 둘 것인지
- [ ] stale inventory를 실제 설치 자산 기준으로 정정한다.
  - `12 agents / 30 commands / 24 skills`
  - plan commands `10`
  - plan skills `8`
- [ ] broken/stale 링크 sweep을 별도 작업축으로 잡는다.
  - `v6-claude/...`
  - `docs/02-plan-idea.md`류 옛 경로
- [ ] 용어를 guide 전반에서 통일한다.
  - `Phase B = Human Review`
  - `/dev-verify = DVC 6항목`
  - `총 9종 검증 = 파이프라인 전체 관점`
- [ ] `00-overview.md`의 quickstart와 `문서 안내`를 현재 lifecycle 기준으로 확장한다.

---

## 3. 문서별 수정 체크리스트

### 3.1 `00-overview.md`

**보강**

- [ ] 퀵스타트에 `Step 6. 아카이브`, `Step 7. 개선요청`을 추가한다.
- [ ] 검증 체계 섹션에서 "총 9종 검증"과 "`/dev-verify`의 DVC 6항목"을 분리 설명한다.

**용어 교체**

- [ ] `Phase E` 행의 `테스트 + 빌드 + 9종 일관성 검증` 표현을 `/dev-verify (DVC 6항목)` 기준으로 조정한다.

**링크/네비게이션 보정**

- [ ] `문서 안내`의 `v6-claude/...` 링크를 현재 `guide/*.md` 파일명 기준으로 교체한다.

### 3.2 `01-planning-pipeline.md`

**보강**

- [ ] P8 이후 상태 추적 문서가 archived lifecycle도 포함해야 한다는 설명을 짧게 보강한다.

**링크/네비게이션 보정**

- [ ] `상세 문서` 섹션의 `docs/02-plan-idea.md`류 링크를 현재 `guide/*.md` 파일명으로 교체한다.
- [ ] P8 anchor로 `11-archive-improve.md`를, Fast-Track anchor로 `12-blueprint-fast-track.md`를 자연스럽게 연결할지 검토한다.

### 3.3 `02-idea-management.md`

**링크/네비게이션 보정**

- [ ] 하단 related links의 `./v6-claude/...` 경로를 현재 `guide` 링크로 교체한다.

### 3.4 `05-design.md`

**링크/네비게이션 보정**

- [ ] 하단 관련 문서 링크의 `./v6-claude/...` 경로를 현재 `guide` 링크로 교체한다.

**상태 용어 점검**

- [ ] 상태 파일 SSOT가 확정되면 `stage-manifest.json` 언급도 함께 점검한다.

### 3.5 `06-dev-handoff.md`

**링크/네비게이션 보정**

- [ ] 하단 related links의 `v6-claude/...` 경로를 현재 `guide` 링크로 교체한다.

**상태 용어 점검**

- [ ] Bridge pre-check가 참조하는 상태 파일명이 최종 SSOT와 일치하는지 재확인한다.

### 3.6 `08-dev-workflow.md`

**용어 교체**

- [ ] `## Phase B: 코드 리뷰`를 `## Phase B: Human Review`로 교체한다.

**보강**

- [ ] `Phase E` 설명에 "`/dev-verify`는 DVC 6항목"이라는 문장을 넣는다.
- [ ] 개발 완료 이후 선택적으로 P8(`/plan-archive`)로 이어질 수 있다는 한 줄 설명을 추가할지 검토한다.

### 3.7 `09-architecture.md`

**집계 정정**

- [ ] `Agents 13 / Commands 28 / Skills 23`을 실제 설치 자산 기준으로 수정한다.
- [ ] plan command 수를 `10`, plan skill 수를 `8`로 수정한다.

**삭제/축소**

- [ ] 존재하지 않는 `dev-frontend-reviewer` 항목을 제거한다.
- [ ] 존재하지 않는 `dev-tenant-isolation` 항목을 제거한다.

**상태 구조 정리**

- [ ] `stage-manifest.json` 설명을 상태 파일 SSOT 결정과 맞춘다.

**링크/네비게이션 보정**

- [ ] 하단 reference의 `docs/v6-claude/...` 경로를 현재 구조 또는 실제 설치 자산 기준으로 교체한다.

### 3.8 `10-glossary.md`

**용어 교체**

- [ ] phase 정의 표의 `B | Blueprint | Human Review` 행을 더 자연스러운 형태로 정리한다.

**보강**

- [ ] `/dev-verify` 항목 옆에 "전체 9종 중 Dev phase의 6항목"이라는 구분 설명을 덧붙일지 검토한다.

**상태 용어 점검**

- [ ] `Stage Manifest` 항목이 최종 SSOT 파일명과 일치하는지 확인한다.

### 3.9 `12-blueprint-fast-track.md`

**상태 용어 점검**

- [ ] `stage-manifest`, `entryPoint`, `sourceRef` 설명이 최종 상태 추적 SSOT와 충돌하지 않는지 확인한다.

**범위 점검**

- [ ] 이 문서는 구조 보강보다 용어 동기화가 핵심이라는 점을 유지한다.

### 3.10 `03-screening.md`, `04-feature-planning.md`, `07-review-pcc.md`, `11-archive-improve.md`

**유지 + 점검**

- [ ] 이번 라운드의 주수정 대상은 아니지만, 링크와 용어가 새 기준과 충돌하지 않는지 sanity check는 수행한다.

---

## 4. 리뷰 완료 판정

아래 항목이 모두 충족되면 revision 기준 문서는 현재 guide 상태를 충분히 반영한 것으로 본다.

- [ ] revision 문서끼리 `12 / 30 / 24`, `Phase B = Human Review`, `DVC 6항목` 기준이 일치한다.
- [ ] `reviewPassed`가 더 이상 미해결 blocker처럼 서술되지 않는다.
- [ ] 상태 파일 SSOT 이슈가 모든 revision 문서에서 같은 방향으로 설명된다.
- [ ] stale inventory와 legacy 링크가 빠짐없이 체크리스트에 잡혀 있다.
- [ ] 독자가 "지금 남은 핵심은 무엇인가"를 1회 독해로 파악할 수 있다.

---

## 5. 권장 수정 순서

1. 상태 파일 SSOT 결정
2. `09-architecture.md` 정리
3. `00-overview.md`의 top-level 흐름/문서 안내 보강
4. `01-planning-pipeline.md` 상세 링크 정리
5. `08-dev-workflow.md`, `10-glossary.md` 용어 통일
6. `02-idea-management.md`, `05-design.md`, `06-dev-handoff.md` 링크 sweep
7. `12-blueprint-fast-track.md` 용어 동기화 점검
