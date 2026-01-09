import {
  Reservation,
  Floor,
  RestaurantTable,
  TableLayout,
  ReservationFormData,
} from '@/lib/types';
import {
  DEMO_FLOORS,
  DEMO_RESERVATIONS,
  GROUND_FLOOR_TABLES,
  FIRST_FLOOR_TABLES,
} from '@/lib/constants';

// In-memory storage for demo data (simulating database)
let floors: Floor[] = JSON.parse(JSON.stringify(DEMO_FLOORS));
let reservations: Reservation[] = JSON.parse(JSON.stringify(DEMO_RESERVATIONS));
let customLayouts: Map<string, TableLayout> = new Map();

/**
 * Get all floors for a restaurant
 */
export async function getFloors(restaurantId: string): Promise<Floor[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return floors.filter((floor) => floor.restaurant_id === restaurantId);
}

/**
 * Get all reservations for a restaurant
 */
export async function getReservations(restaurantId: string): Promise<Reservation[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return reservations.filter((res) => res.restaurant_id === restaurantId);
}

/**
 * Get reservations for a specific date
 */
export async function getReservationsByDate(
  restaurantId: string,
  date: string
): Promise<Reservation[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return reservations.filter(
    (res) => res.restaurant_id === restaurantId && res.date === date
  );
}

/**
 * Create a new reservation
 */
export async function createReservation(
  data: ReservationFormData,
  restaurantId: string,
  userId: string
): Promise<Reservation> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const newReservation: Reservation = {
    id: `reservation-${Date.now()}`,
    restaurant_id: restaurantId,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    date: data.date,
    time: data.time,
    number_of_guests: data.number_of_guests,
    table_ids: data.table_ids,
    floor_id: data.floor_id,
    status: 'confirmed',
    special_requests: data.special_requests,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: userId,
  };

  reservations.push(newReservation);
  return newReservation;
}

/**
 * Update an existing reservation
 */
export async function updateReservation(
  reservationId: string,
  data: Partial<ReservationFormData>
): Promise<Reservation> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const index = reservations.findIndex((res) => res.id === reservationId);
  if (index === -1) {
    throw new Error('Reservation not found');
  }

  reservations[index] = {
    ...reservations[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  return reservations[index];
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const index = reservations.findIndex((res) => res.id === reservationId);
  if (index === -1) {
    throw new Error('Reservation not found');
  }

  reservations[index] = {
    ...reservations[index],
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get table layout for a specific floor, date, and time
 */
export async function getTableLayout(
  floorId: string,
  date: string,
  time: string
): Promise<RestaurantTable[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const layoutKey = `${floorId}-${date}-${time}`;
  const customLayout = customLayouts.get(layoutKey);

  if (customLayout) {
    return customLayout.layout;
  }

  // Return default layout
  const floor = floors.find((f) => f.id === floorId);
  return floor?.tables || [];
}

/**
 * Save table layout for a specific floor, date, and time
 */
export async function saveTableLayout(
  floorId: string,
  date: string,
  time: string,
  layout: RestaurantTable[]
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const layoutKey = `${floorId}-${date}-${time}`;
  const tableLayout: TableLayout = {
    id: `layout-${Date.now()}`,
    floor_id: floorId,
    date,
    time,
    layout,
    is_default: false,
  };

  customLayouts.set(layoutKey, tableLayout);
}

/**
 * Reset table layout to default
 */
export async function resetTableLayout(floorId: string): Promise<RestaurantTable[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const floor = floors.find((f) => f.id === floorId);
  
  if (floorId === 'floor-1') {
    return JSON.parse(JSON.stringify(GROUND_FLOOR_TABLES));
  } else if (floorId === 'floor-2') {
    return JSON.parse(JSON.stringify(FIRST_FLOOR_TABLES));
  }

  return floor?.tables || [];
}

/**
 * Reset all demo data (useful for testing)
 */
export function resetDemoData(): void {
  floors = JSON.parse(JSON.stringify(DEMO_FLOORS));
  reservations = JSON.parse(JSON.stringify(DEMO_RESERVATIONS));
  customLayouts.clear();
}

