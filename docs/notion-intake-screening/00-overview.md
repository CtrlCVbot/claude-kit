# Notion Pain-Point Intake -> Screening Pipeline v1

> 이 문서는 **설계 문서**이며 구현 문서가 아니다. v1은 **이중 저장 + 반자동**을 전제로 하며, `오류/버그`와 `기능/화면 변경 요청`을 서로 다른 경로로 처리한다. 로컬 `.plans`는 생성 근거(source of creation)로, Notion screening DB는 외부 협업용 미러로 둔다.

## Review Questions

- bug/error 자동 경로 기준이 적절한가?
- change-request clustering 기준이 과도하지 않은가?
- v1에서 `approved`까지 가지 않고 `screened`에서 멈추는 결정이 적절한가?
- local `.plans`와 screening DB의 역할 구분이 명확한가?
- 새 command/agent/hook 제안의 책임 분리가 자연스러운가?

---

## 1. 배경과 문제 정의

현재 `claude-kit`의 `plan` 도메인은 로컬 파일 기반 planning workflow를 중심으로 설계되어 있다.

- P1 `/plan-idea`: 자연어 아이디어를 `.plans/ideas/00-inbox/`에 구조화 등록
- P2 `/plan-screen`: 등록된 아이디어를 screening하고 `.plans/ideas/10-screening/`에 기록
- 이후 `/plan-draft`, `/plan-prd`, `/plan-wireframe`, `/plan-stitch`, `/plan-bridge`로 이어짐

이 구조는 로컬 planning workflow에는 적합하지만, Notion에 쌓이는 실제 pain-point 운영 데이터를 intake하는 시나리오는 직접 다루지 않는다.

현재 부족한 점은 아래와 같다.

1. Notion pain-point DB를 직접 읽어오는 intake 진입점이 없다.
2. 여러 pain-point row를 하나의 idea 후보로 그룹화하는 전용 단계가 없다.
3. screening 결과를 Notion screening DB로 publish하는 개념이 없다.
4. `오류/버그`와 `기능/화면 변경 요청`을 다른 정책으로 처리하는 흐름이 없다.

즉, 현재 `plan-idea -> plan-screen`는 "사람이 정리한 아이디어"를 잘 다루지만, "운영 데이터에서 들어오는 다수의 pain-point"를 다루는 intake layer가 비어 있다.

---

## 2. 목표와 비목표

### 목표

- Notion pain-point row를 intake할 수 있는 설계 방향을 제안한다.
- `bug/error fast-path`와 `change-request cluster-path`를 분리한다.
- screening DB publish 구조를 정의한다.
- 기존 `plan` 파이프라인과 충돌 없이 확장 가능한 방향을 제시한다.
- 리뷰어가 정책과 책임 분리를 빠르게 검토할 수 있도록 문서를 구조화한다.

### 비목표

- 실제 Notion API 구현
- 실제 command/agent/skill/hook/rule 추가
- `scripts/setup.js`, `scripts/codex-hook-compat.js`, `profile.json` 스키마 구현
- reverse sync
- auto-approval
- full automation

이 문서는 "무엇을 구현해야 하는지"를 정리하는 문서이며, "지금 바로 어떤 파일을 수정해 동작시키는지"까지는 다루지 않는다.

---

## 3. 설계 원칙

이번 설계는 아래 원칙을 고정한다.

1. **기존 P1/P2를 제거하지 않는다.** 새 기능은 `plan` 도메인 앞단의 intake mini-pipeline으로 분리한다.
2. **local `.plans`를 생성 근거로 유지한다.** screening DB는 외부 협업/조회용 mirror다.
3. **bug/error와 change-request를 다르게 다룬다.** 전자는 빠르게 screening으로 보내고, 후자는 grouping과 human review를 거친다.
4. **v1은 `screened`까지만 책임진다.** `approved -> P3 /plan-draft` 자동 진입은 후속 과제로 남긴다.
5. **정책은 문서와 skill 중심으로 먼저 고정한다.** rule/hook/code는 그다음 단계다.

---

## 4. 추천안: plan 도메인 내부의 intake mini-pipeline 추가

추천안은 기존 `plan` 도메인 안에 intake 전용 미니 파이프라인을 추가하는 것이다.

- 기존 `P1 /plan-idea`, `P2 /plan-screen`는 유지한다.
- 새 intake 흐름은 "외부 운영 데이터 정리"에만 집중한다.
- intake 결과는 기존 planning artifact 포맷을 최대한 재사용한다.

### 추천 구조

