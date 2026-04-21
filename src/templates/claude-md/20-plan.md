## plan 도메인

- **기획 가드**: `plan-doc-guard.js`가 `Edit|Write` 전에 기획 문서 무결성을 검증한다.
- **파이프라인 (순서 강제)**
  1. `/plan-idea "아이디어"` — `.plans/ideas/00-inbox/`에 수집
  2. `/plan-screen <IDEA-ID>` — RICE 스크리닝 + 승인 게이트
  3. `/plan-draft <IDEA-ID>` — 1차 기능 기획 (Lite/Standard 판정)
  4. `/plan-prd <draft-path>` — Standard 기능 PRD 상세 작성
  5. `/plan-wireframe` — 와이어프레임 구조 확정 (옵션, design/stitch 선행 필수)
  6. `/plan-design` 또는 `/plan-stitch` — wireframe 후 **택일** (Claude Design 2단계 프롬프트 / Stitch 시안 통합)
  7. `/plan-bridge <slug>` — 개발 핸드오프
  8. `/plan-archive <slug>` — 완료 기능 번들화
- **핵심 게이트**: `/plan-screen` 완료 후 사용자의 **명시적 승인** 없이는 `/plan-draft` 이후 단계로 진입하지 않는다.
- **배타 규칙**: `/plan-design`과 `/plan-stitch`는 동시 실행 차단. 순차 실행은 `--force-sequential` 필수.
- **산출 경로**: `.plans/ideas/`, `.plans/prd/`, `.plans/features/active/<slug>/`, `.plans/design/<slug>/`, `.plans/archive/<slug>/`
- **주요 서브에이전트**: `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-reviewer`, `plan-wireframe-designer`, `plan-design-writer`, `plan-stitch-integrator`
