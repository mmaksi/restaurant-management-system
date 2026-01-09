'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/ui/header';
import Main from '@/components/ui/main';
import DashboardSkeleton from '@/components/Home/DashboardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const HomePageSkeleton = () => {
  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="w-20 h-9 rounded-lg" />
        </div>
      </Header>
      <Main>
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <DashboardSkeleton />
      </Main>
    </>
  );
};

/**
 * Client-side auth guard that uses cached session state from React Query
 * This provides instant UI updates when navigating back to the page
 * Server-side validation is still handled by middleware (proxy.ts)
 */
export default function ClientAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state only on initial load (when cache is empty)
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Show nothing while redirecting (middleware will also redirect if needed)
  if (!isAuthenticated) {
    return <HomePageSkeleton />;
  }

  // User is authenticated, show dashboard immediately (from cache)
  return <Dashboard />;
}
