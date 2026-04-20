---
ID: IMP-KIT-027
제목: /plan-design 커맨드 + claude-design-workflow 스킬 신설 + wireframe 후속 단계 택일 구조화
우선순위: P2 (Nice to Have)
영향 도메인: plan
RICE: R4 × I3 × C3 ÷ E3 = 12
공수: M (3~5일)
원본: 사용자 요청 (2026-04-20, 파이프라인 구조 보강 요청 2026-04-20)
안티패턴: `/plan-stitch` 대체 → **wireframe 후속 단계 택일** 관계로 재정의
릴리스 타깃: **2.2.1 hotfix** (2.2.0 직후 즉시 구현)
Codex 동기화: 동일 릴리스 (Claude + Codex 함께)
파일 위치 정책: 03-p0-detailed-specs/ 유지 + 05-p2-backlog-summary.md에 요약 항목 추가
상태: ready-to-implement (모든 §10 결정 확정 완료, v2.3)
---

# IMP-KIT-027 — /plan-design + claude-design-workflow 신설

## 1. 문제 정의

현재 `/plan-wireframe`은 PRD로부터 **ASCII + Mermaid 와이어프레임**만 생성한다. 텍스트 기반이라 **고품질 시각 자산이 필요한 기획**(투자 제안, UI 리뷰 미팅, 고객 프리뷰)에서 추가 디자인 작업이 별도로 수행되며, 이는 기획-개발 핸드오프 직전 품질 격차를 만든다.

### 현재 파일 상태 (실증)

`src/claude/plan/commands/plan-wireframe.md` 16~28행 Workflow:
- PRD 로드 → plan-wireframe-designer 에이전트 스폰 → ASCII art + Mermaid + 컴포넌트 명세 생성 → PCC-04 검증

**문제**: 출력이 텍스트 전용. 반응형/인터랙션/브랜드 컬러 같은 시각 특성이 담기지 않음. 이해관계자 리뷰용 고정밀 시안이 필요하면 Figma/Canva 등 외부 도구로 별도 작업.

### 신규 기회 (Claude Design — 2026-04-17 출시)

