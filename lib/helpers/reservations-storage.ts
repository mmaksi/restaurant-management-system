import type { Reservation, RestaurantTable, TableStatus } from '@/lib/types';
import { FIRST_FLOOR_TABLES, GROUND_FLOOR_TABLES } from '@/lib/constants';
import { getTableStatus } from '@/lib/helpers/reservations';

export const TABLE_LAYOUT_PERSIST_MINUTES = 60;
export const TABLE_LAYOUT_TIME_STEP_MINUTES = 15;

export function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  return safeParseJson<T>(localStorage.getItem(key));
}

export function saveJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function defaultLayoutKey(restaurantId: string, floorId: string): string {
  return `rms:table-layout:default:${restaurantId}:${floorId}`;
}

export function slotLayoutKey(
  restaurantId: string,
  floorId: string,
  date: string,
  time: string
): string {
  return `rms:table-layout:slot:${restaurantId}:${floorId}:${date}:${time}`;
}

export function reservationsKey(restaurantId: string): string {
  return `rms:reservations:${restaurantId}`;
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function parseTimeToMinutes(time: string): number {
  const [hh, mm] = time.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  return hh * 60 + mm;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return formatMinutesToTime(parseTimeToMinutes(time) + minutes);
}

export function getTimeKeysForDuration(opts: {
  time: string;
  minutes: number;
  stepMinutes?: number;
}): string[] {
  const { time, minutes, stepMinutes = TABLE_LAYOUT_TIME_STEP_MINUTES } = opts;
  const result: string[] = [];
  const start = parseTimeToMinutes(time);
  // End-exclusive: for 60 minutes @ 15m steps -> 09:00, 09:15, 09:30, 09:45
  const steps = Math.max(0, Math.floor(minutes / stepMinutes));
  for (let i = 0; i < steps; i += 1) {
    result.push(formatMinutesToTime(start + i * stepMinutes));
  }
  return result;
}

export function demoTablesForFloor(floorId: string): RestaurantTable[] {
  if (floorId === 'floor-1') return clone(GROUND_FLOOR_TABLES);
  if (floorId === 'floor-2') return clone(FIRST_FLOOR_TABLES);
  return [];
}

export function normalizeTables(
  tables: RestaurantTable[],
  floorId: string
): RestaurantTable[] {
  return tables.map((t) => ({
    ...t,
    floor_id: floorId,
    status: (t.status ?? 'available') as TableStatus,
    position: t.position ?? { x: 40, y: 40 },
  }));
}

export function loadDefaultLayout(
  restaurantId: string,
  floorId: string
): RestaurantTable[] {
  const stored = loadJson<RestaurantTable[]>(defaultLayoutKey(restaurantId, floorId));
  const base = stored && stored.length ? stored : demoTablesForFloor(floorId);
  return normalizeTables(base, floorId).map((t) => ({ ...t, status: 'available' }));
}

export function loadSlotLayoutOrDefault(opts: {
  restaurantId: string;
  floorId: string;
  date: string;
  time: string;
}): RestaurantTable[] {
  const { restaurantId, floorId, date, time } = opts;
  // Slot layouts are persisted in 15-minute steps for 1 hour,
  // so we can load by exact key.
  const stored = loadJson<RestaurantTable[]>(
    slotLayoutKey(restaurantId, floorId, date, time)
  );
  if (stored && stored.length) return normalizeTables(stored, floorId);

  return loadDefaultLayout(restaurantId, floorId);
}

export function saveSlotLayoutForOneHour(opts: {
  restaurantId: string;
  floorId: string;
  date: string;
  time: string;
  tables: RestaurantTable[];
}): void {
  const { restaurantId, floorId, date, time, tables } = opts;
  const times = getTimeKeysForDuration({
    time,
    minutes: TABLE_LAYOUT_PERSIST_MINUTES,
  });
  for (const t of times) {
    saveJson(slotLayoutKey(restaurantId, floorId, date, t), tables);
  }
}

export function loadReservations(restaurantId: string): Reservation[] {
  const stored = loadJson<Reservation[]>(reservationsKey(restaurantId));
  return stored ?? [];
}

export function saveReservations(restaurantId: string, reservations: Reservation[]): void {
  saveJson(reservationsKey(restaurantId), reservations);
}

export function applyStatusesForSlot(opts: {
  tables: RestaurantTable[];
  date: string;
  time: string;
  reservations: Reservation[];
}): RestaurantTable[] {
  const { tables, date, time, reservations } = opts;
  return tables.map((t) => ({
    ...t,
    status: getTableStatus(t.id, date, time, reservations),
  }));
}

