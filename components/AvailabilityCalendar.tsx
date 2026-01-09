'use client';

import { useState, useEffect } from 'react';
import { Employee, ConfirmedBlock, Booking } from '../lib/types';
import { addDays, startOfWeek, parse } from 'date-fns';
import Instructions from '@/components/AvailabilityCalendar/Instructions';
import ConfirmedBlocksSummary from '@/components/AvailabilityCalendar/ConfirmedBlocksSummary';
import DayFilter from '@/components/AvailabilityCalendar/DayFilter';
import CalendarLegends from '@/components/AvailabilityCalendar/CalendarLegends';
import CalendarHeader from '@/components/AvailabilityCalendar/CalendarHeader';
import CalendarGrid from '@/components/AvailabilityCalendar/CalendarGrid';
import {
  useDragSelection,
  useDaySelection,
  useFilteredEmployees,
} from '@/components/AvailabilityCalendar/hooks';
import {
  getConfirmedPortions,
  getSelectionPreview,
} from '@/components/AvailabilityCalendar/utils';
import { exportScheduleToPDF } from '@/components/AvailabilityCalendar/exportPDF';

interface AvailabilityCalendarProps {
  employees: Employee[];
  selectedEmployees: string[];
  bookings?: Booking[];
  weekStart?: string; // Optional: yyyy-MM-dd format. If provided, use this instead of calculating from today
  onConfirmedBlocksChange?: (blocks: ConfirmedBlock[]) => void;
  initialConfirmedBlocks?: ConfirmedBlock[];
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export default function AvailabilityCalendar({
  employees,
  selectedEmployees,
  bookings = [],
  weekStart,
  onConfirmedBlocksChange,
  initialConfirmedBlocks = [],
  onSave,
  isSaving = false,
  hasChanges = false,
}: AvailabilityCalendarProps) {
  const [confirmedBlocks, setConfirmedBlocks] = useState<ConfirmedBlock[]>(
    initialConfirmedBlocks
  );
  const [today, setToday] = useState<Date | null>(null);
  const [showBookings, setShowBookings] = useState(true);

  useEffect(() => {
    // Only access current date in the browser
    setToday(new Date());
  }, []);

  // Update confirmed blocks when initialConfirmedBlocks changes
  useEffect(() => {
    setConfirmedBlocks(initialConfirmedBlocks);
  }, [initialConfirmedBlocks]);

  // Notify parent when confirmed blocks change
  useEffect(() => {
    onConfirmedBlocksChange?.(confirmedBlocks);
  }, [confirmedBlocks, onConfirmedBlocksChange]);

  // Custom hooks
  const { selectedDays, toggleDay, selectAllDays } = useDaySelection();
  const {
    isDragging,
    dragStart,
    dragEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDragSelection(confirmedBlocks, setConfirmedBlocks);

  const displayEmployees = useFilteredEmployees(employees, selectedEmployees);

  // Calendar configuration - use provided weekStart or calculate from today
  let nextWeekStart: Date;
  if (weekStart) {
    // Use the provided weekStart (should match the week used to fetch availability)
    nextWeekStart = parse(weekStart, 'yyyy-MM-dd', new Date());
  } else if (today) {
    // Fallback: calculate from today if weekStart not provided
    nextWeekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
  } else {
    return <div className="text-center py-8">Loading calendar...</div>;
  }
  const allWeekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(nextWeekStart, i)
  );
  const weekDays = allWeekDays.filter((_, index) =>
    selectedDays.includes(index)
  );
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const columnWidth = 200; // pixels

  // Helper functions
  const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id);
  };

  const removeConfirmedBlock = (blockId: string) => {
    setConfirmedBlocks(confirmedBlocks.filter((block) => block.id !== blockId));
  };

  const exportToPDF = () => {
    exportScheduleToPDF(confirmedBlocks, nextWeekStart, getEmployeeById);
  };

  // Wrapper functions for utilities that need access to state
  const getConfirmedPortionsWrapper = (
    employeeId: string,
    date: string,
    availability: { date: string; startTime: string; endTime: string }
  ) => {
    return getConfirmedPortions(
      employeeId,
      date,
      availability,
      confirmedBlocks
    );
  };

  const getSelectionPreviewWrapper = (
    employeeId: string,
    date: string,
    hour: number
  ) => {
    return getSelectionPreview(
      employeeId,
      date,
      hour,
      isDragging,
      dragStart,
      dragEnd
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Employee Availability - Interactive Schedule Builder
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Click and drag on any time slot to confirm shifts. You can schedule
          employees during their claimed availability (green hover) or outside
          it (yellow hover). Dotted blocks show claimed availability, solid
          blocks are confirmed shifts.
        </p>

        <DayFilter
          selectedDays={selectedDays}
          dayNames={dayNames}
          onToggleDay={toggleDay}
          onSelectAllDays={selectAllDays}
        />

        <CalendarLegends />

        {selectedEmployees.length === 0 && (
          <p className="text-sm text-blue-600 mt-3">
            Showing all employees who submitted availability. Select specific
            employees from the list to filter.
          </p>
        )}
      </div>

      {/* Calendar Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <div
          className="inline-block min-w-full"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <CalendarHeader
            weekDays={weekDays}
            displayEmployees={displayEmployees}
            columnWidth={columnWidth}
            bookings={bookings}
            showBookings={showBookings}
            onToggleBookings={() => setShowBookings(!showBookings)}
          />
          <CalendarGrid
            weekDays={weekDays}
            hours={hours}
            displayEmployees={displayEmployees}
            columnWidth={columnWidth}
            confirmedBlocks={confirmedBlocks}
            isDragging={isDragging}
            dragStart={dragStart}
            dragEnd={dragEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onRemoveBlock={removeConfirmedBlock}
            getConfirmedPortions={getConfirmedPortionsWrapper}
            getSelectionPreview={getSelectionPreviewWrapper}
            bookings={bookings}
            showBookings={showBookings}
          />
        </div>
      </div>

      {confirmedBlocks.length > 0 && (
        <ConfirmedBlocksSummary
          confirmedBlocks={confirmedBlocks}
          getEmployeeById={getEmployeeById}
          removeConfirmedBlock={removeConfirmedBlock}
          exportToPDF={exportToPDF}
          nextWeekStart={nextWeekStart}
          onSave={onSave}
          isSaving={isSaving}
          hasChanges={hasChanges}
        />
      )}

      <Instructions />
    </div>
  );
}