Anthropic이 2026-04-17 출시한 [Claude Design](https://support.claude.com/ko/articles/14604416-claude-design-시작하기)은 자연어 프롬프트를 **클릭 가능한 프로토타입**으로 변환한다:

- Wireframe 모드(rough) + High fidelity 모드(브랜드 반영)
- PRD 수준 설명 → 3~10 화면 자동 생성
- 디자인 시스템 연동(코드베이스/디자인 파일 읽기)
- PDF / URL / PPTX / Canva 익스포트
- Pro/Max/Team/Enterprise 유료 구독 전용
- **제약**: brow 기반 GUI 제품 → API/CLI/MCP 없음. 자동 호출 불가

### 파이프라인 구조 재정의 (v2 보강 — 2026-04-20)

사용자의 추가 요청으로 파이프라인 구조가 명확히 재정의되었다:

**새 파이프라인**:
```
/plan-prd
   ↓
/plan-wireframe (필수 선행 — 텍스트 기반 ASCII/Mermaid)
   ↓
[/plan-design 또는 /plan-stitch]  ← wireframe 후속 단계에서 택일 (기본값)
   ↓
/plan-bridge
```

**택일 관계** (기본):

| 커맨드 | 본질 | wireframe 후속 단계에서의 역할 |
|--------|------|-------------------------------|
| `/plan-wireframe` | 텍스트 화면 **생성** | **공통 필수 선행** 단계 |
| `/plan-design` | 시각적 시안 생성 (Claude Design) | **선택지 A** — 고품질 시각 자산 필요 시 |
| `/plan-stitch` | PRD ↔ 화면 매핑·검증 | **선택지 B** — 기존 통합 검증 중심 |
| `/plan-bridge` | 개발 핸드오프 | 무관, 후속 진행 |

**정책**:
- 기본 원칙: design과 stitch는 **택일** (한 Feature에서 하나만 수행)
- 예외 허용: 사용자가 **명시적으로 순차 실행**하는 경우 허용 (design → stitch 또는 그 반대)
- 자동 배타: routing-metadata의 `post_wireframe_path` 필드로 선택 추적 (§2.6 배타 게이트 참조)

**의도**:
- wireframe은 구조/레이아웃 정의용 **공통 기반**
- 이후 **시각적 완성도**(design) 또는 **통합 검증**(stitch) 중 목적에 맞춰 선택
- "wireframe → Claude Design → 완성된 기획 화면"이라는 시각 자산 중심 플로우를 1급 지원
- wireframe 후속 단계는 **선택적** — bridge 진입 시 미실행 감지하면 사용자 확인 Checkpoint (Feature 특성에 따라 생략 허용)

---

## 2. 제안 해결안

### 2.1 `/plan-design` 커맨드 명세

**파일**: `src/claude/plan/commands/plan-design.md` (신규)

```
/plan-design {slug}                       # 프롬프트 생성 모드
/plan-design {slug} --register <url>      # 결과 URL/자산 등록 모드
/plan-design {slug} --fidelity high       # 고정밀 모드 (기본: wireframe)
```

#### 모드 1: 프롬프트 생성 (기본) — Wireframe → High Fidelity 2단계 프롬프트 생성

Claude Design의 두 모드(Wireframe / High Fidelity)를 모두 활용하는 **2단계 반복 워크플로우**를 지원하기 위해 **프롬프트 2개를 순차적으로 출력**한다. 사용자는 먼저 wireframe 프롬프트로 rough 시안을 얻은 뒤, 만족 시 high fidelity 프롬프트로 고품질 최종 디자인을 생성한다.

1. **입력 로드 (PRD + Wireframe 둘 다 필수)**:
   - PRD: `.plans/prd/10-approved/{slug}-prd.md`
   - Wireframe 디렉터리: `.plans/wireframes/{slug}/` (screens/components/navigation/decision-log 전체)
   - **wireframe 미존재 시**: "wireframe 선행 필요 — `/plan-wireframe {slug}` 먼저 실행" 에러 반환 + 중단
2. **컨텍스트 추출** (두 입력 통합):
   - **PRD에서**: SCR-ID 목록, 요구사항 ID(REQ-*), 비기능 요구사항(반응형/접근성/브랜드), UX 섹션 핵심 흐름
   - **Wireframe에서**: 화면별 레이아웃 구조(ASCII/Mermaid), 컴포넌트 계층, 네비게이션 관계, decision-log의 의사결정 근거, viewport별 판정(desktop/tablet/mobile)
   - **상호 참조**: SCR-ID ↔ wireframe 화면 매핑 (plan-wireframe-designer가 `SCR-001 ↔ screens/home.md` 형식으로 기록한 연결 활용)
3. **프롬프트 템플릿 2종 렌더링** (순차 출력):
   - **[1단계] Wireframe 프롬프트** (`_templates/design-prompt-wireframe.template.md`):
     - Claude Design의 wireframe 모드 지시 (선명한 구조, 저포화 색상, 텍스트 플레이스홀더 허용)
     - 레이아웃 + 컴포넌트 배치 + 네비게이션 흐름 중심
     - 브랜드 세부 사항은 최소 (나중 단계에서 상세화)
   - **[2단계] High Fidelity 프롬프트** (`_templates/design-prompt-highfidelity.template.md`):
     - Claude Design의 high fidelity 모드 지시 (브랜드 컬러 · 타이포 · 이미지 · 마이크로인터랙션)
     - wireframe 단계에서 확정한 구조를 **유지**하도록 "wireframe 단계 산출물을 기준으로 세부 완성" 명시
     - 반응형 규칙 상세화 (viewport별 breakpoint, 컴포넌트 적응 규칙)
   - 두 프롬프트 모두 동일한 PRD + Wireframe 컨텍스트를 공유하되, **지시 수준과 출력 품질 기대치**가 다름
4. **출력 파일** (2개, 순서 고정):
   - `.plans/design/{slug}/prompt-01-wireframe.md` (**먼저 사용**)
   - `.plans/design/{slug}/prompt-02-highfidelity.md` (**wireframe 단계 만족 후 사용**)
   - 각 파일의 공통 섹션: Overview / Screens (SCR-ID × Wireframe 매핑) / Components / Responsive Rules / Brand Hints
   - fidelity 지시 섹션만 각 파일에서 다름
5. **사용자 안내** (stdout):
   ```
   [1단계 — Wireframe 프롬프트] 다음을 https://claude.ai/design 에 붙여넣으세요:
     .plans/design/{slug}/prompt-01-wireframe.md
   → Wireframe 모드로 실행하여 rough 시안 확인.

   [2단계 — High Fidelity 프롬프트] Wireframe 결과 만족 시 동일 세션에서 다음을 붙여넣으세요:
     .plans/design/{slug}/prompt-02-highfidelity.md
   → High Fidelity 모드로 전환하여 고품질 최종 디자인 생성.

   두 단계 완료 후 결과 URL을 `/plan-design {slug} --register <url>`로 등록하세요.
   ```

#### `--fidelity` 플래그 동작 (v2.2 재정의)

| 값 | 출력 |
|:-:|------|
| (생략, 기본) | **둘 다 생성** (prompt-01-wireframe + prompt-02-highfidelity) |
| `wireframe` | prompt-01만 생성 (high fidelity 건너뜀 — 간단한 Feature용) |
| `high` | prompt-02만 생성 (기존 wireframe 결과 재활용 시) |

**기본값 "둘 다"**는 사용자 요청에 따른 변경 — wireframe → high fidelity 반복 플로우가 가장 일반적.

#### 모드 2: 결과 등록

1. `--register <url>` 플래그로 호출 → URL 검증 (claude.ai 도메인)
2. `.plans/design/{slug}/manifest.md` 생성/갱신
3. 메타데이터: URL · fidelity 모드 · export 포맷(PDF/PPTX) · 등록 시각 · SCR-ID 매핑

### 2.2 `claude-design-workflow` 스킬 명세

**파일**: `src/claude/plan/skills/claude-design-workflow/SKILL.md` (신규)

역할:
- Claude Design 프롬프트 작성 패턴 가이드
- SCR-ID 강제 주입 규칙 (PCC-04 호환 보증)
- fidelity 모드 선택 기준 (wireframe vs high)
- 디자인 시스템 연동 방법
- 익스포트 포맷별 활용 시나리오

활성 조건:
- `/plan-design` 커맨드 실행 시
- 사용자가 "claude design", "clude.ai/design" 언급 시
- PRD 작성 후 시각 자산 필요 시

### 2.3 `/plan-stitch`의 역할 유지 (변경 없음)

**파일**: `src/claude/plan/commands/plan-stitch.md` (**수정 없음**)

v1 초안에서 stitch의 "세 번째 입력 경로 추가(Design manifest 인식)"을 제안했으나, 파이프라인 구조 v2 재정의로 **택일 관계**가 도입됨에 따라 **해당 확장은 제거**한다:

- stitch는 기존 역할 그대로 유지 (PRD ↔ 화면 매핑·검증)
- Design 선택 시 stitch는 스킵 (routing-metadata `post_wireframe_path: design`)
- plan-stitch-integrator 에이전트 **수정 없음**

사용자가 **명시적으로 순차 실행**(예: design 후 별도 stitch 재실행)하는 경우는 허용하되, 이는 `--force` 수준의 명시적 행동으로 기본 경로가 아님.

### 2.4 `/plan-wireframe` 필수 선행 단계로 재정의

**파일**: `src/claude/plan/commands/plan-wireframe.md` (문서 보강)

- 모든 Feature의 **필수 선행** 단계로 포지셔닝
- `/plan-design`과 `/plan-stitch`는 둘 다 **wireframe 완료 후** 실행 (wireframe 없이 직접 호출 시 경고 + 자동 안내)
- wireframe은 ASCII/Mermaid 텍스트 기반 화면 **구조 정의** — 이후 단계에서 시각화(design) 또는 검증(stitch)으로 확장

### 2.5 책임 범위

| 수행 | 위임/비수행 |
|------|------------|
| **PRD + Wireframe 통합 로드** (두 입력 필수) | 실제 Claude Design 호출 (수동 — claude.ai 브라우저) |
| SCR-ID ↔ wireframe 화면 매핑 추출 | wireframe 재작성 (plan-wireframe 담당) |
| 프롬프트 생성/저장 (Screens/Components/Responsive/Brand 통합) | 디자인 품질 평가 (plan-reviewer 담당) |
| URL 등록 · 매니페스트 관리 | Claude Design 결과물 편집 (사용자가 직접) |
| routing-metadata `post_wireframe_path` 필드 갱신 | PRD 수정 (prd-writer 담당) |
| wireframe 선행 검증 (Preconditions 게이트) | stitch 확장 (이전 v1 제거 — 본 커맨드 책임 아님) |

### 2.6 배타 게이트 구현 (신규)

**파일**: `src/claude/plan/_schemas/routing-metadata.schema.json` (또는 기존 routing-metadata 문서에 필드 추가)

#### 신규 필드: `post_wireframe_path`

```yaml
post_wireframe_path: design | stitch | null
```

- `design`: `/plan-design` 선택 완료 (manifest 등록됨)
- `stitch`: `/plan-stitch` 선택 완료
- `null` (기본): 아직 후속 단계 선택 안 됨

#### 게이트 동작 (배타 원칙)

| 호출 | 현재 `post_wireframe_path` | 동작 |
|:-:|:-:|------|
| `/plan-design` | `null` | 정상 진행 → `post_wireframe_path: design` 기록 |
| `/plan-design` | `design` | 정상 진행 (재실행/갱신) |
| `/plan-design` | `stitch` | **경고** — "이미 stitch 경로 선택됨. 순차 실행하려면 `--force-sequential` 플래그 사용" |
| `/plan-stitch` | `null` | 정상 진행 → `post_wireframe_path: stitch` 기록 |
| `/plan-stitch` | `stitch` | 정상 진행 (재실행) |
| `/plan-stitch` | `design` | **경고** — "이미 design 경로 선택됨. 순차 실행하려면 `--force-sequential` 플래그 사용" |

#### `--force-sequential` 플래그 (예외 허용)

- 기본 택일 원칙을 우회하여 다른 경로를 **순차 추가 실행**
- routing-metadata의 `post_wireframe_path`를 `design+stitch` 또는 `stitch+design`으로 갱신 (실행 순서 포함)
- 감사 추적용 `sequential_reason: string` 필드도 함께 기록 (사용자 입력 필수)

#### bridge 진입 시 Checkpoint

`/plan-bridge`가 `post_wireframe_path: null` 감지 시:

```
⚠️ wireframe 후속 단계(design/stitch)가 선택되지 않았습니다.
다음 중 하나를 선택하세요:
1) /plan-design {slug} — Claude Design 시각 자산 생성
2) /plan-stitch {slug} — PRD ↔ 화면 매핑 검증
3) 건너뛰고 bridge 진행 (간단한 Feature 또는 미구독 환경)
선택 [1/2/3]:
```

사용자가 3을 선택하면 routing-metadata에 `post_wireframe_path: skipped` 기록 + 이유 필드 채움.

---

## 3. 구현 단계 (TDD)

### 3.1 RED

**파일**: `tests/claude/plan/commands/plan-design.test.ts` (신규)

```typescript
describe('/plan-design', () => {
  it('PRD + Wireframe 둘 다 존재하면 통합 로드', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })

    expect(result.inputs_loaded).toEqual({
      prd: '.plans/prd/10-approved/test-feature-prd.md',
      wireframes_dir: '.plans/wireframes/test-feature/',
    })
  })

  it('wireframe 미존재 시 /plan-wireframe 선행 안내 + 거부', async () => {
    // .plans/wireframes/{slug}/ 없음, PRD만 있음
    await expect(
      runPlanDesign({ slug: 'prd-only' })
    ).rejects.toThrow(/\/plan-wireframe/)
  })

  it('PRD 미존재 시 /plan-prd 선행 안내 + 거부', async () => {
    // wireframes/ 있음, PRD 없음
    await expect(
      runPlanDesign({ slug: 'wireframe-only' })
    ).rejects.toThrow(/\/plan-prd/)
  })

  it('기본(플래그 생략) 호출 시 wireframe + high fidelity 프롬프트 2개 순차 생성', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })

    // 두 파일 생성 확인 (순서 고정)
    expect(result.files_created).toEqual([
      '.plans/design/test-feature/prompt-01-wireframe.md',
      '.plans/design/test-feature/prompt-02-highfidelity.md',
    ])
    // stdout에도 순서대로 안내
    expect(result.stdout).toMatch(/1단계.*prompt-01-wireframe/)
    expect(result.stdout).toMatch(/2단계.*prompt-02-highfidelity/)
    // 2단계 안내가 1단계보다 뒤에 등장
    expect(result.stdout.indexOf('1단계')).toBeLessThan(
      result.stdout.indexOf('2단계')
    )
  })

  it('wireframe 프롬프트(1단계)는 rough 시안 지시 포함', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })
    const wireframePrompt = readFile(result.files_created[0])

    // Wireframe 모드 지시
    expect(wireframePrompt).toMatch(/wireframe 모드|wireframe mode/i)
    expect(wireframePrompt).toMatch(/rough|선명한 구조|저포화/i)
    // 브랜드 세부는 최소
    expect(wireframePrompt).not.toMatch(/high fidelity|고품질/i)
  })

  it('high fidelity 프롬프트(2단계)는 wireframe 기준 유지 + 상세 지시', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })
    const hfPrompt = readFile(result.files_created[1])

    // High fidelity 모드 지시
    expect(hfPrompt).toMatch(/high fidelity|고품질/i)
    // wireframe 결과 이어받기 명시
    expect(hfPrompt).toMatch(/wireframe 단계.*기준|유지|reference/i)
    // 브랜드/반응형 상세
    expect(hfPrompt).toMatch(/브랜드 컬러|타이포|breakpoint/i)
  })

  it('두 프롬프트 모두 PRD의 SCR-ID + Wireframe 화면 매핑 공유', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })
    const [wireframePrompt, hfPrompt] = result.files_created.map(readFile)

    for (const prompt of [wireframePrompt, hfPrompt]) {
      // PRD에서 추출
      expect(prompt).toContain('SCR-001')
      expect(prompt).toContain('SCR-002')
      // Wireframe에서 추출
      expect(prompt).toMatch(/screens\/|home 화면/)
      // 매핑 섹션
      expect(prompt).toMatch(/SCR-001.*↔.*screens|매핑/)
    }
  })

  it('두 프롬프트 모두 viewport별 반응형 규칙 포함', async () => {
    const result = await runPlanDesign({ slug: 'test-feature' })
    const [wireframePrompt, hfPrompt] = result.files_created.map(readFile)

    for (const prompt of [wireframePrompt, hfPrompt]) {
      expect(prompt).toMatch(/desktop/i)
      expect(prompt).toMatch(/tablet/i)
      expect(prompt).toMatch(/mobile/i)
    }
    // high fidelity는 breakpoint 상세 포함
    expect(hfPrompt).toMatch(/breakpoint/i)
  })

  it('두 프롬프트 모두 wireframe decision-log 근거 포함', async () => {
    const result = await runPlanDesign({ slug: 'with-decisions' })
    const [wireframePrompt, hfPrompt] = result.files_created.map(readFile)

    for (const prompt of [wireframePrompt, hfPrompt]) {
      expect(prompt).toMatch(/decision-log|의사결정|근거/)
    }
  })

  it('--fidelity wireframe 플래그 시 1단계만 생성', async () => {
    const result = await runPlanDesign({
      slug: 'test-feature',
      fidelity: 'wireframe',
    })

    expect(result.files_created).toEqual([
      '.plans/design/test-feature/prompt-01-wireframe.md',
    ])
    expect(result.files_created).not.toContain(
      '.plans/design/test-feature/prompt-02-highfidelity.md'
    )
  })

  it('--fidelity high 플래그 시 2단계만 생성', async () => {
    const result = await runPlanDesign({
      slug: 'test-feature',
      fidelity: 'high',
    })

    expect(result.files_created).toEqual([
      '.plans/design/test-feature/prompt-02-highfidelity.md',
    ])
  })

  it('--register 호출 시 manifest.md 생성', async () => {
    await runPlanDesign({
      slug: 'test-feature',
      register: 'https://claude.ai/design/abc123',
    })

    expect(existsSync('.plans/design/test-feature/manifest.md')).toBe(true)
    const manifest = readFile('.plans/design/test-feature/manifest.md')
    expect(manifest).toContain('https://claude.ai/design/abc123')
  })

  it('--register 호출 시 claude.ai 도메인이 아니면 거부', async () => {
    await expect(
      runPlanDesign({
        slug: 'test-feature',
        register: 'https://figma.com/file/xyz',
      })
    ).rejects.toThrow(/claude\.ai/)
  })

})

describe('/plan-design (wireframe 선행 필수)', () => {
  it('wireframe 미실행 시 거부 + /plan-wireframe 안내', async () => {
    // .plans/wireframes/{slug}/ 미존재
    await expect(
      runPlanDesign({ slug: 'no-wireframe' })
    ).rejects.toThrow(/\/plan-wireframe/)
  })

  it('wireframe 완료 후 정상 진행 + post_wireframe_path=design 기록', async () => {
    const result = await runPlanDesign({
      slug: 'with-wireframe',
      register: 'https://claude.ai/design/xyz',
    })

    expect(result.routing_metadata.post_wireframe_path).toBe('design')
  })
})

describe('배타 게이트 (post_wireframe_path)', () => {
  it('design 선택 후 stitch 호출 시 경고 + --force-sequential 안내', async () => {
    // 먼저 design 완료
    await runPlanDesign({ slug: 'exclusive' })

    // stitch 호출 시 경고
    const result = await runPlanStitch({ slug: 'exclusive' })
    expect(result.warning).toMatch(/이미 design 경로 선택/)
    expect(result.warning).toMatch(/--force-sequential/)
  })

  it('--force-sequential 플래그 시 순차 실행 허용', async () => {
    await runPlanDesign({ slug: 'sequential' })

    const result = await runPlanStitch({
      slug: 'sequential',
      forceSequential: true,
      sequentialReason: '시각 자산 후 통합 검증도 필요',
    })

    expect(result.routing_metadata.post_wireframe_path).toBe('design+stitch')
    expect(result.routing_metadata.sequential_reason).toContain('시각 자산')
  })

  it('--force-sequential 시 reason 누락이면 거부', async () => {
    await runPlanDesign({ slug: 'no-reason' })

    await expect(
      runPlanStitch({ slug: 'no-reason', forceSequential: true })
    ).rejects.toThrow(/sequential_reason/)
  })
})

describe('/plan-bridge Checkpoint (후속 단계 미실행 감지)', () => {
  it('post_wireframe_path=null 감지 시 사용자 확인 Checkpoint', async () => {
    // wireframe만 완료, design/stitch 미실행
    const result = await runPlanBridge({
      slug: 'skipped',
      userAnswer: '3', // 건너뛰기 선택
    })

    expect(result.checkpoint_shown).toBe(true)
    expect(result.routing_metadata.post_wireframe_path).toBe('skipped')
    expect(result.routing_metadata.skip_reason).toBeDefined()
  })

  it('post_wireframe_path=design 감지 시 Checkpoint 생략 + 정상 진행', async () => {
    const result = await runPlanBridge({ slug: 'design-done' })

    expect(result.checkpoint_shown).toBe(false)
  })
})
```

### 3.2 GREEN

**파일 생성**:

1. `src/claude/plan/commands/plan-design.md` — `--register`, `--fidelity`(둘 다 기본), `--force-sequential` 플래그 포함
2. `src/claude/plan/skills/claude-design-workflow/SKILL.md`
3. `src/claude/plan/_templates/design-prompt-wireframe.template.md` (1단계 — rough 시안용)
4. `src/claude/plan/_templates/design-prompt-highfidelity.template.md` (2단계 — 고품질 최종용, wireframe 산출물 이어받기)
5. `src/claude/plan/_templates/design-manifest.template.md`
6. `src/claude/plan/_schemas/routing-metadata.schema.json` — `post_wireframe_path` 필드 추가 (또는 기존 스키마 문서 확장)

**파일 수정**:

1. `src/claude/plan/commands/plan-wireframe.md` — **필수 선행 단계** 포지셔닝 명시
2. `src/claude/plan/commands/plan-stitch.md` — **wireframe 선행 검증 게이트** + `post_wireframe_path` 감지 경고 + `--force-sequential` 플래그
3. `src/claude/plan/commands/plan-bridge.md` — **wireframe 후속 단계 미실행 Checkpoint** 로직 추가 (§2.6 참조)
4. `src/claude/plan/agents/plan-draft-writer.md` — routing-metadata에 `post_wireframe_path: null` 초기값 기록
5. `src/claude/plan/agents/plan-bridge-writer.md` — Checkpoint 출력 로직

**제외 (v2 보강으로 철회)**:
- ~~`src/claude/plan/agents/plan-stitch-integrator.md` — Investigation_Protocol 확장~~ (v1 초안에서만 제안, v2에서 철회)

### 3.3 IMPROVE

- 프롬프트 템플릿에 **브랜드 에셋 hint 섹션** 추가 (색상, 타이포, 로고 경로)
- `--register` 시 PPTX/PDF 로컬 파일 경로도 수용(URL 외 대안)
- `plan-reviewer`에 Design 품질 체크리스트 확장(SCR-ID 일관성, fidelity 적절성)
- routing-metadata 스키마에 `post_wireframe_path` enum 유효성 (schema validator 도입 시)

---

## 4. 영향 파일

### 신규

| 파일 | 목적 |
|------|------|
| `src/claude/plan/commands/plan-design.md` | 커맨드 정의 (`--register`/`--fidelity`(둘 다 기본)/`--force-sequential` 플래그 포함) |
| `src/claude/plan/skills/claude-design-workflow/SKILL.md` | 스킬 가이드 (wireframe → high fidelity 2단계 워크플로우 안내) |
| `src/claude/plan/_templates/design-prompt-wireframe.template.md` | 1단계 Wireframe 프롬프트 템플릿 (rough 시안용) |
| `src/claude/plan/_templates/design-prompt-highfidelity.template.md` | 2단계 High Fidelity 프롬프트 템플릿 (wireframe 산출물 이어받기) |
| `src/claude/plan/_templates/design-manifest.template.md` | 매니페스트 템플릿 |
| `src/claude/plan/_schemas/routing-metadata.schema.json` | routing-metadata 스키마 (`post_wireframe_path` 필드 포함) |
| `tests/claude/plan/commands/plan-design.test.ts` | 커맨드 + 2단계 프롬프트 + 배타 게이트 + bridge Checkpoint 테스트 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/claude/plan/commands/plan-wireframe.md` | **필수 선행 단계** 포지셔닝 명시 |
| `src/claude/plan/commands/plan-stitch.md` | wireframe 선행 게이트 + `post_wireframe_path` 감지 경고 + `--force-sequential` 플래그 |
| `src/claude/plan/commands/plan-bridge.md` | **wireframe 후속 단계 미실행 Checkpoint** 로직 추가 |
| `src/claude/plan/agents/plan-draft-writer.md` | routing-metadata에 `post_wireframe_path: null` 초기값 기록 |
| `src/claude/plan/agents/plan-bridge-writer.md` | Checkpoint 출력 로직 |

### 듀얼 타깃 (Codex)

| 파일 | 변경 내용 |
|------|----------|
| `src/codex/plan/commands/plan-design.md` | Claude와 동등 |
| `src/codex/plan/skills/claude-design-workflow/SKILL.md` | 동등 |
| `src/codex/plan/_templates/design-prompt-wireframe.template.md` | 동등 (1단계) |
| `src/codex/plan/_templates/design-prompt-highfidelity.template.md` | 동등 (2단계) |
| `src/codex/plan/_schemas/routing-metadata.schema.json` | 동등 |
| `src/codex/plan/commands/plan-stitch.md` | 동등 (wireframe 선행 게이트 + `--force-sequential`) |
| `src/codex/plan/commands/plan-wireframe.md` | 동등 (필수 선행 명시) |
| `src/codex/plan/commands/plan-bridge.md` | 동등 (Checkpoint 로직) |

### 문서

| 파일 | 변경 |
|------|------|
| `CLAUDE-KIT-QUICKSTART.md` | plan 파이프라인 섹션에 `/plan-design` 추가 + wireframe → [design/stitch] → bridge 구조 반영 |
| `docs/20-user-guide/` | Claude Design 통합 가이드 + 택일/순차 실행 정책 |

---

## 5. 검증 기준

### 5.1 단위 테스트 통과

- [ ] PRD의 모든 SCR-ID가 프롬프트에 주입됨
- [ ] 반응형 요구사항(3개 뷰포트) 자동 포함
- [ ] `--fidelity` 플래그가 프롬프트에 반영됨
- [ ] `--register`로 manifest.md 생성 및 URL 검증
- [ ] claude.ai 외 도메인 URL은 거부
- [ ] PRD 미존재 시 명확한 에러 + 안내
- [ ] `/plan-stitch`가 Design manifest를 단독 입력으로 수용
- [ ] Wireframe + Design 병행 시 둘 다 컨텍스트에 포함

### 5.2 통합 시나리오

- [ ] 전체 파이프라인: `/plan-prd` → `/plan-design` → (claude.ai/design 수동) → `/plan-design --register` → `/plan-stitch` → `/plan-bridge` 무충돌 진행
- [ ] fallback 시나리오: `/plan-prd` → `/plan-wireframe` → `/plan-stitch` (Design 없이) 기존과 동일 동작
- [ ] 병행 시나리오: `/plan-wireframe` + `/plan-design` 둘 다 실행 후 `/plan-stitch`가 양쪽 참조

### 5.3 기존 동작 보장

- [ ] 기존 `/plan-wireframe` 호출 스크립트/에이전트 호환
- [ ] 기존 `/plan-stitch` manifest 없는 Feature는 변경 없이 동작
- [ ] PCC-04/05 검증 기준 후방 호환

---

## 6. 롤백 시나리오

Claude Design 통합이 팀 워크플로우에 맞지 않을 경우:

1. `/plan-design` 커맨드를 **프롬프트 생성 전용**으로 축소 (manifest/stitch 통합 제거)
2. `/plan-stitch` Design 경로 인식 제거 → 기존 Wireframe 전용 복귀
3. 스킬 파일은 유지 (참조 자료로 활용)

---

## 7. 연관 백로그

- **IMP-KIT-010** (P1): plan-wireframe-designer 체크리스트 확장 — Design 체크리스트와 통합 가능
- **IMP-KIT-019** (P2): 병렬 실행 기본값 정책 — `/plan-wireframe` + `/plan-design` 병행 기본값 검토
- **IMP-KIT-026** (P2): 와이어프레임 ↔ 구현 drift — Design 결과물도 drift 감지 대상 확장

---

## 8. 리스크 및 완화

| 리스크 | 영향 | 완화 |
|--------|:-:|------|
| 팀원 중 Pro+ 미구독자 존재 | H | 시나리오 C(skip) 경로 제공. `/plan-wireframe` + `/plan-stitch`만으로 파이프라인 완결 가능. wireframe 자체는 텍스트 기반이므로 미구독자 접근 가능 |
| Claude Design UI/프롬프트 포맷 변동 | M | 프롬프트 템플릿 버전 관리, 스킬 문서 정기 갱신 |
| Design 결과물 외부 URL 소실 | M | `--register` 시 PDF/PPTX **로컬 사본** 권장, manifest에 해시 기록 |
| SCR-ID 매핑 자동 파싱 불가 (Design은 시각 자산) | H | 사용자가 수동 매핑 기입 필수 — manifest.md 템플릿이 강제 |
| API 부재로 완전 자동화 불가 | H | 스코프 제한: "프롬프트 생성 + 결과 등록"까지만 자동화, 생성은 수동 (문서 상단 명시) |
| **PRD와 wireframe 불일치** (예: PRD에는 있는 SCR-ID가 wireframe에 없음) | M | 프롬프트 생성 시 불일치 감지 → 경고 + 대상 SCR-ID 목록 보고. 사용자가 plan-wireframe 재실행 또는 `--ignore-mismatch` 플래그로 우회 가능 |
| **wireframe 토큰 과다** (decision-log/screens/components 전체 로드 시) | M | 프롬프트에는 핵심 섹션만 발췌 (각 화면 요약 ≤ 30줄). 전체 원본은 경로 참조로만 명시 |

---

## 9. 사용자 워크플로우 예시 (v2 — 3가지 시나리오)

### 시나리오 A: Claude Design 활용 (시각 자산 완성까지 — 2단계 프롬프트)

```
# 1. PRD 완성
/plan-prd user-onboarding

# 2. Wireframe 생성 (필수 선행)
/plan-wireframe user-onboarding
→ .plans/wireframes/user-onboarding/ (ASCII/Mermaid)

# 3. Design 프롬프트 2개 생성 (기본 동작 — wireframe + high fidelity 둘 다)
/plan-design user-onboarding
→ .plans/design/user-onboarding/prompt-01-wireframe.md   (1단계)
→ .plans/design/user-onboarding/prompt-02-highfidelity.md (2단계)
→ stdout 안내:
   "[1단계] prompt-01-wireframe.md 를 https://claude.ai/design 에 붙여넣으세요"
   "[2단계] wireframe 만족 시 prompt-02-highfidelity.md 를 동일 세션에서 이어서"

# 4. (사용자 — 1단계) claude.ai/design에서 prompt-01 붙여넣기 → Wireframe 모드 실행
→ rough 시안 확인 · 조정

# 5. (사용자 — 2단계) 동일 세션에서 prompt-02 붙여넣기 → High Fidelity 모드 전환
→ 브랜드 컬러 · 타이포 · 마이크로인터랙션 완성
→ 최종 디자인 익스포트 (PDF/URL/PPTX)

# 6. 결과 URL 등록
/plan-design user-onboarding --register https://claude.ai/design/abc123
→ .plans/design/user-onboarding/manifest.md 갱신 (fidelity: "high", stages: ["wireframe", "high-fidelity"])
→ routing-metadata.post_wireframe_path = "design"

# 7. 개발 핸드오프 (Checkpoint 생략 — design 선택 완료 상태)
/plan-bridge user-onboarding
```

**변형**: 1단계로 충분한 경우 `/plan-design user-onboarding --fidelity wireframe`으로 prompt-01만 생성.
**변형**: 이미 wireframe 시안이 있고 바로 고품질로 진입하는 경우 `--fidelity high`로 prompt-02만 생성.

### 시나리오 B: 기존 통합 검증 (텍스트 기반 종료)

```
# 1. PRD 완성
/plan-prd landing-update

# 2. Wireframe 생성 (필수 선행)
/plan-wireframe landing-update

# 3. 통합 검증 (PRD ↔ 화면 매핑)
/plan-stitch landing-update
→ routing-metadata.post_wireframe_path = "stitch"

# 4. 개발 핸드오프 (Checkpoint 생략)
/plan-bridge landing-update
```

### 시나리오 C: wireframe만 + bridge 직행 (간단 Feature / 미구독자)

```
# 1. PRD + Wireframe
/plan-prd internal-tool
/plan-wireframe internal-tool

# 2. 바로 bridge 진입
/plan-bridge internal-tool
→ ⚠️ Checkpoint: "wireframe 후속 단계가 선택되지 않았습니다. [1/2/3]:"
→ 사용자: 3 (건너뛰기)
→ routing-metadata.post_wireframe_path = "skipped"
→ routing-metadata.skip_reason = "간단한 내부 도구 — Design/Stitch 불필요"
```

### 시나리오 D: 순차 실행 (예외 경로 — 명시적)

```
# 1~3. 시나리오 A의 1~5단계 진행 (Design 완료)

# 4. 사용자가 통합 검증도 추가로 원함 → --force-sequential 사용
/plan-stitch user-onboarding --force-sequential --sequential-reason "시각 자산 후 통합 검증"
→ 기본 배타 경고를 우회 (명시적 사용자 의도)
→ routing-metadata.post_wireframe_path = "design+stitch"
→ routing-metadata.sequential_reason = "시각 자산 후 통합 검증"

# 5. bridge
/plan-bridge user-onboarding
```

---

## 10. 확정 사항 (v2.3 — 모든 항목 확정 완료)

### 10.1 v1 5개 항목 최종 처리 (2026-04-20 사용자 결정)

| # | 원래 질문 | 확정값 |
|:-:|----------|--------|
| 1 | 번호 배정 IMP-KIT-027 확정? | ✅ **IMP-KIT-027 그대로 사용** |
| 2 | P0 폴더 유지 vs 별도 패키지 분리? | ✅ **hybrid** — 파일은 `03-p0-detailed-specs/` 유지 + `05-p2-backlog-summary.md`에 요약 항목 추가 |
| 3 | 릴리스 타깃 2.3.0 vs 2.4.0? | ✅ **2.2.1 hotfix** (2.2.0 직후 즉시 구현 — 가장 빠른 경로) |
| 4 | fallback 정책: 병행 vs 택일? | ✅ v2에서 **wireframe 후속 단계 택일** |
| 5 | Codex 동기화 2.3.0 동시 vs 이월? | ✅ **동일 릴리스(2.2.1)에서 Claude + Codex 함께** |

### 10.2 v2 신규 확정 항목

| # | 질문 | 확정값 |
|:-:|------|--------|
| 6 | Design 선택 후 stitch도 원하는 경우? | **순차 실행 허용** (--force-sequential 플래그 + sequential_reason 필수) |
| 7 | wireframe 후속 단계 미실행 가능? | **사용자에게 bridge 진입 시 Checkpoint** — 스킵 허용 |
| 8 | 배타 게이트 구현 방식? | **routing-metadata `post_wireframe_path` 필드** (enum: design/stitch/design+stitch/stitch+design/skipped/null) |

### 10.3 구현 착수 조건 (모두 충족)

- [x] 번호 확정 (IMP-KIT-027)
- [x] 위치 확정 (P0 폴더 + P2 요약 hybrid)
- [x] 릴리스 타깃 확정 (2.2.1 hotfix)
- [x] Codex 동기화 확정 (함께)
- [x] fallback 정책 확정 (택일 + --force-sequential 예외)
- [x] 배타 게이트 메커니즘 확정 (post_wireframe_path)
- [x] 입력 요구사항 확정 (PRD + Wireframe 통합 로드)
- [x] 프롬프트 출력 방식 확정 (wireframe → high-fidelity 2단계 순차)

**상태**: **ready-to-implement** — 본격 구현 착수 가능.

---

## 11. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 — 사용자 요청 기반 | claude-kit roadmap author |
| 2026-04-20 | **v2 보강** — 파이프라인 구조 재정의 (wireframe 필수 선행 + design/stitch 택일 + 순차 실행 예외 + routing-metadata `post_wireframe_path` 필드 + bridge Checkpoint). 3개 결정사항 확정, 3개 남음. | claude-kit roadmap author |
| 2026-04-20 | **v2.1 보강** — 프롬프트 생성 시 PRD + Wireframe **통합 로드** 요구사항 반영. §2.1 모드 1 로직 확장 (두 입력 필수 + 컨텍스트 추출 + SCR-ID ↔ 화면 매핑), §2.5 책임 범위 갱신, §3.1 RED 테스트 확장(6개 케이스 신규), §8 리스크 2건 추가 (PRD↔wireframe 불일치, wireframe 토큰 과다) | claude-kit roadmap author |
| 2026-04-20 | **v2.2 보강** — 프롬프트 **2단계 순차 출력** (wireframe → high fidelity). `--fidelity` 기본값을 "둘 다 생성"으로 재정의. §2.1 모드 1 재구성 (template 2종 · 파일 2개 출력 · stdout 2단계 안내), §3.1 RED 테스트 8개 신규, §4 영향 파일 분리 (prompt-wireframe.template + prompt-highfidelity.template), §9 시나리오 A를 2단계 플로우로 갱신 | claude-kit roadmap author |
| 2026-04-20 | **v2.3 확정** — §10 미확정 4건 사용자 결정 완료. 릴리스 타깃 **2.2.1 hotfix**, Codex **함께 동기화**, 위치 hybrid, 번호 IMP-KIT-027. frontmatter에 릴리스 타깃/Codex 정책/파일 위치 정책 추가, 상태 `ready-to-implement`로 전환. 05-p2-backlog-summary.md에 요약 항목 추가 예정 | claude-kit roadmap author |
