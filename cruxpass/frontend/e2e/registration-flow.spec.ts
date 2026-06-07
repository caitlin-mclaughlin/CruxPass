import { expect, test } from '@playwright/test';
import {
  apiBase,
  mockClimberApi,
  mockClimberCompetitionApi,
  mockCommonApi,
  sampleCompetition,
  seedAuth,
} from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'CLIMBER');
  await mockCommonApi(page);
  await mockClimberApi(page);
  await mockClimberCompetitionApi(page);
});

test('climber registration requires group and division selections', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Register' }).click();
  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Register for Spring Boulder Bash' }).click();

  await expect(page.getByText('Please complete all required fields.')).toBeVisible();
});

test('climber can open registration from the competition detail page', async ({ page }) => {
  await page.goto('/competitions/10');

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' })).toBeVisible();
});

test('climber registration posts selected group, division, assigned heat, and starts checkout', async ({ page }) => {
  const registrationRequests: unknown[] = [];
  const checkoutRequests: unknown[] = [];
  await page.route(`${apiBase}/competitions/10/registrations/me`, route => {
    if (route.request().method() === 'PUT') {
      registrationRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 77,
          climberId: 2,
          climberName: 'Avery Climber',
          climberDob: '2000-01-01',
          climberEmail: 'avery@example.com',
          competitorGroup: { id: null, name: 'Intermediate', ageRule: null },
          division: 'FEMALE',
          heat: {
            id: 50,
            heatName: 'Morning Heat',
            startTime: '2026-06-01T09:00:00',
            capacity: 40,
            duration: 120,
            groups: [{ id: null, name: 'Intermediate', ageRule: null }],
            divisions: ['FEMALE'],
            divisionsEnabled: true,
          },
          feeamount: 3500,
          feeCurrency: 'USD',
          paid: true,
          paymentStatus: 'PAID',
        }),
      });
    }

    return route.fallback();
  });

  await page.route(`${apiBase}/stripe/checkout`, route => {
    checkoutRequests.push(route.request().postDataJSON());
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ sessionId: '', sessionUrl: '' }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).click();
  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await expect(dialog.getByText('$35').first()).toBeVisible();
  await dialog.getByText('Intermediate').click();
  await dialog.getByRole('radio', { name: 'Women' }).click();
  await expect(dialog.getByText('Morning Heat')).toBeVisible();
  await dialog.getByRole('button', { name: 'Register for Spring Boulder Bash' }).click();

  await expect.poll(() => registrationRequests.length).toBe(1);
  expect(registrationRequests[0]).toMatchObject({
    id: 2,
    climberName: 'Avery Climber',
    email: 'avery@example.com',
    dob: '2000-01-01',
    competitorGroup: { name: 'Intermediate' },
    division: 'FEMALE',
    heat: { id: 50, heatName: 'Morning Heat' },
    paid: false,
  });
  await expect.poll(() => checkoutRequests.length).toBe(1);
  expect(checkoutRequests[0]).toMatchObject({
    registrationId: 77,
  });
});

test('climber can register a dependent when the account owner is already registered', async ({ page }) => {
  const registrationRequests: unknown[] = [];

  await page.route(`${apiBase}/climbers/me/competitionIds`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([10]),
  }));

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      {
        ...registeredClimber(),
        climberId: 2,
        climberName: 'Avery Climber',
        climberDob: '2000-01-01',
      },
    ]),
  }));

  await page.route(`${apiBase}/competitions/10/registrations/me`, route => {
    if (route.request().method() === 'PUT') {
      registrationRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...registeredClimber(),
          climberId: 3,
          climberName: 'Riley Dependent',
          climberDob: '2016-01-01',
          climberEmail: null,
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...registeredClimber(),
        climberId: 2,
        climberName: 'Avery Climber',
        climberDob: '2000-01-01',
      }),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Register Dependent' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await expect(dialog.getByText('Riley Dependent', { exact: true })).toBeVisible();
  await expect(dialog.getByText('-- Myself --')).toHaveCount(0);
  await expect(dialog.getByText('Showing groups available to Riley Dependent.')).toBeVisible();

  await expect(dialog.getByText('$35').first()).toBeVisible();
  await dialog.getByText('Intermediate').click();
  await dialog.getByRole('radio', { name: 'Non-Binary' }).click();
  await dialog.getByRole('button', { name: 'Register for Spring Boulder Bash' }).click();

  await expect.poll(() => registrationRequests.length).toBe(1);
  expect(registrationRequests[0]).toMatchObject({
    id: 3,
    climberName: 'Riley Dependent',
    dob: '2016-01-01',
    competitorGroup: { name: 'Intermediate' },
    division: 'NONBINARY',
  });
});

