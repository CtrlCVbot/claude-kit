# /plan-improve

아카이브된 기능에 대한 개선요청을 등록하고 분석한다.
ARCHIVE 번들을 로드하여 전체 컨텍스트를 파악하고, 변경 규모에 따라 파이프라인 재진입 지점을 추천한다.

`plan-archive-workflow` 스킬의 "개선요청 연계" 섹션을 참조한다.

## Usage

```bash
/plan-improve {slug} "개선 제목"                  # 개선요청 등록
/plan-improve {slug} list                          # 해당 기능의 개선요청 목록
/plan-improve {slug} analyze IMP-{KEY}-{NNN}       # 특정 개선요청 영향도 분석
/plan-improve {slug} execute IMP-{KEY}-{NNN}       # 승인된 개선요청 실행 (재진입)
```

## Workflow

### 개선요청 등록 (`/plan-improve {slug} "제목"`)

1. **아카이브 로드**: `.plans/archive/{slug}/ARCHIVE-{KEY}.md` 읽기 → 전체 기능 컨텍스트 확보
2. **대화형 입력**: 사용자에게 다음 항목 질문
   - 카테고리: `enhancement` | `bugfix` | `performance` | `ux` | `accessibility`
   - 우선순위: `P0` (긴급) | `P1` (높음) | `P2` (보통)
   - 상세 설명: 왜 필요한지, 어떤 변경을 원하는지
3. **IMP 문서 생성**: `.plans/archive/{slug}/improvements/IMP-{KEY}-{NNN}.md` 작성
   - IMP 템플릿은 `plan-archive-workflow` 스킬 참조
4. **영향도 자동 분석**: 아카이브 섹션별 영향 여부 판단
5. **재진입 지점 추천**: 변경 규모에 따른 파이프라인 재진입 지점 제안
6. **결과 표시**: IMP 문서 경로 + 추천 재진입 경로

### 영향도 분석 (`/plan-improve {slug} analyze IMP-{KEY}-{NNN}`)

1. **ARCHIVE 번들 로드**: 전체 컨텍스트
2. **IMP 문서 로드**: 개선요청 내용
3. **영향도 매트릭스 생성**:

| 영역 | 영향도 | 설명 |
|------|--------|------|
| UI/레이아웃 | high/medium/low/none | 화면 구조 변경 여부 |
| 데이터/상태 | high/medium/low/none | 데이터 모델 변경 여부 |
| API/통신 | high/medium/low/none | API 엔드포인트 변경 여부 |
| 퍼포먼스 | high/medium/low/none | 성능 관련 변경 여부 |
| 접근성 | high/medium/low/none | 접근성 관련 변경 여부 |

4. **재진입 규칙 적용**:

| 변경 유형 | 재진입 지점 | 거치는 단계 |
|-----------|------------|-------------|
| 카피/텍스트만 변경 | Dev only | Dev |
| 스타일/레이아웃 미세 조정 | P7 Bridge 업데이트 | P7 → Dev |
| 새 UI 섹션/컴포넌트 추가 | P5 Wireframe 수정 | P5 → P7 → Dev |
| 기능 스코프 확장 | P3 Draft 수정 | P3 → P5 → P7 → Dev |
| 근본적 재설계 | P1 새 Idea | 전체 파이프라인 (새 IDEA로 등록) |

5. **분석 결과 표시**: 영향도 매트릭스 + 추천 재진입 경로 + 예상 작업량

### 개선요청 실행 (`/plan-improve {slug} execute IMP-{KEY}-{NNN}`)

1. **IMP 상태 확인**: `approved` 상태인지 검증 (사용자 승인 필요)
2. **재진입 분기**:
   - **경량 변경 (Dev only)**: IMP 문서를 컨텍스트로 `/dev-feature` 실행
   - **재기획 필요**: 해당 파이프라인 단계 커맨드로 안내
     - P3 재진입 → `/plan-draft` (아카이브 컨텍스트 포함)
     - P5 재진입 → `/plan-wireframe` (아카이브 컨텍스트 포함)
     - P7 재진입 → `/plan-bridge` (아카이브 컨텍스트 포함)
   - **새 Idea**: `/plan-idea`로 안내 (원본 아카이브 참조 링크 포함)
3. **IMP 상태 업데이트**: `in-progress` → 완료 시 `done` + 커밋/PR 참조
4. **ARCHIVE 개선이력 업데이트**: 번들의 "개선 이력" 섹션에 기록 추가

### IMP 상태 머신

```
draft ──→ analyzing ──→ approved ──→ in-progress ──→ done
  │                        │
  │                        └──→ rejected
  └──→ (삭제)
```

| 상태 | 설명 | 전환 조건 |
|------|------|----------|
| `draft` | 초안 작성됨 | `/plan-improve {slug} "제목"` 실행 시 |
| `analyzing` | 영향도 분석 중 | `/plan-improve analyze` 실행 시 |
| `approved` | 사용자 승인 완료 | 사용자가 분석 결과 확인 후 승인 |
| `in-progress` | 개선 작업 진행 중 | `/plan-improve execute` 실행 시 |
| `done` | 완료 | 코드 변경 + 검증 완료 시 |
| `rejected` | 반려 | 사용자가 분석 결과 확인 후 반려 |

## Output

- **IMP 문서**: `.plans/archive/{slug}/improvements/IMP-{KEY}-{NNN}.md`
- **영향도 분석**: 매트릭스 + 재진입 추천
- **다음 단계**: 재진입 지점에 해당하는 파이프라인 커맨드 안내
