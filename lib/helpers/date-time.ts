/**
 * Extracts HH:mm format from a time string (e.g., "14:30:00" or "14:30")
 * This avoids timezone conversion issues when dealing with time-only values
 */
const extractHoursAndMinutesFromString = (timeString: string): string => {
  // Handle various formats: "14:30:00", "14:30", "14:30:00.000"
  const match = timeString.match(/^(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  // Fallback: if it's already in HH:mm format, return as is
  return timeString.slice(0, 5);
};

export { extractHoursAndMinutesFromString };
