# Conversion Workflow And Roadmap

> Claude → Codex 전환 설계와 메타 툴 구현을 어떤 순서로 진행할지 실제 착수 관점에서 정리하는 문서

## 단계 위치

- 실행 단계: `5단계`
- 선행 조건: `08`~`13` 확정

## 목적

분석부터 구현, 후속 문서 반영까지 전체 순서를 고정하되, 지금 바로 시작할 메타 툴 구현 파형과 리뷰 게이트를 함께 정의한다.

## 5단계 실행 흐름

### 1단계: Claude baseline 확정

- 기준 문서: `08`
- 목표: `src/claude` 전체 기능 지형을 고정
- 완료 기준: 모든 Claude 기능이 source kind로 분류되고 카탈로그가 완성됨

### 2단계: guide 정렬 포인트 확정

- 기준 문서: `09`
- 목표: `docs/guide`를 `aligned`, `needs-update`, `follow-up`로 판정
- 완료 기준: 구현 전 수정할 guide와 구현 후 반영할 guide가 구분됨

### 3단계: Codex 매핑과 sibling 설계 확정

- 기준 문서: `10`, `11`, `12`
- 목표: 모든 Claude 기능의 Codex 대응 방식과 sibling 책임을 고정
- 완료 기준: 모든 기능이 target surface 하나와 sibling 판정 하나로 귀결됨

### 4단계: 메타 툴 요구사항과 workflow 확정

- 기준 문서: `13`, `14`
- 목표: `.claude` 메타 툴 확장 범위와 workflow를 구현 가능 수준으로 고정
- 완료 기준: 입력/출력/실패 조건/자동 갱신 지점, `*.hook.json`, `*.contract.json` 책임이 모두 기록됨

### 5단계: 구현 착수와 후속 문서 반영

- 목표: 첫 Codex sibling 세트 생성, tooling 확장, validate/audit 연결, installer 연계, guide/meta-tooling/README 반영
- 완료 기준: `pairing-registry`가 실제 데이터를 가지며, 후속 문서 반영 대상이 처리됨

## 지금 바로 착수할 구현 파형

### Wave A: scaffolding 계약 정렬

- 대상:
  - `.claude/commands/kit-create.md`
  - `.claude/skills/kit-scaffolding/SKILL.md`
  - Codex template references
- 잠글 결정:
  - Codex `agent` 경로를 `src/codex/{domain}/agents/{identity}.toml`로 전환
  - Codex `command` 경로를 `src/codex/{domain}/skills/{identity}/SKILL.md`로 전환
  - Codex `hook` 생성 시 `*.js`와 `*.hook.json` 동시 생성
  - write-capable `subagent` 생성 시 `*.contract.json` 동시 생성
- 산출물:
  - path matrix 보정
  - template selection matrix 보정
  - pairing-registry write 규칙 보정
- 리뷰 게이트:
  - `kit-create` 명세만 읽고도 어떤 source 파일이 생기는지 예측 가능해야 한다.

### Wave B: validation 계약 정렬

- 대상:
  - `.claude/commands/kit-validate.md`
  - `.claude/skills/kit-validation/SKILL.md`
  - Codex schema references
- 잠글 결정:
  - `kit-validate`는 authoring source만 검증
  - `kit-validate --target claude`는 Codex sibling 부재만으로 FAIL하지 않음
  - `kit-validate --target codex`는 Claude sibling 부재만으로 FAIL하지 않음
  - `*.hook.json` missing = FAIL
  - write-capable `subagent`에서 `*.contract.json` missing = FAIL
  - optional 항목은 존재할 때만 schema 준수, 없어도 FAIL은 아님
  - cross-target required parity FAIL은 Wave C의 `kit-audit C7`로 넘김
- 산출물:
  - source validation scope
  - companion pair validation scope
  - unsupported runtime artifact 명시
- 리뷰 게이트:
  - validate 결과가 “source 문제”와 “runtime 문제”를 섞지 않아야 한다.

### Wave C: visibility / audit / maintenance 정렬

- 대상:
  - `.claude/commands/kit-list.md`
  - `.claude/commands/kit-audit.md`
  - `.claude/agents/kit-maintainer.md`
  - `src/pairing-registry.json`
- 잠글 결정:
  - `kit-list --pairing`은 registry 상태 + companion completeness를 함께 표시
  - `kit-audit C7`은 missing required sibling, invalid `codex-skip`, orphan registry, missing companion pair를 검사
  - `kit-maintainer`는 bulk repair proposal을 만들되, 자동 rename/delete는 안전한 경우만 허용
  - `instruction-rule`은 registry 추적 대상이 아님을 명시
  - legacy `rule` registry entry는 FAIL이 아니라 migration-needed WARN으로 분류
  - `session-wrap-suggest` 같은 skip identity는 registry에 `codex-skip`으로 남기고 reason을 필수로 적음
- 산출물:
  - list 출력 기준
  - audit FAIL/WARN 기준
  - maintainer repair scope
  - legacy registry cleanup policy
- 리뷰 게이트:
  - 같은 repo 상태를 `kit-list`, `kit-audit`, `kit-maintainer`가 서로 다른 vocabulary로 설명하지 않아야 한다.

### Wave D: pilot sibling generation

- 대상 패턴:
  - read-only subagent
  - write-capable subagent + contract
  - command -> skill
  - hook -> code + config pair
  - skip pattern
