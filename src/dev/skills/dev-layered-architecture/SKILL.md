---
name: dev-layered-architecture
description: Hexagonal Architecture 레이어 규칙. 의존성 방향, Feature 격리, 에러 처리 구조 참조.
---

# Layered Architecture

Hexagonal + Clean Architecture. 레이어별 책임을 엄격히 분리한다.

## 레이어 구조

| 레이어 | 위치 | 책임 | 의존 가능 |
|--------|------|------|-----------|
| Domain | `packages/core/**/domain/` | 비즈니스 로직, Entity, VO | 없음 (순수 TS) |
| Application | `packages/core/**/application/` | 오케스트레이션, CQRS | Domain, Ports |
| Ports | `packages/core/**/ports/` | 인터페이스만 (구현 없음) | Domain |
| Infrastructure | `packages/db/`, `apps/**/infrastructure/` | Port 구현체, ORM | Domain, Application(DTO) |
| Presentation | `apps/**/presentation/` | Server Action, Components | Application(Commands/Queries) |

## 의존성 방향 (역전 금지)

```
Presentation -> Application -> Domain <- Ports <- Infrastructure
```

Domain은 어떤 외부 라이브러리에도 의존하지 않는다 (zod 제외).
Application은 순수 TypeScript (zod, drizzle, next.js 금지).

## 에러 처리

- Domain 에러: `packages/core/**/domain/errors/`에 정의
- Application: Domain 에러를 catch하여 적절한 Result 반환
- Presentation: Result를 HTTP 응답으로 변환

## 앱 내부 구조

```
app/ (Route Groups)
 └── page.tsx → features/ → packages/      (단방향)
                          → components/     (단방향)
                          → hooks/          (단방향)
                          → lib/            (단방향)
features/ → features/                       (금지!)
```

### Route Groups

```
app/
├── (main)/     ← 메인 앱 (인증 필요, Sidebar+Header)
├── (auth)/     ← 인증 (별도 레이아웃)
└── layout.tsx  ← 루트 Provider (ThemeProvider, NuqsAdapter)
```

### 상태 관리 범위

| 범위 | 도구 | 위치 |
|------|------|------|
| 전역 | Jotai | hooks/ |
| Feature 로컬 | Context | features/{name}/hooks/ |
| URL | nuqs | page.tsx |
| 서버 데이터 | SWR / Server Component | features/{name}/infrastructure/ |
| 폼 | react-hook-form + Zod | features/{name}/presentation/ |

## 참조

- 도메인 모델: `.claude/skills/domain-modeling/SKILL.md`
- 프론트엔드 패턴: `.claude/skills/frontend-patterns/SKILL.md`
- 테넌트 격리: `.claude/skills/tenant-isolation/SKILL.md` (Tier 3)

---

## Stack Alternatives

> 위 레이어 구조는 TypeScript/Next.js 기본 스택 기준. `stack.language`에 따라 디렉토리 경로가 달라진다.

### 레이어별 디렉토리 대응표

| 레이어 | typescript (기본) | java | python |
|--------|-------------------|------|--------|
| Domain | `packages/core/**/domain/` | `core/src/main/java/{pkg}/domain/` | `core/src/{proj}_core/{domain}/domain/` |
| Application | `packages/core/**/application/` | `core/src/main/java/{pkg}/application/` | `core/src/{proj}_core/{domain}/application/` |
| Ports | `packages/core/**/ports/` | `core/src/main/java/{pkg}/ports/` | `core/src/{proj}_core/{domain}/ports/` |
| Infrastructure | `packages/db/`, `apps/**/infrastructure/` | `infra/src/main/java/{pkg}/` | `infra/src/{proj}_infra/` |
| Presentation | `apps/**/presentation/` | `api/src/main/java/{pkg}/` | `api/src/{proj}_api/` |

### 의존성 방향

동일: `Presentation → Application → Domain ← Ports ← Infrastructure`

| stack.language | Domain 순수성 규칙 |
|----------------|-------------------|
| typescript | 순수 TS (zod 제외) |
| java | 순수 Java (jakarta.validation 제외) |
| python | 순수 Python (pydantic 제외) |
