import { extractHoursAndMinutesFromString } from '@/lib/helpers/date-time';
import { DatabaseClient } from '@/infra/db/types';
import { Database, Tables } from '@/lib/types/supabase';
import {
  EmployeesAvailabilities,
  EmployeeAvailability,
  RestaurantEmployeeWithProfile,
  InsertEmployeeWeeklyAvailabilityData,
  InsertRestaurantEmployee,
  RestaurantId,
} from '@/infra/db/types/db';
import { inviteUserByEmail } from '@/infra/auth/helpers/server';

export class EmployeesRepository {
  constructor(private database: DatabaseClient) {
    this.database.connect();
  }

  /**
   * Calculates the end date of a week given a start date
   * @param weekStart - The start date of the week (YYYY-MM-DD format)
   * @returns The end date of the week
   */
  private calculateWeekEnd(weekStart: string): Date {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    return weekEndDate;
  }

  async getEmployeeRestaurantId(userId: string): Promise<string> {
    const data = await this.database.findOne<Tables<'restaurant_employees'>>(
      'restaurant_employees',
      {
        select: ['restaurant_id'],
        filters: [{ field: 'employee_id', op: 'eq', value: userId }],
      }
    );

    if (!data.restaurant_id) {
      throw new Error('Employee restaurant not found');
    }

    return data.restaurant_id;
  }

  /**
   * Returns the availability of an employee for a given week
   * @param userId - The ID of the employee
   * @param weekStart - The start date of the week (YYYY-MM-DD format)
   * @returns The availability of the employee for the given week
   */
  async getEmployeeAvailability(
    userId: string,
    weekStart: string
  ): Promise<EmployeeAvailability[]> {
    const restaurantId = await this.getEmployeeRestaurantId(userId);

    const weekEndDate = this.calculateWeekEnd(weekStart);

    const data = await this.database.findMany<EmployeeAvailability>(
      'employee_weekly_availability',
      {
        filters: [
          { field: 'employee_id', op: 'eq', value: userId },
          { field: 'restaurant_id', op: 'eq', value: restaurantId },
          { field: 'date', op: 'gte', value: weekStart },
          {
            field: 'date',
            op: 'lte',
            value: weekEndDate.toISOString().split('T')[0],
          },
        ],
        select: ['id', 'date', 'start_time', 'end_time', 'confirmed'],
        orderBy: [
          { field: 'date', ascending: true },
          { field: 'start_time', ascending: true },
        ],
      }
    );

    const formattedData = data?.map((slot) => ({
      ...slot,
      start_time: extractHoursAndMinutesFromString(slot.start_time),
      end_time: extractHoursAndMinutesFromString(slot.end_time),
    }));

    return formattedData || [];
  }

  async submitEmployeeAvailability(
    userId: string,
    weekStart: string,
    availabilitySlots: InsertEmployeeWeeklyAvailabilityData[]
  ): Promise<void> {
    const restaurantId = await this.getEmployeeRestaurantId(userId);
    const weekEndDate = this.calculateWeekEnd(weekStart);

    await this.database.delete('employee_weekly_availability', {
      filters: [
        { field: 'employee_id', op: 'eq', value: userId },
        { field: 'restaurant_id', op: 'eq', value: restaurantId },
        { field: 'date', op: 'gte', value: weekStart },
        {
          field: 'date',
          op: 'lte',
          value: weekEndDate.toISOString().split('T')[0],
        },
      ],
    });

    if (availabilitySlots.length > 0) {
      const slotsWithIds = availabilitySlots.map((slot) => ({
        ...slot,
        restaurant_id: restaurantId,
        employee_id: userId,
      }));

      await this.database.insertMany<InsertEmployeeWeeklyAvailabilityData>(
        'employee_weekly_availability',
        {
          data: [...slotsWithIds],
        }
      );

      await this.database.update('restaurant_employees', {
        data: {
          availability_submitted: true,
        },
        filters: [{ field: 'employee_id', op: 'eq', value: userId }],
      });
    }
  }