```text
Notion pain-point DB
        |
        v
  [Fetch / Normalize]
        |
        v
  [Classify / Route]
     |            |
     |            +--> Bug / Error Fast-Path
     |                    |
     |                    v
     |              local IDEA + SCREENING
     |                    |
     |                    v
     |              screening DB publish
     |
     +--> Change Request Cluster-Path
                      |
                      v
               cluster candidates
                      |
                      v
                human review
                      |
                      v
              selected/rewritten idea
                      |
                      v
              local SCREENING + publish
```

### 단계 정의

| 단계 | 입력 | 처리 내용 | 출력 | 사람 검토 | 기존 자산 연결 |
|---|---|---|---|---|---|
| `Fetch/Normalize` | Notion pain-point row | row를 공통 스키마로 정리하고 provenance를 붙임 | normalized row set | 없음 | 향후 `plan-idea`로 흘려보낼 수 있는 형태 준비 |
| `Classify/Route` | normalized row set | `bug/error` vs `change-request` 분류 | fast-path 대상, cluster-path 대상 | 없음 | `plan-screen` 입력 전 분기 정책 추가 |
| `Cluster/Review` | change-request row set | 같은 화면/기능/의도 기준으로 cluster 후보 생성 | candidate idea list | 필요 | 사람이 선택하거나 새 idea로 재작성 |
| `Screening/Sync` | bug fast-path 결과, 승인된 cluster 결과 | local artifact 생성과 screening DB publish | screened local artifact + publish record | bug는 없음, change는 있음 | `plan-screen` 산출물 포맷 재사용 |

---

## 5. 처리 경로 1: Bug/Error Fast-Path

`Bug/Error Fast-Path`는 "현재 동작이 깨졌거나 잘못된 상태"를 빠르게 screening 대상으로 넘기기 위한 경로다.

### 의도

- 운영 pain-point 중 우선 대응 가치가 높은 오류성 이슈를 별도 묶기 없이 빠르게 정리한다.
- row 단위를 보존해 추적성을 유지한다.
- local artifact에도 `fix` 성격이 드러나게 남긴다.

### 처리 방식

1. pain-point row를 개별 단위로 정리한다.
2. `bug/error`로 분류되면 cluster를 거치지 않는다.
3. local `IDEA`와 `SCREENING` 산출물로 변환한다.
4. screening DB publish 대상으로 바로 올린다.

### v1 정책

- 자동 upload 허용
- 기본 category는 `fix`
- 기본 intake mode는 `bug-fast-path`
- 기본 종료 상태는 `screened`

### 분류 기준 예시

아래 신호가 강하면 `bug/error`로 분류한다.

- "오류", "에러", "실패", "깨짐", "동작 안 함"
- 재현 스텝 또는 증상 서술
- 로그/에러 메시지 포함
- 원래 되던 기능이 현재 망가졌다는 표현

같은 row에 개선 요청이 섞여 있어도, 핵심이 "현재 동작이 깨졌다"면 `bug/error`를 우선한다.

---

## 6. 처리 경로 2: Change Request Cluster-Path

`Change Request Cluster-Path`는 기능 추가, UX 개선, 화면 변경, 정보 구조 조정 같은 요청을 한 번에 묶어서 idea 후보로 바꾸는 경로다.

### 의도

- 비슷한 요청이 여러 row로 쌓일 때, 같은 문제를 반복적으로 screening하지 않도록 한다.
- 사람 검토를 통해 "어떤 row들이 정말 하나의 idea인가"를 결정하게 한다.

### 처리 방식

1. `change-request` row를 묶을 후보로 모은다.
2. 같은 화면/기능/사용자 의도를 기준으로 cluster 후보를 만든다.
3. 여러 candidate idea를 리스트로 정리한다.
4. 사람이 아래 중 하나를 선택한다.
   - 그대로 approve
   - merge
   - split
   - discard
   - 새 idea로 재작성
5. 확정된 idea만 local artifact와 screening DB로 반영한다.

### cluster 기준

cluster 판단에는 아래 키를 우선 사용한다.

- `productArea`
- `screen`
- `feature`
- `userIntent`

권장 규칙은 아래와 같다.

- 같은 화면이라도 사용자 outcome이 다르면 split한다.
- 같은 기능이라도 문제 맥락이 다르면 split한다.
- hard key 4개 중 3개 이상이 맞고, 같은 사용자 outcome으로 요약 가능할 때만 merge를 허용한다.

### v1 정책

- 자동 publish 금지
- human checkpoint 필수
- 기본 category는 `feature` 또는 `improvement`
- 기본 intake mode는 `cluster-reviewed`

---

## 7. 제안 컴포넌트

이번 문서화 범위에는 실제 추가가 아니라 **설계 제안**만 포함한다.

### 7.1 Skill 제안

#### `plan-notion-intake-workflow`

역할:

- intake 기준 정리
- `bug/error` 분류 기준 정리
- cluster merge/split 기준 정리
- publish 규칙과 human checkpoint 정책 정리

