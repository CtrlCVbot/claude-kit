# edit-coordinates 스키마 거버넌스

> **결론**: dev-architect → dev-doc-updater 체이닝의 핵심 계약인 `edit-coordinates` JSON 스키마의 SemVer 규칙·검증 절차·변경 절차. IMP-KIT-011. ajv 런타임 검증을 표준화하여 "암묵적 해석"을 "명시적 검증"으로 승격.

**스키마**: `src/claude/dev/_schemas/edit-coordinates.schema.json` (v1, Draft 2020-12)
**라우터**: `src/claude/dev/_schemas/_router.js`
**스펙**: `docs/plan/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-011-architect-schema.md`

---

## 1. SemVer 규칙

- **major** (`N.x → (N+1).0`): 하위호환 깨짐 — 필수 필드 제거·타입 변경·action enum 축소. 별도 스키마 파일 + 라우터 분기 필수.
- **minor** (`1.0 → 1.1`): 하위호환 유지 — 필드 추가(optional), action enum 확장. `additionalProperties: true`로 소비자 영향 없음.
- **patch** (`1.0 → 1.0.1`): 설명·메타데이터 변경. 파일 변경 없음.

### 예시

| 변경 | 버전 | 변경 위치 |
|------|------|----------|
| `rationale` 필드 optional 추가 | 1.0 → 1.1 | v1 스키마 수정 |
| `risk` 필드 필수화 | 1.1 → 2.0 | 신규 `edit-coordinates.v2.schema.json` 파일 + 라우터에 v2 등록 |
| description 오타 수정 | 1.0 → 1.0.1 | 파일 변경 없음 (메타데이터) |

---

## 2. 검증 플로우

```
dev-architect → edit-coordinates JSON 출력
                       ↓
             _router.js validate()
                       ↓
     ┌────────────────┴────────────────┐
     │                                 │
  [유효]                           [무효]
     ↓                                 ↓
dev-doc-updater 실행             재요청 1회 → 재실패 시 사용자 보고
```

## 3. action enum 확장 절차

신규 action 추가 시:

1. `edit-coordinates.schema.json` enum 배열에 추가
2. 본 문서 "변경 이력"에 버전·이유 기록
3. `dev-architect.md`, `dev-doc-updater.md` Output/Input 섹션에 신규 action 반영
4. 회귀 테스트 1건 추가 (`_schemas/edit-coordinates-governance.test.js`)

---

## 4. 하위 호환 보장

- major version 라우터: `_router.js`의 `SUPPORTED_MAJORS`에 **현재 + 직전 major** 등록
- 예: v2.0 도입 시 `SUPPORTED_MAJORS = ['1', '2']` (전환 기간)
- 2 minor 버전 이후 `'1'` 제거 가능 (deprecation 기간)

---

## 5. 검증 실패 처리

dev-doc-updater가 `validate().valid === false` 감지 시:

1. `errors` 배열을 포함한 재요청 메시지를 dev-architect에게 전달 (1회 재시도)
2. 재시도 후에도 실패하면 사용자에게 "스키마 위반 + 수동 개입 필요" 보고
3. 재시도 로그: `~/.claude/logs/schema-validation.jsonl` (IMP-KIT-024 통합)

---

## 6. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (IMP-KIT-011 거버넌스 SSOT) | Claude (메인테이너 역할) |
