import { useState, useMemo } from 'react';
import { Employee, ConfirmedBlock } from '@/lib/types';

/**
 * Hook for managing drag selection state
 */
export const useDragSelection = (
  confirmedBlocks: ConfirmedBlock[],
  setConfirmedBlocks: (blocks: ConfirmedBlock[]) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    employeeId: string;
    date: string;
    hour: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number } | null>(null);

  const handleMouseDown = (employeeId: string, date: string, hour: number) => {
    setIsDragging(true);
    setDragStart({ employeeId, date, hour });
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

      const newBlock: ConfirmedBlock = {
        id: `block-${Date.now()}`,
        employeeId: dragStart.employeeId,
        date: dragStart.date,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
      };

      setConfirmedBlocks([...confirmedBlocks, newBlock]);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  return {
    isDragging,
    dragStart,
    dragEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

/**
 * Hook for managing day selection
 */
export const useDaySelection = () => {
  const [selectedDays, setSelectedDays] = useState<number[]>([0]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  return { selectedDays, toggleDay, selectAllDays };
};

/**
 * Hook for filtering and sorting employees
 */
export const useFilteredEmployees = (
  employees: Employee[],
  selectedEmployees: string[]
) => {
  return useMemo(() => {
    let filtered = employees.filter((emp) => emp.availability_submitted);

    if (selectedEmployees.length > 0) {
      filtered = filtered.filter((emp) => selectedEmployees.includes(emp.id));
    }

    // Sort by role, then priority
    return filtered.sort((a, b) => {
      const roleA = a.role || '';
      const roleB = b.role || '';
      if (roleA !== roleB) {
        return roleA.localeCompare(roleB);
      }
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA;
    });
  }, [employees, selectedEmployees]);
};
