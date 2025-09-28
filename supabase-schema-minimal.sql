-- ============================================
-- THE FINALS LOADOUT - MINIMAL STATS SCHEMA
-- ============================================
-- Just the essentials for tracking spins

-- Drop existing objects if they exist (clean slate)
DROP TABLE IF EXISTS spin_stats CASCADE;
DROP FUNCTION IF EXISTS increment_spin_count CASCADE;
DROP FUNCTION IF EXISTS get_current_stats CASCADE;

-- Main stats table for spin tracking
CREATE TABLE spin_stats (
  spin_type VARCHAR(50) PRIMARY KEY, -- 'main' or 'ragequit'
  total_count BIGINT DEFAULT 0,
  daily_count BIGINT DEFAULT 0,
  weekly_count BIGINT DEFAULT 0,
  monthly_count BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spin_stats ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON spin_stats
  FOR SELECT USING (true);

-- Function to increment spin count
CREATE OR REPLACE FUNCTION increment_spin_count(
  p_spin_type VARCHAR,
  p_count INT DEFAULT 1
) RETURNS void AS $$
BEGIN
  INSERT INTO spin_stats (spin_type, total_count, daily_count, weekly_count, monthly_count)
  VALUES (p_spin_type, p_count, p_count, p_count, p_count)
  ON CONFLICT (spin_type)
  DO UPDATE SET
    total_count = spin_stats.total_count + p_count,
    daily_count = spin_stats.daily_count + p_count,
    weekly_count = spin_stats.weekly_count + p_count,
    monthly_count = spin_stats.monthly_count + p_count,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get current stats
CREATE OR REPLACE FUNCTION get_current_stats()
RETURNS TABLE (
  spin_type VARCHAR,
  total_count BIGINT,
  daily_count BIGINT,
  weekly_count BIGINT,
  monthly_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.spin_type,
    s.total_count,
    s.daily_count,
    s.weekly_count,
    s.monthly_count
  FROM spin_stats s;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_spin_count TO anon;
GRANT EXECUTE ON FUNCTION get_current_stats TO anon;
GRANT SELECT ON spin_stats TO anon;

-- Initialize records
INSERT INTO spin_stats (spin_type) VALUES ('main'), ('ragequit')
ON CONFLICT DO NOTHING;