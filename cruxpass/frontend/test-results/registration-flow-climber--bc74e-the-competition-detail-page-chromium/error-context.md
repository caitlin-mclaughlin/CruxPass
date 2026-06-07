# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: registration-flow.spec.ts >> climber can open registration from the competition detail page
- Location: e2e/registration-flow.spec.ts:29:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Register for Spring Boulder Bash' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Register for Spring Boulder Bash' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - img "CruxPass Logo" [ref=e7]
      - navigation [ref=e8]:
        - link "Dashboard" [ref=e9] [cursor=pointer]:
          - /url: /
          - img [ref=e10]
          - generic [ref=e13]: Dashboard
        - link "Profile" [ref=e14] [cursor=pointer]:
          - /url: /profile
          - img [ref=e15]
          - generic [ref=e18]: Profile
        - button "Search" [ref=e19] [cursor=pointer]:
          - img [ref=e20]
          - generic [ref=e23]: Search
      - button "Sign out" [ref=e25] [cursor=pointer]:
        - img [ref=e26]
        - generic [ref=e29]: Sign out
  - main [ref=e30]:
    - generic [ref=e31]:
      - generic [ref=e33]:
        - heading "Spring Boulder Bash" [level=1] [ref=e34]
        - generic [ref=e35]:
          - generic [ref=e37]: UPCOMING
          - generic [ref=e38]:
            - img [ref=e39]
            - generic [ref=e41]: 9:00 AM – June 1, 2026
            - img [ref=e42]
            - generic [ref=e45]: Crux Test Gym - 123 Wall St, Denver, CO 80202
      - generic [ref=e47]:
        - button "Register" [active] [ref=e49] [cursor=pointer]
        - tablist "Competition sections" [ref=e51]:
          - tab "Overview" [selected] [ref=e52] [cursor=pointer]
          - tab "Heats" [ref=e53] [cursor=pointer]
          - tab "Routes" [ref=e54] [cursor=pointer]
          - tab "Registrations" [ref=e55] [cursor=pointer]
          - tab "Leaderboard" [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: "Date & Time:"
              - generic [ref=e61]: 9:00 AM – June 1, 2026
            - generic [ref=e62]:
              - generic [ref=e63]: "Registration Deadline:"
              - generic [ref=e64]: 11:59 PM – May 25, 2026
            - generic [ref=e65]:
              - generic [ref=e66]: "Location:"
              - generic [ref=e67]:
                - generic [ref=e68]: 123 Wall St,
                - generic [ref=e69]: Denver, CO 80202
            - generic [ref=e70]:
              - generic [ref=e71]: "Host Gym:"
              - generic [ref=e72]: Crux Test Gym
            - generic [ref=e73]:
              - generic [ref=e74]: "Format:"
              - generic [ref=e75]: Classic Redpoint
            - generic [ref=e76]:
              - generic [ref=e77]: "Type(s):"
              - generic [ref=e78]: Bouldering
          - generic [ref=e79]:
            - heading "Eligible Competitor Groups" [level=2] [ref=e80]
            - generic [ref=e81]: Intermediate, Advanced
          - generic [ref=e82]:
            - heading "Divisions" [level=2] [ref=e83]
            - generic [ref=e84]: Men, Women, Non-Binary
          - generic [ref=e85]:
            - heading "Heat Snapshot" [level=2] [ref=e86]
            - generic [ref=e87]: "1 heat • 120 min each • Total Capacity: 40"
          - generic [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]:
                - heading "Registration Pricing" [level=2] [ref=e91]
                - paragraph [ref=e92]: Competition entry fee structure
              - generic [ref=e94]: Group Based
            - generic [ref=e98]:
              - generic [ref=e99]:
                - generic [ref=e100]: Early Bird
                - generic [ref=e101]: Competitor Groups
                - generic [ref=e102]:
                  - generic [ref=e103]: Intermediate
                  - generic [ref=e104]: Advanced
              - generic [ref=e105]:
                - generic [ref=e106]: Price
                - generic [ref=e107]: $35
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import {
  3   |   apiBase,
  4   |   mockClimberApi,
  5   |   mockClimberCompetitionApi,
  6   |   mockCommonApi,
  7   |   sampleCompetition,
  8   |   seedAuth,
  9   | } from './support/fixtures';
  10  | 
  11  | test.beforeEach(async ({ page }) => {
  12  |   await seedAuth(page, 'CLIMBER');
  13  |   await mockCommonApi(page);
  14  |   await mockClimberApi(page);
  15  |   await mockClimberCompetitionApi(page);
  16  | });
  17  | 
  18  | test('climber registration requires group and division selections', async ({ page }) => {
  19  |   await page.goto('/');
  20  | 
  21  |   await page.getByRole('button', { name: 'Register' }).click();
  22  |   const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  23  |   await expect(dialog).toBeVisible();
  24  |   await dialog.getByRole('button', { name: 'Register for Spring Boulder Bash' }).click();
  25  | 
  26  |   await expect(page.getByText('Please complete all required fields.')).toBeVisible();
  27  | });
  28  | 
  29  | test('climber can open registration from the competition detail page', async ({ page }) => {
  30  |   await page.goto('/competitions/10');
  31  | 
  32  |   await page.getByRole('button', { name: 'Register' }).click();
  33  | 
> 34  |   await expect(page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' })).toBeVisible();
      |                                                                                        ^ Error: expect(locator).toBeVisible() failed
  35  | });
  36  | 
  37  | test('climber registration posts selected group, division, assigned heat, and starts checkout', async ({ page }) => {
  38  |   const registrationRequests: unknown[] = [];
  39  |   const checkoutRequests: unknown[] = [];
  40  |   await page.route(`${apiBase}/competitions/10/registrations/me`, route => {
  41  |     if (route.request().method() === 'PUT') {
  42  |       registrationRequests.push(route.request().postDataJSON());
  43  |       return route.fulfill({
  44  |         contentType: 'application/json',
  45  |         body: JSON.stringify({
  46  |           id: 77,
  47  |           climberId: 2,
  48  |           climberName: 'Avery Climber',
  49  |           climberDob: '2000-01-01',
  50  |           climberEmail: 'avery@example.com',
  51  |           competitorGroup: { id: null, name: 'Intermediate', ageRule: null },
  52  |           division: 'FEMALE',
  53  |           heat: {
  54  |             id: 50,
  55  |             heatName: 'Morning Heat',
  56  |             startTime: '2026-06-01T09:00:00',
  57  |             capacity: 40,
  58  |             duration: 120,
  59  |             groups: [{ id: null, name: 'Intermediate', ageRule: null }],
  60  |             divisions: ['FEMALE'],
  61  |             divisionsEnabled: true,
  62  |           },
  63  |           feeamount: 3500,
  64  |           feeCurrency: 'USD',
  65  |           paid: true,
  66  |           paymentStatus: 'PAID',
  67  |         }),
  68  |       });
  69  |     }
  70  | 
  71  |     return route.fallback();
  72  |   });
  73  | 
  74  |   await page.route(`${apiBase}/stripe/checkout`, route => {
  75  |     checkoutRequests.push(route.request().postDataJSON());
  76  |     return route.fulfill({
  77  |       contentType: 'application/json',
  78  |       body: JSON.stringify({ sessionId: '', sessionUrl: '' }),
  79  |     });
  80  |   });
  81  | 
  82  |   await page.goto('/');
  83  |   await page.getByRole('button', { name: 'Register' }).click();
  84  |   const dialog = page.getByRole('dialog', { name: 'Register for Spring Boulder Bash' });
  85  |   await expect(dialog.getByText('$35').first()).toBeVisible();
  86  |   await dialog.getByText('Intermediate').click();
  87  |   await dialog.getByRole('radio', { name: 'Women' }).click();
  88  |   await expect(dialog.getByText('Morning Heat')).toBeVisible();
  89  |   await dialog.getByRole('button', { name: 'Register for Spring Boulder Bash' }).click();
  90  | 
  91  |   await expect.poll(() => registrationRequests.length).toBe(1);
  92  |   expect(registrationRequests[0]).toMatchObject({
  93  |     id: 2,
  94  |     climberName: 'Avery Climber',
  95  |     email: 'avery@example.com',
  96  |     dob: '2000-01-01',
  97  |     competitorGroup: { name: 'Intermediate' },
  98  |     division: 'FEMALE',
  99  |     heat: { id: 50, heatName: 'Morning Heat' },
  100 |     paid: false,
  101 |   });
  102 |   await expect.poll(() => checkoutRequests.length).toBe(1);
  103 |   expect(checkoutRequests[0]).toMatchObject({
  104 |     registrationId: 77,
  105 |   });
  106 | });
  107 | 
  108 | test('climber can register a dependent when the account owner is already registered', async ({ page }) => {
  109 |   const registrationRequests: unknown[] = [];
  110 | 
  111 |   await page.route(`${apiBase}/climbers/me/competitionIds`, route => route.fulfill({
  112 |     contentType: 'application/json',
  113 |     body: JSON.stringify([10]),
  114 |   }));
  115 | 
  116 |   await page.route(`${apiBase}/competitions/10/registrations`, route => route.fulfill({
  117 |     contentType: 'application/json',
  118 |     body: JSON.stringify([
  119 |       {
  120 |         ...registeredClimber(),
  121 |         climberId: 2,
  122 |         climberName: 'Avery Climber',
  123 |         climberDob: '2000-01-01',
  124 |       },
  125 |     ]),
  126 |   }));
  127 | 
  128 |   await page.route(`${apiBase}/competitions/10/registrations/me`, route => {
  129 |     if (route.request().method() === 'PUT') {
  130 |       registrationRequests.push(route.request().postDataJSON());
  131 |       return route.fulfill({
  132 |         contentType: 'application/json',
  133 |         body: JSON.stringify({
  134 |           ...registeredClimber(),
```