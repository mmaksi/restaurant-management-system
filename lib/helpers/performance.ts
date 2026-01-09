/**
 * Compares two objects and returns only the fields that have changed.
 * Useful for partial updates where you only want to update fields that differ from the original.
 *
 * @param original - The original object to compare against
 * @param updated - The updated object with potential changes
 * @returns A partial object containing only the changed fields
 *
 * @example
 * const original = { name: 'John', age: 30, city: 'NYC' };
 * const updated = { name: 'Jane', age: 30, city: 'LA' };
 * const changes = getChangedFields(original, updated);
 * // Returns: { name: 'Jane', city: 'LA' }
 */
function getChangedFields<T extends object>(
  original: T,
  updated: Partial<T>
): Partial<T> {
  const changedFields: Partial<T> = {};

  for (const key in updated) {
    if (
      Object.prototype.hasOwnProperty.call(updated, key) &&
      updated[key] !== undefined &&
      updated[key] !== (original as Record<string, unknown>)[key]
    ) {
      (changedFields as Record<string, unknown>)[key] = updated[key];
    }
  }

  return changedFields;
}

export { getChangedFields };
