## `plan` 압축 흐름

`plan`은 아이디어를 수집하고, 승인 게이트를 통과시킨 뒤, PRD와 브리지까지 연결하는 기획 파이프라인이다.

| 단계 | 커맨드 | 역할 | 핵심 산출물 |
|------|--------|------|-------------|
{{PLAN_FLOW_ROWS}}

- 핵심 게이트: `/plan-screen` 완료 후 사용자 **명시적 승인**이 있어야 `/plan-draft` 이후 단계로 진입할 수 있다.
- 와이어프레임과 디자인이 필요하면 `/plan-wireframe` 이후 `/plan-design` 또는 `/plan-stitch`를 **택일**하여 추가한다 (둘은 배타 관계, 순차 실행은 `--force-sequential` 필수).
- 완료된 기능은 `/plan-archive`로 번들화하고, `/plan-improve`로 다시 진입할 수 있다.

최소 경로 구조:

{{PLAN_PATHS}}
