# P1: 아이디어 관리 (`/plan-idea`)

## 개요

아이디어를 구조화하여 `.plans/ideas/00-inbox/`에 개별 파일로 등록하는 단계다. 사용자의 자연어 입력(페인포인트, 기능 요청, 메모 등)을 `plan-idea-collector` 에이전트가 파싱하고, 카테고리 분류/중복 탐지/태그 추천을 수행한 뒤 `IDEA-{YYYYMMDD}-{NNN}` ID를 부여하여 개별 파일과 `backlog.md` 인덱스에 기록한다. 이 단계의 산출물은 P2 스크리닝(`/plan-screen`)의 입력이 된다.

## 사용법

```
/plan-idea "브로커별 정산 엑셀 내보내기"    # 직접 등록
/plan-idea ./notes/meeting-2026-03-25.md   # 파일에서 아이디어 추출
/plan-idea list                            # 목록 조회
/plan-idea IDEA-20260325-001               # 상세 조회
/plan-idea list --status=new               # 상태별 필터
/plan-idea list --folder=00-inbox          # 폴더별 필터
```

- **직접 등록**: 자연어 텍스트를 입력하면 `plan-idea-collector` 에이전트가 구조화하여 등록한다.
- **파일 입력**: 파일 경로를 전달하면 파일 내용에서 복수 아이디어를 추출할 수 있다.
- **목록 조회**: `backlog.md` 인덱스를 읽어 필터링/포맷팅하여 출력한다.
- **상세 조회**: 인덱스에서 위치를 확인한 뒤 해당 폴더의 개별 파일을 읽는다.

## ID 체계

| 항목 | 규칙 |
|------|------|
| **형식** | `IDEA-{YYYYMMDD}-{NNN}` |
| **YYYYMMDD** | 등록일 (예: 20260325) |
| **NNN** | 일별 순번, 001부터 시작 |
| **채번** | 당일 기존 최대 순번 + 1 |
| **삭제/재채번** | 금지 (결번 허용) |

예시:
- `IDEA-20260325-001` -- 2026-03-25 첫 번째 아이디어
- `IDEA-20260325-002` -- 2026-03-25 두 번째 아이디어
- `IDEA-20260326-001` -- 2026-03-26 첫 번째 아이디어

## 폴더 구조

```
.plans/ideas/
  00-inbox/              <-- 신규 (new)
  10-screening/          <-- 스크리닝 중/완료 (screening/screened)
  20-approved/           <-- 승인 완료 (approved)
  90-archive/            <-- 반려/보류 (rejected/on-hold)
  backlog.md             <-- 전체 인덱스 테이블
  screening-matrix.md    <-- 스크리닝 인덱스
```

폴더가 없으면 `plan-idea-collector`가 자동 생성한다.

## 상태 전환

```
new ──> screening ──> screened ──> approved ──> (P3 진입)
                          |
                          +-----> on-hold ─── (재검토) ──> screening
                          |
                          +-----> rejected
```

| 상태 | 설명 | 폴더 |
|------|------|------|
| `new` | 신규 등록 | `00-inbox/` |
| `screening` | RICE 스크리닝 진행 중 | `10-screening/` |
| `screened` | 스크리닝 완료, 승인 대기 | `10-screening/` |
| `approved` | 사용자 명시적 승인 | `20-approved/` |
| `on-hold` | 보류 (90일 후 archive) | `90-archive/` |
| `rejected` | 반려 (90일 후 archive) | `90-archive/` |

### 폴더 전환 규칙

| 이벤트 | 이동 | 상태 |
|--------|------|------|
| `/plan-idea` 등록 | -> `00-inbox/` | `new` |
| `/plan-screen` 시작 | `00-inbox/` -> `10-screening/` | `screening` |
| 스크리닝 완료 | `10-screening/`에 유지 | `screened` |
| 사용자 승인 | `10-screening/` -> `20-approved/` | `approved` |
| 사용자 보류/반려 | `10-screening/` -> `90-archive/` | `on-hold` / `rejected` |
| 보류 재스크리닝 | `90-archive/` -> `10-screening/` | `screening` |

## 아이디어 문서 형식

개별 파일 경로: `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md`

