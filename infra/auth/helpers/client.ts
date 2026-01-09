'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthTokenResponsePassword, Session } from '@supabase/supabase-js';

const supabase = createClient();

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function getUserId(): Promise<string> {
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims?.sub) {
    throw new Error('User not found');
  }

  return claims.claims.sub as string;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: claims } = await supabase.auth.getClaims();
    return claims?.claims ? true : false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Fetch authentication session data
 * Used by React Query for caching authentication state
 */
export async function fetchAuthSession() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  return {
    session: sessionData.session,
    isAuthenticated: !!sessionData.session,
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthTokenResponsePassword> {
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  redirectTo?: string
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/`,
    },
  });
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: 'google' | 'github' | 'azure' | 'apple',
  redirectTo: string
) {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
}

/**
 * Reset password for email
 */
export async function resetPasswordForEmail(email: string, redirectTo: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

/**
 * Update user password
 */
export async function updateUserPassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

/**
 * Get current session
 */
export async function getSession() {
  return await supabase.auth.getSession();
}

/**
 * Set session from tokens
 */
export async function setSession(accessToken: string, refreshToken: string) {
  return await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

/**
 * Exchange code for session
 */
export async function exchangeCodeForSession(code: string) {
  return await supabase.auth.exchangeCodeForSession(code);
}

/**
 * Verify OTP
 */
export async function verifyOtp(type: 'invite', tokenHash: string) {
  return await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });
}

/**
 * Subscribe to auth state changes
 * Returns a subscription object with unsubscribe method
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
