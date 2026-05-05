import { expect, test } from '@playwright/test';
import { apiBase, makeJwt, mockCommonApi, mockGymApi } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await mockCommonApi(page);
});

test('protected competition editor redirects anonymous users to login', async ({ page }) => {
  await page.goto('/competitions/new');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('login form shows validation for empty submit', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page.getByText('Please fill out all required fields.')).toBeVisible();
});

test('create account form validates password confirmation', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: /create one/i }).click();
  await page.getByRole('button', { name: 'Climber' }).click();
  await page.getByText('Series Organizer').click();

  await page.getByPlaceholder('Series Name').fill('Crux Series');
  await page.getByPlaceholder('Email').fill('avery@example.com');
  await page.getByPlaceholder('Password', { exact: true }).fill('password-one');
  await page.getByPlaceholder('Confirm Password').fill('password-two');

  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('skip login opens the public dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Skip login' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: 'Upcoming Competitions' })).toBeVisible();
});

test('successful gym login stores auth state and opens dashboard', async ({ page }) => {
  await mockGymApi(page);
  await page.route(`${apiBase}/auth/login`, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ token: makeJwt('GYM') }),
  }));

  await page.goto('/login');
  await page.getByPlaceholder('Email or Username').fill('gym@example.com');
  await page.getByPlaceholder('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.evaluate(() => window.localStorage.getItem('accountType'))).resolves.toBe('GYM');
  await expect(page.getByRole('button', { name: 'Upcoming Competitions' })).toBeVisible();
});

test('login displays backend error messages', async ({ page }) => {
  await page.route(`${apiBase}/auth/login`, route => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Invalid credentials' }),
  }));

  await page.goto('/login');
  await page.getByPlaceholder('Email or Username').fill('wrong@example.com');
  await page.getByPlaceholder('Password', { exact: true }).fill('bad-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
