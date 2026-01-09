import { DatabaseClient } from '@/infra/db/types';
import {
  GetAdminRestaurantsData,
  GetRestaurantManager,
  InsertAdminRestaurantData,
  Restaurant,
  UpdateAdminRestaurantData,
} from '@/infra/db/types/db';

export class RestaurantsRepository {
  constructor(private database: DatabaseClient) {
    this.database.connect();
  }

  async createAdminRestaurant(
    userId: string,
    restaurantData: InsertAdminRestaurantData
  ): Promise<InsertAdminRestaurantData> {
    const restaurant = await this.database.insertOne<InsertAdminRestaurantData>(
      'restaurants',
      {
        data: restaurantData,
      }
    );

    await this.database.insertOne('restaurant_admins', {
      data: {
        restaurant_id: restaurant.id,
        admin_id: userId,
      },
    });

    return restaurant;
  }

  async getAllAdminRestaurants(
    userId: string
  ): Promise<GetAdminRestaurantsData[]> {
    const result = await this.database.findMany<GetAdminRestaurantsData>(
      'restaurant_admins',
      {
        select: ['restaurant_id', 'restaurants:restaurants(*)'],
        filters: [{ field: 'admin_id', op: 'eq', value: userId }],
      }
    );
    return result;
  }

  async getAllManagerRestaurants(
    userId: string
  ): Promise<GetRestaurantManager[]> {
    const result = await this.database.findMany<GetRestaurantManager>(
      'restaurant_managers',
      {
        select: ['restaurant_id', 'restaurants:restaurants(*)'],
        filters: [{ field: 'manager_id', op: 'eq', value: userId }],
      }
    );
    return result;
  }

  async updateAdminRestaurant(
    restaurantId: string,
    updateData: UpdateAdminRestaurantData
  ): Promise<UpdateAdminRestaurantData> {
    const result = await this.database.update<UpdateAdminRestaurantData>(
      'restaurants',
      {
        filters: [{ field: 'id', op: 'eq', value: restaurantId }],
        data: { ...updateData, updated_at: new Date().toISOString() },
      }
    );
    return {
      ...result,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  async deleteAdminRestaurant(restaurantId: string): Promise<void> {
    await this.database.delete('restaurants', {
      filters: [{ field: 'id', op: 'eq', value: restaurantId }],
    });

    await this.database.delete('restaurant_admins', {
      filters: [{ field: 'restaurant_id', op: 'eq', value: restaurantId }],
    });
  }

  async fetchRestaurants(userId: string) {
    const adminRestaurants = await this.getAllAdminRestaurants(userId);
    const restaurantList =
      adminRestaurants
        ?.map((ar) => {
          const restaurant = ar.restaurants;
          return restaurant ? restaurant : null;
        })
        .filter((r): r is Restaurant => r !== null) || [];
    return restaurantList;
  }
}
