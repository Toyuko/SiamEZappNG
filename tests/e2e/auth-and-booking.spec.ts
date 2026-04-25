import { expect, test } from '@playwright/test';

async function mockAuthApis(page: any) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-token', user: { id: 'u-1', email: 'qa@example.com' } }),
    }),
  );
}

async function gotoFirstAvailable(page: any, paths: string[]) {
  for (const path of paths) {
    const response = await page.goto(path);
    if (response?.ok()) return;
  }
  throw new Error(`Unable to load any expected route: ${paths.join(', ')}`);
}

test('login route is reachable in production web build', async ({ page }) => {
  await mockAuthApis(page);
  await gotoFirstAvailable(page, ['/login', '/--/login']);
  await expect(page).toHaveURL(/login|--\/login/i);
  await expect(page.locator('body')).toBeVisible();
});
