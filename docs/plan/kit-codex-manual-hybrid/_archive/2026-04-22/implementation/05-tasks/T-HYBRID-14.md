# T-HYBRID-14 — schema-shared-manifest + /kit-validate --target shared + /kit-audit C11

**Phase**: 1 (Shared 매뉴얼 추출)
**우선순위**: P0 (T-HYBRID-05 선결)
**선행**: T-HYBRID-01
**후행**: T-HYBRID-05, T-HYBRID-07

## 목적

`03-kit-sync-impact.md` §3.4~3.5: shared manifest 검증 인프라 구축.

## 수행 내용

1. 신규 스키마 작성: `src/claude/core/skills/kit-validation/references/schema-shared-manifest.md`
   - `$schema`, `version` (SemVer), `entries[]`, 각 엔트리 필드 정의
2. `/kit-validate` 커맨드에 `--target shared` 옵션 추가
3. `/kit-audit` C11 카테고리 신규 (shared-integrity):
   - `sourceFile` 실존 확인
   - 중복 id 검출
   - 런타임 surface 참조 무결성
4. 회귀 RT-5, RT-6 검증

## AC

- [ ] `schema-shared-manifest.md` 파일 생성 (≥80줄)
- [ ] `/kit-validate --target shared` 실행 가능
- [ ] `/kit-audit C11` PASS
- [ ] RT-5, RT-6 PASS
- [ ] AC-7 (01-overview) 달성

## 파일

- 신규: `src/claude/core/skills/kit-validation/references/schema-shared-manifest.md`
- `src/claude/core/commands/kit-validate.md`
- `src/claude/core/commands/kit-audit.md`
- `src/claude/core/skills/kit-validation/SKILL.md`

## 롤백

신규 타겟/카테고리를 optional로 유지 → 기존 명령에 영향 없음.
