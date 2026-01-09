'use client';

import { format } from 'date-fns';
import { Employee, Booking } from '@/lib/types';
import { ROLE_COLOURS, EMPLOYEE_ROLES } from '@/lib/constants';
import { Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  weekDays: Date[];
  displayEmployees: Employee[];
  columnWidth: number;
  bookings?: Booking[];
  showBookings?: boolean;
  onToggleBookings?: () => void;
}

export default function CalendarHeader({
  weekDays,
  displayEmployees,
  columnWidth,
  bookings = [],
  showBookings = true,
  onToggleBookings,
}: CalendarHeaderProps) {
  const getDayBookings = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter((booking) => booking.date === dateStr);
  };
  
  const hasBookings = bookings.length > 0;
  
  return (
    <div className="sticky top-0 z-20 bg-white border-b-2 border-slate-300">
      <div className="flex">
        {/* Time column header */}
        <div className="sticky left-0 z-30 w-20 flex-shrink-0 border-r-2 border-slate-300 p-3 font-semibold text-slate-700 bg-white">
          <div className="flex flex-col gap-1">
            <span>Time</span>
            {hasBookings && onToggleBookings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleBookings}
                className="h-7 w-full px-1 text-xs"
                title={showBookings ? 'Hide bookings' : 'Show bookings'}
              >
                {showBookings ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Day columns */}
        {weekDays.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="border-r border-slate-200 last:border-r-0"
            style={{
              width: `${displayEmployees.length * columnWidth}px`,
            }}
          >
            <div className="p-3 text-left bg-white sticky left-20 z-20">
              <div className="font-semibold text-slate-900">
                {format(day, 'EEEE')}
              </div>
              <div className="text-sm text-slate-600">
                {format(day, 'MMM d, yyyy')}
              </div>
              {(() => {
                const dayBookings = getDayBookings(day);
                if (dayBookings.length > 0) {
                  const totalGuests = dayBookings.reduce(
                    (sum, b) => sum + b.numberOfGuests,
                    0
                  );
                  return (
                    <div className="mt-2 flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-semibold">
                        {dayBookings.length}{' '}
                        {dayBookings.length === 1 ? 'booking' : 'bookings'}
                      </span>
                      <span>•</span>
                      <span>
                        {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Employee name headers */}
            <div className="flex border-t border-slate-200">
              {displayEmployees.map((employee) => {
                const colors =
                  (employee.role &&
                    ROLE_COLOURS[employee.role as EMPLOYEE_ROLES]) ||
                  ROLE_COLOURS[EMPLOYEE_ROLES.SERVICE];
                return (
                  <div
                    key={employee.id}
                    className={`flex-shrink-0 p-2 border-r border-slate-200 last:border-r-0 ${colors.light}`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    <div
                      className={`text-xs font-semibold ${colors.text} truncate`}
                    >
                      {employee.first_name && employee.last_name
                        ? `${employee.first_name} ${employee.last_name}`
                        : employee.first_name ||
                          employee.last_name ||
                          'Unknown'}
                    </div>
                    <div className="text-xs text-slate-600">
                      ★{employee.priority ?? 'N/A'} • {employee.role || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
