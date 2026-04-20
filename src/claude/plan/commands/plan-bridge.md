# /plan-bridge

기획 산출물을 개발 파이프라인으로 넘기기 전에 브리지 컨텍스트와 개발 구조 게이트 상태를 확인한다.

> 에이전트: `plan-bridge-writer` (IMP-KIT-004로 신설) — **Standard Feature 전용**
> 병렬 실행: `/copy-reference-refresh`와 동시 호출 가능 (디렉토리 배타: `00-context/` vs `evidence/`)

## 대상 범위

**Standard Feature 전용**. Lite Feature는 `/plan-draft` 직후 `/dev-feature` 또는 `/copy-reference-refresh`로 직행하며 bridge를 생략한다. Lite에서 `/plan-bridge`를 호출하면 에이전트가 거부 + 경로 안내 후 중단.

## Usage

```bash
/plan-bridge {slug}
```

## Required Inputs

- routing metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` (`/plan-draft`에서 선행 생성, `category: Standard` 필수)
- 기획 산출물 (둘 중 하나):
  - 승인된 PRD: `.plans/prd/10-approved/{slug}-prd.md` (권장)
  - First Pass: `.plans/features/drafts/{slug}/first-pass.md` (PRD 진행 중 단계)
- 선택 입력: `.plans/wireframes/{slug}/`, `.plans/stitch/{slug}/`

## Workflow

1. **입력 검증**: routing-metadata 존재 + `category: Standard` 확인. PRD 승인 또는 first-pass 존재 확인. 어느 하나 부재 시 선행 커맨드 안내 + 중단.
2. **에이전트 스폰**: `plan-bridge-writer` 에이전트를 Task tool로 호출
   - 에이전트가 수행:
     - Standard 게이트 (Lite 거부)
     - 구조 SSOT(`.plans/project/00-dev-architecture.md`) 존재 + frontmatter `status: approved` 게이트
     - Feature binding(`00-context/06-architecture-binding.md`) 존재 게이트
     - 보조 산출물 수집 (와이어프레임, 스티치)
     - 브리지 문서 4종 처리 (재실행 정책: no-op / `.prev-{timestamp}.md` 백업 / `<!-- manual edit -->` 섹션 보존):
       - `03-bridge-wireframe.md` (생성/갱신)
       - `04-bridge-stitch.md` (생성/갱신)
       - `05-bridge-context.md` (생성/갱신)
       - `07-routing-metadata.md` (Read 전용 — drift 감지 시 경고 + 중단)
     - PCC-01~05 자기 검증 (PCC-04는 scenario=null/와이어프레임 부재 시 N/A → PASS)
   - 게이트 실패 시 에이전트가 중단 사유와 후속 커맨드 반환:
     - SSOT 부재/미승인 → `/dev-architecture` (프로젝트 레벨, slug 인자 없음)
     - binding 부재 → `/dev-architecture {slug}` (feature-level)
     - routing-metadata drift → `/plan-draft --rescore`
3. **다음 경로 결정** (에이전트가 routing metadata 기반 안내):
   - feature_type: `copy` → `/copy-reference-refresh` (시나리오별 분기 — A/B: 원본 캡처, C: 갭 분석 선행)
   - feature_type: `dev`, hybrid=false → `/dev-feature {slug}`
   - feature_type: `dev`, hybrid=true:
     - IMP-KIT-006 활성: `/dev-feature {slug}` + 병행 `/copy-reference-refresh --reference-only`
     - IMP-KIT-006 미활성: `/dev-feature {slug}` 단독 + "Hybrid 감지 — 수동 레퍼런스 캡처 권장" 안내
4. **병렬 실행 권장** (dash-preview-phase3 회고 #19 패턴):
   - `/plan-bridge` + `/copy-reference-refresh`를 **동시 호출** 가능 — 디렉토리 배타(bridge `00-context/` vs baseline `evidence/`)로 충돌 없음
   - copy-reference-baseline 에이전트도 `00-context/` 접근 금지 규약을 따름 (쌍방 배타 — IMP-KIT-004 보강 커밋)
   - 병렬 실행 시 전체 파이프라인 시간 단축 (bridge 산출물 생성과 evidence 캡처가 독립적)

## Output

- 기획 산출물을 개발 문서가 참조할 수 있는 브리지 컨텍스트로 정리
- 프로젝트 구조 SSOT와 기능 구조 바인딩 존재 여부 확인
- 다음 단계 안내: `/dev-feature {slug}`

## Rules

- 이 단계에서는 코드를 만들지 않는다.
- 구조가 이미 있는 저장소라도 문서화되지 않았다면 구조 게이트를 통과한 것으로 간주하지 않는다.
- 개발 구조 판단의 단일 기준은 `.plans/project/00-dev-architecture.md`다.
- 기능별 경로 판단의 단일 기준은 `.plans/features/active/{slug}/00-context/06-architecture-binding.md`다.
