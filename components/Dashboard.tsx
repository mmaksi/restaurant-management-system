'use client';

import Header from '@/components/ui/header';
import FeatureCard from '@/components/Home/FeatureCard';
import { features } from '@/lib/constants';
import { LogoutButton } from '@/components/logout-button';
import { useEffect, useState, useMemo } from 'react';
import Main from '@/components/ui/main';

import DashboardSkeleton from '@/components/Home/DashboardSkeleton';
import { UserRole } from '@/lib/types/data';
import { AuthRepository } from '@/infra/db/repositories/auth';
import { databaseClient } from '@/infra/config';
import { useUserId } from '@/hooks/useUserId';
import { httpGetCurrentUserProfile } from '@/infra/db/helpers';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { userId, isLoading: isLoadingUserId } = useUserId();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  useEffect(() => {
    if (!userId || isLoadingUserId) {
      setIsLoadingRole(true);
      return;
    }

    // Check user role and fetch profile
    const checkRoleAndProfile = async () => {
      try {
        const authRepository = new AuthRepository(databaseClient);
        const role = await authRepository.findUserRole(userId);
        switch (role) {
          case 'admin':
            setUserRole('admin');
            break;
          case 'manager':
            setUserRole('manager');
            break;
          case 'employee':
            setUserRole('employee');
            break;
          default:
            setUserRole(null);
            break;
        }

        // Fetch user profile to get first name
        const profile = await httpGetCurrentUserProfile(userId);
        setFirstName(profile.first_name);
      } catch (error) {
        console.error('Error checking user role or fetching profile:', error);
        setUserRole(null);
        setFirstName(null);
      } finally {
        setIsLoadingRole(false);
      }
    };

    checkRoleAndProfile();
  }, [userId, isLoadingUserId]);

  // Filter features based on user role
  const filteredFeatures = useMemo(() => {
    if (!userRole) return [];

    return features.filter((feature) => {
      // If no roles specified, show to all
      if (!feature.roles || feature.roles.length === 0) {
        return true;
      }
      // Otherwise, check if user's role is in the allowed roles
      return feature.roles.includes(userRole);
    });
  }, [userRole]);

  const welcomeMessage = useMemo(() => {
    if (firstName) return `Welcome, ${firstName}`;
    return 'Welcome back';
  }, [firstName]);

  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Restaurant Management System
            </h1>
            {isLoadingRole ? (
              <Skeleton className="h-5 w-32 mt-1" />
            ) : (
              <p className="text-slate-600 mt-1">{welcomeMessage}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-600">Current Week</p>
              <p className="text-lg font-semibold text-slate-900">
                {currentDate}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </Header>

      <Main>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">
            Access all your restaurant management tools in one place
          </p>
        </div>
        {isLoadingRole ? (
          <DashboardSkeleton />
        ) : filteredFeatures.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredFeatures.map((feature) => {
                return <FeatureCard key={feature.title} feature={feature} />;
              })}
            </div>
            {/* {userRole !== 'user' && <QuickStats />} */}
          </>
        ) : (
          <div className="text-center py-8 text-slate-600">
            No features available for your role.
          </div>
        )}
      </Main>
    </>
  );
}
