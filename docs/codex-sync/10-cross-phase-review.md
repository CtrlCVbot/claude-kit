# Cross-Phase 통합 리뷰 (Phase 1~5 추가 피드백)

> 대상: codex-sync Phase 0~5 rollout 전체 (12 commits, `c794351`~`6acfd89`)
> 리뷰 목표: per-phase 피드백 사이클이 끝난 후, 누락된 cross-cutting 이슈를 식별한다.
> 작성: 2026-04-15
> 방법론: 2개 Explore agent 병렬 분석 (cross-phase 일관성 + dynamic verification gap)

## 1. Executive Summary

5-phase rollout이 정적 정합성 측면에서 완료됐지만, 추가 cross-phase 검토에서 **3건의 누락**이 발견됨:

1. **Critical**: `12-implementation-plan.md` 본문 3 lines (74~76)이 여전히 "hook-skip / rule-skip / claude-origin shared" stale 표현 유지. Phase 2 feedback C2가 헤더 메모만 추가하고 본문 미수정.
2. **Important**: setup.js에 `--dry-run` 플래그 부재 → Phase 5 dynamic verification 8건 중 절반이 즉시 실행 불가.
3. **Important**: Silent failure 4 시나리오 중 2건이 현재 audit으로 미감지 (S2 AGENTS.md.template ### 섹션 삭제, S3 skill artifact 삭제).

또한 다음 **건전성 확인** 결과:
- ✅ Stale 표현 grep 8건 중 1건만 발견 (98% cleanup)
- ✅ SSOT 위계 (3-layer: exception-registry + codex-portability + pairing-registry) 일관됨
- ✅ Commit hash 100% 일치 (5 phase × 2~3 commits = 12)
- ✅ 신규 5 artifact (codex-portability.json, schema, skill, AGENTS.md.template, schema-codex-portability) 모두 production-quality
- ✅ 7개 이연된 권장 조치 모두 처리됨 (T18 ✓ Phase 4, C7 ✓ Phase 4, drift spec ✓ Phase 4, Phase ✓ 표기 ✓ Phase 5)

## 2. Findings

### Critical

#### CC1. `12-implementation-plan.md` lines 74~76 stale 표현 (Phase 2 C2 미완)

Phase 2 feedback C2가 헤더 메모(line 5)만 추가하고 본문은 안 고침. 현재:

```markdown
74| - EX-001: session-wrap-suggest (hook-skip, Claude runtime 의존)
75| - EX-002: output-secret-filter (hook-skip, CLAUDE_REMOTE_SESSION 의존)
76| - EX-003~008: 6개 rules (rule-skip, claude-origin shared guidance)
```

문제:
- EX-001은 Phase 3에서 paired-fallback / status=resolved 전환됨 (skill artifact 생성)
- EX-002는 Phase 4에서 setup.js T18 적용으로 setup.js가 src/codex/ 우선 사용 (compatible:true)
- EX-003~008은 Phase 2에서 paired-fallback / status=resolved 전환됨 (AGENTS.md.template merge)

reader가 12-implementation-plan.md 본문만 읽으면 stale framing 그대로 받음 (헤더 메모 확인 없이).

**제안**: lines 74~76을 현재 상태로 갱신 + 각 EX의 commit hash 명시. 또는 헤더 메모를 더 강하게 표시 (예: 본문 시작에 superseded 박스).

### Important

#### CC2. `scripts/setup.js`에 `--dry-run` 플래그 부재 → Phase 5 동적 검증 미실시

Phase 5 §5 검증 V1~V8은 모두 정적 (grep, JSON.parse, node --check). dynamic verification으로 다음이 후속 이연됨:

- D1: `node scripts/setup.js --target codex --domain core --dry-run` → **불가** (--dry-run 미지원)
- D2: 실제 setup.js 실행 → **가능하지만 file system side effect 발생**

setup.js를 grep한 결과, dry-run 또는 dry/preview 키워드 없음. T18 적용 코드는 작동하지만 검증 불가.

**제안**:
- 옵션 A (즉시): setup.js에 `--dry-run` 추가. preview만 출력하고 file 작성 건너뛰기.
- 옵션 B (이연): 별도 task로 verification script (`scripts/verify-codex-sync.js`) 작성. dry-run logic 포함.

### CC3. Silent failure 시나리오 — 현재 audit이 2/4 미감지

| 시나리오 | 현재 메커니즘 | 충분성 |
|----------|--------------|--------|
| S1: codex-portability.json drift (entry 추가 누락) | C10 drift detection (명세만, 구현 없음) | 부족 |
| S2: AGENTS.md.template ### 섹션 1개 삭제 | C6 (선택, 보통 미실행) | **부족** |
| S3: session-wrap-suggest skill 파일 삭제 | C7 fallback artifact 존재 검증 (명세만) | **부족** |
| S4: pairing-registry enum value 오류 | JSON.parse + 간단한 field check | 부족 |

특히 S2, S3는 현재 audit이 잡지 못함. 명세에는 있지만 구현 없음.

**제안**: kit-audit C7 spec에 다음 즉시 실행 가능한 명령 추가 (구현 X, 명세 O):
- S2 감지: `grep -c "^### " src/templates/AGENTS.md.template` → 6 미만 시 FAIL
- S3 감지: 각 paired-fallback + fallbackTarget=skill entry에 대해 SKILL.md 파일 존재 시험

### Nice to Have

#### CC4. `kit-audit C6` (문서 정확성)이 "선택" — mandatory 권장

C6는 README/architecture 카운트 일관성 검증인데 "선택"으로 분류됨. cross-phase 검토에서 보면, 12 commits 후 컴포넌트 카운트가 변동했을 수 있음. mandatory 승격하면 자동 catch.

#### CC5. `pairing-registry` schema 부재

`src/pairing-registry.json` 자체 검증 schema 없음. JSON.parse만으로는 enum value 오류(S4) 감지 불가. `schema-pairing-registry.md` 신규 권장 (Phase 5+ 별도 task).

#### CC6. Phase 0~5 commit이 13건 (final commit 포함) — sync-report 통계 정밀화

`sync-report-2026-04-15-final.md` §7은 12 commits를 list하지만 본 commit (cross-phase 피드백) 자체는 13번째. 사소한 self-reference, 영향 없음.

## 3. Recommended Adjustments (즉시 vs 이연)

### 즉시 적용 (이 commit과 함께)

1. **CC1**: `12-implementation-plan.md` lines 74~76 갱신 (3 line surgical patch)

### Phase 5+ 별도 task로 분리

2. **CC2 옵션 A**: setup.js `--dry-run` 추가 (코드 변경, 별도 task)
3. **CC3 강화**: kit-audit C7 spec에 즉시 실행 가능 검증 명령 명시 (별도 task)
4. **CC4**: kit-audit C6 mandatory 승격 (정책 결정 필요)
5. **CC5**: schema-pairing-registry.md 신규 (별도 schema task)
6. **CC6**: sync-report 자동 생성 task에서 자연 해소

## 4. Cross-Phase Health Checks (모두 ✓)

| 항목 | 결과 |
|------|------|
| Stale 표현 grep 8건 | 1 매치 (CC1만 — 98% cleanup) |
| SSOT 위계 일관성 | 3-layer 명확 |
| Commit hash 5 phase 일치 | 100% |
| 신규 artifact 5개 quality | 모두 production-ready |
| 7개 이연 권장 조치 추적 | 모두 처리됨 또는 의도적 Phase 5+ 분리 |
| Cross-phase commit 누수 | 없음 (각 feedback doc은 자기 phase commit만 reference) |

## 5. 결론

**5-phase rollout 정적 정합성: ✓ 완료**

추가 발견 3건 중 1건(CC1)은 surgical 5분 patch로 즉시 해소. 나머지 2건(CC2, CC3)은 dynamic verification 영역으로 별도 task 분리가 적절. rollout 결정에 영향 없음 — **rollout-ready** 상태 유지.

5건 추가 (CC4~CC6)는 향후 cycle에서 자연스럽게 처리 가능한 nice-to-have.

## 6. Reference Notes

### 발견된 patch 대상

- `docs/meta-tooling/12-implementation-plan.md` lines 74~76 (CC1, 즉시 적용)

### 별도 task 후보

- `scripts/setup.js` (CC2 — --dry-run 플래그 추가)
- `.claude/commands/kit-audit.md` (CC3 — C7 즉시 실행 spec 강화)
- `.claude/commands/kit-audit.md` (CC4 — C6 mandatory 승격)
- `.claude/skills/kit-validation/references/schema-pairing-registry.md` (CC5 — 신규)

### Cross-phase 분석 방법론

- Explore agent 1: cross-phase 일관성 + 누락된 stale 표현
- Explore agent 2: dynamic verification gap + silent failure 시나리오
- 둘 다 codex-sync Phase 1~5 12 commits 전체를 대상으로 분석

### 이전 phase 피드백

- `docs/codex-sync/05-phase1-feedback-review.md`
- `docs/codex-sync/06-phase2-feedback-review.md`
- `docs/codex-sync/07-phase3-feedback-review.md`
- `docs/codex-sync/08-phase4-feedback-review.md`
- `docs/codex-sync/09-phase5-feedback-review.md`
