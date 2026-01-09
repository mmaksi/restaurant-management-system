import { DatabaseClient } from '@/infra/db/types';
import {
  GetRestaurantAdminsData,
  GetUserProfile,
  GetRestaurantManagersData,
  InsertProfileData,
  InsertRestaurantManagers,
  InsertUserRoleData,
  Restaurant,
  UpdateUserProfileData,
} from '@/infra/db/types/db';
import { inviteUserByEmail } from '@/infra/auth/helpers/server';
import { Database, Tables } from '@/lib/types/supabase';

export class ManagersRepository {
  constructor(private database: DatabaseClient) {
    this.database.connect();
  }

  async createManager(
    restaurantId: string,
    managerData: InsertProfileData & {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }
  ): Promise<
    Tables<'restaurant_managers'> & {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      restaurant_name: string | null;
    }
  > {
    if (!managerData.email) {
      throw new Error('Email is required to create a manager');
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
      managerData.email,
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
        first_name: managerData.first_name,
        last_name: managerData.last_name,
        signup_token: signupToken,
        updated_at: new Date().toISOString(),
      },
      filters: [{ field: 'id', op: 'eq', value: userId }],
    });

    // Step 3: Link manager to restaurant
    const restaurantManager = await this.database.insertOne<
      Database['public']['Tables']['restaurant_managers']['Insert'] & {
        restaurants: { id: string; name: string };
      }
    >('restaurant_managers', {
      data: {
        restaurant_id: restaurantId,
        manager_id: userId,
      },
      select: [
        'id',
        'restaurant_id',
        'manager_id',
        'restaurants:restaurants!restaurant_id(id, name)',
      ],
    });

    // Step 4: Update role from default employee role to manager role
    // The trigger handle_new_user() assigns the default 'employee' role (role_id: 3)
    // We need to delete the employee role and assign the manager role (role_id: 2)
    await this.database.delete('user_roles', {
      filters: [{ field: 'user_id', op: 'eq', value: userId }],
    });

    await this.database.insertOne<InsertUserRoleData>('user_roles', {
      data: {
        user_id: userId,
        role_id: 2, // manager role
      },
    });

    const restaurant = restaurantManager.restaurants as unknown as {
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
      id: userId, // Use profile id (manager_id) as id to match Manager interface
      manager_id: userId,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      email: profile?.email || managerData.email,
      restaurant_id: restaurantId,
      restaurant_name: restaurant?.name || null,
    };
  }

  async updateAdminManager(
    managerId: string,
    updateData: UpdateUserProfileData & {
      restaurant_id: string;
      old_restaurant_id: string;
    }
  ): Promise<void> {
    // Extract only profile fields (exclude restaurant_id and old_restaurant_id)
    const { restaurant_id, old_restaurant_id, ...profileUpdateData } =
      updateData;

    await this.database.update<UpdateUserProfileData>('profiles', {
      data: { ...profileUpdateData, updated_at: new Date().toISOString() },
      filters: [{ field: 'id', op: 'eq', value: managerId }],
    });

    // Handle restaurant assignment changes
    if (restaurant_id !== old_restaurant_id) {
      await this.database.delete('restaurant_managers', {
        filters: [
          { field: 'manager_id', op: 'eq', value: managerId },
          {
            field: 'restaurant_id',
            op: 'eq',
            value: old_restaurant_id,
          },
        ],
      });

      await this.database.insertOne<InsertRestaurantManagers>(
        'restaurant_managers',
        {
          data: {
            restaurant_id: restaurant_id,
            manager_id: managerId,
          },
        }
      );
    }
  }

  async deleteAdminManager(managerId: string): Promise<void> {
    await this.database.delete('restaurant_managers', {
      filters: [{ field: 'manager_id', op: 'eq', value: managerId }],
    });

    await this.database.delete('user_roles', {
      filters: [{ field: 'user_id', op: 'eq', value: managerId }],
    });

    await this.database.delete('profiles', {
      filters: [{ field: 'id', op: 'eq', value: managerId }],
    });
  }

  async getAllAdminManagers(userId: string) {
    // Get admin's restaurants
    const adminRestaurants =
      await this.database.findMany<GetRestaurantAdminsData>(
        'restaurant_admins',
        {
          select: ['restaurant_id'],
          filters: [{ field: 'admin_id', op: 'eq', value: userId }],
        }
      );

    if (!adminRestaurants || adminRestaurants.length === 0) {
      return [];
    }
    const restaurantIds = adminRestaurants.map((ar) => ar.restaurant_id);

    // Get all managers in admin's restaurants
    const managersData = await this.database.findMany<
      GetRestaurantManagersData & {
        profiles: GetUserProfile;
        restaurants: Restaurant;
      }
    >('restaurant_managers', {
      select: [
        'manager_id',
        'restaurant_id',
        'profiles:profiles!manager_id(id, first_name, last_name, email)',
        'restaurants:restaurants!restaurant_id(id, name)',
      ],
      filters: [
        {
          field: 'restaurant_id',
          op: 'in',
          value: adminRestaurants.map((ar) => ar.restaurant_id),
        },
        {
          field: 'restaurant_id',
          op: 'in',
          value: restaurantIds,
        },
      ],
    });

    // Extract and return manager profiles with restaurant info
    const managersList =
      managersData
        ?.map((m) => {
          // Type assertion for Supabase join result
          const profile = m.profiles as GetUserProfile | null;
          const restaurant = m.restaurants as Restaurant | null;
          if (!profile) return null;
          return {
            ...profile,
            restaurant_id: m.restaurant_id || null,
            restaurant_name: restaurant?.name || null,
          };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null) || [];

    return managersList;
  }
}
