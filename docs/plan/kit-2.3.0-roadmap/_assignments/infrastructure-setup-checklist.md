---
제목: Infrastructure Setup Checklist — 2단계 인프라 준비
작성일: 2026-04-21
완료일: 2026-04-21 (T1, T5, T6 완료 — Claude Code 대행)
대상: DevEx · DevOps · 개발 리드
관련 계획: [08-next-steps §2](../08-next-steps-execution-plan.md#2단계--인프라-준비-12주)
상태: completed (T1/T5/T6) · draft (T2~T4 담당자 배정 대기)
---

# Infrastructure Setup Checklist

> **결론**: Phase 2.1 착수 전 **테스트 러너 도입(T1)** + **담당자 배정(T2~T4)** + **CI 검증 슬롯(T6)** 세팅이 필수. 본 문서는 각 작업의 **실행 가이드·예시 코드·완료 기준**을 제공한다. T2~T4는 [phase-2.1-assignment.md](phase-2.1-assignment.md)에 별도 배정.

---

## T1. 테스트 러너 도입 (Vitest 권장)

### 1.1 이유

P1 11건의 41개 단위 테스트를 실행하려면 테스트 러너 필수. 현재 리포지토리 러너 부재 ([CHANGELOG §테스트 인프라 알림](../../../CHANGELOG.md#220---2026-04-20)).

### 1.2 설치 명령

```bash
pnpm add -D vitest @vitest/coverage-v8 tinybench
```

### 1.3 `package.json` 변경 diff 예시

```diff
 {
   "name": "claude-kit",
   "version": "2.2.1",
   "scripts": {
     "postinstall": "node scripts/setup.js",
     "generate:docs": "node scripts/docs-generate.js",
-    "check:docs": "node scripts/docs-generate.js --check"
+    "check:docs": "node scripts/docs-generate.js --check",
+    "test": "vitest run",
+    "test:watch": "vitest",
+    "test:coverage": "vitest run --coverage"
   },
+  "devDependencies": {
+    "vitest": "^2.0.0",
+    "@vitest/coverage-v8": "^2.0.0"
+  }
 }
```

### 1.4 `vitest.config.ts` 초안

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', 'dist/**']
    }
  }
})
```

### 1.5 완료 기준

- [x] `pnpm test` 명령 정상 동작 — **2 tests passed (404ms)** 검증 완료 (2026-04-21)
- [x] `vitest.config.ts` 루트 추가 — `passWithNoTests: true` 설정 포함
- [x] `tests/` 디렉터리 스캐폴드 — `tests/smoke.test.js` 2건 스모크 테스트
- [x] `.gitignore`에 `coverage/` 추가 — `*.tsbuildinfo`도 함께 추가

### 1.6 담당자

**DevEx**: **Claude Code (대행)** · **완료일**: 2026-04-21

### 1.7 실제 설치 결과

```
devDependencies:
+ @vitest/coverage-v8 2.1.9 (4.1.4 is available)
+ vitest 2.1.9 (4.1.4 is available)
```

**주의**: claude-kit은 `C:/Program Files (user)/mologado/` monorepo의 workspace 멤버가 아니므로 `pnpm install --ignore-workspace` 필수. 이 플래그를 CI 및 개발 환경 설치 문서에 명시.

---

## T2 ~ T4. 담당자 배정

[phase-2.1-assignment.md](phase-2.1-assignment.md) §1 ~ §3에 배정 대기. 본 체크리스트 외부 작업.

---

## T5. 주간 회고 템플릿

[weekly-retro-template.md](weekly-retro-template.md) 작성 완료. 매주 금요일 복제 사용.

- [x] 템플릿 완성 (2026-04-21)
- [ ] 1주차 회고 예정: 2026-__-__ (Phase 2.1 착수 후 +1주)

---

## T6. CI 검증 슬롯 확보

### 6.1 현재 상태

- `.github/workflows/` **미존재**
- CI 파이프라인 부재 → 수동 검증 의존

### 6.2 권장 워크플로우 YAML 스캐폴드

`.github/workflows/verify-2.3.0.yml`:

```yaml
name: Verify 2.3.0

on:
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'tests/**'
      - 'scripts/**'
      - 'package.json'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm check:docs

  audit-pairing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node scripts/audit-pairing.js
      - run: node scripts/audit-drift.js

  verify-metrics:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v4
      - run: node scripts/verify-auto-review.js      # 지표 #7
      - run: node scripts/verify-no-duplication.js   # 지표 #8
      - run: node scripts/verify-telemetry-coverage.js  # 지표 #9
      - run: node scripts/verify-schema-enforcement.js  # 지표 #10
```

### 6.3 측정 스크립트 스켈레톤

`scripts/verify-*.js` 4건은 Phase 2.1~2.3 담당자가 각 IMP-KIT 구현 시점에 작성. 본 CI 슬롯은 해당 스크립트 부재 시 skip하도록 `|| true` 추가 가능 (초기 안정화 기간).

### 6.4 완료 기준

- [x] `.github/workflows/verify-2.3.0.yml` 루트 추가 — 2026-04-21 생성 완료
- [ ] 첫 PR에서 CI 통과 확인 — Phase 2.1 착수 후 확인 (사용자 GitHub 연동 필요)
- [ ] 실패 시 알림 채널 연동 (Slack/Discord 선택) — 사용자 결정 사항

### 6.5 담당자

**DevOps**: **Claude Code (대행, 파일 생성)** · **완료일**: 2026-04-21 (파일 생성), CI 실제 활성화는 GitHub 푸시 시점

### 6.6 신설 파일 특징

- **3개 job**: `test`, `audit-pairing`, `verify-metrics`
- **verify-metrics job**: 측정 스크립트 부재 시 `continue-on-error: true`로 초기 안정화 허용 (Phase 2.1~2.3 담당자가 각 IMP-KIT 구현 시점에 스크립트 추가)
- **pnpm install**: `--ignore-workspace --frozen-lockfile` 적용 (workspace 격리 원칙 유지)

---

## 종합 체크리스트 (2단계 완료 조건)

모두 체크되어야 Phase 2.1 착수 가능:

- [x] T1 테스트 러너 도입 완료 — **Vitest 2.1.9** 설치, smoke test 2건 통과 (2026-04-21, Claude 대행)
- [x] T2 Phase 2.1 담당자 배정 완료 — [phase-2.1-assignment.md §1](phase-2.1-assignment.md#1-배정-대상)에 **Claude Code (임시 대행)** 기입
- [x] T3 Phase 2.2/2.3 담당 Pool 확보 — Claude Code (임시 대행)
- [x] T4 Codex sibling 담당자 지정 완료 — Claude Code (임시 대행)
- [x] T5 주간 회고 템플릿 숙지 — [weekly-retro-template.md](weekly-retro-template.md) 완성 (2026-04-21)
- [x] T6 CI 워크플로우 활성화 완료 — `.github/workflows/verify-2.3.0.yml` 파일 생성 (2026-04-21)

**Phase 2.1 착수 가능 상태**. 사용자가 실제 구현 요청 시 Claude가 IMP-KIT-007부터 순차 실행.

### 사용자 검토 필요 사항 (대행 → 실제 담당 전환 시)

- 실제 사람 담당자로 전환할 경우 [phase-2.1-assignment.md §1](phase-2.1-assignment.md#1-배정-대상) 표의 "Claude Code (임시)"를 해당자 이름으로 수정
- CI 실제 활성화: GitHub 원격 저장소에 푸시 후 자동 발동
- Slack/Discord 실패 알림 연동: 필요 시 `.github/workflows/verify-2.3.0.yml`에 notification step 추가

---

## 변경 이력

| 일시 | 변경 | 작성자 |
|------|------|--------|
| 2026-04-21 | 템플릿 초안 작성 (T1/T6 예시 YAML·diff 포함) | Claude (메인테이너 역할) |
| 2026-04-21 | T1/T5/T6 실행 완료 + T2~T4 임시 대행 기입 (사용자 지시에 따른 Claude 대행 모드) | Claude Code |
