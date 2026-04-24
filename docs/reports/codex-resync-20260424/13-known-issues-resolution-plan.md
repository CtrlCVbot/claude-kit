# 13. Known Issues Resolution Plan

> 범위: `docs/reports/codex-resync-20260424` 패키지 분석 후 `10-known-issues.md`의 12건에 대한 해결 계획만 정리한다.
> 비범위: 실제 구현, registry 수정, resync 실행, runtime 검증 수행.
> 기준 시점: 2026-04-24 현재 working tree.

## 1. 리포트 전체 요약

이번 `codex-resync-20260424` 패키지는 **Phase 2 재생성이 새 문제를 만들지 않았고**, 기존에 누적되어 있던 세 묶음의 known issue 만 남아 있음을 설명한다.

| 묶음 | 이슈 수 | 리포트 판단 | 현재 계획 판단 |
|---|---:|---|---|
| EX-009 strategy/status 모순 | 1 | pre-existing / 중 | **우선 해결 대상**. 현재 emitter 구조 기준으로 옵션 재선정 필요 |
| rule fallback artifact 누락 | 6 | pre-existing / 낮음 | **리포트의 수정 경로가 현재 구조와 어긋남**. 실제 fix path 재설계 필요 |
| dev command dead reference | 5 | pre-existing / 낮음 | **즉시 수정 가능한 소규모 정리 작업** |

핵심 해석은 두 가지다.

1. `10-known-issues.md`가 말하는 문제 묶음 자체는 여전히 유효하다.
2. 다만 `Issue 2-7`의 해결 경로는 리포트가 가정한 `AGENTS.md.template` 중심 구조가 아니라, **현재 emitter가 실제로 쓰는 `src/templates/agents-md/*.md` + `scripts/agents-md-renderer.js` 구조**를 기준으로 다시 잡아야 한다.

## 2. 현재 증거 요약

아래는 리포트 주장과 현재 소스를 대조한 핵심 증거다.

| 항목 | 현재 증거 | 의미 |
|---|---|---|
| Codex direct-use source | `scripts/setup.js`는 direct Codex surface를 `src/codex`에서만 emit한다 | generated output 수정이 아니라 source/ejector 수정이 우선이다 |
| rules emit 경로 | `scripts/setup.js`는 direct-use 복사에서 `rules`를 제외한다 | EX-009를 `paired-direct`로 밀어붙이려면 단순 파일 추가가 아니라 emitter 설계가 필요하다 |
| AGENTS 생성 방식 | `AGENTS.md.template`는 wrapper이고, managed body는 `scripts/agents-md-renderer.js`가 `src/templates/agents-md/*.md` 블록으로 렌더링한다 | `Issue 2-7`은 template wrapper만 채워서는 기존 설치물 업데이트를 해결하지 못한다 |
| 현재 managed guidance 상태 | 현재 `AGENTS.md`에는 `golden-principles`, `verification`, `coding-style`, `security`, `date-calculation` 요약 참조가 있고 `interaction`은 없다 | 6개 fallback rule이 전부 비어 있는 것은 아니지만, exception/portability가 설명하는 artifact 계약과는 다르다 |
| EX-009 실제 상태 | `src/exception-registry.json`은 `EX-009`를 `active + paired-direct`로, `src/pairing-registry.json`은 `security-no-hardcoded-secrets`를 `codex-skip`으로 가진다 | 리포트의 모순 지적이 현재도 그대로 맞다 |
| dead reference 실제 상태 | `src/claude/dev/commands/*.md`에 `dev-` 접두사 없는 skill 경로가 남아 있다 | Codex 쪽이 아니라 Claude source를 먼저 고치고 resync해야 한다 |

## 3. 권장 방향

### 추천안

가장 안전한 기본 경로는 아래 3단계다.

1. **EX-009를 현재 emitter 구조에 맞게 `agents-guidance` 경로로 정렬한다.**
2. **rule fallback artifact의 실제 SSOT를 `AGENTS.md.template` wrapper가 아니라 managed blocks로 재정의한다.**
3. **dev command dead reference 5건을 Claude source에서 수정하고 domain-limited resync로 반영한다.**

### 추천 이유

