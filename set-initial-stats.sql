-- Set initial counter values for The Finals Loadout stats
-- Run this in your Supabase SQL editor

-- Set initial values for spin counters
-- Main loadout: Starting at 50,000 (assuming ~1.5 spins per page view)
-- Rage quit: Starting at 9,000 (3,000 views × 3 average spins)

INSERT INTO spin_counters (counter_type, total_count, last_updated)
VALUES
  ('loadout', 50000, NOW()),
  ('ragequit', 9000, NOW())
ON CONFLICT (counter_type)
DO UPDATE SET
  total_count = EXCLUDED.total_count,
  last_updated = NOW();

-- Verify the values were set
SELECT * FROM spin_counters;