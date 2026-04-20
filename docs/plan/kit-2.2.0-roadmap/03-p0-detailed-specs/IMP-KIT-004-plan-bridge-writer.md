---
ID: IMP-KIT-004
제목: /plan-bridge 전용 에이전트 (plan-bridge-writer) 신설
우선순위: P0 (블로커)
영향 도메인: plan, dev
RICE: R4 × I4 × C5 ÷ E2 = 40
공수: M (3~5일)
원본 타임라인: #19
안티패턴: Skill-only 수동화
상태: draft
---

# IMP-KIT-004 — plan-bridge-writer 신설

## 1. 문제 정의

`/plan-bridge`는 **전용 에이전트가 없어 general-purpose로 수행**. Bridge 표준화가 약하고, bridge 산출물의 일관성이 호출자에 의존. dash-preview-phase3 세션에서는 general-purpose가 13파일을 생성했으나, 이는 전용 에이전트 신설 후보.

### 현재 파일 상태 (실증)

`src/claude/plan/commands/plan-bridge.md` 11~33행 Workflow:
- PRD 확인 → 와이어프레임/스티치 정리 → 브리지 문서 생성 → 구조 SSOT 확인 → 바인딩 확인 → routing metadata 분기

**문제**: Workflow 3단계 "브리지 문서 생성" (4개 파일 Write/Edit)은 에이전트 호출 없이 수행. 파일별 포맷/섹션 표준이 암묵적.

### 근거 (원본 회고)

[01-agent-capability-matrix.md §2.9](../../../../.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/01-agent-capability-matrix.md):
> general-purpose (plan-bridge 대행): 일관성 ★★★☆☆ — 전용 에이전트가 아니므로 bridge 표준화 약함

---

## 2. 제안 해결안

### 2.1 plan-bridge-writer 에이전트 명세

**파일**: `src/claude/plan/agents/plan-bridge-writer.md` (신규)

```yaml
---
name: plan-bridge-writer
description: /plan-bridge 전용 에이전트. PRD + 와이어프레임 + 스티치를
             개발 문서가 참조할 수 있는 브리지 컨텍스트로 정리합니다.
             구조 SSOT 및 feature binding 확인, routing metadata 분기를 수행합니다.
tools: ["Read", "Grep", "Glob", "Write", "Edit"]
model: opus
memory: project
color: cyan
---
```

### 2.2 책임 범위

| 수행 | 위임/비수행 |
|------|------------|
| 4개 브리지 문서 생성/갱신 | PRD 수정 (prd-writer 담당) |
| 구조 SSOT 존재 확인 | 구조 결정/감지 (`/dev-architecture` 담당) |
| feature binding 확인 | binding 결정 (`/dev-architecture` 담당) |
| routing metadata 분기 안내 | 실제 Dev 작업 (`/dev-feature` 담당) |

### 2.3 병렬 실행 보증

**중요**: dash-preview-phase3 #19에서 `/plan-bridge` + `/copy-reference-refresh` 병렬 실행이 가장 효율적이었다. 본 에이전트는 **copy-reference-baseline과 병렬 실행 가능**하도록 설계:

- 입력: PRD + 와이어프레임/스티치 (읽기 전용)
- 출력: 13파일 내외 (`00-context/` 디렉토리만 편집)
- 상호 배타 영역: copy evidence/는 건드리지 않음

### 2.4 커맨드 수정

`src/claude/plan/commands/plan-bridge.md` Workflow 3단계를:
```
3. 브리지 문서 생성 → plan-bridge-writer 에이전트 호출
```
로 변경.

---

## 3. 구현 단계 (TDD)

### 3.1 RED

**파일**: `tests/claude/plan/agents/plan-bridge-writer.test.ts` (신규)

