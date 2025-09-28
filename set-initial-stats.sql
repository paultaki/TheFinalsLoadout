-- Set initial counter values for The Finals Loadout stats
-- Run this in your Supabase SQL editor

-- Set initial values for spin stats (using your existing schema)
-- Main loadout: Starting at 52,847
-- Rage quit: Starting at 9,183

INSERT INTO spin_stats (spin_type, total_count, daily_count, weekly_count, monthly_count, last_updated)
VALUES
  ('main', 52847, 0, 0, 0, NOW()),
  ('ragequit', 9183, 0, 0, 0, NOW())
ON CONFLICT (spin_type)
DO UPDATE SET
  total_count = EXCLUDED.total_count,
  last_updated = NOW();

-- Verify the values were set
SELECT * FROM spin_stats;