- 현재 `scripts/setup.js`는 fresh install에서도 rules policy 파일을 자동 생성하지 않는다.
- 현재 `AGENTS.md.template` 수정은 **새로 생성되는 AGENTS.md wrapper**에만 영향을 주고, 이미 존재하는 `AGENTS.md`는 managed section만 다시 그린다.
- 즉 `Issue 2-7`을 template wrapper 기준으로 해결하면 **기존 설치물 업데이트 경로를 놓칠 가능성**이 높다.
- EX-009를 `paired-direct`로 실제 구현하려면 rule source 추가만으로는 부족하고, rules emit 경로와 검증 절차까지 설계해야 한다.

## 4. 이슈별 해결 계획

## 4-1. Issue 1 — EX-009 Strategy/Status 모순

### 문제

- `src/exception-registry.json`: `EX-009 = active + paired-direct`
- `src/pairing-registry.json`: `security-no-hardcoded-secrets = codex-skip`

### 현재 원인 판단

- metadata는 "언젠가 Codex Rules로 간다"는 설계 의도를 유지하고 있다.
- 하지만 실제 emitter는 rules surface를 자동 생성하지 않는다.
- 따라서 이 이슈는 단순 누락이라기보다 **설계 의도와 현재 배포 구조의 불일치**다.

### 권장안

**권장: 옵션 B 계열로 정리**

- `EX-009`를 현행 구조에 맞춰 `paired-fallback (agents-guidance)` 또는 동등한 guidance artifact 경로로 재분류한다.
- hardcoded secrets 관련 핵심 문구를 managed AGENTS guidance 안에서 명시적으로 보이게 만든다.
- `security` fallback과의 경계를 문서로 명확히 적는다.

### 대안

| 대안 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. `paired-direct` 유지 후 rules emit까지 구현 | 초기 설계 의도에 가장 충실 | rules output 경로, install 정책, 검증 체계까지 새로 필요 | 별도 설계 세션 없이는 비추천 |
| B. `agents-guidance`로 재정렬 | 현재 emitter와 가장 잘 맞음 | rule 정책성 일부가 guidance로 후퇴 | **추천** |
| C. active 상태 유지 | 작업량 최소 | 모순 지속, 다음 resync 때 다시 혼선 | 비추천 |

### 예상 수정 범위

추천안 B 기준:

- `src/exception-registry.json`
- `src/claude/_meta/codex-portability.json`
- `src/templates/agents-md/*.md`
- 필요 시 `scripts/agents-md-renderer.js`

옵션 A로 갈 경우 추가:

- `src/codex/core/rules/*`
- `scripts/setup.js`
- rules output validation 경로

### 검증 방법

- metadata 정합성 확인:
  - `EX-009`의 strategy/status와 pairing status가 더 이상 충돌하지 않는지 확인
- emitter preview:
  - `node scripts/setup.js --dry-run`
- generated guidance 확인:
  - 생성/병합된 `AGENTS.md`에 hardcoded secrets guidance가 의도대로 포함되는지 확인

### 우선순위

`P1`

## 4-2. Issue 2-7 — Rule Fallback Artifact 누락

### 문제

리포트와 portability/exception 문서는 6개 rule fallback artifact가 `src/templates/AGENTS.md.template ### <rule>` 형태로 존재해야 한다고 설명한다. 하지만 실제 emitter는 그렇게 동작하지 않는다.

### 현재 원인 판단

현재 구조는 아래처럼 분리돼 있다.

- wrapper: `src/templates/AGENTS.md.template`
- managed body renderer: `scripts/agents-md-renderer.js`
- managed content blocks: `src/templates/agents-md/*.md`

즉 현재의 실질 artifact는 `AGENTS.md.template` 그 자체가 아니라 **managed block 세트**다.

또한 현재 managed guidance에는 이미 아래가 들어가 있다.

- `golden-principles`
- `verification`
- `coding-style`
- `security`
- `date-calculation`

하지만 아래 두 문제가 남아 있다.

1. exception/portability가 가리키는 artifact 경로가 실제 구조와 다르다.
2. `interaction` guidance는 현재 managed body에서 빠져 있다.

### 권장안

**권장: wrapper 수정이 아니라 managed block 기준으로 재정의**

실행 단위는 아래처럼 잡는 것을 추천한다.

