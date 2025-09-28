-- ============================================
-- FINALSLOADOUT-STATS DATABASE SCHEMA
-- ============================================

-- 1. GLOBAL SPIN STATISTICS
-- Tracks total spins across all users
CREATE TABLE IF NOT EXISTS spin_stats (
  id SERIAL PRIMARY KEY,
  spin_type VARCHAR(50) NOT NULL UNIQUE, -- 'loadout', 'ragequit'
  total_count BIGINT DEFAULT 0,
  daily_count BIGINT DEFAULT 0,
  weekly_count BIGINT DEFAULT 0,
  monthly_count BIGINT DEFAULT 0,
  last_reset_daily DATE DEFAULT CURRENT_DATE,
  last_reset_weekly DATE DEFAULT CURRENT_DATE,
  last_reset_monthly DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DETAILED SPIN EVENTS
-- Log of individual spins with metadata
CREATE TABLE IF NOT EXISTS spin_events (
  id SERIAL PRIMARY KEY,
  spin_type VARCHAR(50) NOT NULL,
  source VARCHAR(50) DEFAULT 'web', -- 'web', 'overlay', 'api'
  session_id VARCHAR(255),
  ip_hash VARCHAR(64), -- Hashed IP for privacy
  user_agent TEXT,
  selected_class VARCHAR(20), -- 'Light', 'Medium', 'Heavy'
  spin_count INT DEFAULT 1, -- Number of spins in multi-spin
  items JSONB, -- Array of selected items
  handicap VARCHAR(100), -- For rage quit
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OVERLAY SESSIONS
-- Track OBS overlay usage
CREATE TABLE IF NOT EXISTS overlay_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  streamer_id VARCHAR(255), -- Optional, for claimed overlays
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  features_used JSONB, -- Track which features are being used
  spins_generated INT DEFAULT 0, -- Spins from viewers during this session
  peak_viewers INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0
);

-- 4. STREAMER STATISTICS (Opt-in)
-- Aggregate stats for streamers who claim their overlay
CREATE TABLE IF NOT EXISTS streamer_stats (
  id SERIAL PRIMARY KEY,
  streamer_id VARCHAR(255) UNIQUE NOT NULL,
  streamer_name VARCHAR(255),
  platform VARCHAR(50), -- 'twitch', 'youtube', etc.
  total_sessions INT DEFAULT 0,
  total_stream_hours DECIMAL(10,2) DEFAULT 0,
  total_spins_generated INT DEFAULT 0,
  avg_spins_per_session DECIMAL(10,2) DEFAULT 0,
  most_used_class VARCHAR(20),
  favorite_weapons JSONB,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HOURLY STATISTICS
-- For generating heat maps and trends
CREATE TABLE IF NOT EXISTS hourly_stats (
  id SERIAL PRIMARY KEY,
  hour_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  spin_type VARCHAR(50) NOT NULL,
  total_spins INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  active_overlays INT DEFAULT 0,
  most_selected_class VARCHAR(20),
  most_selected_weapon VARCHAR(100),
  UNIQUE(hour_timestamp, spin_type)
);

-- 6. POPULAR ITEMS TRACKING
-- Track most selected items over time
CREATE TABLE IF NOT EXISTS popular_items (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- 'weapon', 'specialization', 'gadget'
  selection_count INT DEFAULT 0,
  last_selected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trending_score DECIMAL(10,2) DEFAULT 0, -- Calculate based on recent selections
  UNIQUE(item_name, item_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_spin_events_timestamp ON spin_events(timestamp);
CREATE INDEX idx_spin_events_type ON spin_events(spin_type);
CREATE INDEX idx_spin_events_session ON spin_events(session_id);
CREATE INDEX idx_overlay_sessions_active ON overlay_sessions(is_active);
CREATE INDEX idx_overlay_sessions_streamer ON overlay_sessions(streamer_id);
CREATE INDEX idx_hourly_stats_timestamp ON hourly_stats(hour_timestamp);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to increment spin counter
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
    daily_count = CASE
      WHEN spin_stats.last_reset_daily = CURRENT_DATE THEN spin_stats.daily_count + p_count
      ELSE p_count
    END,
    weekly_count = CASE
      WHEN spin_stats.last_reset_weekly = date_trunc('week', CURRENT_DATE) THEN spin_stats.weekly_count + p_count
      ELSE p_count
    END,
    monthly_count = CASE
      WHEN spin_stats.last_reset_monthly = date_trunc('month', CURRENT_DATE) THEN spin_stats.monthly_count + p_count
      ELSE p_count
    END,
    last_reset_daily = CURRENT_DATE,
    last_reset_weekly = date_trunc('week', CURRENT_DATE),
    last_reset_monthly = date_trunc('month', CURRENT_DATE),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log spin event with details
CREATE OR REPLACE FUNCTION log_spin_event(
  p_spin_type VARCHAR,
  p_source VARCHAR DEFAULT 'web',
  p_session_id VARCHAR DEFAULT NULL,
  p_selected_class VARCHAR DEFAULT NULL,
  p_spin_count INT DEFAULT 1,
  p_items JSONB DEFAULT NULL,
  p_handicap VARCHAR DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO spin_events (
    spin_type, source, session_id, selected_class,
    spin_count, items, handicap
  ) VALUES (
    p_spin_type, p_source, p_session_id, p_selected_class,
    p_spin_count, p_items, p_handicap
  );

  -- Also increment the counter
  PERFORM increment_spin_count(p_spin_type, p_spin_count);
END;
$$ LANGUAGE plpgsql;

-- Function to start overlay session
CREATE OR REPLACE FUNCTION start_overlay_session(
  p_session_id VARCHAR,
  p_streamer_id VARCHAR DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO overlay_sessions (session_id, streamer_id)
  VALUES (p_session_id, p_streamer_id)
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

-- Initialize spin types
INSERT INTO spin_stats (spin_type)
VALUES ('loadout'), ('ragequit')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS
ALTER TABLE spin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for stats
CREATE POLICY "Allow anonymous read" ON spin_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON spin_events
  FOR INSERT WITH CHECK (true);

-- Only allow updates through RPC functions
CREATE POLICY "No direct updates" ON spin_stats
  FOR UPDATE USING (false);