import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/lib/types/data';
import { Tables } from '@/lib/types/supabase';
import { EmployeeAvailability } from '@/infra/db/types/db';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  signup_token: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export type Employee = Tables<'restaurant_employees'> & {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  restaurant_name?: string | null;
  availability?: EmployeeAvailability[];
};

export interface TimeSlot {
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface ScheduleEntry {
  id?: string; // Unique ID for the schedule entry
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  confirmed: boolean;
}

export interface ConfirmedBlock {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface WeekSchedule {
  weekStart: string; // ISO date string
  entries: ScheduleEntry[];
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  available: boolean;
  href: string;
  roles: UserRole[];
}

export interface Booking {
  id: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  reservationName: string;
  numberOfGuests: number;
  phone?: string; // Optional phone number
  specialRequests?: string; // Optional special requests
}

export interface AvailabilitySlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  confirmed?: boolean;
}

export interface Manager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  restaurant_id: string | null;
  restaurant_name: string | null;
}

// Reservation Management Types
export type TableShape = 'rectangle' | 'circle' | 'square';
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface RestaurantTable {
  id: string;
  number: number;
  shape: TableShape;
  capacity: number; // Number of guests
  isMergeable: boolean;
  status: TableStatus;
  floor_id: string;
  position?: { x: number; y: number }; // Position in canvas
  merged_with?: string[]; // IDs of tables merged with this one
}

export interface Floor {
  id: string;
  restaurant_id: string;
  name: string;
  floor_number: number;
  tables: RestaurantTable[];
}

export interface TableLayout {
  id: string;
  floor_id: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  layout: RestaurantTable[]; // Table positions and merge states
  is_default: boolean;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  number_of_guests: number;
  table_ids: string[]; // Array of table IDs
  floor_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  created_by: string; // Manager user_id
}

export interface ReservationFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  time: string;
  number_of_guests: number;
  floor_id: string;
  table_ids: string[];
  special_requests?: string;
}
