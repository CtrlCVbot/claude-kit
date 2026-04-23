# T-HYBRID-08 — /kit-convert shared-first 전환

**Phase**: 3 (플러그인 축소)
**우선순위**: P0
**선행**: T-HYBRID-07
**후행**: T-HYBRID-12

## 목적

`03-kit-sync-impact.md` §3.2: `/kit-convert`가 shared 매니페스트 등록 자산에 대해 **native sibling 생성 스킵** + shared 참조 블록만 출력.

## 수행 내용

1. `src/claude/core/skills/kit-converter/SKILL.md` 변환 플로우 업데이트
2. `src/claude/core/skills/kit-converter/references/conversion-rules.md`에 shared-first 규칙 추가
3. 신규 reference: `shared-reference-rules.md` — shared 참조 블록 템플릿
4. `/kit-convert --name X` 실행 시:
   - X가 shared-manifest 등록 → shared 참조 출력, Codex sibling 미생성
   - 미등록 → 기존 paired-direct/fallback 변환
5. 회귀 RT-3 검증

## AC

- [ ] kit-converter SKILL.md에 shared-first 분기 문서화
- [ ] shared-reference-rules.md 신규 파일
- [ ] RT-3 PASS
- [ ] `pairing-registry.json`의 `sourceType` 필드 활용 (`sourceType=shared`)

## 파일

- `src/claude/core/skills/kit-converter/SKILL.md`
- `src/claude/core/skills/kit-converter/references/conversion-rules.md`
- 신규: `src/claude/core/skills/kit-converter/references/shared-reference-rules.md`
- `src/claude/core/commands/kit-convert.md`

## 롤백

shared-reference 로직을 feature flag로 감싸고 비활성화 (`KIT_SHARED_FIRST=false`).
