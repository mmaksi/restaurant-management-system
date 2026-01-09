import { databaseClient } from '@/infra/config';
import { UserProfilesRepository } from '@/infra/db/repositories/user-profiles';
import { GetUserProfile, UpdateUserProfileData } from '@/infra/db/types/db';

const userProfilesRepository = new UserProfilesRepository(databaseClient);

export async function httpUpdateUserProfile(
  userId: string,
  profileData: UpdateUserProfileData
): Promise<void> {
  await userProfilesRepository.updateUserProfile(profileData, userId);
}

export async function httpGetCurrentUserProfile(
  userId: string
): Promise<GetUserProfile> {
  return userProfilesRepository.getCurrentUserProfile(userId);
}
