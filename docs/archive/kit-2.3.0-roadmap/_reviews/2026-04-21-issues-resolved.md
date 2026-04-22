---
제목: Review Issues Resolution — 2026-04-21
작성일: 2026-04-21
리뷰어: Claude (메인테이너 역할)
선행 리뷰: [2026-04-21-maintainer-technical-review.md](2026-04-21-maintainer-technical-review.md)
상태: reviewed
---

# Review Issues Resolution

> **결론**: 선행 리뷰에서 발견된 MEDIUM 3건 + LOW 2건 전체 반영 완료. 신규 파일 4건 추가, 기존 파일 5건 보정. **19 파일 상태 승격 준비 완료** (사용자 최종 승인 대기).

---

## 1. 해소 요약

| 리뷰 이슈 | 원 제목 | 해소 방법 | 상태 |
|-----------|---------|----------|:---:|
| **MEDIUM §3.2.1** | 007/016/017 상세 스펙 부재 | 미니 스펙 3건 신규 집필 | ✅ 완료 |
| **MEDIUM §3.2.2** | 상세 스펙 선행 의존 SHA 링크 없음 | 01-delta §4.4 P0 완료 커밋 교차 참조 표 신설 | ✅ 완료 |
| **MEDIUM §3.2.3** | 절대경로 링크 2건 | 07-boundary + README 해당 링크 제거·대체 | ✅ 완료 |
| **LOW §3.3.1** | CHANGELOG 앵커 작동 여부 | 구현 단계에서 실제 렌더링 확인으로 이월 | ⏳ 이월 |
| **LOW §3.3.2** | 06 frontmatter 변형 | 의도적 유지 — 자동화 스크립트 `상태: draft*` 정규식 허용 권고 | ✅ 유지 |

---

## 2. MEDIUM §3.2.1 — 미니 스펙 3건 집필

### 2.1 추가된 파일

| 파일 | 라인 수 | 주요 내용 |
|------|:-----:|----------|
| [03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md](../03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md) | ~125 | Stop 훅 matcher + `autoReview` 설정 |
| [03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md](../03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md) | ~115 | `--auto-proceed-on-pass` 플래그 + Critical 화이트리스트 |
| [03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md](../03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md) | ~125 | golden-principles #13 + 에이전트 공통 Constraint + 감지 가드 |

### 2.2 템플릿 준수

8섹션 공통 템플릿(§1 문제 정의 · §2 해결안 · §3 TDD · §4 영향 파일 · §5 검증 · §6 롤백 · §7 연관 백로그 · §8 변경 이력) 준수. 축약본이라 각 섹션이 짧지만 구조는 동일.

### 2.3 영향 파일 갱신