이 skill은 구현보다 먼저 정책을 안정화하는 데 목적이 있다.

### 7.2 Agent 제안

#### `plan-notion-intake-reader`

- Notion pain-point row fetch와 normalize 담당
- provenance와 source row metadata 정리 담당

#### `plan-change-clusterer`

- change-request row clustering 담당
- candidate idea list 작성 담당

#### `plan-screening-publisher`

- local screening 결과를 screening DB에 반영하는 publish 담당
- dedupe와 publish 상태 기록 담당

### 7.3 Command 제안

#### `/plan-intake-sync`

- pain-point DB fetch
- normalize
- classify
- bug fast-path 처리
- change-request cluster 후보 생성

#### `/plan-intake-review`

- cluster 후보 human checkpoint
- approve/merge/split/discard/rewrite 확정

#### `/plan-screen-sync`

- local screening artifact를 screening DB로 publish
- 실패 항목 재시도 및 publish 상태 갱신

### 7.4 Hook 제안

#### `plan-notion-env-guard`

- `NOTION_API_TOKEN`
- pain-point DB id
- screening DB id
- property map

위 필수 설정 누락 시 intake/publish 계열 작업을 차단하는 역할을 가정한다.

#### `plan-screening-dedupe-guard`

- 이미 publish한 source row set
- 이미 사용한 cluster fingerprint

중복 업로드를 막는 역할을 가정한다.

### 7.5 Rule/Policy 제안

v1에서는 독립 rule보다 정책 문서/skill로 두는 편이 현실적이다.

이유는 아래와 같다.

- 현재 구조상 rule은 core 정책 요약 중심이다.
- 새 흐름은 실행 전 정책 합의가 더 중요하다.
- Codex target에서는 rule 배포보다 skill/prompt 레벨의 문서화가 더 직접적이다.

### 7.6 Team 제안

새 팀을 만드는 것보다 기존 구조를 재사용하는 편이 적절하다.

- owner: `Planning Studio`
- support: `Assurance Desk`

권장 책임 분리는 아래와 같다.

| 역할 | 책임 |
|---|---|
| Planning Studio | intake 운영, cluster 검토, local planning artifact 정합성 |
| Assurance Desk | publish policy 검토, dedupe/검증 기준 정리, 운영 리스크 검토 |

---

## 8. 데이터 모델 개념

이번 문서는 구현이 아니라 개념 설계이므로, 필드 매핑도 예시 수준으로 정의한다.

### 8.1 pain-point row에서 읽고 싶은 정보

| 필드 | 설명 |
|---|---|
| `title` | pain-point 제목 |
| `description` | 문제 설명 |
| `type` | 오류/요청/개선 등 원천 분류 |
| `productArea` | 제품 영역 |
| `screen` | 화면 이름 |
| `feature` | 기능 이름 |
| `severity` | 심각도 |
| `reporter` | 제보자 |
| `createdAt` | 등록 시점 |
| `labels` | 태그 |
| `sourceUrl` | 원문 링크 |

### 8.2 screening DB에 기록하고 싶은 정보

| 필드 | 설명 |
|---|---|
| `title` | screening 대상으로 정제된 제목 |
| `decision` | screening 결과 또는 제안 |
| `category` | `fix` / `feature` / `improvement` 등 |
| `sourceRowIds` | 원본 pain-point row id 목록 |
| `sourceCount` | 묶인 row 개수 |
| `localIdeaId` | local `IDEA-*` id |
| `localScreeningId` | local `SCREENING-*` id |
| `runId` | intake 실행 단위 id |
| `reviewMode` | `bug-fast-path` 또는 `cluster-reviewed` |
| `publishStatus` | publish 상태 |

### 8.3 local `.plans`에 남기고 싶은 메타데이터

| 필드 | 설명 |
|---|---|
| `source` | `notion-pain-point` 고정 |
| `sourceRowIds` | 원본 row id 목록 |
| `intakeRunId` | intake 실행 id |
| `intakeMode` | `bug-fast-path` 또는 `cluster-reviewed` |
| `publishStatus` | `pending`, `published`, `failed` 등 |

### 8.4 로컬과 외부 저장소의 역할

| 저장소 | 역할 |
|---|---|
| local `.plans` | 생성 근거, planning 파이프라인 연결, 추적 가능한 내부 artifact |
| Notion screening DB | 외부 협업용 미러, screening 결과 공유, 운영 가시성 |

v1에서는 local이 먼저 생성되고, screening DB는 그 결과를 반영하는 구조를 추천한다.

---

## 9. 정책 결정

문서에서 명확히 고정할 정책은 아래와 같다.

