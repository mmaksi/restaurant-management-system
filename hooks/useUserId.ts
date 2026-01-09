'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserId } from '@/infra/auth/helpers/client';
import { USER_ID_QUERY_KEY } from '@/lib/constants/query-keys';

/**
 * Hook to extract and manage the current user ID using React Query caching
 * @returns Object containing userId, isLoading, and error
 */
export function useUserId() {
  const {
    data: userId,
    isLoading,
    error,
  } = useQuery({
    queryKey: USER_ID_QUERY_KEY,
    queryFn: getUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes - user ID doesn't change
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available
    retry: false, // Don't retry on error
  });

  return {
    userId: userId ?? null,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
