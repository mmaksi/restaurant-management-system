'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { getBlockStyle } from '@/components/AvailabilityCalendar/utils';
import { X, CheckCircle2 } from 'lucide-react';

interface AvailabilitySlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  confirmed?: boolean;
}

interface EmployeeAvailabilityCalendarProps {
  weekStart: Date;
  initialAvailability?: AvailabilitySlot[];
  onAvailabilityChange?: (slots: AvailabilitySlot[]) => void;
}

export default function EmployeeAvailabilityCalendar({
  weekStart,
  initialAvailability = [],
  onAvailabilityChange,
}: EmployeeAvailabilityCalendarProps) {
  const [availabilitySlots, setAvailabilitySlots] =
    useState<AvailabilitySlot[]>(initialAvailability);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    date: string;
    hour: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number } | null>(null);
  const prevInitialRef = useRef<string>('');

  const selectedDays = [0, 1, 2, 3, 4, 5, 6];

  // Initialize from initialAvailability, but only when it actually changes
  useEffect(() => {
    // Serialize initialAvailability to compare actual data, not array reference
    const serialized = JSON.stringify(
      (initialAvailability || [])
        .map((s) => ({
          id: s.id || '',
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
        }))
        .sort((a, b) =>
          `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`)
        )
    );

    // Only update if the serialized version changed
    if (prevInitialRef.current !== serialized) {
      prevInitialRef.current = serialized;
      setAvailabilitySlots(initialAvailability || []);
    }
  }, [initialAvailability]);

  const allWeekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );
  const weekDays = allWeekDays.filter((_, index) =>
    selectedDays.includes(index)
  );

  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  const columnWidth = 200; // pixels

  const handleMouseDown = (date: string, hour: number) => {
    setIsDragging(true);
    setDragStart({ date, hour });
    setDragEnd({ hour });
  };

  const handleMouseMove = (hour: number) => {
    if (isDragging && dragStart) {
      setDragEnd({ hour });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;

      const newSlot: AvailabilitySlot = {
        id: `slot-${Date.now()}-${Math.random()}`,
        date: dragStart.date,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        confirmed: false,
      };

      // Remove any existing slots that overlap with the new one for this date
      const filteredSlots = availabilitySlots.filter(
        (slot) =>
          slot.date !== dragStart.date ||
          slot.endTime <= newSlot.startTime ||
          slot.startTime >= newSlot.endTime
      );

      const updatedSlots = [...filteredSlots, newSlot];
      setAvailabilitySlots(updatedSlots);
      onAvailabilityChange?.(updatedSlots);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const removeSlot = (slotId: string) => {
    const updatedSlots = availabilitySlots.filter((slot) => slot.id !== slotId);
    setAvailabilitySlots(updatedSlots);
    onAvailabilityChange?.(updatedSlots);
  };

  const getSlotsForDate = (dateStr: string) => {
    return availabilitySlots.filter((slot) => slot.date === dateStr);
  };

  const getSelectionPreview = (date: string, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    if (dragStart.date !== date) return null;

    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour);

    if (hour >= startHour && hour <= endHour) {
      return 'bg-blue-200 opacity-50';
    }
    return null;
  };

  // Use a static date for time formatting (the date doesn't matter, only the hour)
  const getTimeLabel = (hour: number) => {
    const date = new Date(2024, 0, 1, hour, 0, 0, 0);
    return format(date, 'h a');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Submit Your Availability
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Click and drag on time slots to set your available hours for the week.
          You can add multiple time blocks per day.
        </p>
      </div>

      {/* Calendar Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <div
          className="inline-block min-w-full"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b-2 border-slate-300">
            <div className="flex">
              {/* Time column header */}
              <div className="sticky left-0 z-30 w-20 flex-shrink-0 border-r-2 border-slate-300 p-3 font-semibold text-slate-700 bg-white">
                Time
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-r border-slate-200 last:border-r-0"
                  style={{ width: `${columnWidth}px` }}
                >
                  <div className="p-3 text-left bg-white">
                    <div className="font-semibold text-slate-900">
                      {format(day, 'EEEE')}
                    </div>
                    <div className="text-sm text-slate-600">
                      {format(day, 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex">
            {/* Time labels column */}
            <div className="sticky left-0 z-30 w-20 flex-shrink-0 border-r-2 border-slate-300 bg-white">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] relative border-b border-slate-200"
                >
                  <span className="absolute top-0 left-1 text-xs text-slate-600 font-medium">
                    {getTimeLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const slotsForDate = getSlotsForDate(dateStr);

              return (
                <div
                  key={dayIndex}
                  className="border-r border-slate-200 last:border-r-0 relative"
                  style={{
                    width: `${columnWidth}px`,
                    height: `${hours.length * 60}px`,
                  }}
                >
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`absolute left-0 right-0 h-[60px] border-b border-slate-100 z-10 cursor-pointer hover:bg-blue-50 hover:bg-opacity-30 ${
                        getSelectionPreview(dateStr, hour) || ''
                      }`}
                      style={{ top: `${(hour - 7) * 60}px` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(dateStr, hour);
                      }}
                      onMouseEnter={() => {
                        if (isDragging) {
                          handleMouseMove(hour);
                        }
                      }}
                    />
                  ))}

                  {/* Availability slots */}
                  {slotsForDate.map((slot) => {
                    const isConfirmed = slot.confirmed ?? false;
                    const bgColor = isConfirmed
                      ? 'bg-green-600'
                      : 'bg-indigo-500';
                    const borderColor = isConfirmed
                      ? 'border-green-700'
                      : 'border-indigo-600';

                    return (
                      <div
                        key={slot.id}
                        className={`absolute left-1 right-1 ${bgColor} ${borderColor} border-2 text-white rounded-lg shadow-md z-20 group pointer-events-auto`}
                        style={getBlockStyle(slot.startTime, slot.endTime)}
                      >
                        <div className="p-2 text-xs h-full flex flex-col justify-between">
                          <div>
                            <div className="font-semibold flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span>
                                  {isConfirmed ? 'Confirmed' : 'Available'}
                                </span>
                                {isConfirmed && (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </div>
                              {!isConfirmed && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSlot(slot.id!);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-white text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-white opacity-90">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <div className="flex items-center text-white opacity-90">
                            <span className="text-xs">
                              {parseInt(slot.endTime.split(':')[0]) -
                                parseInt(slot.startTime.split(':')[0])}{' '}
                              hours
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How to use:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Click and drag vertically</strong> on any time slot to set
            your availability
          </li>
          <li>
            • <strong>Add multiple blocks</strong> per day if needed
          </li>
          <li>
            • <strong>Hover over blocks and click X</strong> to remove
            availability slots
          </li>
          <li>
            • <strong>Select/deselect days</strong> to focus on specific days
            using the filter above
          </li>
        </ul>
      </div>
    </div>
  );
}