1. v1은 **one-way sync**다.
2. local `.plans`가 생성 근거다.
3. screening DB는 publish mirror다.
4. `bug/error`는 자동 경로를 허용한다.
5. `change-request`는 human checkpoint가 필수다.
6. v1은 `screened`까지만 책임진다.
7. `approved -> P3 /plan-draft` 자동 진입은 후속 과제다.

이 정책은 특히 "screening DB를 최종 SSOT로 오해하지 않도록" 하기 위해 중요하다.

---

## 10. 대안 비교

| 대안 | 설명 | 장점 | 단점 | 현재 레포 적합도 |
|---|---|---|---|---|
| 기존 `/plan-idea`, `/plan-screen` 확장 | 현재 command에 intake, clustering, publish까지 흡수 | 수정 지점이 적어 보임 | 책임이 섞이고 복잡도가 급증 | 보통 |
| intake mini-pipeline 추가 | 기존 P1/P2는 유지하고 앞단에 intake layer 추가 | 역할 분리가 명확하고 기존 자산 재사용 가능 | 문서와 개념이 하나 더 생김 | **높음** |
| 외부 MCP/완전 자동 워커 중심 | 외부 연동을 중심으로 별도 자동화 흐름 구축 | 장기적으로 자동화 폭이 큼 | 초기 운영 복잡도 높고 정책 고정이 어려움 | 낮음 |

### 추천 이유

`intake mini-pipeline 추가`는 현재 `claude-kit`의 planning 구조를 유지하면서 외부 운영 데이터 intake라는 새로운 책임을 가장 자연스럽게 분리한다.

---

## 11. 구현 전 검토 포인트

구현 전에 아래 항목은 반드시 리뷰가 필요하다.

### 11.1 Notion DB property naming variability

- 팀마다 property 이름이 다를 수 있다.
- 구현 시 하드코딩보다 property mapping이 필요할 가능성이 높다.

### 11.2 dedupe 기준의 안정성

- 같은 row를 여러 번 읽었을 때 중복 publish를 막아야 한다.
- 단순 제목 비교만으로는 dedupe가 약할 수 있다.

### 11.3 cluster merge 기준의 과잉 묶음 위험

- 같은 화면이라는 이유만으로 서로 다른 요구를 합치면 안 된다.
- 특히 "문제는 같지만 원하는 해결 방식은 다른" row를 주의해야 한다.

### 11.4 screening DB를 SSOT처럼 오해할 가능성

- 운영 협업 툴은 자주 수정된다.
- v1에서는 local `.plans`를 생성 근거로 두는 이유를 분명히 해야 한다.

### 11.5 hook 추가 시 setup/compat 수정 필요

- 훅은 문서만 추가해서는 배포되지 않는다.
- 설치기와 Codex hook compat 레이어를 함께 고려해야 한다.

### 11.6 Codex target에서 rule 배포가 약한 구조적 제약

- 정책을 code rule보다 skill/document로 먼저 고정하는 이유다.

---

## 12. 단계별 롤아웃 제안

이 문서는 구현 문서가 아니므로, 아래 순서는 "나중에 구현한다면"의 추천 순서다.

1. **문서/정책 확정**
   - intake flow, 분류 기준, cluster 기준, publish 정책 합의
2. **local dry-run artifact 생성**
   - Notion fetch 결과를 local snapshot과 candidate 문서로만 남김
3. **screening publish 연결**
   - local artifact를 screening DB로 반영
4. **운영 시범 적용**
   - 실제 pain-point 데이터 몇 주기 기준으로 운영
5. **후속 확장 검토**
   - `approved` 자동 진입, reverse sync, 더 강한 자동화 검토

---

## 13. 관련 문서와 연결

| 문서 | 역할 |
|---|---|
| [guide overview](../guide/00-overview.md) | 전체 시스템 개요 |
| [planning pipeline](../guide/01-planning-pipeline.md) | 기존 P1~P8 planning 흐름 |
| [idea management](../guide/02-idea-management.md) | local idea 등록 구조 |
| [screening](../guide/03-screening.md) | local screening 구조 |
| [reference profile](./01-reference-profile.md) | 팀 오케스트레이션 관점의 분리 문서 |

---

## 14. 결론

이 설계는 현재 `claude-kit`의 `plan` 도메인 자산을 재사용하면서도, Notion 기반 pain-point intake라는 새로운 요구를 별도 책임으로 분리하는 방향이다.

핵심은 아래 세 가지다.

1. `bug/error`와 `change-request`를 같은 흐름으로 다루지 않는다.
2. local `.plans`와 screening DB의 역할을 명확히 나눈다.
3. v1은 `screened`까지로 제한해 정책과 운영 모델을 먼저 안정화한다.

구현 전 최종적으로 리뷰해야 할 결정은 아래와 같다.

- bug/error 분류 기준
- cluster merge 기준
- local vs screening DB의 최종 책임 경계
