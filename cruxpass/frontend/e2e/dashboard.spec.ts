import { expect, test } from '@playwright/test';
import { mockCommonApi } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await mockCommonApi(page);
});

test('dashboard renders upcoming competitions returned by the API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Spring Boulder Bash')).toBeVisible();
  await expect(page.getByRole('button', { name: /see details/i })).toBeVisible();
});

test('dashboard can switch to the series tab', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Upcoming Series' }).click();

  await expect(page.getByRole('button', { name: 'Upcoming Series' })).toHaveClass(/border-green/);
});
