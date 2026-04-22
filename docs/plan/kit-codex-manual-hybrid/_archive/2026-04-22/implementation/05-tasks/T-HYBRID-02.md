# T-HYBRID-02 — Codex 공식 링크 스냅샷 검증 기록 (H2 해소)

**Phase**: 0 (설계 승인)
**우선순위**: P0
**선행**: 없음
**후행**: T-HYBRID-04

## 목적

FEEDBACK H2 지적: `01-official-surface-and-constraints.md:7`에 snapshot date(2026-04-21)는 있으나 각 URL별 **검증 증거**(접근일, excerpt) 누락.

## 수행 내용

1. 6개 공식 URL 각각 fetch (jina-reader MCP 사용, WebFetch 금지)
2. 각 URL별: 접근일시, 핵심 excerpt(≤100자), 버전 정보 기록
3. `01-official-surface-and-constraints.md`에 "검증 기록" 섹션 추가

## AC

- [ ] 6개 URL × {접근일, excerpt, 상태코드} 테이블 추가
- [ ] 각 excerpt는 `cite` 블록으로 인용 (copyright 범위 내)
- [ ] R1 리스크 완화 증거로 링크 제시

## 대상 URL

1. https://developers.openai.com/codex/plugins
2. https://developers.openai.com/codex/guides/agents-md
3. https://developers.openai.com/codex/skills
4. https://developers.openai.com/codex/subagents
5. https://developers.openai.com/codex/hooks
6. https://developers.openai.com/codex/app/commands

## 파일

- `docs/plan/kit-codex-manual-hybrid/01-official-surface-and-constraints.md`

## 롤백

섹션 revert 단건.
