# /plan-stitch

PRD + Wireframe 통합. 기획 산출물을 통합하여 Feature Package 컨텍스트를 생성합니다.

## Usage

```
/plan-stitch {slug}                 # PRD + Wireframe 통합
```

## Workflow

1. **산출물 로드**:
   - PRD: `.plans/prd/10-approved/{slug}-prd.md`
   - Wireframe: `.plans/wireframes/{slug}/`
   - Stitch HTML (있을 경우): 외부 디자인 자산
2. **에이전트 스폰**: `plan-stitch-integrator` 에이전트를 Task tool로 스폰
   - PRD ↔ Wireframe 일관성 검증
   - 요구사항-화면 매핑 (REQ-ID → Screen-ID)
   - 누락 탐지 및 보고
   - 통합 컨텍스트 문서 생성
3. **PCC-05 검증**: 와이어프레임 레이아웃이 디자인에 반영되었는지 확인
4. **Human Checkpoint**: Stitch 결과 확인

## Output

- `.plans/stitch/{slug}/` 디렉토리에 통합 패키지 생성
  - `mapping.md` — REQ-ID ↔ Screen-ID 매핑
  - `context.md` — 개발 핸드오프 컨텍스트
  - `validation.md` — 통합 검증 결과
- 다음 단계 안내: `/plan-bridge {slug}`
