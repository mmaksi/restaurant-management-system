import { Column } from '@/lib/types/data';
import { Tables, TablesInsert, TablesUpdate } from '@/lib/types/supabase';

export type Filter =
  | { field: string; op: 'eq'; value: unknown }
  | { field: string; op: 'neq'; value: unknown }
  | { field: string; op: 'gt'; value: unknown }
  | { field: string; op: 'gte'; value: unknown }
  | { field: string; op: 'lt'; value: unknown }
  | { field: string; op: 'lte'; value: unknown }
  | { field: string; op: 'like'; value: string }
  | { field: string; op: 'ilike'; value: string }
  | { field: string; op: 'in'; value: unknown[] }
  | { field: string; op: 'is'; value: null | boolean }
  | { field: string; op: 'contains'; value: unknown[] }
  | { field: string; op: 'containedBy'; value: unknown[] };

export interface OrderBy {
  field: string;
  ascending: boolean;
}

export interface DatabaseClient {
  connect(): void;

  query<T>(table: string, query: string): Promise<T[]>;

  /**
   * Returns an array of records based on query options
   * @param table - The table to query
   * @param options - The options for the query
   * @param options.select - The columns to select
   * @param options.filters - The filters to apply to the query
   * @param options.orderBy - The order by to apply to the query
   * @returns
   */
  findMany<T>(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<T[]>;

  /**
   * Returns a single record based on query options
   * @param table - The table to query
   * @param options - The options for the query
   * @param options.select - The columns to select
   * @param options.filters - The filters to apply to the query
   * @param options.orderBy - The order by to apply to the query
   * @returns
   */
  findOne<T>(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<T>;

  /**
   * Inserts a single record into the database
   * @param table - The table to insert the record into
   * @param options - The options for the insert
   * @param options.filters - The filters to apply to the insert
   * @param options.orderBy - The order by to apply to the insert
   * @param options.data - The data to insert
   * @param options.select - The columns to select
   * @returns The inserted record
   */
  insertOne<T>(
    table: string,
    options?: {
      filters?: Filter[];
      orderBy?: OrderBy[];
      data: Partial<T>;
      select?: string[];
    }
  ): Promise<T>;

  /**
   * Inserts multiple records into the database
   * @param table - The table to insert the records into
   * @param options - The options for the insert
   * @param options.data - The array of data to insert
   * @param options.select - The columns to select
   * @returns The inserted records
   */
  insertMany<T>(
    table: string,
    options?: {
      data: Partial<T>[];
      select?: string[];
    }
  ): Promise<T[]>;

  update<T>(
    table: string,
    options?: {
      filters?: Filter[];
      orderBy?: OrderBy[];
      data: Partial<T>;
    }
  ): Promise<T>;

  delete(
    table: string,
    options?: {
      select?: string[];
      filters?: Filter[];
      orderBy?: OrderBy[];
    }
  ): Promise<void>;
}

export type UpdateUserProfileData = TablesUpdate<'profiles'>;
export type GetUserProfile = Tables<'profiles'>;
export type InsertProfileData = TablesInsert<'profiles'>;

export type Restaurant = Tables<'restaurants'>;
export type InsertAdminRestaurantData = TablesInsert<'restaurants'>;
export type UpdateAdminRestaurantData = TablesUpdate<'restaurants'>;

export type InsertUserRoleData = TablesInsert<'user_roles'>;
export type GetUserRoleData = Tables<'user_roles'>;

export type GetAdminRestaurantsData = Tables<'restaurant_admins'> & {
  restaurants: Restaurant;
};
export type GetRestaurantAdminsData = Tables<'restaurant_admins'>;

export type GetRestaurantManager = Tables<'restaurant_managers'>;
export type GetRestaurantManagersData = Tables<'restaurant_managers'>;
export type InsertRestaurantManagers = TablesInsert<'restaurant_managers'>;
export type UpdateRestaurantManagers = TablesUpdate<'restaurant_managers'>;

export type GetRestaurantEmployee = Tables<'restaurant_employees'>;
export type RestaurantEmployeeWithProfile = GetRestaurantEmployee & {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  restaurant_name?: string | null;
  availability?: EmployeeAvailability[];
};
export type InsertRestaurantEmployee = TablesInsert<'restaurant_employees'>;
export type UpdateRestaurantEmployee = TablesUpdate<'restaurant_employees'>;

export type InsertEmployeeWeeklyAvailabilityData =
  TablesInsert<'employee_weekly_availability'>;
export type EmployeesAvailabilities = Record<string, EmployeeAvailability[]>;

export type RestaurantId = Column<'restaurants', 'id'>;

export type EmployeeAvailability = Tables<'employee_weekly_availability'>;
