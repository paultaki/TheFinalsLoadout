// World Tour Progress Tracker - Season 9 Fixes
// Simplified version - handles UTC timing and quick add functionality

// Date utility functions
const DateUtils = {
  /**
   * Get UTC season end date at 10:00 UTC
   * @param {string} endDateStr - End date in YYYY-MM-DD format
   * @returns {Date} Date object set to 10:00 UTC on the end date
   */
  getSeasonEndUTC(endDateStr) {
    const [year, month, day] = endDateStr.split('-').map(Number);
    // Create date at 10:00 UTC (when THE FINALS seasons actually end)
    return new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));
  },

  /**
   * Calculate days remaining until season end at 10:00 UTC
   * @param {string} endDateStr - End date in YYYY-MM-DD format
   * @returns {number} Days remaining (including partial days)
   */
  calculateDaysRemainingUTC(endDateStr) {
    const now = new Date();
    const seasonEndUTC = this.getSeasonEndUTC(endDateStr);
    const diffMs = seasonEndUTC - now;

    // If season has ended, return 0
    if (diffMs <= 0) return 0;

    // Calculate days remaining including fractional days
    // Use ceil to show "1 day" even if only a few hours remain
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Format the season end date with UTC time
   * @param {string} endDateStr - End date in YYYY-MM-DD format
   * @returns {string} Formatted string with date and UTC time
   */
  formatSeasonEndUTC(endDateStr) {
    const seasonEndUTC = this.getSeasonEndUTC(endDateStr);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    };
    return seasonEndUTC.toLocaleString('en-US', options);
  }
};

// Override functions for Season 9
window.WTFixes = {
  // Fixed quickAddPoints function - respects manual input
  quickAddPoints(points) {
    // IMPORTANT: Read the CURRENT input value to respect manual edits
    const inputEl = document.getElementById('currentPoints');
    const inputValue = parseInt(inputEl.value) || 0;
    
    // Sync currentPoints with input field value
    currentPoints = inputValue;
    const oldPoints = currentPoints;

    // Add to undo history (max 5 items)
    undoHistory.push({
      points: points,
      timestamp: Date.now(),
      oldTotal: oldPoints
    });

    if (undoHistory.length > 5) {
      undoHistory.shift();
    }

    storage.set('undoHistory', undoHistory);
    updateUndoButton();

    // Calculate new total by adding to CURRENT input value
    const newTotal = oldPoints + points;
    updateCurrentPoints(newTotal);

    showNotification(`+${points} points added! Total: ${newTotal}`, 'success');
  },

  // Fixed calculateDaysRemaining function with UTC support
  calculateDaysRemainingUTC() {
    if (typeof SEASON_END_DATE !== 'undefined') {
      const days = DateUtils.calculateDaysRemainingUTC(SEASON_END_DATE);
      window.daysRemaining = days;
      return days;
    }
    return 0;
  },

  // Initialize fixes
  init() {
    // Replace quickAddPoints with fixed version
    window.quickAddPoints = this.quickAddPoints;

    // Override calculateDaysRemaining with UTC version
    if (typeof window.calculateDaysRemaining !== 'undefined') {
      window.calculateDaysRemaining = () => this.calculateDaysRemainingUTC();
    }

    // Wrap updateDashboard to use UTC calculations
    if (typeof window.updateDashboard !== 'undefined') {
      const originalUpdateDashboard = window.updateDashboard;
      window.updateDashboard = () => {
        this.calculateDaysRemainingUTC();
        originalUpdateDashboard();

        // Fix the season end date display
        const seasonEndDateEl = document.getElementById('seasonEndDate');
        if (seasonEndDateEl && typeof SEASON_END_DATE !== 'undefined') {
          seasonEndDateEl.textContent = `Season ends ${DateUtils.formatSeasonEndUTC(SEASON_END_DATE)}`;
        }
      };
    }

    // Update dashboard with UTC times immediately after init
    if (typeof window.updateDashboard !== 'undefined') {
      setTimeout(() => {
        this.calculateDaysRemainingUTC();
        window.updateDashboard();
      }, 200);
    }
    
    console.log('WTFixes v9.1 initialized');
  }
};

// Auto-initialize when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WTFixes.init());
} else {
  // DOM already loaded
  setTimeout(() => WTFixes.init(), 100);
}