```typescript
describe('plan-bridge-writer', () => {
  it('4개 브리지 문서 생성', async () => {
    const result = await runBridgeWriter({ slug: 'test-feature' })

    expect(result.files_created).toEqual([
      '.plans/features/active/test-feature/00-context/03-bridge-wireframe.md',
      '.plans/features/active/test-feature/00-context/04-bridge-stitch.md',
      '.plans/features/active/test-feature/00-context/05-bridge-context.md',
      '.plans/features/active/test-feature/00-context/07-routing-metadata.md',
    ])
  })

  it('PCC-01~05 자동 통과', async () => {
    const result = await runBridgeWriter({ slug: 'test-feature' })

    expect(result.pcc_status).toMatchObject({
      'PCC-01': 'pass',
      'PCC-02': 'pass',
      'PCC-03': 'pass',
      'PCC-04': 'pass',
      'PCC-05': 'pass',
    })
  })

  it('구조 SSOT 미존재 시 중단 + /dev-architecture 안내', async () => {
    await expect(
      runBridgeWriter({ slug: 'missing-arch-feature' })
    ).rejects.toThrow(/\/dev-architecture/)
  })

  it('feature 유형 copy면 /copy-reference-refresh 안내', async () => {
    const result = await runBridgeWriter({ slug: 'copy-feature' })

    expect(result.next_command).toContain('/copy-reference-refresh')
  })

  it('feature 유형 dev면 /dev-feature 안내', async () => {
    const result = await runBridgeWriter({ slug: 'dev-feature' })

    expect(result.next_command).toBe('/dev-feature dev-feature')
  })

  it('copy-reference-baseline과 병렬 실행 시 충돌 없음', async () => {
    const [bridgeResult, evidenceResult] = await Promise.all([
      runBridgeWriter({ slug: 'parallel-test' }),
      runCopyReferenceBaseline({ slug: 'parallel-test' }),
    ])

    expect(bridgeResult.status).toBe('success')
    expect(evidenceResult.status).toBe('success')
    expect(bridgeResult.files_created).not.toEqual(
      expect.arrayContaining(evidenceResult.files_created)
    )
  })
})
```

### 3.2 GREEN

**파일 생성/수정**:

1. `src/claude/plan/agents/plan-bridge-writer.md` (신규)
2. `src/claude/plan/commands/plan-bridge.md` (Workflow 재작성)

### 3.3 IMPROVE

- 브리지 문서 4종 각각을 템플릿화:
  - `src/claude/plan/_templates/03-bridge-wireframe.template.md`
  - `src/claude/plan/_templates/04-bridge-stitch.template.md`
  - `src/claude/plan/_templates/05-bridge-context.template.md`

---

## 4. 영향 파일

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/commands/plan-bridge.md` | 에이전트 호출 래퍼로 전환 |

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/agents/plan-bridge-writer.md` | 에이전트 정의 |
| `src/claude/plan/_templates/03-bridge-wireframe.template.md` | 템플릿 |
| `src/claude/plan/_templates/04-bridge-stitch.template.md` | 템플릿 |
| `src/claude/plan/_templates/05-bridge-context.template.md` | 템플릿 |
| `tests/claude/plan/agents/plan-bridge-writer.test.ts` | 에이전트 테스트 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/agents/plan-bridge-writer.md` | Claude와 동등 |
| `src/codex/plan/commands/plan-bridge.md` | 동등 래퍼 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] 4개 브리지 문서 모두 생성
- [ ] PCC-01~05 자동 통과
- [ ] 구조 SSOT 미존재 시 명확한 중단 + 안내
- [ ] routing metadata 기반 next_command 정확
- [ ] copy-reference-baseline과 병렬 실행 시 파일 충돌 없음

### 5.2 회귀 시나리오 (dash-preview-phase3 복제)

- [ ] `/plan-bridge dash-preview-phase3` + `/copy-reference-refresh` 병렬 실행
- [ ] 13파일 + evidence/ 자동 생성
- [ ] 수동 개입 **0**

### 5.3 기존 동작 보장

- [ ] 기존 `/plan-bridge` 호출 스크립트 미변경
- [ ] bridge 문서 섹션 구성 후방 호환

---

## 6. 롤백 시나리오

에이전트 출력이 기존 general-purpose 대비 품질 저하 시:
1. `/plan-bridge` Workflow 재작성 되돌림 (general-purpose 대행으로 복귀)
2. 에이전트 파일은 유지 (차기 개선용)

---

## 7. 연관 백로그

- **IMP-KIT-003** (P0): plan-draft-writer (유사 패턴, 선행 참조)
- **IMP-KIT-012** (P1): bridge ↔ Phase A 경계 명확화 (본 항목 후속)
- **IMP-KIT-019** (P2): 병렬 실행 기본값 정책 (본 항목에서 확립된 병렬성 확장)

---

## 8. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
