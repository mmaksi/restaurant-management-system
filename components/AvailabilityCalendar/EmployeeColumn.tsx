'use client';

import { Check, X } from 'lucide-react';
import { Employee, TimeSlot, ConfirmedBlock } from '@/lib/types';
import { ROLE_COLOURS, EMPLOYEE_ROLES } from '@/lib/constants';
import { getBlockStyle } from './utils';

interface EmployeeColumnProps {
  employee: Employee;
  dateStr: string;
  hours: number[];
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
}

export default function EmployeeColumn({
  employee,
  dateStr,
  hours,
  columnWidth,
  isDragging,
  onMouseDown,
  onMouseMove,
  onRemoveBlock,
  getConfirmedPortions,
  getSelectionPreview,
}: EmployeeColumnProps) {
  const colors =
    (employee.role && ROLE_COLOURS[employee.role as EMPLOYEE_ROLES]) ||
    ROLE_COLOURS[EMPLOYEE_ROLES.SERVICE];

  const availability = employee.availability?.find((a) => a.date === dateStr);
  const confirmedForEmployee = getConfirmedPortions(
    employee.id,
    dateStr,
    availability
      ? {
          date: availability.date,
          startTime: availability.start_time,
          endTime: availability.end_time,
        }
      : {
          date: dateStr,
          startTime: '',
          endTime: '',
        }
  );

  return (
    <div
      className="relative border-r border-slate-200 last:border-r-0"
      style={{ width: `${columnWidth}px` }}
    >
      {/* Hour grid lines */}
      {hours.map((hour) => {
        const hourStart = hour;
        const availStart = availability
          ? parseInt(availability.start_time.split(':')[0])
          : -1;
        const availEnd = availability
          ? parseInt(availability.end_time.split(':')[0])
          : -1;
        const isInAvailableRange =
          hourStart >= availStart && hourStart < availEnd;

        return (
          <div
            key={hour}
            className={`absolute left-0 right-0 h-[60px] border-b border-slate-100 z-10 cursor-pointer ${
              getSelectionPreview(employee.id, dateStr, hour) || ''
            } ${
              isInAvailableRange
                ? 'hover:bg-green-100 hover:bg-opacity-30'
                : 'hover:bg-yellow-100 hover:bg-opacity-30'
            }`}
            style={{ top: `${(hour - 7) * 60}px` }}
            onMouseDown={(e) => {
              e.preventDefault();
              onMouseDown(employee.id, dateStr, hour);
            }}
            onMouseEnter={() => {
              if (isDragging) {
                onMouseMove(hour);
              }
            }}
          />
        );
      })}

      {/* Available time block (unconfirmed - dotted) */}
      {availability && (
        <div
          className={`absolute left-1 right-1 ${colors.light} border-2 border-dashed ${colors.dotted} rounded-lg pointer-events-none`}
          style={getBlockStyle(availability.start_time, availability.end_time)}
        >
          <div className="p-2 text-xs">
            <div className={`font-semibold ${colors.text}`}>
              {employee.first_name && employee.last_name
                ? `${employee.first_name} ${employee.last_name}`
                : employee.first_name || employee.last_name || 'Available'}
            </div>
            <div className="text-slate-600">
              {availability.start_time} - {availability.end_time}
            </div>
          </div>
        </div>
      )}

      {/* Confirmed blocks (solid green) */}
      {confirmedForEmployee.map((block) => (
        <div
          key={block.id}
          className="absolute left-1 right-1 bg-green-600 border-2 border-green-700 text-white rounded-lg shadow-md z-20 group pointer-events-auto"
          style={getBlockStyle(block.startTime, block.endTime)}
        >
          <div className="p-2 text-xs h-full flex flex-col justify-between">
            <div>
              <div className="font-semibold flex items-center justify-between">
                <span>Confirmed</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBlock(block.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-white text-red-600 rounded-full p-0.5 hover:bg-red-50 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="text-white opacity-90">
                {block.startTime} - {block.endTime}
              </div>
            </div>
            <div className="flex items-center text-white opacity-90">
              <Check className="w-3 h-3 mr-1" />
              <span className="text-xs">
                {parseInt(block.endTime.split(':')[0]) -
                  parseInt(block.startTime.split(':')[0])}{' '}
                hours
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
