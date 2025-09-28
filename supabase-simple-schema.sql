-- ============================================
-- SIMPLE STATS TRACKING - PRIVACY FOCUSED
-- ============================================

-- 1. SPIN COUNTERS - Just the totals, nothing personal
CREATE TABLE IF NOT EXISTS spin_counters (
  id SERIAL PRIMARY KEY,
  counter_type VARCHAR(20) NOT NULL UNIQUE, -- 'loadout' or 'ragequit'
  total_count BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DAILY STATS - For trends, no user data
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  counter_type VARCHAR(20) NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(date, counter_type)
);

-- 3. OVERLAY SESSIONS - Anonymous tracking
CREATE TABLE IF NOT EXISTS overlay_sessions (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- SIMPLE RPC FUNCTIONS
-- ============================================

-- Increment counter (batched from client)
CREATE OR REPLACE FUNCTION increment_counter(
  p_type VARCHAR,
  p_amount INT DEFAULT 1
) RETURNS BIGINT AS $$
DECLARE
  v_new_total BIGINT;
BEGIN
  -- Update main counter
  INSERT INTO spin_counters (counter_type, total_count)
  VALUES (p_type, p_amount)
  ON CONFLICT (counter_type)
  DO UPDATE SET
    total_count = spin_counters.total_count + p_amount,
    updated_at = NOW()
  RETURNING total_count INTO v_new_total;

  -- Update daily stats
  INSERT INTO daily_stats (date, counter_type, count)
  VALUES (CURRENT_DATE, p_type, p_amount)
  ON CONFLICT (date, counter_type)
  DO UPDATE SET count = daily_stats.count + p_amount;

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql;

-- Get current counts
CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE (
  counter_type VARCHAR,
  total_count BIGINT,
  today_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.counter_type,
    c.total_count,
    COALESCE(d.count, 0) as today_count
  FROM spin_counters c
  LEFT JOIN daily_stats d ON d.counter_type = c.counter_type
    AND d.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Start overlay session
CREATE OR REPLACE FUNCTION overlay_start()
RETURNS INTEGER AS $$
DECLARE
  v_session_id INTEGER;
BEGIN
  INSERT INTO overlay_sessions (is_active)
  VALUES (true)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Overlay heartbeat
CREATE OR REPLACE FUNCTION overlay_heartbeat(p_session_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE overlay_sessions
  SET last_heartbeat = NOW()
  WHERE id = p_session_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- End overlay session
CREATE OR REPLACE FUNCTION overlay_end(p_session_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE overlay_sessions
  SET is_active = false
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Get active overlay count
CREATE OR REPLACE FUNCTION get_active_overlays()
RETURNS INTEGER AS $$
BEGIN
  -- Clean up stale sessions (no heartbeat for 10 minutes)
  UPDATE overlay_sessions
  SET is_active = false
  WHERE is_active = true
    AND last_heartbeat < NOW() - INTERVAL '10 minutes';

  -- Return count
  RETURN (SELECT COUNT(*)::INTEGER FROM overlay_sessions WHERE is_active = true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

INSERT INTO spin_counters (counter_type, total_count)
VALUES
  ('loadout', 0),
  ('ragequit', 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- SECURITY - Allow anonymous access
-- ============================================

ALTER TABLE spin_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats
CREATE POLICY "Public read" ON spin_counters FOR SELECT USING (true);
CREATE POLICY "Public read" ON daily_stats FOR SELECT USING (true);

-- Only functions can modify (no direct access)
CREATE POLICY "No direct insert" ON spin_counters FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON spin_counters FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON spin_counters FOR DELETE USING (false);