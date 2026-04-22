## plan 도메인

- **기획 가드**: `plan-doc-guard.js`가 `Edit|Write` 전에 기획 문서 무결성을 검증한다.
- **무결성 훅 (Opt-in, v2.4.0)**: `plan-epic-integrity.js` (Phase 2 disable 기본, Phase 3 enable) — Epic ↔ Feature binding cross-reference 검증 (FLAG only, BLOCK 아님).
- **Epic 계층 (Opt-in, v2.4.0)**: Epic(대) / Feature(중) / Task(소) 3단 parent-child. Epic 없이도 기존 flat 플로우 100% 호환. SSOT: `plan-epic-hierarchy.md`.
- **파이프라인 (순서 강제)**
  0. `/plan-epic "{제목}"` — **(Opt-in, v2.4.0)** Epic 생성, `.plans/epics/00-draft/EPIC-{YYYYMMDD}-{NNN}/`
  1. `/plan-idea "아이디어" [--epic=EPIC-...]` — `.plans/ideas/00-inbox/`에 수집 (Epic 자동 연결 optional, IMP-AGENT-010)
  2. `/plan-screen <IDEA-ID>` — RICE 스크리닝 + 승인 게이트
  3. `/plan-draft <IDEA-ID>` — 1차 기능 기획 (Lite/Standard 판정)
  4. `/plan-prd <draft-path>` — Standard 기능 PRD 상세 작성 (Epic 있으면 Epic Brief §2 성공지표 인용, IMP-AGENT-011)
  5. `/plan-wireframe` — 와이어프레임 구조 확정 (옵션, design/stitch 선행 필수)
  6. `/plan-design` 또는 `/plan-stitch` — wireframe 후 **택일** (Claude Design 2단계 프롬프트 / Stitch 시안 통합)
  7. `/plan-bridge <slug>` — 개발 핸드오프
  8. `/plan-archive <slug>` — 완료 기능 번들화
- **핵심 게이트**: `/plan-screen` 완료 후 사용자의 **명시적 승인** 없이는 `/plan-draft` 이후 단계로 진입하지 않는다.
- **배타 규칙**: `/plan-design`과 `/plan-stitch`는 동시 실행 차단. 순차 실행은 `--force-sequential` 필수.
- **Spike 모드 (v2.3.1, IMP-AGENT-004)**: Standard Feature 전용. `plan-bridge-writer` + `dev-architect` 협력 계약. Budget 1일 hard cap (IMP-KIT-036). TASK ID: `SPIKE-{AREA}-NN` (IMP-KIT-015).
- **산출 경로**: `.plans/epics/` (Opt-in), `.plans/ideas/`, `.plans/prd/`, `.plans/features/active/<slug>/`, `.plans/design/<slug>/`, `.plans/archive/<slug>/`
- **주요 서브에이전트**: `plan-idea-collector`, `plan-idea-screener`, `plan-prd-writer`, `plan-reviewer`, `plan-wireframe-designer`, `plan-design-writer`, `plan-stitch-integrator`, `plan-bridge-writer`, `plan-draft-writer`
- **v2.4.0 신규 자산**: skill `plan-epic-workflow` (라이프사이클 + Epic Brief/Children Features/Epic Binding 3 템플릿), rule `plan-epic-hierarchy.md` (SSOT), command `/plan-epic`, hook `plan-epic-integrity.js` (Phase 2 disable 기본)
