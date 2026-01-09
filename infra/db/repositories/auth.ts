import { DatabaseClient } from '@/infra/db/types';
import { Tables } from '@/lib/types/supabase';
import { UserRole } from '@/lib/types/data';

export class AuthRepository {
  constructor(private database: DatabaseClient) {
    this.database.connect();
  }

  async findUserRole(userId: string): Promise<UserRole> {
    const result = await this.database.findOne<Tables<'user_roles'>>(
      'user_roles',
      {
        select: ['role_id'],
        filters: [{ field: 'user_id', op: 'eq', value: userId }],
      }
    );

    switch (result?.role_id) {
      case 1:
        return 'admin';
      case 2:
        return 'manager';
      case 3:
        return 'employee';
      default:
        throw new Error('User role not found');
    }
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roleIdMap: Record<UserRole, number> = {
      admin: 1,
      manager: 2,
      employee: 3,
    };

    const roleId = roleIdMap[role];
    const results = await this.database.findMany<Tables<'user_roles'>>(
      'user_roles',
      {
        select: ['role_id'],
        filters: [
          { field: 'user_id', op: 'eq', value: userId },
          { field: 'role_id', op: 'eq', value: roleId },
        ],
      }
    );

    return results.length > 0;
  }
}
