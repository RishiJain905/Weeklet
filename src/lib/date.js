/**
 * Date utilities for Weeklet
 */

export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateString) {
  return dateString === formatDate(new Date());
}

export function getDayName(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getShortDayName(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getWeekDays(referenceDate = new Date()) {
  const days = [];
  const currentDate = new Date(referenceDate);
  const dayOfWeek = currentDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + mondayOffset);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    
    days.push({
      date: formatDate(day),
      name: getShortDayName(formatDate(day)),
      dayNum: day.getDate(),
      fullName: getDayName(formatDate(day))
    });
  }
  
  return days;
}
