'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { demoBookings } from '@/lib/data/demoBookings';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import EmployeeList from '@/components/EmployeeList';
import Header from '@/components/ui/header';
import { ArrowLeft } from 'lucide-react';
import CardInfo from '@/components/CardInfo';
import { COLOURS, EMPLOYEES_QUERY_KEY } from '@/lib/constants';
import Main from '@/components/ui/main';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  httpGetAllManagerEmployees,
  httpUpdateConfirmedAvailability,
} from '@/infra/db/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, startOfWeek, format } from 'date-fns';
import { useUserId } from '@/hooks/useUserId';
import { ConfirmedBlock } from '@/lib/types';
import { toast } from 'sonner';
import { useUnsavedChangesWarning } from '@/lib/helpers';
import UnsavedChangesLink from '@/components/UnsavedChangesLink';

export default function SchedulerPage() {
  const { userId, isLoading: isLoadingUserId } = useUserId();
  const queryClient = useQueryClient();
  const [today, setToday] = useState<Date | null>(null);
  const [confirmedBlocks, setConfirmedBlocks] = useState<ConfirmedBlock[]>([]);
  const initialBlocksRef = useRef<string>('');

  // Set today only on client side to avoid hydration mismatch
  useEffect(() => {
    setToday(new Date());
  }, []);

  // Calculate week start string only when today is available
  const weekStartStr = useMemo(() => {
    if (!today) return '';
    const nextWeekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
    return format(nextWeekStart, 'yyyy-MM-dd');
  }, [today]);

  // Fetch employees with availability for next week
  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, weekStartStr],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is not available');
      if (!weekStartStr) throw new Error('Week start date is not available');
      const data = await httpGetAllManagerEmployees(userId, weekStartStr);
      return data;
    },
    enabled: !!userId && !isLoadingUserId && !!weekStartStr,
  });

  // Convert employee availability to confirmed blocks (initial state from DB)
  const initialConfirmedBlocks = useMemo(() => {
    const blocks: ConfirmedBlock[] = [];
    employees.forEach((employee) => {
      if (employee.availability) {
        employee.availability.forEach((slot) => {
          if (slot.confirmed) {
            blocks.push({
              id:
                slot.id ||
                `block-${employee.id}-${slot.date}-${slot.start_time}`,
              employeeId: employee.employee_id || employee.id,
              date: slot.date,
              startTime: slot.start_time,
              endTime: slot.end_time,
            });
          }
        });
      }
    });
    return blocks;
  }, [employees]);

  // Initialize confirmed blocks from database
  useEffect(() => {
    const serialized = JSON.stringify(
      initialConfirmedBlocks
        .map((b) => ({
          employeeId: b.employeeId,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
        }))
        .sort((a, b) =>
          `${a.employeeId}-${a.date}-${a.startTime}`.localeCompare(
            `${b.employeeId}-${b.date}-${b.startTime}`
          )
        )
    );

    if (initialBlocksRef.current !== serialized) {
      initialBlocksRef.current = serialized;
      setConfirmedBlocks(initialConfirmedBlocks);
    }
  }, [initialConfirmedBlocks]);

  // Check if current state differs from database state
  const hasChanges = useMemo(() => {
    const currentSerialized = JSON.stringify(
      confirmedBlocks
        .map((b) => ({
          employeeId: b.employeeId,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
        }))
        .sort((a, b) =>
          `${a.employeeId}-${a.date}-${a.startTime}`.localeCompare(
            `${b.employeeId}-${b.date}-${b.startTime}`
          )
        )
    );
    return initialBlocksRef.current !== currentSerialized;
  }, [confirmedBlocks]);

  // Warn about unsaved changes
  useUnsavedChangesWarning(
    hasChanges,
    'You have unsaved schedule changes. Are you sure you want to leave?'
  );

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (blocks: ConfirmedBlock[]) => {
      if (!userId) throw new Error('User ID is not available');
      const blocksToSave = blocks.map((block) => ({
        employeeId: block.employeeId,
        date: block.date,
        startTime: block.startTime,
        endTime: block.endTime,
      }));
      await httpUpdateConfirmedAvailability(userId, weekStartStr, blocksToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_QUERY_KEY, weekStartStr],
      });
      toast.success('Schedule saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save schedule');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(confirmedBlocks);
  };

  const handleConfirmedBlocksChange = useCallback(
    (blocks: ConfirmedBlock[]) => {
      setConfirmedBlocks(blocks);
    },
    []
  );

  // Lazy initialization: load from sessionStorage only once on mount
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('selectedEmployees');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  // Save to sessionStorage whenever selectedEmployees changes
  useEffect(() => {
    sessionStorage.setItem(
      'selectedEmployees',
      JSON.stringify(selectedEmployees)
    );
  }, [selectedEmployees]);

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Calculate submitted/pending counts from real employee data
  const submittedCount = employees.filter(
    (emp) => emp.availability_submitted
  ).length;
  const pendingCount = employees.filter(
    (emp) => !emp.availability_submitted
  ).length;

  return (
    <>
      <Header>
        <div className="flex items-center space-x-4">
          <UnsavedChangesLink
            href="/"
            hasUnsavedChanges={hasChanges}
            message="You have unsaved schedule changes. Are you sure you want to leave?"
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </UnsavedChangesLink>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Staff Scheduler
            </h1>
            <p className="text-slate-600 text-sm">
              Build next week&apos;s schedule
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isLoading || isLoadingUserId ? (
            <>
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </>
          ) : (
            <>
              <CardInfo
                title="Submitted"
                value={submittedCount}
                Icon={CheckCircle}
                color={COLOURS.GREEN}
              />
              <CardInfo
                title="Pending"
                value={pendingCount}
                Icon={AlertCircle}
                color={COLOURS.ORANGE}
              />
              <CardInfo
                title="Bookings"
                value={demoBookings.length}
                Icon={Calendar}
                color={COLOURS.BLUE}
              />
            </>
          )}
        </div>
      </Header>
      <Main>
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error instanceof Error
              ? error.message
              : 'Failed to load employees'}
          </div>
        )}

        {isLoading || isLoadingUserId ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <EmployeeList
                employees={employees}
                selectedEmployees={selectedEmployees}
                onToggleEmployee={toggleEmployeeSelection}
              />
            </div>
            <div className="lg:col-span-3">
              <AvailabilityCalendar
                employees={employees}
                selectedEmployees={selectedEmployees}
                bookings={demoBookings}
                weekStart={weekStartStr}
                initialConfirmedBlocks={initialConfirmedBlocks}
                onConfirmedBlocksChange={handleConfirmedBlocksChange}
                onSave={handleSave}
                isSaving={saveMutation.isPending}
                hasChanges={hasChanges}
              />
            </div>
          </div>
        )}
      </Main>
    </>
  );
}
