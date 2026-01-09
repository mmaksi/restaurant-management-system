'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/lib/types';
import {
  Edit,
  Trash2,
  Calendar,
  Clock,
  Check,
  X,
  Mail,
  Building2,
  Coins,
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import ROLE_STYLES from '@/lib/constants/styles';
import { EMPLOYEE_ROLES } from '@/lib/constants';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    // Calculate age only in the browser
    if (employee.date_of_birth) {
      setAge(differenceInYears(new Date(), new Date(employee.date_of_birth)));
    }
  }, [employee.date_of_birth]);

  // Handle null or invalid roles with fallback to SERVICE
  // Normalize role to match enum values (capitalize first letter)
  const normalizeRole = (role: string | null): EMPLOYEE_ROLES => {
    if (!role) return EMPLOYEE_ROLES.SERVICE;
    const normalized =
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    // Check if normalized role exists in enum
    if (Object.values(EMPLOYEE_ROLES).includes(normalized as EMPLOYEE_ROLES)) {
      return normalized as EMPLOYEE_ROLES;
    }
    return EMPLOYEE_ROLES.SERVICE;
  };

  const role = normalizeRole(employee.role);
  const roleBadge = ROLE_STYLES[role] || ROLE_STYLES[EMPLOYEE_ROLES.SERVICE];

  const getEmploymentTypeBadge = (type: string) => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
    const styles = {
      'full-time': 'bg-blue-100 text-blue-700 border-blue-200',
      'part-time': 'bg-green-100 text-green-700 border-green-200',
      'mini-job': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[normalizedType as keyof typeof styles] || styles['full-time'];
  };

  const RoleIcon = roleBadge.icon;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
      {/* Header */}
      <div
        className={`${roleBadge.bg} px-6 py-4 border-b-2 ${roleBadge.border}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${roleBadge.text}`}>
              {[employee.first_name, employee.last_name]
                .filter(Boolean)
                .join(' ') || 'Unnamed Employee'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <RoleIcon className={`w-4 h-4 ${roleBadge.text}`} />
              <span
                className={`text-sm font-medium ${roleBadge.text} capitalize`}
              >
                {employee.role || 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors"
              title="Edit employee"
            >
              <Edit className={`w-4 h-4 ${roleBadge.text}`} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors"
              title="Delete employee"
            >
              <Trash2 className={`w-4 h-4 ${roleBadge.text}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Personal Info */}
        <div className="space-y-3 mb-4">
          {employee.email && (
            <div className="flex items-center text-sm text-slate-600">
              <Mail className="w-4 h-4 mr-2" />
              <span>{employee.email}</span>
            </div>
          )}
          {employee.restaurant_name && (
            <div className="flex items-center text-sm text-slate-600">
              <Building2 className="w-4 h-4 mr-2" />
              <span>{employee.restaurant_name}</span>
            </div>
          )}
          {employee.date_of_birth && (
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Age: {age} years (
                {format(new Date(employee.date_of_birth), 'MMM d, yyyy')})
              </span>
            </div>
          )}
          {employee.hourly_rate !== undefined &&
            employee.hourly_rate !== null && (
              <div className="flex items-center text-sm text-slate-600">
                <Coins className="w-4 h-4 mr-2" />
                <span>€{employee.hourly_rate.toFixed(2)}/hour</span>
              </div>
            )}
        </div>

        {/* Employment Details */}
        <div className="space-y-3 mb-4">
          {employee.employment_type && (
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getEmploymentTypeBadge(
                employee.employment_type.toLowerCase()
              )}`}
            >
              {employee.employment_type}
            </div>
          )}

          {employee.max_weekly_hours !== null && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Max Hours/Week:</span>
              </div>
              <span className="font-semibold text-slate-900">
                {employee.max_weekly_hours}h
              </span>
            </div>
          )}

          {employee.overtime_allowed !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Overtime Allowed:</span>
              {employee.overtime_allowed ? (
                <span className="flex items-center text-green-600 font-medium">
                  <Check className="w-4 h-4 mr-1" />
                  Yes
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-medium">
                  <X className="w-4 h-4 mr-1" />
                  No
                </span>
              )}
            </div>
          )}

          {employee.priority !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Priority:</span>
              <span className="font-semibold text-yellow-600">
                ★ {employee.priority}/10
              </span>
            </div>
          )}
        </div>

        {/* Availability Status */}
        {employee.availability_submitted !== null && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            {employee.availability_submitted ? (
              <div className="flex items-center text-sm text-green-600">
                <Check className="w-4 h-4 mr-2" />
                <span className="font-medium">Availability submitted</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-orange-600">
                <X className="w-4 h-4 mr-2" />
                <span className="font-medium">Availability pending</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