- [02-p1-execution-plan §2 RICE 재정렬표](../02-p1-execution-plan.md#2-rice-재정렬표-ssot): 007/016/017 행의 "원본 백로그" 링크 → 미니 스펙 링크로 대체 (`(mini)` 표기)
- [02-p1-execution-plan §2 주석](../02-p1-execution-plan.md#2-rice-재정렬표-ssot): "별도 상세 스펙을 신규 집필하지 않는다" → "미니 스펙 신규 집필" 문구 갱신
- [README §1 문서 맵](../README.md#1-문서-맵): 스펙 목록 8건 → 11건 + `(mini spec)` 표기, `_reviews/` 디렉터리 추가

---

## 3. MEDIUM §3.2.2 — P0 완료 커밋 SHA 교차 참조

### 3.1 해소 방식

상세 스펙 8건의 frontmatter `선행 의존` 필드에 커밋 SHA 링크를 개별 주입하는 대신, **단일 참조 표를 [01-delta §4.4](../01-delta-from-2.2.0.md#44-p0-완료-커밋-교차-참조)에 신설**. 스펙들은 기존 `선행 의존: IMP-KIT-XXX (2.2.0 완료)` 형태 유지하고, 독자가 필요 시 01-delta §4.4를 조회.

### 3.2 표 구성

P0 6건(IMP-KIT-001~006) 각각에 대해:
- 제목
- 주요 커밋 SHA 링크 (GitHub 커밋 URL)
- 2.3.0 후속 항목 (어느 P1이 이를 선행 의존)

### 3.3 장점

- 19 파일 frontmatter 대량 수정 회피
- SSOT 단일화 (커밋 SHA가 변경될 일 없지만, 유지보수 시 한 곳만 확인)
- 스펙 frontmatter의 YAML 파싱 복잡도 증가 회피

---

## 4. MEDIUM §3.2.3 — 절대경로 링크 제거

### 4.1 수정 위치

| 파일 | 변경 전 | 변경 후 |
|------|---------|---------|
| [07-boundary-and-contradictions.md §3.2](../07-boundary-and-contradictions.md#32-용어-정정) | `[stateless-squishing-quiche.md Out of Scope](../../../C:/Users/user/.claude/plans/...)` | `(본 패키지 Out of Scope 원칙)` 평문 |
| [README.md §7](../README.md#7-세션별-집필-이력) | `[stateless-squishing-quiche.md Session Split](../../../../Users/user/.claude/plans/...)` | `(Claude Code plan mode 내부 계획에 따름)` 평문 + Resolution 세션 행 추가 |

### 4.2 효과

- 다른 기여자·리뷰어가 링크 클릭 시 404 이슈 해소
- 개인 plan 파일 참조 제거로 외부 가독성 확보
- README §7 표에 `Resolution` 행 추가로 집필 이력 완전성 확보

---

## 5. LOW §3.3.1 — CHANGELOG 앵커

### 5.1 이월 사유

[01-delta §1](../01-delta-from-2.2.0.md#1-220-성과-요약-링크만)의 `#220---2026-04-20`, `#221---2026-04-20` 앵커는 **GitHub Markdown 렌더링 규칙**(소문자화, 특수문자 제거, 공백·하이픈 정규화)에 따라 작동할 가능성이 높음. 현재 시점에서 실제 렌더링 환경에서 작동 여부를 검증할 수 없어 **구현 단계(Phase 2.1 착수 전 리뷰 재수행)에서 확인**으로 이월.

### 5.2 대안 (작동 안 할 경우)

- 앵커 제거하고 섹션 텍스트로 대체 (예: "CHANGELOG의 `## [2.2.0]` 섹션 참조")
- 또는 CHANGELOG.md 섹션에 명시적 HTML 앵커 추가 (`<a id="220"></a>`)

---

## 6. LOW §3.3.2 — 06 frontmatter 변형

### 6.1 유지 결정

[06-release-notes-2.3.0-skeleton.md](../06-release-notes-2.3.0-skeleton.md)의 `상태: draft (implementation 전 스켈레톤)`은 의도된 변형으로 **유지**. 이 문서는 구현 완료 후 "정식 릴리스 노트"로 승격되는 **템플릿** 성격이므로 단순 `draft`가 아닌 한정자 표기가 적절.

### 6.2 자동화 권고

향후 상태 자동 검증 스크립트 작성 시 정규식을 `^상태: draft( .*)?$` 형태로 허용.

---

## 7. 전체 변경 파일 목록

### 7.1 신규 4건

- `03-p1-detailed-specs/IMP-KIT-007-plan-review-auto-trigger.md`
- `03-p1-detailed-specs/IMP-KIT-016-checkpoint-auto-proceed.md`
- `03-p1-detailed-specs/IMP-KIT-017-no-duplication-skill.md`
- `_reviews/2026-04-21-issues-resolved.md` (본 문서)

### 7.2 수정 4건

- `01-delta-from-2.2.0.md` (§4.4 신설)
- `02-p1-execution-plan.md` (§2 테이블 + 주석 수정)
- `07-boundary-and-contradictions.md` (§3.2 절대경로 제거)
- `README.md` (§1 문서 맵 + §7 세션 이력 보정)

### 7.3 유지

- 선행 리뷰 문서 `2026-04-21-maintainer-technical-review.md` (history)
- 그 외 상세 스펙 8건 (008~015) — frontmatter 유지, 링크 주입 불필요

---

## 8. 최종 상태

### 8.1 패키지 구성

**19 파일**:
- 최상위 9 (README + 00~08)
- 상세 스펙 11 (IMP-KIT-007~017, 단 미니 3건 포함)
- 리뷰 기록 2 (`_reviews/` 내)

### 8.2 상태 승격 권고

모든 MEDIUM/LOW 이슈 해소 또는 명시적 이월. **19 파일 `draft → reviewed` 승격 가능**.

승격은 이해관계자 최종 승인(D1/D2/D3) 후 일괄 실행 권고. 이 단계는 본 리뷰 범위 외 — 사용자 결정 대기.

### 8.3 다음 단계

- [x] 1단계 리뷰 & 승인 (진행 중)
- [ ] 이해관계자 D1/D2/D3 승인
- [ ] 19 파일 상태 일괄 승격 (`draft → reviewed`)
- [ ] 2단계 인프라 준비 착수 ([08-next-steps §2](../08-next-steps-execution-plan.md#2단계--인프라-준비-12주))

---

## 9. 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 이슈 해소 기록 신규 작성 (MEDIUM 3건 + LOW 2건 반영) | Claude (메인테이너 역할) |
