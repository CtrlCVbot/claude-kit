<!--
design-prompt-wireframe.template.md

Claude Design [Wireframe 모드] 전용 프롬프트 템플릿 (1단계 — rough 시안용).

렌더링 방법 (plan-design-writer):
- `{{slug}}` → Feature slug
- `{{prd_summary}}` → PRD Overview + Goals (핵심 3~5줄)
- `{{scr_id_list}}` → SCR-ID 목록 (bullet)
- `{{screens_mapping_table}}` → SCR-ID ↔ Wireframe 화면 매핑 표
- `{{wireframe_layouts}}` → screens/*.md 각 화면 ASCII 레이아웃 요약 (화면당 ≤30줄)
- `{{components_hierarchy}}` → components/*.md 컴포넌트 계층 요약
- `{{navigation_flow}}` → navigation.md 핵심 흐름
- `{{decision_log_summary}}` → decision-log.md 의사결정 근거
- `{{viewports}}` → 활성 viewport 목록 (desktop/tablet/mobile)
-->

# Claude Design 프롬프트 — 1단계 Wireframe ({{slug}})

> **사용 방법**: 본 전체 내용을 복사하여 https://claude.ai/design 에 붙여넣기 → **Wireframe 모드**로 실행하세요. rough 시안을 확인한 뒤, 만족하면 동일 세션에서 `prompt-02-highfidelity.md`를 이어서 붙여넣어 High Fidelity 모드로 전환합니다.

---

## 실행 모드 지시

**Wireframe 모드**로 실행해 주세요. 이 단계의 목표는:

- **구조 확정**: 화면 레이아웃, 컴포넌트 배치, 네비게이션 흐름을 먼저 확정
- **시각 세부는 최소**: 저포화 색상(회색 톤), 텍스트 플레이스홀더 허용, 아이콘은 와이어프레임 수준
- **반응형 프레임**: 각 화면의 desktop/tablet/mobile 3개 viewport 대응 틀 제시

브랜드 컬러 · 타이포 · 이미지 · 마이크로인터랙션은 **이 단계에서 건너뜁니다** — 다음 단계(High Fidelity)에서 완성됩니다.

---

## Overview (PRD 요약)

{{prd_summary}}

---

## 대상 화면 (SCR-ID ↔ Wireframe 매핑)

{{screens_mapping_table}}

### SCR-ID 목록

{{scr_id_list}}

---

## 화면별 레이아웃 (Wireframe 기반)

{{wireframe_layouts}}

---

## 컴포넌트 계층

{{components_hierarchy}}

---

## 네비게이션 흐름

{{navigation_flow}}

---

## Responsive Rules (프레임 수준)

{{viewports}}

각 화면이 3개 viewport(desktop/tablet/mobile)에서 **대응 가능한 구조**인지 확인 — 세부 breakpoint는 High Fidelity 단계에서 다룸.

---

## 의사결정 근거 (Wireframe decision-log)

{{decision_log_summary}}

---

## 출력 요청

- 각 SCR-ID 대응 화면의 **wireframe 시안** 생성
- 3개 viewport 프레임 제시
- 컴포넌트 배치/네비게이션 흐름 확정
- 저포화 색상 + 텍스트 플레이스홀더 허용

완료 후 다음 단계(`prompt-02-highfidelity.md`)를 동일 세션에서 이어서 붙여넣어 High Fidelity 모드로 전환하세요.
