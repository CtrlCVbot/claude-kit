# T-HYBRID-09 — /kit-analyze 5-tier 분류

**Phase**: 4 (.codex/agents 도입 / kit-analyze 확장)
**우선순위**: P1
**선행**: T-HYBRID-07
**후행**: T-HYBRID-10

## 목적

`03-kit-sync-impact.md` §3.3: `/kit-analyze` 출력에 `shared-direct` 전략 추가 → **5-tier** 분류.

## 수행 내용

1. `src/claude/core/commands/kit-analyze.md`에 5-tier 설명 추가
2. 분류 로직:
   - shared-direct: shared/manifests 등록
   - paired-direct: codex sibling 존재
   - paired-fallback: AGENTS.md/skill artifact 참조
   - review: Write/Edit 도구 + 자동 탐지 실패
   - blocked: 제약으로 변환 불가
3. `--include-paired` 드리프트 스캔에서 shared-direct는 제외
4. 회귀 RT-4 검증

## AC

- [ ] kit-analyze 출력 테이블에 5개 전략 행 표시
- [ ] shared-direct 엔트리는 드리프트 스캔 대상 제외
- [ ] RT-4 PASS

## 파일

- `src/claude/core/commands/kit-analyze.md`
- `src/claude/core/skills/kit-converter/SKILL.md` (분류 뷰 업데이트)

## 롤백

5-tier 로직을 기존 4-tier로 축소 (shared-direct를 paired-direct와 합침).
