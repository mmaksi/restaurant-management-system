'use client';

import { Calendar as CalendarIcon } from 'lucide-react';

interface DayFilterProps {
  selectedDays: number[];
  dayNames: string[];
  onToggleDay: (index: number) => void;
  onSelectAllDays: () => void;
}

export default function DayFilter({
  selectedDays,
  dayNames,
  onToggleDay,
  onSelectAllDays,
}: DayFilterProps) {
  return (
    <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-slate-600" />
          <span className="font-medium text-slate-700">Filter by Days:</span>
        </div>
        <button
          onClick={onSelectAllDays}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Select All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {dayNames.map((day, index) => (
          <button
            key={index}
            onClick={() => onToggleDay(index)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedDays.includes(index)
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border-2 border-slate-300 hover:border-blue-400'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {selectedDays.length === 7
          ? 'All days selected'
          : `${selectedDays.length} day${
              selectedDays.length !== 1 ? 's' : ''
            } selected`}
      </p>
    </div>
  );
}
