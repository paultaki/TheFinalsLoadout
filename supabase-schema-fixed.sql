-- ============================================
-- THE FINALS LOADOUT - STATS TRACKING SCHEMA
-- ============================================
-- Comprehensive tracking for spins, overlay usage, and analytics

-- ============================================
-- CORE TABLES
-- ============================================

-- Main stats table for spin tracking
CREATE TABLE IF NOT EXISTS spin_stats (
  spin_type VARCHAR(50) PRIMARY KEY, -- 'main' or 'ragequit'
  total_count BIGINT DEFAULT 0,
  daily_count BIGINT DEFAULT 0,
  weekly_count BIGINT DEFAULT 0,
  monthly_count BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Event log for individual spins (optional detail tracking)
CREATE TABLE IF NOT EXISTS spin_events (
  id BIGSERIAL PRIMARY KEY,
  spin_type VARCHAR(50) NOT NULL,
  items_data JSONB, -- Store the actual items generated
  client_id VARCHAR(255), -- Anonymous session identifier
  ip_hash VARCHAR(64), -- Hashed IP for rate limiting
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overlay session tracking
CREATE TABLE IF NOT EXISTS overlay_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  total_duration_seconds INT,
  viewer_count INT DEFAULT 0,
  streamer_id VARCHAR(255), -- Optional, for claimed overlays
  streamer_platform VARCHAR(50) -- 'twitch', 'youtube', etc.
);

-- Streamer profiles for featured/verified streamers
CREATE TABLE IF NOT EXISTS streamer_stats (
  id BIGSERIAL PRIMARY KEY,
  streamer_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  platform VARCHAR(50),
  total_overlay_time_hours DECIMAL(10,2) DEFAULT 0,
  total_spins_generated BIGINT DEFAULT 0,
  last_seen TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hourly aggregated stats for analytics
CREATE TABLE IF NOT EXISTS hourly_stats (
  hour_timestamp TIMESTAMPTZ PRIMARY KEY,
  spin_type VARCHAR(50) NOT NULL,
  spin_count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  active_overlays INT DEFAULT 0
);

-- Popular items tracking
CREATE TABLE IF NOT EXISTS popular_items (
  id BIGSERIAL PRIMARY KEY,
  item_type VARCHAR(50), -- 'weapon', 'gadget', 'specialization'
  item_name VARCHAR(255),
  selection_count BIGINT DEFAULT 1,
  last_selected TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_type, item_name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_spin_events_created ON spin_events(created_at DESC);
CREATE INDEX idx_spin_events_type ON spin_events(spin_type);
CREATE INDEX idx_overlay_sessions_active ON overlay_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_overlay_sessions_streamer ON overlay_sessions(streamer_id);
CREATE INDEX idx_hourly_stats_lookup ON hourly_stats(hour_timestamp DESC, spin_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE spin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streamer_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_items ENABLE ROW LEVEL SECURITY;

-- Public read access for stats
CREATE POLICY "Public read access for spin_stats" ON spin_stats
  FOR SELECT USING (true);

CREATE POLICY "Public read access for hourly_stats" ON hourly_stats
  FOR SELECT USING (true);

CREATE POLICY "Public read access for popular_items" ON popular_items
  FOR SELECT USING (true);

CREATE POLICY "Public read access for featured streamers" ON streamer_stats
  FOR SELECT USING (is_featured = true);

-- ============================================
-- FUNCTIONS / STORED PROCEDURES
-- ============================================

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

-- Function to record spin event with details
CREATE OR REPLACE FUNCTION record_spin_event(
  p_spin_type VARCHAR,
  p_items JSONB DEFAULT NULL,
  p_client_id VARCHAR DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO spin_events (spin_type, items_data, client_id, ip_hash)
  VALUES (p_spin_type, p_items, p_client_id, NULL);

  -- Also increment the counter
  PERFORM increment_spin_count(p_spin_type, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to start overlay session (FIXED)
CREATE OR REPLACE FUNCTION start_overlay_session(
  p_session_id VARCHAR,
  p_streamer_id VARCHAR DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO overlay_sessions (session_id, streamer_id, started_at, last_heartbeat, is_active)
  VALUES (p_session_id, p_streamer_id, NOW(), NOW(), true)
  ON CONFLICT (session_id)
  DO UPDATE SET
    last_heartbeat = NOW(),
    is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update overlay heartbeat
CREATE OR REPLACE FUNCTION update_overlay_heartbeat(
  p_session_id VARCHAR
) RETURNS void AS $$
BEGIN
  UPDATE overlay_sessions
  SET last_heartbeat = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end overlay session
CREATE OR REPLACE FUNCTION end_overlay_session(
  p_session_id VARCHAR
) RETURNS void AS $$
BEGIN
  UPDATE overlay_sessions
  SET
    ended_at = NOW(),
    is_active = false,
    total_duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get current stats
CREATE OR REPLACE FUNCTION get_current_stats()
RETURNS TABLE (
  spin_type VARCHAR,
  total_count BIGINT,
  daily_count BIGINT,
  weekly_count BIGINT,
  monthly_count BIGINT,
  active_overlays BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.spin_type,
    s.total_count,
    s.daily_count,
    s.weekly_count,
    s.monthly_count,
    (SELECT COUNT(*) FROM overlay_sessions WHERE is_active = true)::BIGINT as active_overlays
  FROM spin_stats s;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Initialize spin type records
INSERT INTO spin_stats (spin_type) VALUES ('main'), ('ragequit')
ON CONFLICT DO NOTHING;

-- ============================================
-- MAINTENANCE FUNCTIONS
-- ============================================

-- Function to reset daily counts (run at midnight UTC)
CREATE OR REPLACE FUNCTION reset_daily_counts() RETURNS void AS $$
BEGIN
  UPDATE spin_stats SET daily_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reset weekly counts (run Sunday midnight UTC)
CREATE OR REPLACE FUNCTION reset_weekly_counts() RETURNS void AS $$
BEGIN
  UPDATE spin_stats SET weekly_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly counts (run 1st of month midnight UTC)
CREATE OR REPLACE FUNCTION reset_monthly_counts() RETURNS void AS $$
BEGIN
  UPDATE spin_stats SET monthly_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup inactive overlay sessions (run hourly)
CREATE OR REPLACE FUNCTION cleanup_inactive_overlays() RETURNS void AS $$
BEGIN
  UPDATE overlay_sessions
  SET is_active = false
  WHERE is_active = true
    AND last_heartbeat < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISSIONS FOR ANON ROLE
-- ============================================

GRANT EXECUTE ON FUNCTION increment_spin_count TO anon;
GRANT EXECUTE ON FUNCTION record_spin_event TO anon;
GRANT EXECUTE ON FUNCTION start_overlay_session TO anon;
GRANT EXECUTE ON FUNCTION update_overlay_heartbeat TO anon;
GRANT EXECUTE ON FUNCTION end_overlay_session TO anon;
GRANT EXECUTE ON FUNCTION get_current_stats TO anon;

GRANT SELECT ON spin_stats TO anon;
GRANT SELECT ON hourly_stats TO anon;
GRANT SELECT ON popular_items TO anon;
GRANT SELECT ON streamer_stats TO anon;