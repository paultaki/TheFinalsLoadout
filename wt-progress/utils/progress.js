// wt-progress/utils/progress.js
import { compareDMY, toNumber } from './date.js';

/**
 * Compute running totals for entries sorted by date
 * @param {Array} entries - Array of entries with date, points, and quickAdd fields
 * @returns {Array} Sorted entries with dayPoints and runningTotal fields added
 */
export function computeRunningTotals(entries) {
  // entries: [{ date: "DD/MM/YYYY", points: number, quickAdd?: number, ... }]
  const sorted = [...entries].sort((a, b) => compareDMY(a.date, b.date));
  let running = 0;
  return sorted.map(e => {
    const dayPoints = toNumber(e.points) + toNumber(e.quickAdd);
    running += dayPoints;
    return { ...e, dayPoints, runningTotal: running };
  });
}

/**
 * Calculate total points from entries
 * @param {Array} entries - Array of entries with points and quickAdd fields
 * @returns {number} Total points
 */
export function calculateTotalPoints(entries) {
  return entries.reduce((sum, e) => {
    return sum + toNumber(e.points) + toNumber(e.quickAdd);
  }, 0);
}

/**
 * Merge quickAdd points into existing entry or create new one
 * @param {Array} entries - Current entries array
 * @param {string} date - Date in DD/MM/YYYY format
 * @param {number} points - Points to add
 * @param {string} type - Type of quick add (e.g., 'win', 'qualified')
 * @returns {Array} Updated entries array
 */
export function mergeQuickAdd(entries, date, points, type = 'quick') {
  const existingIndex = entries.findIndex(e => e.date === date);

  if (existingIndex >= 0) {
    // Update existing entry
    const entry = { ...entries[existingIndex] };
    entry.quickAdd = toNumber(entry.quickAdd) + points;

    // Update notes to track what was added
    if (entry.notes) {
      entry.notes += `, +${points} (${type})`;
    } else {
      entry.notes = `+${points} (${type})`;
    }

    const newEntries = [...entries];
    newEntries[existingIndex] = entry;
    return newEntries;
  } else {
    // Create new entry
    return [...entries, {
      date: date,
      points: 0,
      quickAdd: points,
      notes: `+${points} (${type})`
    }];
  }
}