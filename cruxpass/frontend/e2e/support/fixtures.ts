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
    pricingRules: [
      {
        id: 1,
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
