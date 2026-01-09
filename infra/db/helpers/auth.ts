import { UserRole } from '@/lib/types/data';
import { AuthRepository } from '@/infra/db/repositories/auth';
import { databaseClient } from '@/infra/config';

export async function getUserRole(userId: string): Promise<UserRole> {
  const authRepository = new AuthRepository(databaseClient);
  const userRole = await authRepository.findUserRole(userId);
  return userRole;
}