  async getEmployeesAvailabilities(
    employeeIds: string[],
    restaurantIds: string[],
    weekStart: string
  ): Promise<EmployeesAvailabilities> {
    if (employeeIds.length === 0 || restaurantIds.length === 0) {
      return {};
    }

    const weekEndDate = this.calculateWeekEnd(weekStart);
    const availabilityData = await this.database.findMany<EmployeeAvailability>(
      'employee_weekly_availability',
      {
        filters: [
          { field: 'employee_id', op: 'in', value: employeeIds },
          { field: 'restaurant_id', op: 'in', value: restaurantIds },
          { field: 'date', op: 'gte', value: weekStart },
          {
            field: 'date',
            op: 'lte',
            value: weekEndDate.toISOString().split('T')[0],
          },
        ],
        select: [
          'id',
          'employee_id',
          'date',
          'start_time',
          'end_time',
          'confirmed',
        ],
        orderBy: [
          { field: 'employee_id', ascending: true },
          { field: 'date', ascending: true },
          { field: 'start_time', ascending: true },
        ],
      }
    );

    const formattedData =
      availabilityData?.map((slot) => ({
        ...slot,
        start_time: extractHoursAndMinutesFromString(slot.start_time),
        end_time: extractHoursAndMinutesFromString(slot.end_time),
      })) || [];

    // Group by employee_id
    const availabilityByEmployee: EmployeesAvailabilities = {};
    for (const slot of formattedData) {
      const employeeId = slot.employee_id;
      if (!availabilityByEmployee[employeeId]) {
        availabilityByEmployee[employeeId] = [];
      }
      availabilityByEmployee[employeeId].push(slot);
    }

    return availabilityByEmployee;
  }

  async getAllManagerEmployees(
    userId: string,
    weekStart?: string
  ): Promise<RestaurantEmployeeWithProfile[]> {
    const employeesData =
      await this.database.findMany<RestaurantEmployeeWithProfile>(
        'employee_with_profile_view',
        {
          select: [
            'id',
            'restaurant_id',
            'employee_id',
            'manager_id',
            'hourly_rate',
            'date_of_birth',
            'role',
            'employment_type',
            'max_weekly_hours',
            'priority',
            'overtime_allowed',
            'availability_submitted',
            'first_name',
            'last_name',
            'email',
            'restaurant_name',
          ],
          filters: [{ field: 'manager_id', op: 'eq', value: userId }],
        }
      );

    if (!employeesData || employeesData.length === 0) {
      return [];
    }

    // Fetch availability if weekStart is provided
    if (!weekStart || employeesData.length === 0) {
      return employeesData.map((e) => ({ ...e, availability: [] }));
    }

    const employeeIds = employeesData
      .map((e) => e.employee_id || e.id)
      .filter((id): id is string => id !== null);

    if (employeeIds.length === 0) {
      return employeesData.map((e) => ({ ...e, availability: [] }));
    }

    // Get unique restaurant IDs from employees
    const restaurantIds = [
      ...new Set(
        employeesData
          .map((e) => e.restaurant_id)
          .filter((id): id is string => id !== null)
      ),
    ];

    const availabilityByEmployee = await this.getEmployeesAvailabilities(
      employeeIds,
      restaurantIds,
      weekStart
    );

    return employeesData.map((employee) => ({
      ...employee,
      availability:
        availabilityByEmployee[employee.employee_id || employee.id] || [],
    }));
  }

