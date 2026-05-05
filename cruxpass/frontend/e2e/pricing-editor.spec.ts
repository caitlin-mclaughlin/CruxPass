import { expect, test } from '@playwright/test';
import { mockCommonApi, mockGymApi, seedAuth } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'GYM');
  await mockCommonApi(page);
  await mockGymApi(page);
});

test('group pricing rules allow multiple groups in one rule', async ({ page }) => {
  await page.goto('/competitions/new');

  await expect(page.getByRole('heading', { name: /create competition/i })).toBeVisible();

  const groupSection = page.locator('section').filter({ hasText: 'Competitor Groups' });
  await groupSection.getByRole('checkbox', { name: 'Rec' }).check();
  await groupSection.getByRole('checkbox', { name: 'Intermediate' }).check();
  await groupSection.getByRole('checkbox', { name: 'Advanced' }).check();

  await page.getByText('Flat Fee').click();
  await page.getByRole('option', { name: 'Fee By Competitor Group' }).click();

  const pricingSection = page.locator('section').filter({ hasText: 'Pricing Info' });
  await pricingSection.getByRole('checkbox', { name: 'Intermediate' }).check();
  await pricingSection.getByRole('checkbox', { name: 'Advanced' }).check();
  await pricingSection.getByPlaceholder('e.g. 35 or 35.00 for $35.00').fill('45');

  await expect(pricingSection.getByRole('checkbox', { name: 'Intermediate' })).toBeChecked();
  await expect(pricingSection.getByRole('checkbox', { name: 'Advanced' })).toBeChecked();
  await expect(pricingSection.getByText('Climbers in Intermediate, Advanced will pay $45.')).toBeVisible();
});
