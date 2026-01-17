import { RestaurantTable, Reservation } from '@/lib/types';
import { DEFAULT_RESERVATION_DURATION } from '@/lib/constants';

/**
 * Check if two tables can be merged
 */
export function canMergeTables(table1: RestaurantTable, table2: RestaurantTable): boolean {
  // Tables can be merged if:
  // 1. Both are mergeable
  // 2. Both are available (not occupied or reserved)
  // 3. They are on the same floor
  return (
    table1.isMergeable &&
    table2.isMergeable &&
    table1.status === 'available' &&
    table2.status === 'available' &&
    table1.floor_id === table2.floor_id
  );
}

/**
 * Merge two tables together
 */
export function mergeTables(table1: RestaurantTable, table2: RestaurantTable): RestaurantTable {
  if (!canMergeTables(table1, table2)) {
    throw new Error('Tables cannot be merged');
  }

  return {
    ...table1,
    id: `merged-${table1.id}-${table2.id}`,
    capacity: table1.capacity + table2.capacity,
    merged_with: [...(table1.merged_with || [table1.id]), ...(table2.merged_with || [table2.id])],
    position: table1.position, // Keep the position of the first table
  };
}

/**
 * Unmerge a merged table back to individual tables
 */
export function unmergeTable(mergedTable: RestaurantTable, allTables: RestaurantTable[]): RestaurantTable[] {
  if (!mergedTable.merged_with || mergedTable.merged_with.length === 0) {
    return [mergedTable];
  }

  // Find the original tables
  const originalTables = allTables.filter((table) =>
    mergedTable.merged_with?.includes(table.id)
  );

  return originalTables;
}

/**
 * Get table status for a specific date and time based on reservations
 */
export function getTableStatus(
  tableId: string,
  date: string,
  time: string,
  reservations: Reservation[]
): 'available' | 'occupied' | 'reserved' {
  // Check if table has a reservation at this time
  const reservation = reservations.find((res) => {
    if (res.status === 'cancelled') return false;
    if (res.date !== date) return false;
    if (!res.table_ids.includes(tableId)) return false;

    // Check if the time overlaps with the reservation
    const resTime = parseTime(res.time);
    const checkTime = parseTime(time);
    const resEndTime = resTime + DEFAULT_RESERVATION_DURATION * 60; // Convert hours to minutes

    return checkTime >= resTime && checkTime < resEndTime;
  });

  if (reservation) {
    // Determine if it's currently occupied or just reserved
    const now = new Date();
    const resDate = new Date(reservation.date + 'T' + reservation.time);
    
    if (now >= resDate) {
      return 'occupied';
    }
    return 'reserved';
  }

  return 'available';
}

/**
 * Parse time string (HH:mm) to minutes
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get all reservations for a specific date
 */
export function getReservationsForDate(reservations: Reservation[], date: string): Reservation[] {
  return reservations.filter(
    (res) => res.date === date && res.status !== 'cancelled'
  );
}

/**
 * Get all reservations for a specific table
 */
export function getReservationsForTable(
  reservations: Reservation[],
  tableId: string
): Reservation[] {
  return reservations.filter(
    (res) => res.table_ids.includes(tableId) && res.status !== 'cancelled'
  );
}

/**
 * Check if tables have enough capacity for number of guests
 */
export function hasEnoughCapacity(tables: RestaurantTable[], numberOfGuests: number): boolean {
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  return totalCapacity >= numberOfGuests;
}

/**
 * Get recommended tables for number of guests
 */
export function getRecommendedTables(
  allTables: RestaurantTable[],
  numberOfGuests: number,
  date: string,
  time: string,
  reservations: Reservation[]
): RestaurantTable[] {
  // Filter available tables
  const availableTables = allTables.filter(
    (table) => getTableStatus(table.id, date, time, reservations) === 'available'
  );

  // Sort by capacity (closest to number of guests first)
  const sortedTables = [...availableTables].sort((a, b) => {
    const diffA = Math.abs(a.capacity - numberOfGuests);
    const diffB = Math.abs(b.capacity - numberOfGuests);
    return diffA - diffB;
  });

  // Try to find a single table that fits
  const singleTable = sortedTables.find((table) => table.capacity >= numberOfGuests);
  if (singleTable) {
    return [singleTable];
  }

  // Try to find mergeable tables
  const mergeableTables = sortedTables.filter((table) => table.isMergeable);
  const selectedTables: RestaurantTable[] = [];
  let currentCapacity = 0;

  for (const table of mergeableTables) {
    if (currentCapacity >= numberOfGuests) break;
    selectedTables.push(table);
    currentCapacity += table.capacity;
  }

  if (currentCapacity >= numberOfGuests) {
    return selectedTables;
  }

  return [];
}

/**
 * Calculate size multiplier for table rendering based on capacity
 */
export function getTableSizeMultiplier(capacity: number): number {
  const baseCapacity = 2;
  return capacity / baseCapacity;
}

/**
 * Check if a point is inside a table (for drag and drop collision detection)
 */
export function isPointInTable(
  point: { x: number; y: number },
  table: RestaurantTable,
  tableSize: { width: number; height: number }
): boolean {
  if (!table.position) return false;

  const { x, y } = table.position;
  const multiplier = getTableSizeMultiplier(table.capacity);
  const width = tableSize.width * multiplier;
  const height = tableSize.height * multiplier;

  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

/**
 * Validate reservation data
 */
export function validateReservation(data: {
  customer_name: string;
  customer_phone: string;
  date: string;
  time: string;
  number_of_guests: number;
  table_ids: string[];
}): string | null {
  if (!data.customer_name.trim()) {
    return 'Customer name is required';
  }

  if (!data.customer_phone.trim()) {
    return 'Customer phone is required';
  }

  if (!data.date) {
    return 'Date is required';
  }

  if (!data.time) {
    return 'Time is required';
  }

  if (data.number_of_guests < 1) {
    return 'Number of guests must be at least 1';
  }

  if (data.table_ids.length === 0) {
    return 'At least one table must be selected';
  }

  return null;
}

/**
 * Format reservation time for display
 */
export function formatReservationTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format reservation date for display
 */
export function formatReservationDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

