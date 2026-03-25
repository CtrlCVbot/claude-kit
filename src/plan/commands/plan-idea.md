# /plan-idea

아이디어 등록, 조회, 관리. 사용자의 아이디어를 구조화하여 `.plans/ideas/backlog.md`에 등록합니다.

## Usage

```
/plan-idea                          # 대화형 아이디어 입력
/plan-idea "검색 기능 개선"          # 직접 아이디어 등록
/plan-idea list                     # 등록된 아이디어 목록 조회
/plan-idea IDEA-042                 # 특정 아이디어 상세 조회
/plan-idea list --status=draft      # 상태별 필터링
```

## Workflow

1. **입력 분석**: 사용자 입력이 등록/조회/관리 중 어떤 작업인지 판별
2. **등록 시**: `plan-idea-collector` 에이전트를 Task tool로 스폰
   - 자연어 → 구조화된 아이디어 문서 변환
   - 카테고리 자동 분류 (feature / improvement / fix / research)
   - 기존 아이디어 유사도 분석 → 중복 방지
   - IDEA-{NNN} ID 자동 채번
3. **조회 시**: `.plans/ideas/backlog.md` 읽기 → 필터링 → 포맷팅
4. **결과 보고**: 등록된 아이디어 요약 또는 목록 출력

## Output

- 등록: `.plans/ideas/backlog.md`에 IDEA-{NNN} 항목 추가
- 조회: 아이디어 목록 또는 상세 정보 출력
- 다음 단계 안내: `/plan-screen IDEA-{NNN}`
