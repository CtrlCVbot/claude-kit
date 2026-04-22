# edit-coordinates 스키마 거버넌스 (Codex)

> **결론**: Codex peer. Claude: `src/claude/dev/rules/edit-coordinates-governance.md` (동일 SemVer 원칙).

**스키마**: `src/codex/dev/_schemas/edit-coordinates.schema.json`
**라우터**: `src/codex/dev/_schemas/_router.js`
**스펙**: `docs/archive/kit-2.3.0-roadmap/03-p1-detailed-specs/IMP-KIT-011-architect-schema.md`

---

## 1. SemVer 규칙

| 변경 | 버전 |
|------|------|
| 필드 추가 (optional) | minor (1.0 → 1.1) |
| 필수 필드 제거·타입 변경 | major (1.x → 2.0, 신규 스키마 파일) |

## 2. 검증 플로우

Claude와 동일: dev-architect 출력 → ajv validate → 유효면 dev-doc-updater 실행, 무효면 재요청 1회.

## 3. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 초안 작성 (Codex sibling) | Claude (메인테이너 역할) |
