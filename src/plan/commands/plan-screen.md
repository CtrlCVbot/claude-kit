# /plan-screen

IDEA-{NNN} 스크리닝 실행. RICE 프레임워크 기반으로 아이디어를 평가하고 Go/Hold/Kill 판정을 내립니다.

## Usage

```
/plan-screen IDEA-042               # 특정 아이디어 스크리닝
/plan-screen IDEA-042 --rescore     # 기존 스크리닝 재평가
/plan-screen --pending              # 미스크리닝 아이디어 일괄 스크리닝
```

## Workflow

1. **대상 확인**: `.plans/ideas/IDEA-{NNN}.md` 개별 파일에서 로드, `backlog.md` 인덱스에서 스크리닝 이력 확인
2. **에이전트 스폰**: `plan-idea-screener` 에이전트를 Task tool로 스폰
   - 5축 평가: 비즈니스 가치(30%), 사용자 영향(25%), 기술적 실현성(20%), 전략적 정렬(15%), 긴급도(10%)
   - 가중 합산 점수 산출 (0-100)
   - Go(70+) / Hold(40-69) / Kill(<40) 판정
3. **결과 기록**: `.plans/ideas/screening-matrix.md` 업데이트
4. **PCC-01 검증**: 모든 아이디어가 스크리닝되었는지 확인
5. **Human Checkpoint**: 점수 확인/오버라이드 기회 제공

## Output

- `.plans/ideas/screening-matrix.md`에 점수 및 판정 기록
- Lite/Standard 카테고리 판정 포함
- 다음 단계 안내: `/plan-draft IDEA-{NNN}`