1. fallback artifact SSOT를 `src/templates/agents-md/*.md`로 공식화
2. 6개 fallback rule에 대응하는 명시적 block 또는 heading 구조 추가
3. `interaction` rule 요약을 새 block으로 추가
4. portability/exception의 `fallbackArtifact` 설명을 실제 block 경로로 교정
5. 필요하면 `scripts/agents-md-renderer.js`의 block 순서/구성을 조정

### 구현 형태 추천

두 방향 중 하나를 선택하면 된다.

| 방식 | 설명 | 장단점 | 추천도 |
|---|---|---|---|
| A. rule별 block 파일 분리 | 예: `20-golden-principles.md`, `30-verification.md`, `40-coding-style.md`, `50-security.md`, `60-interaction.md`, `90-currentdate.md` | artifact 추적이 가장 명확 | **높음** |
| B. 기존 block 유지 + heading 보강 | `10-runtime-principles.md` 등에 heading을 더 쪼개고 portability 경로를 해당 heading으로 교정 | 변경 파일 수가 적음 | 중간 |

### 예상 수정 범위

- `src/templates/agents-md/*.md`
- `scripts/agents-md-renderer.js`
- `src/claude/_meta/codex-portability.json`
- `src/exception-registry.json`

주의:

- `AGENTS.md.template` wrapper 자체는 유지하는 편이 안전하다.
- 기존 설치물 update 경로까지 반영하려면 managed body 쪽을 고쳐야 한다.

### 검증 방법

- `node scripts/setup.js --dry-run`
- 생성된 `AGENTS.md` managed section에 6개 rule intent가 모두 노출되는지 확인
- fresh install 경로와 existing AGENTS merge 경로를 둘 다 점검
- exception/portability의 artifact 설명이 실제 파일 구조와 일치하는지 확인

### 우선순위

`P1`

## 4-3. Issue 8-12 — Dev Command Dead References 5건

### 문제

`src/claude/dev/commands/*.md`의 `> 참조:` 블록이 실제 skill 경로보다 `dev-` 접두사가 빠진 경로를 가리킨다.

### 현재 원인 판단

- Codex 문제가 아니라 Claude source 레벨 문제다.
- 현재 emitter는 command를 `src/claude` → `src/codex`로 거의 그대로 복사하므로 source를 먼저 고쳐야 한다.

### 권장안

1. Claude source 4개 파일의 잘못된 경로를 수정
2. `dev` domain command만 제한적으로 resync
3. C8류 dead reference 체크를 재실행
4. 가능하면 같은 유형의 경로 오타를 잡는 lint를 추가

### 대상 파일

| 파일 | 수정 내용 |
|---|---|
| `src/claude/dev/commands/dev-refactor.md` | `refactoring` → `dev-refactoring` |
| `src/claude/dev/commands/dev-review.md` | `layered-architecture` → `dev-layered-architecture` |
| `src/claude/dev/commands/dev-review.md` | `frontend-patterns` → `dev-frontend-patterns` |
| `src/claude/dev/commands/dev-test-verify.md` | `tdd-workflow` → `dev-tdd-workflow` |
| `src/claude/dev/commands/dev-verify-fe.md` | `testing-frontend` → `dev-testing-frontend` |
| `src/claude/dev/commands/dev-verify-fe.md` | `frontend-patterns` → `dev-frontend-patterns` |

### 예상 수정 범위

- `src/claude/dev/commands/dev-refactor.md`
- `src/claude/dev/commands/dev-review.md`
- `src/claude/dev/commands/dev-test-verify.md`
- `src/claude/dev/commands/dev-verify-fe.md`
- resync 결과로 `src/codex/dev/commands/*.md`

### 검증 방법

- 잘못된 경로 재검색
- resync 후 Codex command 파일에 동일 오타가 남지 않았는지 확인
- 가능하면 dead reference audit를 재실행

### 우선순위

`P2`

## 5. 권장 실행 순서

## Execution Unit A — 설계 정렬

범위:

- Issue 1
- Issue 2-7의 artifact architecture 결정

목표:

- EX-009 권장안 확정
- fallback artifact의 실제 SSOT 확정

산출물:

- decision note 또는 관련 registry patch 초안

## Execution Unit B — AGENTS guidance 정렬

범위:

