'use server';

import { httpGetCurrentUserProfile } from '@/infra/db/helpers';
import SettingsContent from '@/components/Settings/SettingsContent';
import { getUserId } from '@/infra/auth/helpers/server';
import { getUserRole } from '@/infra/db/helpers';

export default async function SettingsDataLoader() {
  const userId = await getUserId();
  if (!userId) {
    return null;
  }
  const userRole = await getUserRole(userId);
  const userIsAdmin = userRole === 'admin';
  const userIsManager = userRole === 'manager';
  const userProfile = await httpGetCurrentUserProfile(userId);

  return (
    <SettingsContent
      isAdmin={userIsAdmin}
      isManager={userIsManager}
      userProfile={userProfile}
    />
  );
}
