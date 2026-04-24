<!-- kit-convert generated: 2026-04-24 -->
---
name: dev-observability
description: 구조화 로깅, 에러 추적, 메트릭 패턴 참조.
---

# Observability

구조화 로깅, 에러 추적, 메트릭 패턴.

## 구조화 로깅

```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown>;
  timestamp: string;
}
```

- JSON 포맷 필수 (파싱 가능)
- context에 requestId, tenantId 포함
- 민감 정보(비밀번호, 토큰) 로깅 금지

## 에러 처리 매핑

| 계층 | 에러 유형 | HTTP 코드 |
|------|----------|----------|
| Domain | DomainError (비즈니스 규칙 위반) | 400/409/422 |
| Application | ApplicationError (처리 실패) | 500 |
| Infrastructure | 외부 서비스 장애 | 502/503 |
| Presentation | 입력 검증 실패 | 400 |

## 메트릭

- API 응답 시간 (p50, p95, p99)
- DB 쿼리 시간
- 에러율 (도메인별)

## 컨텍스트 전파

```
Request → Middleware (requestId 생성)
  → Server Action (requestId + tenantId)
    → Application (로깅에 포함)
      → Infrastructure (DB 쿼리 로깅)
```

- 모든 레이어에서 동일한 requestId 사용
- 비동기 작업 시에도 컨텍스트 유지

## 참조

- 에러 처리: `.claude/skills/layered-architecture/SKILL.md` (에러 처리 섹션)
- 테넌트 격리: `.claude/skills/tenant-isolation/SKILL.md` (Tier 3)

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-observability/SKILL.md`
