import { ChefHat, Shield, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { EMPLOYEE_ROLES, SUBMISSION_STATUSES_FILTER } from '@/lib/constants';
import { Employee } from '@/lib/types';
import { formatGermanPhoneNumber } from '@/lib/helpers/data-formatting';
import { getChangedFields } from '@/lib/helpers/performance';
import { createGradientColors } from '@/lib/helpers/colorise';
import { extractHoursAndMinutesFromString } from './date-time';
import {
  normalizeAvailabilitySlots,
  hasAvailabilityChanges,
} from './availability';
import { useUnsavedChangesWarning } from './unsaved-changes';

const getRemainingHours = (emp: Employee) => {
  const maxHours = emp.max_weekly_hours ?? 0;
  // TODO: in the next release of features
  const hoursWorked = 0;
  // const hoursWorked = emp.hoursWorkedThisWeek ?? 0;
  return maxHours - hoursWorked;
};

const getRoleBadge = (role: EMPLOYEE_ROLES) => {
  const styles: Record<
    EMPLOYEE_ROLES,
    {
      bg: string;
      text: string;
      border: string;
      icon: typeof ChefHat;
    }
  > = {
    [EMPLOYEE_ROLES.KITCHEN]: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: ChefHat,
    },
    [EMPLOYEE_ROLES.SERVICE]: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Users,
    },
    [EMPLOYEE_ROLES.SECURITY]: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Shield,
    },
    [EMPLOYEE_ROLES.ALL]: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: Users,
    },
  };
  return styles[role];
};

const getStatusBadge = (status: SUBMISSION_STATUSES_FILTER) => {
  const styles: Record<
    SUBMISSION_STATUSES_FILTER,
    {
      bg: string;
      text: string;
      icon: typeof CheckCircle | null;
      label: string;
    }
  > = {
    [SUBMISSION_STATUSES_FILTER.ALL]: {
      bg: 'bg-slate-700',
      text: 'text-white',
      icon: null,
      label: 'All',
    },
    [SUBMISSION_STATUSES_FILTER.SUBMITTED]: {
      bg: 'bg-green-600',
      text: 'text-white',
      icon: CheckCircle,
      label: 'Submitted',
    },
    [SUBMISSION_STATUSES_FILTER.PENDING]: {
      bg: 'bg-red-500',
      text: 'text-white',
      icon: AlertCircle,
      label: 'Pending',
    },
  };
  return styles[status];
};

export {
  getRoleBadge,
  getRemainingHours,
  getStatusBadge,
  getChangedFields,
  formatGermanPhoneNumber,
  createGradientColors,
  extractHoursAndMinutesFromString,
  normalizeAvailabilitySlots,
  hasAvailabilityChanges,
  useUnsavedChangesWarning,
};
