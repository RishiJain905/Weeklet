/**
 * Date helpers for Weeklet
 */

/**
 * Convert Date to YYYY-MM-DD string
 */
export function toYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if YYYY-MM-DD string represents today
 */
export function isToday(ymd) {
  return ymd === toYmd(new Date());
}

/**
 * Get 7 consecutive YYYY-MM-DD strings starting from baseYmd
 * @param {string} baseYmd - Base date in YYYY-MM-DD format
 * @param {string} startOfWeek - "Mon" or "Sun" 
 * @returns {string[]} - Array of 7 YYYY-MM-DD strings
 */
export function getWeekDays(baseYmd, startOfWeek = "Mon") {
  const baseDate = new Date(baseYmd + 'T00:00:00');
  const dayOfWeek = baseDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate offset to get to start of week
  let offset;
  if (startOfWeek === "Mon") {
    offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
  } else {
    offset = -dayOfWeek; // Sunday = 0
  }
  
  // Generate 7 consecutive days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + offset + i);
    weekDays.push(toYmd(date));
  }
  
  return weekDays;
}
