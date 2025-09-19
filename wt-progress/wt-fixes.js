// World Tour Progress Tracker - Bug Fixes
// This file contains fixes for date handling, running total calculations, and UTC season timing

// Date utility functions
const DateUtils = {
  /**
   * Parse DD/MM/YYYY date string to UTC timestamp
   */
  parseDMY(dmy) {
    const [dd, mm, yyyy] = dmy.split('/').map(Number);
    if (!dd || !mm || !yyyy) throw new Error(`Bad DMY: ${dmy}`);
    return Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0);
  },

  /**
   * Compare two DD/MM/YYYY dates
   */
  compareDMY(a, b) {
    return this.parseDMY(a) - this.parseDMY(b);
  },

  /**
   * Check if DD/MM/YYYY date is today in local timezone
   */
  isSameLocalDayDMY(dmy, now = new Date()) {
    const [dd, mm, yyyy] = dmy.split('/').map(Number);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const row = new Date(yyyy, mm - 1, dd);
    return today.getTime() === row.getTime();
  },

  /**
   * Format Date to DD/MM/YYYY string
   */
  formatDMY(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  },

  /**
   * Get today's date in DD/MM/YYYY format
   */
  getTodayDMY() {
    return this.formatDMY(new Date());
  },

  /**
   * Convert value to number, defaulting to 0
   */
  toNumber(x) {
    const n = Number(x ?? 0);
    return Number.isFinite(n) ? n : 0;
  },

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

// Progress calculation utilities
const ProgressUtils = {
  /**
   * Compute running totals for entries sorted by date
   */
  computeRunningTotals(entries) {
    const sorted = [...entries].sort((a, b) => DateUtils.compareDMY(a.date, b.date));
    let running = 0;
    return sorted.map(e => {
      const dayPoints = DateUtils.toNumber(e.points) + DateUtils.toNumber(e.quickAdd);
      running += dayPoints;
      return { ...e, dayPoints, runningTotal: running };
    });
  }
};

