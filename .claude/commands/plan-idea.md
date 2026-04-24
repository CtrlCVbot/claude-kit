# /plan-idea

아이디어 등록, 조회, 관리. 사용자의 아이디어를 구조화하여 `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` 개별 파일로 등록합니다.

## Usage

```
/plan-idea                                    # 대화형 아이디어 입력
/plan-idea "검색 기능 개선"                     # 직접 아이디어 등록
/plan-idea list                               # 등록된 아이디어 목록 조회
/plan-idea IDEA-20260325-001                  # 특정 아이디어 상세 조회
/plan-idea list --status=new                  # 상태별 필터링
/plan-idea list --folder=00-inbox             # 폴더별 필터링
/plan-idea "검색 기능 개선" --epic=EPIC-20260422-001  # Epic 에 자동 연결 (Opt-in, IMP-AGENT-010)
/plan-idea "검색 기능 개선" --dry-run           # 파일 변경 없이 시뮬레이션 (T-BKLG-02, v2.6.0+)
```

## Workflow

1. **입력 분석**: 사용자 입력이 등록/조회/관리 중 어떤 작업인지 판별
2. **등록 시**: `plan-idea-collector` 에이전트를 Task tool로 스폰
   - 자연어 → 구조화된 아이디어 문서 변환
   - 카테고리 자동 분류 (feature / improvement / fix / research)
   - 기존 아이디어 유사도 분석 → 중복 방지
   - `IDEA-{YYYYMMDD}-{NNN}` ID 자동 채번
3. **목록 조회 시**: `.plans/ideas/backlog.md` 인덱스 읽기 → 필터링 → 포맷팅
4. **상세 조회 시**: `backlog.md` 인덱스에서 위치 확인 → 해당 폴더의 `IDEA-{YYYYMMDD}-{NNN}.md` 읽기 → 포맷팅
5. **결과 보고**: 등록된 아이디어 요약 또는 목록 출력

## Flags

- `--epic=EPIC-{YYYYMMDD}-{NNN}` — Epic 에 자동 연결 (Opt-in, IMP-AGENT-010)
- `--dry-run` — 파일 변경 없이 "이렇게 등록될 것" 시뮬레이션 (T-BKLG-02, Backlog)
  - 공통 규칙: [`dry-run-mode.md`](../../core/rules/dry-run-mode.md)
  - 출력: `[DRY-RUN]` 접두사 + 검증 결과 + 생성될 파일 + 다음 단계
  - 에이전트 `plan-idea-collector` 는 `dry_run: true` 컨텍스트 수신 시 Write skip
  - 현재 **문서 정의 완료**, 로직 구현은 v2.6.0+ 승격 시

## Output

- 등록: `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` 파일 생성 + `backlog.md` 인덱스 업데이트
- 목록 조회: `backlog.md` 인덱스 기반 목록 출력 (위치 컬럼으로 현재 폴더 확인 가능)
- 상세 조회: 해당 폴더의 개별 파일 기반 상세 출력
- 다음 단계 안내: `/plan-screen IDEA-{YYYYMMDD}-{NNN}`