```markdown
### IDEA-20260325-001: 브로커별 정산 엑셀 내보내기
- **카테고리**: feature
- **태그**: 정산, 엑셀, 브로커
- **상태**: new
- **등록일**: 2026-03-25

#### 설명
월별 정산 내역을 브로커별로 분리하여 엑셀 파일로 내보내는 기능.
현재는 수동으로 데이터를 복사하여 엑셀을 만들고 있어 시간이 많이 소요됨.

#### 기대 효과
정산 업무 시간 50% 이상 절감, 수작업 오류 방지.

#### 관련 아이디어
- 없음
```

### 카테고리 정의

| 카테고리 | 설명 | 예시 |
|----------|------|------|
| `feature` | 완전히 새로운 기능 | 정산 엑셀 내보내기, 대시보드 |
| `improvement` | 기존 기능 개선 | 검색 속도 개선, UI 개선 |
| `fix` | 버그 수정 | 정산 금액 오류, 로그인 실패 |
| `research` | 기술 조사/리서치 | 레거시 API 마이그레이션 전략 |

## backlog.md 인덱스

`backlog.md`는 인덱스 전용 테이블이다. 개별 파일의 위치를 참조한다.

```markdown
# Idea Backlog
> 마지막 채번: IDEA-20260325-002

| ID | 제목 | 카테고리 | 상태 | 위치 | 등록일 |
|---|---|---|---|---|---|
| IDEA-20260325-001 | 브로커별 정산 엑셀 내보내기 | feature | new | 00-inbox | 2026-03-25 |
| IDEA-20260325-002 | 배차 화면 로딩 속도 개선 | improvement | new | 00-inbox | 2026-03-25 |
```

## 워크플로우

```
사용자 입력 (텍스트 / 파일 / list / ID)
       |
       v
  입력 유형 판별
       |
       +--- 등록 요청 ---+
       |                  v
       |       plan-idea-collector (sonnet)
       |          |
       |          +-- 1. 폴더 구조 확인 (없으면 자동 생성)
       |          +-- 2. 마이그레이션 체크 (모놀리식 -> 개별 파일)
       |          +-- 3. 오늘 날짜 + ID 채번
       |          +-- 4. 유사 아이디어 탐색 (Glob + Grep)
       |          +-- 5. 카테고리 분류 + 태그 추천
       |          +-- 6. 개별 파일 생성 (00-inbox/)
       |          +-- 7. backlog.md 인덱스 업데이트
       |          |
       |          v
       |       등록 완료 보고
       |
       +--- list 요청 ---> backlog.md 읽기 -> 필터링 -> 출력
       |
       +--- ID 조회 -----> backlog.md에서 위치 확인 -> 개별 파일 읽기 -> 출력
```

## plan-idea-collector 에이전트

| 항목 | 값 |
|------|-----|
| **모델** | sonnet |
| **역할** | 아이디어를 구조화된 백로그 항목으로 변환 |
| **읽기 경로** | `.plans/ideas/backlog.md`, `.plans/ideas/*/IDEA-*.md` |
| **쓰기 경로** | `.plans/ideas/00-inbox/IDEA-*.md`, `.plans/ideas/backlog.md` |
| **제한** | 코드 수정 금지, `.plans/ideas/` 외 파일 변경 금지 |
| **도구** | Read, Grep, Glob, Write, Edit, Bash |

### 주요 동작

1. **입력 파싱** -- 자연어에서 제목, 설명, 카테고리, 태그를 추출한다.
2. **중복 검사** -- 기존 아이디어 제목/키워드와 유사도를 비교하여 중복 시 경고한다.
3. **ID 채번** -- `date '+%Y%m%d'`로 오늘 날짜 확인 후, Glob으로 당일 최대 순번을 찾아 +1 한다.
4. **카테고리 자동 분류** -- 내용 분석으로 자동 부여하되, 불확실하면 사용자에게 확인한다.
5. **상태 초기값** -- `new`로 설정한다.

### 자동 마이그레이션 가드

`backlog.md`에 `#### 설명` 섹션이 존재하면 기존 모놀리식 형식으로 판단한다. 이 경우 각 섹션을 파싱하여 `00-inbox/` 하위에 개별 파일을 생성하고, `backlog.md`를 인덱스 전용 테이블로 재작성한다. 마이그레이션 완료 후 정상 등록 플로우를 진행한다.

## 관련 문서

| 문서 | 설명 |
|------|------|
| [01-planning-pipeline](./v6-claude/phase-2-planning/00-planning-pipeline-overview.md) | 파이프라인 전체 아키텍처 |
| [03-screening](./v6-claude/phase-2-planning/02-plan-screen.md) | P2: RICE 스크리닝 (다음 단계) |
