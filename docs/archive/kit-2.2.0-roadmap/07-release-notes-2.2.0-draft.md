---
제목: Release Notes — claude-kit 2.2.0
작성일: 2026-04-20
대상: claude-kit 2.2.0 사용자
상태: release-ready (회귀 검증 V2/V3 PASS 대기)
구현 상태: P0 6건 모두 구현 완료 (10커밋, 466665d ~ 742b176)
---

# 07 Release Notes — claude-kit 2.2.0

> **claude-kit 2.2.0 — 에이전트 권한 및 프레임워크 안정화**
>
> dash-preview-phase3 세션 회고에서 도출된 **핵심 블로커 6건**을 해결한다. Phase C 재위임, 프레임워크 silent drift, Read 캐시 에러, Hybrid 수동 지시를 **0으로 만드는 것**이 목표다. 모든 P0 구현은 독립 리뷰(dev-code-reviewer)를 거쳐 **총 62건의 리뷰 이슈를 전수 반영**한 후속 보강 커밋으로 최종 확정했다.

---

## 주요 변경 (6건)

### 1. dev-architect Phase별 에이전트 자동 체이닝 (IMP-KIT-001)

**커밋**: `01790d4` + `537e55f` (초안 + 후속 보강 13건)

`/dev-feature` Phase C에서 편집 필요 시 **dev-doc-updater로 자동 체이닝**. 기존 수동 재위임 불필요. architect의 read-only 원칙은 유지 — **B안 역할 분리** 채택.

- **JSON Schema**: `edit-coordinates.schema.json` v1 신설 (`$id`에 v1 suffix 포함). action별 conditional required(create/replace/insert/delete)로 런타임 검증 강화.
- **영향**: 분석(architect) ↔ 편집(doc-updater) 계약 표준화
- **위험도 정책**: `risk: "high"` 항목은 **사용자 확인 없이 실행 금지** (schema/architect/doc-updater SSOT 통일)
- **Phase A→C 연결 무결성**: architect가 JSON 미출력 시 메인이 1회 재요청 → 사용자 알림 3단계 절차

### 2. plan-idea-screener 프레임워크 파라미터화 (IMP-KIT-002)

**커밋**: `26962cc` + `37dbddf` (초안 + 후속 보강 7건)

`/plan-screen --framework rice|5axis` 플래그 도입. 기본값은 프로젝트 CLAUDE.md 또는 `rice` 폴백.

- **Silent drift 방지**: 출력 첫 줄에 `> 프레임워크: RICE (출처: ...)` 명시 강제. 에이전트 description과 Output_Format 프레임워크별 분리.
- **임계값**: RICE (Go ≥ 10.0 / Hold 2.0~10.0 / Kill < 2.0), 5axis (Go 70+ / Hold 40-69 / Kill < 40)
- **JSON Schema**: `rice.schema.json`, `5axis.schema.json` 각각 분리
- **Rescore 정책**: `--rescore` + framework 변경 시 기존 파일을 `.prev-{framework}.md`로 rename하여 이력 보존
- **후방 호환**: 기존 미설정 프로젝트는 `rice` 기본값 사용

### 3. plan-draft-writer 신규 에이전트 (IMP-KIT-003)

**커밋**: `adc84b7` + `0e9d52f` (초안 + 후속 보강 11건)

`/plan-draft`의 1차 기획 작성을 전용 에이전트가 수행. **Lite/Standard + 시나리오(A/B/C) + Feature 유형(copy/dev) 3중 판정** 자동화.

- **영향**: Skill-only 수동화 해소. 3중 판정이 명시적 근거 기반으로 수행됨.
- **파일 구조 통일**: Lite/Standard 관계없이 `.plans/features/active/{slug}/{slug}.md` + `00-context/` 폴더 구조 사용 (이전 경로 자기모순 해소)
- **Hybrid 감지**: 결정론적 시그널(`reference-needed: true`, `hybrid-candidate: true`) + 휴리스틱 키워드. 휴리스틱 시 사용자 확인 요청.
- **재실행 정책**: `.prev-{timestamp}.md` 백업 + `<!-- manual edit -->` 마커 보존
- **오버라이드 기록**: routing-metadata에 `override: {field, from, to, reason}` 필드로 감사 추적