  async createEmployee(
    managerId: string,
    restaurantId: string,
    employeeData: InsertRestaurantEmployee & {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }
  ): Promise<
    Tables<'restaurant_employees'> & {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      restaurant_name: string | null;
    }
  > {
    const managerRestaurant = await this.database.findOne<{
      restaurant_id: string;
    }>('restaurant_managers', {
      select: ['restaurant_id'],
      filters: [
        { field: 'manager_id', op: 'eq', value: managerId },
        { field: 'restaurant_id', op: 'eq', value: restaurantId },
      ],
    });

    if (!managerRestaurant) {
      throw new Error(
        'You do not have permission to add employees to this restaurant'
      );
    }

    if (!employeeData.email) {
      throw new Error('Email is required to create an employee');
    }

    // Get base URL for invitation redirect
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/auth/invite-signup`;

    // Step 1: Invite the user via Supabase admin API
    // This creates the user in auth.users and triggers handle_new_user() to create the profile
    const { user: invitedUser, error: inviteError } = await inviteUserByEmail(
      employeeData.email,
      redirectUrl
    );

    if (inviteError) {
      throw new Error(
        `Failed to invite user: ${
          inviteError instanceof Error ? inviteError.message : 'Unknown error'
        }`
      );
    }

    // Type guard to check if user has id property
    if (
      !invitedUser ||
      typeof invitedUser !== 'object' ||
      !('id' in invitedUser) ||
      typeof invitedUser.id !== 'string'
    ) {
      throw new Error('Failed to create user: User ID not returned');
    }

    const userId = invitedUser.id;

    // Step 2: Update the profile with additional information
    // The trigger already created the profile with the correct ID, we just need to update it
    const signupToken = crypto.randomUUID();
    await this.database.update('profiles', {
      data: {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        signup_token: signupToken,
        updated_at: new Date().toISOString(),
      },
      filters: [{ field: 'id', op: 'eq', value: userId }],
    });

    // Step 3: Link employee to restaurant
    const restaurantEmployee = await this.database.insertOne<
      Database['public']['Tables']['restaurant_employees']['Insert'] & {
        restaurants: { id: string; name: string };
      }
    >('restaurant_employees', {
      data: {
        restaurant_id: restaurantId,
        employee_id: userId,
        manager_id: managerId,
        hourly_rate: employeeData.hourly_rate,
        date_of_birth: employeeData.date_of_birth || null,
        role: employeeData.role || null,
        employment_type: employeeData.employment_type || null,
        max_weekly_hours: employeeData.max_weekly_hours || null,
        priority: employeeData.priority || null,
        overtime_allowed: employeeData.overtime_allowed ?? null,
      } as Database['public']['Tables']['restaurant_employees']['Insert'],
      select: [
        'id',
        'restaurant_id',
        'employee_id',
        'manager_id',
        'hourly_rate',
        'date_of_birth',
        'role',
        'employment_type',
        'max_weekly_hours',
        'priority',
        'overtime_allowed',
        'availability_submitted',
        'restaurants:restaurants!restaurant_id(id, name)',
      ],
    });

    // Note: The trigger handle_new_user() already assigns the default 'employee' role (role_id: 3)
    // So we don't need to insert into user_roles again

    const restaurant = restaurantEmployee.restaurants as unknown as {
      id: string;
      name: string;
    } | null;

    // Get the updated profile to return the correct data
    const profile = await this.database.findOne<{
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }>('profiles', {
      select: ['first_name', 'last_name', 'email'],
      filters: [{ field: 'id', op: 'eq', value: userId }],
    });

    return {
      id: restaurantEmployee.id || '',
      employee_id: userId,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      email: profile?.email || employeeData.email,
      restaurant_id: restaurantId,
      restaurant_name: restaurant?.name || null,
      manager_id: managerId,
      hourly_rate: Number(restaurantEmployee.hourly_rate) || 0,
      date_of_birth: restaurantEmployee.date_of_birth || null,
      role: restaurantEmployee.role || null,
      employment_type: restaurantEmployee.employment_type || null,
      max_weekly_hours: restaurantEmployee.max_weekly_hours
        ? Number(restaurantEmployee.max_weekly_hours)
        : null,
      priority: restaurantEmployee.priority
        ? Number(restaurantEmployee.priority)
        : null,
      overtime_allowed: restaurantEmployee.overtime_allowed ?? null,
      availability_submitted: restaurantEmployee.availability_submitted ?? null,
    };
  }

  async updateEmployee(
    userId: string,
    employeeId: string,
    updateData: {
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      restaurant_id?: string | null;
      old_restaurant_id?: string | null;
      hourly_rate?: number;
      date_of_birth?: string | null;
      role?: string | null;
      employment_type?: string | null;
      max_weekly_hours?: number | null;
      priority?: number | null;
      overtime_allowed?: boolean | null;
    }
  ): Promise<void> {
    // profiles.id always equals auth.users.id now
    // Verify manager has access to this employee's current restaurant
    const currentEmployee = await this.database.findOne<{
      restaurant_id: string;
      hourly_rate: number;
    }>('restaurant_employees', {
      select: ['restaurant_id', 'hourly_rate'],
      filters: [{ field: 'employee_id', op: 'eq', value: employeeId }],
    });

    if (!currentEmployee) {
      throw new Error('Employee not found');
    }

    // Check if manager manages the current restaurant
    const managerAccess = await this.database.findOne<{
      restaurant_id: string;
    }>('restaurant_managers', {
      select: ['restaurant_id'],
      filters: [
        { field: 'manager_id', op: 'eq', value: userId },
        {
          field: 'restaurant_id',
          op: 'eq',
          value: currentEmployee.restaurant_id,
        },
      ],
    });

    if (!managerAccess) {
      throw new Error('You do not have permission to update this employee');
    }

    // Update profile if name/email changed
    if (
      updateData.first_name !== undefined ||
      updateData.last_name !== undefined ||
      updateData.email !== undefined
    ) {
      await this.database.update('profiles', {
        data: {
          first_name: updateData.first_name,
          last_name: updateData.last_name,
          email: updateData.email,
          updated_at: new Date().toISOString(),
        },
        filters: [{ field: 'id', op: 'eq', value: employeeId }],
      });
    }

    // Update restaurant assignment if changed
    if (
      updateData.restaurant_id !== undefined &&
      updateData.restaurant_id !== currentEmployee.restaurant_id
    ) {
      // Verify manager has access to new restaurant
      if (updateData.restaurant_id) {
        const newRestaurantAccess = await this.database.findOne<{
          restaurant_id: string;
        }>('restaurant_managers', {
          select: ['restaurant_id'],
          filters: [
            { field: 'manager_id', op: 'eq', value: userId },
            {
              field: 'restaurant_id',
              op: 'eq',
              value: updateData.restaurant_id,
            },
          ],
        });

        if (!newRestaurantAccess) {
          throw new Error(
            'You do not have permission to assign employees to this restaurant'
          );
        }
      }

      // Remove from old restaurant
      if (updateData.old_restaurant_id) {
        await this.database.delete('restaurant_employees', {
          filters: [
            { field: 'employee_id', op: 'eq', value: employeeId },
            {
              field: 'restaurant_id',
              op: 'eq',
              value: updateData.old_restaurant_id,
            },
          ],
        });
      }

      // Add to new restaurant
      if (updateData.restaurant_id) {
        await this.database.insertOne('restaurant_employees', {
          data: {
            restaurant_id: updateData.restaurant_id,
            employee_id: employeeId,
            manager_id: userId,
            hourly_rate:
              updateData.hourly_rate !== undefined
                ? updateData.hourly_rate
                : Number(currentEmployee.hourly_rate) || 0,
            date_of_birth: updateData.date_of_birth,
            role: updateData.role,
            employment_type: updateData.employment_type,
            max_weekly_hours: updateData.max_weekly_hours,
            priority: updateData.priority,
            overtime_allowed: updateData.overtime_allowed,
          },
        });
      }
    } else {
      // Update fields in current restaurant
      const updateFields: Record<string, unknown> = {};
      if (updateData.hourly_rate !== undefined) {
        updateFields.hourly_rate = updateData.hourly_rate;
      }
      if (updateData.date_of_birth !== undefined) {
        updateFields.date_of_birth = updateData.date_of_birth;
      }
      if (updateData.role !== undefined) {
        updateFields.role = updateData.role;
      }
      if (updateData.employment_type !== undefined) {
        updateFields.employment_type = updateData.employment_type;
      }
      if (updateData.max_weekly_hours !== undefined) {
        updateFields.max_weekly_hours = updateData.max_weekly_hours;
      }
      if (updateData.priority !== undefined) {
        updateFields.priority = updateData.priority;
      }
      if (updateData.overtime_allowed !== undefined) {
        updateFields.overtime_allowed = updateData.overtime_allowed;
      }

      if (Object.keys(updateFields).length > 0) {
        await this.database.update('restaurant_employees', {
          data: updateFields,
          filters: [
            { field: 'employee_id', op: 'eq', value: employeeId },
            {
              field: 'restaurant_id',
              op: 'eq',
              value: currentEmployee.restaurant_id,
            },
          ],
        });
      }
    }
  }

  async deleteEmployee(userId: string, employeeId: string): Promise<void> {
    // profiles.id always equals auth.users.id now
    // Get employee's restaurant
    const employee = await this.database.findOne<{
      restaurant_id: string;
    }>('restaurant_employees', {
      select: ['restaurant_id'],
      filters: [{ field: 'employee_id', op: 'eq', value: employeeId }],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // TODO: remove after RLS is implemented: Verify manager has access to this restaurant
    const managerAccess = await this.database.findOne<RestaurantId>(
      'restaurant_managers',
      {
        select: ['restaurant_id'],
        filters: [
          { field: 'manager_id', op: 'eq', value: userId },
          { field: 'restaurant_id', op: 'eq', value: employee.restaurant_id },
        ],
      }
    );

    if (!managerAccess) {
      throw new Error('You do not have permission to delete this employee');
    }

    // Remove from restaurant_employees (cascade will handle related data)
    await this.database.delete('restaurant_employees', {
      filters: [{ field: 'employee_id', op: 'eq', value: employeeId }],
    });

    await this.database.delete('profiles', {
      filters: [{ field: 'id', op: 'eq', value: employeeId }],
    });

    await this.database.delete('user_roles', {
      filters: [{ field: 'user_id', op: 'eq', value: employeeId }],
    });
  }

  /**
   * Updates confirmed availability blocks for a given week
   * This replaces all existing availability with new confirmed blocks
   * @param managerId - The ID of the manager making the update
   * @param weekStart - The start date of the week (YYYY-MM-DD format)
   * @param confirmedBlocks - Array of confirmed blocks to save
   */
  async updateConfirmedAvailability(
    managerId: string,
    weekStart: string,
    confirmedBlocks: Array<{
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
    }>
  ): Promise<void> {
    const weekEndDate = this.calculateWeekEnd(weekStart);
    const weekEndStr = weekEndDate.toISOString().split('T')[0];

    // Get all employees managed by this manager
    const managedEmployees = await this.database.findMany<{
      employee_id: string;
      restaurant_id: string;
    }>('restaurant_employees', {
      select: ['employee_id', 'restaurant_id'],
      filters: [{ field: 'manager_id', op: 'eq', value: managerId }],
    });

    if (managedEmployees.length === 0) {
      throw new Error('No employees found for this manager');
    }

    const restaurantIds = [
      ...new Set(managedEmployees.map((e) => e.restaurant_id)),
    ];
    const allEmployeeIds = managedEmployees.map((e) => e.employee_id);

    // Create a map for quick restaurant lookup
    const restaurantMap = new Map<string, string>();
    for (const emp of managedEmployees) {
      restaurantMap.set(emp.employee_id, emp.restaurant_id);
    }

    // Delete all existing availability for managed employees for this week
    if (restaurantIds.length > 0 && allEmployeeIds.length > 0) {
      await this.database.delete('employee_weekly_availability', {
        filters: [
          { field: 'employee_id', op: 'in', value: allEmployeeIds },
          { field: 'restaurant_id', op: 'in', value: restaurantIds },
          { field: 'date', op: 'gte', value: weekStart },
          { field: 'date', op: 'lte', value: weekEndStr },
        ],
      });
    }

    // Insert new confirmed blocks
    if (confirmedBlocks.length > 0) {
      const blocksToInsert = confirmedBlocks
        .map((block) => {
          const restaurantId = restaurantMap.get(block.employeeId);
          if (!restaurantId) return null;

          // Format times to ensure HH:mm format
          const startTime = block.startTime.includes(':')
            ? block.startTime
            : `${block.startTime.padStart(2, '0')}:00`;
          const endTime = block.endTime.includes(':')
            ? block.endTime
            : `${block.endTime.padStart(2, '0')}:00`;

          return {
            employee_id: block.employeeId,
            restaurant_id: restaurantId,
            date: block.date,
            start_time: startTime,
            end_time: endTime,
            confirmed: true,
          };
        })
        .filter((block): block is NonNullable<typeof block> => block !== null);

      if (blocksToInsert.length > 0) {
        await this.database.insertMany<InsertEmployeeWeeklyAvailabilityData>(
          'employee_weekly_availability',
          {
            data: blocksToInsert,
          }
        );
      }
    }
  }
}
