/**
 * Supabase Stats Tracking Client
 * For The Finals Loadout Generator & Rage Quit Simulator
 */

class LoadoutStatsTracker {
  constructor() {
    // Initialize with your Supabase credentials
    // Replace these with your actual project URL and anon key
    this.supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
    this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

    // Initialize client (we'll load Supabase SDK from CDN)
    this.client = null;
    this.sessionId = this.generateSessionId();
    this.initialized = false;
  }

  /**
   * Initialize the Supabase client
   * Call this after the page loads
   */
  async init() {
    try {
      // Check if Supabase SDK is loaded
      if (typeof window.supabase === 'undefined') {
        console.warn('Supabase SDK not loaded. Add script tag to HTML.');
        return false;
      }

      // Create client
      this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
      this.initialized = true;

      console.log('✅ Stats tracker initialized');

      // Get and display current stats
      await this.displayCurrentStats();

      return true;
    } catch (error) {
      console.error('Failed to initialize stats tracker:', error);
      return false;
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track a loadout spin
   */
  async trackLoadoutSpin(data = {}) {
    if (!this.initialized) return;

    try {
      const spinData = {
        p_spin_type: 'loadout',
        p_source: 'web',
        p_session_id: this.sessionId,
        p_selected_class: data.selectedClass || null,
        p_spin_count: data.spinCount || 1,
        p_items: data.items ? JSON.stringify(data.items) : null
      };

      const { error } = await this.client.rpc('log_spin_event', spinData);

      if (error) {
        console.error('Error tracking spin:', error);
      } else {
        console.log('✅ Loadout spin tracked');
        this.updateDisplayedStats();
      }
    } catch (error) {
      console.error('Failed to track spin:', error);
    }
  }

  /**
   * Track a rage quit spin
   */
  async trackRageQuitSpin(data = {}) {
    if (!this.initialized) return;

    try {
      const spinData = {
        p_spin_type: 'ragequit',
        p_source: 'web',
        p_session_id: this.sessionId,
        p_selected_class: data.selectedClass || null,
        p_spin_count: 1,
        p_items: data.items ? JSON.stringify(data.items) : null,
        p_handicap: data.handicap || null
      };

      const { error } = await this.client.rpc('log_spin_event', spinData);

      if (error) {
        console.error('Error tracking rage quit:', error);
      } else {
        console.log('✅ Rage quit spin tracked');
        this.updateDisplayedStats();
      }
    } catch (error) {
      console.error('Failed to track rage quit:', error);
    }
  }

  /**
   * Get current stats from database
   */
  async getCurrentStats() {
    if (!this.initialized) return null;

    try {
      const { data, error } = await this.client.rpc('get_current_stats');

      if (error) {
        console.error('Error fetching stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Display current stats on the page
   */
  async displayCurrentStats() {
    const stats = await this.getCurrentStats();
    if (!stats) return;

    // Find the appropriate stat based on current page
    const isRageQuit = window.location.pathname.includes('ragequit');
    const statType = isRageQuit ? 'ragequit' : 'loadout';
    const currentStat = stats.find(s => s.spin_type === statType);

    if (currentStat) {
      // Update total counter if element exists
      const totalElement = document.getElementById('globalTotalSpins');
      if (totalElement) {
        totalElement.textContent = currentStat.total_count.toLocaleString();
      }

      // Update daily counter if element exists
      const dailyElement = document.getElementById('globalDailySpins');
      if (dailyElement) {
        dailyElement.textContent = currentStat.daily_count.toLocaleString();
      }

      // For rage quit page, update the specific counter
      const rageQuitTotal = document.getElementById('totalRageQuits');
      if (rageQuitTotal && isRageQuit) {
        rageQuitTotal.textContent = currentStat.total_count.toLocaleString();
      }

      console.log(`📊 Current ${statType} stats:`, currentStat);
    }

    // Show active overlays count
    if (stats.length > 0 && stats[0].active_overlays !== undefined) {
      const overlayElement = document.getElementById('activeOverlays');
      if (overlayElement) {
        overlayElement.textContent = stats[0].active_overlays.toLocaleString();
      }
    }
  }

  /**
   * Update displayed stats (call after tracking)
   */
  async updateDisplayedStats() {
    // Small delay to allow database to update
    setTimeout(() => {
      this.displayCurrentStats();
    }, 500);
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates() {
    if (!this.initialized) return;

    // Subscribe to changes in spin_stats table
    const subscription = this.client
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'spin_stats'
        },
        (payload) => {
          console.log('📊 Stats updated:', payload);
          this.displayCurrentStats();
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Track overlay session start
   */
  async startOverlaySession(streamerId = null) {
    if (!this.initialized) return;

    try {
      const { error } = await this.client.rpc('start_overlay_session', {
        p_session_id: this.sessionId,
        p_streamer_id: streamerId
      });

      if (!error) {
        console.log('✅ Overlay session started');

        // Send heartbeat every 30 seconds
        this.heartbeatInterval = setInterval(() => {
          this.sendOverlayHeartbeat();
        }, 30000);
      }
    } catch (error) {
      console.error('Failed to start overlay session:', error);
    }
  }

  /**
   * Send overlay heartbeat
   */
  async sendOverlayHeartbeat() {
    if (!this.initialized) return;

    try {
      await this.client.rpc('update_overlay_heartbeat', {
        p_session_id: this.sessionId
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }

  /**
   * End overlay session
   */
  async endOverlaySession() {
    if (!this.initialized) return;

    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      await this.client.rpc('end_overlay_session', {
        p_session_id: this.sessionId
      });

      console.log('✅ Overlay session ended');
    } catch (error) {
      console.error('Failed to end overlay session:', error);
    }
  }
}

// Create global instance
window.statsTracker = new LoadoutStatsTracker();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.statsTracker.init();
  });
} else {
  window.statsTracker.init();
}