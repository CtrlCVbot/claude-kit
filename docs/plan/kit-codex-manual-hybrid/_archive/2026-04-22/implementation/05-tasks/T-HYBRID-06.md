# T-HYBRID-06 — AGENTS.md.template shared 참조 재구성

**Phase**: 2 (AGENTS.md 재구성)
**우선순위**: P0
**선행**: T-HYBRID-04
**후행**: T-HYBRID-07

## 목적

기획 `03-target-architecture.md:54-99` Codex 런타임 surface의 AGENTS.md 강화. 현재 6개 rule의 h3 inline merge에 shared 매뉴얼 링크 추가.

## 수행 내용

1. `src/templates/AGENTS.md.template`에 "공유 매뉴얼" 섹션 추가
2. 6개 shared 매뉴얼 각각을 링크로 삽입
3. 기존 rule h3 섹션 유지 (EX-003~008 resolved 상태 보존)
4. 워크플로우 진입점 설명 재구성 (공유 매뉴얼 우선)

## AC

- [ ] AGENTS.md.template에 `### 공유 매뉴얼` h3 추가
- [ ] 6개 매뉴얼 모두 링크됨
- [ ] `/kit-audit C6` PASS (기존 rule h3 섹션 유효)
- [ ] 새 세션에서 템플릿 읽어 워크플로우 진입 경로 설명 가능 (수동 검증)

## 파일

- `src/templates/AGENTS.md.template`

## 롤백

`git revert` 단건.