### 4. plan-bridge-writer 신규 에이전트 (IMP-KIT-004)

**커밋**: `68be186` + `e7e7742` (초안 + 후속 보강 10건)

`/plan-bridge`의 브리지 문서 4종 생성을 전용 에이전트가 수행. **copy-reference-baseline과 병렬 실행 보증** (디렉토리 배타: `00-context/` vs `evidence/`).

- **대상 범위**: **Standard Feature 전용** (Lite는 bridge 생략, `/plan-draft` 직후 dev 파이프라인으로 직행)
- **구조 게이트**: SSOT frontmatter `status: approved` 확인. 미승인 시 `/dev-architecture` 선행 안내.
- **재실행 정책**: 4개 브리지 문서 각각 (동일 내용 no-op / `.prev-{timestamp}.md` 백업 / `<!-- manual edit -->` 섹션 보존)
- **쌍방 배타 보증**: copy-reference-baseline에도 `00-context/` 접근 금지 규약 추가

### 5. Read 캐시 자동 재시도 훅 (IMP-KIT-005)

**커밋**: `84a11b2` + `785ef24` (초안 + 후속 보강 11건)

에이전트가 수정한 파일을 메인 세션이 Edit 시도 시 발생하던 **"File has not been read yet" 에러**에 대한 자동 경고 시스템.

- **SubagentStop 훅**: `scripts/setup.js`의 `buildHooksConfig()`에 등록. write-capable 에이전트 완료 시 systemMessage로 "Edit 전 Read 재호출 권장" 경고.
- **에이전트 분류표**: 실제 `tools:` 필드 기반 (Set 기반 exact equality 매칭)
  - Read-only 8종: dev-architect, dev-code-reviewer, plan-reviewer, copy-fidelity, copy-interaction-fidelity, copy-qa-reviewer, Explore, Plan
  - Write-capable 11종 포함: dev-security-reviewer, dev-database-reviewer, dev-verify-agent 등 (기존 오분류 정정)
- **Dedup**: tmpdir 마커로 세션당 에이전트별 1회 dedup
- **Codex fallback**: `src/claude/core/skills/agent-completion-cache-invalidate/SKILL.md` (runtime-independent)
- **Rules 강화**: verification.md + interaction.md + AGENTS.md.template mirror 업데이트

### 6. Hybrid (reference-only) 모드 공식 정의 (IMP-KIT-006)

**커밋**: `de2234e` + `742b176` (초안 + 후속 보강 10건)

dev Feature + 레퍼런스 캡처 필요 시나리오를 **Hybrid 모드**로 정식화.

- **진입 경로 2가지**: 자동 감지(routing-metadata `hybrid: true`) 또는 명시적 플래그(`--reference-only`)
- **`--full` 역플래그**: 자동 감지 override 제공
- **Manifest Schema 확장**: `copy-evidence.md` SSOT에 최상위 `mode` 필드 추가 (`"full"` | `"reference-only"`, 미기재 시 backward compat로 `"full"`)
- **갭 분석 차단**: `/copy-visual-review`, `/copy-interaction-review`, `/copy-gap-board` Preconditions에 `mode: "full"` 필수 게이트 추가 → Hybrid 모드 진입 거부
- **IMP-KIT-003/004 연계**: plan-draft-writer 자동 감지 → plan-bridge-writer가 `/copy-reference-refresh --reference-only` 병행 안내
- **Codex 대응**: copy-reference-refresh.md에 "Hybrid Feature 처리 (요약)" 섹션 추가 (Codex copy/rules/ 폴더 부재 대응)

---

## 마이그레이션 영향

### 후방 호환 (변경 없음)

- 기존 `/plan-screen` 호출 → 기본값 프레임워크로 폴백
- 기존 `/plan-draft` 호출 스크립트 → 커맨드 서명 유지
- 기존 `/plan-bridge` 호출 스크립트 → 커맨드 서명 유지
- 기존 `/dev-feature` Phase A 호출 → 기존 출력 형태 유지
- 기존 `/copy-reference-refresh` 호출 → `--reference-only` 미지정 시 기존 동작

