/**
 * Formats a phone number in German format
 * Examples:
 * - +49 30 12345678 -> +49 (0) 30 12345678
 * - 030 12345678 -> 030 12345678
 * - 00493012345678 -> +49 (0) 30 12345678
 */
function formatGermanPhoneNumber(phone: string): string {
  if (!phone) return phone;

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Handle international format starting with +49
  if (cleaned.startsWith('+49')) {
    const withoutCountryCode = cleaned.substring(3);
    // Remove leading 0 if present
    const areaCode = withoutCountryCode.startsWith('0')
      ? withoutCountryCode.substring(1, 4)
      : withoutCountryCode.substring(0, 3);
    const number = withoutCountryCode.startsWith('0')
      ? withoutCountryCode.substring(4)
      : withoutCountryCode.substring(3);

    // Format: +49 (0) 30 12345678
    if (areaCode.length >= 2 && number.length >= 6) {
      return `+49 (0) ${areaCode} ${number}`;
    }
  }

  // Handle format starting with 0049
  if (cleaned.startsWith('0049')) {
    const withoutCountryCode = cleaned.substring(4);
    const areaCode = withoutCountryCode.startsWith('0')
      ? withoutCountryCode.substring(1, 4)
      : withoutCountryCode.substring(0, 3);
    const number = withoutCountryCode.startsWith('0')
      ? withoutCountryCode.substring(4)
      : withoutCountryCode.substring(3);

    if (areaCode.length >= 2 && number.length >= 6) {
      return `+49 (0) ${areaCode} ${number}`;
    }
  }

  // Handle national format (starts with 0)
  if (cleaned.startsWith('0')) {
    const areaCode = cleaned.substring(1, 4);
    const number = cleaned.substring(4);

    if (areaCode.length >= 2 && number.length >= 6) {
      // Format: 030 12345678
      return `0${areaCode} ${number}`;
    }
  }

  // If no pattern matches, try to format as-is with spaces
  if (cleaned.length >= 10) {
    // Add spaces every few digits for readability
    return cleaned.replace(/(\d{2,3})(\d{3,4})(\d+)/, '$1 $2 $3');
  }

  // Return original if we can't format it
  return phone;
}

export { formatGermanPhoneNumber };