test('climber registration hides dependents who are already registered', async ({ page }) => {
  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      {
        ...registeredClimber(),
        climberId: 3,
        climberName: 'Riley Dependent',
        climberDob: '2016-01-01',
      },
    ]),
  }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await expect(dialog.getByText('-- Myself --')).toBeVisible();
  await expect(dialog.getByText('Riley Dependent')).toHaveCount(0);
});

test('climber registration only shows groups the logged-in climber is eligible for with prices', async ({ page }) => {
  await page.route(`${apiBase}/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(ageRestrictedCompetition()),
  }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await expect(dialog.getByText('Showing groups available to Avery Climber.')).toBeVisible();
  await expect(dialog.getByText('Adult Advanced')).toBeVisible();
  await expect(dialog.getByText('$55')).toBeVisible();
  await expect(dialog.getByText('Youth D')).toHaveCount(0);
});

test('climber registration refreshes eligible groups and price when registering a dependent', async ({ page }) => {
  await page.route(`${apiBase}/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(ageRestrictedCompetition()),
  }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Register' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  await dialog.getByRole('button', { name: '-- Myself --' }).click();
  await dialog.getByRole('option', { name: 'Riley Dependent' }).click();

  await expect(dialog.getByText('Showing groups available to Riley Dependent.')).toBeVisible();
  await expect(dialog.getByText('Youth D')).toBeVisible();
  await expect(dialog.getByText('$30')).toBeVisible();
  await expect(dialog.getByText('Adult Advanced')).toHaveCount(0);
});

function adultGroup() {
  return { id: 900, name: 'Adult Advanced', ageRule: { type: 'AGE', min: 18 } };
}

function youthGroup() {
  return { id: 901, name: 'Youth D', ageRule: { type: 'AGE', max: 11 } };
}

function ageRestrictedCompetition() {
  const adult = adultGroup();
  const youth = youthGroup();

  return {
    ...sampleCompetition(),
    pricingRules: [
      {
        id: 1,
        name: 'Adult',
        ruleType: 'GROUP',
        groups: [adult],
        amount: 55,
        priority: 1,
      },
      {
        id: 2,
        name: 'Youth',
        ruleType: 'GROUP',
        groups: [youth],
        amount: 30,
        priority: 2,
      },
    ],
    selectedGroups: [adult, youth],
    heats: [
      {
        id: 60,
        heatName: 'Eligibility Heat',
        startTime: '2026-06-01T09:00:00',
        capacity: 30,
        duration: 90,
        groups: [adult, youth],
        divisions: ['FEMALE', 'NONBINARY'],
        divisionsEnabled: true,
      },
    ],
  };
}

function registeredClimber() {
  return {
    id: 77,
    gymId: 1,
    compId: 10,
    climberId: 2,
    climberName: 'Avery Climber',
    climberDob: '2000-01-01',
    climberEmail: 'avery@example.com',
    competitorGroup: { id: null, name: 'Intermediate', ageRule: null },
    division: 'FEMALE',
    heat: {
      id: 50,
      heatName: 'Morning Heat',
      startTime: '2026-06-01T09:00:00',
      capacity: 40,
      duration: 120,
      groups: [{ id: null, name: 'Intermediate', ageRule: null }],
      divisions: ['MALE', 'FEMALE', 'NONBINARY'],
      divisionsEnabled: true,
    },
    feeamount: 3500,
    feeCurrency: 'USD',
    paid: true,
    paymentStatus: 'PAID',
  };
}
