import { expect, test } from '@playwright/test';
import { mockCommonApi, mockGymApi, seedAuth } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'GYM');
  await mockCommonApi(page);
  await mockGymApi(page);
});


test('empty create competition submit surfaces required-section errors', async ({ page }) => {
  await page.goto('/competitions/new');

  await page.getByRole('button', { name: 'Create Competition' }).click();

  await expect(page.getByText('Please complete all required competition details.')).toBeVisible();
  await expect(page.getByText('At least one competitor group must be selected.')).toBeVisible();
  await expect(page.getByText('Select at least one competitor group to organize heats')).toBeVisible();
});


test('custom competitor group modal validates ranges and adds the group to the draft', async ({ page }) => {
  await page.goto('/competitions/new');

  await page.getByRole('button', { name: 'Add Custom Group' }).click();
  await expect(page.getByRole('heading', { name: 'Add Custom Group' })).toBeVisible();

  await page.getByPlaceholder('Group Name (e.g. Youth U14)').fill('Youth U10');
  await page.getByRole('switch').click();
  await page.getByPlaceholder('Min Age').fill('12');
  await page.getByPlaceholder('Max Age').fill('10');
  await expect(page.getByText('Minimum cannot be greater than maximum.')).toBeVisible();

  await page.getByPlaceholder('Min Age').fill('8');
  await page.getByPlaceholder('Max Age').fill('10');
  await expect(page.getByText('Climbers must be 8-10 years old to participate in this group')).toBeVisible();
  await page.getByRole('button', { name: 'Add Group' }).click();

  const groupSection = page.locator('section').filter({ hasText: 'Competitor Groups' });
  await expect(groupSection.getByRole('checkbox', { name: /Youth U10/ })).toBeChecked();
});


test('age pricing rule previews bounded and unbounded age ranges', async ({ page }) => {
  await page.goto('/competitions/new');

  await page.getByText('Flat Fee').click();
  await page.getByRole('option', { name: 'Fee By Age' }).click();

  const pricingSection = page.locator('section').filter({ hasText: 'Pricing Info' });
  const ruleNumberInputs = pricingSection.locator('input[type="number"]');
  await ruleNumberInputs.nth(0).fill('8');
  await ruleNumberInputs.nth(1).fill('12');
  await pricingSection.getByPlaceholder('e.g. 35 or 35.00 for $35.00').fill('25');
  await expect(pricingSection.getByText('8-12 year old climbers will pay $25.')).toBeVisible();

  await ruleNumberInputs.nth(1).fill('');
  await expect(pricingSection.getByText('Climbers 8 years old and up will pay $25.')).toBeVisible();
});


test('heat editor enables selected groups and warns when selected groups are unused', async ({ page }) => {
  await page.goto('/competitions/new');

  const groupSection = page.locator('section').filter({ hasText: 'Competitor Groups' });
  await groupSection.getByRole('checkbox', { name: 'Rec' }).check();
  await groupSection.getByRole('checkbox', { name: 'Advanced' }).check();

  await page.getByRole('button', { name: 'Create Competition' }).click();
  await expect(page.getByText('The following group(s) have been selected but not assigned to a heat:')).toBeVisible();

  const heatSection = page.locator('section').filter({ hasText: 'Heats & Schedule' });
  await heatSection.getByRole('checkbox', { name: 'Rec' }).check();

  await expect(heatSection.getByRole('checkbox', { name: 'Rec' })).toBeChecked();
});
