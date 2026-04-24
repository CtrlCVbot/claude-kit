# 00. Executive Summary

> **한 문장 요약**: 2026-04-24, claude-kit 레포의 Codex 변환 자산을 전부 버리고 Claude 원본(SSOT)에서 **처음부터 다시 생성**하여 일관성을 리셋했다. 작업 전·중·후 모두 검증되었고 rollback 안전망도 갖춰져 있다.

## 왜 이 작업을 했나

claude-kit은 하나의 원천(Claude) 자산을 두 런타임(Claude Code / Codex)에서 쓸 수 있도록 **변환해서 복제**하는 구조다. 오랜 시간이 지나면서:

- Claude 원본 파일은 자주 고쳐짐
- Codex 쪽 변환 결과물은 `pairing-registry.json`의 `lastSyncedAt` 초기값("2026-04-17")에 그대로 박혀 있음 → 최신 여부 불명
- 일부 항목은 paired-review로 생성만 해놓고 Codex runtime 검증을 아직 거치지 않음

**비유**: 원본(Claude)과 번역본(Codex) 두 책이 있는데, 번역본이 언제 마지막으로 맞춰졌는지 기록이 흐릿한 상태. 전부 다시 번역해서 "2026-04-24에 이 원본 기준으로 번역했습니다" 라고 깔끔한 타임스탬프를 찍는 작업.

## 무엇을 했나 (4단계)

```
Phase 0  백업    →  Phase 1  삭제    →  Phase 2  재생성  →  Phase 3  검증    →  Phase 4  정리
(안전망)         (zero-state)        (SSOT 기반)       (regression 0)   (agent-memory 등)
```

| Phase | 핵심 행위 | 결과 |
|:---:|-----|-----|
| 0 | `backup/codex-before-resync-20260424` 브랜치 + 기존 상태 snapshot commit | 안전망 `8e352a4` 확보 |
| 1 | `git rm -rf src/codex/ .codex/` | 165 파일 / 15533 줄 삭제 (`5d6f6ce`) |
| 2 | `kit-sync-agent` 서브에이전트가 Claude SSOT 기반 전체 재생성 | 174 파일 / +19429 / −158 줄 추가 (`61d1bc5`) |
| 3 | C7 (페어링 일관성) + C8 (cross-ref) + C3-lite (syntax) 검증 | **regression 0** |
| 4 | agent-memory 별도 커밋, 임시 파일 삭제, 사용자의 in-progress docs 작업 stash를 patch로 export 후 drop | 작업 흔적 정리 완료 |

## 수치로 보는 결과

| 범주 | 값 |
|------|---|
| 변환된 Codex 파일 | 171 (core 50 · dev 51 · plan 53 · copy 17) + `.codex/` 2 |
| pairing-registry paired 엔트리 | 114 개 (전원 `lastSyncedAt` / `contentHash` 2026-04-24 기준으로 갱신) |
| codex-skip 엔트리 | 6 (EX-009 포함 known pre-existing) |
| unpaired 엔트리 | 5 (copy 도메인 rules) |
| REVIEW NEEDED 표시 파일 | 29 개 (수동 검토 대기) |
| Phase 3 새로 발견한 문제 | **0건** |
| Phase 3 확인된 pre-existing 이슈 | 12건 (본 작업 이전부터 존재) |
| 신규 커밋 | 3개 (codex 삭제 + 재생성 + agent-memory) |
| 백업 자산 | 1 브랜치 + 1 patch 파일 (21KB) + 1 tar 파일 (184KB) + 1 복원 README |

## 작업 품질에 대한 판단

**결론: Phase 2 재생성은 깔끔하다. 기존 건강 상태를 유지했을 뿐, 새 문제를 만들지 않았다.**

- Phase 3 C7 감사에서 FAIL 1건 + WARN 6건이 나왔지만, backup 브랜치와 비교 결과 **전부 2026-04-24 이전부터 있던 이슈**
- Phase 3 C8 감사의 dead reference 5건도 Claude 원본(`src/claude/dev/commands/*.md`)에서부터 잘못 적혀 있던 참조. 재변환이 원본의 오류를 충실히 복제했을 뿐
- 재생성된 파일 자체의 문법 검사에서 0바이트 깨짐/YAML 구조 이상 없음

Phase 2 재생성 품질은 OK. Pre-existing 이슈 12건은 별도 세션에서 원본(Claude source) 레벨 수정 필요.

## 사용자에게 필요한 후속 액션 (우선순위 순)

1. **REVIEW NEEDED 29개 수동 검토** — [07 REVIEW NEEDED Catalog](07-review-needed-catalog.md) 참조
2. **EX-009 설계 결정** — exception-registry의 strategy/status 모순 해결 방향 결정 (paired-direct → paired-fallback or blocked)
3. **AGENTS.md.template에 6개 rule 섹션 추가** — EX-003~008 fallback artifact 본체 작성
4. **Claude source `dev-` 접두사 누락 수정** — C8 dead reference 5건 원천 수정
5. **Codex runtime 실제 검증** — 별도 Codex 환경에서 paired-review 16개 동작 확인
6. **docs 재구성 작업** — working tree에 남아 있는 46 entries 사용자가 이어서 진행

위 작업은 **codex 재정리 자체와는 독립적**으로 수행 가능. 본 작업이 이들을 막고 있지 않다.

## 의사결정 로그

작업 중 내린 판단 중 비자명한 것들:

| 결정 | 이유 |
|------|------|
| `--resync` 증분이 아닌 zero-state 전면 재생성 선택 | `lastSyncedAt` 초기값이 대다수라 drift 감지가 무의미 → 차라리 baseline 새로 찍자 |
| Phase 1(삭제)과 Phase 2(재생성)를 **별도 커밋**으로 분리 | 재생성 단계 실패 시 "삭제만 된 상태"를 깨끗이 rollback 가능하도록 경계 확보 |
| 사용자 in-progress docs 작업을 `git stash push -- docs/` 로 격리 | codex 재정리 커밋에 docs 변경이 섞이지 않도록 |
| Phase 4에서 stash를 pop 대신 patch + tar로 export 후 drop | stash 내부 `docs/README.md` duplicate entry 때문에 `--include-untracked` pop이 실패. 대신 스냅샷 파일 보존으로 안전망 확보 |
| exception-registry는 read-only 유지 | EX-009 등의 설계 결정은 별도 세션에서 처리해야 할 정책 사안 |
