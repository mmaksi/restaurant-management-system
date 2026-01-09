import { SupabaseDatabaseClient } from '@/infra/db/clients/supabase-client';
import { EmployeesRepository } from '@/infra/db/repositories/employees';
import { Employee } from '@/lib/types';
import { AuthRepository } from '@/infra/db/repositories/auth';
import { databaseClient } from '@/infra/config';
import {
  EmployeeAvailability,
  InsertEmployeeWeeklyAvailabilityData,
  InsertRestaurantEmployee,
  UpdateRestaurantEmployee,
} from '@/infra/db/types/db';

const employeesRepository = new EmployeesRepository(databaseClient);
const authRepository = new AuthRepository(databaseClient);

export async function httpGetEmployeeRestaurant(
  userId: string
): Promise<string> {
  return await employeesRepository.getEmployeeRestaurantId(userId);
}

export async function httpGetEmployeeAvailability(
  userId: string,
  weekStart: string // YYYY-MM-DD format
): Promise<EmployeeAvailability[]> {
  return await employeesRepository.getEmployeeAvailability(userId, weekStart);
}

export async function httpSubmitEmployeeAvailability(
  userId: string,
  weekStart: string, // YYYY-MM-DD format
  availabilitySlots: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>
): Promise<void> {
  return await employeesRepository.submitEmployeeAvailability(
    userId,
    weekStart,
    availabilitySlots as InsertEmployeeWeeklyAvailabilityData[]
  );
}

// Get all employees for restaurants managed by the current manager
export async function httpGetAllManagerEmployees(
  userId: string,
  weekStart?: string
): Promise<Employee[]> {
  const hasManagerRole = await authRepository.hasRole(userId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');
  return await employeesRepository.getAllManagerEmployees(userId, weekStart);
}

// Create a new employee and assign to a restaurant
export async function httpCreateEmployee(
  managerId: string,
  restaurantId: string,
  employeeData: InsertRestaurantEmployee & {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }
): Promise<Employee> {
  const authRepository = new AuthRepository(new SupabaseDatabaseClient());
  const hasManagerRole = await authRepository.hasRole(managerId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');

  // The createEmployee method now handles user invitation internally
  const employee = await employeesRepository.createEmployee(
    managerId,
    restaurantId,
    employeeData
  );

  return employee;
}

// Update an employee
export async function httpUpdateEmployee(
  userId: string,
  employeeId: string,
  updateData: UpdateRestaurantEmployee & {
    old_restaurant_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  }
): Promise<void> {
  console.log('updateData', updateData);
  console.log('employeeId', employeeId);
  console.log('userId', userId);
  const hasManagerRole = await authRepository.hasRole(userId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');
  return employeesRepository.updateEmployee(userId, employeeId, updateData);
}

// Delete an employee (remove from restaurant, optionally delete profile)
export async function httpDeleteEmployee(
  userId: string,
  employeeId: string
): Promise<void> {
  const hasManagerRole = await authRepository.hasRole(userId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');
  return await employeesRepository.deleteEmployee(userId, employeeId);
}

// Update confirmed availability blocks for a week
export async function httpUpdateConfirmedAvailability(
  managerId: string,
  weekStart: string,
  confirmedBlocks: Array<{
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
  }>
): Promise<void> {
  const hasManagerRole = await authRepository.hasRole(managerId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');
  return await employeesRepository.updateConfirmedAvailability(
    managerId,
    weekStart,
    confirmedBlocks
  );
}
