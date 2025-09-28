-- Set initial counter values for The Finals Loadout stats
-- Run this in your Supabase SQL editor

-- Set initial values for spin counters
-- Main loadout: Starting at 52,847 (more realistic than round 50,000)
-- Rage quit: Starting at 9,183 (more realistic than round 9,000)

INSERT INTO spin_counters (counter_type, total_count, last_updated)
VALUES
  ('loadout', 52847, NOW()),
  ('ragequit', 9183, NOW())
ON CONFLICT (counter_type)
DO UPDATE SET
  total_count = EXCLUDED.total_count,
  last_updated = NOW();

-- Verify the values were set
SELECT * FROM spin_counters;