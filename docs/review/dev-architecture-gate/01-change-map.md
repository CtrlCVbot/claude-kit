# Change Map

## 실행 자산 현황

아래 3개 실행 자산은 리뷰 패키지 작성 이전에 이미 구현 및 등록이 완료되었다.

| 자산 | 경로 | 목적 | 구현 상태 |
|------|------|------|:--------:|
| 명령 | `src/dev/commands/dev-architecture.md` | 구조 결정 또는 기존 구조 감지 | 구현 완료 (119줄) |
| 스킬 | `src/dev/skills/dev-architecture-decision/SKILL.md` | 구조 선택 매트릭스와 결정 규칙 | 구현 완료 (125줄) |
| 훅 | `src/dev/hooks/dev-feature-scope-guard.js` | 구조 SSOT/바인딩 없이 코드 수정 차단 | 구현 완료 (183줄) |

훅 등록 상태:

| 등록 포인트 | 위치 | 상태 |
|------------|------|:----:|
| Claude hooks 배열 | setup.js L475 | 등록됨 |
| Codex hooks 변환 | setup.js L627 | 등록됨 |
| Codex EXCLUDED_HOOKS | codex-hook-compat.js | 미포함 (= 지원 대상) |

## 프로젝트 SSOT

| 문서 | 경로 | 역할 |
|------|------|------|
| Dev Architecture Profile | `.plans/project/00-dev-architecture.md` | 프로젝트 구조와 스택의 단일 기준 |
| Architecture Binding | `.plans/features/active/{slug}/00-context/06-architecture-binding.md` | 특정 feature가 따라야 할 실제 경로와 규칙 |

## 기존 자산별 수정 포인트

| 기존 자산 | 현재 문제 | 변경 방향 |
|-----------|----------|----------|
| `src/plan/commands/plan-bridge.md` | 구조 미정 상태에서도 바로 `/dev-feature`를 안내 | 구조 SSOT 없으면 `/dev-architecture`로 우회 |
| `src/dev/commands/dev-feature.md` | 구조 전제를 고정 경로로 가정 | 구조 SSOT와 feature binding 선확인 |
| `src/dev/commands/dev-verify.md` | 구현 검증이 구조 바인딩을 보지 않음 | binding 기준으로 scope/path 검증 |
| `src/dev/skills/dev-feature-plan/SKILL.md` | `guide/dev-feature-guide/*`에 의존 | 자체 규칙 + `.plans/...` SSOT로 정리 |
| `src/dev/skills/dev-layered-architecture/SKILL.md` | route/feature 설명이 고정 가정 | 구조 모드별 매핑 규칙 추가 |
| `src/dev/skills/dev-feature-module/SKILL.md` | feature-scoped만 정답처럼 설명 | 4모드 지원, v1 기본 추천만 route-scoped로 고정 |
| `src/dev/skills/dev-workflow/SKILL.md` | `.plan/init/v4/*`와 고정 파일 경로에 의존 | architecture profile + binding을 먼저 읽도록 변경 |
| `src/dev/skills/dev-frontend-patterns/SKILL.md` | 존재하지 않는 `.plan/init/v4/*` 참조 | `profile.json`과 architecture profile 기준으로 정리 |

## 끊어진 참조 정리 방침

### `guide/dev-feature-guide/*`

- 명령/스킬이 저 경로를 필수로 읽지 않게 바꾼다
- 구체 규칙은 프롬프트 본문과 `.plans/...` SSOT에 내장한다
- 본편 문서 병합 후 필요하면 `docs/guide/dev-feature-guide/`로 재도입한다

### `.plan/init/v4/*`

- 현재 저장소에 없으므로 모두 제거한다
- 필요한 내용은 `dev-workflow`, `dev-frontend-patterns`, 리뷰 패키지 문서에 직접 녹인다

---

## 병합 체크리스트

> 실행 자산은 이미 구현되어 있으므로, 문서 병합과 카탈로그 동기화에 집중한다.

### 1. 본편 문서 병합

| 순서 | 대상 | 작업 |
|:----:|------|------|
| 1 | `docs/guide/13-dev-architecture-gate.md` | 본 리뷰 패키지의 초안을 본편으로 이동 |
| 2 | `docs/guide/00-overview.md` | 워크플로우 다이어그램에 `/dev-architecture` 삽입 |
| 3 | `docs/guide/06-dev-handoff.md` | Architecture Pre-Check 섹션 추가 |
| 4 | `docs/guide/08-dev-workflow.md` | 구조 모드 기반 실행으로 서술 전환 |
| 5 | `docs/guide/09-architecture.md` | 카탈로그 수치 갱신 + 훅 테이블 행 추가 |
| 6 | `docs/guide/10-glossary.md` | 신규 용어 7개 + 기존 용어 2개 수정 |

### 2. 카탈로그 동기화

`09-architecture.md` 본편 반영 시 아래 수치를 갱신한다:

| 항목 | 현재 값 | 갱신 값 |
|------|:------:|:------:|
| dev hooks | 2 | 3 |
| dev skills | 13 | 14+ |
| dev commands | 20 | 21+ |
| 합계 hooks | 8 | 9 |
| 합계 skills | 23 | 24+ |
| 합계 commands | 30 | 31+ |

### 3. 실행 자산 링크 정리

- `/dev-architecture`가 본편 문서 경로를 참조하도록 조정
- `dev-feature-plan`, `dev-workflow`, `dev-layered-architecture`, `dev-feature-module`의 참고 링크 정리

### 4. 검증

- [ ] `guide/dev-feature-guide` 끊어진 참조가 남아 있지 않은지 확인
- [ ] `.plan/init/v4` 끊어진 참조가 남아 있지 않은지 확인
- [ ] 새 훅이 Claude/Codex 양쪽에 등록되는지 확인 (이미 완료)
- [ ] 구조 SSOT와 binding이 없을 때 실제로 차단되는지 확인

### 5. 마무리

- 승인된 문서만 본편에 반영
- 리뷰 폴더 보존 여부 결정
- 변경 요약과 잔여 후속 작업 기록

## 병합 후 기대 상태

- `/plan-bridge`는 구조 미정 상태에서 멈춘다
- `/dev-architecture`가 구조를 감지하거나 추천한다
- `/dev-feature`는 구조 SSOT와 binding이 없으면 패키지 생성을 진행하지 않는다
- `/dev-run`, `/dev-verify`는 binding 기준으로 코드 경로와 검증 범위를 판단한다
