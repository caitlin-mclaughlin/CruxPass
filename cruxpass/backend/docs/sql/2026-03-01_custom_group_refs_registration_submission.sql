-- Draft migration: support custom competitor groups in registrations/submissions
-- Mirrors the existing GroupRef pattern used by competition_selected_groups / heat_groups.
--
-- IMPORTANT:
-- 1) Validate table/column names in your DB before running (Hibernate naming strategy may differ).
-- 2) Run in a transaction on staging first.
-- 3) Keep old enum columns until app code is fully switched.

BEGIN;

-- ---------------------------------------------------------------------------
-- PHASE 1: Add new group-ref columns + heat assignment on registration
-- ---------------------------------------------------------------------------

ALTER TABLE registration
  ADD COLUMN IF NOT EXISTS competitor_group_type VARCHAR(16),
  ADD COLUMN IF NOT EXISTS competitor_group_default_key VARCHAR(64),
  ADD COLUMN IF NOT EXISTS competitor_group_custom_id BIGINT,
  ADD COLUMN IF NOT EXISTS heat_id BIGINT;

ALTER TABLE registration
  ADD CONSTRAINT fk_registration_custom_group
  FOREIGN KEY (competitor_group_custom_id) REFERENCES competitor_group(id);

ALTER TABLE registration
  ADD CONSTRAINT fk_registration_heat
  FOREIGN KEY (heat_id) REFERENCES heat(id);

-- Backfill existing enum registrations as DEFAULT group refs.
-- Old column assumed: registration.competitor_group (enum-as-text).
UPDATE registration
SET competitor_group_type = 'DEFAULT',
    competitor_group_default_key = competitor_group
WHERE competitor_group_type IS NULL;

-- Backfill heat_id by matching first chronological heat in same competition
-- that contains the registered default group and allows division.
-- Assumed tables:
--   heat(id, competition_id, start_time, divisions_enabled, ...)
--   heat_groups(heat_id, type, default_key, custom_group_id)
--   heat_divisions(heat_id, divisions)
WITH match_heat AS (
  SELECT r.id AS registration_id, h.id AS heat_id
  FROM registration r
  JOIN LATERAL (
    SELECT h.id
    FROM heat h
    JOIN heat_groups hg
      ON hg.heat_id = h.id
    WHERE h.competition_id = r.competition_id
      AND hg.type = 'DEFAULT'
      AND hg.default_key = r.competitor_group
      AND (
        h.divisions_enabled = false
        OR NOT EXISTS (
          SELECT 1
          FROM heat_divisions hd0
          WHERE hd0.heat_id = h.id
        )
        OR EXISTS (
          SELECT 1
          FROM heat_divisions hd
          WHERE hd.heat_id = h.id
            AND hd.divisions = r.division
        )
      )
    ORDER BY h.start_time ASC, h.id ASC
    LIMIT 1
  ) h ON TRUE
)
UPDATE registration r
SET heat_id = mh.heat_id
FROM match_heat mh
WHERE r.id = mh.registration_id
  AND r.heat_id IS NULL;

-- ---------------------------------------------------------------------------
-- PHASE 2: Add group-ref + registration linkage on submission
-- ---------------------------------------------------------------------------

ALTER TABLE submission
  ADD COLUMN IF NOT EXISTS competitor_group_type VARCHAR(16),
  ADD COLUMN IF NOT EXISTS competitor_group_default_key VARCHAR(64),
  ADD COLUMN IF NOT EXISTS competitor_group_custom_id BIGINT,
  ADD COLUMN IF NOT EXISTS registration_id BIGINT;

ALTER TABLE submission
  ADD CONSTRAINT fk_submission_custom_group
  FOREIGN KEY (competitor_group_custom_id) REFERENCES competitor_group(id);

ALTER TABLE submission
  ADD CONSTRAINT fk_submission_registration
  FOREIGN KEY (registration_id) REFERENCES registration(id);

-- Backfill submission group refs from old enum column.
UPDATE submission
SET competitor_group_type = 'DEFAULT',
    competitor_group_default_key = competitor_group
