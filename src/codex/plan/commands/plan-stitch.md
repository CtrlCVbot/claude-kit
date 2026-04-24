<!-- kit-convert generated: 2026-04-24 -->
# plan-stitch — Codex Entry Flow

PRD + Wireframe 통합 검증. 기획 산출물을 통합하여 Feature Package 컨텍스트를 생성합니다.

> **IMP-KIT-027 포지셔닝**: wireframe 후속 단계에서 **`/plan-design`과 택일** (기본). 순차 실행 시 `--force-sequential` 플래그 필요.
> 전제: `/plan-wireframe` **필수 선행**

## Invocation
```
plan-stitch {slug}                                              # PRD + Wireframe 통합
plan-stitch {slug} --force-sequential --sequential-reason "이유"  # design 선택 후 stitch도 실행
```

## Flags (IMP-KIT-027)

- `--force-sequential` — routing-metadata의 `post_wireframe_path`가 이미 `design`인 경우에도 실행 (배타 원칙 우회)
- `--sequential-reason "..."` — `--force-sequential`과 함께 필수 (감사 추적)

## Workflow

1. **입력 검증** (IMP-KIT-027 게이트):
   - routing-metadata 존재 + wireframe 디렉터리 존재 확인
   - wireframe 미존재 시 `/plan-wireframe {slug}` 선행 안내 + 중단
   - 배타 게이트 확인 (`post_wireframe_path`):
     - `null` | `stitch` | `stitch+design` | `design+stitch`: 정상 진행
     - `design`: 경고 + `--force-sequential` 플래그 필요
     - `skipped`: 사용자 재확인
2. **산출물 로드**:
   - PRD: `.plans/prd/10-approved/{slug}-prd.md`
   - Wireframe: `.plans/wireframes/{slug}/`
3. **에이전트 스폰**: `plan-stitch-integrator` 에이전트를 Task tool로 스폰
   - PRD ↔ Wireframe 일관성 검증
   - 요구사항-화면 매핑 (REQ-ID → Screen-ID)
   - 누락 탐지 및 보고
   - 통합 컨텍스트 문서 생성
4. **routing-metadata 갱신**:
   - `post_wireframe_path` 필드 설정:
     - 첫 실행: `"stitch"`
     - `--force-sequential` + 기존 `design`: `"design+stitch"` (순서 보존)
   - `sequential_reason` 필드 (force 플래그 사용 시)
5. **PCC-05 검증**: 와이어프레임 레이아웃이 통합에 반영되었는지 확인
6. **Human Checkpoint**: Stitch 결과 확인

## Output

- `.plans/stitch/{slug}/` 디렉토리에 통합 패키지 생성
  - `mapping.md` — REQ-ID ↔ Screen-ID 매핑
  - `context.md` — 개발 핸드오프 컨텍스트
  - `validation.md` — 통합 검증 결과
- routing-metadata.post_wireframe_path 갱신
- 다음 단계 안내: `/plan-bridge {slug}`

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/plan/commands/plan-stitch.md`
