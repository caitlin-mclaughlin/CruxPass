import { expect, test } from '@playwright/test';
import {
  apiBase,
  mockClimberApi,
  mockClimberCompetitionApi,
  mockCommonApi,
  sampleCompetition,
  sampleDependent,
  sampleGymRegistration,
  seedAuth,
} from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'CLIMBER');
  await mockCommonApi(page);
  await mockClimberApi(page);
});

test('climber profile renders dependents and delete confirmation', async ({ page }) => {
  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'Avery Climber' })).toBeVisible();
  await expect(page.getByText('Denver, CO 80202')).toBeVisible();
  await expect(page.getByText('Riley Dependent')).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Are you sure you want to permanently delete Riley Dependent?')).toBeVisible();
});

test('climber profile update preserves and posts zip code', async ({ page }) => {
  const updateRequests: unknown[] = [];
  await page.route(`${apiBase}/climbers/me`, route => {
    if (route.request().method() === 'PUT') {
      const payload = route.request().postDataJSON();
      updateRequests.push(payload);
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...payload,
          id: 2,
          createdAt: '2026-01-01',
        }),
      });
    }

    return route.fallback();
  });

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.getByPlaceholder('Zip Code').fill('80401');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect.poll(() => updateRequests.length).toBe(1);
  expect(updateRequests[0]).toMatchObject({
    address: {
      city: 'Denver',
      state: 'CO',
      zipCode: '80401',
    },
  });
});

test('climber profile shows registered competition and registration details', async ({ page }) => {
  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page);

  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'My Competitions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upcoming & Live' })).toBeVisible();
  await expect(page.getByText('Spring Boulder Bash')).toBeVisible();
  await expect(page.getByText('Advanced')).toBeVisible();
  await expect(page.getByText('Women')).toBeVisible();
  await expect(page.getByText('Morning Heat')).toBeVisible();
  await expect(page.getByText('$35.00')).toBeVisible();
});

test('climber profile groups upcoming/live and finished competitions', async ({ page }) => {
  await mockClimberApi(page, { competitionIds: [10, 11] });
  await mockClimberCompetitionApi(page);

  const finishedCompetition = {
    ...sampleCompetition(),
    id: 11,
    name: 'Winter Boulder Bash',
    startDate: '2026-01-15T09:00:00',
    deadline: '2026-01-10T23:59:00',
    compStatus: 'FINISHED',
  };
  const finishedRegistration = {
    ...sampleGymRegistration(),
    id: 88,
    compId: 11,
    heat: {
      ...sampleGymRegistration().heat,
      heatName: 'Final Heat',
      startTime: '2026-01-15T09:00:00',
    },
  };

  await page.route(`${apiBase}/competitions/11`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(finishedCompetition),
  }));
  await page.route(`${apiBase}/competitions/11/registrations/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(finishedRegistration),
  }));

  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'Upcoming & Live' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Past' })).toBeVisible();
  await expect(page.getByText('Spring Boulder Bash')).toBeVisible();
  await expect(page.getByText('Winter Boulder Bash')).toBeVisible();
  await expect(page.getByText('Final Heat')).toBeVisible();
});

test('add dependent modal validates required fields', async ({ page }) => {
  await page.goto('/profile');

  await page.getByRole('button', { name: 'Add Dependent' }).click();
  await expect(page.getByRole('heading', { name: 'Add Dependent' })).toBeVisible();

  await page.getByRole('button', { name: 'Save Dependent' }).click();

  await expect(page.getByText('Please fill out all fields.')).toBeVisible();
});

test('add dependent modal posts the completed dependent profile', async ({ page }) => {
  const dependentRequests: unknown[] = [];
  await page.route(`${apiBase}/climbers/me/dependents`, route => {
    if (route.request().method() === 'POST') {
      dependentRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(sampleDependent()),
      });
    }

    return route.fallback();
  });

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Add Dependent' }).click();
  await page.getByPlaceholder("Dependent's Name").fill('Riley Dependent');
  await page.getByPlaceholder('MM/DD/YYYY').fill('01/01/2016');
  await page.getByRole('radio', { name: 'Non-Binary' }).click();
  await page.getByRole('button', { name: 'Save Dependent' }).click();

  await expect.poll(() => dependentRequests.length).toBe(1);
  expect(dependentRequests[0]).toMatchObject({
    name: 'Riley Dependent',
    gender: 'NONBINARY',
    emergencyName: 'Avery Climber',
    emergencyPhone: '5551234567',
  });
});