- managed block 구조 정리
- `interaction` 추가
- portability/exception 서술 교정

목표:

- 현재 emitter가 실제로 만드는 guidance와 metadata 설명을 일치시킴

산출물:

- block 파일 변경
- renderer 조정
- dry-run 결과 확인

## Execution Unit C — dev command reference 정리

범위:

- dead reference 5건 수정
- domain-limited resync

목표:

- C8 dead reference 제거

산출물:

- source patch
- resync 결과
- 재검증 로그

## 6. 우선순위 / 선후 관계

| 순서 | 작업 | 이유 |
|---:|---|---|
| 1 | EX-009 방향 결정 | Issue 2-7과 `security` fallback 정리에 직접 영향 |
| 2 | AGENTS guidance artifact 구조 정렬 | 현재 문서/metadata/ejector의 기준점을 먼저 맞춰야 함 |
| 3 | dev command dead reference 수정 | 독립 작업이라 병렬 가능하지만, 전체 known issues closeout에는 후순위 |
| 4 | 선택적 후속 검증 자동화 | 위 3개가 정리된 뒤 붙이는 게 안전 |

병렬 가능:

- `Execution Unit C`는 `Execution Unit A/B`와 병렬 가능

의존성 있음:

- `Issue 2-7`의 최종 문구는 `EX-009`를 A/B/C 중 어디로 정리할지에 영향받음

## 7. 검증 계획

| 검증 항목 | 방법 | 통과 기준 |
|---|---|---|
| EX-009 metadata 정합성 | registry diff 검토 | exception / portability / pairing 사이의 설명과 상태가 모순되지 않음 |
| AGENTS guidance 경로 정합성 | `node scripts/setup.js --dry-run` + generated `AGENTS.md` 확인 | fresh/update 모두에서 intended guidance가 노출됨 |
| interaction fallback 존재성 | managed block/AGENTS 본문 확인 | interaction intent가 실제 AGENTS guidance에 포함됨 |
| dead reference 제거 | 경로 재검색 + resync 후 결과 확인 | 잘못된 `.claude/skills/...` 참조가 남지 않음 |
| 회귀 방지 | 가능한 경우 기존 C7/C8 감사 재실행 | known issue 항목 수가 감소하고 새 경고가 생기지 않음 |

## 8. 남은 리스크와 가정

| 항목 | 영향 | 메모 |
|---|---|---|
| Codex Rules direct surface의 실제 제품 경로/포맷 미확정 | 높음 | EX-009를 옵션 A로 가면 별도 공식 문서 검증과 emitter 설계가 필요 |
| exception/portability의 `fallbackArtifact` 설명이 이미 현재 구조와 어긋나 있음 | 중간 | 문서만 고치면 되는 문제가 아니라 SSOT 재정의가 필요 |
| managed block을 늘리면 AGENTS.md 길이가 커질 수 있음 | 중간 | 요약 밀도 기준을 먼저 정해야 함 |
| dead reference 감사 스크립트가 상시화되어 있지 않을 수 있음 | 낮음 | 이번 수정 후 간단한 lint/검사 루틴 추가 권장 |

가정:

1. 현재 `scripts/setup.js`와 `scripts/agents-md-renderer.js`가 실제 emitter SSOT다.
2. fresh install뿐 아니라 기존 설치물 update 경로까지 해결하는 것이 목표다.
3. 이번 작업은 구현이 아니라 계획 수립 단계이므로, EX-009에 대한 최종 선택은 다음 세션에서 확정한다.

## 9. 최종 제안

이번 known issues 묶음은 아래처럼 나눠 처리하는 것이 가장 안전하다.

- **결정 먼저**: EX-009를 현재 구조에 맞게 guidance fallback으로 정렬할지, rules surface 설계를 새로 열지 먼저 결정
- **구조 정렬 다음**: AGENTS fallback artifact를 `AGENTS.md.template` wrapper가 아니라 managed block 구조로 재정의
- **소규모 정리 분리**: dev command dead reference는 별도 작은 패치 + targeted resync로 빠르게 닫기

즉, `10-known-issues.md`의 문제 인식은 유지하되, 해결 경로는 **리포트의 설명이 아니라 현재 emitter 구조**를 기준으로 다시 설계하는 것이 이 계획의 핵심이다.
