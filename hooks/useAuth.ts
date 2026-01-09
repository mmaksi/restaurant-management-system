'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AUTH_SESSION_QUERY_KEY } from '@/lib/constants/query-keys';
import { useEffect } from 'react';
import {
  fetchAuthSession,
  onAuthStateChange,
} from '@/infra/auth/helpers/client';

/**
 * Hook to check authentication state using React Query caching
 * Uses Supabase's getSession() which securely reads from localStorage
 * Listens to auth state changes to keep cache in sync
 * @returns Object containing isAuthenticated, isLoading, and error
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchAuthSession,
    staleTime: 5 * 60 * 1000, // 5 minutes - session doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available
    retry: false, // Don't retry on error - if session fails, user is logged out
  });

  // Listen to auth state changes to keep cache in sync
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(() => {
      // Invalidate query when auth state changes (login/logout)
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    session: data?.session ?? null,
    isLoading,
    error,
  };
}
