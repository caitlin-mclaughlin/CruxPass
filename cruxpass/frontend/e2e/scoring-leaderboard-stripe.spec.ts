import { expect, test } from '@playwright/test';
import {
  apiBase,
  mockClimberApi,
  mockClimberCompetitionApi,
  mockCommonApi,
  sampleCompetition,
  sampleGymRegistration,
  seedAuth,
} from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'CLIMBER');
  await mockCommonApi(page);
});

test('score submission sends the full scorecard for the active climber', async ({ page }) => {
  const liveCompetition = liveSampleCompetition();
  const activeRegistration = liveRegistration();
  const submissionRequests: unknown[] = [];

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, liveCompetition);

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([activeRegistration]),
  }));

  await page.route(`${apiBase}/competitions/10/registrations/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(activeRegistration),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/me**`, route => {
    if (route.request().method() === 'PUT') {
      const payload = route.request().postDataJSON();
      submissionRequests.push(payload);
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ id: 500, compId: 10, climberId: 2, routes: payload.routes }),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{ routeId: 101, attempts: 2, send: true }]),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Enter Scores' }).click();

  const dialog = page.getByRole('dialog', { name: 'Submit Scores' });
  await expect(dialog.getByText('Active Climber')).toBeVisible();
  await expect(dialog.getByRole('columnheader', { name: 'Grade' })).toBeVisible();
  await expect(dialog.locator('tbody tr').nth(0)).toContainText('V0');
  await dialog.locator('tbody tr').nth(0).getByRole('spinbutton').fill('0');
  await dialog.locator('tbody tr').nth(0).getByRole('switch').click();
  await dialog.locator('tbody tr').nth(1).getByRole('spinbutton').fill('3');
  await dialog.locator('tbody tr').nth(1).getByRole('switch').click();
  await dialog.getByRole('button', { name: 'Submit Scores for Avery Climber' }).click();

  await expect.poll(() => submissionRequests.length).toBe(1);
  expect(submissionRequests[0]).toMatchObject({
    climberId: 2,
    routes: [
      { routeId: 101, attempts: 0, send: false },
      { routeId: 102, attempts: 3, send: true },
    ],
  });
});

test('score modal switches active climbers and reloads the selected climber submissions', async ({ page }) => {
  const submissionGets: Array<string | null> = [];
  const submissionRequests: unknown[] = [];
  const ownerRegistration = liveRegistration();
  const dependentRegistration = {
    ...liveRegistration(),
    id: 78,
    climberId: 3,
    climberName: 'Riley Dependent',
    climberDob: '2016-01-01',
  };

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, liveSampleCompetition());

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([ownerRegistration, dependentRegistration]),
  }));

  await page.route(`${apiBase}/competitions/10/registrations/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(ownerRegistration),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/me**`, route => {
    const url = new URL(route.request().url());
    const climberId = url.searchParams.get('climberId');

    if (route.request().method() === 'PUT') {
      submissionRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ id: 501, compId: 10, climberId: Number(climberId), routes: route.request().postDataJSON().routes }),
      });
    }

    submissionGets.push(climberId);
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(climberId === '3'
        ? [{ routeId: 102, attempts: 4, send: true }]
        : [{ routeId: 101, attempts: 1, send: true }]
      ),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Enter Scores' }).click();

  const dialog = page.getByRole('dialog', { name: 'Submit Scores' });
  const averySelector = dialog.locator('button[aria-pressed]').filter({ hasText: 'Avery Climber' });
  await expect(averySelector).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.locator('tbody tr').nth(0).getByRole('spinbutton')).toHaveValue('1');

  const rileySelector = dialog.locator('button[aria-pressed]').filter({ hasText: 'Riley Dependent' });
  await rileySelector.click();
  await expect(rileySelector).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.locator('tbody tr').nth(1).getByRole('spinbutton')).toHaveValue('4');
  await dialog.locator('tbody tr').nth(0).getByRole('spinbutton').fill('2');
  await dialog.locator('tbody tr').nth(0).getByRole('switch').click();
  await dialog.getByRole('button', { name: 'Submit Scores for Riley Dependent' }).click();

  await expect.poll(() => submissionRequests.length).toBe(1);
  expect(submissionGets).toContain('2');
  expect(submissionGets).toContain('3');
  expect(submissionRequests[0]).toMatchObject({
    climberId: 3,
    routes: [
      { routeId: 101, attempts: 2, send: true },
      { routeId: 102, attempts: 4, send: true },
    ],
  });
});

test('score modal prevents send rows without attempts from submitting', async ({ page }) => {
  const submissionRequests: unknown[] = [];

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, liveSampleCompetition());

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([liveRegistration()]),
  }));

  await page.route(`${apiBase}/competitions/10/registrations/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(liveRegistration()),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/me**`, route => {
    if (route.request().method() === 'PUT') {
      submissionRequests.push(route.request().postDataJSON());
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ id: 500, compId: 10, climberId: 2, routes: route.request().postDataJSON().routes }),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Enter Scores' }).click();
  const dialog = page.getByRole('dialog', { name: 'Submit Scores' });

  await dialog.locator('tbody tr').nth(0).getByRole('switch').click();
  await dialog.getByRole('button', { name: 'Submit Scores for Avery Climber' }).click();

  await expect(dialog.getByText('Please enter attempts for all "Send" routes.')).toBeVisible();
  expect(submissionRequests).toHaveLength(0);
});

