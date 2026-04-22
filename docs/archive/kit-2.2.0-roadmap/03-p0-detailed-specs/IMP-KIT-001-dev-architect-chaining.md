---
ID: IMP-KIT-001
제목: dev-architect Phase별 에이전트 자동 체이닝
우선순위: P0 (블로커)
영향 도메인: dev, core
RICE: R5 × I5 × C5 ÷ E2 = 62.5
공수: M (3~5일)
원본 타임라인: #22 → #23 (dash-preview-phase3 회고)
안티패턴: 재위임 루프
상태: draft
---

# IMP-KIT-001 — dev-architect Phase별 체이닝

## 1. 문제 정의

`/dev-feature` Phase C에서 **dev-architect가 편집 권한 없어 분석만 수행**. 사용자가 수동으로 dev-doc-updater에 재위임 필요 (1회 재위임 페널티).

### 근거 (원본 회고 인용)

- [01-agent-capability-matrix.md §2.7](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/01-agent-capability-matrix.md): dev-architect Tool 권한 ★★☆☆☆ ("Edit/Write 권한 부재")
- [04-anti-patterns.md §안티패턴 7 재위임 루프](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/04-anti-patterns.md)

### 현재 파일 상태

`src/claude/dev/agents/dev-architect.md` 9행:
```yaml
tools: ["Read", "Grep", "Glob"]
```

`src/claude/dev/agents/dev-architect.md` 30행 Constraints:
> 중요: Write 또는 Edit 도구를 절대 사용하지 않음. 읽기 전용 분석 에이전트입니다.

**결론**: dev-architect의 read-only 성격은 **의도된 설계**. A안(권한 부여)은 설계 원칙을 훼손. **B안(체이닝)이 올바른 해결**.

---

## 2. 제안 해결안: B안 — Phase별 에이전트 자동 체이닝

### 아키텍처

```
/dev-feature {slug}
  ├─ Phase A (분석/설계)
  │    └─ dev-architect          (read-only, 현재와 동일)
  │         └─ 출력: 편집 좌표 JSON
  │
  ├─ Phase B (Human Checkpoint)
  │    └─ 사용자 승인
  │
  └─ Phase C (구현/편집)
       └─ dev-doc-updater         (Edit 권한 보유)
            ← 입력: Phase A의 편집 좌표 JSON
            └─ 출력: 파일 변경 + git diff
```

### 공통 출력/입력 스키마 (IMP-KIT-011 선행)

dev-architect → dev-doc-updater 간 전달되는 편집 좌표 표준:

```json
{
  "schema_version": "1.0",
  "phase": "A",
  "agent": "dev-architect",
  "edits": [
    {
      "id": "edit-001",
      "file_path": "src/foo/bar.ts",
      "line_range": [42, 58],
      "action": "replace",
      "new_content": "...",
      "rationale": "타입 좁히기 + null 가드 추가",
      "risk": "low"
    }
  ],
  "metadata": {
    "total_files": 7,
    "total_edits": 16,
    "generated_at": "2026-04-20T10:00:00+09:00"
  }
}
```

---

## 3. 구현 단계 (TDD)

### 3.1 RED — 실패하는 테스트 작성

**파일**: `tests/claude/dev/commands/dev-feature.phase-c-chaining.test.ts` (신규)

```typescript
import { describe, it, expect } from 'vitest'
import { runDevFeature } from '../../../../src/claude/dev/commands/dev-feature'

describe('dev-feature Phase C — 자동 체이닝', () => {
  it('Phase A 완료 시 edits JSON 반환', async () => {
    const result = await runDevFeature({ slug: 'test-feature', phase: 'A' })

    expect(result.phase).toBe('A')
    expect(result.edits).toBeInstanceOf(Array)
    expect(result.edits[0]).toMatchObject({
      file_path: expect.any(String),
      line_range: expect.any(Array),
      action: expect.stringMatching(/^(replace|insert|delete)$/)
    })
  })

  it('Phase C는 dev-doc-updater로 자동 라우팅', async () => {
    const result = await runDevFeature({
      slug: 'test-feature',
      phase: 'C',
      editsInput: mockEdits
    })

    expect(result.phase).toBe('C')
    expect(result.agent_used).toBe('dev-doc-updater')
    expect(result.files_modified).toHaveLength(mockEdits.length)
  })

  it('dev-architect이 Phase C 직접 실행 시 거부', async () => {
    await expect(
      runDevFeature({ slug: 'test-feature', phase: 'C', agent: 'dev-architect' })
    ).rejects.toThrow('Phase C는 dev-doc-updater 전용')
  })
})
```

### 3.2 GREEN — 최소 구현

**파일 수정**:

1. `src/claude/dev/commands/dev-feature.md` — Phase별 에이전트 매핑 표 추가
2. `src/claude/dev/agents/dev-architect.md` — Output_Format에 JSON 편집 좌표 섹션 추가
3. `src/claude/dev/agents/dev-doc-updater.md` — Input 스키마 명시 섹션 추가
4. `src/claude/dev/commands/dev-feature.ts` 또는 관련 스크립트 — 라우팅 로직

### 3.3 IMPROVE — 리팩토링

- 공통 스키마를 `src/claude/dev/_schemas/edit-coordinates.schema.json`으로 분리
- dev-architect / dev-doc-updater 양쪽 프롬프트에서 경로로 참조

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/dev/commands/dev-feature.md` | Phase별 에이전트 매핑 추가 |
| `src/claude/dev/agents/dev-architect.md` | `<Output_Format>`에 JSON 스키마 명시 |
| `src/claude/dev/agents/dev-doc-updater.md` | `<Input_Format>` 섹션 신설 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/dev/_schemas/edit-coordinates.schema.json` | JSON 스키마 SSOT |
| `tests/claude/dev/commands/dev-feature.phase-c-chaining.test.ts` | 체이닝 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/dev/commands/dev-feature.md` | Claude와 동등 체이닝 로직 |
| `src/codex/dev/agents/dev-architect.md` | 동등 Output 스키마 |
| `src/codex/dev/agents/dev-doc-updater.md` | 동등 Input 스키마 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] Phase A 호출 시 JSON edits 반환
- [ ] Phase C 호출 시 dev-doc-updater 자동 선택
- [ ] dev-architect 직접 Phase C 거부
- [ ] 스키마 유효성 검증 (zod 또는 JSON Schema)

### 5.2 회귀 시나리오 (dash-preview-phase3 복제)

- [ ] Phase C 재위임 **0회**
- [ ] 사용자 수동 개입 **0**
- [ ] 7파일 편집 자동 완료
- [ ] git diff 기준 실제 변경 확인

### 5.3 기존 동작 보장

- [ ] Phase A 단독 호출 시 기존 출력 형태 유지 (후방 호환)
- [ ] architect Constraints(read-only) 원칙 유지
- [ ] 기존 `/dev-feature` 호출 스크립트 미변경

---

## 6. 롤백 시나리오

체이닝이 예상치 못한 부작용 유발 시:

1. `src/claude/dev/commands/dev-feature.md`에서 Phase별 매핑 제거
2. Phase C 수동 위임 지침 복구
3. 테스트 파일은 유지 (차기 시도 시 재사용)

---

## 7. 연관 백로그

- **IMP-KIT-011** (P1): architect ↔ doc-updater 스키마 표준화 (본 항목의 전제)
- **IMP-KIT-003** (P0): plan-draft-writer 신설 (유사한 "분석/편집" 패턴)
- **IMP-KIT-004** (P0): plan-bridge-writer 신설 (유사한 역할 분리)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
