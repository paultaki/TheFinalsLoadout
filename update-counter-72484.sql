-- Update main counter to 72,484
-- Run this in your Supabase SQL editor

UPDATE spin_stats
SET total_count = 72484,
    last_updated = NOW()
WHERE spin_type = 'main';

-- Verify the update
SELECT * FROM spin_stats WHERE spin_type = 'main';