import { DatabaseClient } from '@/infra/db/types';
import { GetUserProfile, UpdateUserProfileData } from '@/infra/db/types/db';

export class UserProfilesRepository {
  constructor(private database: DatabaseClient) {
    this.database.connect();
  }

  async updateUserProfile(
    profileData: UpdateUserProfileData,
    userId: string
  ): Promise<void> {
    await this.database.update('profiles', {
      filters: [{ field: 'id', op: 'eq', value: userId }],
      data: { ...profileData, updated_at: new Date().toISOString() },
    });
  }

  async getCurrentUserProfile(userId: string): Promise<GetUserProfile> {
    const result = await this.database.findOne<GetUserProfile>('profiles', {
      select: ['*'],
      filters: [{ field: 'id', op: 'eq', value: userId }],
    });
    return result;
  }
}
