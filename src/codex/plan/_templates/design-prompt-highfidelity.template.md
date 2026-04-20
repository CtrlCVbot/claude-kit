<!--
design-prompt-highfidelity.template.md

Claude Design [High Fidelity 모드] 전용 프롬프트 템플릿 (2단계 — 고품질 최종용).

렌더링 방법 (plan-design-writer):
- `{{slug}}` → Feature slug
- `{{prd_summary}}` → PRD Overview + Goals
- `{{scr_id_list}}` → SCR-ID 목록
- `{{screens_mapping_table}}` → SCR-ID ↔ Wireframe 화면 매핑 표
- `{{wireframe_layouts}}` → screens/*.md 각 화면 ASCII 레이아웃 요약
- `{{components_hierarchy}}` → components/*.md 컴포넌트 계층
- `{{navigation_flow}}` → navigation.md 핵심 흐름
- `{{decision_log_summary}}` → decision-log.md 의사결정 근거
- `{{viewports_with_breakpoints}}` → viewport별 breakpoint 상세
- `{{brand_hints}}` → 브랜드 컬러/타이포/에셋 hint (프로젝트 설정에서)
- `{{accessibility_requirements}}` → PRD의 접근성 요구사항
-->

# Claude Design 프롬프트 — 2단계 High Fidelity ({{slug}})

> **사용 방법**: **1단계(prompt-01-wireframe.md)를 먼저 실행하여 wireframe 시안을 확정한 뒤, 동일 세션에서** 본 전체 내용을 복사하여 붙여넣어 주세요. **High Fidelity 모드**로 전환하여 브랜드/타이포/인터랙션이 완성된 최종 디자인을 생성합니다.

---

## 실행 모드 지시

**High Fidelity 모드**로 전환해 주세요. 이 단계의 목표는:

- **Wireframe 기준 유지**: 1단계에서 확정한 레이아웃/컴포넌트 배치/네비게이션 흐름을 **그대로 계승**. 구조 재배치는 피함.
- **브랜드 통합**: 아래 Brand Hints의 컬러/타이포/에셋을 적용하여 최종 시각 완성도를 높임
- **마이크로인터랙션**: hover/focus/active 상태, 전환 애니메이션, 로딩 상태 명시
- **Responsive 상세**: 각 viewport별 breakpoint 정의 및 컴포넌트 적응 규칙

**중요**: 1단계에서 합의된 구조와 다른 배치를 임의로 제안하지 마세요. 필요한 경우 별도로 알려주세요.

---

## Overview (PRD 요약)

{{prd_summary}}

---

## 대상 화면 (SCR-ID ↔ Wireframe 매핑)

{{screens_mapping_table}}

### SCR-ID 목록

{{scr_id_list}}

---

## 화면별 레이아웃 (1단계 Wireframe 기준 — 유지 필수)

{{wireframe_layouts}}

> 위 레이아웃은 **1단계에서 이미 확정된 구조**입니다. 이 구조 위에 브랜드/시각 세부를 더해 최종 완성하세요.

---

## 컴포넌트 계층

{{components_hierarchy}}

---

## 네비게이션 흐름

{{navigation_flow}}

---

## Brand Hints

{{brand_hints}}

> Brand Hints가 비어 있거나 불완전하면 Claude Design의 기본 제안을 사용하되, 선택 근거를 출력에 명시해 주세요.

---

## Responsive Rules (상세 Breakpoint)

{{viewports_with_breakpoints}}

- 각 viewport에서의 **컴포넌트 적응 규칙** 명시 (예: "OrderForm은 tablet 이하에서 3-column → 1-column 스택")
- 이미지/아이콘 해상도 대응

---

## 마이크로인터랙션

- Hover / Focus / Active 상태
- 전환 애니메이션 (컴포넌트 mount/unmount, 모달 open/close)
- 로딩 상태 (skeleton / spinner 선택 기준)
- 에러/성공 피드백 패턴

---

## Accessibility

{{accessibility_requirements}}

WCAG 2.1 AA 기준 준수 권장.

---

## 의사결정 근거 (Wireframe decision-log)

{{decision_log_summary}}

---

## 출력 요청

- 각 SCR-ID 대응 화면의 **High Fidelity 시안** 완성
- viewport별 breakpoint 적용 결과 제시
- 브랜드 컬러/타이포/에셋 반영
- 마이크로인터랙션 상세 (hover/focus/로딩/에러)
- 접근성 체크리스트 적용

완료 후 결과 URL(claude.ai/design 링크) 또는 익스포트(PDF/PPTX/Canva)를 claude-kit으로 가져와:

```bash
/plan-design {{slug}} --register <url>
```

로 등록하면 `.plans/design/{{slug}}/manifest.md`가 생성됩니다.
