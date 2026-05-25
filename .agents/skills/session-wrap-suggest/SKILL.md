---
name: session-wrap-suggest
description: |
  활발한 작업 후 세션 마무리 시점에 /session-wrap 실행을 사용자에게 제안하는 스킬.
  src/Codex/core/hooks/session-wrap-suggest.js (Stop hook)의 fallback artifact로,
  Codex/Codex 양쪽에서 hook runtime parity 없이 동일 의도를 보존한다.
  트리거: 세션 종료 시점, 도구 호출 누적이 임계값(기본 30회) 이상, 또는 명시적 호출.
argument-hint: '[--threshold N] [--force] [--dry-run]'
---

# /session-wrap-suggest 스킬

## 배경

이 스킬은 `src/Codex/core/hooks/session-wrap-suggest.js` (Stop hook, EX-001 paired-fallback)의 의미 보존 artifact다.

**원본 Hook의 한계**:
- Codex `~/.Codex/.session-stats.json` 상태 파일 의존
- 시스템 tmpdir 마커 파일로 중복 제안 방지
- Codex runtime에서 1:1 재현 불가 (Stop event는 공식 지원이지만 위 두 상태 의존성은 재현 불가)

**이 스킬의 책임**:
- Hook의 핵심 의도(threshold-기반 1회 제안)를 runtime-independent하게 보존
- Codex/Codex 양쪽 환경에서 동일하게 invokable
- 호출 시점은 host runtime이 결정 (Codex는 Stop hook + 이 스킬 호출, Codex는 별도 trigger 또는 명시적 invocation)

## 의도

세션에서 **상당한 작업**(기본 임계값: 도구 호출 30회 이상)이 진행되었을 때, 사용자에게 `/session-wrap`을 실행해 다음을 자동 정리하도록 제안:

- 문서 업데이트 누락
- 반복 패턴 → 자동화 후보
- 배운 점 → instinct 후보
- 후속 작업 → next-task 후보

## 트리거 조건

세션 진행 상황에 따라 다음 중 하나가 충족되면 제안:

1. **도구 호출 누적**: 세션 동안 도구 호출 ≥ 30회 (configurable via `--threshold`)
2. **세션 종료 신호**: host runtime이 세션 종료를 알릴 때 (Codex Stop hook, Codex equivalent)
3. **명시적 호출**: 사용자가 `/session-wrap-suggest` 직접 입력

세션당 1회만 제안 (중복 방지).

## 파이프라인

```
입력: /session-wrap-suggest [--threshold N] [--force] [--dry-run]

[Phase 0] 컨텍스트 수집
  ├─ 세션 도구 호출 수 (host runtime metadata 우선)
  ├─ 세션 시작 시각 + 경과 시간
  └─ 이미 제안된 적 있는지 (per-session 중복 체크)

[Phase 1] 임계값 판정
  ├─ 호출 수 >= threshold (default 30)
  ├─ 또는 --force 플래그
  └─ 그 외에는 즉시 종료 (no-op)

[Phase 2] 제안 출력
  └─ 사용자에게 /session-wrap 실행을 제안하는 systemMessage 출력

[Phase 3] 중복 방지 마커 (선택)
  └─ host runtime이 per-session 상태 저장 가능하면 마커 기록
     (Codex: tmpdir 마커, Codex: 세션 메타데이터, 둘 다 없으면 생략)
```

## 출력 형식

```
[Session Wrap] 이번 세션에서 상당한 작업이 진행되었습니다 (도구 호출 N회).
세션 마무리 시 /session-wrap을 실행하면 문서 업데이트, 학습 포인트, 후속 작업을 자동으로 정리할 수 있습니다.
```

`--dry-run`인 경우 출력 대신 표시할 메시지만 echo.

## Runtime별 호출 패턴

| Runtime | 호출 방식 | 상태 추적 |
|---------|----------|-----------|
| Codex | `src/Codex/core/hooks/session-wrap-suggest.js` (Stop hook)이 이 스킬을 호출하거나, 사용자가 직접 호출 | `~/.Codex/.session-stats.json` + tmpdir 마커 |
| Codex | host runtime의 세션 종료 trigger 또는 명시적 호출 (Stop hook은 공식 지원이나 상태 파일 형식이 다름) | host runtime이 제공하는 세션 metadata |

**중요**: 이 스킬은 *어떻게* invocation되는지에 의존하지 않는다. 임계값 판정과 제안 출력만 책임.

## 관련 파일

- 원본 Hook: `src/Codex/core/hooks/session-wrap-suggest.js` (Codex 전용 Stop hook, 이 스킬 invoke의 한 경로)
- 실행 대상 스킬: `src/Codex/core/skills/session-wrap/SKILL.md` (실제 세션 정리 파이프라인)
- 예외 등록: `src/exception-registry.json` EX-001 (paired-fallback / fallbackTarget=skill)

## 비범위

- 세션 자체 정리는 하지 않음 (그건 `/session-wrap`이 담당)
- runtime별 hook 통합은 별도 작업 (이 스킬은 runtime-independent invocation만 보장)
- 임계값 고정값 변경은 host runtime 설정 또는 `--threshold` 인자로
