# /plan-bridge

기획 → 개발 핸드오프. PRD를 `.plans/prd/10-approved/`에 배치하고 개발 워크플로우(Phase A~E)로 연결합니다.

## Usage

```
/plan-bridge {slug}                 # 기획 → 개발 핸드오프 실행
```

## Workflow

1. **산출물 수집**:
   - PRD: `.plans/prd/10-approved/{slug}-prd.md`
   - Wireframe: `.plans/wireframes/{slug}/`
   - Stitch: `.plans/stitch/{slug}/`
2. **Bridge 컨텍스트 생성**:
   - `03-bridge-wireframe.md` — 와이어프레임 요약
   - `04-bridge-stitch.md` — Stitch 디자인 요약
   - `05-bridge-context.md` — 개발 참조 컨텍스트
3. **PRD 배치 확인**: `.plans/prd/10-approved/`에 PRD가 존재하는지 검증
4. **개발 워크플로우 연결**: `/dev-feature` 입력 경로와 일치 확인
5. **전체 PCC 검증**: PCC-01 ~ PCC-05 최종 일관성 확인

## Output

- Bridge 컨텍스트 파일들이 개발 워크플로우에서 참조 가능한 위치에 배치
- PRD가 `/dev-feature`의 입력 경로(`.plans/prd/10-approved/`)에 존재 확인
- 다음 단계 안내: `/dev-feature {slug}` — Phase A~E 개발 시작
