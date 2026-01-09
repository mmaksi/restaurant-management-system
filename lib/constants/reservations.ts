import { Floor, RestaurantTable, Reservation, TableLayout } from '@/lib/types';

// Demo data for restaurant floors and tables
export const DEMO_FLOORS: Floor[] = [
  {
    id: 'floor-1',
    restaurant_id: 'demo-restaurant',
    name: 'Ground Floor',
    floor_number: 1,
    tables: [],
  },
  {
    id: 'floor-2',
    restaurant_id: 'demo-restaurant',
    name: 'First Floor',
    floor_number: 2,
    tables: [],
  },
];

// Demo tables for Ground Floor
export const GROUND_FLOOR_TABLES: RestaurantTable[] = [
  // Small tables (2 people) - Rectangle
  {
    id: 'table-1',
    number: 1,
    shape: 'rectangle',
    capacity: 2,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 50, y: 50 },
  },
  {
    id: 'table-2',
    number: 2,
    shape: 'rectangle',
    capacity: 2,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 200, y: 50 },
  },
  {
    id: 'table-3',
    number: 3,
    shape: 'rectangle',
    capacity: 2,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 350, y: 50 },
  },
  // Medium tables (4 people) - Square
  {
    id: 'table-4',
    number: 4,
    shape: 'square',
    capacity: 4,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 50, y: 200 },
  },
  {
    id: 'table-5',
    number: 5,
    shape: 'square',
    capacity: 4,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 250, y: 200 },
  },
  {
    id: 'table-6',
    number: 6,
    shape: 'square',
    capacity: 4,
    isMergeable: false,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 450, y: 200 },
  },
  // Large tables (6 people) - Circle
  {
    id: 'table-7',
    number: 7,
    shape: 'circle',
    capacity: 6,
    isMergeable: false,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 50, y: 400 },
  },
  {
    id: 'table-8',
    number: 8,
    shape: 'circle',
    capacity: 6,
    isMergeable: false,
    status: 'available',
    floor_id: 'floor-1',
    position: { x: 300, y: 400 },
  },
];

// Demo tables for First Floor
export const FIRST_FLOOR_TABLES: RestaurantTable[] = [
  // Small tables (2 people)
  {
    id: 'table-9',
    number: 9,
    shape: 'rectangle',
    capacity: 2,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-2',
    position: { x: 100, y: 100 },
  },
  {
    id: 'table-10',
    number: 10,
    shape: 'rectangle',
    capacity: 2,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-2',
    position: { x: 250, y: 100 },
  },
  // Medium tables (4 people)
  {
    id: 'table-11',
    number: 11,
    shape: 'square',
    capacity: 4,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-2',
    position: { x: 100, y: 250 },
  },
  {
    id: 'table-12',
    number: 12,
    shape: 'square',
    capacity: 4,
    isMergeable: true,
    status: 'available',
    floor_id: 'floor-2',
    position: { x: 300, y: 250 },
  },
  // Large table (8 people)
  {
    id: 'table-13',
    number: 13,
    shape: 'rectangle',
    capacity: 8,
    isMergeable: false,
    status: 'available',
    floor_id: 'floor-2',
    position: { x: 150, y: 450 },
  },
];

// Populate floors with tables
DEMO_FLOORS[0].tables = GROUND_FLOOR_TABLES;
DEMO_FLOORS[1].tables = FIRST_FLOOR_TABLES;

// Demo reservations
export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'reservation-1',
    restaurant_id: 'demo-restaurant',
    customer_name: 'John Smith',
    customer_phone: '+1234567890',
    customer_email: 'john.smith@email.com',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    number_of_guests: 4,
    table_ids: ['table-4'],
    floor_id: 'floor-1',
    status: 'confirmed',
    special_requests: 'Window seat preferred',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-manager',
  },
  {
    id: 'reservation-2',
    restaurant_id: 'demo-restaurant',
    customer_name: 'Sarah Johnson',
    customer_phone: '+1234567891',
    customer_email: 'sarah.j@email.com',
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    number_of_guests: 2,
    table_ids: ['table-1'],
    floor_id: 'floor-1',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-manager',
  },
  {
    id: 'reservation-3',
    restaurant_id: 'demo-restaurant',
    customer_name: 'Michael Brown',
    customer_phone: '+1234567892',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '18:30',
    number_of_guests: 6,
    table_ids: ['table-7'],
    floor_id: 'floor-1',
    status: 'confirmed',
    special_requests: 'Birthday celebration',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-manager',
  },
];

// Default table layout (can be reset to this)
export const DEFAULT_TABLE_LAYOUT: TableLayout = {
  id: 'default-layout',
  floor_id: 'floor-1',
  date: '',
  time: '',
  layout: GROUND_FLOOR_TABLES,
  is_default: true,
};

// Time slots for reservations
export const RESERVATION_TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];

// Duration for reservations (in hours)
export const DEFAULT_RESERVATION_DURATION = 2;

