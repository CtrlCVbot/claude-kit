# IMP-AGENT-001 — architecture-binding 동기화 계약

> **결론**: `edit-coordinates.schema.json`을 v1.0 → **v1.1 (minor bump)** 로 확장하여 dev-architect ↔ dev-doc-updater 간 binding §2 동기화를 **사전 계약**으로 승격한다. IMP-KIT-027(훅 사후 가드)의 상위 IMP.

**축**: Process Gaps (기획↔개발 핸드오프)
**우선순위**: **P0**
**공수**: M
**Breaking Change**: no (minor, 하위호환)
**타깃 릴리스**: v2.3.1
**Parent**: IMP-KIT-011 (스키마 거버넌스 v1)
**기반**: IMP-KIT-027 (훅 레벨 가드)
**관련 에이전트**: `dev-architect`, `dev-doc-updater`

---

## 1. 문제 (증거 기반)

- IMP-KIT-027 분석 결과, dash-preview-phase3 M1~M5 루프에서 **`architecture-binding.yaml §2`(관련 파일 섹션) 갱신 누락 3회** 관찰
- 현재 dev-architect 출력 `edit-coordinates` 스키마 v1에는 **binding §2 변경분이 optional**
- dev-doc-updater는 binding 자체를 소비하지 않고 코드맵만 업데이트 → **사각지대**

## 2. 해결책

### 2.1 스키마 확장 (v1.0 → v1.1)

```diff
 {
   "action": "edit | create | delete",
   "file_path": "string",
   "rationale": "string",
+  "binding_updates": {
+    "type": "object",
+    "description": "architecture-binding.yaml §2 반영 대상",
+    "properties": {
+      "feature_slug": "string",
+      "section_2_entries": ["string"]
+    },
+    "required": ["feature_slug"]
+  }
 }
```

**하위호환**: `binding_updates` 미포함 시 기존 동작 유지. `additionalProperties: true` 속성 준수.

### 2.2 dev-architect 프롬프트 확장

추가 섹션:
```markdown
## Binding §2 동기화 (필수)

새 파일을 생성하거나 기존 파일을 이동할 때 `edit-coordinates.binding_updates.section_2_entries`에 해당 파일의 상대경로를 포함한다. 미포함 시 dev-doc-updater가 반려한다.
```

### 2.3 dev-doc-updater 소비 로직

- ajv validation 후 `binding_updates` 존재 확인
- `architecture-binding.yaml §2`에 entry 자동 추가
- 중복 entry는 skip
- validation 실패 시 1회 재요청 (기존 스키마 거버넌스 룰 준수)

---

## 3. IMP-KIT-027과의 관계

| 레이어 | IMP-KIT-027 | IMP-AGENT-001 |
|---|---|---|
| 시점 | 편집 후(사후) | 편집 전(사전) |
| 매커니즘 | 훅 감지 + 경고 | 스키마 계약 강제 |
| 적용 범위 | 모든 편집 | dev-architect 출력만 |
| 실패 동작 | 경고 | dev-doc-updater 반려 |

**상호보완**: IMP-AGENT-001이 사전 계약으로 정상 경로를 유도, IMP-KIT-027이 사후 안전망으로 예외 상황 포착.

---

## 4. 구현 범위

**파일**:
- `src/claude/dev/_schemas/edit-coordinates.schema.json` — v1 → v1.1 (minor)
- `src/claude/dev/_schemas/_router.js` — SemVer 라우팅 (기존)
- `src/claude/dev/agents/dev-architect.md` — 프롬프트 §Binding 추가
- `src/claude/dev/agents/dev-doc-updater.md` — 소비 로직 §Binding 추가
- `.claude/rules/edit-coordinates-governance.md` — v1.1 릴리스 노트 추가

**테스트**:
- `_schemas/edit-coordinates-governance.test.js` — v1.1 스키마 검증 케이스 추가
- e2e: dev-architect → dev-doc-updater 체인에서 binding §2 업데이트 관찰

---

## 5. ROI

- **정방향**: binding §2 누락 0회 목표 (M1~M5 대비)
- **개선 측정**: IMP-AGENT-009 텔레메트리로 binding update 성공률 추적
- **비용**: 스키마 minor 확장 + 2개 에이전트 프롬프트 갱신. over-engineering 없음

---

## 6. 수락 기준

- [ ] v1.1 스키마 ajv validation 통과
- [ ] dev-architect 출력에 `binding_updates` 포함 시 dev-doc-updater가 §2 자동 갱신
- [ ] `binding_updates` 미포함 시 기존 동작 유지 (하위호환)
- [ ] IMP-KIT-027 훅과의 중복 경고 없음

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-KIT-027 상위 IMP로 재해석 |
