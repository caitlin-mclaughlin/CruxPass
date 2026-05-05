# Custom Group Migration Draft (Registration + Submission + Series Leaderboard)

This draft aligns `registration` and `submission` group handling with the pattern already used in:

- `Competition.selectedGroups` -> `Set<GroupRefEmbeddable>`
- `Heat.groups` -> `Set<GroupRefEmbeddable>`

References:

- [Competition.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/models/Competition.java)
- [Heat.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/models/Heat.java)
- [GroupRefEmbeddable.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/models/GroupRefs/GroupRefEmbeddable.java)

---

## 1) SQL migration draft

Use:

- [2026-03-01_custom_group_refs_registration_submission.sql](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/docs/sql/2026-03-01_custom_group_refs_registration_submission.sql)

It introduces:

- `registration.competitor_group_type/default_key/custom_id`
- `registration.heat_id` FK
- `submission.competitor_group_type/default_key/custom_id`
- `submission.registration_id` FK
- `series_leaderboard_entry.competitor_group_type/default_key/custom_id`
- backfill for old enum values
- check constraints and indexes

---

## 2) JPA model target shape

### Registration

Current:

- `DefaultCompetitorGroup competitorGroup`
- `Division division`

Target:

- `GroupRefEmbeddable competitorGroupRef` (embedded)
- `Division division`
- `Heat heat` (`@ManyToOne`)

Suggested field sketch:

```java
@Embedded
private GroupRefEmbeddable competitorGroupRef;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "heat_id", nullable = false)
private Heat heat;
```

### Submission

Current:

- `DefaultCompetitorGroup competitorGroup`
- `Division division`

Target:

- `GroupRefEmbeddable competitorGroupRef` (embedded)
- `Division division`
- `Registration registration` (`@ManyToOne`)

Suggested field sketch:

```java
@Embedded
private GroupRefEmbeddable competitorGroupRef;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "registration_id", nullable = false)
private Registration registration;
```

If you keep `competition_id + climber_id` uniqueness, keep it in `submission` table while transitioning.

---

## 3) DTO contract target

You already moved frontend DTOs to `ResolvedCompetitorGroup` for registration and ranking payloads.

Backend should keep:

- request: `CompRegistrationRequestDto.competitorGroup: ResolvedCompetitorGroup`, `heat: ResolvedHeatDto`
- response: registration DTOs include `ResolvedCompetitorGroup` + `ResolvedHeatDto`
- ranking/live DTOs emit `ResolvedCompetitorGroup`

Already started in:

- [CompRegistrationRequestDto.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/dtos/requests/CompRegistrationRequestDto.java)
- [RegistrationResponseDto.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/dtos/responses/RegistrationResponseDto.java)
- [RankedSubmissionDto.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/dtos/RankedSubmissionDto.java)
- [LiveSubmissionEventDto.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/dtos/LiveSubmissionEventDto.java)

---

## 4) Repository changes to plan

Current repositories query by enum group.

### SubmissionRepository

Current:

- `findByCompetitionIdAndGroupAndDivision(Long competitionId, DefaultCompetitorGroup group, Division division)`

Target options:

1. Query by `registration.id` + `division` (preferred source of truth).
2. Query by embedded group ref fields:
   - `competitor_group_type`
   - `competitor_group_default_key` or `competitor_group_custom_id`

### RegistrationRepository

Add helpers for:

- `(competitionId, climberId)` with `heat` eagerly fetched when needed
- group-ref aware filtering for organizer views

---

## 5) Service-layer control logic

To support custom groups correctly:

1. On registration create/update:
   - validate incoming group belongs to competition (selected or heat-assigned)
   - validate heat belongs to competition
   - validate heat includes group ref
   - validate division eligibility against heat
2. Persist explicit `registration.heat`.
3. On submission:
   - derive group/division from registration (or enforce exact match if sent by client)

This removes ambiguity and keeps scoring/leaderboards consistent with assigned heat.

---

## 6) Series leaderboard impact

`SeriesLeaderboardEntry` should store group refs with the same DEFAULT/CUSTOM model:

- `competitor_group_type`
- `competitor_group_default_key`
- `competitor_group_custom_id`

Mapped in JPA as `GroupRefEmbeddable`:

- [SeriesLeaderboardEntry.java](/home/caitlin-mclaugh/CruxPass/cruxpass/backend/src/main/java/com/cruxpass/models/SeriesLeaderboardEntry.java)
