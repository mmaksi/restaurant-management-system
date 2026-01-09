import { TimeSlot, ConfirmedBlock } from '@/lib/types';

/**
 * Calculate time block position and height for calendar display
 */
export const getBlockStyle = (startTime: string, endTime: string) => {
  const startHour = parseInt(startTime.split(':')[0]);
  const startMinutes = parseInt(startTime.split(':')[1]);
  const endHour = parseInt(endTime.split(':')[0]);
  const endMinutes = parseInt(endTime.split(':')[1]);

  const startOffset = ((startHour - 7) * 60 + startMinutes) / 60; // Hours from 7 AM
  const duration =
    ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;

  return {
    top: `${startOffset * 60}px`, // 60px per hour
    height: `${duration * 60}px`,
  };
};

/**
 * Get confirmed blocks for a specific employee and date
 */
export const getConfirmedPortions = (
  employeeId: string,
  date: string,
  availability: TimeSlot,
  confirmedBlocks: ConfirmedBlock[]
) => {
  return confirmedBlocks.filter(
    (block) => block.employeeId === employeeId && block.date === date
  );
};

/**
 * Get selection preview CSS class for drag selection
 */
export const getSelectionPreview = (
  employeeId: string,
  date: string,
  hour: number,
  isDragging: boolean,
  dragStart: { employeeId: string; date: string; hour: number } | null,
  dragEnd: { hour: number } | null
) => {
  if (!isDragging || !dragStart || !dragEnd) return null;
  if (dragStart.employeeId !== employeeId || dragStart.date !== date)
    return null;

  const startHour = Math.min(dragStart.hour, dragEnd.hour);
  const endHour = Math.max(dragStart.hour, dragEnd.hour);

  if (hour >= startHour && hour <= endHour) {
    return 'bg-green-200 opacity-50';
  }
  return null;
};
