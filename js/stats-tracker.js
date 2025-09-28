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
    // Always work locally first
    this.pendingSpins[type] = (this.pendingSpins[type] || 0) + 1;
    this.savePendingSpins();

    // Update local display immediately
    this.updateLocalDisplay(type);

    // Sync if we have 10+ pending or it's been 30+ seconds
    if (this.getTotalPending() >= 10 || Date.now() - this.lastSync > 30000) {
      this.syncNow();
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

    // Clear pending (optimistic - assume success)
    this.pendingSpins = { loadout: 0, ragequit: 0 };
    this.savePendingSpins();
    this.lastSync = Date.now();

    try {
      // Send both counters if they have values
      const promises = [];

      if (toSync.loadout > 0) {
        promises.push(
          this.client.rpc('increment_spin_count', {
            p_spin_type: 'main',
            p_count: toSync.loadout
          })
        );
      }

      if (toSync.ragequit > 0) {
        promises.push(
          this.client.rpc('increment_spin_count', {
            p_spin_type: 'ragequit',
            p_count: toSync.ragequit
          })
        );
      }

      await Promise.all(promises);
      console.log('Stats synced:', toSync);

      // Update display with new totals
      this.updateDisplay();
    } catch (err) {
      console.error('Sync failed, will retry:', err);
      // Restore pending counts on failure
      this.pendingSpins.loadout += toSync.loadout;
      this.pendingSpins.ragequit += toSync.ragequit;
      this.savePendingSpins();
    }
  },

  /**
   * Update display with latest stats
   */
  async updateDisplay() {
    if (!this.isReady) return;

    try {
      const { data } = await this.client.rpc('get_current_stats');
      if (!data) return;

      // Update elements if they exist
      data.forEach(stat => {
        // Map spin_type to our internal type names
        const type = stat.spin_type === 'main' ? 'loadout' : stat.spin_type;

        // Total counter
        const totalEl = document.getElementById(`${type}Total`);
        if (totalEl) {
          totalEl.textContent = (stat.total_count + this.pendingSpins[type]).toLocaleString();
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
            legacyEl.textContent = (stat.total_count + this.pendingSpins.ragequit).toLocaleString();
          }
        }
      });
    } catch (err) {
      console.log('Failed to update display:', err);
    }
  },

  /**
   * Update local display immediately (before sync)
   */
  updateLocalDisplay(type) {
    // Increment the displayed number immediately for responsiveness
    const totalEl = document.getElementById(`${type}Total`);
    if (totalEl) {
      const current = parseInt(totalEl.textContent.replace(/,/g, '')) || 0;
      totalEl.textContent = (current + 1).toLocaleString();
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