### 신규 권장 사용법

- `/plan-screen {IDEA-ID} --framework rice` 명시 권장
- `/copy-reference-refresh --reference-only` 플래그를 Hybrid 세션에서 사용
- CLAUDE.md에 "plan 도메인 기본 설정" 섹션 추가 (프레임워크 기본값 지정)

### 주의 사항

- dev-architect의 read-only 성격은 **유지**. Edit 권한 부여 아님 (B안 체이닝 선택)
- `/dev-feature` Phase C 체이닝 자동 적용 — 기존 수동 위임 스크립트가 있으면 **제거 권장** (중복 동작 방지)

---

## 신규 에이전트/커맨드/훅

### 에이전트

- `plan-draft-writer`
- `plan-bridge-writer`

### 훅

- `agent-completion-cache-invalidate` (core)

### 플래그/파라미터

- `/plan-screen --framework rice|5axis`
- `/copy-reference-refresh --reference-only`

### 스키마

- `edit-coordinates.schema.json` (dev)
- `rice.schema.json` / `5axis.schema.json` (plan)

---

## 검증 시나리오

### 필수 통과 조건

`dash-preview-phase3` 복제 회귀 테스트 1회 이상 PASS:

| 지표 | 요구 값 |
|------|:-:|
| Phase C 재위임 | **0회** |
| 프레임워크 drift | **0건** |
| Read 캐시 에러 | **< 1%** |
| Hybrid 수동 지시 | **0회** |
| 수동 Edit 건수 | **< 15** |
| Human Checkpoint 수 | **< 5** |

상세 검증 전략: [06-verification-strategy.md](06-verification-strategy.md)
실행 시나리오 체크리스트: [08-regression-scenario.md](08-regression-scenario.md) (2026-04-20 신설)

### 테스트 인프라 관련 안내

**TDD 단위 테스트는 본 릴리스에 포함되지 않음**. 각 IMP-KIT 스펙의 `tests/**/*.test.ts` 파일은 참고 명세로 작성되어 있으나, 리포지토리에 Vitest/Jest 등 테스트 러너가 구성되지 않아 실행 불가. 본 릴리스의 검증은 **dash-preview-phase3 복제 회귀 시나리오**(문서화된 체크리스트 기반 수동 실행)가 유일한 수단. 자동화된 단위 테스트는 2.3.0+에서 테스트 인프라 도입 후 추가 예정.

---

## 제외 (2.3.0으로 이월)

본 릴리스에서 제외되고 2.3.0에서 처리되는 항목:

- `/plan-review` 자동 후속 트리거 (IMP-KIT-007)
- Checkpoint 자동 진행 플래그 (IMP-KIT-016)
- 재복제 금지 Skill 강제 (IMP-KIT-017)
- screener 메모리/권한 보완 (IMP-KIT-008, 009)
- wireframe 체크리스트 확장 (IMP-KIT-010)
- architect/doc-updater 스키마 확장 (IMP-KIT-011 추가 작업)
- bridge ↔ Phase A 경계 (IMP-KIT-012)
- Dev 착수 Gate 조기 플래그 (IMP-KIT-013)
- stage-manifest 스키마 버전 관리 (IMP-KIT-014)
- TASK ID 네이밍 표준 (IMP-KIT-015)

---

## 별도 이니셔티브 (본 릴리스 외)

**파이프라인 피드백 자동 아카이빙 시스템** (Codex/Claude 환경 구분 포함)은 본 릴리스에 포함되지 않는다. Phase 2 설계 문서 패키지(`docs/plan/kit-feedback-archiving/`)에서 독립적으로 진행 예정. 관련 항목 IMP-KIT-007은 Phase 2 설계와 통합 구현된다.

---

## 알려진 이슈 / Follow-up 이관

다음 항목들은 본 릴리스에 포함되지 않고 별도 follow-up 대상으로 이관:

