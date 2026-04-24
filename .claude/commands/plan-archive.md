# /plan-archive

완료된 기능의 산출물을 아카이빙한다.
원본 파일을 `archive/{slug}/sources/`로 이동하고, 통합 번들(`ARCHIVE-{KEY}.md`)을 생성한다.

`plan-archive-workflow` 스킬을 참조하여 전체 워크플로우를 실행한다.

## Usage

```bash
/plan-archive {slug}                    # 기능 아카이빙 실행
/plan-archive list                      # 아카이브된 기능 목록
/plan-archive show {slug}               # 아카이브 번들 요약 표시
/plan-archive status                    # 아카이빙 가능한 기능 목록
/plan-archive {slug} --feature F{N}     # 멀티 피처 중 개별 서브 피처 아카이브
```

## Workflow

### 아카이빙 실행 (`/plan-archive {slug}`)

1. **완료 검증**: IDEA 파일의 파이프라인 이력에서 모든 단계 완료 확인
   - Lite: P1, P2, P3, P5, P7 + Dev
   - Standard: P1~P7 + Dev
2. **소스 수집**: 슬러그로 관련 파일 탐색 (ideas, features, wireframes, prd, stitch, bridge)
3. **수집 목록 표시**: 사용자에게 이동할 파일 목록 확인
4. **디렉토리 생성**: `archive/{slug}/`, `sources/`, `improvements/`
5. **원본 이동**: `git mv`로 원본 파일을 `sources/`로 이동
6. **번들 생성**: `ARCHIVE-{KEY}.md` 생성 (sources/ 내 파일에서 인라인)
7. **인덱스 갱신**:
   - `archive/index.md` 행 추가
   - `backlog.md` 상태 → `archived`, 경로 → archive 번들
   - `screening-matrix.md` 경로 갱신
8. **빈 디렉토리 정리**: 원본 이동 후 비어진 디렉토리 삭제
9. **결과 표시**: 번들 경로, 이동 파일 수, 갱신된 인덱스 표시

### 목록 조회 (`/plan-archive list`)

1. `.plans/archive/index.md` 읽기
2. 테이블 형식으로 표시

### 번들 요약 (`/plan-archive show {slug}`)

1. `ARCHIVE-{KEY}.md` 읽기
2. 메타데이터 + 섹션 목록 + 개선이력 요약 표시

### 아카이빙 대상 (`/plan-archive status`)

1. `.plans/features/active/` 스캔
2. 각 기능의 파이프라인 완료 상태 확인
3. 완료된 기능을 "아카이빙 가능"으로 표시
4. 미완료 기능은 잔여 단계와 함께 표시

## Output

- **아카이브 번들**: `.plans/archive/{slug}/ARCHIVE-{KEY}.md`
- **원본 보관**: `.plans/archive/{slug}/sources/`
- **개선요청 디렉토리**: `.plans/archive/{slug}/improvements/`
- **다음 단계**: `/plan-improve {slug} "제목"` (개선요청 시)
