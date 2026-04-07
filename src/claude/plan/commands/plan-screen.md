# /plan-screen

IDEA-{YYYYMMDD}-{NNN} 스크리닝 실행. RICE 프레임워크 기반으로 아이디어를 평가하고 Go/Hold/Kill 판정을 **제안**한 뒤, 사용자 **명시적 승인**을 거쳐 상태를 전환합니다.

## Usage

```
/plan-screen IDEA-20260325-001          # 특정 아이디어 스크리닝
/plan-screen IDEA-20260325-001 --rescore  # 기존 스크리닝 재평가
/plan-screen --pending                  # 미스크리닝 아이디어 일괄 스크리닝
/plan-screen --pending --auto-approve   # 일괄 스크리닝 + Go 판정 자동 승인
```

## Workflow

1. **대상 확인**: `backlog.md` 인덱스에서 위치 확인 → 해당 폴더의 IDEA 파일 로드
2. **에이전트 스폰**: `plan-idea-screener` 에이전트를 Task tool로 스폰
   - IDEA 파일을 `00-inbox/` → `10-screening/`으로 이동
   - 5축 평가 + Go/Hold/Kill **제안** 산출
   - `SCREENING-{YYYYMMDD}-{NNN}.md`를 `10-screening/`에 생성
   - `backlog.md` 상태를 `screened`로, 위치를 `10-screening`으로 업데이트
3. **PCC-01 검증**: 모든 아이디어가 스크리닝되었는지 확인
4. **Human Checkpoint 1 — 점수 확인**: 점수 확인/오버라이드 기회 제공
5. **Human Checkpoint 2 — 승인 결정** (핵심 게이트):
   - 각 아이디어에 대해 승인/보류/반려 결정을 사용자에게 요청
   - **승인** → IDEA + SCREENING 파일을 `10-screening/` → `20-approved/`로 이동, 상태 `approved`
   - **보류** → 파일을 `10-screening/` → `90-archive/`로 이동, 상태 `on-hold`
   - **반려** → 파일을 `10-screening/` → `90-archive/`로 이동, 상태 `rejected`
   - `backlog.md` 인덱스의 상태 + 위치 컬럼 업데이트
6. **`--auto-approve` 옵션**: Go 제안(70+) 아이디어를 Checkpoint 2 생략하고 자동 승인 (배치 작업용)

## Output

- `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` 개별 파일에 상세 점수 및 판정 기록
- `screening-matrix.md` 인덱스에 요약 행 반영
- 승인된 아이디어는 `20-approved/`로 이동
- Lite/Standard 카테고리 판정 포함
- 다음 단계 안내: `/plan-draft IDEA-{YYYYMMDD}-{NNN}` (approved 상태에서만)
