# Rollout Plan

> 권장 하이브리드 모델을 기존 `claude-kit`에 무리 없이 도입하기 위한 단계별 이행 계획.

---

## 1. Phase 1: 문서와 계약 고정

목표:

- Codex 호환 설계의 SSOT를 문서로 고정한다.
- 새 자산 추가 시 필요한 metadata 계약을 합의한다.

실행 항목:

- `docs/codex-compatibility/` 문서 세트 추가
- `README.md`, `docs/guide/09-architecture.md`에서 overview 링크
- metadata 필드와 정책을 문서 계약으로 확정

완료 기준:

- 팀이 “새 자산이 들어오면 무엇을 같이 적어야 하는가”를 문서만 보고 알 수 있다.

---

## 2. Phase 2: sidecar metadata 도입

목표:

- 기존 자산에 sidecar metadata를 붙일 수 있는 포맷을 만든다.

실행 항목:

- 신규 자산부터 manifest 작성 의무화
- 기존 핵심 자산부터 점진적으로 manifest 추가
- hook, rule, template부터 우선 적용

완료 기준:

- 새 hook/rule/template는 metadata 없이 merge되지 않는다.

---

## 3. Phase 3: installer normalize 단계 도입

목표:

- setup.js가 manifest를 읽어 catalog를 만들 수 있게 한다.

실행 항목:

- discover 함수와 normalize 함수 분리
- legacy hardcoded 분기와 manifest 기반 분기를 병행 운영
- generated outputs를 catalog에서 계산하도록 이동

완료 기준:

- installer가 일부 자산군에서 metadata catalog를 사용하기 시작한다.

---

## 4. Phase 4: target adapter 전환

목표:

- Claude/Codex 설치를 catalog 기반 emitter로 통일한다.

실행 항목:

- Claude emitter와 Codex emitter를 catalog 입력 기반으로 재작성
- hook/rule/template 처리도 emitter 내부의 공통 계약으로 이동
- `skippedForCodex`를 compatibility report 구조로 확장

완료 기준:

- 새 자산 추가가 hardcoded 리스트 수정 없이 manifest와 emitter 규칙만으로 처리된다.

---

## 5. Phase 5: parity gate 활성화

목표:

- repo 차원에서 Codex 회귀를 자동으로 막는다.

실행 항목:

- `verify-codex-parity` 스크립트 추가
- local check와 CI check 구성
- 저장소 내부는 `strict`, 소비자 기본은 `warn`

완료 기준:

- metadata 누락, 선언 불일치, 무단 Codex target 추가가 PR 단계에서 실패한다.

---

## 6. 역호환 전략

| 항목 | 전략 |
|------|------|
| 소비자 `profile.json` | 기존 `domains`, `targets` 동작 유지 |
| 기본 정책 | `compatibility.codexPolicy`는 `warn` 기본값 |
| 기존 자산 | manifest 없는 legacy 자산은 과도기 동안 허용 가능 |
| 기존 metadata 파일 | `.claude-kit-meta.json`의 기존 필드는 유지하고 `compatibility`만 추가 |

핵심은 소비자 설치 UX를 깨지 않으면서 저장소 내부 규율만 먼저 강화하는 것이다.

---

## 7. 추천 우선순위

1. 문서 확정
2. hook/rule/template metadata
3. parity verifier
4. setup.js normalize 리팩터링
5. full catalog emitter 전환

이 순서를 따르면 가장 위험한 자산부터 빠르게 통제하면서도, 전체 설치기를 한 번에 갈아엎지 않아도 된다.
