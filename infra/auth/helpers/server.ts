'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    throw new Error('User not found');
  }

  return claims.claims.sub as string;
}

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  try {
    const { data: claims } = await supabase.auth.getClaims();
    return claims?.claims ? true : false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function inviteUserByEmail(
  email: string,
  redirectUrl: string
): Promise<{ user: unknown; error: unknown }> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: redirectUrl,
    }
  );

  if (error) {
    throw error;
  }

  return { user: data.user, error: null };
}
