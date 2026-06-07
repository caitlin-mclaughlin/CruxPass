# Test Summary

Update this file every time a test is added, removed, renamed, or materially changed.

## Frontend Playwright E2E

### Authorization: `frontend/e2e/auth.spec.ts`
- `protected competition editor redirects anonymous users to login`: verifies protected competition creation sends anonymous users to login.
- `login form shows validation for empty submit`: verifies the login form reports missing username/password.
- `create account form validates password confirmation`: verifies mismatched signup passwords are rejected.
- `climber account creation shows required field validation`: verifies empty climber signup shows required-field validation.
- `series account creation posts to the series register endpoint`: verifies series signup sends the expected registration payload.
- `gym account creation posts address information to the gym register endpoint`: verifies gym signup includes address fields in the payload.
- `skip login opens the public dashboard`: verifies public users can continue without logging in.
- `successful gym login stores auth state and opens dashboard`: verifies successful gym login stores auth state and navigates home.
- `login displays backend error messages`: verifies backend login failures are shown to the user.

### Competition Editor: `frontend/e2e/competition-editor-edge.spec.ts`
- `empty create competition submit surfaces required-section errors`: verifies an empty competition draft shows required-section errors.
- `custom competitor group modal validates ranges and adds the group to the draft`: verifies custom group age validation and draft selection.
- `age pricing rule previews bounded and unbounded age ranges`: verifies age pricing helper text updates for min/max combinations.
- `heat editor enables selected groups and warns when selected groups are unused`: verifies selected groups must be assigned to heats.

### Dashboard: `frontend/e2e/dashboard.spec.ts`
- `dashboard renders upcoming competitions returned by the API`: verifies competitions from the API render on the dashboard.
- `dashboard can switch to the series tab`: verifies the dashboard tab switcher activates the series view.

### Competition Page (Gym View) `frontend/e2e/gym-competition-management.spec.ts`
- `gym competition page renders overview, heats, and registrations from API data`: verifies gym competition details, heats, and registrations render.
- `edit routes modal validates missing point values before saving`: verifies route creation requires point values.
- `edit routes modal submits route point values`: verifies saved routes send the expected route payload.

### `frontend/e2e/pricing-editor.spec.ts`
- `group pricing rules allow multiple groups in one rule`: verifies one pricing rule can apply to multiple competitor groups.

### `frontend/e2e/profile-dependents.spec.ts`
- `climber profile renders dependents and delete confirmation`: verifies dependents render and deletion asks for confirmation.
- `add dependent modal validates required fields`: verifies empty dependent creation shows validation.
- `add dependent modal posts the completed dependent profile`: verifies dependent creation sends the expected payload.

### `frontend/e2e/public-competitions.spec.ts`
- `public competitions page loads the frontend app`: verifies the public competitions page loads.

### `frontend/e2e/registration-flow.spec.ts`
- `climber registration requires group and division selections`: verifies climber registration requires required choices.
- `climber registration posts selected group, division, and assigned heat`: verifies registration sends selected group/division/heat data.

## Backend Tests

### `backend/src/test/java/com/cruxpass/controllers/PublicCompetitionControllerFunctionalTest.java`
- `getAllCompetitionsReturnsResolvedCompetitions`: verifies public competition listing returns resolved competition DTOs.
- `getCompetitionByIdDelegatesToPublicLookup`: verifies public competition detail lookup delegates to the service and returns DTO fields.

### `backend/src/test/java/com/cruxpass/mappers/CompetitionMapperTest.java`
- `toDtoMapsPricingRuleGroups`: verifies competition DTO mapping preserves multiple groups on pricing rules.

### `backend/src/test/java/com/cruxpass/mappers/ResolvedCompetitorGroupMapperTest.java`
- `toEmbeddableMapsCustomResolvedGroupById`: verifies custom resolved groups map to custom embeddable refs.
- `toEmbeddableMapsDefaultResolvedGroupByDisplayLabel`: verifies default display labels map to default embeddable refs.
- `toTopicTokenUsesStableDefaultAndCustomTokens`: verifies stable topic tokens for default, custom, and unknown group refs.

### `backend/src/test/java/com/cruxpass/services/CompetitionPricingServiceTest.java`
- `quoteForGroupPricingMatchesAnyGroupInRule`: verifies group pricing matches any group included in a rule.
- `quoteForGroupPricingUsesHighestPriorityMatchingRule`: verifies lower priority numbers win when multiple rules match.
- `quoteForGroupPricingThrowsWhenNoRuleIncludesSelectedGroup`: verifies missing group pricing rules fail clearly.
- `quoteForAgePricingStillMatchesAgeRules`: verifies age-based pricing still matches climber age rules.

### `backend/src/test/java/com/cruxpass/utils/SeriesLeaderboardUtilsTest.java`
- `assignRanksSortsBySeriesPointsThenRawPointsThenAttempts`: verifies series leaderboard ranking tie-breakers.
- `assignRanksGivesSameRankWhenComparatorCannotSeparateEntries`: verifies indistinguishable leaderboard entries share a rank.

### `backend/src/integrationTest/java/com/cruxpass/repositories/PricingRuleRepositoryIntegrationTest.java`
- `persistsPricingRuleWithMultipleGroups`: verifies Postgres/JPA persistence for pricing rules with multiple groups.

### `backend/src/integrationTest/java/com/cruxpass/support/PostgresIntegrationTest.java`
- Base Testcontainers configuration shared by Postgres-backed integration tests; not a standalone test case.