1. **리포지토리 테스트 인프라 부재** (IMP-KIT-003/004/005/006 공통 follow-up)
   - 증상: 각 IMP-KIT 스펙의 `tests/**/*.test.ts` 파일이 작성되지 않음
   - 원인: Vitest/Jest 등 테스트 러너 미구성
   - 해결 예정: 2.3.0+ 별도 이니셔티브 (claude-kit 테스트 인프라 도입)

2. **파이프라인 피드백 자동 아카이빙 시스템** (Phase 2 문서 패키지 대기)
   - 위치: `docs/plan/kit-feedback-archiving/` (설계 완료, 구현 대기)
   - IMP-KIT-007 (`/plan-review` 자동 트리거)과 Phase 3에서 통합 구현 예정

3. **IMP-KIT-004 "13파일" vs "4파일" 스펙 내부 모순**
   - 원인: 스펙 §1/§2.3/§5.2와 §3.1/§5.1 간 파일 수 불일치
   - 해결 예정: 별도 PR로 스펙 보정

4. **에이전트 호출 텔레메트리** (IMP-KIT-024, 2.4.0+ 목표)
   - 본 릴리스에서 지표 9(에이전트 호출 텔레메트리 커버리지)는 추세 관찰용. 실측 자동화는 피드백 아카이빙 시스템 구현 후.

---

## 기여자

본 릴리스는 **dash-preview-phase3 세션 회고** 산출물 기반. 회고 문서 작성: AI 에이전트 (2026-04-17). 본 로드맵 작성 및 P0 구현: claude-kit roadmap author (2026-04-20).

**독립 리뷰어**: dev-code-reviewer 서브에이전트 (6회 리뷰 수행, 총 62건 리뷰 이슈 발견 → 전수 반영 완료)

---

## 링크

- [Executive Summary](00-executive-summary.md)
- [Roadmap 2.2.0 → 2.4.0+](02-roadmap-2.2.0-to-2.4.0.md)
- [P0 상세 스펙](03-p0-detailed-specs/)
- [Verification Strategy](06-verification-strategy.md)
- [Regression Scenario](08-regression-scenario.md) (V1~V4 실행 가이드)
- 원본 회고: `C:/Program Files (user)/mologado/.claude/docs/kit-improvements/20260417-dash-preview-phase3-retrospective/`

## 2.2.0 커밋 체인

```
742b176  fix(copy): IMP-KIT-006 후속 보강 - 리뷰 이슈 10건 해결
de2234e  feat(copy): IMP-KIT-006 Hybrid (reference-only) 모드 공식 정의
e7e7742  fix(plan):  IMP-KIT-004 후속 보강 - 리뷰 이슈 10건 해결
68be186  feat(plan): IMP-KIT-004 plan-bridge-writer 에이전트 신설
0e9d52f  fix(plan):  IMP-KIT-003 후속 보강 - 리뷰 이슈 11건 해결
adc84b7  feat(plan): IMP-KIT-003 plan-draft-writer 에이전트 신설
17cbf11  docs(plan): kit-feedback-archiving 문서 패키지 초안
466665d  docs(plan): kit-2.2.0-roadmap 문서 패키지 초안
537e55f  fix(dev):   IMP-KIT-001 후속 보강 - 리뷰 이슈 13건 해결
01790d4  feat(dev):  IMP-KIT-001 dev-architect Phase별 체이닝
785ef24  fix(core):  IMP-KIT-005 후속 보강 - 리뷰 이슈 11건 해결
84a11b2  feat(core): IMP-KIT-005 Read 캐시 재인증 가이드
37dbddf  fix(plan):  IMP-KIT-002 후속 보강 - 리뷰 이슈 7건 해결
26962cc  feat(plan): IMP-KIT-002 screener 프레임워크 파라미터화
```

**총 14커밋** (P0 6건 × 2 초안/보강 + 문서 패키지 2 = 14).

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-20 | 초안 작성 | claude-kit roadmap author |
| 2026-04-20 | 확정본 갱신 (Phase 1.3 V4) — 실제 커밋 SHA 반영, 테스트 인프라 안내 추가, Follow-up 이관 섹션 신설, 회귀 시나리오 링크 추가 | claude-kit roadmap author |
