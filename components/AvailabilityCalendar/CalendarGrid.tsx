'use client';

import { format } from 'date-fns';
import { Employee, TimeSlot, ConfirmedBlock, Booking } from '@/lib/types';
import EmployeeColumn from '@/components/AvailabilityCalendar/EmployeeColumn';
import BookingsOverlay from '@/components/AvailabilityCalendar/BookingsOverlay';

interface CalendarGridProps {
  weekDays: Date[];
  hours: number[];
  displayEmployees: Employee[];
  columnWidth: number;
  confirmedBlocks: ConfirmedBlock[];
  isDragging: boolean;
  dragStart: { employeeId: string; date: string; hour: number } | null;
  dragEnd: { hour: number } | null;
  onMouseDown: (employeeId: string, date: string, hour: number) => void;
  onMouseMove: (hour: number) => void;
  onRemoveBlock: (blockId: string) => void;
  getConfirmedPortions: (
    employeeId: string,
    date: string,
    availability: TimeSlot
  ) => ConfirmedBlock[];
  getSelectionPreview: (
    employeeId: string,
    date: string,
    hour: number
  ) => string | null;
  bookings?: Booking[];
  showBookings?: boolean;
}

export default function CalendarGrid({
  weekDays,
  hours,
  displayEmployees,
  columnWidth,
  confirmedBlocks,
  isDragging,
  dragStart,
  dragEnd,
  onMouseDown,
  onMouseMove,
  onRemoveBlock,
  getConfirmedPortions,
  getSelectionPreview,
  bookings = [],
  showBookings = true,
}: CalendarGridProps) {
  // Use a static date for time formatting (the date doesn't matter, only the hour)
  const baseDate = new Date(2024, 0, 1);

  return (
    <div className="flex ">
      {/* Time labels column */}
      <div className="sticky left-0 z-30 w-20 flex-shrink-0 border-r-2 border-slate-300 bg-white">
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-[60px] relative border-b border-slate-200"
          >
            <span className="absolute top-0 left-1 text-xs text-slate-600 font-medium">
              {format(baseDate.setHours(hour, 0, 0, 0), 'h a')}
            </span>
          </div>
        ))}
      </div>

      {/* Day columns with employee availability */}
      {weekDays.map((day, dayIndex) => {
        const dateStr = format(day, 'yyyy-MM-dd');

        return (
          <div
            key={dayIndex}
            className="border-r border-slate-200 last:border-r-0 flex-shrink-0"
            style={{
              width: `${displayEmployees.length * columnWidth}px`,
            }}
          >
            <div
              className="flex relative"
              style={{ height: `${hours.length * 60}px` }}
            >
              {/* Bookings Overlay - spans across all employee columns */}
              {showBookings && (
                <BookingsOverlay
                  bookings={bookings}
                  dateStr={dateStr}
                  hours={hours}
                  totalWidth={displayEmployees.length * columnWidth}
                />
              )}

              {/* Employee columns */}
              {displayEmployees.map((employee) => (
                <EmployeeColumn
                  key={employee.id}
                  employee={employee}
                  dateStr={dateStr}
                  hours={hours}
                  columnWidth={columnWidth}
                  confirmedBlocks={confirmedBlocks}
                  isDragging={isDragging}
                  dragStart={dragStart}
                  dragEnd={dragEnd}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onRemoveBlock={onRemoveBlock}
                  getConfirmedPortions={getConfirmedPortions}
                  getSelectionPreview={getSelectionPreview}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
