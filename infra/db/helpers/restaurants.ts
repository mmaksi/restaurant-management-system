import { RestaurantsRepository } from '@/infra/db/repositories/restaurants';
import {
  InsertAdminRestaurantData,
  Restaurant,
  UpdateAdminRestaurantData,
} from '@/infra/db/types/db';
import { AuthRepository } from '@/infra/db/repositories/auth';
import { databaseClient } from '@/infra/config';

const authRepository = new AuthRepository(databaseClient);
const restaurantsRepository = new RestaurantsRepository(databaseClient);

export async function httpCreateAdminRestaurant(
  userId: string,
  restaurantData: InsertAdminRestaurantData
): Promise<InsertAdminRestaurantData> {
  return restaurantsRepository.createAdminRestaurant(userId, restaurantData);
}

export async function httpGetAllAdminRestaurants(userId: string) {
  return restaurantsRepository.getAllAdminRestaurants(userId);
}

export async function httpGetAllManagerRestaurants(userId: string) {
  const hasManagerRole = await authRepository.hasRole(userId, 'manager');
  if (!hasManagerRole) throw new Error('User is not a manager');
  return restaurantsRepository.getAllManagerRestaurants(userId);
}

export async function httpUpdateAdminRestaurant(
  restaurantId: string,
  updateData: UpdateAdminRestaurantData
): Promise<UpdateAdminRestaurantData> {
  return restaurantsRepository.updateAdminRestaurant(restaurantId, updateData);
}

export async function httpDeleteAdminRestaurant(
  restaurantId: string
): Promise<void> {
  return restaurantsRepository.deleteAdminRestaurant(restaurantId);
}

export async function httpFetchRestaurants(
  userId: string
): Promise<Restaurant[]> {
  return restaurantsRepository.fetchRestaurants(userId);
}
