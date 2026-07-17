-- Run this in the Supabase SQL editor if your dogs.source column has a
-- CHECK constraint that doesn't include '24petconnect'.
--
-- To check whether a constraint exists:
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'dogs'::regclass;
--
-- If you see a source_check constraint, run the ALTER TABLE below:

ALTER TABLE dogs
  DROP CONSTRAINT IF EXISTS dogs_source_check;

ALTER TABLE dogs
  ADD CONSTRAINT dogs_source_check
    CHECK (source IN ('manual', 'rescuegroups', 'shelterluv', '24petconnect'));