WHERE competitor_group_type IS NULL;

-- Backfill submission.registration_id via competition+climber unique relation.
UPDATE submission s
SET registration_id = r.id
FROM registration r
WHERE s.registration_id IS NULL
  AND r.competition_id = s.competition_id
  AND r.climber_id = s.climber_id;

-- ---------------------------------------------------------------------------
-- PHASE 3: Add integrity constraints + indexes
-- ---------------------------------------------------------------------------

ALTER TABLE registration
  ADD CONSTRAINT ck_registration_group_ref
  CHECK (
    (competitor_group_type = 'DEFAULT' AND competitor_group_default_key IS NOT NULL AND competitor_group_custom_id IS NULL)
    OR
    (competitor_group_type = 'CUSTOM' AND competitor_group_custom_id IS NOT NULL AND competitor_group_default_key IS NULL)
  );

ALTER TABLE submission
  ADD CONSTRAINT ck_submission_group_ref
  CHECK (
    (competitor_group_type = 'DEFAULT' AND competitor_group_default_key IS NOT NULL AND competitor_group_custom_id IS NULL)
    OR
    (competitor_group_type = 'CUSTOM' AND competitor_group_custom_id IS NOT NULL AND competitor_group_default_key IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_registration_comp_group_div
  ON registration (competition_id, competitor_group_type, competitor_group_default_key, competitor_group_custom_id, division);

CREATE INDEX IF NOT EXISTS idx_submission_comp_group_div
  ON submission (competition_id, competitor_group_type, competitor_group_default_key, competitor_group_custom_id, division);

CREATE INDEX IF NOT EXISTS idx_submission_registration
  ON submission (registration_id);

-- ---------------------------------------------------------------------------
-- PHASE 4: Series leaderboard group refs (DEFAULT + CUSTOM)
-- ---------------------------------------------------------------------------

ALTER TABLE series_leaderboard_entry
  ADD COLUMN IF NOT EXISTS competitor_group_type VARCHAR(16),
  ADD COLUMN IF NOT EXISTS competitor_group_default_key VARCHAR(64),
  ADD COLUMN IF NOT EXISTS competitor_group_custom_id BIGINT;

ALTER TABLE series_leaderboard_entry
  ADD CONSTRAINT fk_series_leaderboard_entry_custom_group
  FOREIGN KEY (competitor_group_custom_id) REFERENCES competitor_group(id);

-- Backfill from legacy enum column.
UPDATE series_leaderboard_entry
SET competitor_group_type = 'DEFAULT',
    competitor_group_default_key = competitor_group
WHERE competitor_group_type IS NULL;

ALTER TABLE series_leaderboard_entry
  ADD CONSTRAINT ck_series_leaderboard_entry_group_ref
  CHECK (
    (competitor_group_type = 'DEFAULT' AND competitor_group_default_key IS NOT NULL AND competitor_group_custom_id IS NULL)
    OR
    (competitor_group_type = 'CUSTOM' AND competitor_group_custom_id IS NOT NULL AND competitor_group_default_key IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_series_leaderboard_group_div
  ON series_leaderboard_entry (
    series_id,
    competitor_group_type,
    competitor_group_default_key,
    competitor_group_custom_id,
    division,
    rank
  );

-- Optional hardening after app switch:
-- ALTER TABLE registration ALTER COLUMN competitor_group_type SET NOT NULL;
-- ALTER TABLE registration ALTER COLUMN heat_id SET NOT NULL;
-- ALTER TABLE submission ALTER COLUMN competitor_group_type SET NOT NULL;
-- ALTER TABLE submission ALTER COLUMN registration_id SET NOT NULL;
-- ALTER TABLE series_leaderboard_entry ALTER COLUMN competitor_group_type SET NOT NULL;

-- Optional cleanup after app fully migrated:
-- ALTER TABLE registration DROP COLUMN competitor_group;
-- ALTER TABLE submission DROP COLUMN competitor_group;
-- ALTER TABLE series_leaderboard_entry DROP COLUMN competitor_group;

COMMIT;
