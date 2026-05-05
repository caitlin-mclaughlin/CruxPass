# Custom Group API Smoke Checklist

This validates the migration + API behavior for:
- registration group refs (`DEFAULT` and `CUSTOM`)
- submission inheriting group/division from registration
- series leaderboard filtering by group ref

## 0) Preconditions

- Backend is running and reachable (default `http://localhost:8080`).
- You have:
  - one `SERIES` account token
  - one `CLIMBER` account token
  - a competition (`COMP_ID`) that is in `LIVE` status for submission tests
  - at least one route in that competition

Set env vars:

```bash
export API=http://localhost:8080
export SERIES_TOKEN='Bearer <series-jwt>'
export CLIMBER_TOKEN='Bearer <climber-jwt>'
export SERIES_ID=<series-id>
export COMP_ID=<competition-id>
export ROUTE_ID=<route-id>
```

## 1) Fetch competition and identify usable heat/group

```bash
curl -s "$API/api/competitions/$COMP_ID" \
  -H "Authorization: $CLIMBER_TOKEN" | jq .
```

Pick a heat + group from `.heats[].groups[]` and export:

```bash
export HEAT_ID=<heat-id>
export GROUP_ID=<custom-group-id-or-empty>
export GROUP_NAME='<group display name>'
export DIVISION='<division enum>'
```

Notes:
- For default groups, use `GROUP_ID=null` and `GROUP_NAME` equal to default label/name.
- For custom groups, `GROUP_ID` must be a real group id from response.

## 2) Register climber for the selected heat/group

```bash
cat > /tmp/reg.json <<JSON
{
  "climberName": "Smoke Climber",
  "email": "smoke.climber@example.com",
  "dob": "2005-01-01",
  "competitorGroup": {
    "id": ${GROUP_ID:-null},
    "name": "$GROUP_NAME",
    "ageRule": { "minAge": null, "maxAge": null }
  },
  "division": "$DIVISION",
  "heat": { "id": $HEAT_ID },
  "paid": true
}
JSON

curl -s -X PUT "$API/api/competitions/$COMP_ID/registrations/me" \
  -H "Authorization: $CLIMBER_TOKEN" \
  -H "Content-Type: application/json" \
  --data @/tmp/reg.json | jq .
```

Expected:
- `200 OK`
- response includes non-null `competitorGroup` and `heat.id == HEAT_ID`

## 3) Verify registration via read endpoint

```bash
curl -s "$API/api/competitions/$COMP_ID/registrations/me" \
  -H "Authorization: $CLIMBER_TOKEN" | jq .
```

Expected:
- returned `competitorGroup` matches selected group
- returned `heat.id` matches selected heat

## 4) Submit scores (submission should inherit registration group/division)

`SubmissionRequestDto` now only includes `routes`; group/division are always derived from registration.

```bash
cat > /tmp/submission.json <<JSON
{
  "routes": [
    { "routeId": $ROUTE_ID, "attempts": 1, "send": true }
  ]
}
JSON

curl -s -X PUT "$API/api/competitions/$COMP_ID/submissions/me" \
  -H "Authorization: $CLIMBER_TOKEN" \
  -H "Content-Type: application/json" \
  --data @/tmp/submission.json | jq .
```

Expected:
- `200 OK`
- submission saved/updated
- group/division on submission derived from registration (not request body)

## 5) Validate series custom group support

### 5a) List series competitor groups

```bash
curl -s "$API/api/series/me/competitor-groups" \
  -H "Authorization: $SERIES_TOKEN" | jq .
```

### 5b) Series leaderboard by default group

```bash
curl -s "$API/api/series/$SERIES_ID/leaderboard?groupType=DEFAULT&group=OPEN&division=$DIVISION" \
  -H "Authorization: $SERIES_TOKEN" | jq .
```

Expected entries shape includes:
- `group` object (`id/name/ageRule`)
- `climberName`, `rank`, `results`

### 5c) Series leaderboard by custom group

```bash
export CUSTOM_GROUP_ID=<series-custom-group-id>

curl -s "$API/api/series/$SERIES_ID/leaderboard?groupType=CUSTOM&customGroupId=$CUSTOM_GROUP_ID&division=$DIVISION" \
  -H "Authorization: $SERIES_TOKEN" | jq .
```

Expected:
- `200 OK`
- each entry `group.id == CUSTOM_GROUP_ID`

## 6) Optional DB assertions

Run these where DB is reachable:

```sql
-- registration migrated refs + heat
SELECT id, competition_id, climber_id,
       competitor_group_type, competitor_group_default_key, competitor_group_custom_id,
       division, heat_id
FROM registration
WHERE competition_id = :comp_id;

-- submission inherits registration refs
SELECT s.id, s.competition_id, s.climber_id,
       s.competitor_group_type, s.competitor_group_default_key, s.competitor_group_custom_id,
       s.division, s.registration_id
FROM submission s
WHERE s.competition_id = :comp_id;

-- series leaderboard refs
SELECT id, series_id, climber_id,
       competitor_group_type, competitor_group_default_key, competitor_group_custom_id,
       division, rank
FROM series_leaderboard_entry
WHERE series_id = :series_id
ORDER BY rank;
```

## Known quirk

`GET /api/competitions/{compId}/submissions/{id}/rankings` currently uses `{id}` as the competition id internally. Use:
- `{id} == {compId}`
- or rely on series leaderboard endpoint for grouped validation.
