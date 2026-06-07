import { expect, test } from '@playwright/test';
import { apiBase, mockCommonApi, mockGymCompetitionApi, sampleCompetition, seedAuth } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'GYM');
  await mockCommonApi(page);
  await mockGymCompetitionApi(page);
});

test('gym competition page renders overview, heats, and registrations from API data', async ({ page }) => {
  await page.goto('/competitions/10');

  await expect(page.getByRole('heading', { name: 'Spring Boulder Bash' })).toBeVisible();
  await expect(page.getByTestId('desktop-view').getByText('Morning Heat')).toBeVisible();
  await expect(page.getByTestId('desktop-view').getByText('Intermediate')).toBeVisible();
  await expect(page.getByTestId('desktop-view').getByText('Advanced')).toBeVisible();
  await expect(page.getByText('Early Bird')).toBeVisible();

  await page.getByRole('tab', { name: 'Registrations' }).click();
  await expect(page.getByText('Avery Climber')).toBeVisible();
  await expect(page.getByText('avery@example.com')).toBeVisible();
  await expect(page.getByText('$ 3500.00')).toBeVisible();

  await page.getByRole('tab', { name: 'Heats' }).click();
  await expect(page.getByTestId('desktop-view').getByText('Morning Heat')).toBeVisible();
});

test('gym can register a climber for the competition', async ({ page }) => {
  const registrationRequests: unknown[] = [];
  await page.route(`${apiBase}/gyms/me/competitions/10/registrations`, route => {
    if (route.request().method() === 'PUT') {
      registrationRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 77,
          gymId: 1,
          compId: 10,
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

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Registrations' }).click();
  await page.getByRole('button', { name: 'Register a Climber' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register a Climber for Spring Boulder Bash' });
  await dialog.getByPlaceholder('Search by EMAIL').fill('avery@example.com');
  await dialog.getByRole('button', { name: 'Search' }).click();
  await dialog.getByRole('button', { name: /Avery Climber/ }).click();
  await expect(dialog.getByText('$35').first()).toBeVisible();
  await dialog.getByText('Intermediate').click();
  await dialog.getByRole('radio', { name: 'Women' }).click();
  await expect(dialog.getByText('Morning Heat')).toBeVisible();
  await dialog.getByRole('button', { name: 'Register Climber for Spring Boulder Bash' }).click();

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
});

test('edit routes modal validates missing point values before saving', async ({ page }) => {
  await page.goto('/competitions/10');

  await page.getByRole('tab', { name: "Routes" }).click();

  await page.getByRole('button', { name: 'Edit Routes' }).click();
  await page.getByRole('button', { name: 'Add route' }).click();
  await page.getByRole('button', { name: 'Save Routes' }).click();

  await expect(page.getByText('Please fill in all point values before saving.')).toBeVisible();
});

test('edit routes tab submits route point values', async ({ page }) => {
  const routeRequests: unknown[] = [];
  await page.route('http://localhost:8080/api/gyms/me/competitions/10/routes', async route => {
    if (route.request().method() === 'PUT') {
      routeRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 101, number: 1, grade: 'V3', pointValue: 300 },
          { id: 102, number: 2, grade: 'V5', pointValue: 500 },
        ]),
      });
    }

    return route.fallback();
  });

  await page.goto('/competitions/10');

  await page.getByRole('tab', { name: "Routes" }).click();
  await page.getByRole('button', { name: 'Edit Routes' }).click();
  
  // Add two new routes
  await page.getByTestId('routes-to-add').fill('2');
  await page.getByRole('button', { name: 'Add route' }).click();

  // Fill details for both new routes
  await page.getByTestId('route-grade-0').click();
  await page.getByRole('option', { name: 'V3' }).click();
  await page.getByTestId('route-points-0').fill('300');

  await page.getByTestId('route-grade-1').click();
  await page.getByRole('option', { name: 'V5' }).click();
  await page.getByTestId('route-points-1').fill('500');

  await page.getByRole('button', { name: 'Save Routes' }).click();
  await expect.poll(() => routeRequests.length).toBe(1);
  expect(routeRequests[0]).toEqual([
    { number: 1, grade: 'V3', pointValue: 300 },
    { number: 2, grade: 'V5', pointValue: 500 },
  ]);
});

test('gym can toggle whether route grades are visible to climbers', async ({ page }) => {
  const visibilityRequests: unknown[] = [];
  await page.route(`${apiBase}/gyms/me/competitions/10/route-grade-visibility`, route => {
    visibilityRequests.push(route.request().postDataJSON());
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...sampleCompetition(),
        routeGradesVisible: false,
      }),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Routes' }).click();

  const visibilityToggle = page.getByRole('checkbox', { name: 'Show grades to climbers' });
  await expect(visibilityToggle).toBeChecked();
  await visibilityToggle.click();

  await expect.poll(() => visibilityRequests.length).toBe(1);
  expect(visibilityRequests[0]).toEqual({ routeGradesVisible: false });
});