// Override the existing functions
window.WTFixes = {
  // Fixed addDailyEntry function
  addDailyEntry() {
    const pointsInput = document.getElementById('pointsInput');
    const notesInput = document.getElementById('notesInput');
    const points = parseInt(pointsInput.value) || 0;
    const notes = notesInput.value.trim();

    if (points <= 0) {
      showNotification('Please enter points greater than 0', 'error');
      return;
    }

    // Get today's date in DD/MM/YYYY format
    const date = DateUtils.getTodayDMY();

    // Check if entry already exists
    const existingIndex = dailyEntries.findIndex(e => e.date === date);

    if (existingIndex >= 0) {
      // Update existing entry - store as manual points
      dailyEntries[existingIndex].points = DateUtils.toNumber(dailyEntries[existingIndex].points) + points;
      if (notes) {
        dailyEntries[existingIndex].notes = notes;
      }
    } else {
      // Create new entry
      dailyEntries.push({
        date: date,
        points: points,
        quickAdd: 0,
        notes: notes
      });
    }

    // Update storage
    storage.set('dailyEntries', dailyEntries);

    // Update current points
    const newTotal = calculateCurrentTotalFromEntries();
    updateCurrentPoints(newTotal);

    // Clear form
    pointsInput.value = '';
    notesInput.value = '';

    renderDailyEntries();
    showNotification(`Entry added: +${points} points`, 'success');
  },

  // Fixed quickAddPoints function
  quickAddPoints(points) {
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

    // Get today's date in DD/MM/YYYY format
    const today = DateUtils.getTodayDMY();
    const existingEntry = dailyEntries.find(e => e.date === today);

    if (existingEntry) {
      // Track quickAdd separately from manual points
      existingEntry.quickAdd = DateUtils.toNumber(existingEntry.quickAdd) + points;
    } else {
      // Create new entry with quickAdd
      dailyEntries.push({
        date: today,
        points: 0,
        quickAdd: points,
        notes: `Quick add: +${points}`
      });
    }

    storage.set('dailyEntries', dailyEntries);

    // Recalculate total from all entries
    const newTotal = calculateCurrentTotalFromEntries();
    updateCurrentPoints(newTotal);

    renderDailyEntries();
    showNotification(`+${points} points added! Total: ${currentPoints}`, 'success');
  },

  // New function to calculate total from all entries
  calculateCurrentTotalFromEntries() {
    if (dailyEntries.length === 0) return 0;

    const totals = ProgressUtils.computeRunningTotals(dailyEntries);
    return totals[totals.length - 1].runningTotal;
  },

  // Fixed renderDailyEntries function
  renderDailyEntries() {
    const list = document.getElementById('entriesList');
    list.innerHTML = '';

    if (dailyEntries.length === 0) {
      list.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No entries yet. Start tracking your progress!</div>';
      return;
    }

    // Compute running totals properly
    const entriesWithTotals = ProgressUtils.computeRunningTotals(dailyEntries);

    // Show last 10 entries in reverse chronological order
    const recent = entriesWithTotals.slice(-10).reverse();

    recent.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'entry-item';

      const dateEl = document.createElement('div');
      dateEl.className = 'entry-date';

      // Parse and format date properly
      const [dd, mm, yyyy] = entry.date.split('/');
      const dateObj = new Date(yyyy, mm - 1, dd);
      dateEl.textContent = dateObj.toLocaleDateString();

      // Add "Today" badge if applicable
      if (DateUtils.isSameLocalDayDMY(entry.date)) {
        const todayBadge = document.createElement('span');
        todayBadge.className = 'today-badge';
        todayBadge.textContent = 'TODAY';
        todayBadge.style.marginLeft = '8px';
        todayBadge.style.padding = '2px 8px';
        todayBadge.style.backgroundColor = '#4CAF50';
        todayBadge.style.color = 'white';
        todayBadge.style.borderRadius = '12px';
        todayBadge.style.fontSize = '10px';
        todayBadge.style.fontWeight = 'bold';
        dateEl.appendChild(todayBadge);
      }

      const pointsEl = document.createElement('div');
      pointsEl.className = 'entry-points';

      // Show breakdown of points
      const manualPoints = DateUtils.toNumber(entry.points);
      const quickPoints = DateUtils.toNumber(entry.quickAdd);
      const dayTotal = entry.dayPoints;

      let pointsText = `+${dayTotal}`;
      if (manualPoints > 0 && quickPoints > 0) {
        pointsText += ` (${manualPoints} + ${quickPoints} quick)`;
      } else if (quickPoints > 0) {
        pointsText += ' (quick)';
      }

      pointsEl.textContent = pointsText;

      const totalEl = document.createElement('div');
      totalEl.className = 'entry-total';
      totalEl.innerHTML = `<span style="color: #666; font-size: 0.85em;">Running total:</span> <span style="color: #50c878; font-weight: 600;">${entry.runningTotal}</span>`;
      totalEl.style.textAlign = 'right';
      totalEl.title = 'Your total points after this day';

      item.appendChild(dateEl);
      item.appendChild(pointsEl);

      if (entry.notes) {
        const notesEl = document.createElement('div');
        notesEl.className = 'entry-notes';
        notesEl.textContent = entry.notes;
        notesEl.style.fontSize = '12px';
        notesEl.style.color = '#888';
        notesEl.style.gridColumn = 'span 3';
        item.appendChild(notesEl);
      }

      item.appendChild(totalEl);
      list.appendChild(item);
    });
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

  // Fixed updateDashboard to use UTC times
  updateDashboardWithUTC() {
    // Call original updateDashboard if it exists
    if (typeof updateDashboard === 'function') {
      // First update days remaining with UTC calculation
      this.calculateDaysRemainingUTC();

      // Call original dashboard update
      updateDashboard();

      // Override the season end date display with UTC time
      const seasonEndDateEl = document.getElementById('seasonEndDate');
      if (seasonEndDateEl && typeof SEASON_END_DATE !== 'undefined') {
        seasonEndDateEl.textContent = `Season ends ${DateUtils.formatSeasonEndUTC(SEASON_END_DATE)}`;
      }
    }
  },

  // Initialize fixes
  init() {
    // Replace original functions with fixed ones
    window.addDailyEntry = this.addDailyEntry;
    window.quickAddPoints = this.quickAddPoints;
    window.renderDailyEntries = this.renderDailyEntries;
    window.calculateCurrentTotalFromEntries = this.calculateCurrentTotalFromEntries;

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

    // Migrate existing data to new format if needed
    if (typeof dailyEntries !== 'undefined' && dailyEntries.length > 0) {
      let needsMigration = false;

      dailyEntries.forEach((entry, index) => {
        // Convert YYYY-MM-DD to DD/MM/YYYY if needed
        if (entry.date && entry.date.includes('-')) {
          const [yyyy, mm, dd] = entry.date.split('-');
          entry.date = `${dd}/${mm}/${yyyy}`;
          needsMigration = true;
        }

        // Ensure quickAdd field exists
        if (typeof entry.quickAdd === 'undefined') {
          entry.quickAdd = 0;
          needsMigration = true;
        }

        // Ensure points is a number
        entry.points = DateUtils.toNumber(entry.points);
      });

      if (needsMigration) {
        storage.set('dailyEntries', dailyEntries);
        console.log('Migrated daily entries to new format');
      }

      // Recalculate current total
      const actualTotal = this.calculateCurrentTotalFromEntries();
      if (actualTotal !== currentPoints) {
        updateCurrentPoints(actualTotal);
        console.log(`Corrected total points from ${currentPoints} to ${actualTotal}`);
      }

      // Re-render with fixed totals
      this.renderDailyEntries();
    }

    // Update dashboard with UTC times immediately after init
    if (typeof window.updateDashboard !== 'undefined') {
      setTimeout(() => {
        this.calculateDaysRemainingUTC();
        window.updateDashboard();
      }, 200);
    }
  }
};

// Auto-initialize when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WTFixes.init());
} else {
  // DOM already loaded
  setTimeout(() => WTFixes.init(), 100);
}