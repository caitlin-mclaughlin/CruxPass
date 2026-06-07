import { Page } from '@playwright/test';

export const apiBase = 'http://localhost:8080/api';

export function makeJwt(role: 'CLIMBER' | 'GYM' | 'SERIES', id = 1) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role, id, sub: `${role.toLowerCase()}@example.com` }));
  return `${header}.${payload}.test-signature`;
}

export async function seedAuth(page: Page, role: 'CLIMBER' | 'GYM' | 'SERIES' = 'GYM') {
  await page.addInitScript(({ token, accountType }) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('accountType', accountType);
  }, {
    token: makeJwt(role),
    accountType: role,
  });
}

export async function mockCommonApi(page: Page) {
  await page.route(`${apiBase}/competitions`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([sampleCompetition()]),
  }));

  await page.route(`${apiBase}/publicSeries`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));
}

export async function mockGymApi(page: Page) {
  await page.route(`${apiBase}/gyms/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(sampleGym()),
  }));

  await page.route(`${apiBase}/gyms/me/competitions`, route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(99),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(`${apiBase}/gyms/me/series`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/gyms/me/competitor-groups`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/gyms/me/competitor-groups/mutations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/climbers/search**`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([sampleClimber()]),
  }));

  await page.route(`${apiBase}/climbers/2/dependents`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));
}

export async function mockGymCompetitionApi(page: Page) {
  await mockGymApi(page);

  await page.route(`${apiBase}/gyms/me/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(sampleCompetition()),
  }));

  await page.route(`${apiBase}/gyms/me/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([sampleGymRegistration()]),
  }));

  await page.route(`${apiBase}/gyms/me/competitions/10/routes`, route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 101, number: 1, grade: 'V0', pointValue: 100 },
          { id: 102, number: 2, grade: 'V1', pointValue: 200 },
        ]),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(`${apiBase}/gyms/me/competitions/10/submissions`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));
}

export async function mockClimberApi(
  page: Page,
  options: { competitionIds?: number[] } = {},
) {
  await page.route(`${apiBase}/climbers/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(sampleClimber()),
  }));

  await page.route(`${apiBase}/climbers/me/competitionIds`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(options.competitionIds ?? []),
  }));

  await page.route(`${apiBase}/climbers/me/dependents`, route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(sampleDependent()),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([sampleDependent()]),
    });
  });
}

export async function mockClimberCompetitionApi(page: Page, competition = sampleCompetition()) {
  await page.route(`${apiBase}/competitions/10`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(competition),
  }));

  await page.route(`${apiBase}/competitions/10/registrations/me`, route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(sampleGymRegistration()),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(sampleGymRegistration()),
    });
  });

  await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/competitions/10/routes`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      { id: 101, number: 1, grade: 'V0', pointValue: 100 },
      { id: 102, number: 2, grade: 'V1', pointValue: 200 },
    ]),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/rankings**`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/competitions/10/submissions/me`, route => {
    if (route.request().method() === 'PUT') {
      const payload = route.request().postDataJSON() as { routes: unknown[] };
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ routes: payload.routes }),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(`${apiBase}/stripe/checkout`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ sessionId: '', sessionUrl: '' }),
  }));
}

export async function mockSeriesApi(page: Page) {
  await page.route(`${apiBase}/series/me`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      id: 4,
      name: 'Crux Youth Series',
      email: 'series@example.com',
      username: 'cruxseries',
      description: '',
      startDate: '2026-06-01T09:00:00',
      endDate: '2026-08-01T09:00:00',
      deadline: '2026-05-25T23:59:00',
      seriesStatus: 'UPCOMING',
      createdAt: '2026-01-01',
    }),
  }));

  await page.route(`${apiBase}/series/me/gyms`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/series/me/competitions`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));

  await page.route(`${apiBase}/series/me/competitor-groups`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([]),
  }));
}

export function sampleGym() {
  return {
    id: 1,
    name: 'Crux Test Gym',
    email: 'gym@example.com',
    phone: '5550100',
    username: 'cruxtestgym',
    createdAt: '2026-01-01',
    address: {
      streetAddress: '123 Wall St',
      apartmentNumber: '',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
    },
  };
}

export function sampleClimber() {
  return {
    id: 2,
    name: 'Avery Climber',
    email: 'avery@example.com',
    phone: '5551234567',
    username: 'avery',
    gender: 'FEMALE',
    dob: '2000-01-01',
    address: {
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
    },
    createdAt: '2026-01-01',
    emergencyName: 'Morgan Helper',
    emergencyPhone: '5559876543',
  };
}

export function sampleDependent() {
  return {
    id: 3,
    name: 'Riley Dependent',
    dob: '2016-01-01',
    gender: 'NONBINARY',
    emergencyName: 'Avery Climber',
    emergencyPhone: '5551234567',
  };
}

export function sampleCompetition() {
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
    routeGradesVisible: true,
    pricingRules: [
      {
        id: 1,
        name: 'Early Bird',
        ruleType: 'GROUP',
        groups: [
          { id: null, name: 'Intermediate', ageRule: null },
          { id: null, name: 'Advanced', ageRule: null },
        ],
        amount: 35,
        priority: 1,
      },
    ],
    selectedGroups: [
      { id: null, name: 'Intermediate', ageRule: null },
      { id: null, name: 'Advanced', ageRule: null },
    ],
    heats: [
      {
        id: 50,
        heatName: 'Morning Heat',
        startTime: '2026-06-01T09:00:00',
        capacity: 40,
        duration: 120,
        groups: [
          { id: null, name: 'Intermediate', ageRule: null },
          { id: null, name: 'Advanced', ageRule: null },
        ],
        divisions: ['MALE', 'FEMALE', 'NONBINARY'],
        divisionsEnabled: true,
      },
    ],
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

export function sampleGymRegistration() {
  return {
    id: 77,
    gymId: 1,
    compId: 10,
    climberId: 2,
    climberName: 'Avery Climber',
    climberDob: '2000-01-01',
    climberEmail: 'avery@example.com',
    competitorGroup: { id: null, name: 'Advanced', ageRule: null },
    division: 'FEMALE',
    heat: {
      id: 50,
      heatName: 'Morning Heat',
      startTime: '2026-06-01T09:00:00',
      capacity: 40,
      duration: 120,
      groups: [{ id: null, name: 'Advanced', ageRule: null }],
      divisions: ['FEMALE'],
      divisionsEnabled: true,
    },
    feeamount: 3500,
    feeCurrency: 'USD',
    paid: true,
    paymentStatus: 'PAID',
  };
}
