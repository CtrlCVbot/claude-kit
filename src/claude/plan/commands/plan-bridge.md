# /plan-bridge

기획 산출물을 개발 파이프라인으로 넘기기 전에 브리지 컨텍스트와 개발 구조 게이트 상태를 확인한다.

> 에이전트: `plan-bridge-writer` (IMP-KIT-004로 신설)
> 병렬 실행: `/copy-reference-refresh`와 동시 호출 가능 (디렉토리 배타: `00-context/` vs `evidence/`)

## Usage

```bash
/plan-bridge {slug}
```

## Required Inputs

- 승인된 PRD: `.plans/prd/10-approved/{slug}-prd.md`
- routing metadata: `.plans/features/active/{slug}/00-context/07-routing-metadata.md` (`/plan-draft`에서 선행 생성)
- 선택 입력: `.plans/wireframes/{slug}/`, `.plans/stitch/{slug}/`

## Workflow

1. **입력 검증**: PRD 승인 상태 + routing-metadata 존재 확인. 어느 하나 부재 시 선행 커맨드 안내 + 중단.
2. **에이전트 스폰**: `plan-bridge-writer` 에이전트를 Task tool로 호출
   - 에이전트가 수행:
     - 구조 SSOT(`.plans/project/00-dev-architecture.md`) 존재/승인 게이트
     - Feature binding(`00-context/06-architecture-binding.md`) 존재 게이트
     - 보조 산출물 수집 (와이어프레임, 스티치)
     - 브리지 문서 4종 생성/갱신:
       - `03-bridge-wireframe.md`
       - `04-bridge-stitch.md`
       - `05-bridge-context.md`
       - `07-routing-metadata.md` (plan-draft-writer 산출 존중, 복사만)
     - PCC-01~05 자기 검증
   - 게이트 실패 시 에이전트가 중단 사유와 후속 커맨드(`/dev-architecture`) 반환
3. **다음 경로 결정** (에이전트가 routing metadata 기반 안내):
   - feature_type: `copy` → `/copy-reference-refresh` (시나리오별 분기 — A/B: 원본 캡처, C: 갭 분석 선행)
   - feature_type: `dev`, hybrid=false → `/dev-feature {slug}`
   - feature_type: `dev`, hybrid=true → `/dev-feature {slug}` + 병행 `/copy-reference-refresh --reference-only`
4. **병렬 실행 권장** (dash-preview-phase3 회고 #19 패턴):
   - `/plan-bridge` + `/copy-reference-refresh`를 **동시 호출** 가능 — 디렉토리 배타로 충돌 없음
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
