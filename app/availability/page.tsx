'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, startOfWeek, format } from 'date-fns';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/ui/header';
import Main from '@/components/ui/main';
import EmployeeAvailabilityCalendar from '@/components/EmployeeAvailabilityCalendar';
import { toast } from 'sonner';
import { AvailabilitySlot } from '@/lib/types';
import {
  AVAILABILITY_QUERY_KEY,
  EMPLOYEE_RESTAURANT_QUERY_KEY,
} from '@/lib/constants/query-keys';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  httpGetEmployeeAvailability,
  httpSubmitEmployeeAvailability,
  httpGetEmployeeRestaurant,
} from '@/infra/db/helpers';
import {
  hasAvailabilityChanges,
  useUnsavedChangesWarning,
} from '@/lib/helpers';
import UnsavedChangesLink from '@/components/UnsavedChangesLink';
import { useUserId } from '@/hooks/useUserId';

export default function AvailabilityPage() {
  const queryClient = useQueryClient();
  const { userId, isLoading: isLoadingUserId } = useUserId();

  const prevExistingRef = useRef<string>('');

  const [today, setToday] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekStartStr, setWeekStartStr] = useState<string>('');
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);

  useEffect(() => {
    const now = new Date();
    setToday(now);

    const nextWeekStart = addDays(startOfWeek(now, { weekStartsOn: 1 }), 7);
    setWeekStart(nextWeekStart);
    setWeekStartStr(format(nextWeekStart, 'yyyy-MM-dd'));
  }, []);

  // Check if employee has a restaurant associated
  const {
    data: restaurantId,
    isLoading: isCheckingRestaurant,
    isError: hasNoRestaurant,
  } = useQuery({
    queryKey: EMPLOYEE_RESTAURANT_QUERY_KEY,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      return await httpGetEmployeeRestaurant(userId);
    },
    enabled: !!userId && !isLoadingUserId,
    retry: false, // Don't retry if restaurant not found
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Determine if restaurant is missing (either error or null/undefined data)
  const hasNoRestaurantAssociation =
    hasNoRestaurant || (!isCheckingRestaurant && !restaurantId);

  // Fetch existing availability (only if restaurant exists)
  const { data: existingAvailability = [], isLoading } = useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, weekStartStr],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      return await httpGetEmployeeAvailability(userId, weekStartStr);
    },
    enabled:
      !!weekStartStr &&
      !!restaurantId &&
      !hasNoRestaurantAssociation &&
      !!userId &&
      !isLoadingUserId,
  });

  // Convert database format to component format
  useEffect(() => {
    // Serialize to compare actual data, not array reference
    const serialized = JSON.stringify(
      (existingAvailability || [])
        .map((slot) => ({
          id: slot.id || '',
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          confirmed: slot.confirmed ?? false,
        }))
        .sort((a, b) =>
          `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`)
        )
    );

    // Only update if the data actually changed
    if (prevExistingRef.current !== serialized) {
      prevExistingRef.current = serialized;

      const converted = (existingAvailability || []).map((slot) => ({
        id: slot.id,
        date: slot.date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        confirmed: slot.confirmed ?? false,
      }));
      setAvailabilitySlots(converted);
    }
  }, [existingAvailability]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (slots: AvailabilitySlot[]) => {
      if (!userId) throw new Error('User ID is not available');
      const slotsToSave = slots.map((slot) => ({
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }));
      await httpSubmitEmployeeAvailability(userId, weekStartStr, slotsToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...AVAILABILITY_QUERY_KEY, weekStartStr],
      });
      toast.success('Availability saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save availability');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(availabilitySlots);
  };

  const handleAvailabilityChange = (slots: AvailabilitySlot[]) => {
    setAvailabilitySlots(slots);
  };

  // Check if current state differs from database state
  const hasChanges = useMemo(() => {
    if (isLoading) return false;

    const dbSlots: AvailabilitySlot[] = (existingAvailability || []).map(
      (slot) => ({
        date: slot.date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        confirmed: slot.confirmed ?? false,
      })
    );

    return hasAvailabilityChanges(availabilitySlots, dbSlots);
  }, [availabilitySlots, existingAvailability, isLoading]);

  // Warn about unsaved changes when navigating away
  useUnsavedChangesWarning(
    hasChanges,
    'You have unsaved availability changes. Are you sure you want to leave?'
  );

  if (!today || !weekStart) {
    return (
      <>
        <Header>
          <div className="flex items-center space-x-4">
            <UnsavedChangesLink
              href="/"
              hasUnsavedChanges={hasChanges}
              message="You have unsaved availability changes. Are you sure you want to leave?"
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </UnsavedChangesLink>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Submit Availability
              </h1>
            </div>
          </div>
        </Header>
        <Main>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading availability slots...</p>
          </div>
        </Main>
      </>
    );
  }

  // Show loading while checking for userId or restaurant
  if (isLoadingUserId || isCheckingRestaurant) {
    return (
      <>
        <Header>
          <div className="flex items-center space-x-4">
            <UnsavedChangesLink
              href="/"
              hasUnsavedChanges={false}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </UnsavedChangesLink>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Submit Availability
              </h1>
            </div>
          </div>
        </Header>
        <Main>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">
              Loading restaurant information...
            </p>
          </div>
        </Main>
      </>
    );
  }

  // Show message if employee has no restaurant associated
  if (hasNoRestaurantAssociation) {
    return (
      <>
        <Header>
          <div className="flex items-center space-x-4">
            <UnsavedChangesLink
              href="/"
              hasUnsavedChanges={false}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </UnsavedChangesLink>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Submit Availability
              </h1>
            </div>
          </div>
        </Header>
        <Main>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">
                  Restaurant Association Required
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-slate-700">
                You are not currently associated with any restaurant. Please
                contact your manager to be assigned to a restaurant before you
                can submit your availability.
              </CardDescription>
            </CardContent>
          </Card>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <UnsavedChangesLink
            href="/"
            hasUnsavedChanges={hasChanges}
            message="You have unsaved availability changes. Are you sure you want to leave?"
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </UnsavedChangesLink>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Submit Availability
            </h1>
            <p className="text-slate-600 text-sm">
              Week of {format(weekStart, 'MMM d')} -{' '}
              {format(addDays(weekStart, 6), 'MMM d, yyyy')} (Next Week)
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || isLoading || !hasChanges}
          className=" bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>
            {saveMutation.isPending
              ? 'Saving...'
              : !hasChanges
              ? 'Save Changes'
              : 'Save Availability'}
          </span>
        </Button>
      </Header>

      <Main>
        <EmployeeAvailabilityCalendar
          weekStart={weekStart}
          initialAvailability={availabilitySlots}
          onAvailabilityChange={handleAvailabilityChange}
        />
        {isLoading && availabilitySlots.length === 0 && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Loading your saved availability...
          </div>
        )}
      </Main>
    </>
  );
}
