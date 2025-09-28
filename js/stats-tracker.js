/**
 * Lightweight Stats Tracker for The Finals Loadout
 * Privacy-focused, batched updates, fails gracefully
 */

const StatsTracker = {
  // Config - Replace with your Supabase credentials
  SUPABASE_URL: 'https://lalgvijlctrxbqtsctum.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbGd2aWpsY3RyeGJxdHNjdHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzM4NzAsImV4cCI6MjA3NDYwOTg3MH0.GexJt5wtdif5H-QTFExzuukOVZToa9_tRpbl9RrEiQ4',

  // Internal state
  client: null,
  isReady: false,
  pendingSpins: { loadout: 0, ragequit: 0 },
  lastSync: Date.now(),
  syncInterval: null,
  syncTimeout: null,

  /**
   * Initialize the tracker
   */
  async init() {
    try {
      // Only initialize if Supabase is available
      if (typeof window.supabase === 'undefined') {
        console.log('Stats tracking disabled - Supabase not loaded');
        return;
      }

      // Create client
      this.client = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
      this.isReady = true;

      // Load pending spins from localStorage
      this.loadPendingSpins();

      // Sync every 30 seconds if there are pending spins
      this.syncInterval = setInterval(() => this.syncIfNeeded(), 30000);

      // Sync on page unload
      window.addEventListener('beforeunload', () => this.syncNow());

      // Initial stats display
      this.updateDisplay();

      console.log('Stats tracker ready');
    } catch (err) {
      console.log('Stats tracker initialization failed:', err);
      // Site continues to work normally
    }
  },

  /**
   * Track a spin (batched locally)
   */
  track(type) {
    console.log(`🎯 Tracking ${type} spin`);

    // Always work locally first
    this.pendingSpins[type] = (this.pendingSpins[type] || 0) + 1;
    this.savePendingSpins();
    console.log(`📝 Pending spins now:`, this.pendingSpins);

    // Update local display immediately
    console.log(`🔢 Updating local display for ${type}`);
    this.updateLocalDisplay(type);

    // Sync immediately for both types to ensure real-time updates
    if (type === 'ragequit' || type === 'loadout') {
      console.log(`🚀 Triggering immediate sync for ${type}`);
      // Add a small delay for loadout to batch rapid clicks
      if (type === 'loadout') {
        // Clear any existing timeout
        if (this.syncTimeout) {
          clearTimeout(this.syncTimeout);
        }
        // Set new timeout to batch rapid spins
        this.syncTimeout = setTimeout(() => {
          this.syncNow();
        }, 500);
      } else {
        this.syncNow();
      }
    } else {
      // Sync if we have 10+ pending or it's been 30+ seconds
      if (this.getTotalPending() >= 10 || Date.now() - this.lastSync > 30000) {
        this.syncNow();
      }
    }
  },

  /**
   * Get total pending spins
   */
  getTotalPending() {
    return this.pendingSpins.loadout + this.pendingSpins.ragequit;
  },

  /**
   * Sync if there are pending spins
   */
  syncIfNeeded() {
    if (this.getTotalPending() > 0) {
      this.syncNow();
    }
  },

  /**
   * Sync pending spins to Supabase
   */
  async syncNow() {
    if (!this.isReady || this.getTotalPending() === 0) return;

    const toSync = { ...this.pendingSpins };
    console.log('🔄 Starting sync with pending counts:', toSync);

    // DON'T clear pending until we know sync succeeded
    // this.pendingSpins = { loadout: 0, ragequit: 0 };
    // this.savePendingSpins();
    this.lastSync = Date.now();

    try {
      // Send both counters if they have values
      const promises = [];

      if (toSync.loadout > 0) {
        console.log('📤 Sending loadout increment:', toSync.loadout);
        promises.push(
          this.client.rpc('increment_spin_count', {
            p_spin_type: 'main',
            p_count: toSync.loadout
          }).catch(async (err) => {
            console.error('❌ RPC failed for loadout, trying direct update:', err);

            // Fallback: Get current count and update directly
            try {
              const { data: current } = await this.client
                .from('spin_stats')
                .select('total_count')
                .eq('spin_type', 'main')
                .single();

              if (current) {
                const newCount = (current.total_count || 0) + toSync.loadout;
                const { data: updated } = await this.client
                  .from('spin_stats')
                  .update({
                    total_count: newCount,
                    last_updated: new Date().toISOString()
                  })
                  .eq('spin_type', 'main');

                console.log('✅ Direct loadout update succeeded:', newCount);
                return updated;
              }
            } catch (fallbackErr) {
              console.error('❌ Direct loadout update also failed:', fallbackErr);
              throw fallbackErr;
            }
          })
        );
      }

      if (toSync.ragequit > 0) {
        console.log('📤 Sending ragequit increment:', toSync.ragequit);
        // Try RPC first, fallback to direct update if it fails
        promises.push(
          this.client.rpc('increment_spin_count', {
            p_spin_type: 'ragequit',
            p_count: toSync.ragequit
          }).then(result => {
            console.log('✅ Ragequit increment response:', result);
            return result;
          }).catch(async (err) => {
            console.error('❌ RPC failed, trying direct update:', err);

            // Fallback: Get current count and update directly
            try {
              const { data: current } = await this.client
                .from('spin_stats')
                .select('total_count')
                .eq('spin_type', 'ragequit')
                .single();

              if (current) {
                const newCount = (current.total_count || 0) + toSync.ragequit;
                const { data: updated } = await this.client
                  .from('spin_stats')
                  .update({
                    total_count: newCount,
                    last_updated: new Date().toISOString()
                  })
                  .eq('spin_type', 'ragequit');

                console.log('✅ Direct update succeeded:', newCount);
                return updated;
              }
            } catch (fallbackErr) {
              console.error('❌ Direct update also failed:', fallbackErr);
              throw fallbackErr;
            }
          })
        );
      }

      const results = await Promise.all(promises);
      console.log('✅ All syncs completed. Results:', results);

      // Only clear pending after successful sync
      this.pendingSpins = { loadout: 0, ragequit: 0 };
      this.savePendingSpins();

      // Wait a bit before updating display to ensure database has processed the increment
      setTimeout(() => {
        console.log('📊 Updating display after sync...');
        this.updateDisplay();
      }, 100);
    } catch (err) {
      console.error('Sync failed, will retry:', err);
      console.error('Full error details:', err.message, err.stack);
      // Restore pending counts on failure
      this.pendingSpins.loadout += toSync.loadout;
      this.pendingSpins.ragequit += toSync.ragequit;
      this.savePendingSpins();

      // Still update the local display even if sync failed
      if (toSync.ragequit > 0) {
        const legacyEl = document.getElementById('totalRageQuits');
        if (legacyEl && legacyEl.textContent !== 'Loading...') {
          const current = parseInt(legacyEl.textContent.replace(/,/g, '')) || 0;
          legacyEl.textContent = current.toLocaleString();
        }
      }
    }
  },

  /**
   * Update display with latest stats
   */
  async updateDisplay() {
    if (!this.isReady) return;

    try {
      const { data } = await this.client.rpc('get_current_stats');
      console.log('Fetched stats from Supabase:', data);
      if (!data) {
        console.log('No data returned from Supabase');
        return;
      }

      // Update elements if they exist
      data.forEach(stat => {
        // Map spin_type to our internal type names
        const type = stat.spin_type === 'main' ? 'loadout' : stat.spin_type;

        // Total counter
        const totalEl = document.getElementById(`${type}Total`);
        if (totalEl) {
          const newValue = stat.total_count + this.pendingSpins[type];
          console.log(`Updating ${type}Total: ${stat.total_count} + ${this.pendingSpins[type]} pending = ${newValue}`);
          totalEl.textContent = newValue.toLocaleString();
        }

        // Daily counter if element exists
        const todayEl = document.getElementById(`${type}Today`);
        if (todayEl) {
          todayEl.textContent = stat.daily_count.toLocaleString();
        }

        // Legacy element names for backward compatibility
        if (type === 'ragequit') {
          const legacyEl = document.getElementById('totalRageQuits');
          if (legacyEl) {
            const newValue = stat.total_count + this.pendingSpins.ragequit;
            console.log(`Updating totalRageQuits: ${stat.total_count} + ${this.pendingSpins.ragequit} pending = ${newValue}`);
            legacyEl.textContent = newValue.toLocaleString();
          }
        }
      });
    } catch (err) {
      console.error('Failed to update display:', err);
    }
  },

  /**
   * Update local display immediately (before sync)
   */
  updateLocalDisplay(type) {
    // Increment the displayed number immediately for responsiveness
    const totalEl = document.getElementById(`${type}Total`);
    console.log(`🔍 Looking for element: ${type}Total`);

    if (totalEl) {
      // Handle "Loading..." or other non-numeric text
      const text = totalEl.textContent.replace(/,/g, '');
      const current = parseInt(text) || 0;
      console.log(`📈 Current value: "${text}" -> ${current}`);

      // Only increment if we have a valid number (not "Loading...")
      if (!isNaN(parseInt(text)) || text === '0') {
        const newValue = current + 1;
        totalEl.textContent = newValue.toLocaleString();
        console.log(`✅ Updated ${type}Total to ${newValue}`);
      } else {
        console.log(`⏸️ Skipping increment - non-numeric value: "${text}"`);
      }
      // If it says "Loading...", we'll let the updateDisplay() handle it
    } else {
      console.log(`❌ Element ${type}Total not found`);
    }

    // Legacy element update
    if (type === 'ragequit') {
      const legacyEl = document.getElementById('totalRageQuits');
      if (legacyEl) {
        const current = parseInt(legacyEl.textContent.replace(/,/g, '')) || 0;
        legacyEl.textContent = (current + 1).toLocaleString();
      }
    }
  },

  /**
   * Save pending spins to localStorage
   */
  savePendingSpins() {
    localStorage.setItem('pendingSpins', JSON.stringify(this.pendingSpins));
  },

  /**
   * Load pending spins from localStorage
   */
  loadPendingSpins() {
    try {
      const saved = localStorage.getItem('pendingSpins');
      if (saved) {
        this.pendingSpins = JSON.parse(saved);
      }
    } catch (err) {
      this.pendingSpins = { loadout: 0, ragequit: 0 };
    }
  },

  /**
   * Clean up
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncNow();
  }
};

// Auto-initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => StatsTracker.init());
} else {
  StatsTracker.init();
}

// Make globally available
window.StatsTracker = StatsTracker;