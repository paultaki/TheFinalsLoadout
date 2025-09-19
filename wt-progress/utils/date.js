// wt-progress/utils/date.js

/**
 * Parse DD/MM/YYYY date string to UTC timestamp
 * @param {string} dmy - Date in DD/MM/YYYY format
 * @returns {number} UTC timestamp
 */
export function parseDMY(dmy) {
  // dmy: "DD/MM/YYYY"
  const [dd, mm, yyyy] = dmy.split('/').map(Number);
  if (!dd || !mm || !yyyy) throw new Error(`Bad DMY: ${dmy}`);
  // Return a UTC timestamp at midnight to avoid TZ drift
  return Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0);
}

/**
 * Compare two DD/MM/YYYY dates
 * @param {string} a - First date in DD/MM/YYYY format
 * @param {string} b - Second date in DD/MM/YYYY format
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal
 */
export function compareDMY(a, b) {
  return parseDMY(a) - parseDMY(b);
}

/**
 * Check if DD/MM/YYYY date is today in local timezone
 * @param {string} dmy - Date in DD/MM/YYYY format
 * @param {Date} now - Current date (defaults to new Date())
 * @returns {boolean} True if the date is today
 */
export function isSameLocalDayDMY(dmy, now = new Date()) {
  const [dd, mm, yyyy] = dmy.split('/').map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const row = new Date(yyyy, mm - 1, dd);
  return today.getTime() === row.getTime();
}

/**
 * Convert value to number, defaulting to 0
 * @param {any} x - Value to convert
 * @returns {number} Numeric value or 0
 */
export function toNumber(x) {
  const n = Number(x ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Format Date to DD/MM/YYYY string
 * @param {Date} date - Date object
 * @returns {string} Date in DD/MM/YYYY format
 */
export function formatDMY(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Get today's date in DD/MM/YYYY format
 * @returns {string} Today in DD/MM/YYYY format
 */
export function getTodayDMY() {
  return formatDMY(new Date());
}