test('enter scores action is hidden when the climber has no active heat', async ({ page }) => {
  const futureCompetition = liveSampleCompetition();
  futureCompetition.heats[0].startTime = new Date(Date.now() + 60 * 60_000).toISOString();

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, futureCompetition);
  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([{ ...liveRegistration(), heat: futureCompetition.heats[0] }]),
  }));

  await page.goto('/competitions/10');

  await expect(page.getByRole('button', { name: 'Enter Scores' })).toHaveCount(0);
});

test('leaderboard groups live heat sections and highlights household scores', async ({ page }) => {
  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, liveSampleCompetition());

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([liveRegistration()]),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/rankings**`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      rankedSubmission(1, 4, 'Jordan Rival', 340, 5),
      rankedSubmission(2, 2, 'Avery Climber', 300, 6),
    ]),
  }));

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Leaderboard' }).click();

  await expect(page.getByRole('heading', { name: 'Live Heat' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Advanced' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Women' })).toBeVisible();
  const averyRow = page.getByRole('row').filter({ hasText: 'Avery Climber' }).first();
  await expect(averyRow).toContainText('300');
  await expect(averyRow).toHaveClass(/bg-highlight/);
});

test('leaderboard renders empty and non-household rows without highlight', async ({ page }) => {
  const competitionWithEmptyDivision = liveSampleCompetition();
  competitionWithEmptyDivision.heats[0].divisions = ['MALE', 'FEMALE'];

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page, competitionWithEmptyDivision);

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([liveRegistration()]),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/rankings**`, route => {
    const url = new URL(route.request().url());
    const division = url.searchParams.get('division');
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(division === 'FEMALE'
        ? [rankedSubmission(1, 4, 'Jordan Rival', 340, 5)]
        : []
      ),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('tab', { name: 'Leaderboard' }).click();

  const rivalRow = page.getByRole('row').filter({ hasText: 'Jordan Rival' }).first();
  await expect(rivalRow).not.toHaveClass(/bg-highlight/);
  await expect(page.getByText('No submissions yet for')).toBeVisible();
});

test('pending paid registration can resume Stripe checkout from competition page', async ({ page }) => {
  const checkoutRequests: unknown[] = [];

  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page);

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      {
        ...sampleGymRegistration(),
        paid: false,
        paymentStatus: 'PENDING',
      },
      {
        ...sampleGymRegistration(),
        id: 78,
        climberId: 3,
        climberName: 'Riley Dependent',
        climberDob: '2016-01-01',
        paid: true,
        paymentStatus: 'PAID',
      },
    ]),
  }));

  await page.route(`${apiBase}/stripe/checkout`, route => {
    checkoutRequests.push(route.request().postDataJSON());
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ sessionId: '', sessionUrl: '' }),
    });
  });

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Complete Payment' }).click();

  await expect.poll(() => checkoutRequests.length).toBe(1);
  const checkoutRequest = checkoutRequests[0] as {
    registrationId: number;
    successUrl: string;
    cancelUrl: string;
  };
  expect(checkoutRequest.registrationId).toBe(77);
  expect(checkoutRequest.successUrl).toContain('payment=success');
  expect(checkoutRequest.cancelUrl).toContain('payment=cancel');
  await expect(page.getByText('Registration is already marked paid.')).toBeVisible();
});

test('stripe checkout failure surfaces a retry message', async ({ page }) => {
  await mockClimberApi(page, { competitionIds: [10] });
  await mockClimberCompetitionApi(page);

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      { ...sampleGymRegistration(), paid: false, paymentStatus: 'PENDING' },
      {
        ...sampleGymRegistration(),
        id: 78,
        climberId: 3,
        climberName: 'Riley Dependent',
        climberDob: '2016-01-01',
        paid: true,
        paymentStatus: 'PAID',
      },
    ]),
  }));

  await page.route(`${apiBase}/stripe/checkout`, route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Stripe unavailable' }),
  }));

  await page.goto('/competitions/10');
  await page.getByRole('button', { name: 'Complete Payment' }).click();

  await expect(page.getByText('Unable to start payment checkout. Please try again.')).toBeVisible();
});

function liveSampleCompetition() {
  const start = new Date(Date.now() - 30 * 60_000).toISOString();
  return {
    ...sampleCompetition(),
    compStatus: 'LIVE',
    heats: [
      {
        ...sampleCompetition().heats[0],
        heatName: 'Live Heat One',
        startTime: start,
        duration: 120,
        groups: [{ id: null, name: 'Advanced', ageRule: null }],
        divisions: ['FEMALE'],
        divisionsEnabled: true,
      },
    ],
    selectedGroups: [{ id: null, name: 'Advanced', ageRule: null }],
  };
}

function liveRegistration() {
  return {
    ...sampleGymRegistration(),
    competitorGroup: { id: null, name: 'Advanced', ageRule: null },
    division: 'FEMALE',
    heat: liveSampleCompetition().heats[0],
    paid: true,
    paymentStatus: 'PAID',
  };
}

function rankedSubmission(place: number, climberId: number, climberName: string, totalPoints: number, totalAttempts: number) {
  return {
    place,
    climberId,
    climberName,
    totalPoints,
    totalAttempts,
    competitorGroup: { id: null, name: 'Advanced', ageRule: null },
    division: 'FEMALE',
  };
}
