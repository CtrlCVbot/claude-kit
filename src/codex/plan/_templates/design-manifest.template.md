<!--
design-manifest.template.md

Claude Design 결과 URL/자산 등록 매니페스트 템플릿.
plan-design-writer가 `/plan-design {slug} --register <url>` 호출 시 렌더링.

렌더링 방법 (plan-design-writer):
- `{{slug}}` → Feature slug
- `{{url}}` → 사용자 입력 URL (claude.ai 도메인 검증 통과)
- `{{fidelity_mode}}` → "wireframe-only" | "high-fidelity" | "wireframe→high-fidelity"
- `{{stages_completed}}` → ["wireframe"] | ["high-fidelity"] | ["wireframe", "high-fidelity"]
- `{{registered_at}}` → ISO 8601 timestamp
- `{{scr_id_mappings}}` → SCR-ID ↔ Wireframe ↔ Design 화면 매핑 (3열 표)
- `{{export_formats}}` → 등록 시 사용자가 명시한 익스포트 포맷 (PDF/URL/PPTX/Canva 선택)
- `{{notes}}` → 사용자 자유 입력 메모
-->

# Design Manifest — {{slug}}

> Claude Design (https://claude.ai/design) 생성 결과 등록 기록.

## 메타데이터

| 항목 | 값 |
|------|-----|
| Feature slug | `{{slug}}` |
| URL | [{{url}}]({{url}}) |
| Fidelity 모드 | {{fidelity_mode}} |
| 완료된 단계 | {{stages_completed}} |
| 등록 시각 | {{registered_at}} |
| 등록자 | claude-kit (via `/plan-design --register`) |

## SCR-ID ↔ Wireframe ↔ Design 매핑

{{scr_id_mappings}}

> 위 표는 사용자가 **수동 보완**해야 할 수 있습니다. Claude Design은 시각 자산이므로 SCR-ID 자동 태깅이 불가 — 각 화면이 어느 SCR-ID에 대응하는지 확인/갱신하세요.

## 익스포트 포맷

{{export_formats}}

## 연계 문서

- PRD: `.plans/prd/10-approved/{{slug}}-prd.md`
- Wireframe: `.plans/wireframes/{{slug}}/`
- 프롬프트 (1단계): `.plans/design/{{slug}}/prompt-01-wireframe.md`
- 프롬프트 (2단계): `.plans/design/{{slug}}/prompt-02-highfidelity.md`
- routing-metadata: `.plans/features/active/{{slug}}/00-context/07-routing-metadata.md` (`post_wireframe_path: design`)

## 사용자 메모

{{notes}}

## 다음 단계

- `/plan-bridge {{slug}}` — 개발 핸드오프

## 변경 이력

| 일시 | 변경 |
|------|------|
| {{registered_at}} | 초기 등록 |
