<!-- kit-convert generated: 2026-04-24 -->
# plan-wireframe — Codex Entry Flow

와이어프레임 생성. 승인된 PRD를 기반으로 ASCII + Mermaid 와이어프레임을 설계합니다.

> **IMP-KIT-027 포지셔닝**: plan 파이프라인의 **필수 선행 단계**. `/plan-design`과 `/plan-stitch`는 wireframe 완료 후 택일 실행 (wireframe 없이 호출 시 거부).
> 파이프라인: `/plan-prd` → **`plan-wireframe`** → `/plan-design` 또는 `/plan-stitch` (택일) → `/plan-bridge`

## Invocation
```
plan-wireframe {slug}              # PRD 기반 와이어프레임 생성
plan-wireframe {slug} --revise     # 리뷰 피드백 반영 수정
```

## Workflow

1. **PRD 로드**: `.plans/prd/10-approved/{slug}-prd.md` 읽기
2. **에이전트 스폰**: `plan-wireframe-designer` 에이전트를 Task tool로 스폰
   - PRD에서 화면 목록 추출
   - 화면별 ASCII art 레이아웃 설계
   - Mermaid 네비게이션 플로우 다이어그램
   - 컴포넌트 명세 (타입, 상태, 동작)
   - 반응형 고려 (desktop/tablet/mobile)
3. **자동 리뷰**: `/plan-review` 자동 호출 → 와이어프레임 품질 검증
4. **PCC-04 검증**: 모든 PRD 화면에 와이어프레임이 존재하는지 확인

## Output

- `.plans/wireframes/{slug}/` 디렉토리에 와이어프레임 파일 생성
  - `screens.md` — 화면별 와이어프레임
  - `navigation.md` — 네비게이션 플로우
  - `components.md` — 컴포넌트 명세
  - `decision-log.md` — 의사결정 근거 (viewport 판정 등, IMP-KIT-023에서 템플릿화 예정)
- 다음 단계 안내 (IMP-KIT-027 택일):
  - **시각 자산 중심**: `/plan-design {slug}` (Claude Design 2단계 프롬프트 생성 → 고품질 시안까지)
  - **통합 검증 중심**: `/plan-stitch {slug}` (PRD ↔ 화면 매핑 검증)
  - **간단 Feature**: `/plan-bridge {slug}` 직행 (Checkpoint에서 skip 선택)

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/commands/plan-wireframe.md`
