import { AvailabilitySlot } from '@/lib/types';

/**
 * Normalizes availability slots for comparison by removing IDs and sorting
 * This ensures consistent comparison regardless of slot order or generated IDs
 */
export const normalizeAvailabilitySlots = (
  slots: AvailabilitySlot[]
): Array<{ date: string; startTime: string; endTime: string }> => {
  return slots
    .map((slot) => ({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }))
    .sort((a, b) =>
      `${a.date}-${a.startTime}-${a.endTime}`.localeCompare(
        `${b.date}-${b.startTime}-${b.endTime}`
      )
    );
};

/**
 * Checks if two availability slot arrays are different
 * Compares normalized versions (without IDs) to detect actual changes
 */
export const hasAvailabilityChanges = (
  currentSlots: AvailabilitySlot[],
  existingSlots: AvailabilitySlot[]
): boolean => {
  const currentNormalized = normalizeAvailabilitySlots(currentSlots);
  const existingNormalized = normalizeAvailabilitySlots(existingSlots);

  return (
    JSON.stringify(currentNormalized) !== JSON.stringify(existingNormalized)
  );
};
