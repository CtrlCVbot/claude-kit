<!-- kit-convert generated: 2026-04-24 -->
---
description: Playwright 기반 E2E 테스트 패턴. E2E 테스트 작성, 디버깅, 리뷰 시 참조.
user_invocable: false
---

# E2E 테스트 패턴

## 테스트 구조

```
tests/
├── e2e/
│   ├── fixtures/          # 공유 테스트 설정 (인증, 데이터)
│   ├── pages/             # Page Object Model
│   └── journeys/          # 사용자 여정 테스트
│       ├── auth.spec.ts
│       ├── checkout.spec.ts
│       └── dashboard.spec.ts
```

## Page Object Model

```typescript
// tests/e2e/pages/login.page.ts
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-testid="error"]')).toHaveText(message);
  }
}
```

## 테스트 패턴

### 사용자 여정 (Happy Path)
```typescript
test('사용자가 결제를 완료할 수 있다', async ({ page }) => {
  const login = new LoginPage(page);
  const cart = new CartPage(page);

  await login.goto();
  await login.login('user@test.com', 'password');
  await cart.addItem('product-1');
  await cart.checkout();
  await expect(page).toHaveURL('/order/confirmation');
});
```

### 에러 처리
```typescript
test('잘못된 인증 정보 시 에러를 표시한다', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('invalid@test.com', 'wrong');
  await login.expectError('잘못된 인증 정보입니다');
});
```

### API 모킹
```typescript
test('API 실패 시 에러 상태를 표시한다', async ({ page }) => {
  await page.route('**/api/products', route =>
    route.fulfill({ status: 500, body: 'Server Error' })
  );
  await page.goto('/products');
  await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
});
```

## 규칙

1. **`data-testid` 사용** — CSS 클래스나 태그명이 아닌 data-testid로 셀렉터 지정
2. **테스트 파일당 하나의 여정** — 테스트를 집중적으로 유지
3. **Page Object로 재사용** — 셀렉터를 절대 중복하지 않음
4. **네트워크 대기** — assertion 전에 `waitForResponse` 사용
5. **테스트 데이터 격리** — 각 테스트가 자체 데이터를 생성하고 정리
6. **실패 시 스크린샷** — `playwright.config.ts`에서 설정
7. **기본 병렬 실행** — 순서가 필요한 경우만 `test.describe.serial` 사용

## 설정

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
});
```

## Codex 참고 사항

- 이 파일은 **authoring source**이다. runtime file이 아니다.
- Claude sibling: `src/claude/dev/skills/dev-testing-e2e/SKILL.md`
