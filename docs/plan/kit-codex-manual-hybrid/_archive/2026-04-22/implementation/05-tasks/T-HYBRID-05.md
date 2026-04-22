# T-HYBRID-05 — src/shared/manifests/*.json 초안

**Phase**: 1 (Shared 매뉴얼 추출)
**우선순위**: P0
**선행**: T-HYBRID-04, T-HYBRID-14
**후행**: T-HYBRID-07, T-HYBRID-15

## 목적

기획 03-target-architecture.md:32-50의 공유 매니페스트 3종 스캐폴드. `kit-sync` Phase 1.5의 1차 입력.

## 수행 내용

1. `src/shared/manifests/` 디렉터리 생성
2. 3개 JSON 파일 초안:
   - `workflows.json` — 도메인별 워크플로우 진입점 라우팅
   - `agents.json` — `.codex/agents/*.toml`로 승격할 에이전트 목록
   - `hooks.json` — Codex 공식 보장 범위 훅 (keep 분류 후보)
3. 각 엔트리는 `schema-shared-manifest.md` 준수

## AC

- [ ] 3개 JSON 파일 존재
- [ ] `/kit-validate --target shared` PASS (T-HYBRID-14 완료 후)
- [ ] 각 엔트리의 `sourceFile` 실존 확인

## 파일

- 신규: `src/shared/manifests/workflows.json`
- 신규: `src/shared/manifests/agents.json`
- 신규: `src/shared/manifests/hooks.json`

## 스키마 초안

```json
{
  "$schema": "schema-shared-manifest.v1",
  "version": "1.0.0",
  "entries": [
    {
      "id": "dev-architect",
      "type": "agent",
      "sourceFile": "src/shared/manuals/dev-pipeline.md#architect",
      "targetSurfaces": ["claude", "codex"],
      "runtimeConstraints": []
    }
  ]
}
```

## 롤백

`rm -rf src/shared/manifests/` — Phase 1.5 opt-in이므로 파이프라인 영향 없음.