- 추천 pilot 세트:
  - `dev-architect`
  - `plan-prd-writer`
  - `dev-feature`
  - `dev-tdd-guard`
  - `session-wrap-suggest`
- 산출물:
  - 첫 실제 `src/codex` authoring source
  - 첫 실제 `pairing-registry` 엔트리
  - validate/list/audit 실행 결과
- 리뷰 게이트:
  - 최소 5가지 패턴이 실제 데이터로 검증되어야 한다.

### Wave E: installer / docs handoff

- 대상:
  - `scripts/setup.js`
  - `docs/guide/*`
  - `docs/meta-tooling/*`
  - 필요 시 `README.md`
- 잠글 결정:
  - installer는 Phase 4 이후 `src/codex`를 Codex source로 읽는다
  - guide와 meta-tooling 문서는 중앙 SSOT 결과만 반영한다
- 산출물:
  - installer 전환 계획
  - guide 반영 체크리스트
  - meta-tooling 반영 체크리스트
- 리뷰 게이트:
  - 더 이상 구형 `src/claude -> Codex path copy` 모델을 활성 문서가 설명하지 않아야 한다.

## pilot coverage 매트릭스

| 패턴 | 대표 identity | 검증 포인트 |
|------|---------------|------------|
| read-only subagent | `dev-architect` | `*.toml` 생성, companion contract 불필요 |
| write-capable subagent | `plan-prd-writer` | `*.toml` + `*.contract.json`, write boundary 검증 |
| command -> skill | `dev-feature` | Claude command와 Codex skill pairing, registry `paired` |
| hook pair | `dev-tdd-guard` | `*.js` + `*.hook.json`, validate pair completeness |
| skip | `session-wrap-suggest` | registry에 `codex-skip` + reason 기록, 대체 skill entry와 audit 일관성 검증 |

## 구현 순서

1. Wave A: `kit-create`와 scaffolding references 정렬
2. Wave B: `kit-validate`와 schema references 정렬
3. Wave C: `kit-list`, `kit-audit`, `kit-maintainer`, `pairing-registry` 정렬
4. Wave D: pilot sibling generation과 validation/audit 실행
5. Wave E: installer handoff와 문서 반영

## 리뷰 체크포인트

| 시점 | 확인 질문 | 기대 결과 |
|------|-----------|----------|
| Wave A 후 | `kit-create`가 stage 3 path 규칙과 일치하는가 | `commands/` direct copy, `agent .md`, hook single-file 생성이 사라짐 |
| Wave B 후 | `kit-validate`가 companion pair를 source validation으로 다루는가 | missing `*.hook.json`, missing `*.contract.json`은 FAIL이고, opposite-target sibling 부재는 FAIL이 아님 |
| Wave C 후 | list/audit/maintainer가 같은 registry vocabulary를 쓰는가 | `paired`, `codex-skip`, `codex-native-only`가 일관되게 사용되고, legacy `rule` entry는 WARN으로만 처리됨 |
| Wave D 후 | pilot 세트가 설계한 모든 패턴을 통과하는가 | 최소 5개 패턴이 실제 source + registry로 검증됨 |
| Wave E 후 | installer와 guide가 새 source 구조를 기준으로 설명하는가 | `src/codex` source adoption이 문서와 구현 모두에 반영됨 |

## 현재 상태를 기준으로 한 우선순위 메모

- `src/codex`는 아직 `.gitkeep`만 있으므로, 초기 구현 목표는 전량 migration이 아니라 pilot sibling 세트와 기준 검증이다.
- `src/pairing-registry.json`은 비어 있으므로, 첫 실제 생성/갱신 흐름이 중요한 검증 포인트다.
- `CLAUDE.md`는 현재 없으므로, memory / instruction surface는 필요 시 후속 구현 단계에서 확장한다.
- `scripts/setup.js`는 여전히 `src/claude`를 읽는 과도기 모델이므로, installer 연계는 Wave E의 핵심 작업이다.

## 구현 이후 반영 대상

- `docs/guide`
- `docs/meta-tooling`
- `docs/guide/09-architecture.md`
- `docs/guide/10-glossary.md`
- 필요 시 `README.md`

## acceptance 기준

- `08~14` 문서만 읽어도 구현자가 작업을 시작할 수 있다.
- 모든 Claude 기능이 Codex 대응 방식 하나로 귀결된다.
- `src/codex` sibling 설계가 required / optional / shared-guidance / skip까지 결정 완료 상태다.
- `hook`은 code + config pair, write-capable `subagent`는 TOML + contract pair로 설명된다.
- `.claude` 메타 툴 확장 포인트가 명시된다.
- pilot coverage 매트릭스가 실제 구현 시작 순서를 안내한다.
- 후속 반영 문서 목록이 확정된다.

## 참고 다이어그램

- 전체 파이프라인 비교와 pilot 흐름은 [15-pipeline-diagrams.md](./15-pipeline-diagrams.md)에서 시각적으로 확인한다.

## 단계 종료 체크

| 단계 | 종료 조건 |
|------|-----------|
| 1단계 | Claude 기능 카탈로그 완성 |
| 2단계 | guide 판정표 완성 |
| 3단계 | Codex target + sibling catalog 완성 |
| 4단계 | tooling requirements와 workflow 고정 |
| 5단계 | 첫 구현 세트와 후속 반영 문서 목록 처리 |
