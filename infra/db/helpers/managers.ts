import { databaseClient } from '@/infra/config';
import { ManagersRepository } from '@/infra/db/repositories/managers';
import { AuthRepository } from '@/infra/db/repositories/auth';
import { InsertProfileData, UpdateUserProfileData } from '@/infra/db/types/db';

const authRepository = new AuthRepository(databaseClient);
const managersRepository = new ManagersRepository(databaseClient);

export async function httpCreateManager(
  restaurantId: string,
  managerData: InsertProfileData & {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }
) {
  return managersRepository.createManager(restaurantId, managerData);
}

// ❌ TODO:Error
export async function httpUpdateAdminManager(
  managerId: string,
  updateData: UpdateUserProfileData & {
    restaurant_id: string;
    old_restaurant_id: string;
  }
): Promise<void> {
  return managersRepository.updateAdminManager(managerId, updateData);
}

export async function httpDeleteAdminManager(managerId: string): Promise<void> {
  return managersRepository.deleteAdminManager(managerId);
}

export async function httpGetAllAdminManagers(userId: string) {
  const userRole = await authRepository.hasRole(userId, 'admin');
  if (!userRole) throw new Error('User is not an admin');
  return managersRepository.getAllAdminManagers(userId);
}
