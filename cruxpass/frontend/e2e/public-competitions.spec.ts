import { expect, test } from '@playwright/test';
import { mockCommonApi } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await mockCommonApi(page);
});

test('public competitions page loads the frontend app', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/CruxPass/i);
});