test('edit routes tab can cancel unsaved route edits', async ({ page }) => {
  const routeRequests: unknown[] = [];
  await page.route(`${apiBase}/gyms/me/competitions/10/routes`, async route => {
    if (route.request().method() === 'PUT') {
      routeRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 101, number: 1, grade: 'V0', pointValue: 100 },
        { id: 102, number: 2, grade: 'V1', pointValue: 200 },
      ]),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Routes' }).click();
  await page.getByRole('button', { name: 'Edit Routes' }).click();

  await page.getByTestId('route-points-0').fill('999');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('table').getByText('100')).toBeVisible();
  await expect(page.getByRole('table').getByText('999')).toHaveCount(0);
  expect(routeRequests).toEqual([]);
});

test('edit routes tab can save an empty route list after removing all routes', async ({ page }) => {
  const routeRequests: unknown[] = [];
  await page.route(`${apiBase}/gyms/me/competitions/10/routes`, async route => {
    if (route.request().method() === 'PUT') {
      routeRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 101, number: 1, grade: 'V0', pointValue: 100 },
        { id: 102, number: 2, grade: 'V1', pointValue: 200 },
      ]),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Routes' }).click();
  await page.getByRole('button', { name: 'Edit Routes' }).click();

  await page.getByRole('button', { name: 'Remove route' }).click();
  await page.getByRole('button', { name: 'Remove route' }).click();
  await page.getByRole('button', { name: 'Save Routes' }).click();

  await expect.poll(() => routeRequests.length).toBe(1);
  expect(routeRequests[0]).toEqual([]);
});

test('gym registration only shows groups the selected climber can join', async ({ page }) => {
  await page.route(`${apiBase}/gyms/me/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      ...sampleAgeRestrictedCompetition(),
      selectedGroups: [
        adultGroup(),
        youthGroup(),
      ],
      heats: [
        {
          id: 60,
          heatName: 'Eligibility Heat',
          startTime: '2026-06-01T09:00:00',
          capacity: 30,
          duration: 90,
          groups: [adultGroup(), youthGroup()],
          divisions: ['FEMALE'],
          divisionsEnabled: true,
        },
      ],
    }),
  }));

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Registrations' }).click();
  await page.getByRole('button', { name: 'Register a Climber' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register a Climber for Spring Boulder Bash' });
  await expect(dialog.getByText('Choose a climber before selecting a group.')).toBeVisible();

  await dialog.getByPlaceholder('Search by EMAIL').fill('avery@example.com');
  await dialog.getByRole('button', { name: 'Search' }).click();
  await dialog.getByRole('button', { name: /Avery Climber/ }).click();

  await expect(dialog.getByText('Adult Advanced')).toBeVisible();
  await expect(dialog.getByText('$55')).toBeVisible();
  await expect(dialog.getByText('Youth D')).toHaveCount(0);
});

test('gym registration shows a clear empty state when no groups fit the selected climber', async ({ page }) => {
  await page.route(`${apiBase}/gyms/me/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      ...sampleAgeRestrictedCompetition(),
      selectedGroups: [youthGroup()],
      pricingRules: [
        {
          id: 2,
          name: 'Youth',
          ruleType: 'GROUP',
          groups: [youthGroup()],
          amount: 30,
          priority: 1,
        },
      ],
      heats: [
        {
          id: 61,
          heatName: 'Youth Heat',
          startTime: '2026-06-01T09:00:00',
          capacity: 20,
          duration: 90,
          groups: [youthGroup()],
          divisions: ['FEMALE'],
          divisionsEnabled: true,
        },
      ],
    }),
  }));

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Registrations' }).click();
  await page.getByRole('button', { name: 'Register a Climber' }).click();

  const dialog = page.getByRole('dialog', { name: 'Register a Climber for Spring Boulder Bash' });
  await dialog.getByPlaceholder('Search by EMAIL').fill('avery@example.com');
  await dialog.getByRole('button', { name: 'Search' }).click();
  await dialog.getByRole('button', { name: /Avery Climber/ }).click();

  await expect(dialog.getByText('No eligible competitor groups are available for this climber.')).toBeVisible();
  await expect(dialog.getByText('Youth D')).toHaveCount(0);
});

function adultGroup() {
  return { id: 900, name: 'Adult Advanced', ageRule: { type: 'AGE', min: 18 } };
}

function youthGroup() {
  return { id: 901, name: 'Youth D', ageRule: { type: 'AGE', max: 11 } };
}

function sampleAgeRestrictedCompetition() {
  return {
    id: 10,
    gymId: 1,
    name: 'Spring Boulder Bash',
    startDate: '2026-06-01T09:00:00',
    deadline: '2026-05-25T23:59:00',
    types: ['BOULDERING'],
    compFormat: 'CLASSIC_REDPOINT',
    pricingType: 'BY_GROUP',
    flatFee: null,
    feeCurrency: 'USD',
    pricingRules: [
      {
        id: 1,
        name: 'Adult',
        ruleType: 'GROUP',
        groups: [adultGroup()],
        amount: 55,
        priority: 1,
      },
      {
        id: 2,
        name: 'Youth',
        ruleType: 'GROUP',
        groups: [youthGroup()],
        amount: 30,
        priority: 2,
      },
    ],
    selectedGroups: [],
    heats: [],
    compStatus: 'UPCOMING',
    hostGymName: 'Crux Test Gym',
    location: {
      streetAddress: '123 Wall St',
      apartmentNumber: '',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
    },
  };
}
